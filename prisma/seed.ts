import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface SeedProduct {
  sku: string;
  name: string;
  slug: string;
  categoria: string;
  marca: string;
  tipo: string;
  price: number;
  wholesalePrice: number | null;
  compareAtPrice: number | null;
}

interface SeedCategory {
  name: string;
  slug: string;
  order: number;
}

interface SeedBrand {
  name: string;
  slug: string;
}

interface SeedData {
  categories: SeedCategory[];
  brands: SeedBrand[];
  products: SeedProduct[];
}

async function main() {
  console.log('🌱 Starting seed with real product data...');

  // Load seed data from JSON
  const dataPath = path.join(__dirname, 'seed-data.json');
  const seedData: SeedData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📂 Loaded: ${seedData.categories.length} categories, ${seedData.brands.length} brands, ${seedData.products.length} products`);

  // Clear existing data in correct order
  console.log('🧹 Clearing existing data...');
  await prisma.productSpecification.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // Keep users (don't delete admins/clients)
  console.log('ℹ️  Preserving existing users...');

  // Seed Categories
  console.log('📦 Seeding categories...');
  const categoryMap = new Map<string, string>(); // slug → db id

  for (const cat of seedData.categories) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: `Productos de ${cat.name.toLowerCase()} para ferreterías y constructoras`,
        order: cat.order,
      },
    });
    // Map uppercase name (as in products) to db id
    categoryMap.set(cat.name.toUpperCase(), created.id);
  }
  console.log(`✅ Created ${categoryMap.size} categories`);

  // Seed Brands
  console.log('🏷️  Seeding brands...');
  const brandMap = new Map<string, string>(); // uppercase name → db id

  for (const brand of seedData.brands) {
    const created = await prisma.brand.create({
      data: {
        name: brand.name,
        slug: brand.slug,
        description: `Productos ${brand.name} de alta calidad`,
      },
    });
    brandMap.set(brand.name.toUpperCase(), created.id);
  }
  console.log(`✅ Created ${brandMap.size} brands`);

  // Seed Products
  console.log('🛒 Seeding products...');
  let created = 0;
  let skipped = 0;

  // Process in batches for performance
  const BATCH_SIZE = 50;
  for (let i = 0; i < seedData.products.length; i += BATCH_SIZE) {
    const batch = seedData.products.slice(i, i + BATCH_SIZE);

    await prisma.$transaction(
      batch.map((product) => {
        const categoryId = categoryMap.get(product.categoria.toUpperCase());
        const brandId = brandMap.get(product.marca.toUpperCase()) ?? null;

        if (!categoryId) {
          skipped++;
          return prisma.product.count(); // noop
        }

        created++;
        return prisma.product.create({
          data: {
            sku: product.sku,
            name: product.name,
            slug: product.slug,
            description: product.tipo
              ? `${product.name}. ${product.tipo}.`
              : product.name,
            shortDescription: product.tipo || null,
            price: product.price,
            wholesalePrice: product.wholesalePrice,
            compareAtPrice: product.compareAtPrice,
            stock: 20,
            categoryId,
            brandId,
            isActive: true,
            isFeatured: false,
            isNew: false,
          },
        });
      })
    );

    if ((i / BATCH_SIZE) % 5 === 0) {
      console.log(`  Progress: ${Math.min(i + BATCH_SIZE, seedData.products.length)}/${seedData.products.length}`);
    }
  }
  console.log(`✅ Created ${created} products (skipped ${skipped})`);

  // Ensure admin user exists
  console.log('👤 Ensuring admin user...');
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@edesaventas.ec';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hash,
        name: 'Administrador',
        role: 'admin',
        isApproved: true,
        isBlocked: false,
      },
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
