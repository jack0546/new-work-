/**
 * Zod validation schemas for API inputs.
 * Centralizing validation keeps route handlers thin and guarantees that only
 * well-formed data reaches Firestore.
 */

import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'productId is required').optional(),
  name: z.string().min(1, 'name is required'),
  price: z.number().positive('price must be positive'),
  quantity: z.number().int().min(1, 'quantity must be >= 1'),
  selectedSize: z.string().optional().nullable(),
  selectedColor: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  finalPrice: z.number().positive().optional(),
});

export const customerInfoSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Phone is required'),
  address: z.string().min(5, 'Address is required'),
  region: z.string().min(1, 'Region is required'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  customer: customerInfoSchema,
  subtotal: z.number().min(0).optional(),
  shippingFee: z.number().min(0).optional(),
  total: z.number().positive('total must be positive'),
  currency: z.string().length(3).default('GHS'),
  paymentMethod: z.string().default('paystack'),
  paymentReference: z.string().min(1, 'paymentReference is required'),
  idempotencyKey: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
