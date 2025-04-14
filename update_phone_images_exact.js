import pkg from 'pg';
const { Pool } = pkg;

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Ánh xạ chính xác từ tên sản phẩm đến hình ảnh thích hợp
const exactPhoneMapping = [
  // iPhone series
  { name: "iPhone 15 Pro Max 256GB", imageUrl: "/images/products/phones/iphone/iphone15promax.jpg" },
  { name: "iPhone 15 Pro 128GB", imageUrl: "/images/products/phones/iphone/iphone15promax.jpg" },
  { name: "iPhone 15 128GB", imageUrl: "/images/phones/phone_1.jpg" },
  { name: "iPhone 15 Plus 128GB", imageUrl: "/images/phones/phone_1.jpg" },
  { name: "iPhone 14 Pro Max 128GB", imageUrl: "/images/products/phones/iphone/iphone15promax.jpg" },
  { name: "iPhone 14 128GB", imageUrl: "/images/phones/phone_1.jpg" },
  { name: "iPhone 14 Plus 128GB", imageUrl: "/images/phones/phone_1.jpg" },
  { name: "iPhone 14 Pro 2022", imageUrl: "/images/products/phones/iphone/iphone15promax.jpg" },
  { name: "iPhone 13 128GB", imageUrl: "/images/products/phones/iphone/iphone13.jpg" },
  { name: "iPhone 13 mini 128GB", imageUrl: "/images/products/phones/iphone/iphone13.jpg" },
  { name: "iPhone 12 64GB", imageUrl: "/images/phones/phone_2.jpg" },
  { name: "iPhone 11 64GB", imageUrl: "/images/phones/phone_2.jpg" },
  { name: "iPhone SE 5G 64GB", imageUrl: "/images/phones/phone_2.jpg" },
  { name: "iPhone SE", imageUrl: "/images/phones/phone_2.jpg" },
  { name: "iPhone X", imageUrl: "/images/phones/phone_2.jpg" },
  
  // Samsung Galaxy S series
  { name: "Samsung Galaxy S24 Ultra 12GB/256GB", imageUrl: "/images/products/phones/samsung/s24ultra.jpg" },
  { name: "Samsung Galaxy S24+ 5G 12GB/256GB", imageUrl: "/images/products/phones/samsung/s24ultra.jpg" },
  { name: "Samsung Galaxy S24 5G 8GB/128GB", imageUrl: "/images/products/phones/samsung/s24ultra.jpg" },
  { name: "Galaxy S23 Ultra 5G 256GB", imageUrl: "/images/products/phones/samsung/s23ultra.jpg" },
  { name: "Samsung Galaxy S23+ 5G 512GB", imageUrl: "/images/products/phones/samsung/s23ultra.jpg" },
  { name: "Samsung Galaxy S22 Ultra 5G 256GB", imageUrl: "/images/phones/phone_3.jpg" },
  { name: "Samsung Galaxy S22+ 5G", imageUrl: "/images/phones/phone_3.jpg" },
  { name: "Samsung Galaxy S22", imageUrl: "/images/phones/phone_3.jpg" },
  { name: "Samsung Galaxy S21 FE 5G 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  
  // Samsung Galaxy A series
  { name: "Samsung Galaxy A55 5G 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A54 5G 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A52s", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A35 5G 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A34 5G 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A33 5G 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A25 5G 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A23 5G 4GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A15 5G 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A15 4G 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A14 5G 4GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A14 4G 4GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A05s 4GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A05 4GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy A05", imageUrl: "/images/products/product_sample_5.jpg" },
  
  // Samsung Galaxy Z series
  { name: "Samsung Galaxy Z Fold5 5G 256GB", imageUrl: "/images/products/phones/samsung/zfold5.jpg" },
  { name: "Samsung Galaxy Z Fold4 5G 512GB", imageUrl: "/images/products/phones/samsung/zfold5.jpg" },
  { name: "Samsung Galaxy Z Fold3 5G", imageUrl: "/images/products/phones/samsung/zfold5.jpg" },
  { name: "Samsung Galaxy Z Flip5 5G 256GB", imageUrl: "/images/products/phones/samsung/zfold5.jpg" },
  { name: "Samsung Galaxy Z Flip4 5G 128GB", imageUrl: "/images/products/phones/samsung/zfold5.jpg" },
  
  // Samsung Galaxy M series
  { name: "Samsung Galaxy M55 5G 8GB/256GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy M53", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy M34", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy M14 5G 4GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  
  // Samsung Galaxy Tab series
  { name: "Samsung Galaxy Tab S6 Lite 2022 4GB/64GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy Tab A9+ 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Samsung Galaxy Tab A9 4GB/64GB", imageUrl: "/images/products/product_sample_5.jpg" },
  
  // Xiaomi series
  { name: "Xiaomi 14 8GB/256GB", imageUrl: "/images/products/phones/xiaomi/xiaomi13.jpg" },
  { name: "Xiaomi 14 Ultra 16GB/1TB", imageUrl: "/images/products/phones/xiaomi/xiaomi13.jpg" },
  { name: "Xiaomi 13T 5G 12GB/256GB", imageUrl: "/images/products/phones/xiaomi/xiaomi13.jpg" },
  { name: "Xiaomi 13 Lite 8GB/128GB", imageUrl: "/images/products/phones/xiaomi/xiaomi13.jpg" },
  { name: "Xiaomi Redmi Note 13 Pro+ 5G 12GB/512GB", imageUrl: "/images/products/phones/xiaomi/redmi.jpg" },
  { name: "Xiaomi Redmi Note 13 Pro 5G 8GB/256GB", imageUrl: "/images/products/phones/xiaomi/redmi.jpg" },
  { name: "Xiaomi Redmi Note 13 8GB/256GB", imageUrl: "/images/products/phones/xiaomi/redmi.jpg" },
  { name: "Xiaomi Redmi Note 12 Pro 5G 8GB/256GB", imageUrl: "/images/products/phones/xiaomi/redmi.jpg" },
  { name: "Xiaomi Redmi Note 12 4GB/128GB", imageUrl: "/images/products/phones/xiaomi/redmi.jpg" },
  { name: "Xiaomi Redmi 12 8GB/256GB", imageUrl: "/images/products/phones/xiaomi/redmi.jpg" },
  { name: "Xiaomi Redmi 12C 4GB/64GB", imageUrl: "/images/products/phones/xiaomi/redmi.jpg" },
  { name: "Xiaomi Redmi A2+ 3GB/64GB", imageUrl: "/images/products/phones/xiaomi/redmi.jpg" },
  { name: "Xiaomi Redmi K70 Pro", imageUrl: "/images/products/phones/xiaomi/redmi.jpg" },
  
  // POCO series
  { name: "POCO F6 8GB/256GB", imageUrl: "/images/products/phones/xiaomi/poco.jpg" },
  { name: "POCO X6 Pro 12GB/512GB", imageUrl: "/images/products/phones/xiaomi/poco.jpg" },
  { name: "POCO X6 12GB/256GB", imageUrl: "/images/products/phones/xiaomi/poco.jpg" },
  { name: "POCO M6 Pro 8GB/256GB", imageUrl: "/images/products/phones/xiaomi/poco.jpg" },
  { name: "POCO C65 6GB/128GB", imageUrl: "/images/products/phones/xiaomi/poco.jpg" },
  
  // OPPO series
  { name: "OPPO Find X7 Ultra 16GB/512GB", imageUrl: "/images/products/phones/oppo/findx7.jpg" },
  { name: "OPPO Find X7 12GB/256GB", imageUrl: "/images/products/phones/oppo/findx7.jpg" },
  { name: "OPPO Find X5 Pro 2023", imageUrl: "/images/products/phones/oppo/findx5pro.jpg" },
  { name: "OPPO Find X5 Pro Den", imageUrl: "/images/products/phones/oppo/findx5pro.jpg" },
  { name: "OPPO Find N3 16GB/512GB", imageUrl: "/images/products/phones/oppo/findx7.jpg" },
  { name: "OPPO Reno12 Pro 5G 12GB/256GB", imageUrl: "/images/products/phones/oppo/reno11.jpg" },
  { name: "OPPO Reno11 5G 12GB/256GB", imageUrl: "/images/products/phones/oppo/reno11.jpg" },
  { name: "OPPO Reno11 F 5G 8GB/256GB", imageUrl: "/images/products/phones/oppo/reno11.jpg" },
  { name: "OPPO Reno10 5G 8GB/256GB", imageUrl: "/images/products/phones/oppo/reno11.jpg" },
  { name: "OPPO A58 8GB/128GB", imageUrl: "/images/products/product_sample_6.jpg" },
  { name: "OPPO A38 4GB/128GB", imageUrl: "/images/products/product_sample_6.jpg" },
  { name: "OPPO A18 4GB/128GB", imageUrl: "/images/products/product_sample_6.jpg" },
  { name: "OPPO A77s 8GB/128GB", imageUrl: "/images/products/product_sample_6.jpg" },
  
  // vivo series
  { name: "Vivo V30 12GB/256GB", imageUrl: "/images/products/phones/vivo/v30.jpg" },
  { name: "Vivo V29e 5G 8GB/256GB", imageUrl: "/images/products/phones/vivo/v30.jpg" },
  { name: "Vivo V29 5G 12GB/256GB", imageUrl: "/images/products/phones/vivo/v30.jpg" },
  { name: "Vivo V27e 8GB/256GB", imageUrl: "/images/products/phones/vivo/v30.jpg" },
  { name: "Vivo X100 Pro 5G 16GB/512GB", imageUrl: "/images/products/phones/vivo/x100pro.jpg" },
  { name: "Vivo X90 Pro 5G 12GB/256GB", imageUrl: "/images/products/phones/vivo/x100pro.jpg" },
  { name: "Vivo Y36i 6GB/128GB", imageUrl: "/images/products/phones/vivo/y36.jpg" },
  { name: "Vivo Y36 8GB/128GB", imageUrl: "/images/products/phones/vivo/y36.jpg" },
  { name: "Vivo Y78+ 5G 8GB/256GB", imageUrl: "/images/products/phones/vivo/y36.jpg" },
  { name: "Vivo Y56 5G 8GB/128GB", imageUrl: "/images/products/phones/vivo/y36.jpg" },
  { name: "Vivo Y02T 4GB/64GB", imageUrl: "/images/products/phones/vivo/y36.jpg" },
  
  // realme series
  { name: "realme GT 6 16GB/512GB", imageUrl: "/images/products/phones/realme/gt6.jpg" },
  { name: "realme GT Neo5 SE 5G 8GB/256GB", imageUrl: "/images/products/phones/realme/gt6.jpg" },
  { name: "realme GT Neo3 8GB/256GB", imageUrl: "/images/products/phones/realme/gt6.jpg" },
  { name: "realme 12+ 5G 8GB/256GB", imageUrl: "/images/products/phones/realme/12pro.jpg" },
  { name: "realme 12 Pro 5G 12GB/256GB", imageUrl: "/images/products/phones/realme/12pro.jpg" },
  { name: "realme 12 Pro+ 5G 12GB/512GB", imageUrl: "/images/products/phones/realme/12pro.jpg" },
  { name: "realme 11 Pro+ 5G 12GB/512GB", imageUrl: "/images/products/phones/realme/12pro.jpg" },
  { name: "realme 11 8GB/256GB", imageUrl: "/images/products/phones/realme/12pro.jpg" },
  { name: "realme 10 8GB/256GB", imageUrl: "/images/products/phones/realme/12pro.jpg" },
  { name: "realme C55 6GB/128GB", imageUrl: "/images/products/product_sample_6.jpg" },
  { name: "realme C53 6GB/128GB", imageUrl: "/images/products/product_sample_6.jpg" },
  { name: "realme C51 4GB/128GB", imageUrl: "/images/products/product_sample_6.jpg" },
  
  // Google series
  { name: "Google Pixel 8 Pro 12GB/256GB", imageUrl: "/images/products/product_sample_1.jpg" },
  { name: "Google Pixel 8 8GB/128GB", imageUrl: "/images/products/product_sample_1.jpg" },
  { name: "Google Pixel 7a 8GB/128GB", imageUrl: "/images/products/product_sample_1.jpg" },
  { name: "Google Pixel 7a", imageUrl: "/images/products/product_sample_1.jpg" },
  
  // Các thương hiệu khác
  { name: "OnePlus 12R 16GB/256GB", imageUrl: "/images/products/product_sample_6.jpg" },
  { name: "Nothing Phone (2) 12GB/256GB", imageUrl: "/images/products/product_sample_1.jpg" },
  { name: "Motorola G23 8GB/128GB", imageUrl: "/images/phones/phone_2.jpg" },
  { name: "Motorola Edge 40 5G 8GB/256GB", imageUrl: "/images/phones/phone_2.jpg" },
  { name: "Nokia C22 4GB/64GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Asus ROG Phone 7 16GB/512GB", imageUrl: "/images/products/product_sample_4.jpg" },
  { name: "Asus ROG Phone 7 Ultimate 16GB/512GB", imageUrl: "/images/products/product_sample_4.jpg" },
  { name: "Asus Zenfone 10", imageUrl: "/images/products/product_sample_4.jpg" },
  { name: "Honor 200 Pro 12GB/512GB", imageUrl: "/images/products/product_sample_6.jpg" },
  { name: "Honor 200 12GB/512GB", imageUrl: "/images/products/product_sample_6.jpg" },
  { name: "Honor 90 5G 12GB/512GB", imageUrl: "/images/products/product_sample_6.jpg" },
  { name: "Infinix Zero 30 5G", imageUrl: "/images/products/product_sample_3.jpg" },
  { name: "Infinix Note 40 Pro+ 5G 12GB/512GB", imageUrl: "/images/products/product_sample_3.jpg" },
  { name: "Infinix Note 30 8GB/256GB", imageUrl: "/images/products/product_sample_3.jpg" },
  { name: "Infinix Hot 40 Pro 8GB/256GB", imageUrl: "/images/products/product_sample_3.jpg" },
  { name: "TECNO POVA 6 Pro 5G 12GB/256GB", imageUrl: "/images/products/product_sample_4.jpg" },
  { name: "TECNO CAMON 30 8GB/256GB", imageUrl: "/images/products/product_sample_4.jpg" },
  { name: "Nubia Neo 5G 8GB/256GB", imageUrl: "/images/products/product_sample_4.jpg" },
  { name: "Sony Xperia 5 V 8GB/128GB", imageUrl: "/images/products/product_sample_1.jpg" },
  { name: "Sony Xperia 1 V 12GB/256GB", imageUrl: "/images/products/product_sample_1.jpg" },
  { name: "Itel P55 4GB/64GB", imageUrl: "/images/products/product_sample_3.jpg" },
  { name: "Itel S23+", imageUrl: "/images/products/product_sample_3.jpg" },
  { name: "Itel Vision 3 Pro", imageUrl: "/images/products/product_sample_3.jpg" },
  { name: "Lenovo Tab M10 5G 8GB/128GB", imageUrl: "/images/products/product_sample_5.jpg" },
  { name: "Lenovo Tab P12 Pro 5G 8GB/256GB", imageUrl: "/images/products/product_sample_5.jpg" },
];

// Hàm để cập nhật hình ảnh cho mỗi sản phẩm
async function updatePhoneImages() {
  try {
    console.log("Bắt đầu cập nhật hình ảnh chính xác cho các sản phẩm điện thoại...");
    
    // Tổng số sản phẩm đã được cập nhật
    let updatedCount = 0;
    
    // Duyệt qua từng sản phẩm trong mapping
    for (const mapping of exactPhoneMapping) {
      // Tìm sản phẩm trong cơ sở dữ liệu
      const { rows } = await pool.query(
        "SELECT id, name, images FROM products WHERE category_id = 3 AND name = $1",
        [mapping.name]
      );
      
      // Nếu tìm thấy, kiểm tra và cập nhật hình ảnh
      if (rows.length > 0) {
        const product = rows[0];
        
        // Kiểm tra xem hình ảnh đã đúng chưa
        if (Array.isArray(product.images) && 
            product.images.length > 0 && 
            product.images[0] === mapping.imageUrl) {
          console.log(`Sản phẩm #${product.id}: ${product.name} đã có hình ảnh phù hợp: ${mapping.imageUrl}`);
          continue;
        }
        
        // Cập nhật hình ảnh
        await pool.query(
          "UPDATE products SET images = ARRAY[$1] WHERE id = $2",
          [mapping.imageUrl, product.id]
        );
        
        console.log(`Đã cập nhật hình ảnh cho sản phẩm #${product.id}: ${product.name} -> ${mapping.imageUrl}`);
        updatedCount++;
      }
    }
    
    console.log(`Hoàn thành cập nhật ${updatedCount} sản phẩm điện thoại với hình ảnh chính xác!`);
    
    // Bước tiếp theo: Cập nhật các sản phẩm còn lại bằng cách tìm theo thương hiệu
    console.log("Bắt đầu cập nhật các sản phẩm còn lại theo thương hiệu...");
    
    // Lấy tất cả sản phẩm điện thoại
    const { rows: allPhones } = await pool.query(
      `SELECT id, name, images FROM products WHERE category_id = 3`
    );
    
    const brandPrefixMap = [
      { prefix: "iPhone", imageUrl: "/images/phones/phone_1.jpg" },
      { prefix: "Samsung", imageUrl: "/images/products/product_sample_5.jpg" },
      { prefix: "Xiaomi", imageUrl: "/images/products/phones/xiaomi/xiaomi13.jpg" },
      { prefix: "POCO", imageUrl: "/images/products/phones/xiaomi/poco.jpg" },
      { prefix: "OPPO", imageUrl: "/images/products/phones/oppo/findx7.jpg" },
      { prefix: "Vivo", imageUrl: "/images/products/phones/vivo/v30.jpg" },
      { prefix: "realme", imageUrl: "/images/products/phones/realme/12pro.jpg" },
      { prefix: "Google", imageUrl: "/images/products/product_sample_1.jpg" },
      { prefix: "OnePlus", imageUrl: "/images/products/product_sample_6.jpg" },
      { prefix: "Nothing", imageUrl: "/images/products/product_sample_1.jpg" },
      { prefix: "Motorola", imageUrl: "/images/phones/phone_2.jpg" },
      { prefix: "Nokia", imageUrl: "/images/products/product_sample_5.jpg" },
      { prefix: "Asus", imageUrl: "/images/products/product_sample_4.jpg" },
      { prefix: "Honor", imageUrl: "/images/products/product_sample_6.jpg" },
      { prefix: "Infinix", imageUrl: "/images/products/product_sample_3.jpg" },
      { prefix: "TECNO", imageUrl: "/images/products/product_sample_4.jpg" },
      { prefix: "Nubia", imageUrl: "/images/products/product_sample_4.jpg" },
      { prefix: "Sony", imageUrl: "/images/products/product_sample_1.jpg" },
      { prefix: "Itel", imageUrl: "/images/products/product_sample_3.jpg" },
      { prefix: "Lenovo", imageUrl: "/images/products/product_sample_5.jpg" },
    ];
    
    let remainingUpdatedCount = 0;
    
    // Duyệt qua tất cả điện thoại
    for (const phone of allPhones) {
      // Bỏ qua nếu điện thoại đã có hình ảnh là một trong các đường dẫn mới
      const hasNewImage = Array.isArray(phone.images) && 
        phone.images.length > 0 && 
        phone.images[0].includes("/images/products/phones/");
      
      if (hasNewImage) {
        continue;
      }
      
      // Tìm thương hiệu phù hợp
      let foundBrandImage = null;
      for (const brand of brandPrefixMap) {
        if (phone.name.startsWith(brand.prefix)) {
          foundBrandImage = brand.imageUrl;
          break;
        }
      }
      
      if (foundBrandImage) {
        // Cập nhật hình ảnh
        await pool.query(
          "UPDATE products SET images = ARRAY[$1] WHERE id = $2",
          [foundBrandImage, phone.id]
        );
        
        console.log(`Đã cập nhật hình ảnh cho sản phẩm #${phone.id}: ${phone.name} -> ${foundBrandImage}`);
        remainingUpdatedCount++;
      }
    }
    
    console.log(`Hoàn thành cập nhật ${remainingUpdatedCount} sản phẩm còn lại theo thương hiệu!`);
    console.log(`Tổng cộng đã cập nhật ${updatedCount + remainingUpdatedCount} sản phẩm`);
    
  } catch (error) {
    console.error('Lỗi khi cập nhật hình ảnh sản phẩm:', error);
  } finally {
    await pool.end();
  }
}

// Chạy hàm chính
updatePhoneImages().catch(console.error);