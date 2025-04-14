import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { cookieName, cookieSecret, cookieConfig } from './cookie-config';

declare global {
  namespace Express {
    // Extend the User interface in Express namespace to match our schema User type
    interface User {
      id: number;
      username: string;
      email: string;
      password: string;
      fullName: string | null;
      avatar: string | null;
      role: string;
      isSeller: boolean;
      isAffiliate: boolean;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Log để debug
  console.log('Setting up auth with environment:', process.env.NODE_ENV);
  
  // Cài đặt session với cookie được cấu hình để hoạt động với CORS
  const isDev = process.env.NODE_ENV === "development";
  
  // Sử dụng cấu hình chung từ cookie-config.ts
  console.log('🍪 Cookie config từ cookie-config.ts:', cookieConfig);
  
  const sessionSettings: session.SessionOptions = {
    secret: cookieSecret, // Sử dụng cookieSecret từ file cấu hình chung
    resave: true, // Đảm bảo session luôn được lưu lại
    saveUninitialized: true, // Lưu session chưa được khởi tạo
    store: storage.sessionStore,
    cookie: cookieConfig,
    name: cookieName, // Đặt tên cụ thể cho cookie
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Tên đăng nhập đã tồn tại");
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).send("Email đã được sử dụng");
      }

      // Xác định loại tài khoản
      const isSeller = req.body.accountType === "seller";
      const referralCode = req.body.referralCode || null;

      // Kiểm tra mã giới thiệu nếu có (tạm thời bỏ qua kiểm tra này vì chức năng đang được phát triển)
      let referrer = null;
      if (isSeller && referralCode) {
        try {
          referrer = await storage.getUserByUsername(referralCode);
        } catch (err) {
          console.error("Lỗi khi kiểm tra mã giới thiệu:", err);
        }
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        isSeller,
        isAffiliate: isSeller, // Người bán mặc định cũng là tiếp thị liên kết
        role: isSeller ? "seller" : "customer",
      });

      // Create a wallet for the new user
      await storage.createWallet({
        userId: user.id,
        balance: 0,
      });

      // Nếu là người bán, tạo cửa hàng mặc định
      if (isSeller) {
        await storage.createShop({
          userId: user.id,
          name: `${user.fullName}'s Shop`,
          description: `Chào mừng đến với cửa hàng của ${user.fullName}`,
          referralCode: referralCode,
        });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Kiểm tra xem người dùng đã được xác thực chưa
    if (!req.user) {
      return res.status(401).json({ message: "Đăng nhập thất bại" });
    }
    
    // Lưu thông tin người dùng trong biến an toàn để tránh lỗi undefined
    const user = req.user as Express.User;
    
    console.log('🔑 Đăng nhập thành công cho:', user.username);
    console.log('🍪 Session ID khi đăng nhập:', req.sessionID);
    
    // Đảm bảo session được lưu
    req.session.save(err => {
      if (err) {
        console.error('❌ Lỗi khi lưu session:', err);
        return res.status(500).json({ message: "Lỗi khi lưu phiên đăng nhập" });
      }
      
      // Đặt cookie session một cách rõ ràng với cùng cấu hình global
      res.cookie(cookieName, req.sessionID, cookieConfig);
      
      console.log('🎉 Đã đặt cookie cho phiên đăng nhập mới với ID:', req.sessionID);
      
      // Trả về dữ liệu người dùng chi tiết hơn để client có đủ thông tin
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isSeller: user.isSeller,
        isAffiliate: user.isAffiliate
      };
      
      res.status(200).json(userData);
    });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('GET /api/user - Session ID:', req.sessionID);
    console.log('User authenticated?', req.isAuthenticated());
    
    // Kiểm tra header để debug
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    
    if (req.isAuthenticated() && req.user) {
      console.log('User found:', req.user.id, req.user.username);
      
      // Đảm bảo session được cập nhật
      req.session.touch();
      
      // Đặt lại cookie phiên với cấu hình đúng
      if (req.cookies && req.cookies[cookieName]) {
        res.cookie(cookieName, req.sessionID, cookieConfig);
      }
      
      return res.json(req.user);
    } 
    
    return res.status(401).json({ 
      authenticated: false,
      message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục." 
    });
  });
  
  // Endpoint để kiểm tra trạng thái xác thực - đảm bảo phiên đăng nhập giữa frontend và backend
  app.get("/api/auth/status", (req, res) => {
    console.log('🔍 Checking auth status...');
    console.log('🔑 Session ID:', req.sessionID);
    
    // Kiểm tra debug chi tiết về các cookie
    console.log('🌐 Request origin:', req.headers.origin);
    console.log('🍪 Request cookies:', req.headers.cookie);
    console.log('📦 Cookies object:', req.cookies);
    
    try {
      // Kiểm tra xác thực trực tiếp thông qua Passport
      if (req.isAuthenticated() && req.user) {
        console.log('👤 User is logged in:', req.user.username);
        
        // Đảm bảo phiên đăng nhập được giữ lại
        req.session.touch();
        
        // Đặt lại cookie session với cấu hình đúng
        res.cookie(cookieName, req.sessionID, cookieConfig);
        
        // Log thêm thông tin để debug
        console.log('✅ Gửi cookie:', cookieName, 'với session ID:', req.sessionID);
        
        return res.json({ 
          authenticated: true, 
          user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            fullName: req.user.fullName,
            role: req.user.role,
            isSeller: req.user.isSeller,
            isAffiliate: req.user.isAffiliate
          }
        });
      } else {
        console.log('❌ User is not logged in');
        return res.json({ 
          authenticated: false,
          message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục."
        });
      }
    } catch (error) {
      console.error('🔥 Error checking auth status:', error);
      return res.status(500).json({ 
        authenticated: false,
        error: 'Internal server error checking authentication' 
      });
    }
  });

  // Update user profile
  app.put("/api/user/profile", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }
    
    try {
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Become seller
  app.post("/api/user/become-seller", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }
    
    try {
      const user = await storage.updateUser(req.user.id, { 
        isSeller: true,
        role: "seller" 
      });
      
      // Create a shop for the user
      await storage.createShop({
        userId: user.id,
        name: req.body.shopName || `${user.fullName}'s Shop`,
        description: req.body.shopDescription || `Welcome to ${user.fullName}'s Shop`,
        logo: req.body.shopLogo || null,
        banner: req.body.shopBanner || null,
      });
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  // Become affiliate
  app.post("/api/user/become-affiliate", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }
    
    try {
      const user = await storage.updateUser(req.user.id, { 
        isAffiliate: true 
      });
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  });
}
