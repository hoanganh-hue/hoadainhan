/**
 * Script để tải hình ảnh iPhone từ Pexels API và cập nhật vào database
 * 
 * Script này sẽ:
 * 1. Lấy danh sách sản phẩm iPhone từ database
 * 2. Tìm kiếm hình ảnh phù hợp từ Pexels API
 * 3. Tải và lưu hình ảnh vào thư mục public
 * 4. Cập nhật đường dẫn hình ảnh trong database
 */

import { db } from './server/db.js';
import { products } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { createClient } from 'pexels';

// Cấu hình API và đường dẫn lưu trữ
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const IMAGES_BASE_DIR = './public/images';
const PHONES_DIR = path.join(IMAGES_BASE_DIR, 'phones');
const IPHONE_DIR = path.join(PHONES_DIR, 'iphone');

// Map từ tên model iPhone đến từ khóa tìm kiếm phù hợp
const IPHONE_SEARCH_TERMS = {
  'iPhone 15 Pro Max': 'iphone 15 pro max titanium',
  'iPhone 15 Pro': 'iphone 15 pro titanium',
  'iPhone 15 Plus': 'iphone 15 plus',
  'iPhone 15': 'iphone 15',
  'iPhone 14 Pro Max': 'iphone 14 pro max',
  'iPhone 14 Pro': 'iphone 14 pro',
  'iPhone 14 Plus': 'iphone 14 plus',
  'iPhone 14': 'iphone 14',
  'iPhone 13': 'iphone 13',
  'iPhone 13 mini': 'iphone 13 mini'
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
      per_page: perPage,
      orientation: 'portrait'
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
 * Lấy danh sách sản phẩm iPhone từ database
 */
async function getIPhoneProducts() {
  try {
    const iphoneProducts = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, 3))
      .where(query => {
        return query.like(products.name, '%iPhone%');
      });
    
    console.log(`✅ Tìm thấy ${iphoneProducts.length} sản phẩm iPhone trong database`);
    return iphoneProducts;
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách sản phẩm iPhone:', error);
    throw error;
  }
}

/**
 * Tạo tên file hình ảnh duy nhất
 */
function createImageFileName(productName, index, photoId) {
  const sanitizedName = productName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  return `${sanitizedName}-${photoId}-${index + 1}.jpg`;
}

/**
 * Tải và lưu hình ảnh cho một sản phẩm iPhone
 */
async function downloadProductImages(product) {
  try {
    const productName = product.name;
    const searchTerm = IPHONE_SEARCH_TERMS[productName] || productName;
    
    console.log(`\n📱 Đang xử lý sản phẩm: ${productName}`);
    
    // Tìm kiếm hình ảnh từ Pexels
    const photos = await searchPexelsImages(searchTerm);
    
    if (photos.length === 0) {
      console.log(`❌ Không tìm thấy hình ảnh cho sản phẩm: ${productName}`);
      return null;
    }
    
    // Tạo thư mục nếu chưa tồn tại
    ensureDirectoryExists(IPHONE_DIR);
    
    // Tải và lưu các hình ảnh
    const imagePaths = [];
    
    for (let i = 0; i < Math.min(photos.length, 3); i++) {
      const photo = photos[i];
      const imageUrl = photo.src.large; // Sử dụng kích thước large để tối ưu tốc độ tải
      const fileName = createImageFileName(productName, i, photo.id);
      const filePath = path.join(IPHONE_DIR, fileName);
      const publicPath = `/images/phones/iphone/${fileName}`;
      
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
 * Xử lý và cập nhật hình ảnh cho tất cả sản phẩm iPhone
 */
async function processIPhoneProducts() {
  try {
    console.log("===== Bắt đầu cập nhật hình ảnh cho sản phẩm iPhone =====");
    
    // Lấy danh sách sản phẩm iPhone
    const iphoneProducts = await getIPhoneProducts();
    
    let successCount = 0;
    let failCount = 0;
    
    // Xử lý từng sản phẩm
    for (const product of iphoneProducts) {
      // Tải hình ảnh cho sản phẩm
      const imagePaths = await downloadProductImages(product);
      
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
    
    console.log("\n===== Tổng kết =====");
    console.log(`✅ Số sản phẩm iPhone đã cập nhật thành công: ${successCount}`);
    console.log(`❌ Số sản phẩm iPhone cập nhật thất bại: ${failCount}`);
    console.log("===== Hoàn tất cập nhật hình ảnh iPhone =====");
    
    return { successCount, failCount };
  } catch (error) {
    console.error("❌ Lỗi khi xử lý sản phẩm iPhone:", error);
    return { successCount: 0, failCount: 0 };
  }
}

/**
 * Hàm chính
 */
async function main() {
  try {
    await processIPhoneProducts();
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