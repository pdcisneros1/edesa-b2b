import { Brand } from '@/types';

export const mockBrands: Brand[] = [
  {
    id: 'brand-1',
    name: 'EDESA',
    slug: 'edesa',
    logo: '/images/brands/edesa.png',
    description: 'Marca líder en productos sanitarios y acabados de construcción',
  },
  {
    id: 'brand-2',
    name: 'Briggs',
    slug: 'briggs',
    logo: '/images/brands/briggs.png',
    description: 'Calidad premium en griferías y accesorios para baño',
  },
];

// Helper function to get brand by slug
export function getBrandBySlug(slug: string): Brand | undefined {
  return mockBrands.find((brand) => brand.slug === slug);
}

// Helper function to get brand by id
export function getBrandById(id: string): Brand | undefined {
  return mockBrands.find((brand) => brand.id === id);
}
