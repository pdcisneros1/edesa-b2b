'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  CustomerInfoFormData,
  ShippingAddressFormData,
} from '@/lib/validators';
import type { PaymentMethod } from '@/types/sales';

interface CheckoutContextType {
  customerInfo: CustomerInfoFormData | null;
  shippingAddress: ShippingAddressFormData | null;
  shippingMethod: string | null;
  paymentMethod: PaymentMethod | null;
  notes: string;
  setCustomerInfo: (data: CustomerInfoFormData) => void;
  setShippingAddress: (data: ShippingAddressFormData) => void;
  setShippingMethod: (method: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  clearCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoFormData | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressFormData | null>(null);
  const [shippingMethod, setShippingMethod] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [notes, setNotes] = useState<string>('');

  const clearCheckout = () => {
    setCustomerInfo(null);
    setShippingAddress(null);
    setShippingMethod(null);
    setPaymentMethod(null);
    setNotes('');
  };

  return (
    <CheckoutContext.Provider
      value={{
        customerInfo,
        shippingAddress,
        shippingMethod,
        paymentMethod,
        notes,
        setCustomerInfo,
        setShippingAddress,
        setShippingMethod,
        setPaymentMethod,
        setNotes,
        clearCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
