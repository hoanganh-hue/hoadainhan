import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { eq, and, like, desc, gte, lte, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  insertProductSchema, 
  insertShopSchema, 
  insertCartItemSchema,
  insertOrderSchema, 
  insertOrderItemSchema,
  insertWalletTransactionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes trước (bao gồm endpoint `/api/auth/status`)
  setupAuth(app);

  // Categories
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/categories/:slug", async (req, res, next) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Danh mục không tồn tại" });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/categories/:id/subcategories", async (req, res, next) => {
    try {
      const categoryId = parseInt(req.params.id);
      const subcategories = await storage.getSubcategories(categoryId);
      res.json(subcategories);
    } catch (error) {
      next(error);
    }
  });

  // Products
  app.get("/api/products", async (req, res, next) => {
    try {
      const { 
        categorySlug, 
        category,
        search, 
        minPrice, 
        maxPrice, 
        sort = "newest",
        page = 1, 
        limit = 12,
        featured,
        flashSale
      } = req.query;
      
      console.log('[API] GET /api/products with query:', req.query);
      
      // Kiểm tra categorySlug
      const finalCategorySlug = (categorySlug || category) as string | undefined;
      console.log('[API] Using categorySlug:', finalCategorySlug);
      
      if (finalCategorySlug === 'apple-iphone') {
        console.log('[API] Đang tìm sản phẩm Apple iPhone, kiểm tra xem danh mục này có tồn tại không');
        const catCheck = await storage.getCategoryBySlug(finalCategorySlug);
        console.log('[API] Category check result:', catCheck);
        
        // Kiểm tra trực tiếp bằng SQL
        const query = `SELECT COUNT(*) FROM products WHERE category_id = ${catCheck?.id || 0}`;
        console.log('[API] Checking products with SQL:', query);
        const result = await db.execute(sql`SELECT COUNT(*) FROM products WHERE category_id = ${catCheck?.id || 0}`);
        console.log('[API] SQL result:', result.rows[0]);
      }
      
      const products = await storage.getProducts({
        categorySlug: finalCategorySlug,
        search: search as string | undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sort as string,
        page: Number(page),
        limit: Number(limit),
        featured: featured === "true",
        flashSale: flashSale === "true"
      });
      
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:slug", async (req, res, next) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // For sellers: Create, update, delete products
  app.post("/api/products", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isSeller) {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    try {
      const validatedData = insertProductSchema.parse(req.body);
      
      // Verify shop belongs to user
      const shop = await storage.getShopById(validatedData.shopId);
      if (!shop || shop.userId !== req.user.id) {
        return res.status(403).json({ message: "Không có quyền thêm sản phẩm cho cửa hàng này" });
      }
      
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/products/:id", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isSeller) {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }
      
      // Verify shop belongs to user
      const shop = await storage.getShopById(product.shopId);
      if (!shop || shop.userId !== req.user.id) {
        return res.status(403).json({ message: "Không có quyền chỉnh sửa sản phẩm này" });
      }
      
      const updatedProduct = await storage.updateProduct(productId, req.body);
      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/products/:id", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isSeller) {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }
      
      // Verify shop belongs to user
      const shop = await storage.getShopById(product.shopId);
      if (!shop || shop.userId !== req.user.id) {
        return res.status(403).json({ message: "Không có quyền xóa sản phẩm này" });
      }
      
      await storage.deleteProduct(productId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Shops
  app.get("/api/shops", async (req, res, next) => {
    try {
      const { featured, page = 1, limit = 12 } = req.query;
      
      const shops = await storage.getShops({
        isFeatured: featured === "true",
        page: Number(page),
        limit: Number(limit)
      });
      
      res.json(shops);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/shops/:id", async (req, res, next) => {
    try {
      const shopId = parseInt(req.params.id);
      const shop = await storage.getShopById(shopId);
      
      if (!shop) {
        return res.status(404).json({ message: "Cửa hàng không tồn tại" });
      }
      
      res.json(shop);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/shops/:id/products", async (req, res, next) => {
    try {
      const shopId = parseInt(req.params.id);
      const { page = 1, limit = 12 } = req.query;
      
      const products = await storage.getShopProducts(
        shopId, 
        Number(page), 
        Number(limit)
      );
      
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/shops/:id", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isSeller) {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    try {
      const shopId = parseInt(req.params.id);
      const shop = await storage.getShopById(shopId);
      
      if (!shop) {
        return res.status(404).json({ message: "Cửa hàng không tồn tại" });
      }
      
      // Verify shop belongs to user
      if (shop.userId !== req.user.id) {
        return res.status(403).json({ message: "Không có quyền chỉnh sửa cửa hàng này" });
      }
      
      const validatedData = insertShopSchema.partial().parse(req.body);
      const updatedShop = await storage.updateShop(shopId, validatedData);
      
      res.json(updatedShop);
    } catch (error) {
      next(error);
    }
  });

  // Cart
  app.get("/api/cart", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/cart", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if product exists
      const product = await storage.getProductById(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }
      
      // Check if product already in cart
      const existingItem = await storage.getCartItemByProductId(
        req.user.id, 
        validatedData.productId
      );
      
      let cartItem;
      
      if (existingItem) {
        // Update quantity
        cartItem = await storage.updateCartItem(
          existingItem.id, 
          { quantity: existingItem.quantity + (validatedData.quantity || 1) }
        );
      } else {
        // Add new item
        cartItem = await storage.addToCart(validatedData);
      }
      
      res.status(201).json(cartItem);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/cart/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      const cartItemId = parseInt(req.params.id);
      const cartItem = await storage.getCartItemById(cartItemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
      }
      
      // Verify cart item belongs to user
      if (cartItem.userId !== req.user.id) {
        return res.status(403).json({ message: "Không có quyền chỉnh sửa" });
      }
      
      const updatedCartItem = await storage.updateCartItem(
        cartItemId, 
        { quantity: req.body.quantity }
      );
      
      res.json(updatedCartItem);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/cart/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      const cartItemId = parseInt(req.params.id);
      const cartItem = await storage.getCartItemById(cartItemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
      }
      
      // Verify cart item belongs to user
      if (cartItem.userId !== req.user.id) {
        return res.status(403).json({ message: "Không có quyền xóa" });
      }
      
      await storage.removeFromCart(cartItemId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/cart", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      await storage.clearCart(req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Orders
  app.get("/api/orders", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      const { page = 1, limit = 10 } = req.query;
      const orders = await storage.getUserOrders(
        req.user.id, 
        Number(page), 
        Number(limit)
      );
      
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Đơn hàng không tồn tại" });
      }
      
      // Check if order belongs to user or seller has product in order
      const canView = order.userId === req.user.id || 
                       (req.user.isSeller && await storage.sellerHasProductInOrder(req.user.id, orderId));
      
      if (!canView) {
        return res.status(403).json({ message: "Không có quyền xem đơn hàng này" });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      // Get cart items
      const cartItems = await storage.getCartItems(req.user.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Giỏ hàng trống" });
      }
      
      // Calculate total
      let total = 0;
      for (const item of cartItems) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(400).json({ 
            message: `Sản phẩm không tồn tại hoặc đã bị xóa: ${item.productId}` 
          });
        }
        
        // Check stock
        if (product.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Sản phẩm "${product.name}" chỉ còn ${product.quantity} sản phẩm` 
          });
        }
        
        const price = product.salePrice || product.price;
        total += price * item.quantity;
      }
      
      // Get affiliate if any
      const affiliateId = req.body.affiliateId ? parseInt(req.body.affiliateId) : null;
      let commission = 0;
      
      if (affiliateId) {
        // Calculate commission (10% of total)
        commission = total * 0.1;
      }
      
      // Create order
      const validatedOrderData = insertOrderSchema.parse({
        userId: req.user.id,
        total,
        shippingAddress: req.body.shippingAddress,
        shippingCity: req.body.shippingCity,
        shippingCountry: req.body.shippingCountry,
        paymentMethod: req.body.paymentMethod,
        affiliateId,
        commission
      });
      
      const order = await storage.createOrder(validatedOrderData);
      
      // Add order items
      for (const item of cartItems) {
        const product = await storage.getProductById(item.productId);
        if (!product) continue; // Skip if product was deleted
        
        const price = product.salePrice || product.price;
        
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price
        });
        
        // Update product quantity
        await storage.updateProduct(item.productId, {
          quantity: product.quantity - item.quantity,
          totalSales: (product.totalSales || 0) + item.quantity
        });
        
        // Update shop stats
        const shop = await storage.getShopById(product.shopId);
        if (shop) {
          await storage.updateShop(shop.id, {
            totalSales: (shop.totalSales || 0) + 1
          });
        }
      }
      
      // Add commission to affiliate's wallet if applicable
      if (affiliateId && commission > 0) {
        const affiliateWallet = await storage.getWalletByUserId(affiliateId);
        
        if (affiliateWallet) {
          // Update wallet balance
          await storage.updateWallet(affiliateWallet.id, {
            balance: affiliateWallet.balance + commission
          });
          
          // Create transaction record
          await storage.createWalletTransaction({
            walletId: affiliateWallet.id,
            amount: commission,
            type: "commission",
            status: "completed",
            reference: `Order #${order.id}`
          });
        }
      }
      
      // Clear cart
      await storage.clearCart(req.user.id);
      
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });

  // Register as a seller
  app.post("/api/seller/register", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    // Check if user is already a seller
    if (req.user.isSeller) {
      return res.status(400).json({ message: "Bạn đã là người bán hàng" });
    }

    try {
      const { name, description, referralCode } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
      }

      // Check if referral code is valid (if provided)
      let referrerId = null;
      if (referralCode) {
        // In this implementation, we're treating referralCode as a user ID
        // In a real application, you might want to generate and validate unique codes
        const referrer = await storage.getUser(parseInt(referralCode));
        if (referrer && referrer.isSeller) {
          referrerId = referrer.id;
        }
      }

      // Create shop for user
      const shop = await storage.createShop({
        userId: req.user.id,
        name,
        description,
        referralCode: referralCode || null,
        referrerId: referrerId,
      });

      // Update user to be a seller
      await storage.updateUser(req.user.id, {
        isSeller: true,
        role: "seller",
      });

      // Update the user in the session
      req.user.isSeller = true;
      req.user.role = "seller";

      res.status(201).json({ shop, success: true });
    } catch (error) {
      next(error);
    }
  });

  // For sellers: Update order status
  app.put("/api/seller/orders/:id", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isSeller) {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["processing", "shipped", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }
      
      // Check if seller has product in order
      const canUpdate = await storage.sellerHasProductInOrder(req.user.id, orderId);
      
      if (!canUpdate) {
        return res.status(403).json({ message: "Không có quyền cập nhật đơn hàng này" });
      }
      
      const updatedOrder = await storage.updateOrder(orderId, { status });
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  });

  // Seller dashboard
  app.get("/api/seller/dashboard", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isSeller) {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    try {
      const shop = await storage.getShopByUserId(req.user.id);
      
      if (!shop) {
        return res.status(404).json({ message: "Cửa hàng không tồn tại" });
      }
      
      // Get shop statistics
      const totalProducts = await storage.countShopProducts(shop.id);
      const totalOrders = await storage.countShopOrders(shop.id);
      const totalRevenue = await storage.getShopRevenue(shop.id);
      
      // Get recent orders
      const recentOrders = await storage.getShopRecentOrders(shop.id, 5);
      
      res.json({
        shopId: shop.id,
        name: shop.name,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalSales: shop.totalSales,
        recentOrders
      });
    } catch (error) {
      next(error);
    }
  });

  // Seller products
  app.get("/api/seller/products", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isSeller) {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    try {
      const shop = await storage.getShopByUserId(req.user.id);
      
      if (!shop) {
        return res.status(404).json({ message: "Cửa hàng không tồn tại" });
      }
      
      const { page = 1, limit = 20, search } = req.query;
      
      const products = await storage.getShopProducts(
        shop.id, 
        Number(page), 
        Number(limit),
        search as string | undefined
      );
      
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  // Seller orders
  app.get("/api/seller/orders", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isSeller) {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    try {
      const shop = await storage.getShopByUserId(req.user.id);
      
      if (!shop) {
        return res.status(404).json({ message: "Cửa hàng không tồn tại" });
      }
      
      const { page = 1, limit = 20, status } = req.query;
      
      const orders = await storage.getShopOrders(
        shop.id, 
        Number(page), 
        Number(limit),
        status as string | undefined
      );
      
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  // Wallet
  app.get("/api/wallet", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      const wallet = await storage.getWalletByUserId(req.user.id);
      
      if (!wallet) {
        return res.status(404).json({ message: "Ví không tồn tại" });
      }
      
      res.json(wallet);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/wallet/transactions", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      const wallet = await storage.getWalletByUserId(req.user.id);
      
      if (!wallet) {
        return res.status(404).json({ message: "Ví không tồn tại" });
      }
      
      const { page = 1, limit = 20 } = req.query;
      
      const transactions = await storage.getWalletTransactions(
        wallet.id, 
        Number(page), 
        Number(limit)
      );
      
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/wallet/withdrawal", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      const wallet = await storage.getWalletByUserId(req.user.id);
      
      if (!wallet) {
        return res.status(404).json({ message: "Ví không tồn tại" });
      }
      
      const { amount, bankInfo } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Số tiền không hợp lệ" });
      }
      
      if (amount > wallet.balance) {
        return res.status(400).json({ message: "Số dư không đủ" });
      }
      
      if (!bankInfo) {
        return res.status(400).json({ message: "Vui lòng cung cấp thông tin ngân hàng" });
      }
      
      // Create withdrawal transaction
      const transaction = await storage.createWalletTransaction({
        walletId: wallet.id,
        amount: -amount, // Negative for withdrawal
        type: "withdrawal",
        status: "pending",
        reference: JSON.stringify(bankInfo)
      });
      
      // Update wallet balance
      await storage.updateWallet(wallet.id, {
        balance: wallet.balance - amount
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  });

  // Affiliate dashboard
  app.get("/api/affiliate/dashboard", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAffiliate) {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    try {
      // Get affiliate statistics
      const totalOrders = await storage.countAffiliateOrders(req.user.id);
      const totalCommission = await storage.getAffiliateEarnings(req.user.id);
      
      // Get wallet balance
      const wallet = await storage.getWalletByUserId(req.user.id);
      const balance = wallet ? wallet.balance : 0;
      
      // Get recent commissions
      const recentCommissions = await storage.getAffiliateRecentCommissions(req.user.id, 5);
      
      res.json({
        totalOrders,
        totalCommission,
        balance,
        recentCommissions
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/affiliate/orders", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAffiliate) {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    try {
      const { page = 1, limit = 20 } = req.query;
      
      const orders = await storage.getAffiliateOrders(
        req.user.id, 
        Number(page), 
        Number(limit)
      );
      
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  // Affiliate API
  
  // Register as affiliate
  app.post("/api/affiliate/register", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    try {
      const { fullName, email, phone, taxId, reason, website, socialMedia } = req.body;
      
      // Validate required fields
      if (!fullName || !email || !phone || !reason) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc" });
      }
      
      // Update user as affiliate
      const updatedUser = await storage.updateUser(req.user.id, {
        isAffiliate: true,
        fullName
      });
      
      // Create wallet for affiliate if not exists
      let wallet = await storage.getWalletByUserId(req.user.id);
      
      if (!wallet) {
        wallet = await storage.createWallet({
          userId: req.user.id,
          balance: 0
        });
      }
      
      // Return updated user
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });
  
  // Get affiliate stats
  app.get("/api/affiliate/stats", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAffiliate) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    try {
      // Get wallet
      const wallet = await storage.getWalletByUserId(req.user.id);
      
      if (!wallet) {
        return res.status(404).json({ message: "Ví không tồn tại" });
      }
      
      // Get total earnings (sum of all transactions)
      const totalEarnings = await storage.getAffiliateEarnings(req.user.id);
      
      // Get order count
      const orderCount = await storage.countAffiliateOrders(req.user.id);
      
      // Return stats
      res.json({
        totalEarnings,
        pendingCommission: 0, // TODO: Implement pending commission calculation
        orderCount,
        conversionRate: 5.2, // TODO: Implement conversion rate calculation
        currentBalance: wallet.balance,
        walletId: wallet.id
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get affiliate orders
  app.get("/api/affiliate/orders", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAffiliate) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const result = await storage.getAffiliateOrders(
        req.user.id,
        Number(page),
        Number(limit)
      );
      
      res.json(result.orders);
    } catch (error) {
      next(error);
    }
  });
  
  // Get affiliate transactions
  app.get("/api/affiliate/transactions", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAffiliate) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    try {
      // Get wallet
      const wallet = await storage.getWalletByUserId(req.user.id);
      
      if (!wallet) {
        return res.status(404).json({ message: "Ví không tồn tại" });
      }
      
      const { page = 1, limit = 10 } = req.query;
      
      const result = await storage.getWalletTransactions(
        wallet.id,
        Number(page),
        Number(limit)
      );
      
      res.json(result.transactions);
    } catch (error) {
      next(error);
    }
  });
  
  // Get recent affiliate commissions
  app.get("/api/affiliate/commissions", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAffiliate) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    try {
      const { limit = 5 } = req.query;
      
      const commissions = await storage.getAffiliateRecentCommissions(
        req.user.id,
        Number(limit)
      );
      
      res.json(commissions);
    } catch (error) {
      next(error);
    }
  });
  
  // Create product list for affiliate
  app.get("/api/products/list", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAffiliate) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    try {
      const products = await storage.getProducts({
        sortBy: "newest",
        page: 1,
        limit: 100 // Limit to 100 products for performance
      });
      
      // Return simplified product list
      const simplified = products.products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice
      }));
      
      res.json(simplified);
    } catch (error) {
      next(error);
    }
  });
  
  // Get shop list for affiliate
  app.get("/api/shops/list", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAffiliate) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    try {
      const shops = await storage.getShops({
        page: 1,
        limit: 100 // Limit to 100 shops for performance
      });
      
      // Return simplified shop list
      const simplified = shops.shops.map(shop => ({
        id: shop.id,
        name: shop.name
      }));
      
      res.json(simplified);
    } catch (error) {
      next(error);
    }
  });
  
  // Wallet balance
  app.get("/api/wallet/balance", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }
    
    try {
      const wallet = await storage.getWalletByUserId(req.user.id);
      
      if (!wallet) {
        return res.status(404).json({ message: "Ví không tồn tại" });
      }
      
      res.json({
        balance: wallet.balance,
        walletId: wallet.id
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Withdraw from wallet
  app.post("/api/wallet/withdraw", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }
    
    try {
      const { amount, method, accountNumber, accountName, walletId } = req.body;
      
      // Validate required fields
      if (!amount || !method || !accountNumber || !accountName || !walletId) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
      }
      
      // Get wallet
      const wallet = await storage.getWalletByUserId(req.user.id);
      
      if (!wallet || wallet.id !== parseInt(walletId)) {
        return res.status(404).json({ message: "Ví không tồn tại" });
      }
      
      // Check balance
      if (wallet.balance < amount) {
        return res.status(400).json({ message: "Số dư không đủ" });
      }
      
      // Create withdrawal transaction
      const transaction = await storage.createWalletTransaction({
        walletId: wallet.id,
        amount: -amount, // Negative amount for withdrawal
        type: "withdrawal",
        status: "pending",
        reference: `${method.toUpperCase()} - ${accountNumber}`
      });
      
      // Update wallet balance
      await storage.updateWallet(wallet.id, {
        balance: wallet.balance - amount
      });
      
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
