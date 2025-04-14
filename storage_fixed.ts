// Fixed database storage module

import { 
  eq, 
  and, 
  like, 
  desc, 
  asc, 
  gte, 
  lte, 
  sql, 
  not, 
  isNull, 
  inArray
} from "drizzle-orm";

import { db } from "./db/index";
import {
  users,
  User,
  InsertUser,
  categories,
  Category,
  InsertCategory,
  shops,
  Shop,
  InsertShop,
  products,
  Product,
  InsertProduct,
  cartItems,
  CartItem,
  InsertCartItem,
  orders,
  Order,
  InsertOrder,
  orderItems,
  OrderItem,
  InsertOrderItem,
  wallets,
  Wallet,
  InsertWallet,
  walletTransactions,
  WalletTransaction,
  InsertWalletTransaction
} from "../shared/schema";

class DatabaseStorageFixed {
  // Method to get products with direct SQL approach for categories
  async getProducts(options: {
    categorySlug?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    flashSale?: boolean;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[], total: number }> {
    const { categorySlug, search, minPrice, maxPrice, sortBy = 'newest', page = 1, limit = 20, featured, flashSale } = options;
    
    console.log('getProducts called with options:', JSON.stringify(options));
    
    // Giải pháp mới: Sử dụng SQL thuần khi có categorySlug
    if (categorySlug) {
      try {
        console.log('Using direct SQL approach for categorySlug:', categorySlug);
        
        // Lấy thông tin category
        const category = await this.getCategoryBySlug(categorySlug);
        console.log('Category found:', category);
        
        if (!category) {
          console.log('Category not found, returning empty results');
          return { products: [], total: 0 };
        }
        
        // Xác định xem cần lấy toàn bộ danh mục con hay không
        let categoryIdList: number[] = [category.id];
        
        if (category.parentId === null) {
          // Đây là danh mục cha, lấy thêm ID của các danh mục con
          const subcategories = await this.getSubcategories(category.id);
          console.log('Subcategories:', subcategories);
          const subcategoryIds = subcategories.map(sub => sub.id);
          categoryIdList = [...categoryIdList, ...subcategoryIds];
        }
        
        console.log('Using category IDs:', categoryIdList);
        
        // Tạo câu lệnh SQL với điều kiện IN
        let query = `
          SELECT p.* 
          FROM products p
          WHERE p.category_id IN (${categoryIdList.join(',')})
        `;
        
        // Thêm các điều kiện lọc khác
        if (search) {
          query += ` AND (p.name ILIKE '%${search}%' OR p.description ILIKE '%${search}%')`;
        }
        
        if (minPrice !== undefined) {
          query += ` AND p.price >= ${minPrice}`;
        }
        
        if (maxPrice !== undefined) {
          query += ` AND p.price <= ${maxPrice}`;
        }
        
        if (featured) {
          query += ` AND p.is_featured = true`;
        }
        
        if (flashSale) {
          query += ` AND p.is_flash_sale = true AND (p.flash_sale_end IS NULL OR p.flash_sale_end >= NOW())`;
        }
        
        // Truy vấn đếm tổng số
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as count_query`;
        console.log('Count query:', countQuery);
        
        const countResult = await db.execute(sql.raw(countQuery));
        const total = parseInt(countResult.rows[0].total);
        console.log('Total products:', total);
        
        // Thêm sắp xếp và phân trang
        switch (sortBy) {
          case 'price_asc':
            query += ` ORDER BY p.price ASC`;
            break;
          case 'price_desc':
            query += ` ORDER BY p.price DESC`;
            break;
          case 'bestselling':
            query += ` ORDER BY p.total_sales DESC`;
            break;
          case 'rating':
            query += ` ORDER BY p.rating DESC`;
            break;
          case 'newest':
          default:
            query += ` ORDER BY p.created_at DESC`;
        }
        
        query += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
        console.log('Final query:', query);
        
        // Thực thi truy vấn
        const result = await db.execute(sql.raw(query));
        console.log('Query returned', result.rows.length, 'products');
        
        // Chuyển đổi kết quả
        const productsList = result.rows.map(row => {
          return {
            id: row.id,
            categoryId: row.category_id,
            shopId: row.shop_id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            price: Number(row.price),
            salePrice: row.sale_price ? Number(row.sale_price) : null,
            quantity: row.quantity,
            images: Array.isArray(row.images) ? row.images : [],
            rating: row.rating,
            totalSales: row.total_sales,
            isFeatured: row.is_featured,
            isFlashSale: row.is_flash_sale,
            flashSaleEnd: row.flash_sale_end,
            discount: row.discount,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
        });
        
        // Trả về kết quả
        return {
          products: productsList,
          total
        };
      } catch (error) {
        console.error('Error in direct SQL approach:', error);
        // Fallback to standard method if SQL approach fails
      }
    }
    
    // Tiếp tục phương pháp tiêu chuẩn như hiện tại
    let whereConditions = sql`1=1`;
    
    if (categorySlug) {
      const category = await this.getCategoryBySlug(categorySlug);
      
      if (category) {
        if (category.parentId === null) {
          // Danh mục cha
          const subcategories = await this.getSubcategories(category.id);
          
          // Lấy tất cả ID sản phẩm thuộc danh mục này và danh mục con
          const categoryIds = [category.id];
          for (const sub of subcategories) {
            categoryIds.push(sub.id);
          }
          
          // Cách đơn giản: Sử dụng nhiều điều kiện OR
          let categoryCondition = eq(products.categoryId, categoryIds[0]);
          for (let i = 1; i < categoryIds.length; i++) {
            categoryCondition = sql`${categoryCondition} OR ${eq(products.categoryId, categoryIds[i])}`;
          }
          
          whereConditions = and(whereConditions, sql`(${categoryCondition})`);
        } else {
          // Danh mục con
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

  // Required helper methods
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    console.log('getCategoryBySlug called with slug:', slug);
    const queryStr = `select "id", "name", "slug", "icon", "parent_id", "created_at", "updated_at" from "categories" where "categories"."slug" = $1`;
    console.log('SQL query:', queryStr);
    
    const result = await db.execute(sql.raw(queryStr, [slug]));
    console.log('Query results:', result.rows);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
    const category: Category = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon,
      parentId: row.parent_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
    
    console.log('Found category:', category);
    return category;
  }

  async getSubcategories(parentId: number): Promise<Category[]> {
    const result = await db.execute(
      sql.raw(
        `select "id", "name", "slug", "icon", "parent_id", "created_at", "updated_at" 
         from "categories" 
         where "categories"."parent_id" = $1`,
        [parentId]
      )
    );
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon,
      parentId: row.parent_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }
}

// Function to handle OR conditions
function or(...conditions: any[]): any {
  if (conditions.length === 0) {
    return sql`1=1`;
  }
  if (conditions.length === 1) {
    return conditions[0];
  }
  let result = sql`(${conditions[0]} OR ${conditions[1]})`;
  for (let i = 2; i < conditions.length; i++) {
    result = sql`(${result} OR ${conditions[i]})`;
  }
  return result;
}

// Export an instance for testing
export const storageFixed = new DatabaseStorageFixed();