/**
 * Script cập nhật giá trang sức từ USD sang VNĐ
 * với tỷ giá 1 USD = 26.000 VNĐ
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
 * Cập nhật giá sản phẩm trang sức từ USD sang VNĐ
 * @param {number} productId ID sản phẩm
 * @param {number} priceUSD Giá USD
 * @param {number} discountPercent Phần trăm giảm giá
 * @returns {Promise<Object>} Kết quả cập nhật
 */
async function updateProductPriceUSD(productId, priceUSD, discountPercent) {
  // Chuyển đổi USD sang VNĐ
  const priceVND = Math.round(priceUSD * USD_TO_VND_RATE);
  
  // Tính giá bán sau khi giảm giá
  const salePriceVND = Math.round(priceVND * (1 - discountPercent / 100));
  
  // Cập nhật sản phẩm
  const [updatedProduct] = await execute(
    `UPDATE products 
     SET price = $1, sale_price = $2, discount = $3 
     WHERE id = $4 
     RETURNING *`,
    [priceVND, salePriceVND, discountPercent, productId]
  );
  
  return updatedProduct;
}

/**
 * Hàm chính
 */
async function main() {
  try {
    // Danh sách giá USD và mức giảm giá cho sản phẩm trang sức
    const productPrices = [
      { id: 4411, name: "Bvlgari B.zero1 Ring, One-Band", priceUSD: 4600, discount: 10 },
      { id: 4412, name: "Bvlgari Divas_ Dream Necklace", priceUSD: 12300, discount: 12 },
      { id: 4413, name: "Bvlgari Serpenti Viper Ring", priceUSD: 7200, discount: 15 },
      { id: 4414, name: "Cartier Juste un Clou Bracelet, Small Model", priceUSD: 8500, discount: 8 },
      { id: 4415, name: "Cartier Love Bracelet, Small Model", priceUSD: 10700, discount: 10 },
      { id: 4416, name: "Cartier Panthère de Cartier Ring", priceUSD: 7800, discount: 12 },
      { id: 4417, name: "Cartier Trinity Ring, Classic Model", priceUSD: 3400, discount: 8 },
      { id: 4418, name: "Chopard Happy Diamonds Icons Earrings", priceUSD: 9200, discount: 10 },
      { id: 4419, name: "Chopard Happy Hearts Wings Necklace", priceUSD: 11500, discount: 15 },
      { id: 4420, name: "Chopard Ice Cube Pure Ring", priceUSD: 4000, discount: 8 },
      { id: 4421, name: "Piaget Possession Open Bangle Bracelet", priceUSD: 8600, discount: 12 },
      { id: 4422, name: "Piaget Rose Pendant", priceUSD: 7100, discount: 10 },
      { id: 4423, name: "Piaget Sunlight Pendant", priceUSD: 6700, discount: 9 },
      { id: 4424, name: "Tiffany & Co. Elsa Peretti Diamonds by the Yard Necklace", priceUSD: 10800, discount: 15 },
      { id: 4425, name: "Tiffany & Co. HardWear Link Bracelet", priceUSD: 5900, discount: 10 },
      { id: 4426, name: "Tiffany & Co. T T1 Ring in Rose Gold with Diamonds", priceUSD: 5200, discount: 8 },
      { id: 4427, name: "Tiffany & Co. Victoria Vine Circle Key Pendant", priceUSD: 6400, discount: 10 },
      { id: 4428, name: "Van Cleef & Arpels Frivole Pendant, Small Model", priceUSD: 7900, discount: 12 },
      { id: 4429, name: "Van Cleef & Arpels Perlée Signature Bracelet", priceUSD: 10300, discount: 10 },
      { id: 4430, name: "Van Cleef & Arpels Vintage Alhambra Pendant", priceUSD: 7500, discount: 8 }
    ];
    
    // Cập nhật từng sản phẩm
    let updatedCount = 0;
    
    for (const product of productPrices) {
      try {
        const updatedProduct = await updateProductPriceUSD(product.id, product.priceUSD, product.discount);
        console.log(`✅ Đã cập nhật "${product.name}":`);
        console.log(`   Giá USD: $${product.priceUSD.toLocaleString('en-US')}`);
        console.log(`   Giá VND: ${(product.priceUSD * USD_TO_VND_RATE).toLocaleString('vi-VN')} VNĐ`);
        console.log(`   Giảm giá: ${product.discount}%`);
        console.log(`   Giá bán: ${Math.round(product.priceUSD * USD_TO_VND_RATE * (1 - product.discount / 100)).toLocaleString('vi-VN')} VNĐ`);
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