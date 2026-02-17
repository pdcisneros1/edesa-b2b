export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number; // Costo unitario del producto
  subtotal: number;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number; // Porcentaje
  totalOrders: number;
  averageOrderValue: number;
  topSellingProducts: ProductSales[];
  salesByCategory: CategorySales[];
}

export interface ProductSales {
  productId: string;
  productSku: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
}

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  unitsSold: number;
  orderCount: number;
}

export interface SalesFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  productSku?: string;
}

export interface SalesByPeriod {
  period: string; // "2026-01", "2026-W03", "2026-01-16", etc.
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
  units: number;
}
