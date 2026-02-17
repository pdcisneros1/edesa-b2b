import { PrismaClient } from '@prisma/client';
import { mockCategories } from '../src/data/mock-categories';
import { mockBrands } from '../src/data/mock-brands';
import { mockProducts } from '../src/data/mock-products';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.productSpecification.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // Seed Categories
  console.log('📦 Seeding categories...');
  const categoryMap = new Map<string, string>();

  for (const category of mockCategories) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        order: category.order,
        parentId: category.parentId ? categoryMap.get(category.parentId) : null,
      },
    });
    categoryMap.set(category.id, created.id);
  }
  console.log(`✅ Created ${categoryMap.size} categories`);

  // Seed Brands
  console.log('🏷️  Seeding brands...');
  const brandMap = new Map<string, string>();

  for (const brand of mockBrands) {
    const created = await prisma.brand.create({
      data: {
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        description: brand.description,
      },
    });
    brandMap.set(brand.id, created.id);
  }
  console.log(`✅ Created ${brandMap.size} brands`);

  // Seed Products
  console.log('🛒 Seeding products...');
  let productsCount = 0;
  let imagesCount = 0;
  let specsCount = 0;

  for (const product of mockProducts) {
    // Get mapped IDs
    const categoryId = categoryMap.get(product.categoryId);
    const brandId = product.brandId ? brandMap.get(product.brandId) : null;

    if (!categoryId) {
      console.warn(`⚠️  Skipping product ${product.name} - category not found`);
      continue;
    }

    // Create product
    const createdProduct = await prisma.product.create({
      data: {
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        categoryId,
        brandId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
      },
    });
    productsCount++;

    // Create product images
    if (product.images && product.images.length > 0) {
      for (let i = 0; i < product.images.length; i++) {
        const image = product.images[i];
        await prisma.productImage.create({
          data: {
            productId: createdProduct.id,
            url: image.url,
            alt: image.alt,
            order: i,
          },
        });
        imagesCount++;
      }
    }

    // Create product specifications
    if (product.specifications) {
      let order = 0;
      for (const [key, value] of Object.entries(product.specifications)) {
        await prisma.productSpecification.create({
          data: {
            productId: createdProduct.id,
            key,
            value: String(value),
            order,
          },
        });
        specsCount++;
        order++;
      }
    }
  }

  console.log(`✅ Created ${productsCount} products`);
  console.log(`✅ Created ${imagesCount} product images`);
  console.log(`✅ Created ${specsCount} product specifications`);

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
