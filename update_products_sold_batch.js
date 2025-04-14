/**
 * Script để thêm giá trị ảo "đã bán" cho các sản phẩm trong database theo lô
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
 * Cập nhật số lượng đã bán cho các sản phẩm theo danh mục
 */
async function updateProductsSoldByCategory() {
  try {
    // Cập nhật cho điện thoại và thiết bị điện tử (giá cao, bán ít hơn)
    await execute(`
      UPDATE products
      SET sold = FLOOR(RANDOM() * (100 - 10) + 10)
      WHERE category_id IN (
        SELECT id FROM categories 
        WHERE name LIKE '%Điện thoại%' OR name LIKE '%điện thoại%' OR name LIKE '%Điện tử%' OR name LIKE '%điện tử%'
      ) AND category_id != 40
    `);
    console.log('Đã cập nhật số lượng bán cho điện thoại và thiết bị điện tử.');
    
    // Cập nhật cho laptop, máy tính bảng (giá cao, bán ít)
    await execute(`
      UPDATE products
      SET sold = FLOOR(RANDOM() * (80 - 5) + 5)
      WHERE category_id IN (
        SELECT id FROM categories 
        WHERE name LIKE '%Laptop%' OR name LIKE '%laptop%' OR name LIKE '%Máy tính%' OR name LIKE '%tablet%'
      ) AND category_id != 40
    `);
    console.log('Đã cập nhật số lượng bán cho laptop và máy tính bảng.');
    
    // Cập nhật cho quần áo thời trang (giá trung bình, bán nhiều)
    await execute(`
      UPDATE products
      SET sold = FLOOR(RANDOM() * (500 - 100) + 100)
      WHERE category_id IN (
        SELECT id FROM categories 
        WHERE name LIKE '%Áo%' OR name LIKE '%áo%' OR name LIKE '%Quần%' OR name LIKE '%quần%' 
        OR name LIKE '%Thời trang%' OR name LIKE '%thời trang%' OR name LIKE '%Váy%'
      ) AND category_id != 40
    `);
    console.log('Đã cập nhật số lượng bán cho quần áo thời trang.');
    
    // Cập nhật cho giày dép, túi xách (giá cao trung bình, bán khá)
    await execute(`
      UPDATE products
      SET sold = FLOOR(RANDOM() * (300 - 50) + 50)
      WHERE category_id IN (
        SELECT id FROM categories 
        WHERE name LIKE '%Giày%' OR name LIKE '%giày%' OR name LIKE '%Túi%' OR name LIKE '%túi%'
      ) AND category_id != 40
    `);
    console.log('Đã cập nhật số lượng bán cho giày dép và túi xách.');
    
    // Cập nhật cho đồng hồ (giá cao, bán ít)
    await execute(`
      UPDATE products
      SET sold = FLOOR(RANDOM() * (100 - 10) + 10)
      WHERE category_id IN (
        SELECT id FROM categories 
        WHERE name LIKE '%Đồng hồ%' OR name LIKE '%đồng hồ%'
      ) AND category_id != 40
    `);
    console.log('Đã cập nhật số lượng bán cho đồng hồ.');
    
    // Cập nhật cho thẻ nạp, thẻ game (giá thấp, bán rất nhiều)
    await execute(`
      UPDATE products
      SET sold = FLOOR(RANDOM() * (1000 - 300) + 300)
      WHERE category_id IN (
        SELECT id FROM categories 
        WHERE name LIKE '%Thẻ%' OR name LIKE '%thẻ%' OR name LIKE '%Game%' OR name LIKE '%game%'
      ) AND category_id != 40
    `);
    console.log('Đã cập nhật số lượng bán cho thẻ nạp và thẻ game.');
    
    // Cập nhật cho các danh mục còn lại (trừ trang sức đá quý)
    await execute(`
      UPDATE products
      SET sold = FLOOR(RANDOM() * (200 - 30) + 30)
      WHERE (sold = 0 OR sold IS NULL) AND category_id != 40
    `);
    console.log('Đã cập nhật số lượng bán cho các danh mục còn lại.');
    
    // Kiểm tra số lượng sản phẩm đã cập nhật
    const products = await execute(`SELECT COUNT(*) FROM products WHERE sold > 0`);
    console.log(`Tổng số ${products[0].count} sản phẩm đã được cập nhật số lượng bán.`);
    
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
  } finally {
    // Đóng kết nối
    pool.end();
  }
}

// Thực thi script
console.log('Bắt đầu cập nhật số lượng đã bán cho sản phẩm...');
updateProductsSoldByCategory();