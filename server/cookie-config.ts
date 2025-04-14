/**
 * Cấu hình cookie chung được sử dụng trong toàn bộ ứng dụng
 * Giúp đảm bảo nhất quán giữa các thành phần (auth, session, cookie-parser)
 */

// Tên cookie session
export const cookieName = 'tiktokshop.sid';

// Secret cho cookie và session
export const cookieSecret = process.env.SESSION_SECRET || 'tiktok-shop-secret';

// Cấu hình cookie chuẩn
export const cookieConfig = {
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  secure: process.env.NODE_ENV === 'production', // Sử dụng secure trong production
  httpOnly: true,
  sameSite: 'lax' as 'lax' | 'strict' | 'none' | boolean, // TypeScript cast để tương thích với CookieOptions
  path: '/',
  domain: undefined, // Để domain tự động phát hiện
};