import { writeFileSync } from 'fs';
import { join } from 'path';
import { mockCategories } from '../src/data/mock-categories';
import { mockBrands } from '../src/data/mock-brands';
import { mockProducts } from '../src/data/mock-products';

const dataDir = join(process.cwd(), 'src', 'data');

// Write JSON files
writeFileSync(
  join(dataDir, 'categories.json'),
  JSON.stringify(mockCategories, null, 2),
  'utf-8'
);

writeFileSync(
  join(dataDir, 'brands.json'),
  JSON.stringify(mockBrands, null, 2),
  'utf-8'
);

writeFileSync(
  join(dataDir, 'products.json'),
  JSON.stringify(mockProducts, null, 2),
  'utf-8'
);

console.log('✅ JSON files created successfully!');
console.log(`   - categories.json (${mockCategories.length} items)`);
console.log(`   - brands.json (${mockBrands.length} items)`);
console.log(`   - products.json (${mockProducts.length} items)`);
