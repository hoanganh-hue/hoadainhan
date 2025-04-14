/**
 * Script đơn giản để cập nhật đường dẫn hình ảnh trong database
 * sử dụng các file hình ảnh mẫu đã tạo
 */

import pkg from 'pg';
const { Pool } = pkg;

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Xác định loại sản phẩm từ tên
 */
function getProductType(name, categoryId) {
  name = name.toLowerCase();
  
  if (categoryId === 3) { // Điện thoại
    if (name.includes('iphone') || name.includes('apple')) {
      return 'iphone';
    } else if (name.includes('samsung') || name.includes('galaxy')) {
      return 'samsung';
    } else if (name.includes('xiaomi') || name.includes('redmi')) {
      return 'xiaomi';
    } else if (name.includes('oppo')) {
      return 'oppo';
    } else if (name.includes('vivo')) {
      return 'vivo';
    } else if (name.includes('realme')) {
      return 'realme';
    } else if (name.includes('nokia')) {
      return 'nokia';
    } else {
      return 'samsung'; // Mặc định là Samsung nếu không tìm thấy
    }
  } else if (categoryId === 7) { // Điện tử
    if (name.includes('laptop') || name.includes('macbook') || name.includes('notebook')) {
      return 'laptop';
    } else if (name.includes('tablet') || name.includes('ipad')) {
      return 'tablet';
    } else if (name.includes('tai nghe') || name.includes('headphone') || name.includes('airpod')) {
      return 'headphone';
    } else if (name.includes('loa') || name.includes('speaker')) {
      return 'speaker';
    } else if (name.includes('camera') || name.includes('máy ảnh')) {
      return 'camera';
    } else if (name.includes('đồng hồ') || name.includes('watch') || name.includes('smartwatch')) {
      return 'smartwatch';
    } else if (name.includes('tv') || name.includes('tivi') || name.includes('television')) {
      return 'tv';
    } else {
      return 'accessories'; // Mặc định là phụ kiện nếu không tìm thấy
    }
  }
  
  return 'accessories';
}

/**
 * Cập nhật đường dẫn hình ảnh cho sản phẩm điện thoại
 */
async function updatePhoneImages() {
  try {
    const phoneTypes = ['iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'realme', 'nokia'];
    
    for (const type of phoneTypes) {
      // Cập nhật đường dẫn hình ảnh cho từng loại điện thoại
      await pool.query(`
        UPDATE products
        SET images = ARRAY[
          '/images/products/phones/${type}/${type}-sample-1.jpg',
          '/images/products/phones/${type}/${type}-sample-2.jpg',
          '/images/products/phones/${type}/${type}-sample-3.jpg'
        ]
        WHERE category_id = 3
          AND LOWER(name) LIKE '%${type}%'
      `);
      
      console.log(`Đã cập nhật đường dẫn hình ảnh cho sản phẩm điện thoại loại ${type}`);
    }
    
    // Cập nhật hình ảnh cho các sản phẩm không khớp
    await pool.query(`
      UPDATE products
      SET images = ARRAY[
        '/images/products/phones/samsung/samsung-sample-1.jpg',
        '/images/products/phones/samsung/samsung-sample-2.jpg',
        '/images/products/phones/samsung/samsung-sample-3.jpg'
      ]
      WHERE category_id = 3
        AND images IS NULL OR images = '{}'
    `);
    
    console.log('Đã cập nhật đường dẫn hình ảnh cho tất cả sản phẩm điện thoại');
  } catch (error) {
    console.error('Lỗi khi cập nhật hình ảnh điện thoại:', error.message);
  }
}

/**
 * Cập nhật đường dẫn hình ảnh cho sản phẩm điện tử
 */
async function updateElectronicsImages() {
  try {
    const electronicTypes = {
      'laptop': ['laptop', 'macbook', 'notebook'],
      'tablet': ['tablet', 'ipad'],
      'headphone': ['tai nghe', 'headphone', 'airpod'],
      'speaker': ['loa', 'speaker'],
      'camera': ['camera', 'máy ảnh'],
      'smartwatch': ['đồng hồ', 'watch', 'smartwatch'],
      'tv': ['tv', 'tivi', 'television'],
      'accessories': ['phụ kiện', 'accessory']
    };
    
    for (const [type, keywords] of Object.entries(electronicTypes)) {
      // Tạo điều kiện LIKE
      const likeConditions = keywords.map(keyword => `LOWER(name) LIKE '%${keyword}%'`).join(' OR ');
      
      // Cập nhật đường dẫn hình ảnh cho từng loại sản phẩm điện tử
      await pool.query(`
        UPDATE products
        SET images = ARRAY[
          '/images/products/electronics/${type}/${type}-sample-1.jpg',
          '/images/products/electronics/${type}/${type}-sample-2.jpg',
          '/images/products/electronics/${type}/${type}-sample-3.jpg'
        ]
        WHERE category_id = 7
          AND (${likeConditions})
      `);
      
      console.log(`Đã cập nhật đường dẫn hình ảnh cho sản phẩm điện tử loại ${type}`);
    }
    
    // Cập nhật hình ảnh cho các sản phẩm không khớp
    await pool.query(`
      UPDATE products
      SET images = ARRAY[
        '/images/products/electronics/accessories/accessories-sample-1.jpg',
        '/images/products/electronics/accessories/accessories-sample-2.jpg',
        '/images/products/electronics/accessories/accessories-sample-3.jpg'
      ]
      WHERE category_id = 7
        AND images IS NULL OR images = '{}'
    `);
    
    console.log('Đã cập nhật đường dẫn hình ảnh cho tất cả sản phẩm điện tử');
  } catch (error) {
    console.error('Lỗi khi cập nhật hình ảnh điện tử:', error.message);
  }
}

/**
 * Hàm chính
 */
async function main() {
  try {
    console.log('===== BẮT ĐẦU CẬP NHẬT ĐƯỜNG DẪN HÌNH ẢNH =====');
    
    // Cập nhật đường dẫn hình ảnh cho điện thoại
    await updatePhoneImages();
    
    // Cập nhật đường dẫn hình ảnh cho điện tử
    await updateElectronicsImages();
    
    console.log('===== HOÀN THÀNH =====');
    
    // Đóng kết nối database
    await pool.end();
    
  } catch (error) {
    console.error('Lỗi trong quá trình thực thi:', error);
    
    // Đóng kết nối database
    try {
      await pool.end();
    } catch (e) {
      console.error('Lỗi khi đóng kết nối database:', e);
    }
  }
}

// Thực thi
main();