export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  wholesalePrice?: number | null | undefined;
  costPrice?: number | null | undefined;
  compareAtPrice?: number | null | undefined;
  stock: number;
  categoryId: string;
  category?: Category;
  brandId?: string;
  brand?: Brand;
  images: ProductImage[];
  specifications: ProductSpecification[];
  technicalSheet?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  order: number;
}

export interface ProductSpecification {
  id: string;
  productId: string;
  key: string;
  value: string;
  order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  order: number;
}

export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface ProductSort {
  field: 'name' | 'price' | 'createdAt';
  order: 'asc' | 'desc';
}
