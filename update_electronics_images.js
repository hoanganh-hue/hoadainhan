/**
 * Script để tải hình ảnh sản phẩm điện tử từ Pexels API và cập nhật vào database
 * 
 * Script này sẽ:
 * 1. Lấy danh sách sản phẩm điện tử theo loại từ database
 * 2. Tìm kiếm hình ảnh phù hợp từ Pexels API
 * 3. Tải và lưu hình ảnh vào thư mục public
 * 4. Cập nhật đường dẫn hình ảnh trong database
 */

import { db } from './server/db.js';
import { products } from './shared/schema.js';
import { eq, like } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { createClient } from 'pexels';

// Cấu hình API và đường dẫn lưu trữ
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const IMAGES_BASE_DIR = './public/images';
const ELECTRONICS_DIR = path.join(IMAGES_BASE_DIR, 'products/electronics');

// Định nghĩa các loại sản phẩm điện tử và từ khóa tìm kiếm
const PRODUCT_TYPES = {
  laptop: {
    keywords: ['laptop macbook', 'laptop modern', 'laptop professional', 'laptop gaming'],
    directory: 'laptop'
  },
  tablet: {
    keywords: ['tablet ipad', 'tablet android', 'tablet modern'],
    directory: 'tablet'
  },
  headphone: {
    keywords: ['headphones wireless', 'headphones modern', 'headphones studio'],
    directory: 'headphone'
  },
  camera: {
    keywords: ['camera dslr', 'camera mirrorless', 'camera professional'],
    directory: 'camera'
  },
  smartwatch: {
    keywords: ['smartwatch modern', 'smartwatch apple', 'smartwatch fitness'],
    directory: 'smartwatch'
  },
  speaker: {
    keywords: ['speaker bluetooth', 'speaker wireless', 'speaker modern'],
    directory: 'speaker'
  }
};

// Khởi tạo Pexels client
const pexelsClient = createClient(PEXELS_API_KEY);

/**
 * Đảm bảo thư mục tồn tại
 */
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Đã tạo thư mục: ${directory}`);
  }
}

/**
 * Tải và lưu hình ảnh từ URL
 */
async function downloadImage(url, filePath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(filePath);
    
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', () => {
        console.log(`✅ Đã tải hình ảnh: ${filePath}`);
        resolve(filePath);
      });
      writer.on('error', (err) => {
        console.error(`❌ Lỗi khi tải hình ảnh: ${filePath}`, err);
        reject(err);
      });
    });
  } catch (error) {
    console.error(`❌ Lỗi khi tải hình ảnh từ ${url}:`, error);
    throw error;
  }
}

/**
 * Tìm kiếm hình ảnh từ Pexels API
 */
async function searchPexelsImages(query, perPage = 3) {
  try {
    console.log(`🔍 Tìm kiếm hình ảnh với từ khóa: "${query}"`);
    const response = await pexelsClient.photos.search({ 
      query, 
      per_page: perPage
    });
    
    if (response.photos && response.photos.length > 0) {
      console.log(`✅ Tìm thấy ${response.photos.length} hình ảnh cho "${query}"`);
      return response.photos;
    } else {
      console.log(`❌ Không tìm thấy hình ảnh nào cho "${query}"`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Lỗi khi tìm kiếm hình ảnh từ Pexels:`, error);
    throw error;
  }
}

/**
 * Xác định loại sản phẩm từ tên sản phẩm
 */
function detectProductType(productName) {
  productName = productName.toLowerCase();
  
  if (productName.includes('laptop') || productName.includes('macbook') || 
      productName.includes('notebook') || productName.includes('zenbook') || 
      productName.includes('thinkpad') || productName.includes('legion')) {
    return 'laptop';
  }
  
  if (productName.includes('ipad') || productName.includes('tablet') || 
      productName.includes('galaxy tab') || productName.includes('pixel tablet')) {
    return 'tablet';
  }
  
  if (productName.includes('airpods') || productName.includes('headphone') || 
      productName.includes('earbuds') || productName.includes('tai nghe')) {
    return 'headphone';
  }
  
  if (productName.includes('camera') || productName.includes('máy ảnh') || 
      productName.includes('dslr') || productName.includes('mirrorless')) {
    return 'camera';
  }
  
  if (productName.includes('watch') || productName.includes('apple watch') || 
      productName.includes('smartwatch') || productName.includes('đồng hồ')) {
    return 'smartwatch';
  }
  
  if (productName.includes('speaker') || productName.includes('loa') || 
      productName.includes('soundbar') || productName.includes('âm thanh')) {
    return 'speaker';
  }
  
  return 'other';
}

/**
 * Lấy danh sách sản phẩm điện tử theo loại
 */
async function getElectronicsProductsByType(productType) {
  try {
    // Chuẩn bị các từ khóa tìm kiếm dựa trên loại sản phẩm
    const keywords = [];
    
    switch (productType) {
      case 'laptop':
        keywords.push('laptop', 'macbook', 'notebook', 'zenbook', 'thinkpad', 'legion');
        break;
      case 'tablet':
        keywords.push('ipad', 'tablet', 'galaxy tab');
        break;
      case 'headphone':
        keywords.push('airpods', 'headphone', 'earbuds', 'tai nghe');
        break;
      case 'camera':
        keywords.push('camera', 'máy ảnh', 'dslr', 'mirrorless');
        break;
      case 'smartwatch':
        keywords.push('watch', 'smartwatch', 'đồng hồ');
        break;
      case 'speaker':
        keywords.push('speaker', 'loa', 'soundbar', 'âm thanh');
        break;
    }
    
    // Xây dựng câu truy vấn OR cho các từ khóa
    const productsOfType = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, 7))
      .where(query => {
        let conditions = keywords.map(keyword => 
          like(products.name, `%${keyword}%`)
        );
        return conditions.reduce((acc, condition) => acc.or(condition));
      })
      .limit(10); // Giới hạn 10 sản phẩm mỗi loại để tránh timeout
    
    console.log(`✅ Tìm thấy ${productsOfType.length} sản phẩm ${productType} trong database`);
    return productsOfType;
  } catch (error) {
    console.error(`❌ Lỗi khi lấy danh sách sản phẩm ${productType}:`, error);
    throw error;
  }
}

/**
 * Tạo tên file hình ảnh duy nhất
 */
function createImageFileName(productType, productName, index, photoId) {
  const sanitizedName = productName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 30); // Giới hạn độ dài tên file
  
  return `${productType}-${sanitizedName}-${photoId}-${index + 1}.jpg`;
}

/**
 * Tải và lưu hình ảnh cho một sản phẩm điện tử
 */
async function downloadProductImages(product, productType) {
  try {
    const productName = product.name;
    const typeConfig = PRODUCT_TYPES[productType];
    
    if (!typeConfig) {
      console.log(`❌ Loại sản phẩm không hỗ trợ: ${productType}`);
      return null;
    }
    
    console.log(`\n📱 Đang xử lý sản phẩm: ${productName} (${productType})`);
    
    // Chọn một từ khóa ngẫu nhiên từ danh sách từ khóa cho loại sản phẩm
    const randomKeywordIndex = Math.floor(Math.random() * typeConfig.keywords.length);
    const searchTerm = typeConfig.keywords[randomKeywordIndex];
    
    // Tìm kiếm hình ảnh từ Pexels
    const photos = await searchPexelsImages(searchTerm);
    
    if (photos.length === 0) {
      console.log(`❌ Không tìm thấy hình ảnh cho sản phẩm: ${productName}`);
      return null;
    }
    
    // Tạo thư mục lưu trữ cho loại sản phẩm
    const typeDir = path.join(ELECTRONICS_DIR, typeConfig.directory);
    ensureDirectoryExists(typeDir);
    
    // Tải và lưu các hình ảnh
    const imagePaths = [];
    
    for (let i = 0; i < Math.min(photos.length, 3); i++) {
      const photo = photos[i];
      const imageUrl = photo.src.large; // Sử dụng kích thước large để tối ưu tốc độ tải
      const fileName = createImageFileName(productType, productName, i, photo.id);
      const filePath = path.join(typeDir, fileName);
      const publicPath = `/images/products/electronics/${typeConfig.directory}/${fileName}`;
      
      await downloadImage(imageUrl, filePath);
      imagePaths.push(publicPath);
    }
    
    return imagePaths;
  } catch (error) {
    console.error(`❌ Lỗi khi tải hình ảnh cho sản phẩm ${product.name}:`, error);
    return null;
  }
}

/**
 * Cập nhật đường dẫn hình ảnh trong database
 */
async function updateProductImagePaths(productId, imagePaths) {
  try {
    const result = await db
      .update(products)
      .set({ images: imagePaths })
      .where(eq(products.id, productId))
      .returning({ id: products.id, name: products.name });
    
    if (result.length > 0) {
      console.log(`✅ Đã cập nhật hình ảnh cho sản phẩm: ${result[0].name}`);
      return true;
    } else {
      console.log(`❌ Không tìm thấy sản phẩm với ID: ${productId}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật hình ảnh cho sản phẩm ID ${productId}:`, error);
    return false;
  }
}

/**
 * Xử lý và cập nhật hình ảnh cho sản phẩm điện tử theo loại
 */
async function processElectronicsProductsByType(productType) {
  try {
    console.log(`\n===== Bắt đầu cập nhật hình ảnh cho sản phẩm ${productType} =====`);
    
    // Lấy danh sách sản phẩm theo loại
    const productsOfType = await getElectronicsProductsByType(productType);
    
    let successCount = 0;
    let failCount = 0;
    
    // Xử lý từng sản phẩm
    for (const product of productsOfType) {
      // Tải hình ảnh cho sản phẩm
      const imagePaths = await downloadProductImages(product, productType);
      
      if (imagePaths && imagePaths.length > 0) {
        // Cập nhật đường dẫn hình ảnh trong database
        const updated = await updateProductImagePaths(product.id, imagePaths);
        
        if (updated) {
          successCount++;
        } else {
          failCount++;
        }
      } else {
        failCount++;
      }
    }
    
    console.log(`\n===== Tổng kết cho ${productType} =====`);
    console.log(`✅ Số sản phẩm đã cập nhật thành công: ${successCount}`);
    console.log(`❌ Số sản phẩm cập nhật thất bại: ${failCount}`);
    
    return { successCount, failCount };
  } catch (error) {
    console.error(`❌ Lỗi khi xử lý sản phẩm ${productType}:`, error);
    return { successCount: 0, failCount: 0 };
  }
}

/**
 * Hàm chính
 */
async function main() {
  try {
    console.log("===== Bắt đầu cập nhật hình ảnh cho sản phẩm điện tử =====");
    
    ensureDirectoryExists(ELECTRONICS_DIR);
    
    const totalResults = {
      successCount: 0,
      failCount: 0
    };
    
    // Xử lý từng loại sản phẩm
    for (const productType of Object.keys(PRODUCT_TYPES)) {
      const result = await processElectronicsProductsByType(productType);
      totalResults.successCount += result.successCount;
      totalResults.failCount += result.failCount;
    }
    
    console.log("\n===== Tổng kết chung =====");
    console.log(`✅ Tổng số sản phẩm điện tử đã cập nhật thành công: ${totalResults.successCount}`);
    console.log(`❌ Tổng số sản phẩm điện tử cập nhật thất bại: ${totalResults.failCount}`);
    console.log("===== Hoàn tất cập nhật hình ảnh sản phẩm điện tử =====");
  } catch (error) {
    console.error("❌ Lỗi chung:", error);
  }
}

// Thực thi script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Lỗi:", error);
    process.exit(1);
  });