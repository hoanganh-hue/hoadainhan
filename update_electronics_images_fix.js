/**
 * Script đặc biệt để sửa chữa và cập nhật hình ảnh cho sản phẩm điện tử
 * - Đảm bảo tất cả sản phẩm đều có đúng 3 hình ảnh
 * - Đảm bảo hình ảnh khớp với loại sản phẩm (audio, laptop, camera...)
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
 * https://picsum.photos/{width}/{height}?random={id}
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
function getAccurateProductCategory(productName, description = '') {
  const nameLower = productName.toLowerCase();
  const descLower = description ? description.toLowerCase() : '';
  const combinedText = `${nameLower} ${descLower}`;
  
  // Thứ tự ưu tiên: tên sản phẩm trước, mô tả sau
  
  // 1. Camera và GoPro
  if (nameLower.includes('gopro') || 
      nameLower.includes('camera') || 
      nameLower.includes('lumix') || 
      nameLower.includes('canon') || 
      nameLower.includes('nikon') || 
      nameLower.includes('fuji') || 
      nameLower.includes('sony alpha') || 
      combinedText.includes('máy ảnh')) {
    return "camera";
  }
  
  // 2. Audio: loa, tai nghe, Bose, JBL, Sony audio,...
  if (nameLower.includes('bose') || 
      nameLower.includes('jbl') || 
      nameLower.includes('sony wh') || 
      nameLower.includes('sony wf') || 
      nameLower.includes('airpods') || 
      nameLower.includes('sound') || 
      nameLower.includes('audio') || 
      nameLower.includes('speaker') || 
      nameLower.includes('loa') || 
      nameLower.includes('tai nghe') || 
      nameLower.includes('headphone') || 
      nameLower.includes('earbud') || 
      nameLower.includes('beats') || 
      nameLower.includes('sonos')) {
    return "audio";
  }
  
  // 3. Laptop
  if (nameLower.includes('laptop') || 
      nameLower.includes('macbook') || 
      nameLower.includes('thinkpad') || 
      nameLower.includes('zenbook') || 
      nameLower.includes('ideapad') || 
      nameLower.includes('gram') || 
      nameLower.includes('dell') || 
      nameLower.includes('asus') || 
      nameLower.includes('hp ') || 
      (combinedText.includes('notebook') && !combinedText.includes('samsung galaxy note'))) {
    return "laptop";
  }
  
  // 4. TV
  if (nameLower.includes('tv') || 
      nameLower.includes('television') || 
      nameLower.includes('bravia') || 
      nameLower.includes('qled') || 
      nameLower.includes('oled') || 
      nameLower.includes('the frame') || 
      nameLower.includes('smart tv') || 
      nameLower.includes('sony tv') || 
      nameLower.includes('lg tv') || 
      nameLower.includes('samsung tv') || 
      combinedText.includes('tivi') || 
      combinedText.includes('màn hình lớn')) {
    return "tv";
  }
  
  // 5. Wearable
  if (nameLower.includes('watch') || 
      nameLower.includes('band') || 
      nameLower.includes('mi band') || 
      nameLower.includes('apple watch') || 
      nameLower.includes('galaxy watch') || 
      nameLower.includes('fitbit') || 
      nameLower.includes('đồng hồ thông minh') || 
      nameLower.includes('vòng đeo tay')) {
    return "wearable";
  }
  
  // 6. Gaming
  if (nameLower.includes('playstation') || 
      nameLower.includes('ps5') || 
      nameLower.includes('ps4') || 
      nameLower.includes('xbox') || 
      nameLower.includes('nintendo') || 
      nameLower.includes('switch') || 
      nameLower.includes('gaming') || 
      nameLower.includes('controller') || 
      nameLower.includes('tay cầm') ||
      (combinedText.includes('game') && !combinedText.includes('camera'))) {
    return "gaming";
  }
  
  // 7. Smart Home
  if (nameLower.includes('alexa') || 
      nameLower.includes('google home') || 
      nameLower.includes('echo dot') || 
      nameLower.includes('nest') || 
      nameLower.includes('hue') || 
      nameLower.includes('thermostat') || 
      nameLower.includes('smart light') || 
      nameLower.includes('nhà thông minh')) {
    return "smarthome";
  }
  
  // 8. Accessories (mặc định)
  return "accessories";
}

/**
 * Cập nhật hình ảnh cho sản phẩm điện tử
 */
async function fixProductImages() {
  try {
    console.log("Bắt đầu quá trình sửa chữa và cập nhật hình ảnh cho sản phẩm điện tử...");
    
    // Lấy tất cả sản phẩm điện tử
    const result = await pool.query(`
      SELECT id, name, description, images
      FROM products 
      WHERE category_id = 7 
      ORDER BY id
    `);
    
    const products = result.rows;
    console.log(`Tìm thấy ${products.length} sản phẩm điện tử cần kiểm tra và cập nhật`);
    
    // Tạo thư mục lưu trữ hình ảnh
    const baseDir = "public/images/electronics";
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    
    // Các thư mục con
    const subDirs = ["tv", "laptop", "audio", "camera", "smarthome", "wearable", "gaming", "accessories"];
    
    // Tạo các thư mục con nếu chưa tồn tại
    for (const dir of subDirs) {
      const subDir = path.join(baseDir, dir);
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
    }
    
    // Thống kê
    let productsUpdated = 0;
    let productsWithWrongCategory = 0;
    let productsMissingImages = 0;
    
    // Cập nhật từng sản phẩm
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productName = product.name;
      const productId = product.id;
      const description = product.description || '';
      const currentImages = product.images || [];
      
      console.log(`\n[${i+1}/${products.length}] Đang kiểm tra sản phẩm: ${productName} (ID: ${productId})`);
      
      // Xác định danh mục sản phẩm chính xác
      const correctCategory = getAccurateProductCategory(productName, description);
      
      // Kiểm tra xem hình ảnh hiện tại có đúng danh mục không
      let needsUpdate = false;
      let reasonForUpdate = [];
      
      // Kiểm tra số lượng hình ảnh
      if (currentImages.length < 3) {
        needsUpdate = true;
        productsMissingImages++;
        reasonForUpdate.push(`Thiếu hình ảnh (hiện có: ${currentImages.length}/3)`);
      }
      
      // Kiểm tra đúng danh mục
      if (currentImages.length > 0) {
        let hasWrongCategory = false;
        for (const img of currentImages) {
          if (!img.includes(`/${correctCategory}/`)) {
            hasWrongCategory = true;
            break;
          }
        }
        
        if (hasWrongCategory) {
          needsUpdate = true;
          productsWithWrongCategory++;
          reasonForUpdate.push(`Không đúng danh mục (đúng: ${correctCategory})`);
        }
      }
      
      // Nếu cần cập nhật
      if (needsUpdate) {
        console.log(`⚠️ Cần cập nhật: ${reasonForUpdate.join(', ')}`);
        
        // Mảng lưu trữ đường dẫn hình ảnh mới
        const newImagesPaths = [];
        
        // Tải 3 hình ảnh mới cho sản phẩm
        for (let j = 0; j < 3; j++) {
          const uniqueId = `${productId}_${Date.now()}_${j}`;
          const imageUrl = getPicsumUrl(640, 480, uniqueId);
          
          // Tạo tên file cho hình ảnh
          const fileName = `${correctCategory}_${uniqueId}.jpg`;
          const localPath = path.join(baseDir, correctCategory, fileName);
          
          try {
            // Tải hình ảnh
            console.log(`   Đang tải hình ảnh ${j+1}/3 từ: ${imageUrl}`);
            const downloadSuccess = await downloadImage(imageUrl, localPath);
            
            if (downloadSuccess) {
              // Chuyển đổi đường dẫn để lưu vào cơ sở dữ liệu
              const relativePath = localPath.replace('public', '');
              newImagesPaths.push(relativePath);
              console.log(`   ✓ Đã tải: ${localPath}`);
            } else {
              console.error(`   ❌ Không thể tải hình ảnh ${j+1}/3 cho ${productName}`);
            }
          } catch (error) {
            console.error(`   ❌ Lỗi tải hình ảnh ${j+1}/3 cho ${productName}: ${error.message}`);
          }
          
          // Đợi một chút giữa các lần tải
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Cập nhật cơ sở dữ liệu với mảng hình ảnh mới nếu đã tải ít nhất 1 hình ảnh
        if (newImagesPaths.length > 0) {
          await pool.query(
            `UPDATE "products" SET "images" = $1 WHERE "id" = $2`,
            [newImagesPaths, productId]
          );
          console.log(`✓ Đã cập nhật ${newImagesPaths.length} hình ảnh mới cho ${productName} (ID: ${productId})`);
          productsUpdated++;
        } else {
          console.error(`❌ Không thể cập nhật hình ảnh cho ${productName} (ID: ${productId})`);
        }
      } else {
        console.log(`✓ Sản phẩm đã có đủ hình ảnh và đúng danh mục (${correctCategory})`);
      }
      
      // Đợi một chút giữa mỗi sản phẩm
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n=== BÁO CÁO TỔNG KẾT ===`);
    console.log(`Tổng số sản phẩm kiểm tra: ${products.length}`);
    console.log(`Số sản phẩm cần cập nhật: ${productsUpdated}`);
    console.log(`- Sản phẩm thiếu hình ảnh: ${productsMissingImages}`);
    console.log(`- Sản phẩm không đúng danh mục: ${productsWithWrongCategory}`);
    console.log(`Số sản phẩm đã có đủ hình ảnh và đúng danh mục: ${products.length - productsUpdated}`);
    
  } catch (error) {
    console.error(`❌ Lỗi: ${error.message}`);
  } finally {
    await pool.end();
  }
}

// Chạy script
fixProductImages().catch(err => {
  console.error('Lỗi khi chạy script:', err);
  process.exit(1);
});