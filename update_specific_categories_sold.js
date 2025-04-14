/**
 * Script để cập nhật số lượng "đã bán" ngẫu nhiên cho các danh mục cụ thể:
 * - Giày dép (36, 37, 38)
 * - Thẻ kỹ thuật số (41)
 * - Trang phục (31, 32, 33, 34, 35)
 * - Túi xách (39)
 * - Điện thoại (12, 13, 14, 15, 16, 17)
 */
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Tạo kết nối đến cơ sở dữ liệu
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
 * Tạo giá trị "đã bán" tùy thuộc vào loại sản phẩm và giá
 * @param {Object} product Thông tin sản phẩm
 * @returns {number} Số lượng đã bán
 */
function generateSoldCount(product) {
  const { categoryId, price } = product;
  let minSold = 50;
  let maxSold = 500;
  
  // Điều chỉnh dựa vào danh mục
  switch (categoryId) {
    // Điện thoại có lượng bán cao
    case 12: // iPhone
    case 13: // Samsung
    case 14: // Xiaomi
    case 15: // OPPO
    case 16: // Vivo  
    case 17: // Realme
      minSold = 200;
      maxSold = 600;
      break;
      
    // Thẻ kỹ thuật số - nhu cầu rất lớn
    case 41:
      minSold = 500;
      maxSold = 1000;
      break;
      
    // Quần áo
    case 31:
    case 32:
    case 33:
    case 34:
    case 35:
      minSold = 150;
      maxSold = 500;
      break;
      
    // Giày dép  
    case 36:
    case 37:
    case 38:
      minSold = 100;
      maxSold = 400;
      break;
      
    // Túi xách  
    case 39:
      minSold = 80;
      maxSold = 350;
      break;
      
    // Mặc định
    default:
      minSold = 50;
      maxSold = 300;
  }
  
  // Điều chỉnh dựa vào giá sản phẩm
  // Sản phẩm cao cấp thì số lượng bán có thể ít hơn
  if (price > 10000) { // Giá cao (trên 10 triệu VND hoặc 400 USD)
    minSold = Math.max(30, Math.floor(minSold * 0.6));
    maxSold = Math.floor(maxSold * 0.7);
  } else if (price > 5000) { // Giá trung bình cao
    minSold = Math.max(40, Math.floor(minSold * 0.7));
    maxSold = Math.floor(maxSold * 0.8);
  } else if (price < 200) { // Giá rất thấp
    minSold = Math.floor(minSold * 1.5);
    maxSold = Math.floor(maxSold * 1.5);
  }
  
  // Tạo số ngẫu nhiên trong khoảng đã điều chỉnh
  return Math.floor(Math.random() * (maxSold - minSold + 1)) + minSold;
}

/**
 * Cập nhật giá trị "đã bán" cho sản phẩm
 * @param {Object} product Thông tin sản phẩm
 * @param {number} soldCount Số lượng đã bán
 * @returns {Promise<Object>} Kết quả cập nhật
 */
async function updateProductSales(product, soldCount) {
  const [updatedProduct] = await execute(
    `UPDATE products 
     SET sold = $1
     WHERE id = $2 
     RETURNING id, name, sold`,
    [soldCount, product.id]
  );
  
  return updatedProduct;
}

/**
 * Cập nhật tổng doanh số cho shop dựa trên sản phẩm
 * @returns {Promise<void>}
 */
async function updateShopTotalSales() {
  await execute(
    `UPDATE shops
     SET total_sales = (
       SELECT SUM(sold)
       FROM products
       WHERE shop_id = shops.id
     )`
  );
  
  console.log("Đã cập nhật tổng số bán cho tất cả cửa hàng.");
}

/**
 * Hàm chính
 */
async function main() {
  try {
    // Danh sách ID danh mục cần cập nhật
    const targetCategoryIds = [
      12, 13, 14, 15, 16, 17, // Điện thoại
      31, 32, 33, 34, 35,     // Trang phục
      36, 37, 38,             // Giày dép
      39,                     // Túi xách
      41                      // Thẻ kỹ thuật số
    ];
    
    // Lấy sản phẩm từ các danh mục cần cập nhật
    const products = await execute(
      `SELECT id, name, price, category_id as "categoryId", sold
       FROM products
       WHERE category_id = ANY($1)
       ORDER BY id`,
      [targetCategoryIds]
    );
    
    console.log(`Tìm thấy ${products.length} sản phẩm từ các danh mục cần cập nhật.`);
    
    // Đếm số lượng cần cập nhật cho mỗi danh mục
    const categoryCounts = {};
    products.forEach(product => {
      const catId = product.categoryId;
      categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
    });
    
    console.log("Số lượng sản phẩm theo danh mục:");
    Object.entries(categoryCounts).forEach(([catId, count]) => {
      console.log(`- Danh mục ${catId}: ${count} sản phẩm`);
    });
    
    // Cập nhật số lượng đã bán
    let updatedCount = 0;
    
    for (const product of products) {
      try {
        // Tạo số lượng đã bán ngẫu nhiên
        const soldCount = generateSoldCount(product);
        
        // Cập nhật sản phẩm
        const updatedProduct = await updateProductSales(product, soldCount);
        
        // Ghi log kết quả
        if (updatedCount % 20 === 0 || updatedCount < 10) {
          console.log(`✅ Đã cập nhật "${product.name}": Đã bán = ${soldCount}`);
        }
        
        updatedCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi cập nhật "${product.name}":`, error);
      }
    }
    
    // Cập nhật tổng doanh số cho tất cả cửa hàng
    await updateShopTotalSales();
    
    console.log(`\n✨ Hoàn thành! Đã cập nhật ${updatedCount}/${products.length} sản phẩm.`);
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    // Đóng kết nối
    pool.end();
  }
}

// Chạy script
main();