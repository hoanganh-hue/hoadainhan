/**
 * Script để cập nhật đường dẫn hình ảnh cho sản phẩm Samsung Galaxy
 * Sử dụng hình ảnh local đã được tạo trước đó
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

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

/**
 * Lấy danh sách sản phẩm Samsung Galaxy
 */
async function getSamsungProducts() {
  const query = `
    SELECT id, name, slug
    FROM products
    WHERE category_id = 13
    ORDER BY id DESC
  `;
  
  try {
    const result = await execute(query);
    return result.rows;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm Samsung Galaxy:', error);
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
 * Xử lý và cập nhật hình ảnh cho một sản phẩm Samsung Galaxy
 */
async function processProductImages(product) {
  console.log(`Đang xử lý hình ảnh cho sản phẩm: ${product.name}`);
  
  // Tạo đường dẫn cho hình ảnh
  const slug = product.slug;
  let imagePaths = [];
  
  // Xác định đường dẫn hình ảnh dựa trên model
  if (slug.includes('s24-ultra')) {
    imagePaths = [
      '/images/phones/samsung/s24-ultra-1.jpg',
      '/images/phones/samsung/s24-ultra-2.jpg',
      '/images/phones/samsung/s24-ultra-3.jpg'
    ];
  } else if (slug.includes('s24-plus') || slug.includes('s24-5g')) {
    imagePaths = [
      '/images/phones/samsung/s24-plus-1.jpg',
      '/images/phones/samsung/s24-plus-2.jpg',
      '/images/phones/samsung/s24-plus-3.jpg'
    ];
  } else if (slug.includes('z-fold5')) {
    imagePaths = [
      '/images/phones/samsung/zfold-1.jpg',
      '/images/phones/samsung/zfold-2.jpg',
      '/images/phones/samsung/zfold-3.jpg'
    ];
  } else if (slug.includes('z-flip5')) {
    imagePaths = [
      '/images/phones/samsung/zflip-1.jpg',
      '/images/phones/samsung/zflip-2.jpg',
      '/images/phones/samsung/zflip-3.jpg'
    ];
  } else {
    // Hình ảnh dự phòng
    imagePaths = [
      '/images/phones/samsung/galaxy-1.jpg',
      '/images/phones/samsung/galaxy-2.jpg'
    ];
  }
  
  // Cập nhật đường dẫn hình ảnh trong database
  await updateProductImagePaths(product.id, imagePaths);
  return true;
}

/**
 * Hàm chính
 */
async function main() {
  console.log('Bắt đầu cập nhật đường dẫn hình ảnh cho sản phẩm Samsung Galaxy...');
  
  // Lấy danh sách sản phẩm Samsung Galaxy
  const products = await getSamsungProducts();
  
  if (products.length === 0) {
    console.log('Không tìm thấy sản phẩm Samsung Galaxy nào.');
    return;
  }
  
  console.log(`Đã tìm thấy ${products.length} sản phẩm Samsung Galaxy.`);
  
  // Xử lý từng sản phẩm
  let successCount = 0;
  for (const product of products) {
    const success = await processProductImages(product);
    if (success) {
      successCount++;
    }
  }
  
  console.log(`Hoàn tất! Đã cập nhật đường dẫn hình ảnh cho ${successCount}/${products.length} sản phẩm Samsung Galaxy.`);
}

main().catch(console.error);