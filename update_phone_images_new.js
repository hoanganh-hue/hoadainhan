import pkg from 'pg';
const { Pool } = pkg;

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Danh sách các mẫu điện thoại với đường dẫn hình ảnh tương ứng
const phoneImageMapping = [
  // iPhone series
  { keywords: ["iPhone 15 Pro Max"], imageUrl: "/images/phones/iphone/iphone15promax.jpg" },
  { keywords: ["iPhone 15 Pro"], imageUrl: "/images/phones/iphone/iphone15promax.jpg" },
  { keywords: ["iPhone 15 Plus"], imageUrl: "/images/phones/iphone/iphone15promax.jpg" },
  { keywords: ["iPhone 15"], imageUrl: "/images/phones/iphone/iphone15promax.jpg" },
  { keywords: ["iPhone 14 Pro Max"], imageUrl: "/images/phones/iphone/iphone14.jpg" },
  { keywords: ["iPhone 14 Pro"], imageUrl: "/images/phones/iphone/iphone14.jpg" },
  { keywords: ["iPhone 14 Plus"], imageUrl: "/images/phones/iphone/iphone14.jpg" },
  { keywords: ["iPhone 14"], imageUrl: "/images/phones/iphone/iphone14.jpg" },
  { keywords: ["iPhone 13 Pro Max"], imageUrl: "/images/phones/iphone/iphone13.jpg" },
  { keywords: ["iPhone 13 Pro"], imageUrl: "/images/phones/iphone/iphone13.jpg" },
  { keywords: ["iPhone 13 mini"], imageUrl: "/images/phones/iphone/iphone13.jpg" },
  { keywords: ["iPhone 13"], imageUrl: "/images/phones/iphone/iphone13.jpg" },
  { keywords: ["iPhone 12"], imageUrl: "/images/phones/iphone/iphone13.jpg" },
  { keywords: ["iPhone 11"], imageUrl: "/images/phones/iphone/iphone13.jpg" },
  { keywords: ["iPhone SE"], imageUrl: "/images/phones/iphone/iphone13.jpg" },
  { keywords: ["iPhone X"], imageUrl: "/images/phones/iphone/iphone13.jpg" },
  
  // Samsung Galaxy S series
  { keywords: ["S24 Ultra"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["S24+", "S24 Plus"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["S24"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["S23 Ultra"], imageUrl: "/images/phones/samsung/s23ultra.jpg" },
  { keywords: ["S23+", "S23 Plus"], imageUrl: "/images/phones/samsung/s23ultra.jpg" },
  { keywords: ["S23"], imageUrl: "/images/phones/samsung/s23ultra.jpg" },
  { keywords: ["S22 Ultra"], imageUrl: "/images/phones/samsung/s23ultra.jpg" },
  { keywords: ["S22+", "S22 Plus"], imageUrl: "/images/phones/samsung/s23ultra.jpg" },
  { keywords: ["S22"], imageUrl: "/images/phones/samsung/s23ultra.jpg" },
  { keywords: ["S21"], imageUrl: "/images/phones/samsung/s23ultra.jpg" },
  
  // Samsung Galaxy A series
  { keywords: ["A55"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A54"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A53"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A52"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A35"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A34"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A33"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A25"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A23"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A15"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A14"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["A05"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  
  // Samsung Galaxy Z series
  { keywords: ["Z Fold5", "Z Fold 5"], imageUrl: "/images/phones/samsung/zfold.jpg" },
  { keywords: ["Z Fold4", "Z Fold 4"], imageUrl: "/images/phones/samsung/zfold.jpg" },
  { keywords: ["Z Fold3", "Z Fold 3"], imageUrl: "/images/phones/samsung/zfold.jpg" },
  { keywords: ["Z Flip5", "Z Flip 5"], imageUrl: "/images/phones/samsung/zfold.jpg" },
  { keywords: ["Z Flip4", "Z Flip 4"], imageUrl: "/images/phones/samsung/zfold.jpg" },
  { keywords: ["Z Flip3", "Z Flip 3"], imageUrl: "/images/phones/samsung/zfold.jpg" },
  
  // Samsung Galaxy M & Tab series
  { keywords: ["M55"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["M53"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["M34"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["M14"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  { keywords: ["Tab"], imageUrl: "/images/phones/samsung/s24ultra.jpg" },
  
  // Xiaomi series
  { keywords: ["Xiaomi 14 Ultra"], imageUrl: "/images/phones/xiaomi/xiaomi13.jpg" },
  { keywords: ["Xiaomi 14"], imageUrl: "/images/phones/xiaomi/xiaomi13.jpg" },
  { keywords: ["Xiaomi 13T"], imageUrl: "/images/phones/xiaomi/xiaomi13.jpg" },
  { keywords: ["Xiaomi 13"], imageUrl: "/images/phones/xiaomi/xiaomi13.jpg" },
  { keywords: ["Redmi Note 13 Pro+", "Redmi Note 13 Pro Plus"], imageUrl: "/images/phones/xiaomi/redminote13.jpg" },
  { keywords: ["Redmi Note 13 Pro"], imageUrl: "/images/phones/xiaomi/redminote13.jpg" },
  { keywords: ["Redmi Note 13"], imageUrl: "/images/phones/xiaomi/redminote13.jpg" },
  { keywords: ["Redmi Note 12"], imageUrl: "/images/phones/xiaomi/redminote13.jpg" },
  { keywords: ["Redmi 12"], imageUrl: "/images/phones/xiaomi/redminote13.jpg" },
  { keywords: ["Redmi A2"], imageUrl: "/images/phones/xiaomi/redminote13.jpg" },
  { keywords: ["Redmi K70"], imageUrl: "/images/phones/xiaomi/redminote13.jpg" },
  
  // POCO series
  { keywords: ["POCO F6"], imageUrl: "/images/phones/xiaomi/xiaomi13.jpg" },
  { keywords: ["POCO X6 Pro"], imageUrl: "/images/phones/xiaomi/xiaomi13.jpg" },
  { keywords: ["POCO X6"], imageUrl: "/images/phones/xiaomi/xiaomi13.jpg" },
  { keywords: ["POCO M6"], imageUrl: "/images/phones/xiaomi/xiaomi13.jpg" },
  { keywords: ["POCO C65"], imageUrl: "/images/phones/xiaomi/xiaomi13.jpg" },
  
  // OPPO series
  { keywords: ["OPPO Find X7 Ultra"], imageUrl: "/images/phones/oppo/findx7.jpg" },
  { keywords: ["OPPO Find X7"], imageUrl: "/images/phones/oppo/findx7.jpg" },
  { keywords: ["OPPO Find X5 Pro"], imageUrl: "/images/phones/oppo/findx7.jpg" },
  { keywords: ["OPPO Find X5"], imageUrl: "/images/phones/oppo/findx7.jpg" },
  { keywords: ["OPPO Find N3"], imageUrl: "/images/phones/oppo/findx7.jpg" },
  { keywords: ["OPPO Reno12"], imageUrl: "/images/phones/oppo/reno12.jpg" },
  { keywords: ["OPPO Reno11"], imageUrl: "/images/phones/oppo/reno12.jpg" },
  { keywords: ["OPPO Reno10"], imageUrl: "/images/phones/oppo/reno12.jpg" },
  { keywords: ["OPPO A58"], imageUrl: "/images/phones/oppo/reno12.jpg" },
  { keywords: ["OPPO A38"], imageUrl: "/images/phones/oppo/reno12.jpg" },
  { keywords: ["OPPO A18"], imageUrl: "/images/phones/oppo/reno12.jpg" },
  { keywords: ["OPPO A77"], imageUrl: "/images/phones/oppo/reno12.jpg" },
  
  // vivo series
  { keywords: ["Vivo V30"], imageUrl: "/images/phones/vivo/v30.jpg" },
  { keywords: ["Vivo V29"], imageUrl: "/images/phones/vivo/v30.jpg" },
  { keywords: ["Vivo V27"], imageUrl: "/images/phones/vivo/v30.jpg" },
  { keywords: ["Vivo X100 Pro"], imageUrl: "/images/phones/vivo/x100.jpg" },
  { keywords: ["Vivo X100"], imageUrl: "/images/phones/vivo/x100.jpg" },
  { keywords: ["Vivo X90"], imageUrl: "/images/phones/vivo/x100.jpg" },
  { keywords: ["Vivo Y36"], imageUrl: "/images/phones/vivo/v30.jpg" },
  { keywords: ["Vivo Y78"], imageUrl: "/images/phones/vivo/v30.jpg" },
  { keywords: ["Vivo Y56"], imageUrl: "/images/phones/vivo/v30.jpg" },
  { keywords: ["Vivo Y02"], imageUrl: "/images/phones/vivo/v30.jpg" },
  
  // realme series
  { keywords: ["realme GT 6"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme GT Neo5"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme GT Neo3"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme 12 Pro+", "realme 12 Pro Plus"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme 12 Pro"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme 12+", "realme 12 Plus"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme 12"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme 11 Pro+", "realme 11 Pro Plus"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme 11 Pro"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme 11"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme 10"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme C55"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme C53"], imageUrl: "/images/phones/realme/gt6.jpg" },
  { keywords: ["realme C51"], imageUrl: "/images/phones/realme/gt6.jpg" },
  
  // Google series
  { keywords: ["Google Pixel 8 Pro"], imageUrl: "/images/phones/google/pixel8.jpg" },
  { keywords: ["Google Pixel 8"], imageUrl: "/images/phones/google/pixel8.jpg" },
  { keywords: ["Google Pixel 7"], imageUrl: "/images/phones/google/pixel8.jpg" },
  { keywords: ["Pixel 8"], imageUrl: "/images/phones/google/pixel8.jpg" },
  { keywords: ["Pixel 7"], imageUrl: "/images/phones/google/pixel8.jpg" },
  
  // Honor series
  { keywords: ["Honor 200 Pro"], imageUrl: "/images/phones/honor/honor200.jpg" },
  { keywords: ["Honor 200"], imageUrl: "/images/phones/honor/honor200.jpg" },
  { keywords: ["Honor 90"], imageUrl: "/images/phones/honor/honor200.jpg" },
  
  // Các thương hiệu khác
  { keywords: ["OnePlus"], imageUrl: "/images/phones/others/oneplus.jpg" },
  { keywords: ["Nothing Phone"], imageUrl: "/images/phones/others/nothing.jpg" },
  { keywords: ["Motorola"], imageUrl: "/images/phones/others/motorola.jpg" },
  { keywords: ["Nokia"], imageUrl: "/images/phones/others/nokia.jpg" },
  { keywords: ["Asus ROG"], imageUrl: "/images/phones/others/asus.jpg" },
  { keywords: ["Asus Zenfone"], imageUrl: "/images/phones/others/asus.jpg" },
  { keywords: ["Infinix"], imageUrl: "/images/phones/others/infinix.jpg" },
  { keywords: ["TECNO"], imageUrl: "/images/phones/others/tecno.jpg" },
  { keywords: ["Nubia"], imageUrl: "/images/phones/others/nubia.jpg" },
  { keywords: ["Sony Xperia"], imageUrl: "/images/phones/others/sony.jpg" },
  { keywords: ["Itel"], imageUrl: "/images/phones/others/itel.jpg" },
  { keywords: ["Lenovo"], imageUrl: "/images/phones/others/lenovo.jpg" },
];

// Các thương hiệu chính và hình ảnh đại diện
const brandImageMapping = {
  "iPhone": "/images/phones/iphone/iphone15promax.jpg",
  "Samsung": "/images/phones/samsung/s24ultra.jpg",
  "Xiaomi": "/images/phones/xiaomi/xiaomi13.jpg",
  "Redmi": "/images/phones/xiaomi/redminote13.jpg",
  "POCO": "/images/phones/xiaomi/xiaomi13.jpg",
  "OPPO": "/images/phones/oppo/findx7.jpg",
  "Vivo": "/images/phones/vivo/v30.jpg",
  "realme": "/images/phones/realme/gt6.jpg",
  "Google": "/images/phones/google/pixel8.jpg",
  "Pixel": "/images/phones/google/pixel8.jpg",
  "Honor": "/images/phones/honor/honor200.jpg",
  "OnePlus": "/images/phones/others/oneplus.jpg",
  "Nothing": "/images/phones/others/nothing.jpg",
  "Motorola": "/images/phones/others/motorola.jpg",
  "Nokia": "/images/phones/others/nokia.jpg",
  "Asus": "/images/phones/others/asus.jpg",
  "Infinix": "/images/phones/others/infinix.jpg",
  "TECNO": "/images/phones/others/tecno.jpg", 
  "Nubia": "/images/phones/others/nubia.jpg",
  "Sony": "/images/phones/others/sony.jpg",
  "Itel": "/images/phones/others/itel.jpg",
  "Lenovo": "/images/phones/others/lenovo.jpg"
};

// Sao chép các hình ảnh còn thiếu
async function copyMissingImages() {
  // Lấy danh sách các thương hiệu
  const brands = Object.keys(brandImageMapping);
  
  for (const brand of brands) {
    if (!brandImageMapping[brand].includes("/images/phones/others/")) {
      continue; // Bỏ qua nếu đã có hình ảnh cụ thể
    }
    
    // Tạo hình ảnh mặc định nếu chưa có bằng cách sao chép từ hình ảnh sẵn có
    const sourceImage = "/images/products/product_sample_";
    let sourceNum = "1.jpg";
    
    if (brand === "Motorola" || brand === "Nokia" || brand === "Lenovo") {
      sourceNum = "5.jpg";
    } else if (brand === "Asus" || brand === "TECNO" || brand === "Nubia") {
      sourceNum = "4.jpg";
    } else if (brand === "Infinix" || brand === "Itel") {
      sourceNum = "3.jpg";
    } else if (brand === "OnePlus") {
      sourceNum = "6.jpg";
    }
    
    try {
      const command = `cp ${sourceImage}${sourceNum} ${brandImageMapping[brand]}`;
      console.log(`Executing: ${command}`);
      // Trong môi trường JavaScript thật, bạn sẽ sử dụng fs.copyFileSync thay vì exec
      const { exec } = require('child_process');
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return;
        }
        console.log(`Copied image for ${brand}`);
      });
    } catch (err) {
      console.error(`Failed to copy image for ${brand}: ${err}`);
    }
  }
}

// Tìm hình ảnh phù hợp dựa trên tên sản phẩm
function findBestImageMatch(productName) {
  // Kiểm tra từng mẫu điện thoại cụ thể
  for (const mapping of phoneImageMapping) {
    for (const keyword of mapping.keywords) {
      if (productName.includes(keyword)) {
        return mapping.imageUrl;
      }
    }
  }
  
  // Nếu không khớp với mẫu cụ thể, thử khớp với thương hiệu
  for (const brand in brandImageMapping) {
    if (productName.includes(brand)) {
      return brandImageMapping[brand];
    }
  }
  
  // Mặc định trả về hình ảnh chung cho điện thoại
  return "/images/phones/iphone/iphone15promax.jpg";
}

// Cập nhật hình ảnh cho tất cả sản phẩm điện thoại
async function updatePhoneImages() {
  try {
    console.log("Bắt đầu quá trình cập nhật hình ảnh sản phẩm điện thoại...");
    
    // Sao chép hình ảnh còn thiếu trước
    await copyMissingImages();
    
    // Lấy tất cả sản phẩm điện thoại
    const { rows: phoneProducts } = await pool.query(`
      SELECT id, name, images FROM products WHERE category_id = 3
    `);
    
    console.log(`Tìm thấy ${phoneProducts.length} sản phẩm điện thoại cần xem xét.`);
    
    let updatedCount = 0;
    
    // Xử lý từng sản phẩm
    for (const product of phoneProducts) {
      // Tìm hình ảnh phù hợp nhất cho sản phẩm
      const bestImageMatch = findBestImageMatch(product.name);
      
      // Kiểm tra xem hình ảnh hiện tại đã là phù hợp nhất chưa
      if (Array.isArray(product.images) && 
          product.images.length > 0 && 
          product.images[0] === bestImageMatch) {
        console.log(`Sản phẩm #${product.id}: ${product.name} đã có hình ảnh phù hợp: ${bestImageMatch}`);
        continue;
      }
      
      // Cập nhật hình ảnh trong cơ sở dữ liệu
      await pool.query(
        "UPDATE products SET images = ARRAY[$1] WHERE id = $2",
        [bestImageMatch, product.id]
      );
      
      console.log(`Đã cập nhật hình ảnh cho sản phẩm #${product.id}: ${product.name} -> ${bestImageMatch}`);
      updatedCount++;
    }
    
    console.log(`Hoàn thành cập nhật ${updatedCount} sản phẩm với hình ảnh phù hợp!`);
    
  } catch (error) {
    console.error('Lỗi khi cập nhật hình ảnh sản phẩm:', error);
  } finally {
    await pool.end();
  }
}

// Chạy hàm chính
updatePhoneImages().catch(console.error);