/**
 * Script cập nhật mô tả tiếng Việt cho sản phẩm thiết bị luyện tập thể dục
 */

import pg from 'pg';

const { Pool } = pg;
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
 * Lấy tất cả sản phẩm thiết bị luyện tập thể dục
 * @returns {Promise<Array>} Danh sách sản phẩm
 */
async function getFitnessProducts() {
  return execute(
    'SELECT id, name, description FROM products WHERE category_id = 41'
  );
}

/**
 * Dịch mô tả sang tiếng Việt
 * @param {string} description Mô tả HTML
 * @returns {string} Mô tả đã dịch
 */
function translateDescription(description) {
  // Các cụm từ tiếng Anh và bản dịch tiếng Việt tương ứng
  const translations = {
    'Vertical climbing machine với integrated display': 'Máy leo thẳng đứng với màn hình tích hợp',
    'HD touchscreen với on-demand classes': 'Màn hình cảm ứng HD với các lớp học theo yêu cầu',
    'Force sensors for performance metrics': 'Cảm biến lực cho các số liệu hiệu suất',
    'heart rate monitor': 'theo dõi nhịp tim',
    'Digital magnetic resistance với micro-adjustments': 'Điện trở từ kỹ thuật số với điều chỉnh vi mô',
    'Extra-large textured pedals': 'Bàn đạp có kết cấu cỡ lớn',
    'tự điều chỉnh': 'tự điều chỉnh',
    'Ergonomic multi-position handles': 'Tay cầm đa vị trí tiện dụng',
    'Low-impact full body workout': 'Tập luyện toàn thân tác động thấp',
    'Bluetooth audio': 'Âm thanh Bluetooth',
    'small footprint': 'chiếm ít không gian',
    'Matte Black': 'Đen mờ',
    'White': 'Trắng',
    'Carbon': 'Carbon',
    'Vertical climbing machine': 'Máy leo thẳng đứng',
    'Cardio và strength training fusion machine': 'Máy kết hợp luyện tập tim mạch và sức mạnh',
    'Cardio và strength training': 'Luyện tập tim mạch và sức mạnh',
    'Electromagnetic với': 'Từ điện với',
    'computer-controlled drag': 'lực kéo được điều khiển bằng máy tính',
    'AI-powered digital weight system': 'Hệ thống tạ kỹ thuật số được hỗ trợ bởi AI',
    'smart accessories': 'phụ kiện thông minh',
    'Digital weight system': 'Hệ thống tạ kỹ thuật số',
    'provides up to': 'cung cấp tối đa',
    'pounds': 'pound',
    'resistance': 'kháng lực',
    'rotating touchscreen': 'màn hình cảm ứng xoay được',
    'motion sensing': 'cảm biến chuyển động',
    '3D form tracking': 'Theo dõi hình thức 3D',
    'computer vision AI': 'AI thị giác máy tính',
    'heart rate monitor': 'máy theo dõi nhịp tim',
    'Spotter mode': 'Chế độ hỗ trợ',
    'weight suggestions': 'gợi ý trọng lượng',
    'adaptive training': 'đào tạo thích ứng',
    'Smart handle': 'Tay cầm thông minh',
    'smart bar': 'thanh thông minh',
    'rope': 'dây',
    'bench': 'ghế dài',
    'foam roller': 'con lăn foam',
    'Dynamic weight modes': 'Chế độ trọng lượng động',
    'eccentric training': 'đào tạo lệch tâm',
    'chain mode': 'chế độ chuỗi',
    'Premium Black': 'Đen cao cấp',
    'Brushed Metal': 'Kim loại đánh bóng',
    'Ultimate Deck cushioning system': 'Hệ thống đệm Ultimate Deck',
    'AC Dynamic Response Drive System': 'Hệ thống Truyền động Phản hồi Động AC',
    'Integrated Generator power system': 'Hệ thống điện máy phát tích hợp',
    'integrated power': 'nguồn tích hợp',
    'auto-adjusting': 'tự động điều chỉnh',
    'Self-generating power system': 'Hệ thống nguồn điện tự tạo',
    'Digitally calibrated': 'Hiệu chuẩn kỹ thuật số',
    'no manual adjustments needed': 'không cần điều chỉnh thủ công',
    'Dual roller system with commercial-grade bearings': 'Hệ thống con lăn kép với ổ trục cấp thương mại',
    'touch-free, constant heart rate monitoring': 'theo dõi nhịp tim liên tục, không cần chạm',
    'Wirelessly projects metrics': 'Truyền số liệu không dây',
    'console': 'bảng điều khiển',
    'Carbon Inertia Enhancement Technology': 'Công nghệ Tăng cường Quán tính Carbon',
    'Split catchment system': 'Hệ thống thu thập phân tách',
    'super-sensitive biometric monitoring': 'giám sát sinh trắc học siêu nhạy',
    'built-in resistance calculations': 'tính toán điện trở tích hợp',
    'Compact-fold design': 'Thiết kế gấp gọn'
  };

  // Thay thế các cụm từ tiếng Anh bằng tiếng Việt
  let translatedDesc = description;
  for (const [english, vietnamese] of Object.entries(translations)) {
    const regex = new RegExp(english, 'g');
    translatedDesc = translatedDesc.replace(regex, vietnamese);
  }

  return translatedDesc;
}

/**
 * Cập nhật mô tả sản phẩm
 * @param {number} productId ID sản phẩm
 * @param {string} newDescription Mô tả mới
 * @returns {Promise<void>}
 */
async function updateProductDescription(productId, newDescription) {
  await execute(
    'UPDATE products SET description = $1 WHERE id = $2',
    [newDescription, productId]
  );
  console.log(`Đã cập nhật mô tả cho sản phẩm ID: ${productId}`);
}

/**
 * Hàm chính
 */
async function main() {
  try {
    // Lấy tất cả sản phẩm thiết bị luyện tập
    const products = await getFitnessProducts();
    console.log(`Tìm thấy ${products.length} sản phẩm thiết bị luyện tập thể dục.`);
    
    // Cập nhật mô tả cho từng sản phẩm
    let updated = 0;
    for (const product of products) {
      const translatedDesc = translateDescription(product.description);
      
      // Chỉ cập nhật nếu mô tả thay đổi
      if (translatedDesc !== product.description) {
        await updateProductDescription(product.id, translatedDesc);
        updated++;
      }
    }
    
    console.log(`Đã cập nhật ${updated}/${products.length} sản phẩm.`);
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    // Đóng kết nối cơ sở dữ liệu
    await pool.end();
  }
}

// Chạy hàm chính
main();