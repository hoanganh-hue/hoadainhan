/**
 * Script để cập nhật hình ảnh sản phẩm cho 200 điện thoại với hình ảnh chính thức
 * Sử dụng thư viện hình ảnh chính thức với nền trắng cho từng thương hiệu
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kết nối tới cơ sở dữ liệu
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Dictionary các hình ảnh chính thức theo thương hiệu
const OFFICIAL_PHONE_IMAGES = {
  "Samsung": [
    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=800&auto=format&fit=crop"
  ],
  "Apple": [
    "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708",
    "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-blue?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692991293540",
    "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-blue?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1661026123322",
    "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-se-finish-select-202207-midnight?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1655316263304",
    "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-13-finish-select-202207-6-1inch-pink?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1657641867367"
  ],
  "Xiaomi": [
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=800&auto=format&fit=crop"
  ],
  "OPPO": [
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543069190-f90D9f021514?q=80&w=800&auto=format&fit=crop"
  ],
  "Vivo": [
    "https://asia-exstatic-vivofs.vivo.com/PSee2l50xoirPK7y/1707306627861/7b1951739f4ba31eafb8c5be1fcbca02.png",
    "https://asia-exstatic-vivofs.vivo.com/PSee2l50xoirPK7y/1709616131466/9c3ca9bac42f908c4212b0f2d6c2d31c.png",
    "https://asia-exstatic-vivofs.vivo.com/PSee2l50xoirPK7y/1699940773106/60a44b68be2c73356a49fea4444cb58c.png",
    "https://asia-exstatic-vivofs.vivo.com/PSee2l50xoirPK7y/1686211051244/90f6b6ae6eeea6da88f69f3d4f58a347.png",
    "https://asia-exstatic-vivofs.vivo.com/PSee2l50xoirPK7y/1701772341323/38a8a9f0d8cf5f06a52a5ae79e697caa.png"
  ],
  "realme": [
    "https://image01.realme.net/general/20230911/1694427057248.png",
    "https://image01.realme.net/general/20240301/1709269255702.png",
    "https://image01.realme.net/general/20230602/1685677244275.png",
    "https://image01.realme.net/general/20231020/1697789058562.png",
    "https://image01.realme.net/general/20230926/1695698752440.png"
  ],
  "Nokia": [
    "https://www.91-img.com/gallery_images_uploads/f/9/f95a52aa3f48d9b4b35607176bc1aedef8f76bd5.jpg",
    "https://images.ctfassets.net/wcfotm6rrl7u/1YVRYJkziuIXgDzwIwXsk2/8ce1a8bdaeb9e71c8aaf6dc12a3ed8e3/nokia_XR21-DTC-desktop-recta-black.png",
    "https://images.ctfassets.net/wcfotm6rrl7u/7ztMvvN6Qj6IPu3WrcXrni/83f93eb4f5adca1cc5e3e2f3bbef4561/nokia_C32-DTC-desktop.png",
    "https://images.ctfassets.net/wcfotm6rrl7u/4vfz8Mfua45cQfFoW9z90j/1802f3e81c2fb2f8abd0bee654eb31f3/nokia_G42_5G-DTC_hero-desktop-pink.png",
    "https://images.ctfassets.net/wcfotm6rrl7u/5D6KFWmrlMeqq1sTj8vy3J/a17c9b8c0fb9cbd825c40dbad38d8a0f/nokia_C22-DTC-Hero-Desktop.png"
  ],
  "Motorola": [
    "https://motorolain.vtexassets.com/arquivos/ids/157119-1200-auto",
    "https://motorolaus.vtexassets.com/arquivos/ids/163197-800-auto",
    "https://motorolaus.vtexassets.com/arquivos/ids/158498-800-auto",
    "https://motorolaus.vtexassets.com/arquivos/ids/156884-800-auto",
    "https://motorolaus.vtexassets.com/arquivos/ids/162667-800-auto"
  ],
  "Google": [
    "https://lh3.googleusercontent.com/X4RrrQlL-S64tbFtYQIXMjEh0hHULGJ0BDgzsYeP4VOpjQtPJedd_m_Pcpj1gHyE3qF1ZagLITUTb-8UGBXzOx_x5ioMK9rWQjLZdAI",
    "https://lh3.googleusercontent.com/Doj-VlXKY-1niQ8-aLh8UVHcfjVEYj0EbZsr0YE4miv9Uh_-Wq5cZ1dAZSXn2z5E_n2k16eQTmouVZvhFAbbFjLlY_h6ybGUwFw9PA",
    "https://lh3.googleusercontent.com/qPZfYl_hmDwFEO5u5G0LLTVvfwbROhN9BbJ7jgTk8_fBt_gIkkAMvXgUjxZ-rYWncGhkvlpQHN1E79xL0Ii1abCJsLbPVg4YgX3l",
    "https://lh3.googleusercontent.com/cFgXCKJKv7F-WHZGQTbas7nNgr2_S92mwYpG2oiswqhR-fa1ytUOe_bG4zKEa__zxEL5kHnZIzLJVzJQg70SLKqGOi09X4_5TnF4",
    "https://lh3.googleusercontent.com/7HTlFjNf9hHORgMQkgKe-qNEesBZW9XZQw5g-BtnWYBbFGZ5iPM-7QQR6cYkPBVS6hXSLWjw_f7dOy32fWPb--8lyPeRq9UoIGvT"
  ],
  "TECNO": [
    "https://www.tecno-mobile.com/storage/images/product/list/phantom-v-flip.png",
    "https://www.tecno-mobile.com/storage/images/product/list/camon-30-series.png",
    "https://www.tecno-mobile.com/storage/images/product/list/pova-5-series.png",
    "https://www.tecno-mobile.com/storage/images/product/list/spark-20-series.png",
    "https://www.tecno-mobile.com/storage/images/product/list/pop-8.png"
  ]
};

// Fallback image cho các thương hiệu không có trong danh sách
const FALLBACK_PHONE_IMAGES = [
  "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1598965402089-897ce52e8355?q=80&w=800&auto=format&fit=crop"
];

function getBrand(productName) {
  // Lấy thương hiệu từ tên sản phẩm
  const brands = [
    "Samsung", "Apple", "Xiaomi", "OPPO", "Vivo", "realme", "Nokia", 
    "Motorola", "TECNO", "Google", "Honor", "Itel", "Asus", 
    "OnePlus", "Lenovo", "Sony", "Masstel", "Nubia", "Nothing", "TCL"
  ];
  
  // Tìm thương hiệu trong tên sản phẩm
  for (const brand of brands) {
    if (productName.includes(brand)) {
      return brand;
    }
    
    // Kiểm tra cả phiên bản viết thường
    if (productName.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Trường hợp đặc biệt
  if (productName.includes("iPhone")) return "Apple";
  if (productName.includes("Galaxy")) return "Samsung";
  if (productName.includes("Redmi") || productName.includes("POCO")) return "Xiaomi";
  if (productName.includes("Reno")) return "OPPO";
  
  return null; // Không xác định được thương hiệu
}

function getBestImageForProduct(productName) {
  const brand = getBrand(productName);
  
  if (!brand) {
    // Nếu không xác định được thương hiệu, trả về hình ảnh mặc định
    return FALLBACK_PHONE_IMAGES[Math.floor(Math.random() * FALLBACK_PHONE_IMAGES.length)];
  }
  
  // Nếu có hình ảnh chính thức cho thương hiệu
  if (OFFICIAL_PHONE_IMAGES[brand]) {
    return OFFICIAL_PHONE_IMAGES[brand][Math.floor(Math.random() * OFFICIAL_PHONE_IMAGES[brand].length)];
  }
  
  // Nếu không có hình ảnh chính thức, trả về hình ảnh mặc định
  return FALLBACK_PHONE_IMAGES[Math.floor(Math.random() * FALLBACK_PHONE_IMAGES.length)];
}

async function updateAllPhoneImages() {
  try {
    console.log("Bắt đầu cập nhật hình ảnh cho tất cả sản phẩm điện thoại...");
    
    // Lấy tất cả sản phẩm điện thoại
    const result = await pool.query(`
      SELECT * FROM "products" 
      WHERE "category_id" = 3 
      ORDER BY "id"
    `);
    
    const phones = result.rows;
    console.log(`Tìm thấy ${phones.length} sản phẩm điện thoại`);
    
    // Tạo thư mục images nếu chưa tồn tại
    const baseDir = "public/images/phones";
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    
    // Tạo thư mục cho từng thương hiệu
    const brands = [...new Set(phones.map(phone => getBrand(phone.name) || "unknown"))];
    for (const brand of brands) {
      const brandDir = path.join(baseDir, brand.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (!fs.existsSync(brandDir)) {
        fs.mkdirSync(brandDir, { recursive: true });
      }
    }
    
    // Cập nhật hình ảnh cho từng sản phẩm
    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i];
      console.log(`Đang xử lý sản phẩm ${i+1}/${phones.length}: ${phone.name}`);
      
      // Lấy thương hiệu và hình ảnh phù hợp
      const brand = getBrand(phone.name) || "unknown";
      const imageUrl = getBestImageForProduct(phone.name);
      
      // Tạo tên file cho hình ảnh
      const brandFolder = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = `${brandFolder}_${Date.now()}_${i}.jpg`;
      const localPath = path.join(baseDir, brandFolder, fileName);
      
      try {
        // Tải hình ảnh
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(localPath, response.data);
        console.log(`✓ Đã tải hình ảnh: ${localPath}`);
        
        // Cập nhật cơ sở dữ liệu
        const relativePath = localPath.replace('public', '');
        await pool.query(
          `UPDATE "products" SET "images" = $1 WHERE "id" = $2`,
          [[relativePath], phone.id]
        );
        console.log(`✓ Đã cập nhật hình ảnh cho ${phone.name} (ID: ${phone.id}): ${relativePath}`);
      } catch (error) {
        console.error(`❌ Lỗi xử lý hình ảnh cho ${phone.name}: ${error.message}`);
      }
    }
    
    console.log("Đã hoàn tất cập nhật hình ảnh cho tất cả sản phẩm điện thoại");
  } catch (error) {
    console.error(`❌ Lỗi: ${error.message}`);
  } finally {
    await pool.end();
  }
}

// Chạy script
updateAllPhoneImages();