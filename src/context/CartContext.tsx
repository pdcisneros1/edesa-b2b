'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart, CartItem, Product } from '@/types';
import { trackCart } from '@/lib/cart-abandonment';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  cart: Cart;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'edesa-cart';

function createEmptyCart(): Cart {
  return {
    id: crypto.randomUUID(),
    items: [],
    subtotal: 0,
    total: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function calculateTotals(items: CartItem[]): { subtotal: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal; // Tax and shipping calculated at checkout
  return { subtotal, total };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(createEmptyCart());
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        // Convert date strings back to Date objects
        parsed.createdAt = new Date(parsed.createdAt);
        parsed.updatedAt = new Date(parsed.updatedAt);
        setCart(parsed);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // Sync cart across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          parsed.createdAt = new Date(parsed.createdAt);
          parsed.updatedAt = new Date(parsed.updatedAt);
          setCart(parsed);
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 📊 TRACKING: Sincronizar carrito a DB para analytics de abandono
  const syncCartToDatabase = async (updatedCart: Cart) => {
    // Solo trackear si el carrito tiene items
    if (updatedCart.items.length === 0) return;

    try {
      await trackCart({
        userId: user?.id,
        customerEmail: user?.email,
        customerName: user?.name,
        items: updatedCart.items,
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
      });
    } catch (error) {
      // No lanzar error para no romper la UX
      console.error('Error tracking cart:', error);
    }
  };

  const addItem = (product: Product, quantity: number) => {
    const productId = product.id;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.productId === productId
      );

      let newItems: CartItem[];

      if (existingItemIndex !== -1) {
        // Update existing item
        newItems = [...prevCart.items];
        const newQuantity = newItems[existingItemIndex].quantity + quantity;
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newQuantity,
          subtotal: newQuantity * product.price,
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          productId: product.id,
          product,
          quantity,
          price: product.price,
          subtotal: product.price * quantity,
        };
        newItems = [...prevCart.items, newItem];
      }

      const { subtotal, total } = calculateTotals(newItems);

      const updatedCart = {
        ...prevCart,
        items: newItems,
        subtotal,
        total,
        updatedAt: new Date(),
      };

      // 📊 TRACKING: Sincronizar carrito a DB (no bloqueante)
      syncCartToDatabase(updatedCart);

      return updatedCart;
    });
  };

  const removeItem = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.productId !== productId);
      const { subtotal, total } = calculateTotals(newItems);

      const updatedCart = {
        ...prevCart,
        items: newItems,
        subtotal,
        total,
        updatedAt: new Date(),
      };

      // 📊 TRACKING: Sincronizar carrito a DB (no bloqueante)
      syncCartToDatabase(updatedCart);

      return updatedCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity,
            subtotal: item.price * quantity,
          };
        }
        return item;
      });

      const { subtotal, total } = calculateTotals(newItems);

      const updatedCart = {
        ...prevCart,
        items: newItems,
        subtotal,
        total,
        updatedAt: new Date(),
      };

      // 📊 TRACKING: Sincronizar carrito a DB (no bloqueante)
      syncCartToDatabase(updatedCart);

      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart(createEmptyCart());
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
