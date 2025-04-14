import { users, categories, shops, products, cartItems, orders, orderItems, wallets, walletTransactions, 
  type User, type InsertUser, type Category, type InsertCategory, type Shop, type InsertShop, 
  type Product, type InsertProduct, type CartItem, type InsertCartItem, type Order, type InsertOrder, 
  type OrderItem, type InsertOrderItem, type Wallet, type InsertWallet, type WalletTransaction, 
  type InsertWalletTransaction } from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, asc, gte, lte, sql, not, isNull, inArray } from "drizzle-orm";
import * as session from "express-session";
import createMemoryStore from "memorystore";
import { cookieConfig } from './cookie-config';

// Tạo memory store từ memorystore package với cấu hình chung
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getSubcategories(parentId: number): Promise<Category[]>;
  
  // Shops
  getShops(options: { isFeatured?: boolean, page: number, limit: number }): Promise<{ shops: Shop[], total: number }>;
  getShopById(id: number): Promise<Shop | undefined>;
  getShopByUserId(userId: number): Promise<Shop | undefined>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: number, data: Partial<InsertShop>): Promise<Shop>;
  
  // Products
  getProducts(options: { 
    categorySlug?: string, 
    search?: string, 
    minPrice?: number, 
    maxPrice?: number, 
    sortBy: string, 
    page: number, 
    limit: number,
    featured?: boolean,
    flashSale?: boolean
  }): Promise<{ products: Product[], total: number }>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getShopProducts(shopId: number, page: number, limit: number, search?: string): Promise<{ products: Product[], total: number }>;
  countShopProducts(shopId: number): Promise<number>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Cart
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  getCartItemById(id: number): Promise<CartItem | undefined>;
  getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, data: Partial<InsertCartItem>): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Orders
  getUserOrders(userId: number, page: number, limit: number): Promise<{ orders: Order[], total: number }>;
  getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  updateOrder(id: number, data: Partial<InsertOrder>): Promise<Order>;
  sellerHasProductInOrder(sellerId: number, orderId: number): Promise<boolean>;
  countShopOrders(shopId: number): Promise<number>;
  getShopOrders(shopId: number, page: number, limit: number, status?: string): Promise<{ orders: Order[], total: number }>;
  getShopRecentOrders(shopId: number, limit: number): Promise<Order[]>;
  getShopRevenue(shopId: number): Promise<number>;
  
  // Wallet
  getWalletByUserId(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, data: Partial<InsertWallet>): Promise<Wallet>;
  getWalletTransactions(walletId: number, page: number, limit: number): Promise<{ transactions: WalletTransaction[], total: number }>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  
  // Affiliate
  countAffiliateOrders(affiliateId: number): Promise<number>;
  getAffiliateOrders(affiliateId: number, page: number, limit: number): Promise<{ orders: Order[], total: number }>;
  getAffiliateEarnings(affiliateId: number): Promise<number>;
  getAffiliateRecentCommissions(affiliateId: number, limit: number): Promise<WalletTransaction[]>;
  
  // SessionStore with the full session type
  sessionStore: ReturnType<typeof createMemoryStore>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    // Sử dụng cấu hình cookie nhất quán cho MemoryStore
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
      stale: false, // Do not delete stale sessions
      ttl: cookieConfig.maxAge / 1000, // Sử dụng thời gian từ cookieConfig (đổi từ ms sang s)
    });
    console.log('📦 Session store được tạo với ttl:', cookieConfig.maxAge / 1000, 'giây');
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    // Trong trường hợp đơn giản, mã giới thiệu có thể là username
    const [user] = await db.select().from(users).where(eq(users.username, referralCode));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    console.log('getCategoryBySlug called with slug:', slug);
    try {
      const query = db.select().from(categories).where(eq(categories.slug, slug));
      console.log('SQL query:', query.toSQL().sql);
      
      const results = await query;
      console.log('Query results:', results);
      
      const [category] = results;
      console.log('Found category:', category);
      
      return category;
    } catch (error) {
      console.error('Error in getCategoryBySlug:', error);
      return undefined;
    }
  }
  
  async getSubcategories(parentId: number): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.parentId, parentId)).orderBy(categories.name);
  }

  // Shop methods
  async getShops(options: { isFeatured?: boolean, page: number, limit: number }): Promise<{ shops: Shop[], total: number }> {
    const { isFeatured, page, limit } = options;
    
    let query = db.select().from(shops);
    
    if (isFeatured) {
      query = query.where(eq(shops.isFeatured, true));
    }
    
    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(shops)
      .where(isFeatured ? eq(shops.isFeatured, true) : sql`1=1`);
    
    // Get paginated results
    const results = await query
      .orderBy(desc(shops.totalSales))
      .limit(limit)
      .offset((page - 1) * limit);
      
    return {
      shops: results,
      total: Number(count)
    };
  }

  async getShopById(id: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop;
  }
  
  async getShopByUserId(userId: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.userId, userId));
    return shop;
  }
  
  async createShop(shopData: InsertShop): Promise<Shop> {
    const [shop] = await db.insert(shops).values(shopData).returning();
    return shop;
  }
  
  async updateShop(id: number, data: Partial<InsertShop>): Promise<Shop> {
    const [shop] = await db
      .update(shops)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shops.id, id))
      .returning();
    return shop;
  }

  // Product methods
  async getProducts(options: { 
    categorySlug?: string, 
    search?: string, 
    minPrice?: number, 
    maxPrice?: number, 
    sortBy?: string, 
    page?: number, 
    limit?: number,
    featured?: boolean,
    flashSale?: boolean
  }): Promise<{ products: Product[], total: number }> {
    const { categorySlug, search, minPrice, maxPrice, sortBy = 'newest', page = 1, limit = 20, featured, flashSale } = options;
    
    console.log('getProducts called with options:', { categorySlug, search, minPrice, maxPrice, sortBy, page, limit, featured, flashSale });
    
    // Sử dụng SQL thuần khi có categorySlug để đảm bảo độ tin cậy
    if (categorySlug) {
      console.log('Using raw SQL approach for categorySlug:', categorySlug);
      try {
        // Bước 1: Tìm category theo slug
        const categoryResult = await db.execute(sql`SELECT * FROM categories WHERE slug = ${categorySlug}`);
        
        if (categoryResult.rows.length === 0) {
          console.log('Category not found with slug:', categorySlug);
          return { products: [], total: 0 };
        }
        
        const category = categoryResult.rows[0];
        console.log('Found category:', category);
        
        // Bước 2: Xác định ID cần tìm
        let categoryIds = [category.id];
        
        // Nếu là danh mục cha, lấy thêm các danh mục con
        if (category.parent_id === null) {
          console.log('This is a parent category, fetching subcategories');
          const subcategoriesResult = await db.execute(sql`SELECT * FROM categories WHERE parent_id = ${category.id}`);
          const subcategories = subcategoriesResult.rows;
          
          console.log('Found subcategories:', subcategories);
          categoryIds = [...categoryIds, ...subcategories.map(sub => sub.id)];
        }
        
        console.log('Using category IDs for filtering:', categoryIds);
        
        // Bước 3: Xây dựng câu lệnh SQL
        let query = `
          SELECT * FROM products 
          WHERE category_id IN (${categoryIds.join(',')})
        `;
        
        let countQuery = `
          SELECT COUNT(*) as total 
          FROM products 
          WHERE category_id IN (${categoryIds.join(',')})
        `;
        
        // Thêm các điều kiện khác
        if (search) {
          const searchCondition = ` AND (name ILIKE '%${search}%' OR description ILIKE '%${search}%')`;
          query += searchCondition;
          countQuery += searchCondition;
        }
        
        if (minPrice !== undefined) {
          const minPriceCondition = ` AND price >= ${minPrice}`;
          query += minPriceCondition;
          countQuery += minPriceCondition;
        }
        
        if (maxPrice !== undefined) {
          const maxPriceCondition = ` AND price <= ${maxPrice}`;
          query += maxPriceCondition;
          countQuery += maxPriceCondition;
        }
        
        if (featured) {
          const featuredCondition = ` AND is_featured = true`;
          query += featuredCondition;
          countQuery += featuredCondition;
        }
        
        if (flashSale) {
          const flashSaleCondition = ` AND is_flash_sale = true AND (flash_sale_end IS NULL OR flash_sale_end >= NOW())`;
          query += flashSaleCondition;
          countQuery += flashSaleCondition;
        }
        
        // Tạo và thực thi câu lệnh đếm sản phẩm với sql template tag
        console.log('Executing count query for category IDs:', categoryIds);
        const countResult = await db.execute(sql`
          SELECT COUNT(*) as total 
          FROM products 
          WHERE category_id IN (${sql.join(categoryIds, sql`, `)})
        `);
        const total = parseInt(countResult.rows[0].total);
        console.log('Total products:', total);
        
        // Thêm sắp xếp
        switch (sortBy) {
          case 'price_asc':
            query += ` ORDER BY price ASC`;
            break;
          case 'price_desc':
            query += ` ORDER BY price DESC`;
            break;
          case 'bestselling':
            query += ` ORDER BY total_sales DESC`;
            break;
          case 'rating':
            query += ` ORDER BY rating DESC`;
            break;
          case 'newest':
          default:
            query += ` ORDER BY created_at DESC`;
            break;
        }
        
        // Thêm phân trang
        query += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
        
        // Thực thi truy vấn sản phẩm với sql template tag
        console.log('Executing products query for category IDs:', categoryIds);
        
        let orderByClause = 'created_at DESC'; // Default
        switch (sortBy) {
          case 'price_asc': orderByClause = 'price ASC'; break;
          case 'price_desc': orderByClause = 'price DESC'; break;
          case 'bestselling': orderByClause = 'total_sales DESC'; break;
          case 'rating': orderByClause = 'rating DESC'; break;
        }
        
        const result = await db.execute(sql`
          SELECT * FROM products 
          WHERE category_id IN (${sql.join(categoryIds, sql`, `)})
          ORDER BY ${sql.raw(orderByClause)} 
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `);
        
        const productsList = result.rows;
        console.log(`Found ${productsList.length} products`);
        
        // Map kết quả về định dạng chuẩn
        const mappedProducts = productsList.map(row => ({
          id: row.id,
          categoryId: row.category_id,
          shopId: row.shop_id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          price: Number(row.price),
          salePrice: row.sale_price ? Number(row.sale_price) : null,
          quantity: row.quantity,
          images: row.images,
          rating: row.rating,
          sold: row.sold,
          totalSales: row.total_sales,
          isFeatured: row.is_featured,
          isFlashSale: row.is_flash_sale,
          flashSaleEnd: row.flash_sale_end,
          discount: row.discount,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
        
        return {
          products: mappedProducts,
          total
        };
      } catch (error) {
        console.error('Error executing raw SQL:', error);
        // Nhảy xuống phương pháp dự phòng
      }
    }
    
    // Phương pháp dự phòng: Sử dụng drizzle-orm như trước đây
    console.log('Using fallback method with Drizzle ORM');
    
    // Build where conditions
    let whereConditions = sql`1=1`;
    
    if (categorySlug) {
      const category = await this.getCategoryBySlug(categorySlug);
      if (category) {
        if (category.parentId === null) {
          const subcategories = await this.getSubcategories(category.id);
          const categoryIds = [category.id, ...subcategories.map(sub => sub.id)];
          
          console.log('Danh sách IDs của danh mục:', categoryIds);
          
          if (categoryIds.length === 1) {
            // Nếu chỉ có một ID, dùng điều kiện đơn giản
            whereConditions = and(whereConditions, eq(products.categoryId, categoryIds[0]));
          } else {
            // Nếu có nhiều ID, xây dựng điều kiện OR nhiều lần
            let categoryConditions = [];
            for (const id of categoryIds) {
              categoryConditions.push(eq(products.categoryId, id));
            }
            whereConditions = and(whereConditions, or(...categoryConditions));
          }
        } else {
          whereConditions = and(whereConditions, eq(products.categoryId, category.id));
        }
      }
    }
    
    if (search) {
      whereConditions = and(whereConditions, 
        or(
          like(products.name, `%${search}%`),
          like(products.description || '', `%${search}%`)
        )
      );
    }
    
    if (minPrice !== undefined) {
      whereConditions = and(whereConditions, gte(products.price, minPrice));
    }
    
    if (maxPrice !== undefined) {
      whereConditions = and(whereConditions, lte(products.price, maxPrice));
    }
    
    if (featured) {
      whereConditions = and(whereConditions, eq(products.isFeatured, true));
    }
    
    if (flashSale) {
      whereConditions = and(whereConditions, 
        eq(products.isFlashSale, true),
        gte(products.flashSaleEnd || new Date(0), new Date())
      );
    }
    
    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereConditions);
    
    // Determine order by
    let orderByClause;
    switch (sortBy) {
      case 'price_asc':
        orderByClause = asc(products.price);
        break;
      case 'price_desc':
        orderByClause = desc(products.price);
        break;
      case 'bestselling':
        orderByClause = desc(products.totalSales);
        break;
      case 'rating':
        orderByClause = desc(products.rating);
        break;
      case 'newest':
      default:
        orderByClause = desc(products.createdAt);
    }
    
    // Get paginated results
    const results = await db
      .select()
      .from(products)
      .where(whereConditions)
      .orderBy(orderByClause)
      .limit(limit)
      .offset((page - 1) * limit);
      
    return {
      products: results,
      total: Number(count)
    };
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }
  
  async getShopProducts(shopId: number, page: number, limit: number, search?: string): Promise<{ products: Product[], total: number }> {
    let whereConditions = eq(products.shopId, shopId);
    
    if (search) {
      whereConditions = and(whereConditions, like(products.name, `%${search}%`));
    }
    
    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereConditions);
    
    // Get paginated results
    const results = await db
      .select()
      .from(products)
      .where(whereConditions)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
      
    return {
      products: results,
      total: Number(count)
    };
  }
  
  async countShopProducts(shopId: number): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.shopId, shopId));
      
    return Number(count);
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }
  
  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }
  
  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart methods
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const items = await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));
      
    return items.map(item => ({
      ...item.cart_items,
      product: item.products
    }));
  }
  
  async getCartItemById(id: number): Promise<CartItem | undefined> {
    const [item] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return item;
  }
  
  async getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined> {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
    return item;
  }
  
  async addToCart(itemData: InsertCartItem): Promise<CartItem> {
    const [item] = await db.insert(cartItems).values(itemData).returning();
    return item;
  }
  
  async updateCartItem(id: number, data: Partial<InsertCartItem>): Promise<CartItem> {
    const [item] = await db
      .update(cartItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return item;
  }
  
  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }
  
  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order methods
  async getUserOrders(userId: number, page: number, limit: number): Promise<{ orders: Order[], total: number }> {
    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.userId, userId));
    
    // Get paginated results
    const results = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
      
    return {
      orders: results,
      total: Number(count)
    };
  }
  
  async getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) return undefined;
    
    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));
      
    return {
      ...order,
      items: items.map(item => ({
        ...item.order_items,
        product: item.products
      }))
    };
  }
  
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }
  
  async createOrderItem(itemData: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db.insert(orderItems).values(itemData).returning();
    return item;
  }
  
  async updateOrder(id: number, data: Partial<InsertOrder>): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }
  
  async sellerHasProductInOrder(sellerId: number, orderId: number): Promise<boolean> {
    const sellerShop = await this.getShopByUserId(sellerId);
    
    if (!sellerShop) return false;
    
    const result = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          eq(orderItems.orderId, orderId),
          eq(products.shopId, sellerShop.id)
        )
      )
      .limit(1);
      
    return result.length > 0;
  }
  
  async countShopOrders(shopId: number): Promise<number> {
    // Get shop products
    const shopProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.shopId, shopId));
      
    if (shopProducts.length === 0) return 0;
    
    const productIds = shopProducts.map(p => p.id);
    
    // Count orders containing shop products
    const [{ count }] = await db
      .select({ count: sql<number>`count(distinct ${orders.id})` })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(inArray(orderItems.productId, productIds));
      
    return Number(count);
  }
  
  async getShopOrders(shopId: number, page: number, limit: number, status?: string): Promise<{ orders: Order[], total: number }> {
    // Get shop products
    const shopProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.shopId, shopId));
      
    if (shopProducts.length === 0) {
      return { orders: [], total: 0 };
    }
    
    const productIds = shopProducts.map(p => p.id);
    
    // Build where conditions
    let whereConditions = inArray(orderItems.productId, productIds);
    
    if (status) {
      whereConditions = and(whereConditions, eq(orders.status, status));
    }
    
    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(distinct ${orders.id})` })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(whereConditions);
    
    // Get distinct order IDs
    const orderIdsResult = await db
      .selectDistinct({ id: orders.id })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(whereConditions)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
      
    if (orderIdsResult.length === 0) {
      return { orders: [], total: Number(count) };
    }
    
    const orderIds = orderIdsResult.map(o => o.id);
    
    // Get the full orders
    const results = await db
      .select()
      .from(orders)
      .where(inArray(orders.id, orderIds))
      .orderBy(desc(orders.createdAt));
      
    return {
      orders: results,
      total: Number(count)
    };
  }
  
  async getShopRecentOrders(shopId: number, limit: number): Promise<Order[]> {
    // Get shop products
    const shopProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.shopId, shopId));
      
    if (shopProducts.length === 0) return [];
    
    const productIds = shopProducts.map(p => p.id);
    
    // Get distinct order IDs
    const orderIdsResult = await db
      .selectDistinct({ id: orders.id })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(inArray(orderItems.productId, productIds))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
      
    if (orderIdsResult.length === 0) return [];
    
    const orderIds = orderIdsResult.map(o => o.id);
    
    // Get the full orders
    return db
      .select()
      .from(orders)
      .where(inArray(orders.id, orderIds))
      .orderBy(desc(orders.createdAt));
  }
  
  async getShopRevenue(shopId: number): Promise<number> {
    // Get shop products
    const shopProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.shopId, shopId));
      
    if (shopProducts.length === 0) return 0;
    
    const productIds = shopProducts.map(p => p.id);
    
    // Calculate revenue from order items
    const [result] = await db
      .select({ total: sql<string>`sum(${orderItems.price} * ${orderItems.quantity})` })
      .from(orderItems)
      .where(inArray(orderItems.productId, productIds));
      
    return result.total ? parseFloat(result.total) : 0;
  }

  // Wallet methods
  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }
  
  async createWallet(walletData: InsertWallet): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values(walletData).returning();
    return wallet;
  }
  
  async updateWallet(id: number, data: Partial<InsertWallet>): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wallets.id, id))
      .returning();
    return wallet;
  }
  
  async getWalletTransactions(walletId: number, page: number, limit: number): Promise<{ transactions: WalletTransaction[], total: number }> {
    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletId));
    
    // Get paginated results
    const results = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
      
    return {
      transactions: results,
      total: Number(count)
    };
  }
  
  async createWalletTransaction(transactionData: InsertWalletTransaction): Promise<WalletTransaction> {
    const [transaction] = await db.insert(walletTransactions).values(transactionData).returning();
    return transaction;
  }

  // Affiliate methods
  async countAffiliateOrders(affiliateId: number): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.affiliateId, affiliateId));
      
    return Number(count);
  }
  
  async getAffiliateOrders(affiliateId: number, page: number, limit: number): Promise<{ orders: Order[], total: number }> {
    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.affiliateId, affiliateId));
    
    // Get paginated results
    const results = await db
      .select()
      .from(orders)
      .where(eq(orders.affiliateId, affiliateId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
      
    return {
      orders: results,
      total: Number(count)
    };
  }
  
  async getAffiliateEarnings(affiliateId: number): Promise<number> {
    const [result] = await db
      .select({ total: sql<string>`sum(${orders.commission})` })
      .from(orders)
      .where(eq(orders.affiliateId, affiliateId));
      
    return result.total ? parseFloat(result.total) : 0;
  }
  
  async getAffiliateRecentCommissions(affiliateId: number, limit: number): Promise<WalletTransaction[]> {
    const wallet = await this.getWalletByUserId(affiliateId);
    
    if (!wallet) return [];
    
    return db
      .select()
      .from(walletTransactions)
      .where(
        and(
          eq(walletTransactions.walletId, wallet.id),
          eq(walletTransactions.type, 'commission')
        )
      )
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit);
  }
}

// Function to check if we have a database or not
function or(...conditions: any[]): any {
  if (conditions.length === 0) {
    return sql`1=1`;
  }
  if (conditions.length === 1) {
    return conditions[0];
  }
  // Nếu có nhiều hơn 2 điều kiện, xây dựng câu SQL OR phức tạp
  if (conditions.length > 2) {
    let result = sql`(${conditions[0]} OR ${conditions[1]})`;
    for (let i = 2; i < conditions.length; i++) {
      result = sql`(${result} OR ${conditions[i]})`;
    }
    return result;
  }
  return sql`(${conditions[0]} OR ${conditions[1]})`;
}

export const storage = new DatabaseStorage();
