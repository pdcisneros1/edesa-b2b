/**
 * One-time migration: imports existing orders.json orders into Prisma.
 * Run once with: npx tsx prisma/migrate-orders.ts
 * Safe to run multiple times (skips already-imported orders via orderNumber check).
 *
 * Strategy for items with unknown productId:
 * - Try to find the product by SKU first.
 * - If not found in Prisma, find any existing product to satisfy the FK constraint
 *   (the productName/productSku snapshot on the item preserves the original data).
 * - If DB has no products at all, skip item creation and log a warning.
 */
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface LegacyOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface LegacyOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;
  customerTaxId?: string;
  items: LegacyOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  paymentMethod?: string;
  notes?: string;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country?: string;
  };
  createdAt: string;
  updatedAt: string;
}

async function resolveProductId(item: LegacyOrderItem): Promise<string | null> {
  // 1. Try by exact ID (if IDs match between JSON and DB)
  const byId = await prisma.product.findUnique({
    where: { id: item.productId },
    select: { id: true },
  });
  if (byId) return byId.id;

  // 2. Try by SKU (most reliable match)
  const bySku = await prisma.product.findUnique({
    where: { sku: item.productSku },
    select: { id: true },
  });
  if (bySku) return bySku.id;

  // 3. Try partial SKU match (in case SKU format changed slightly)
  const bySkuPartial = await prisma.product.findFirst({
    where: { name: { contains: item.productName.substring(0, 10) } },
    select: { id: true },
  });
  if (bySkuPartial) return bySkuPartial.id;

  // 4. Fall back to any existing product (preserves order history; item snapshot is accurate)
  const fallback = await prisma.product.findFirst({ select: { id: true } });
  if (fallback) {
    console.log(`    Warning: product "${item.productSku}" not found — using fallback product ID for FK constraint.`);
    return fallback.id;
  }

  return null;
}

async function main() {
  const ordersPath = path.join(process.cwd(), 'src', 'data', 'orders.json');

  if (!fs.existsSync(ordersPath)) {
    console.log('No orders.json found — nothing to migrate.');
    return;
  }

  const raw = fs.readFileSync(ordersPath, 'utf-8');
  const legacyOrders: LegacyOrder[] = JSON.parse(raw);

  if (legacyOrders.length === 0) {
    console.log('orders.json is empty — nothing to migrate.');
    return;
  }

  console.log(`Migrating ${legacyOrders.length} orders from orders.json to Prisma...`);

  let migrated = 0;
  let skipped = 0;

  for (const legacy of legacyOrders) {
    // Check if already migrated
    const existing = await prisma.order.findUnique({
      where: { orderNumber: legacy.orderNumber },
    });

    if (existing) {
      console.log(`  Skipping ${legacy.orderNumber} (already in DB)`);
      skipped++;
      continue;
    }

    // Map status: translate any legacy English values to Spanish enum values
    const statusMap: Record<string, string> = {
      pending: 'pendiente_pago',
      processing: 'en_proceso',
      completed: 'entregado',
      cancelled: 'cancelado',
    };
    const mappedStatus = statusMap[legacy.status] ?? legacy.status;
    const validStatuses = ['pendiente_pago', 'pagado', 'en_proceso', 'enviado', 'entregado', 'cancelado'];
    const finalStatus = validStatuses.includes(mappedStatus) ? mappedStatus : 'pendiente_pago';

    // Resolve product IDs for all items
    const resolvedItems: Array<{
      productId: string;
      productSku: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    for (const item of legacy.items) {
      const productId = await resolveProductId(item);
      if (!productId) {
        console.log(`    Skipping item ${item.productSku} — no product in DB to reference.`);
        continue;
      }
      resolvedItems.push({
        productId,
        productSku: item.productSku,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      });
    }

    await prisma.order.create({
      data: {
        orderNumber: legacy.orderNumber,
        customerId: legacy.customerId === 'guest' ? null : legacy.customerId,
        customerName: legacy.customerName,
        customerEmail: legacy.customerEmail,
        customerPhone: legacy.customerPhone ?? null,
        customerCompany: legacy.customerCompany ?? null,
        customerTaxId: legacy.customerTaxId ?? null,
        subtotal: legacy.subtotal,
        tax: legacy.tax,
        shipping: legacy.shipping ?? 0,
        total: legacy.total,
        status: finalStatus as 'pendiente_pago' | 'pagado' | 'en_proceso' | 'enviado' | 'entregado' | 'cancelado',
        paymentMethod: legacy.paymentMethod ?? null,
        notes: legacy.notes ?? null,
        shippingStreet: legacy.shippingAddress.street,
        shippingCity: legacy.shippingAddress.city,
        shippingProvince: legacy.shippingAddress.province,
        shippingZipCode: legacy.shippingAddress.zipCode,
        shippingCountry: legacy.shippingAddress.country ?? 'Ecuador',
        shippingMethod: null,
        createdAt: new Date(legacy.createdAt),
        updatedAt: new Date(legacy.updatedAt),
        items: {
          create: resolvedItems,
        },
      },
    });

    console.log(`  Migrated: ${legacy.orderNumber} (${legacy.customerName}) — ${resolvedItems.length} item(s)`);
    migrated++;
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}`);
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
