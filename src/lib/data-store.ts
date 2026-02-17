import fs from 'fs';
import path from 'path';
import type { Product } from '@/types/product';
import type { Category } from '@/types';
import type { Brand } from '@/types';

const dataDir = path.join(process.cwd(), 'src', 'data');

// Generic read function
function readJSONFile<T>(filename: string): T[] {
  const filePath = path.join(dataDir, filename);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Generic write function
function writeJSONFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Products
export function getProducts(): Product[] {
  return readJSONFile<Product>('products.json');
}

export function getProductBySlug(slug: string): Product | undefined {
  const products = getProducts();
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find((p) => p.id === id);
}

export function createProduct(product: Product): Product {
  const products = getProducts();
  products.push(product);
  writeJSONFile('products.json', products);
  return product;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) return null;

  products[index] = { ...products[index], ...updates };
  writeJSONFile('products.json', products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filteredProducts = products.filter((p) => p.id !== id);

  if (filteredProducts.length === products.length) return false;

  writeJSONFile('products.json', filteredProducts);
  return true;
}

// Categories
export function getCategories(): Category[] {
  return readJSONFile<Category>('categories.json');
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const categories = getCategories();
  return categories.find((c) => c.slug === slug);
}

export function createCategory(category: Category): Category {
  const categories = getCategories();
  categories.push(category);
  writeJSONFile('categories.json', categories);
  return category;
}

export function updateCategory(id: string, updates: Partial<Category>): Category | null {
  const categories = getCategories();
  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) return null;

  categories[index] = { ...categories[index], ...updates };
  writeJSONFile('categories.json', categories);
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories();
  const filteredCategories = categories.filter((c) => c.id !== id);

  if (filteredCategories.length === categories.length) return false;

  writeJSONFile('categories.json', filteredCategories);
  return true;
}

// Brands
export function getBrands(): Brand[] {
  return readJSONFile<Brand>('brands.json');
}

export function getBrandBySlug(slug: string): Brand | undefined {
  const brands = getBrands();
  return brands.find((b) => b.slug === slug);
}

export function createBrand(brand: Brand): Brand {
  const brands = getBrands();
  brands.push(brand);
  writeJSONFile('brands.json', brands);
  return brand;
}

export function updateBrand(id: string, updates: Partial<Brand>): Brand | null {
  const brands = getBrands();
  const index = brands.findIndex((b) => b.id === id);

  if (index === -1) return null;

  brands[index] = { ...brands[index], ...updates };
  writeJSONFile('brands.json', brands);
  return brands[index];
}

export function deleteBrand(id: string): boolean {
  const brands = getBrands();
  const filteredBrands = brands.filter((b) => b.id !== id);

  if (filteredBrands.length === brands.length) return false;

  writeJSONFile('brands.json', filteredBrands);
  return true;
}
