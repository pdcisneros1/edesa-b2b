import { Product } from './product';

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  productId: string;
  quantity: number;
}
