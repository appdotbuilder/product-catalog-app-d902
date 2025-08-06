
import { integer, text, sqliteTable, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const productsTable = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  price: real('price').notNull(), // Use real for monetary values in SQLite
  stock_quantity: integer('stock_quantity').notNull(),
  image_filename: text('image_filename'), // Nullable filename for uploaded images
  category: text('category').notNull(),
  instagram_handle: text('instagram_handle'), // Nullable Instagram handle
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
});

// Admin sessions table for session management
export const adminSessionsTable = sqliteTable('admin_sessions', {
  id: text('id').primaryKey(), // Session token
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  expires_at: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// TypeScript types for the table schemas
export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
export type AdminSession = typeof adminSessionsTable.$inferSelect;
export type NewAdminSession = typeof adminSessionsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  products: productsTable,
  adminSessions: adminSessionsTable
};
