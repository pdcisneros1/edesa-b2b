import { z } from 'zod';
import { ECUADOR_PROVINCES } from './constants';

// Customer Information Schema
export const customerInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  email: z
    .string()
    .email('Correo electrónico inválido')
    .min(1, 'El correo electrónico es requerido'),
  phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^[0-9\s\-\+\(\)]+$/, 'El teléfono solo puede contener números y caracteres especiales'),
  company: z.string().optional(),
  taxId: z.string().optional(),
});

// Shipping Address Schema
export const shippingAddressSchema = z.object({
  address1: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(100, 'La dirección no puede exceder 100 caracteres'),
  address2: z
    .string()
    .max(100, 'La dirección no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(50, 'La ciudad no puede exceder 50 caracteres'),
  state: z
    .string()
    .min(1, 'Selecciona una provincia')
    .refine((val) => ECUADOR_PROVINCES.includes(val), {
      message: 'Provincia inválida',
    }),
  postalCode: z
    .string()
    .min(6, 'El código postal debe tener 6 dígitos')
    .max(6, 'El código postal debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código postal debe contener solo números'),
  country: z.string(),
});

// Shipping Method Schema
export const shippingMethodSchema = z.object({
  shippingMethod: z
    .string()
    .min(1, 'Selecciona un método de envío'),
});

// Complete Checkout Schema
export const completeCheckoutSchema = z.object({
  customer: customerInfoSchema,
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.string().min(1, 'Selecciona un método de envío'),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional().or(z.literal('')),
});

// Types
export type CustomerInfoFormData = z.infer<typeof customerInfoSchema>;
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
export type ShippingMethodFormData = z.infer<typeof shippingMethodSchema>;
export type CompleteCheckoutFormData = z.infer<typeof completeCheckoutSchema>;
