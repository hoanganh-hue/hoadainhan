/**
 * Script để tạo hình ảnh mẫu cho các sản phẩm đã thêm vào cơ sở dữ liệu
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import axios from 'axios';

// ES modules don't have __dirname, so we need to create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Hình ảnh mẫu từ Placeholder.com
const placeholderBaseUrl = 'https://via.placeholder.com';

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
 * Tải ảnh từ placeholder.com
 */
async function downloadPlaceholderImage(width, height, text, localPath) {
  try {
    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Tạo URL của placeholder image
    const encodedText = encodeURIComponent(text);
    const url = `${placeholderBaseUrl}/${width}x${height}?text=${encodedText}`;
    
    // Tải ảnh
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    // Lưu ảnh
    fs.writeFileSync(localPath, response.data);
    console.log(`Đã tạo ảnh mẫu: ${localPath}`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi tải ảnh mẫu cho ${localPath}:`, error.message);
    return false;
  }
}

/**
 * Tạo ảnh mẫu cho tất cả đường dẫn
 */
async function createPlaceholderImages() {
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
      try {
        // Tách tên sản phẩm từ đường dẫn
        const pathParts = imagePath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const productType = pathParts[pathParts.length - 2] || 'product';
        const category = pathParts[pathParts.length - 3] || 'category';
        
        // Xác định loại sản phẩm để hiển thị trên ảnh
        let displayText;
        if (category === 'phones') {
          displayText = `${productType} Phone`;
        } else {
          displayText = productType;
        }
        
        // Đường dẫn đầy đủ đến tệp ảnh
        const localPath = path.join(publicDir, imagePath);
        
        // Tạo ảnh mẫu
        const result = await downloadPlaceholderImage(640, 480, displayText, localPath);
        if (result) {
          successCount++;
        }
      } catch (error) {
        console.error(`Lỗi khi xử lý đường dẫn ${imagePath}:`, error.message);
      }
    }
    
    console.log(`Đã tạo thành công ${successCount}/${imagePaths.length} ảnh mẫu`);
    
  } catch (error) {
    console.error('Lỗi trong quá trình tạo ảnh mẫu:', error);
  }
}

/**
 * Hàm chính thực thi
 */
async function main() {
  try {
    console.log('===== BẮT ĐẦU TẠO ẢNH MẪU =====');
    
    await createPlaceholderImages();
    
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