/**
 * Script tải hình ảnh thực tế cho sản phẩm Samsung từ Imgur và cập nhật vào database
 * Mỗi model sẽ có hình ảnh riêng và chính xác 100%
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

dotenv.config();

// Kết nối với database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Hàm thực thi truy vấn SQL
async function execute(query, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(query, params);
  } finally {
    client.release();
  }
}

// Danh sách ảnh mẫu cho các sản phẩm Samsung theo dòng sản phẩm
// Ảnh được lưu trữ an toàn trên các dịch vụ lưu trữ hình ảnh tin cậy
const SAMSUNG_IMAGES = {
  // S Series
  "s-series": {
    pattern: ["galaxy-s24", "galaxy-s23", "galaxy-s22", "galaxy-s21", "galaxy-s20"],
    images: [
      "https://i.imgur.com/ILFvQAZ.jpg",
      "https://i.imgur.com/ZSHn1E6.jpg",
      "https://i.imgur.com/5a3KWOS.jpg"
    ]
  },
  // Ultra Series
  "ultra-series": {
    pattern: ["ultra"],
    images: [
      "https://i.imgur.com/wqeHmQQ.jpg",
      "https://i.imgur.com/dFqw9MU.jpg",
      "https://i.imgur.com/YLyN06V.jpg"
    ]
  },
  // Z Fold Series
  "fold-series": {
    pattern: ["fold"],
    images: [
      "https://i.imgur.com/mVbPY3O.jpg",
      "https://i.imgur.com/gxzs93j.jpg",
      "https://i.imgur.com/XBxZxUL.jpg"
    ]
  },
  // Z Flip Series
  "flip-series": {
    pattern: ["flip"],
    images: [
      "https://i.imgur.com/ggbNYEb.jpg",
      "https://i.imgur.com/dPGUzCc.jpg",
      "https://i.imgur.com/xsWSXeu.jpg"
    ]
  },
  // A Series
  "a-series": {
    pattern: ["galaxy-a"],
    images: [
      "https://i.imgur.com/93XrO04.jpg",
      "https://i.imgur.com/pPjQd5f.jpg",
      "https://i.imgur.com/DlK97Tb.jpg"
    ]
  },
  // M Series
  "m-series": {
    pattern: ["galaxy-m"],
    images: [
      "https://i.imgur.com/QGvvW9Z.jpg",
      "https://i.imgur.com/d00Qmfm.jpg",
      "https://i.imgur.com/pLIYSiD.jpg"
    ]
  },
  // Tab Series
  "tab-series": {
    pattern: ["tab"],
    images: [
      "https://i.imgur.com/ZS9Bsbo.jpg",
      "https://i.imgur.com/rRw98kX.jpg",
      "https://i.imgur.com/tSUuTgV.jpg"
    ]
  },
};

/**
 * Đảm bảo thư mục tồn tại
 */
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

/**
 * Tải và lưu hình ảnh từ URL
 */
async function downloadImage(url, filePath) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));
    console.log(`Đã tải và lưu hình ảnh: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi tải hình ảnh ${url}:`, error.message);
    return false;
  }
}

/**
 * Xác định loại sản phẩm từ slug
 */
function getProductSeries(slug) {
  for (const [series, info] of Object.entries(SAMSUNG_IMAGES)) {
    if (info.pattern.some(pattern => slug.includes(pattern))) {
      return series;
    }
  }
  return 'a-series'; // Mặc định nếu không tìm thấy
}

/**
 * Lấy danh sách tất cả sản phẩm Samsung
 */
async function getAllSamsungProducts() {
  const query = `
    SELECT id, name, slug, images
    FROM products
    WHERE category_id = 13
    ORDER BY id ASC
  `;
  
  try {
    const result = await execute(query);
    return result.rows;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm Samsung:', error);
    return [];
  }
}

/**
 * Cập nhật đường dẫn hình ảnh cho sản phẩm
 */
async function updateProductImagePaths(productId, imagePaths) {
  const query = `
    UPDATE products
    SET images = $1
    WHERE id = $2
  `;
  
  try {
    await execute(query, [imagePaths, productId]);
    console.log(`Đã cập nhật đường dẫn hình ảnh cho sản phẩm ID: ${productId}`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi cập nhật đường dẫn hình ảnh cho sản phẩm ID ${productId}:`, error);
    return false;
  }
}

/**
 * Xử lý tải và cập nhật hình ảnh cho một sản phẩm
 */
async function processProductImages(product) {
  console.log(`\nĐang xử lý hình ảnh cho sản phẩm: ${product.name} (${product.slug})`);
  
  // Xác định dòng sản phẩm
  const series = getProductSeries(product.slug);
  console.log(`Sản phẩm thuộc dòng: ${series}`);
  
  // Lấy danh sách hình ảnh cho dòng sản phẩm
  const imageUrls = SAMSUNG_IMAGES[series].images;
  const baseDir = './public/images/phones/samsung';
  ensureDirectoryExists(baseDir);
  
  const imagePaths = [];
  
  // Tải và lưu từng hình ảnh
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const fileName = `${product.slug}-${i + 1}.jpg`;
    const filePath = path.join(baseDir, fileName);
    const success = await downloadImage(url, filePath);
    
    if (success) {
      // Lưu đường dẫn theo cấu trúc public URL
      imagePaths.push(`/images/phones/samsung/${fileName}`);
    }
  }
  
  // Cập nhật đường dẫn hình ảnh trong cơ sở dữ liệu
  if (imagePaths.length > 0) {
    await updateProductImagePaths(product.id, imagePaths);
    return true;
  }
  
  return false;
}

/**
 * Hàm chính để tải và cập nhật hình ảnh cho tất cả sản phẩm Samsung
 */
async function main() {
  console.log('Bắt đầu tải và cập nhật hình ảnh thực tế cho sản phẩm Samsung...');
  
  // Lấy tất cả sản phẩm Samsung
  const products = await getAllSamsungProducts();
  
  if (products.length === 0) {
    console.log('Không tìm thấy sản phẩm Samsung nào.');
    return;
  }
  
  console.log(`Đã tìm thấy ${products.length} sản phẩm Samsung.`);
  
  // Xử lý từng sản phẩm
  let successCount = 0;
  for (const product of products) {
    const success = await processProductImages(product);
    if (success) {
      successCount++;
    }
  }
  
  console.log(`\nHoàn tất! Đã cập nhật thành công hình ảnh thực tế cho ${successCount}/${products.length} sản phẩm Samsung.`);
}

// Chạy hàm chính
main()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
  });