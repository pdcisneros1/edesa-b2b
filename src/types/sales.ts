export type OrderStatus =
  | 'pendiente_pago'
  | 'pagado'
  | 'en_proceso'
  | 'enviado'
  | 'entregado'
  | 'cancelado'
  // legacy / mock data
  | 'completed'
  | 'pending'
  | 'processing';

export type PaymentMethod = 'transferencia' | 'tarjeta' | 'efectivo';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;
  customerTaxId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod | string;
  notes?: string;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country?: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  subtotal: number;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
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
  period: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
  units: number;
}

// Display helpers
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pendiente_pago: 'Pendiente de Pago',
  pagado: 'Pagado',
  en_proceso: 'En Proceso',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  completed: 'Completado',
  pending: 'Pendiente',
  processing: 'Procesando',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pendiente_pago: 'bg-amber-100 text-amber-800',
  pagado: 'bg-blue-100 text-blue-800',
  en_proceso: 'bg-purple-100 text-purple-800',
  enviado: 'bg-indigo-100 text-indigo-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-purple-100 text-purple-800',
};

export const REAL_ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pendiente_pago', label: 'Pendiente de Pago' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];
