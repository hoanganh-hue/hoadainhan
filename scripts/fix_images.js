/**
 * Script đơn giản để tạo hình ảnh mẫu và cập nhật đường dẫn
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

// ES modules don't have __dirname, so we need to create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tạo thư mục ảnh nếu chưa có
const publicDir = path.join(__dirname, '..', 'public');
const imagesDir = path.join(publicDir, 'images');
const productsDir = path.join(imagesDir, 'products');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir);

// Tạo các thư mục con
const phonesDir = path.join(productsDir, 'phones');
const electronicsDir = path.join(productsDir, 'electronics');

if (!fs.existsSync(phonesDir)) fs.mkdirSync(phonesDir);
if (!fs.existsSync(electronicsDir)) fs.mkdirSync(electronicsDir);

// Tạo 1 pixel JPG
const createJpgPixel = () => {
  // Thông tin JPEG header cơ bản
  const header = Buffer.from([
    0xFF, 0xD8,                     // SOI marker
    0xFF, 0xE0,                     // APP0 marker
    0x00, 0x10,                     // Length of APP0
    0x4A, 0x46, 0x49, 0x46, 0x00,   // JFIF identifier
    0x01, 0x01,                     // JFIF version
    0x00,                           // Units (0 = no units)
    0x00, 0x01,                     // X density
    0x00, 0x01,                     // Y density
    0x00, 0x00,                     // Thumbnail width, height
    
    0xFF, 0xDB,                     // DQT marker
    0x00, 0x43,                     // Length of DQT
    0x00                            // Precision and table ID
  ]);
  
  // Quantization table (65 bytes including the first byte above)
  const quantTable = Buffer.alloc(64).fill(1);
  
  // SOF0 marker (Start of Frame)
  const sof = Buffer.from([
    0xFF, 0xC0,                     // SOF0 marker
    0x00, 0x11,                     // Length of SOF0
    0x08,                           // Data precision
    0x00, 0x01,                     // Image height
    0x00, 0x01,                     // Image width
    0x01,                           // Number of components
    0x01, 0x11, 0x00                // Component information
  ]);
  
  // DHT marker (Define Huffman Table)
  const dht = Buffer.from([
    0xFF, 0xC4,                     // DHT marker
    0x00, 0x14,                     // Length of DHT
    0x00,                           // Table ID and type
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00
  ]);
  
  // SOS marker (Start of Scan)
  const sos = Buffer.from([
    0xFF, 0xDA,                     // SOS marker
    0x00, 0x0C,                     // Length of SOS
    0x01,                           // Number of components
    0x01, 0x00,                     // Component information
    0x00, 0x00, 0x00,               // Other parameters
    0x00, 0x00                      // Image data (simplified)
  ]);
  
  // EOI marker (End of Image)
  const eoi = Buffer.from([0xFF, 0xD9]);
  
  // Combine all parts
  return Buffer.concat([header, quantTable, sof, dht, sos, eoi]);
};

// Tạo ảnh mẫu
const phoneImage = createJpgPixel();
const electronicsImage = createJpgPixel();

// Tạo ảnh mẫu cho các danh mục
async function createSampleImages() {
  // Tạo thư mục và ảnh mẫu điện thoại
  const phoneDefaultDir = path.join(phonesDir, 'default');
  if (!fs.existsSync(phoneDefaultDir)) fs.mkdirSync(phoneDefaultDir);
  
  // Tạo ảnh cho điện thoại
  for (let i = 1; i <= 5; i++) {
    const phoneFile = path.join(phoneDefaultDir, `phone-${i}.jpg`);
    if (!fs.existsSync(phoneFile)) {
      fs.writeFileSync(phoneFile, phoneImage);
    }
  }
  
  // Tạo các thư mục mẫu cho điện tử
  const categories = ['laptop', 'tablet', 'headphone', 'speaker', 'camera', 'watch'];
  
  for (const category of categories) {
    const categoryDir = path.join(electronicsDir, category);
    if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir);
    
    // Tạo ảnh cho mỗi danh mục
    for (let i = 1; i <= 5; i++) {
      const electronicFile = path.join(categoryDir, `${category}-${i}.jpg`);
      if (!fs.existsSync(electronicFile)) {
        fs.writeFileSync(electronicFile, electronicsImage);
      }
    }
  }
  
  console.log('Đã tạo ảnh mẫu cho điện thoại và điện tử');
}

// Cập nhật đường dẫn ảnh trong database
async function updateImagePaths() {
  // Cập nhật ảnh cho điện thoại
  await pool.query(`
    UPDATE products 
    SET images = ARRAY[
      '/images/products/phones/default/phone-1.jpg',
      '/images/products/phones/default/phone-2.jpg',
      '/images/products/phones/default/phone-3.jpg'
    ]
    WHERE category_id = (SELECT id FROM categories WHERE slug = 'dien-thoai')
  `);
  
  // Cập nhật ảnh cho điện tử - laptop
  await pool.query(`
    UPDATE products 
    SET images = ARRAY[
      '/images/products/electronics/laptop/laptop-1.jpg',
      '/images/products/electronics/laptop/laptop-2.jpg',
      '/images/products/electronics/laptop/laptop-3.jpg'
    ]
    WHERE category_id = (SELECT id FROM categories WHERE slug = 'dien-tu')
    AND id % 6 = 0
  `);
  
  // Cập nhật ảnh cho điện tử - tablet
  await pool.query(`
    UPDATE products 
    SET images = ARRAY[
      '/images/products/electronics/tablet/tablet-1.jpg',
      '/images/products/electronics/tablet/tablet-2.jpg',
      '/images/products/electronics/tablet/tablet-3.jpg'
    ]
    WHERE category_id = (SELECT id FROM categories WHERE slug = 'dien-tu')
    AND id % 6 = 1
  `);
  
  // Cập nhật ảnh cho điện tử - headphone
  await pool.query(`
    UPDATE products 
    SET images = ARRAY[
      '/images/products/electronics/headphone/headphone-1.jpg',
      '/images/products/electronics/headphone/headphone-2.jpg',
      '/images/products/electronics/headphone/headphone-3.jpg'
    ]
    WHERE category_id = (SELECT id FROM categories WHERE slug = 'dien-tu')
    AND id % 6 = 2
  `);
  
  // Cập nhật ảnh cho điện tử - speaker
  await pool.query(`
    UPDATE products 
    SET images = ARRAY[
      '/images/products/electronics/speaker/speaker-1.jpg',
      '/images/products/electronics/speaker/speaker-2.jpg',
      '/images/products/electronics/speaker/speaker-3.jpg'
    ]
    WHERE category_id = (SELECT id FROM categories WHERE slug = 'dien-tu')
    AND id % 6 = 3
  `);
  
  // Cập nhật ảnh cho điện tử - camera
  await pool.query(`
    UPDATE products 
    SET images = ARRAY[
      '/images/products/electronics/camera/camera-1.jpg',
      '/images/products/electronics/camera/camera-2.jpg',
      '/images/products/electronics/camera/camera-3.jpg'
    ]
    WHERE category_id = (SELECT id FROM categories WHERE slug = 'dien-tu')
    AND id % 6 = 4
  `);
  
  // Cập nhật ảnh cho điện tử - watch
  await pool.query(`
    UPDATE products 
    SET images = ARRAY[
      '/images/products/electronics/watch/watch-1.jpg',
      '/images/products/electronics/watch/watch-2.jpg',
      '/images/products/electronics/watch/watch-3.jpg'
    ]
    WHERE category_id = (SELECT id FROM categories WHERE slug = 'dien-tu')
    AND id % 6 = 5
  `);
  
  console.log('Đã cập nhật đường dẫn ảnh trong cơ sở dữ liệu');
}

// Hàm chính
async function main() {
  try {
    console.log('===== BẮT ĐẦU TẠO VÀ CẬP NHẬT HÌNH ẢNH =====');
    
    // Tạo ảnh mẫu
    await createSampleImages();
    
    // Cập nhật đường dẫn trong database
    await updateImagePaths();
    
    console.log('===== HOÀN THÀNH =====');
    
    // Đóng kết nối
    await pool.end();
    
  } catch (error) {
    console.error('Lỗi:', error);
    
    try {
      await pool.end();
    } catch (e) {
      console.error('Lỗi khi đóng kết nối database:', e);
    }
  }
}

// Thực thi
main();