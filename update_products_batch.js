/**
 * Script để cập nhật hình ảnh cho một nhóm sản phẩm cụ thể
 * Tập trung vào các sản phẩm Bose và GoPro bị sai danh mục
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
 * Lấy danh sách các sản phẩm cần cập nhật
 */
async function getProductsToUpdate() {
  // Tìm các sản phẩm Bose cần cập nhật
  const boseProducts = await pool.query(`
    SELECT id, name, images 
    FROM products 
    WHERE category_id = 7 
    AND name LIKE '%Bose%' 
    AND (
      array_to_string(images, ',') NOT LIKE '%/audio/%' 
      OR array_length(images, 1) < 3
    )
  `);

  // Tìm các sản phẩm GoPro cần cập nhật
  const goProProducts = await pool.query(`
    SELECT id, name, images 
    FROM products 
    WHERE category_id = 7 
    AND name LIKE '%GoPro%' 
    AND (
      array_to_string(images, ',') NOT LIKE '%/camera/%' 
      OR array_length(images, 1) < 3
    )
  `);

  return {
    bose: boseProducts.rows,
    gopro: goProProducts.rows
  };
}

/**
 * Cập nhật hình ảnh cho sản phẩm
 */
async function updateProductImage(product, category) {
  const productId = product.id;
  const productName = product.name;
  
  console.log(`\nĐang cập nhật hình ảnh cho ${productName} (ID: ${productId})`);
  console.log(`Loại sản phẩm: ${category}`);
  
  // Mảng lưu trữ đường dẫn hình ảnh
  const imagesPaths = [];
  
  // Tải 3 hình ảnh cho sản phẩm
  for (let j = 0; j < 3; j++) {
    const uniqueId = `${productId}_${Date.now()}_${j}`;
    const imageUrl = getPicsumUrl(640, 480, uniqueId);
    
    // Tạo tên file cho hình ảnh
    const fileName = `${category}_${uniqueId}.jpg`;
    const localPath = path.join("public/images/electronics", category, fileName);
    
    try {
      // Tải hình ảnh
      console.log(`Đang tải hình ảnh ${j+1}/3 từ: ${imageUrl}`);
      const downloadSuccess = await downloadImage(imageUrl, localPath);
      
      if (downloadSuccess) {
        // Chuyển đổi đường dẫn để lưu vào cơ sở dữ liệu
        const relativePath = localPath.replace('public', '');
        imagesPaths.push(relativePath);
        console.log(`✓ Đã tải hình ảnh ${j+1}: ${localPath}`);
      } else {
        console.error(`❌ Không thể tải hình ảnh ${j+1} cho ${productName}`);
      }
    } catch (error) {
      console.error(`❌ Lỗi tải hình ảnh ${j+1} cho ${productName}: ${error.message}`);
    }
    
    // Đợi một chút giữa các lần tải
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Cập nhật cơ sở dữ liệu với mảng hình ảnh mới nếu đã tải ít nhất 1 hình ảnh
  if (imagesPaths.length > 0) {
    await pool.query(
      `UPDATE "products" SET "images" = $1 WHERE "id" = $2`,
      [imagesPaths, productId]
    );
    console.log(`✓ Đã cập nhật ${imagesPaths.length} hình ảnh cho ${productName} (ID: ${productId})`);
    return true;
  } else {
    console.error(`❌ Không thể cập nhật hình ảnh cho ${productName} (ID: ${productId})`);
    return false;
  }
}

/**
 * Hàm chính để cập nhật hình ảnh cho sản phẩm
 */
async function updateBatchProducts() {
  try {
    console.log("Bắt đầu cập nhật hình ảnh cho nhóm sản phẩm Bose và GoPro...");
    
    // Tạo thư mục lưu trữ hình ảnh nếu chưa tồn tại
    const baseDir = "public/images/electronics";
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    
    // Các thư mục con
    const subDirs = ["audio", "camera"];
    for (const dir of subDirs) {
      const subDir = path.join(baseDir, dir);
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
    }
    
    // Lấy danh sách sản phẩm cần cập nhật
    const { bose, gopro } = await getProductsToUpdate();
    
    console.log(`Tìm thấy ${bose.length} sản phẩm Bose và ${gopro.length} sản phẩm GoPro cần cập nhật`);
    
    // Cập nhật sản phẩm Bose
    let boseUpdated = 0;
    for (const product of bose) {
      const success = await updateProductImage(product, "audio");
      if (success) boseUpdated++;
      
      // Đợi một chút giữa mỗi sản phẩm
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Cập nhật sản phẩm GoPro
    let goProUpdated = 0;
    for (const product of gopro) {
      const success = await updateProductImage(product, "camera");
      if (success) goProUpdated++;
      
      // Đợi một chút giữa mỗi sản phẩm
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\nKết quả cập nhật:`);
    console.log(`- Đã cập nhật ${boseUpdated}/${bose.length} sản phẩm Bose`);
    console.log(`- Đã cập nhật ${goProUpdated}/${gopro.length} sản phẩm GoPro`);
    console.log(`Tổng cộng: ${boseUpdated + goProUpdated}/${bose.length + gopro.length} sản phẩm`);
    
  } catch (error) {
    console.error(`❌ Lỗi: ${error.message}`);
  } finally {
    await pool.end();
  }
}

// Chạy script
updateBatchProducts().catch(err => {
  console.error('Lỗi khi chạy script:', err);
  process.exit(1);
});