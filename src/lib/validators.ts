import { z } from 'zod';
import { ECUADOR_PROVINCES } from './constants';

// ─── Reglas de contraseña reutilizables ───────────────────────────────────────

/**
 * Contraseña segura: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
 * Se usa tanto en registro como en creación de usuarios por el admin.
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número');

// ─── Login Schema ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Correo electrónico inválido')
    .max(254, 'El correo electrónico no puede exceder 254 caracteres')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .max(128, 'La contraseña no puede exceder 128 caracteres'),
});

// ─── Customer Information Schema ─────────────────────────────────────────────

export const customerInfoSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  email: z
    .string()
    .trim()
    .email('Correo electrónico inválido')
    .max(254, 'El correo electrónico no puede exceder 254 caracteres'),
  phone: z
    .string()
    .trim()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^[0-9\s\-\+\(\)]+$/, 'El teléfono solo puede contener números y caracteres especiales'),
  company: z.string().trim().max(100, 'La empresa no puede exceder 100 caracteres').optional(),
  taxId: z
    .string()
    .trim()
    .max(13, 'El RUC/cédula no puede exceder 13 caracteres')
    .optional()
    .or(z.literal('')),
});

// ─── Shipping Address Schema ──────────────────────────────────────────────────

export const shippingAddressSchema = z.object({
  address1: z
    .string()
    .trim()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(100, 'La dirección no puede exceder 100 caracteres'),
  address2: z
    .string()
    .trim()
    .max(100, 'La dirección no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(50, 'La ciudad no puede exceder 50 caracteres'),
  state: z
    .string()
    .trim()
    .min(1, 'Selecciona una provincia')
    .refine((val) => ECUADOR_PROVINCES.includes(val), {
      message: 'Provincia inválida',
    }),
  postalCode: z
    .string()
    .trim()
    .min(6, 'El código postal debe tener 6 dígitos')
    .max(6, 'El código postal debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código postal debe contener solo números'),
  country: z.string().trim().max(50),
});

// ─── Shipping Method Schema ───────────────────────────────────────────────────

export const shippingMethodSchema = z.object({
  shippingMethod: z
    .string()
    .trim()
    .min(1, 'Selecciona un método de envío'),
});

// ─── Complete Checkout Schema ─────────────────────────────────────────────────

export const completeCheckoutSchema = z.object({
  customer: customerInfoSchema,
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.string().trim().min(1, 'Selecciona un método de envío'),
  notes: z
    .string()
    .trim()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

// ─── Registration Schema ──────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(50),
    lastName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(50),
    company: z.string().trim().min(2, 'Nombre de empresa requerido').max(100),
    ruc: z
      .string()
      .trim()
      .min(10, 'RUC debe tener 10 o 13 dígitos')
      .max(13, 'RUC debe tener 10 o 13 dígitos')
      .regex(/^\d+$/, 'El RUC solo debe contener números'),
    phone: z
      .string()
      .trim()
      .min(10, 'El teléfono debe tener al menos 10 dígitos')
      .max(15)
      .regex(/^[0-9\s\-\+\(\)]+$/, 'Formato inválido'),
    email: z
      .string()
      .trim()
      .email('Correo electrónico inválido')
      .max(254, 'El correo electrónico no puede exceder 254 caracteres'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// ─── Product Schema (para admin) ─────────────────────────────────────────────

export const productSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, 'El SKU es requerido')
    .max(50, 'El SKU no puede exceder 50 caracteres'),
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  slug: z
    .string()
    .trim()
    .max(200, 'El slug no puede exceder 200 caracteres')
    .regex(/^[a-z0-9-]*$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .optional()
    .or(z.literal('')),
  shortDescription: z
    .string()
    .trim()
    .max(500, 'La descripción corta no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  price: z
    .number()
    .positive('El precio debe ser mayor a 0')
    .max(999999, 'El precio no puede exceder 999,999'),
  wholesalePrice: z
    .number()
    .positive('El precio mayorista debe ser mayor a 0')
    .max(999999)
    .nullable()
    .optional(),
  compareAtPrice: z
    .number()
    .positive()
    .max(999999)
    .nullable()
    .optional(),
  costPrice: z
    .number()
    .positive()
    .max(999999)
    .nullable()
    .optional(),
  stock: z
    .number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .max(999999, 'El stock no puede exceder 999,999'),
  categoryId: z.string().trim().min(1, 'La categoría es requerida'),
  brandId: z.string().trim().nullable().optional(),
  technicalSheet: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
});

// ─── Admin User Create Schema ─────────────────────────────────────────────────

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
  email: z.string().trim().email('Correo electrónico inválido').max(254),
  password: passwordSchema,
  role: z.enum(['admin', 'cliente']).default('cliente'),
  company: z.string().trim().max(100).optional(),
  ruc: z.string().trim().max(13).regex(/^\d*$/, 'El RUC solo debe contener números').optional(),
  phone: z.string().trim().max(15).optional(),
});

// ─── Promotion Schema (para admin) ────────────────────────────────────────────

export const promotionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  discountType: z.enum(['percentage', 'fixed'], {
    message: 'Selecciona un tipo de descuento',
  }),
  discountValue: z
    .number()
    .min(0, 'El valor debe ser mayor o igual a 0'),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  daysFromActivation: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser mayor a 0')
    .optional(),
  productIds: z
    .array(z.string())
    .min(1, 'Selecciona al menos un producto'),
  isActive: z.boolean().optional(),
}).refine(
  (data) => data.validFrom || data.validUntil || data.daysFromActivation,
  {
    message: 'Debe especificar al menos una condición de validez (fechas o días desde activación)',
    path: ['validFrom'],
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>;
export type CustomerInfoFormData = z.infer<typeof customerInfoSchema>;
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
export type ShippingMethodFormData = z.infer<typeof shippingMethodSchema>;
export type CompleteCheckoutFormData = z.infer<typeof completeCheckoutSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type AdminCreateUserFormData = z.infer<typeof adminCreateUserSchema>;
export type PromotionFormData = z.infer<typeof promotionSchema>;
