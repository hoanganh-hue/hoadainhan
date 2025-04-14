/**
 * Script đơn giản để tải và thiết lập hình ảnh thực tế cho iPhone từ CellphoneS.
 * Script này sẽ tải các hình ảnh thực tế và lưu trữ chúng trong thư mục public.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// URL hình ảnh thực tế cho các model iPhone (từ CellphoneS)
const IPHONE_IMAGES = {
  'iphone-11': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-11-do-1-1-1-org.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-11-tim-1-1-1-org.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-11-trang-1-2.jpg'
  ],
  'iphone-11-pro': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-11-pro-gold-1-1-org.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-11-pro-black-1-1-org.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-11-pro-silver-1-1-org.jpg'
  ],
  'iphone-11-pro-max': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-11-pro-max-gold-1-org.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-11-pro-max-black-1-org.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-11-pro-max-silver-1-org.jpg'
  ],
  'iphone-se-2022': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-se-black-600x600.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-se-red-600x600.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-se-white-600x600.jpg'
  ],
  'iphone-12-mini': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-12-mini-blue-1-600x600.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-12-mini-green-1-600x600.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-12-mini-red-1-600x600.jpg'
  ],
  'iphone-12': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-12_2__1.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-12_1__1.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-12_3__1.jpg'
  ],
  'iphone-12-pro': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-12-pro-grey.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-12-pro-blue.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-12-pro-gold.png'
  ],
  'iphone-12-pro-max': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/p/h/photo_2020-10-13_22-12-24.jpg_1_2_1.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/p/h/photo_2020-10-13_22-12-24.jpg_1_1_1.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/p/h/photo_2020-10-13_22-12-24.jpg_1_3_1.png'
  ],
  'iphone-13-mini': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-mini-blue-1.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-mini-pink-1.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-mini-red-1.jpg'
  ],
  'iphone-13': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-pink-1.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-blue-1.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-midnight-1.jpg'
  ],
  'iphone-13-pro': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-pro-silver-1.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-pro-gold-1.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-pro-sierra-blue-1.jpg'
  ],
  'iphone-13-pro-max': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-pro-max-gold-1.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-pro-max-sierra-blue-1.jpg',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-13-pro-max-graphite-1.jpg'
  ],
  'iphone-14-plus': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-plus-red.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-plus-purple.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-plus-blue.png'
  ],
  'iphone-14': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-blue.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-purple.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-red.png'
  ],
  'iphone-14-pro': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-pro-gold.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-pro-purple.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-pro-black.png'
  ],
  'iphone-14-pro-max': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-pro-max-purple.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-pro-max-gold.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-14-pro-max-silver.png'
  ],
  'iphone-15': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-yellow_1.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-pink_1.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-green_1.png'
  ],
  'iphone-15-plus': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-plus-black_1.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-plus-blue_1.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-plus-green_1.png'
  ],
  'iphone-15-pro': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-pro-blue_4.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-pro-white_1.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-pro-black_4.png'
  ],
  'iphone-15-pro-max': [
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-pro-max-black_1.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-pro-max-blue_1.png',
    'https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/i/p/iphone-15-pro-max-white_1.png'
  ]
};

// Tạo thư mục nếu chưa tồn tại
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Đã tạo thư mục: ${directory}`);
  }
}

// Tải hình ảnh từ URL
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Lỗi HTTP: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Đã tải thành công: ${filePath}`);
        resolve(true);
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Thiết lập và tải hình ảnh iPhone
async function setupiPhoneImages() {
  try {
    // Tạo thư mục lưu trữ hình ảnh
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const imagesDir = path.join(__dirname, 'public', 'images', 'phones', 'real');
    ensureDirectoryExists(imagesDir);
    
    console.log('Bắt đầu tải hình ảnh iPhone từ CellphoneS...');
    
    // Lấy danh sách sản phẩm iPhone từ database
    const iPhoneProducts = await prisma.products.findMany({
      where: {
        categoryId: 12, // ID danh mục iPhone
      }
    });
    
    console.log(`Đã tìm thấy ${iPhoneProducts.length} sản phẩm iPhone trong database`);
    
    // Cập nhật hình ảnh cho từng sản phẩm
    for (const product of iPhoneProducts) {
      const slug = product.slug;
      const baseSlug = slug.split('-').slice(0, -2).join('-'); // Lấy slug cơ bản (không bao gồm dung lượng)
      
      console.log(`Đang xử lý sản phẩm: ${product.name}, slug: ${slug}, baseSlug: ${baseSlug}`);
      
      // Kiểm tra xem model có trong danh sách không
      if (IPHONE_IMAGES[baseSlug]) {
        const imageUrls = IPHONE_IMAGES[baseSlug];
        const downloadedImages = [];
        
        // Tải và lưu trữ hình ảnh
        for (let i = 0; i < imageUrls.length; i++) {
          const imageUrl = imageUrls[i];
          const imageName = `${slug}-${i + 1}.jpg`;
          const imagePath = path.join(imagesDir, imageName);
          const relativePath = `/images/phones/real/${imageName}`;
          
          try {
            await downloadImage(imageUrl, imagePath);
            downloadedImages.push(relativePath);
          } catch (error) {
            console.error(`Lỗi khi tải hình ảnh ${imageUrl}:`, error);
          }
        }
        
        // Cập nhật đường dẫn hình ảnh trong database
        if (downloadedImages.length > 0) {
          await prisma.products.update({
            where: { id: product.id },
            data: { images: downloadedImages }
          });
          console.log(`Đã cập nhật ${downloadedImages.length} hình ảnh cho ${product.name}`);
        }
      } else {
        console.log(`Không tìm thấy hình ảnh cho model ${baseSlug}`);
      }
    }
    
    console.log('Hoàn tất tải và cập nhật hình ảnh iPhone!');
  } catch (error) {
    console.error('Lỗi khi thiết lập hình ảnh iPhone:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy chương trình
setupiPhoneImages()
  .then(() => {
    console.log('Hoàn tất chương trình');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Lỗi chương trình:', error);
    process.exit(1);
  });