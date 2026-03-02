'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart, CartItem, Product } from '@/types';
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

/**
 * 🔀 Estrategia de merge de carritos (BD + localStorage)
 * Si un producto existe en ambos, sumar las cantidades
 */
function mergeCartsStrategy(dbCart: Cart, localCart: Cart): Cart {
  const mergedItems = [...dbCart.items];

  // Agregar items de localStorage que no estén en BD
  for (const localItem of localCart.items) {
    const existingIndex = mergedItems.findIndex(
      (item) => item.productId === localItem.productId
    );

    if (existingIndex !== -1) {
      // Producto ya existe, sumar cantidades
      const existingItem = mergedItems[existingIndex];
      const newQuantity = existingItem.quantity + localItem.quantity;
      mergedItems[existingIndex] = {
        ...existingItem,
        quantity: newQuantity,
        subtotal: existingItem.price * newQuantity,
      };
    } else {
      // Producto nuevo, agregarlo
      mergedItems.push(localItem);
    }
  }

  const { subtotal, total } = calculateTotals(mergedItems);

  return {
    ...dbCart,
    items: mergedItems,
    subtotal,
    total,
    updatedAt: new Date(),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(createEmptyCart());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingFromDB, setIsLoadingFromDB] = useState(false);
  const { session } = useAuth();

  // 🛒 NUEVO: Cargar carrito desde BD cuando hay sesión
  useEffect(() => {
    const loadCartFromDatabase = async () => {
      if (!session?.userId) {
        console.log('⏳ No hay sesión de usuario, usando solo localStorage');
        return;
      }

      if (isLoadingFromDB) {
        return; // Evitar carga duplicada
      }

      setIsLoadingFromDB(true);
      console.log('🔄 Cargando carrito desde BD para usuario:', session.userId);

      try {
        const response = await fetch('/api/cart/load');
        if (response.ok) {
          const data = await response.json();

          if (data.cart) {
            console.log('✅ Carrito cargado desde BD:', data.cart.items.length, 'items');

            // Obtener carrito de localStorage
            const localStorageCart = localStorage.getItem(CART_STORAGE_KEY);
            let localCart: Cart | null = null;

            if (localStorageCart) {
              try {
                const parsed = JSON.parse(localStorageCart);
                if (parsed) {
                  parsed.createdAt = new Date(parsed.createdAt);
                  parsed.updatedAt = new Date(parsed.updatedAt);
                  localCart = parsed;
                }
              } catch (error) {
                console.error('Error parseando carrito local:', error);
              }
            }

            // 🔀 MERGE INTELIGENTE: Solo si localStorage es más reciente
            if (localCart && localCart.items.length > 0) {
              const dbDate = new Date(data.cart.updatedAt).getTime();
              const localDate = new Date(localCart.updatedAt).getTime();

              // Si localStorage es más nuevo (modificado después de la última sync)
              if (localDate > dbDate) {
                console.log('🔀 Merge: localStorage más reciente, combinando...');
                const mergedCart = mergeCartsStrategy(data.cart, localCart);
                setCart(mergedCart);
              } else {
                // BD es más reciente o igual, usar solo BD
                console.log('✅ Usando carrito de BD (más reciente)');
                setCart(data.cart);
              }
            } else {
              // Solo usar carrito de BD
              console.log('✅ Usando carrito de BD (único)');
              setCart(data.cart);
            }
          } else {
            console.log('📭 No hay carrito en BD, usando localStorage');
            // Cargar desde localStorage normalmente
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (storedCart) {
              try {
                const parsed = JSON.parse(storedCart);
                parsed.createdAt = new Date(parsed.createdAt);
                parsed.updatedAt = new Date(parsed.updatedAt);
                setCart(parsed);
              } catch (error) {
                console.error('Failed to parse cart from localStorage:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error al cargar carrito desde BD:', error);
        // Fallback a localStorage
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          try {
            const parsed = JSON.parse(storedCart);
            parsed.createdAt = new Date(parsed.createdAt);
            parsed.updatedAt = new Date(parsed.updatedAt);
            setCart(parsed);
          } catch (error) {
            console.error('Failed to parse cart from localStorage:', error);
          }
        }
      } finally {
        setIsLoadingFromDB(false);
        setIsInitialized(true);
      }
    };

    // Si hay sesión, cargar desde BD
    if (session?.userId) {
      loadCartFromDatabase();
    } else {
      // Sin sesión, solo localStorage
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          parsed.createdAt = new Date(parsed.createdAt);
          parsed.updatedAt = new Date(parsed.updatedAt);
          setCart(parsed);
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error);
        }
      }
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId]); // Re-cargar cuando cambia la sesión

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

  // 🔄 SINCRONIZACIÓN DUAL: Persistencia + Tracking
  useEffect(() => {
    // Solo sincronizar si el carrito está inicializado
    if (!isInitialized) return;

    // ⚠️ CRÍTICO: Solo sincronizar si hay sesión con userId
    if (!session?.userId && !session?.email) {
      console.log('⏳ Sin sesión de usuario, sin sincronización');
      return;
    }

    const syncToDatabase = async () => {
      try {
        // 1️⃣ PERSISTENCIA: Guardar carrito para multi-dispositivo (tabla Cart)
        if (session.userId) {
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: cart.items,
              subtotal: cart.subtotal,
              total: cart.total,
            }),
          });
          console.log('💾 Carrito persistido en BD (multi-dispositivo)');
        }

        // 2️⃣ TRACKING: Para recovery emails (tabla AbandonedCart)
        if (cart.items.length > 0) {
          await fetch('/api/cart/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session.userId,
              customerEmail: session.email,
              customerName: session.name,
              items: cart.items,
              subtotal: cart.subtotal,
              total: cart.total,
            }),
          });
          console.log('📊 Carrito trackeado para abandonment analytics');
        }
      } catch (error) {
        console.error('❌ Error al sincronizar carrito:', error);
      }
    };

    syncToDatabase();
  }, [cart, isInitialized, session]);

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

      return {
        ...prevCart,
        items: newItems,
        subtotal,
        total,
        updatedAt: new Date(),
      };
    });
  };

  const removeItem = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.productId !== productId);
      const { subtotal, total } = calculateTotals(newItems);

      return {
        ...prevCart,
        items: newItems,
        subtotal,
        total,
        updatedAt: new Date(),
      };
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

      return {
        ...prevCart,
        items: newItems,
        subtotal,
        total,
        updatedAt: new Date(),
      };
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
