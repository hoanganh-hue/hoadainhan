/**
 * Script để hoàn thành việc thêm sản phẩm điện thoại và điện tử
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
    .replace(/-+$/, '');
}

/**
 * Kiểm tra số lượng sản phẩm đã có trong cơ sở dữ liệu
 */
async function checkProductCounts() {
  const { rows } = await pool.query(`
    SELECT c.id, c.name, c.slug, COUNT(p.id) as product_count 
    FROM categories c 
    LEFT JOIN products p ON c.id = p.category_id 
    WHERE c.slug IN ('dien-thoai', 'dien-tu')
    GROUP BY c.id, c.name, c.slug;
  `);
  
  return rows;
}

/**
 * Thêm sản phẩm điện thoại còn thiếu
 */
async function addRemainingPhones(currentCount) {
  try {
    console.log(`Đang thêm tiếp ${300 - currentCount} sản phẩm điện thoại...`);
    
    // Lấy ID danh mục điện thoại
    const { rows: categories } = await pool.query("SELECT id FROM categories WHERE slug = 'dien-thoai'");
    if (categories.length === 0) throw new Error('Không tìm thấy danh mục Điện thoại');
    const categoryId = categories[0].id;
    
    // Lấy danh sách shops
    const { rows: shops } = await pool.query("SELECT id FROM shops ORDER BY id LIMIT 10");
    if (shops.length === 0) throw new Error('Không tìm thấy shop');
    
    // Dữ liệu sản phẩm điện thoại
    const phoneModels = [];
    
    // Tạo 300 - currentCount mẫu điện thoại với tên khác nhau
    for (let i = 0; i < 300 - currentCount; i++) {
      const brands = ['Xiaomi', 'Samsung', 'OPPO', 'Vivo', 'realme', 'Nokia', 'HONOR', 'Infinix', 'Motorola', 'Nothing'];
      const series = ['Galaxy', 'Redmi', 'Reno', 'GT', 'Note', 'Find', 'Y', 'C', 'Edge', 'A', 'Nova', 'G', 'Magic'];
      const suffixes = ['Ultra', 'Pro', 'Plus', 'Lite', 'Premium', 'Max', '5G', 'FE', 'S', 'T'];
      
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const serie = series[Math.floor(Math.random() * series.length)];
      const number = Math.floor(Math.random() * 20) + 1;
      const useSuffix = Math.random() > 0.5;
      const suffix = useSuffix ? ' ' + suffixes[Math.floor(Math.random() * suffixes.length)] : '';
      
      const name = `${brand} ${serie} ${number}${suffix}`;
      const price = Math.floor(Math.random() * 20000000) + 2000000; // 2tr - 22tr
      
      // Tạo mô tả
      const features = [
        'màn hình Super AMOLED sắc nét',
        'hiệu năng mạnh mẽ',
        'camera chất lượng cao',
        'pin dung lượng lớn',
        'sạc nhanh tiện lợi'
      ];
      
      phoneModels.push({
        name,
        price,
        features
      });
    }
    
    // Thêm sản phẩm vào database
    let successCount = 0;
    
    for (const model of phoneModels) {
      try {
        // Tạo slug
        const slug = generateSlug(model.name) + '-' + Date.now();
        
        // Tạo mô tả
        const description = `
${model.name} là một chiếc điện thoại thông minh hiện đại với thiết kế sang trọng và hiệu năng vượt trội.

Sản phẩm được trang bị ${model.features.join(', ')}, mang đến trải nghiệm sử dụng tuyệt vời.

Đây là lựa chọn tuyệt vời cho những ai đang tìm kiếm một chiếc điện thoại đáp ứng mọi nhu cầu hàng ngày.`;
        
        // Chọn shop ngẫu nhiên
        const shopId = shops[Math.floor(Math.random() * shops.length)].id;
        
        // Tạo giá khuyến mãi (nếu có)
        const hasDiscount = Math.random() < 0.7; // 70% sản phẩm có giảm giá
        let salePrice = null;
        let discountPercent = 0;
        
        if (hasDiscount) {
          discountPercent = Math.floor(Math.random() * 25) + 5; // 5-30% giảm giá
          salePrice = Math.round(model.price * (1 - discountPercent / 100) / 1000) * 1000; // Làm tròn đến 1000
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
        const images = [
          `/images/products/phones/default/phone-${Math.floor(Math.random() * 10) + 1}.jpg`,
          `/images/products/phones/default/phone-${Math.floor(Math.random() * 10) + 1}.jpg`,
          `/images/products/phones/default/phone-${Math.floor(Math.random() * 10) + 1}.jpg`
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
            model.name,
            slug,
            description,
            model.price,
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
        console.log(`Đã thêm sản phẩm điện thoại #${rows[0].id}: ${model.name}`);
      } catch (error) {
        console.error(`Lỗi khi thêm sản phẩm ${model.name}:`, error.message);
      }
    }
    
    console.log(`Đã thêm thành công ${successCount} sản phẩm điện thoại bổ sung`);
    return successCount;
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm điện thoại:', error);
    return 0;
  }
}

/**
 * Thêm sản phẩm điện tử
 */
async function addElectronicsProducts() {
  try {
    console.log('Đang thêm 200 sản phẩm điện tử...');
    
    // Lấy ID danh mục điện tử
    const { rows: categories } = await pool.query("SELECT id FROM categories WHERE slug = 'dien-tu'");
    if (categories.length === 0) throw new Error('Không tìm thấy danh mục Điện tử');
    const categoryId = categories[0].id;
    
    // Lấy danh sách shops
    const { rows: shops } = await pool.query("SELECT id FROM shops ORDER BY id LIMIT 10");
    if (shops.length === 0) throw new Error('Không tìm thấy shop');
    
    // Các loại sản phẩm điện tử
    const productTypes = [
      { type: 'Laptop', count: 40 },
      { type: 'Tablet', count: 30 },
      { type: 'Tai nghe', count: 30 },
      { type: 'Loa', count: 30 },
      { type: 'Camera', count: 20 },
      { type: 'Smartwatch', count: 30 },
      { type: 'Thiết bị mạng', count: 20 }
    ];
    
    // Các thương hiệu theo loại sản phẩm
    const brandsByType = {
      'Laptop': ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'LG', 'Huawei', 'Microsoft'],
      'Tablet': ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Lenovo', 'Microsoft', 'Huawei', 'Nokia'],
      'Tai nghe': ['Apple', 'Samsung', 'Sony', 'JBL', 'Bose', 'Sennheiser', 'Beats', 'Marshall'],
      'Loa': ['JBL', 'Sony', 'Marshall', 'Bose', 'Harman Kardon', 'Ultimate Ears', 'Apple', 'Sonos'],
      'Camera': ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Panasonic', 'GoPro', 'DJI', 'Insta360'],
      'Smartwatch': ['Apple', 'Samsung', 'Garmin', 'Huawei', 'Xiaomi', 'Amazfit', 'Fitbit', 'Polar'],
      'Thiết bị mạng': ['TP-Link', 'ASUS', 'Netgear', 'Linksys', 'Google', 'Xiaomi', 'Huawei', 'Ubiquiti']
    };
    
    // Các mẫu sản phẩm theo loại
    const seriesByType = {
      'Laptop': ['MacBook Pro', 'XPS', 'Pavilion', 'ThinkPad', 'ROG', 'Nitro', 'Gram', 'Surface', 'MateBook', 'Aspire'],
      'Tablet': ['iPad Pro', 'Galaxy Tab', 'Mi Pad', 'MatePad', 'Surface Pro', 'Legion Tab', 'T Series', 'MediaPad'],
      'Tai nghe': ['AirPods', 'Galaxy Buds', 'WF-1000XM', 'QuietComfort', 'MOMENTUM', 'Tour Pro', 'Tune', 'Quantum'],
      'Loa': ['HomePod', 'Flip', 'Charge', 'SoundLink', 'Aura Studio', 'Beosound', 'WONDERBOOM', 'SRS'],
      'Camera': ['Alpha', 'EOS', 'Z', 'X-T', 'Lumix', 'HERO', 'Osmo Action', 'X'],
      'Smartwatch': ['Watch', 'Galaxy Watch', 'Forerunner', 'Watch GT', 'Mi Watch', 'GTR', 'Sense', 'Vantage'],
      'Thiết bị mạng': ['Deco', 'Archer', 'Nest Wifi', 'Orbi', 'Velop', 'Eero', 'AX', 'UniFi']
    };
    
    // Các tính năng theo loại sản phẩm
    const featuresByType = {
      'Laptop': [
        'màn hình Retina sắc nét',
        'bộ vi xử lý mạnh mẽ',
        'card đồ họa hiệu năng cao',
        'ổ cứng SSD tốc độ cao',
        'hệ thống tản nhiệt tiên tiến',
        'bàn phím backlit tiện lợi',
        'pin dung lượng lớn'
      ],
      'Tablet': [
        'màn hình Liquid Retina', 
        'bút cảm ứng chính xác', 
        'hiệu năng mạnh mẽ', 
        'camera chất lượng cao',
        'khả năng kết nối đa dạng',
        'thiết kế siêu mỏng nhẹ'
      ],
      'Tai nghe': [
        'công nghệ chống ồn chủ động', 
        'âm thanh không gian', 
        'thời lượng pin dài', 
        'kết nối không dây ổn định',
        'âm bass sâu và mạnh mẽ',
        'thiết kế in-ear thoải mái'
      ],
      'Loa': [
        'âm thanh stereo sống động', 
        'công nghệ Bluetooth 5.0', 
        'chống nước IPX7', 
        'pin sạc dự phòng',
        'tính năng Party Boost',
        'tích hợp micro đàm thoại'
      ],
      'Camera': [
        'cảm biến ảnh full-frame', 
        'quay video 8K', 
        'hệ thống ổn định hình ảnh', 
        'khả năng chụp thiếu sáng xuất sắc',
        'kết nối Wi-Fi và Bluetooth',
        'thời lượng pin dài'
      ],
      'Smartwatch': [
        'màn hình AMOLED', 
        'cảm biến đo nhịp tim', 
        'theo dõi giấc ngủ', 
        'chống nước 50m',
        'pin dung lượng lớn',
        'nhiều chế độ thể thao'
      ],
      'Thiết bị mạng': [
        'Wi-Fi 6E', 
        'băng thông lên đến 10 Gbps', 
        'hệ thống mesh', 
        'phạm vi phủ sóng rộng',
        'khả năng kết nối đa thiết bị',
        'ứng dụng quản lý thông minh'
      ]
    };
    
    // Thêm sản phẩm vào database
    let successCount = 0;
    
    // Tạo sản phẩm cho từng loại
    for (const productType of productTypes) {
      const type = productType.type;
      const count = productType.count;
      
      const brands = brandsByType[type];
      const series = seriesByType[type];
      const features = featuresByType[type];
      
      for (let i = 0; i < count; i++) {
        try {
          // Chọn thương hiệu và mẫu sản phẩm
          const brand = brands[Math.floor(Math.random() * brands.length)];
          const serie = series[Math.floor(Math.random() * series.length)];
          
          // Tạo tên sản phẩm
          let name;
          if (Math.random() > 0.5) {
            name = `${brand} ${serie} ${Math.floor(Math.random() * 20) + 1}`;
          } else {
            name = `${brand} ${serie}`;
          }
          
          // Thêm suffix nếu cần
          if (Math.random() > 0.7) {
            const suffixes = ['Pro', 'Plus', 'Max', 'Ultra', 'Premium', 'Elite'];
            name += ' ' + suffixes[Math.floor(Math.random() * suffixes.length)];
          }
          
          // Tạo slug
          const slug = generateSlug(name) + '-' + Date.now();
          
          // Tạo giá
          const price = Math.floor(Math.random() * 30000000) + 1000000; // 1tr - 31tr
          
          // Chọn các tính năng ngẫu nhiên
          const selectedFeatures = [];
          const featureCount = Math.floor(Math.random() * 3) + 3; // 3-5 tính năng
          
          for (let j = 0; j < featureCount; j++) {
            const randomFeature = features[Math.floor(Math.random() * features.length)];
            if (!selectedFeatures.includes(randomFeature)) {
              selectedFeatures.push(randomFeature);
            }
          }
          
          // Tạo mô tả
          const description = `
${name} là một sản phẩm ${type.toLowerCase()} cao cấp đến từ thương hiệu ${brand}.

Sản phẩm được trang bị ${selectedFeatures.join(', ')}, mang đến trải nghiệm sử dụng tuyệt vời.

Thiết kế sang trọng cùng chất lượng hoàn thiện tỉ mỉ, ${name} sẽ đáp ứng tốt mọi nhu cầu sử dụng của bạn.

Hãy trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!`;
          
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
          console.log(`Đã thêm sản phẩm ${type} #${rows[0].id}: ${name}`);
        } catch (error) {
          console.error(`Lỗi khi thêm sản phẩm ${type}:`, error.message);
        }
      }
    }
    
    console.log(`Đã thêm thành công ${successCount} sản phẩm điện tử`);
    return successCount;
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm điện tử:', error);
    return 0;
  }
}

/**
 * Hàm chính thực thi
 */
async function main() {
  try {
    console.log('===== KIỂM TRA SỐ LƯỢNG SẢN PHẨM HIỆN TẠI =====');
    
    // Kiểm tra số lượng sản phẩm hiện tại
    const categoryCounts = await checkProductCounts();
    
    // Tìm danh mục điện thoại và điện tử
    const phoneCategory = categoryCounts.find(c => c.slug === 'dien-thoai');
    const electronicsCategory = categoryCounts.find(c => c.slug === 'dien-tu');
    
    const phoneCount = phoneCategory ? parseInt(phoneCategory.product_count) : 0;
    const electronicsCount = electronicsCategory ? parseInt(electronicsCategory.product_count) : 0;
    
    console.log(`Số lượng sản phẩm điện thoại hiện tại: ${phoneCount}/300`);
    console.log(`Số lượng sản phẩm điện tử hiện tại: ${electronicsCount}/200`);
    
    // Thêm các sản phẩm còn thiếu
    let addedPhones = 0;
    let addedElectronics = 0;
    
    if (phoneCount < 300) {
      addedPhones = await addRemainingPhones(phoneCount);
    }
    
    if (electronicsCount < 200) {
      addedElectronics = await addElectronicsProducts();
    }
    
    console.log('===== KẾT QUẢ =====');
    console.log(`Đã thêm ${addedPhones} sản phẩm điện thoại mới`);
    console.log(`Đã thêm ${addedElectronics} sản phẩm điện tử mới`);
    console.log(`Tổng số sản phẩm điện thoại: ${phoneCount + addedPhones}`);
    console.log(`Tổng số sản phẩm điện tử: ${electronicsCount + addedElectronics}`);
    
    // Đóng kết nối
    await pool.end();
    
    process.exit(0);
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