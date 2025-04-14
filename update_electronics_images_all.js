/**
 * Script để cập nhật hình ảnh cho tất cả sản phẩm điện tử, đảm bảo mỗi sản phẩm có nhiều hình ảnh
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

// Danh sách URL hình ảnh sản phẩm điện tử chất lượng cao
const ELECTRONICS_IMAGES = [
  // TV & Màn hình (0-4)
  "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1000",
  "https://images.unsplash.com/photo-1601944179066-29786cb9d32a?q=80&w=1000", 
  "https://images.unsplash.com/photo-1467293622093-9f15c96be70f?q=80&w=1000",
  "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1000",
  "https://images.unsplash.com/photo-1599493758267-c6c884c7071f?q=80&w=1000",
  
  // Laptop (5-9)
  "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?q=80&w=1000",
  "https://images.unsplash.com/photo-1575909812264-6902b55846ad?q=80&w=1000",
  "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000",
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1000",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000",
  
  // Audio (10-14)
  "https://images.unsplash.com/photo-1577174881658-0f30ed549aad?q=80&w=1000",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000",
  "https://images.unsplash.com/photo-1564424224827-cd24b8915874?q=80&w=1000",
  "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1000",
  
  // Máy ảnh (15-19)
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000",
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1000",
  "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?q=80&w=1000",
  "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=1000",
  "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?q=80&w=1000",
  
  // Smart Home (20-24)
  "https://images.unsplash.com/photo-1558002038-1055e2de7dcd?q=80&w=1000",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000",
  "https://images.unsplash.com/photo-1550029402-226115b7c579?q=80&w=1000",
  "https://images.unsplash.com/photo-1586791701103-351652650558?q=80&w=1000",
  "https://images.unsplash.com/photo-1583000058351-8a0fdc0aa07c?q=80&w=1000",
  
  // Wearable (25-29)
  "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1000",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000",
  "https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=1000",
  "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=1000",
  "https://images.unsplash.com/photo-1617043786394-11456904d12a?q=80&w=1000",
  
  // Gaming (30-34)
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1000",
  "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?q=80&w=1000",
  "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1000", 
  "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?q=80&w=1000",
  "https://images.unsplash.com/photo-1608111283150-6acfc0754397?q=80&w=1000",
  
  // Accessories (35-39)
  "https://images.unsplash.com/photo-1588058365548-9ded1f5b1b52?q=80&w=1000",
  "https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=1000",
  "https://images.unsplash.com/photo-1625231334168-35067f8a3cbc?q=80&w=1000",
  "https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=1000",
  "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=1000"
];

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
 * Cập nhật hình ảnh cho tất cả sản phẩm điện tử
 */
async function updateAllElectronicsImages() {
  try {
    console.log("Bắt đầu cập nhật hình ảnh cho tất cả sản phẩm điện tử...");
    
    // Lấy tất cả sản phẩm điện tử
    const result = await pool.query(`
      SELECT * FROM "products" 
      WHERE "category_id" = 7 
      ORDER BY "id"
    `);
    
    const products = result.rows;
    console.log(`Tìm thấy ${products.length} sản phẩm điện tử cần kiểm tra`);
    
    // Tạo thư mục lưu trữ hình ảnh nếu chưa tồn tại
    const baseDir = "public/images/electronics";
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    
    // Các danh mục con để tổ chức hình ảnh
    const subDirs = ["tv", "laptop", "audio", "camera", "smarthome", "wearable", "gaming", "accessories"];
    for (const dir of subDirs) {
      const subDir = path.join(baseDir, dir);
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
    }
    
    // Số sản phẩm cần cập nhật và số sản phẩm đã cập nhật
    let updateCount = 0;
    
    // Cập nhật từng sản phẩm
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productName = product.name;
      
      console.log(`Đang kiểm tra sản phẩm ${i+1}/${products.length}: ${productName} (ID: ${product.id})`);
      
      // Kiểm tra xem sản phẩm đã có nhiều hình ảnh chưa
      if (!product.images || product.images.length < 3) {
        console.log(`Sản phẩm ${productName} cần được cập nhật với nhiều hình ảnh hơn`);
        updateCount++;
        
        // Xác định loại sản phẩm để lưu vào thư mục phù hợp
        let productTypeFolder = "accessories"; // Mặc định
        const lowerName = productName.toLowerCase();
        
        if (lowerName.includes("tv") || lowerName.includes("bravia") || lowerName.includes("qled")) {
          productTypeFolder = "tv";
        } else if (lowerName.includes("laptop") || lowerName.includes("book") || lowerName.includes("pad")) {
          productTypeFolder = "laptop";
        } else if (lowerName.includes("headphone") || lowerName.includes("earbud") || lowerName.includes("speaker")) {
          productTypeFolder = "audio";
        } else if (lowerName.includes("camera") || lowerName.includes("eos") || lowerName.includes("lumix")) {
          productTypeFolder = "camera";
        } else if (lowerName.includes("home") || lowerName.includes("hue") || lowerName.includes("alexa")) {
          productTypeFolder = "smarthome";
        } else if (lowerName.includes("watch") || lowerName.includes("band") || lowerName.includes("fit")) {
          productTypeFolder = "wearable";
        } else if (lowerName.includes("playstation") || lowerName.includes("xbox") || lowerName.includes("gaming")) {
          productTypeFolder = "gaming";
        }
        
        // Mảng lưu trữ đường dẫn hình ảnh
        const imagesPaths = [];
        
        // Giữ lại hình ảnh hiện có nếu có
        if (product.images && product.images.length > 0) {
          for (const img of product.images) {
            imagesPaths.push(img);
          }
          console.log(`Đã giữ lại ${product.images.length} hình ảnh hiện có`);
        }
        
        // Số lượng hình ảnh cần thêm
        const additionalImagesNeeded = 3 - imagesPaths.length;
        
        if (additionalImagesNeeded > 0) {
          console.log(`Cần thêm ${additionalImagesNeeded} hình ảnh cho sản phẩm này`);
          
          // Chọn chỉ số hình ảnh phù hợp với loại sản phẩm
          const additionalImagesIndexes = [];
          for (let j = 0; j < additionalImagesNeeded; j++) {
            let additionalImageIndex;
            switch(productTypeFolder) {
              case "tv": additionalImageIndex = Math.floor(Math.random() * 5); break;
              case "laptop": additionalImageIndex = 5 + Math.floor(Math.random() * 5); break;
              case "audio": additionalImageIndex = 10 + Math.floor(Math.random() * 5); break;
              case "camera": additionalImageIndex = 15 + Math.floor(Math.random() * 5); break;
              case "smarthome": additionalImageIndex = 20 + Math.floor(Math.random() * 5); break;
              case "wearable": additionalImageIndex = 25 + Math.floor(Math.random() * 5); break;
              case "gaming": additionalImageIndex = 30 + Math.floor(Math.random() * 5); break;
              case "accessories": additionalImageIndex = 35 + Math.floor(Math.random() * 5); break;
            }
            if (!additionalImagesIndexes.includes(additionalImageIndex)) {
              additionalImagesIndexes.push(additionalImageIndex);
            } else {
              // Nếu chỉ số đã tồn tại, thử lại với chỉ số khác
              j--;
            }
          }
          
          // Tải thêm hình ảnh bổ sung
          for (let j = 0; j < additionalImagesIndexes.length; j++) {
            const additionalImageUrl = ELECTRONICS_IMAGES[additionalImagesIndexes[j]];
            const additionalFileName = `${productTypeFolder}_${Date.now()}_${i}_${j+1}.jpg`;
            const additionalLocalPath = path.join(baseDir, productTypeFolder, additionalFileName);
            
            try {
              const downloadSuccess = await downloadImage(additionalImageUrl, additionalLocalPath);
              if (downloadSuccess) {
                const additionalRelativePath = additionalLocalPath.replace('public', '');
                imagesPaths.push(additionalRelativePath);
                console.log(`✓ Đã tải hình ảnh bổ sung: ${additionalLocalPath}`);
              }
            } catch (error) {
              console.error(`❌ Lỗi tải hình ảnh bổ sung: ${error.message}`);
            }
          }
          
          // Cập nhật cơ sở dữ liệu với mảng hình ảnh mới
          await pool.query(
            `UPDATE "products" SET "images" = $1 WHERE "id" = $2`,
            [imagesPaths, product.id]
          );
          console.log(`✓ Đã cập nhật hình ảnh cho ${productName} (ID: ${product.id})`);
        }
      }
    }
    
    console.log(`Đã hoàn tất cập nhật hình ảnh cho ${updateCount} sản phẩm điện tử`);
  } catch (error) {
    console.error(`❌ Lỗi: ${error.message}`);
  } finally {
    await pool.end();
  }
}

// Chạy script
updateAllElectronicsImages().catch(err => {
  console.error('Lỗi khi chạy script:', err);
  process.exit(1);
});