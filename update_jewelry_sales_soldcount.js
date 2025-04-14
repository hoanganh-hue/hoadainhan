/**
 * Script cập nhật số lượng "đã bán" cho các sản phẩm trang sức
 * và điều chỉnh định dạng tiền tệ từ VND sang USD với tỷ giá 1 USD = 26.000 VNĐ
 */
import pg from 'pg';

const { Pool } = pg;

// Tỷ giá USD sang VNĐ
const USD_TO_VND_RATE = 26000;

// Kết nối với DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
 * Cập nhật số lượng đã bán cho sản phẩm
 * @param {number} productId ID sản phẩm
 * @param {number} soldCount Số lượng đã bán
 * @returns {Promise<Object>} Kết quả cập nhật
 */
async function updateProductSoldCount(productId, soldCount) {
  const [updatedProduct] = await execute(
    `UPDATE products 
     SET sold = $1
     WHERE id = $2 
     RETURNING *`,
    [soldCount, productId]
  );
  
  return updatedProduct;
}

/**
 * Cập nhật định dạng tiền tệ từ VND sang USD
 * @param {number} productId ID sản phẩm
 * @returns {Promise<Object>} Kết quả cập nhật
 */
async function updateCurrencyFormat(productId) {
  // Lấy thông tin sản phẩm
  const [product] = await execute(
    `SELECT id, name, price, sale_price FROM products WHERE id = $1`,
    [productId]
  );
  
  // Chuyển đổi giá từ VND sang USD
  const priceUSD = Math.round(product.price / USD_TO_VND_RATE);
  const salePriceUSD = Math.round(product.sale_price / USD_TO_VND_RATE);
  
  // Cập nhật sản phẩm
  const [updatedProduct] = await execute(
    `UPDATE products 
     SET price = $1, sale_price = $2, currency = $3
     WHERE id = $4 
     RETURNING *`,
    [priceUSD, salePriceUSD, 'USD', productId]
  );
  
  return updatedProduct;
}

/**
 * Hàm chính
 */
async function main() {
  try {
    // Lấy danh sách sản phẩm trang sức
    const jewelryProducts = await execute(
      `SELECT id, name, price, sale_price 
       FROM products 
       WHERE category_id = 40 AND shop_id = 222
       ORDER BY id`
    );
    
    console.log(`Tìm thấy ${jewelryProducts.length} sản phẩm trang sức.`);
    
    // Cập nhật số lượng đã bán và định dạng tiền tệ
    let updatedCount = 0;
    
    for (const product of jewelryProducts) {
      try {
        // Tạo số lượng đã bán ngẫu nhiên từ 20 đến 150
        const soldCount = Math.floor(Math.random() * 131) + 20;
        
        // Cập nhật số lượng đã bán
        await updateProductSoldCount(product.id, soldCount);
        
        // Cập nhật định dạng tiền tệ
        const updatedProduct = await updateCurrencyFormat(product.id);
        
        console.log(`✅ Đã cập nhật "${product.name}":`);
        console.log(`   Giá VND: ${product.price.toLocaleString('vi-VN')} → USD: $${updatedProduct.price}`);
        console.log(`   Giá sale VND: ${product.sale_price.toLocaleString('vi-VN')} → USD: $${updatedProduct.sale_price}`);
        console.log(`   Đã bán: ${soldCount}`);
        console.log(`---`);
        
        updatedCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi cập nhật "${product.name}":`, error);
      }
    }
    
    // Cập nhật tổng số bán trong cửa hàng
    await execute(
      `UPDATE shops
       SET total_sales = (
         SELECT SUM(sold)
         FROM products
         WHERE shop_id = 222
       )
       WHERE id = 222`
    );
    
    console.log(`\n✨ Hoàn thành! Đã cập nhật ${updatedCount}/${jewelryProducts.length} sản phẩm trang sức.`);
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    // Đóng kết nối
    pool.end();
  }
}

// Chạy script
main();