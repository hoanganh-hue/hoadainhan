/**
 * Script để cập nhật hình ảnh cho một danh sách cụ thể các sản phẩm
 * Tập trung vào việc điều chỉnh phân loại hình ảnh theo đúng loại sản phẩm
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Kết nối với PostgreSQL
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const pool = new Pool({ connectionString });

/**
 * Tạo URL hình ảnh với Picsum Photos
 */
function getPicsumUrl(width = 640, height = 480, id) {
  return `https://picsum.photos/${width}/${height}?random=${id}`;
}

/**
 * Tải hình ảnh từ URL và lưu vào đường dẫn cục bộ
 */
async function downloadImage(url, localPath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    // Lưu hình ảnh vào đường dẫn cục bộ
    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', error => {
        console.error('Lỗi ghi file:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Lỗi tải hình ảnh từ ${url}: ${error.message}`);
    return false;
  }
}

/**
 * Xác định danh mục hình ảnh chính xác dựa trên tên sản phẩm và mô tả
 */
function getCorrectCategory(name, shopId) {
  const nameLower = name.toLowerCase();
  
  // Các sản phẩm Bose đều thuộc danh mục audio
  if (nameLower.includes('bose')) {
    return 'audio';
  }
  
  // Các sản phẩm GoPro đều thuộc danh mục camera
  if (nameLower.includes('gopro')) {
    return 'camera';
  }
  
  // Các sản phẩm laptop, máy tính
  if (nameLower.includes('laptop') || 
      nameLower.includes('dell') || 
      nameLower.includes('lenovo') ||
      nameLower.includes('macbook') ||
      nameLower.includes('thinkpad') ||
      nameLower.includes('ideapad') ||
      nameLower.includes('notebook')) {
    return 'laptop';
  }
  
  // Các sản phẩm TV, màn hình
  if (nameLower.includes('tv') ||
      nameLower.includes('television') ||
      nameLower.includes('monitor') ||
      nameLower.includes('màn hình')) {
    return 'tv';
  }
  
  // Các sản phẩm đồng hồ, wearable
  if (nameLower.includes('watch') ||
      nameLower.includes('đồng hồ') ||
      nameLower.includes('fitbit')) {
    return 'wearable';
  }
  
  // Các sản phẩm gaming
  if (nameLower.includes('gaming') ||
      nameLower.includes('playstation') ||
      nameLower.includes('xbox') ||
      nameLower.includes('nintendo')) {
    return 'gaming';
  }
  
  // Mặc định là phụ kiện
  return 'accessories';
}

/**
 * Cập nhật hình ảnh cho một sản phẩm cụ thể
 */
async function updateSpecificProduct(id, category) {
  try {
    // Lấy thông tin sản phẩm
    const { rows } = await pool.query(
      'SELECT id, name FROM products WHERE id = $1',
      [id]
    );
    
    if (rows.length === 0) {
      console.log(`Không tìm thấy sản phẩm có ID ${id}`);
      return false;
    }
    
    const product = rows[0];
    console.log(`\nĐang cập nhật hình ảnh cho sản phẩm: ${product.name} (ID: ${id})`);
    console.log(`Loại hình ảnh: ${category}`);
    
    // Tạo đường dẫn đến thư mục lưu trữ hình ảnh
    const baseDir = path.join('public', 'images', 'electronics', category);
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    
    // Mảng lưu trữ đường dẫn hình ảnh mới
    const imagesPaths = [];
    
    // Tải 3 hình ảnh cho sản phẩm
    for (let i = 0; i < 3; i++) {
      const uniqueId = `${id}_${Date.now()}_${i}`;
      const imageUrl = getPicsumUrl(640, 480, uniqueId);
      
      // Tạo tên file cho hình ảnh
      const fileName = `${category}_${uniqueId}.jpg`;
      const localPath = path.join(baseDir, fileName);
      
      try {
        // Tải hình ảnh
        console.log(`Đang tải hình ảnh ${i+1}/3 từ: ${imageUrl}`);
        const downloadSuccess = await downloadImage(imageUrl, localPath);
        
        if (downloadSuccess) {
          // Chuyển đổi đường dẫn để lưu vào cơ sở dữ liệu
          const relativePath = localPath.replace('public', '');
          imagesPaths.push(relativePath);
          console.log(`✓ Đã tải hình ảnh ${i+1}: ${relativePath}`);
        } else {
          console.error(`❌ Không thể tải hình ảnh ${i+1} cho ${product.name}`);
        }
      } catch (error) {
        console.error(`❌ Lỗi tải hình ảnh ${i+1} cho ${product.name}: ${error.message}`);
      }
      
      // Đợi một chút giữa các lần tải
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Cập nhật cơ sở dữ liệu với mảng hình ảnh mới
    if (imagesPaths.length > 0) {
      await pool.query(
        `UPDATE "products" SET "images" = $1 WHERE "id" = $2`,
        [imagesPaths, id]
      );
      console.log(`✓ Đã cập nhật ${imagesPaths.length} hình ảnh cho ${product.name} (ID: ${id})`);
      return true;
    } else {
      console.error(`❌ Không thể cập nhật hình ảnh cho ${product.name} (ID: ${id})`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật sản phẩm ID ${id}: ${error.message}`);
    return false;
  }
}

async function updateSpecificProducts() {
  try {
    console.log("Bắt đầu cập nhật hình ảnh cho các sản phẩm cụ thể...");
    
    // Danh sách sản phẩm cần cập nhật với ID và loại hình ảnh tương ứng
    const productsToUpdate = [
      // Các sản phẩm Bose còn lại
      { id: 1892, category: 'audio' },  // Bose Frames B18
      { id: 1910, category: 'audio' },  // Bose SoundLink A1 Plus
      { id: 2108, category: 'audio' },  // Bose SoundTouch G2 Ultra
      { id: 2124, category: 'audio' },  // Bose SoundTouch X6 Plus
      { id: 2131, category: 'audio' },  // Bose SoundLink M20 Pro
      { id: 2142, category: 'audio' },  // Bose QuietComfort V9 Ultra
      { id: 2161, category: 'audio' },  // Bose Frames X6 Ultra
      { id: 2170, category: 'audio' },  // Bose SoundTouch B14 X
      
      // Các sản phẩm GoPro
      { id: 1913, category: 'camera' },  // GoPro Karma P16 Max
      { id: 1921, category: 'camera' },  // GoPro Fusion L10 Plus
      { id: 1926, category: 'camera' },  // GoPro GoPro Labs C9 X
      { id: 1997, category: 'camera' },  // GoPro Karma E1 Ultra
      { id: 2008, category: 'camera' },  // GoPro GoPro Labs Y13 Plus
      { id: 2036, category: 'camera' },  // GoPro GoPro Labs O4 Lite
      { id: 2059, category: 'camera' },  // GoPro Session A6 Lite
      { id: 2063, category: 'camera' },  // GoPro MAX P20
      { id: 2103, category: 'camera' },  // GoPro HERO D4 Max
      { id: 2115, category: 'camera' },  // GoPro Karma H11 Plus
      { id: 2165, category: 'camera' },  // GoPro MAX S20
      
      // Một số mẫu sản phẩm trong các danh mục khác để xem hiệu ứng
      { id: 1895, category: 'tv' },      // Samsung QLED U8 X
      { id: 1900, category: 'laptop' },  // HP EliteBook P18 Pro
      { id: 1929, category: 'tv' },      // LG UltraGear T19 Ultra
    ];
    
    // Số lượng sản phẩm đã cập nhật thành công
    let updatedCount = 0;
    
    // Cập nhật từng sản phẩm
    for (const product of productsToUpdate) {
      const success = await updateSpecificProduct(product.id, product.category);
      if (success) {
        updatedCount++;
      }
      
      // Đợi một chút giữa mỗi sản phẩm
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\nĐã cập nhật thành công ${updatedCount}/${productsToUpdate.length} sản phẩm`);
    
  } catch (error) {
    console.error(`❌ Lỗi: ${error.message}`);
  } finally {
    await pool.end();
  }
}

// Chạy script
updateSpecificProducts().catch(err => {
  console.error('Lỗi khi chạy script:', err);
  process.exit(1);
});