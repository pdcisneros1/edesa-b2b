import { getProducts, getCategories, getBrands } from '@/lib/data-store';
import { getOrders } from '@/data/mock-orders';
import { DashboardClient } from '@/components/admin/DashboardClient';

export default function AdminDashboardPage() {
  const products = getProducts();
  const categories = getCategories();
  const brands = getBrands();
  const orders = getOrders();

  return (
    <DashboardClient
      products={products}
      categories={categories}
      brands={brands}
      orders={orders}
    />
  );
}
