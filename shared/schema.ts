import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  role: text("role").default("customer").notNull(), // 'customer', 'seller', 'admin'
  isSeller: boolean("is_seller").default(false).notNull(),
  isAffiliate: boolean("is_affiliate").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders),
  cartItems: many(cartItems),
  shops: many(shops),
}));

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categoryRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  subcategories: many(categories, { relationName: "subcategories" }),
}));

// Shops
export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  banner: text("banner"),
  rating: doublePrecision("rating").default(0),
  totalSales: integer("total_sales").default(0),
  isOfficial: boolean("is_official").default(false),
  isFeatured: boolean("is_featured").default(false),
  referralCode: text("referral_code"),
  referrerId: integer("referrer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shopRelations = relations(shops, ({ one, many }) => ({
  user: one(users, { fields: [shops.userId], references: [users.id] }),
  referrer: one(users, { fields: [shops.referrerId], references: [users.id] }),
  products: many(products),
}));

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  salePrice: doublePrecision("sale_price"),
  quantity: integer("quantity").default(0).notNull(),
  images: text("images").array(),
  rating: doublePrecision("rating").default(0),
  totalSales: integer("total_sales").default(0),
  sold: integer("sold").default(0),
  isFeatured: boolean("is_featured").default(false),
  isFlashSale: boolean("is_flash_sale").default(false),
  flashSaleEnd: timestamp("flash_sale_end"),
  discount: integer("discount").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  shop: one(shops, { fields: [products.shopId], references: [shops.id] }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

// Cart Items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

// Order Status Enum
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  total: doublePrecision("total").notNull(),
  status: text("status").notNull().default("pending"),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingCountry: text("shipping_country").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").default("pending").notNull(),
  affiliateId: integer("affiliate_id").references(() => users.id),
  commission: doublePrecision("commission").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  affiliate: one(users, { fields: [orders.affiliateId], references: [users.id] }),
  items: many(orderItems),
}));

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

// Wallets
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  balance: doublePrecision("balance").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  transactions: many(walletTransactions),
}));

// Wallet Transactions
export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'commission'
  status: text("status").default("pending").notNull(), // 'pending', 'completed', 'failed'
  reference: text("reference"), // Order ID, withdrawal request, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const walletTransactionRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(wallets, { fields: [walletTransactions.walletId], references: [wallets.id] }),
}));

// Insertable Types
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShopSchema = createInsertSchema(shops).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true });
export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({ id: true, createdAt: true });

// Select Types
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Shop = typeof shops.$inferSelect;
export type Product = typeof products.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;

// Insert Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertShop = z.infer<typeof insertShopSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
