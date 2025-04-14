import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Sử dụng cấu hình từ module cookie-config
import { cookieSecret } from './cookie-config';
app.use(cookieParser(cookieSecret)); // Parse cookies with the same secret as session
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// Cấu hình CORS để cho phép các requests
app.use((req, res, next) => {
  // Log để debug với emoji để dễ theo dõi
  console.log('🌐 Request origin:', req.headers.origin);
  console.log('🍪 Request cookies:', req.headers.cookie);
  
  // Lấy origin từ request headers
  const origin = req.headers.origin;
  
  // Cho phép cài đặt Access-Control-Allow-Origin nếu origin tồn tại
  // Cài đặt giá trị cụ thể thay vì wildcard để cookies hoạt động
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ Cho phép CORS từ origin: ${origin}`);
  } else {
    // Trong trường hợp không có origin (yêu cầu trực tiếp), cho phép localhost
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
    console.log('⚠️ Origin không được cung cấp, sử dụng localhost mặc định');
  }
  
  // Cài đặt các header cần thiết cho CORS
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, Set-Cookie');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  
  // Quan trọng: Cho phép gửi cookies qua CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Xử lý preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Giá trị tính bằng giây (1 ngày)
    return res.sendStatus(204); // No content
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
