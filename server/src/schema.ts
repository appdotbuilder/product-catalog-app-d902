
import { z } from 'zod';

// Product schema with proper numeric handling
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  stock_quantity: z.number().int(),
  image_filename: z.string().nullable(), // Stored image filename
  category: z.string(),
  instagram_handle: z.string().nullable(), // For Instagram DM functionality
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Input schema for creating products
export const createProductInputSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().nullable(),
  price: z.number().positive('Price must be positive'),
  stock_quantity: z.number().int().nonnegative('Stock quantity must be non-negative'),
  image_filename: z.string().nullable(),
  category: z.string().min(1, 'Category is required'),
  instagram_handle: z.string().nullable()
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

// Input schema for updating products
export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Product name is required').optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive('Price must be positive').optional(),
  stock_quantity: z.number().int().nonnegative('Stock quantity must be non-negative').optional(),
  image_filename: z.string().nullable().optional(),
  category: z.string().min(1, 'Category is required').optional(),
  instagram_handle: z.string().nullable().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Input schema for deleting products
export const deleteProductInputSchema = z.object({
  id: z.number()
});

export type DeleteProductInput = z.infer<typeof deleteProductInputSchema>;

// Admin authentication schemas
export const adminLoginInputSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

export type AdminLoginInput = z.infer<typeof adminLoginInputSchema>;

export const adminAuthResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  sessionToken: z.string().optional()
});

export type AdminAuthResponse = z.infer<typeof adminAuthResponseSchema>;
