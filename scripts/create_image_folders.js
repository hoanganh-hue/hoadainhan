/**
 * Script để tạo và chuẩn bị thư mục hình ảnh cho trang web
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

/**
 * Lấy tất cả đường dẫn hình ảnh từ cơ sở dữ liệu
 */
async function getAllImagePaths() {
  try {
    const { rows } = await pool.query(`
      SELECT id, images FROM products 
      WHERE category_id IN (
        SELECT id FROM categories 
        WHERE slug IN ('dien-thoai', 'dien-tu')
      )
    `);
    
    const imagePaths = [];
    
    rows.forEach(row => {
      if (row.images && Array.isArray(row.images)) {
        row.images.forEach(image => {
          if (image && !imagePaths.includes(image)) {
            imagePaths.push(image);
          }
        });
      }
    });
    
    return imagePaths;
  } catch (error) {
    console.error('Lỗi khi lấy đường dẫn ảnh:', error);
    return [];
  }
}

/**
 * Tạo hình ảnh 1x1 pixel
 */
function createEmptyImage(width, height, color) {
  // Tạo một buffer cho hình ảnh PNG 1x1 pixel
  // Format PNG: 
  // - 8 byte signature
  // - IHDR chunk (header)
  // - IDAT chunk (data)
  // - IEND chunk (end)
  
  // Tạo buffer với kích thước cơ bản cho file PNG nhỏ nhất
  const buffer = Buffer.alloc(70); // Đủ lớn cho PNG 1x1 pixel
  
  // PNG signature
  buffer.write('\x89PNG\r\n\x1a\n', 0);
  
  // IHDR chunk
  buffer.writeUInt32BE(13, 8); // Length of IHDR chunk data
  buffer.write('IHDR', 12); // Chunk type
  buffer.writeUInt32BE(width, 16); // Width
  buffer.writeUInt32BE(height, 20); // Height
  buffer[24] = 8; // Bit depth
  buffer[25] = 2; // Color type (RGB)
  buffer[26] = 0; // Compression method
  buffer[27] = 0; // Filter method
  buffer[28] = 0; // Interlace method
  
  // IHDR CRC placeholder (calculate proper CRC if needed)
  buffer.writeUInt32BE(0, 29);
  
  // IDAT chunk (minimal data for 1x1 pixel)
  buffer.writeUInt32BE(11, 33); // Length of IDAT data
  buffer.write('IDAT', 37); // Chunk type
  
  // Very simple compressed data for 1x1 RGB pixel
  buffer[41] = 0x78; // zlib header
  buffer[42] = 0x9c;
  buffer[43] = 0x63;
  buffer[44] = 0x60;
  buffer[45] = 0x80;
  buffer[46] = 0x00;
  buffer[47] = 0x00;
  buffer[48] = 0x00;
  buffer[49] = 0x04;
  buffer[50] = 0x00;
  buffer[51] = 0x01;
  
  // IDAT CRC placeholder
  buffer.writeUInt32BE(0, 52);
  
  // IEND chunk
  buffer.writeUInt32BE(0, 56); // Length (0)
  buffer.write('IEND', 60); // Chunk type
  buffer.writeUInt32BE(0xAE426082, 64); // CRC for IEND
  
  return buffer;
}

/**
 * Tạo thư mục cho đường dẫn và tạo file ảnh
 */
function createImageAndDirectory(imagePath) {
  try {
    // Đường dẫn đầy đủ
    const publicDir = path.join(__dirname, '..', 'public');
    const fullPath = path.join(publicDir, imagePath);
    
    // Tạo thư mục nếu chưa tồn tại
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Kiếm tra nếu file đã tồn tại
    if (fs.existsSync(fullPath)) {
      return true;
    }
    
    // Tạo file ảnh jpg trống
    const imageBuffer = createEmptyImage(640, 480, '#CCCCCC');
    fs.writeFileSync(fullPath, imageBuffer);
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi tạo ảnh ${imagePath}:`, error.message);
    return false;
  }
}

/**
 * Tạo cấu trúc thư mục và file ảnh
 */
async function createImageStructure() {
  try {
    // Lấy tất cả đường dẫn ảnh
    const imagePaths = await getAllImagePaths();
    console.log(`Tìm thấy ${imagePaths.length} đường dẫn ảnh độc nhất`);
    
    // Chuẩn bị thư mục public
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Xử lý từng đường dẫn
    let successCount = 0;
    
    for (const imagePath of imagePaths) {
      const result = createImageAndDirectory(imagePath);
      if (result) {
        successCount++;
        
        // Log sau mỗi 100 ảnh
        if (successCount % 100 === 0 || successCount === imagePaths.length) {
          console.log(`Đã tạo ${successCount}/${imagePaths.length} ảnh...`);
        }
      }
    }
    
    console.log(`Đã tạo thành công ${successCount}/${imagePaths.length} ảnh và thư mục`);
    
  } catch (error) {
    console.error('Lỗi trong quá trình tạo cấu trúc thư mục và ảnh:', error);
  }
}

/**
 * Tạo một số ảnh mẫu cho điện thoại và điện tử
 */
function createSampleImages() {
  // Tạo thư mục cho ảnh mẫu điện thoại
  const phoneDir = path.join(__dirname, '..', 'public', 'images', 'products', 'phones', 'default');
  if (!fs.existsSync(phoneDir)) {
    fs.mkdirSync(phoneDir, { recursive: true });
  }
  
  // Tạo 10 ảnh mẫu cho điện thoại
  for (let i = 1; i <= 10; i++) {
    const phonePath = path.join(phoneDir, `phone-${i}.jpg`);
    if (!fs.existsSync(phonePath)) {
      const imageBuffer = createEmptyImage(640, 480, '#AACCFF');
      fs.writeFileSync(phonePath, imageBuffer);
    }
  }
  
  // Tạo thư mục cho các loại sản phẩm điện tử
  const types = ['laptop', 'tablet', 'tainghe', 'loa', 'camera', 'dongho'];
  
  types.forEach(type => {
    const typeDir = path.join(__dirname, '..', 'public', 'images', 'products', 'electronics', type);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    // Tạo 5 ảnh mẫu cho mỗi loại
    for (let i = 1; i <= 5; i++) {
      const typePath = path.join(typeDir, `${type}-${i}.jpg`);
      if (!fs.existsSync(typePath)) {
        const imageBuffer = createEmptyImage(640, 480, '#CCFFAA');
        fs.writeFileSync(typePath, imageBuffer);
      }
    }
  });
  
  console.log('Đã tạo các ảnh mẫu cho điện thoại và điện tử');
}

/**
 * Tạo file no-image.jpg
 */
function createNoImage() {
  const noImagePath = path.join(__dirname, '..', 'public', 'images', 'no-image.jpg');
  if (!fs.existsSync(noImagePath)) {
    const imageBuffer = createEmptyImage(640, 480, '#CCCCCC');
    fs.writeFileSync(noImagePath, imageBuffer);
  }
  console.log('Đã tạo file no-image.jpg');
}

/**
 * Cập nhật đường dẫn ảnh trong cơ sở dữ liệu
 */
async function updateImagePaths() {
  try {
    // Lấy sản phẩm điện thoại
    const { rows: phones } = await pool.query(`
      SELECT id, images FROM products 
      WHERE category_id = (SELECT id FROM categories WHERE slug = 'dien-thoai')
    `);
    
    // Lấy sản phẩm điện tử
    const { rows: electronics } = await pool.query(`
      SELECT id, images FROM products 
      WHERE category_id = (SELECT id FROM categories WHERE slug = 'dien-tu')
    `);
    
    // Cập nhật đường dẫn ảnh cho điện thoại
    for (const phone of phones) {
      try {
        // Tạo mảng ảnh mới
        const newImages = [];
        for (let i = 1; i <= 3; i++) {
          newImages.push(`/images/products/phones/default/phone-${Math.floor(Math.random() * 10) + 1}.jpg`);
        }
        
        // Cập nhật vào DB
        await pool.query(`
          UPDATE products 
          SET images = $1 
          WHERE id = $2
        `, [newImages, phone.id]);
      } catch (error) {
        console.error(`Lỗi khi cập nhật ảnh cho sản phẩm điện thoại #${phone.id}:`, error.message);
      }
    }
    
    // Cập nhật đường dẫn ảnh cho điện tử
    for (const electronic of electronics) {
      try {
        const types = ['laptop', 'tablet', 'tainghe', 'loa', 'camera', 'dongho'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Tạo mảng ảnh mới
        const newImages = [];
        for (let i = 1; i <= 3; i++) {
          newImages.push(`/images/products/electronics/${type}/${type}-${Math.floor(Math.random() * 5) + 1}.jpg`);
        }
        
        // Cập nhật vào DB
        await pool.query(`
          UPDATE products 
          SET images = $1 
          WHERE id = $2
        `, [newImages, electronic.id]);
      } catch (error) {
        console.error(`Lỗi khi cập nhật ảnh cho sản phẩm điện tử #${electronic.id}:`, error.message);
      }
    }
    
    console.log(`Đã cập nhật đường dẫn ảnh cho ${phones.length} sản phẩm điện thoại và ${electronics.length} sản phẩm điện tử`);
    
  } catch (error) {
    console.error('Lỗi khi cập nhật đường dẫn ảnh:', error);
  }
}

/**
 * Hàm chính thực thi
 */
async function main() {
  try {
    console.log('===== BẮT ĐẦU TẠO CẤU TRÚC THƯ MỤC VÀ ẢNH =====');
    
    // Tạo ảnh mẫu
    createSampleImages();
    
    // Tạo file no-image.jpg
    createNoImage();
    
    // Cập nhật đường dẫn ảnh trong DB
    await updateImagePaths();
    
    console.log('===== HOÀN THÀNH =====');
    
    // Đóng kết nối database
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi trong quá trình thực thi:', error);
    
    // Đóng kết nối database
    try {
      await pool.end();
    } catch (e) {
      console.error('Lỗi khi đóng kết nối database:', e);
    }
    
    process.exit(1);
  }
}

// Thực thi chương trình
main();