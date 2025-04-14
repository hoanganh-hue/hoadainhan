/**
 * Script để thêm giá trị ảo "đã bán" cho các sản phẩm trong database
 * Không cập nhật cho sản phẩm thuộc danh mục "Trang sức đá quý" (ID 40)
 */

import pkg from 'pg';
const { Pool } = pkg;

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Thực thi truy vấn SQL
 * @param {string} query Câu truy vấn SQL
 * @param {Array} params Tham số cho câu truy vấn
 * @returns {Promise<Array>} Kết quả truy vấn
 */
async function execute(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Tạo số đã bán ngẫu nhiên dựa trên giá trị sản phẩm và thể loại
 * @param {string} categoryName Tên danh mục sản phẩm
 * @param {number} price Giá sản phẩm
 * @returns {number} Số lượng đã bán
 */
function generateRandomSold(categoryName, price) {
  // Sản phẩm càng đắt thì số lượng bán càng ít
  let maxSold = 1000;
  
  if (price > 5000000) {
    maxSold = 50; // Sản phẩm rất đắt, bán ít
  } else if (price > 2000000) {
    maxSold = 100; // Sản phẩm đắt, bán ít
  } else if (price > 1000000) {
    maxSold = 300; // Sản phẩm giá trung bình, bán khá
  } else if (price > 500000) {
    maxSold = 500; // Sản phẩm giá khá, bán nhiều
  } else {
    maxSold = 1000; // Sản phẩm giá rẻ, bán rất nhiều
  }
  
  // Điều chỉnh dựa trên loại sản phẩm
  let categoryMultiplier = 1.0;
  const categoryNameLower = categoryName.toLowerCase();
  
  if (categoryNameLower.includes('điện thoại') || categoryNameLower.includes('smartphone')) {
    categoryMultiplier = 1.2; // Điện thoại bán nhiều hơn
  } else if (categoryNameLower.includes('laptop') || categoryNameLower.includes('macbook')) {
    categoryMultiplier = 0.8; // Laptop bán ít hơn
  } else if (categoryNameLower.includes('áo thun') || categoryNameLower.includes('quần')) {
    categoryMultiplier = 1.5; // Quần áo bán nhiều hơn
  } else if (categoryNameLower.includes('thẻ nạp') || categoryNameLower.includes('thẻ game')) {
    categoryMultiplier = 2.0; // Thẻ nạp, thẻ game bán rất nhiều
  }
  
  // Tính toán số lượng đã bán ngẫu nhiên
  const minSold = Math.floor(maxSold * 0.1); // Ít nhất 10% của max
  const randomSold = Math.floor(Math.random() * (maxSold - minSold) + minSold);
  
  // Áp dụng hệ số nhân danh mục
  return Math.floor(randomSold * categoryMultiplier);
}

/**
 * Cập nhật số lượng đã bán cho tất cả sản phẩm ngoại trừ trang sức đá quý
 */
async function updateProductsSold() {
  try {
    // Lấy tất cả sản phẩm không thuộc danh mục "Trang sức đá quý" (ID 40)
    const products = await execute(
      `SELECT p.id, p.name, c.name as category_name, p.price 
       FROM products p 
       JOIN categories c ON p.category_id = c.id
       WHERE p.category_id != $1`,
      [40]
    );
    
    console.log(`Tìm thấy ${products.length} sản phẩm cần cập nhật số lượng đã bán.`);
    
    let updatedCount = 0;
    
    // Cập nhật số lượng đã bán cho từng sản phẩm
    for (const product of products) {
      const soldCount = generateRandomSold(product.category_name, product.price);
      
      // Cập nhật sản phẩm
      await execute(
        'UPDATE products SET sold = $1 WHERE id = $2',
        [soldCount, product.id]
      );
      
      updatedCount++;
      if (updatedCount % 20 === 0 || updatedCount === products.length) {
        console.log(`Đã cập nhật ${updatedCount}/${products.length} sản phẩm.`);
      }
    }
    
    console.log(`Hoàn thành! Đã cập nhật số lượng đã bán cho ${updatedCount} sản phẩm.`);
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
  } finally {
    // Đóng kết nối
    pool.end();
  }
}

// Thực thi script
console.log('Bắt đầu cập nhật số lượng đã bán cho sản phẩm...');
updateProductsSold();