import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules don't have __dirname, so we need to create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Các hình ảnh cho các sản phẩm
const phoneImages = {
  // Hình ảnh từ server của chúng ta
  localImages: [
    { pattern: 'iPhone 14 Pro Max', url: '/images/phones/phone_1.jpg' },
    { pattern: 'iPhone 13', url: '/images/phones/phone_2.jpg' },
    { pattern: 'Galaxy S23', url: '/images/phones/phone_3.jpg' }
  ],
  // Hình ảnh dự phòng cho các nhãn hiệu
  brandFallbacks: [
    { pattern: 'iPhone', url: '/images/products/product_sample_1.jpg' },
    { pattern: 'Samsung', url: '/images/products/product_sample_5.jpg' },
    { pattern: 'Xiaomi', url: '/images/products/product_sample_4.jpg' },
    { pattern: 'OPPO', url: '/images/products/product_sample_6.jpg' },
    { pattern: 'Vivo', url: '/images/products/product_sample_3.jpg' },
    { pattern: 'realme', url: '/images/products/product_sample_6.jpg' }
  ]
};

async function updatePhoneImages() {
  try {
    console.log('Bắt đầu cập nhật hình ảnh cho tất cả sản phẩm điện thoại...');
    
    // 1. Lấy tất cả sản phẩm điện thoại
    const { rows: phoneProducts } = await pool.query(
      "SELECT id, name, images FROM products WHERE category_id = 3"
    );
    
    console.log(`Tìm thấy ${phoneProducts.length} sản phẩm điện thoại`);
    
    let updatedCount = 0;
    
    // 2. Cập nhật từng sản phẩm
    for (const product of phoneProducts) {
      // Kiểm tra xem sản phẩm đã có URL hình ảnh cục bộ chưa
      if (Array.isArray(product.images) && 
          product.images.length > 0 && 
          typeof product.images[0] === 'string' &&
          (product.images[0].startsWith('/images/phones/') || 
           product.images[0].startsWith('/images/products/'))) {
        console.log(`Sản phẩm #${product.id} đã có hình ảnh cục bộ: ${product.images[0]}`);
        continue;
      }
      
      // Tìm URL hình ảnh phù hợp
      let imageUrl = null;
      
      // Đầu tiên kiểm tra với tên sản phẩm cụ thể
      for (const image of phoneImages.localImages) {
        if (product.name.includes(image.pattern)) {
          imageUrl = image.url;
          break;
        }
      }
      
      // Nếu không tìm thấy, sử dụng dự phòng theo thương hiệu
      if (!imageUrl) {
        for (const brand of phoneImages.brandFallbacks) {
          if (product.name.includes(brand.pattern)) {
            imageUrl = brand.url;
            break;
          }
        }
      }
      
      // Nếu vẫn không tìm thấy, sử dụng hình ảnh mặc định
      if (!imageUrl) {
        imageUrl = '/images/products/product_sample_1.jpg';
      }
      
      // Cập nhật hình ảnh trong cơ sở dữ liệu
      await pool.query(
        "UPDATE products SET images = ARRAY[$1] WHERE id = $2",
        [imageUrl, product.id]
      );
      
      console.log(`Đã cập nhật hình ảnh cho sản phẩm #${product.id}: ${product.name} -> ${imageUrl}`);
      updatedCount++;
    }
    
    console.log(`Hoàn thành cập nhật ${updatedCount} sản phẩm điện thoại với hình ảnh cục bộ`);
  } catch (error) {
    console.error('Lỗi khi cập nhật hình ảnh sản phẩm:', error);
  } finally {
    await pool.end();
  }
}

updatePhoneImages();