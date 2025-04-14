/**
 * Script cập nhật giá trang sức dựa trên thị trường thực tế
 * và áp dụng mức giảm giá từ 5-15% để thu hút người mua
 */
import pg from 'pg';

const { Pool } = pg;

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
 * Cập nhật giá sản phẩm trang sức
 * @param {number} productId ID sản phẩm
 * @param {number} newPrice Giá mới
 * @param {number} discountPercent Phần trăm giảm giá
 * @returns {Promise<Object>} Kết quả cập nhật
 */
async function updateProductPrice(productId, newPrice, discountPercent) {
  // Tính giá bán sau khi giảm giá
  const salePrice = Math.round(newPrice * (1 - discountPercent / 100));
  
  // Cập nhật sản phẩm
  const [updatedProduct] = await execute(
    `UPDATE products 
     SET price = $1, sale_price = $2, discount = $3 
     WHERE id = $4 
     RETURNING *`,
    [newPrice, salePrice, discountPercent, productId]
  );
  
  return updatedProduct;
}

/**
 * Hàm chính
 */
async function main() {
  try {
    // Danh sách giá và mức giảm giá mới dựa trên nghiên cứu thị trường
    const productPrices = [
      { id: 4411, name: "Bvlgari B.zero1 Ring, One-Band", price: 115000000, discount: 10 },
      { id: 4412, name: "Bvlgari Divas_ Dream Necklace", price: 320000000, discount: 12 },
      { id: 4413, name: "Bvlgari Serpenti Viper Ring", price: 178000000, discount: 15 },
      { id: 4414, name: "Cartier Juste un Clou Bracelet, Small Model", price: 240000000, discount: 8 },
      { id: 4415, name: "Cartier Love Bracelet, Small Model", price: 285000000, discount: 10 },
      { id: 4416, name: "Cartier Panthère de Cartier Ring", price: 195000000, discount: 12 },
      { id: 4417, name: "Cartier Trinity Ring, Classic Model", price: 89000000, discount: 8 },
      { id: 4418, name: "Chopard Happy Diamonds Icons Earrings", price: 250000000, discount: 10 },
      { id: 4419, name: "Chopard Happy Hearts Wings Necklace", price: 290000000, discount: 15 },
      { id: 4420, name: "Chopard Ice Cube Pure Ring", price: 105000000, discount: 8 },
      { id: 4421, name: "Piaget Possession Open Bangle Bracelet", price: 225000000, discount: 12 },
      { id: 4422, name: "Piaget Rose Pendant", price: 185000000, discount: 10 },
      { id: 4423, name: "Piaget Sunlight Pendant", price: 175000000, discount: 9 },
      { id: 4424, name: "Tiffany & Co. Elsa Peretti Diamonds by the Yard Necklace", price: 280000000, discount: 15 },
      { id: 4425, name: "Tiffany & Co. HardWear Link Bracelet", price: 155000000, discount: 10 },
      { id: 4426, name: "Tiffany & Co. T T1 Ring in Rose Gold with Diamonds", price: 135000000, discount: 8 },
      { id: 4427, name: "Tiffany & Co. Victoria Vine Circle Key Pendant", price: 165000000, discount: 10 },
      { id: 4428, name: "Van Cleef & Arpels Frivole Pendant, Small Model", price: 205000000, discount: 12 },
      { id: 4429, name: "Van Cleef & Arpels Perlée Signature Bracelet", price: 270000000, discount: 10 },
      { id: 4430, name: "Van Cleef & Arpels Vintage Alhambra Pendant", price: 195000000, discount: 8 }
    ];
    
    // Cập nhật từng sản phẩm
    let updatedCount = 0;
    
    for (const product of productPrices) {
      try {
        const updatedProduct = await updateProductPrice(product.id, product.price, product.discount);
        console.log(`✅ Đã cập nhật "${product.name}":`);
        console.log(`   Giá gốc: ${product.price.toLocaleString('vi-VN')} VNĐ`);
        console.log(`   Giảm giá: ${product.discount}%`);
        console.log(`   Giá bán: ${Math.round(product.price * (1 - product.discount / 100)).toLocaleString('vi-VN')} VNĐ`);
        console.log(`---`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi cập nhật "${product.name}":`, error);
      }
    }
    
    console.log(`\n✨ Hoàn thành! Đã cập nhật ${updatedCount}/${productPrices.length} sản phẩm trang sức.`);
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    // Đóng kết nối
    pool.end();
  }
}

// Chạy script
main();