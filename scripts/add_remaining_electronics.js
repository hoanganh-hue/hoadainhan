/**
 * Script để thêm sản phẩm điện tử còn thiếu
 */

import pkg from 'pg';
const { Pool } = pkg;

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Tạo slug từ tên sản phẩm
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') + '-' + Date.now();
}

/**
 * Hàm chính thực thi
 */
async function main() {
  try {
    console.log('===== KIỂM TRA SỐ LƯỢNG SẢN PHẨM ĐIỆN TỬ HIỆN TẠI =====');
    
    // Kiểm tra số lượng sản phẩm điện tử hiện tại
    const { rows: countResult } = await pool.query(`
      SELECT COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      WHERE c.slug = 'dien-tu';
    `);
    
    const currentCount = parseInt(countResult[0].product_count);
    const neededCount = 200 - currentCount;
    
    console.log(`Số lượng sản phẩm điện tử hiện tại: ${currentCount}/200`);
    console.log(`Cần thêm ${neededCount} sản phẩm điện tử`);
    
    if (neededCount <= 0) {
      console.log('Đã đủ số lượng sản phẩm điện tử, không cần thêm nữa.');
      await pool.end();
      return;
    }
    
    // Lấy ID danh mục điện tử
    const { rows: categories } = await pool.query("SELECT id FROM categories WHERE slug = 'dien-tu'");
    if (categories.length === 0) throw new Error('Không tìm thấy danh mục Điện tử');
    const categoryId = categories[0].id;
    
    // Lấy danh sách shops
    const { rows: shops } = await pool.query("SELECT id FROM shops ORDER BY id LIMIT 10");
    if (shops.length === 0) throw new Error('Không tìm thấy shop');
    
    // Tạo thêm sản phẩm điện tử với tên ngẫu nhiên
    const types = [
      'Laptop', 'Tablet', 'Tai nghe', 'Loa', 'Camera', 'Đồng hồ thông minh', 
      'Thiết bị mạng', 'Điều hòa', 'Tủ lạnh', 'TV', 'Máy giặt', 'Lò vi sóng'
    ];
    
    const brands = [
      'Sony', 'Samsung', 'LG', 'Panasonic', 'Xiaomi', 'Toshiba', 'Philips', 'Sharp',
      'TCL', 'Bose', 'JBL', 'Huawei', 'Dell', 'HP', 'Lenovo', 'ASUS'
    ];
    
    const models = [
      'Pro', 'Ultra', 'Max', 'Elite', 'Plus', 'Premium', 'Slim', 'Smart', 
      'Master', 'Expert', 'Series', 'Advanced', 'Ultimate', 'Supreme'
    ];
    
    const additionalFeatures = [
      'AI', '5G', 'Bluetooth', 'WiFi 6', 'OLED', 'QLED', '4K', '8K', 'HD', 
      'Touchscreen', 'Waterproof', 'Fast Charging', 'Wireless', 'Smart'
    ];
    
    let successCount = 0;
    
    for (let i = 0; i < neededCount; i++) {
      try {
        // Tạo tên sản phẩm
        const type = types[Math.floor(Math.random() * types.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const model = models[Math.floor(Math.random() * models.length)];
        const feature = additionalFeatures[Math.floor(Math.random() * additionalFeatures.length)];
        const number = Math.floor(Math.random() * 100) + 1;
        
        // Tên có thể có nhiều format khác nhau
        let name;
        const format = Math.floor(Math.random() * 4);
        
        switch (format) {
          case 0:
            name = `${brand} ${type} ${model} ${number}`;
            break;
          case 1:
            name = `${brand} ${model} ${type} ${feature}`;
            break;
          case 2:
            name = `${brand} ${feature} ${type} ${number}`;
            break;
          case 3:
            name = `${brand} ${type} ${number} ${feature}`;
            break;
        }
        
        // Tạo slug
        const slug = generateSlug(name);
        
        // Tạo giá
        const price = Math.floor(Math.random() * 50000000) + 1000000; // 1tr - 51tr
        
        // Tạo mô tả
        const description = `
${name} là một sản phẩm điện tử cao cấp đến từ thương hiệu ${brand}.

Với thiết kế sang trọng và hiện đại, sản phẩm mang đến cảm giác cao cấp và bền bỉ.

${name} được trang bị nhiều tính năng tiên tiến như ${feature}, mang đến trải nghiệm sử dụng tuyệt vời.

Đây là lựa chọn hoàn hảo cho những ai đang tìm kiếm một sản phẩm ${type.toLowerCase()} chất lượng cao.`;
        
        // Chọn shop ngẫu nhiên
        const shopId = shops[Math.floor(Math.random() * shops.length)].id;
        
        // Tạo giá khuyến mãi (nếu có)
        const hasDiscount = Math.random() < 0.7; // 70% sản phẩm có giảm giá
        let salePrice = null;
        let discountPercent = 0;
        
        if (hasDiscount) {
          discountPercent = Math.floor(Math.random() * 25) + 5; // 5-30% giảm giá
          salePrice = Math.round(price * (1 - discountPercent / 100) / 1000) * 1000; // Làm tròn đến 1000
        }
        
        // Tạo flash sale (nếu có)
        const isFlashSale = Math.random() < 0.15; // 15% sản phẩm có flash sale
        const flashSaleEnd = isFlashSale 
          ? new Date(Date.now() + Math.floor(Math.random() * 7 + 3) * 24 * 60 * 60 * 1000) // 3-10 ngày
          : null;
        
        // Tạo sản phẩm nổi bật (nếu có)
        const isFeatured = Math.random() < 0.2; // 20% sản phẩm là nổi bật
        
        // Tạo số lượng tồn kho
        const quantity = Math.floor(Math.random() * 100) + 20; // 20-120 sản phẩm
        
        // Tạo rating
        const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0-5.0 rating
        
        // Tạo số lượng đã bán
        const totalSales = Math.floor(Math.random() * 500) + 10; // 10-510 sales
        
        // Tạo mảng hình ảnh giả lập
        const folderName = type.toLowerCase().replace(/\s+/g, '');
        const images = [
          `/images/products/electronics/${folderName}/${slug}-1.jpg`,
          `/images/products/electronics/${folderName}/${slug}-2.jpg`,
          `/images/products/electronics/${folderName}/${slug}-3.jpg`
        ];
        
        // Thêm sản phẩm
        const { rows } = await pool.query(
          `INSERT INTO products (
            category_id,
            shop_id,
            name,
            slug,
            description,
            price,
            sale_price,
            quantity,
            images,
            rating,
            total_sales,
            is_featured,
            is_flash_sale,
            flash_sale_end,
            discount,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
          RETURNING id`,
          [
            categoryId,
            shopId,
            name,
            slug,
            description,
            price,
            salePrice,
            quantity,
            images,
            rating,
            totalSales,
            isFeatured,
            isFlashSale,
            flashSaleEnd,
            discountPercent,
          ]
        );
        
        successCount++;
        console.log(`Đã thêm sản phẩm điện tử #${rows[0].id}: ${name}`);
      } catch (error) {
        console.error(`Lỗi khi thêm sản phẩm:`, error.message);
      }
    }
    
    // Kiểm tra kết quả cuối cùng
    const { rows: finalCount } = await pool.query(`
      SELECT c.name, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      WHERE c.slug IN ('dien-thoai', 'dien-tu')
      GROUP BY c.id, c.name
      ORDER BY c.name;
    `);
    
    console.log('===== KẾT QUẢ CUỐI CÙNG =====');
    for (const row of finalCount) {
      console.log(`${row.name}: ${row.product_count} sản phẩm`);
    }
    
    // Đóng kết nối
    await pool.end();
    
    console.log(`Đã thêm thành công ${successCount} sản phẩm điện tử bổ sung`);
    
  } catch (error) {
    console.error('Lỗi trong quá trình thực thi:', error);
    
    try {
      await pool.end();
    } catch (e) {
      console.error('Lỗi khi đóng kết nối database:', e);
    }
    
    process.exit(1);
  }
}

// Thực thi chương trình
main();