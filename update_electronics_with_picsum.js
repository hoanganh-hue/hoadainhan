/**
 * Script để tạo và gán hình ảnh độc đáo cho 209 sản phẩm điện tử
 * Sử dụng dịch vụ Lorem Picsum để tải hình ảnh
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
 * Xác định danh mục hình ảnh dựa trên tên sản phẩm
 */
function getProductCategory(productName) {
  const lowerName = productName.toLowerCase();
  
  if (lowerName.includes("tv") || lowerName.includes("bravia") || lowerName.includes("qled") || lowerName.includes("smart tv") || lowerName.includes("led") || lowerName.includes("the frame") || lowerName.includes("oled")) {
    return "tv";
  } else if (lowerName.includes("laptop") || lowerName.includes("macbook") || lowerName.includes("book") || lowerName.includes("thinkpad") || lowerName.includes("ideapad") || lowerName.includes("gram") || lowerName.includes("zenbook") || lowerName.includes("dell") || lowerName.includes("asus") || lowerName.includes("lenovo") || lowerName.includes("hp")) {
    return "laptop";
  } else if (lowerName.includes("headphone") || lowerName.includes("earbud") || lowerName.includes("speaker") || lowerName.includes("bose") || lowerName.includes("sound") || lowerName.includes("audio") || lowerName.includes("airpods") || lowerName.includes("earphone")) {
    return "audio";
  } else if (lowerName.includes("camera") || lowerName.includes("gopro") || lowerName.includes("eos") || lowerName.includes("lumix") || lowerName.includes("canon") || lowerName.includes("sony alpha") || lowerName.includes("nikon") || lowerName.includes("dslr")) {
    return "camera";
  } else if (lowerName.includes("home") || lowerName.includes("alexa") || lowerName.includes("echo") || lowerName.includes("google home") || lowerName.includes("thermostat") || lowerName.includes("hue")) {
    return "smarthome";
  } else if (lowerName.includes("watch") || lowerName.includes("band") || lowerName.includes("mi band") || lowerName.includes("apple watch") || lowerName.includes("galaxy watch") || lowerName.includes("fitbit")) {
    return "wearable";
  } else if (lowerName.includes("playstation") || lowerName.includes("xbox") || lowerName.includes("nintendo") || lowerName.includes("gaming") || lowerName.includes("controller") || lowerName.includes("game")) {
    return "gaming";
  } else {
    return "accessories";
  }
}

/**
 * Cập nhật sản phẩm với hình ảnh độc đáo
 */
async function updateProductWithUniqueImages() {
  try {
    console.log("Bắt đầu tạo và gán hình ảnh độc đáo cho sản phẩm điện tử...");
    
    // Lấy tất cả sản phẩm điện tử
    const result = await pool.query(`
      SELECT * FROM "products" 
      WHERE "category_id" = 7 
      ORDER BY "id"
      LIMIT 209
    `);
    
    const products = result.rows;
    console.log(`Tìm thấy ${products.length} sản phẩm điện tử cần cập nhật`);
    
    // Tạo thư mục lưu trữ hình ảnh
    const baseDir = "public/images/electronics";
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    
    // Các thư mục con tương ứng với danh mục
    const subDirs = ["tv", "laptop", "audio", "camera", "smarthome", "wearable", "gaming", "accessories"];
    
    // Tạo các thư mục con nếu chưa tồn tại
    for (const dir of subDirs) {
      const subDir = path.join(baseDir, dir);
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
    }
    
    // Đếm số sản phẩm đã cập nhật
    let updatedProductCount = 0;
    
    // Cập nhật từng sản phẩm
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productName = product.name;
      const productId = product.id;
      
      console.log(`\nĐang xử lý sản phẩm ${i+1}/${products.length}: ${productName} (ID: ${productId})`);
      
      // Xác định danh mục sản phẩm
      const category = getProductCategory(productName);
      
      // Mảng lưu trữ đường dẫn hình ảnh
      const imagesPaths = [];
      
      // Tải 3 hình ảnh khác nhau cho mỗi sản phẩm
      for (let j = 0; j < 3; j++) {
        const uniqueId = `${productId}_${Date.now()}_${j}`;
        const imageUrl = getPicsumUrl(640, 480, uniqueId);
        
        // Tạo tên file cho hình ảnh
        const fileName = `${category}_${uniqueId}.jpg`;
        const localPath = path.join(baseDir, category, fileName);
        
        try {
          // Tải hình ảnh
          console.log(`Đang tải hình ảnh ${j+1}/3 từ: ${imageUrl}`);
          const downloadSuccess = await downloadImage(imageUrl, localPath);
          
          if (downloadSuccess) {
            // Chuyển đổi đường dẫn để lưu vào cơ sở dữ liệu
            const relativePath = localPath.replace('public', '');
            imagesPaths.push(relativePath);
            console.log(`✓ Đã tải hình ảnh ${j+1}/3: ${localPath}`);
          } else {
            console.error(`❌ Không thể tải hình ảnh ${j+1}/3 cho ${productName}`);
          }
        } catch (error) {
          console.error(`❌ Lỗi tải hình ảnh ${j+1}/3 cho ${productName}: ${error.message}`);
        }
        
        // Đợi một chút giữa các lần tải để tránh quá tải server
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Cập nhật cơ sở dữ liệu với mảng hình ảnh mới nếu đã tải ít nhất 1 hình ảnh
      if (imagesPaths.length > 0) {
        await pool.query(
          `UPDATE "products" SET "images" = $1 WHERE "id" = $2`,
          [imagesPaths, productId]
        );
        console.log(`✓ Đã cập nhật ${imagesPaths.length} hình ảnh cho ${productName} (ID: ${productId})`);
        updatedProductCount++;
      } else {
        console.error(`❌ Không thể cập nhật hình ảnh cho ${productName} (ID: ${productId})`);
      }
      
      // Đợi một chút giữa mỗi sản phẩm để tránh quá tải server
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`\nĐã hoàn tất cập nhật hình ảnh cho ${updatedProductCount}/${products.length} sản phẩm điện tử`);
  } catch (error) {
    console.error(`❌ Lỗi: ${error.message}`);
  } finally {
    await pool.end();
  }
}

// Chạy script
updateProductWithUniqueImages().catch(err => {
  console.error('Lỗi khi chạy script:', err);
  process.exit(1);
});