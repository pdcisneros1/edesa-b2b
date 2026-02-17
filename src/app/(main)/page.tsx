import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { BrandShowcase } from '@/components/home/BrandShowcase';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <FeaturedProducts />
      <CategoryGrid />
      <BrandShowcase />
    </>
  );
}
