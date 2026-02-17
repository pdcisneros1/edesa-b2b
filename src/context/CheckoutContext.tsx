'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  CustomerInfoFormData,
  ShippingAddressFormData,
} from '@/lib/validators';

interface CheckoutContextType {
  customerInfo: CustomerInfoFormData | null;
  shippingAddress: ShippingAddressFormData | null;
  shippingMethod: string | null;
  notes: string;
  setCustomerInfo: (data: CustomerInfoFormData) => void;
  setShippingAddress: (data: ShippingAddressFormData) => void;
  setShippingMethod: (method: string) => void;
  setNotes: (notes: string) => void;
  clearCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoFormData | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressFormData | null>(null);
  const [shippingMethod, setShippingMethod] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  const clearCheckout = () => {
    setCustomerInfo(null);
    setShippingAddress(null);
    setShippingMethod(null);
    setNotes('');
  };

  return (
    <CheckoutContext.Provider
      value={{
        customerInfo,
        shippingAddress,
        shippingMethod,
        notes,
        setCustomerInfo,
        setShippingAddress,
        setShippingMethod,
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
