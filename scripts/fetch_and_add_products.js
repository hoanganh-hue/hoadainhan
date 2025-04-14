/**
 * Script để tải và thêm 300 sản phẩm điện thoại và 200 sản phẩm điện tử vào database
 * Lấy dữ liệu từ cellphones.com.vn và các nguồn thay thế nếu cần
 */

// Import các module với xử lý cho CommonJS modules
import pkg from 'pg';
const { Pool } = pkg;

import axios from 'axios';
import cheerio from 'cheerio';
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules don't have __dirname, so we need to create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo folder lưu ảnh nếu chưa tồn tại
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'products');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Tạo folder riêng cho ảnh điện thoại và điện tử
const phoneImagesDir = path.join(imagesDir, 'phones');
if (!fs.existsSync(phoneImagesDir)) {
  fs.mkdirSync(phoneImagesDir, { recursive: true });
}

const electronicsImagesDir = path.join(imagesDir, 'electronics');
if (!fs.existsSync(electronicsImagesDir)) {
  fs.mkdirSync(electronicsImagesDir, { recursive: true });
}

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Cấu hình axios và user agent để tránh bị chặn
const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
  },
  timeout: 30000,
});

/**
 * Chuyển đổi tên sản phẩm thành slug URL
 */
function generateSlug(text) {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'vi',
    replacement: '-'
  });
}

/**
 * Tải hình ảnh và lưu vào máy chủ
 */
async function downloadImage(url, localPath) {
  try {
    // Kiểm tra nếu file đã tồn tại
    if (fs.existsSync(localPath)) {
      console.log(`File đã tồn tại: ${localPath}`);
      return true;
    }

    // Lấy hình ảnh
    const response = await axiosInstance.get(url, { responseType: 'arraybuffer' });

    // Lưu hình ảnh
    fs.writeFileSync(localPath, response.data);
    console.log(`Đã tải hình ảnh: ${localPath}`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi tải hình ảnh từ ${url}:`, error.message);
    return false;
  }
}

/**
 * Tạo mô tả sản phẩm cho điện thoại
 */
function generatePhoneDescription(productName, productDetails = {}) {
  const details = productDetails || {};
  const display = details.display || 'màn hình cao cấp, hiển thị sắc nét';
  const processor = details.processor || 'chip xử lý hiệu năng cao';
  const camera = details.camera || 'hệ thống camera chất lượng';
  const battery = details.battery || 'pin dung lượng lớn, sử dụng cả ngày dài';
  const features = details.features || 'nhiều tính năng hiện đại và tiện lợi';

  return `
${productName} là một chiếc điện thoại thông minh hiện đại với ${display}. 
Sản phẩm được trang bị ${processor}, đem lại khả năng xử lý mạnh mẽ cho mọi tác vụ. 
Với ${camera}, chiếc điện thoại này cho phép bạn lưu giữ những khoảnh khắc đáng nhớ một cách sắc nét và chân thực. 
Đặc biệt, ${productName} còn được trang bị ${battery}, đảm bảo trải nghiệm sử dụng liên tục. 
Ngoài ra, sản phẩm còn có ${features}, mang lại trải nghiệm tuyệt vời cho người dùng.`;
}

/**
 * Tạo mô tả sản phẩm cho thiết bị điện tử
 */
function generateElectronicsDescription(productName, productType, productDetails = {}) {
  const details = productDetails || {};
  const quality = details.quality || 'chất lượng cao';
  const features = details.features || 'nhiều tính năng hiện đại';
  const design = details.design || 'thiết kế sang trọng, hiện đại';
  const performance = details.performance || 'hiệu suất mạnh mẽ';
  const brand = details.brand || 'thương hiệu uy tín';

  let description = '';

  switch (productType.toLowerCase()) {
    case 'laptop':
      description = `
${productName} là một chiếc laptop ${quality} đến từ ${brand}. 
Với ${performance}, laptop này đáp ứng tốt nhu cầu làm việc, học tập và giải trí. 
Sản phẩm có ${design}, dễ dàng mang theo bên mình. 
${productName} được trang bị ${features}, giúp nâng cao trải nghiệm sử dụng của người dùng.`;
      break;
    case 'tablet':
      description = `
${productName} là một chiếc máy tính bảng ${quality} với ${design}. 
Sản phẩm trang bị ${performance}, đáp ứng mọi nhu cầu từ giải trí đến công việc. 
Với màn hình hiển thị sắc nét, ${productName} mang đến trải nghiệm xem phim, đọc sách tuyệt vời. 
Ngoài ra, sản phẩm còn có ${features}, phù hợp với nhiều đối tượng người dùng khác nhau.`;
      break;
    case 'tai nghe':
    case 'earphone':
    case 'headphone':
      description = `
${productName} là một sản phẩm tai nghe ${quality} đến từ ${brand}. 
Với ${design}, tai nghe này không chỉ đẹp mắt mà còn vô cùng thoải mái khi đeo. 
Sản phẩm mang đến chất lượng âm thanh vượt trội, tái tạo âm thanh một cách chân thực và sống động. 
${productName} còn được trang bị ${features}, nâng cao trải nghiệm nghe nhạc của người dùng.`;
      break;
    case 'loa':
    case 'speaker':
      description = `
${productName} là một sản phẩm loa ${quality} với ${design}. 
Sản phẩm mang đến chất lượng âm thanh vượt trội, âm bass mạnh mẽ và treble trong trẻo. 
Với ${performance}, loa này phù hợp cho cả không gian nhỏ và lớn. 
${productName} còn được trang bị ${features}, tăng tính tiện ích cho người dùng.`;
      break;
    case 'camera':
      description = `
${productName} là một chiếc camera ${quality} với ${design}. 
Sản phẩm có khả năng chụp ảnh và quay video với chất lượng tuyệt vời, bắt trọn mọi khoảnh khắc một cách sắc nét. 
Với ${performance}, camera này phù hợp cho cả người mới và những nhiếp ảnh gia chuyên nghiệp. 
${productName} còn được trang bị ${features}, mang đến trải nghiệm sử dụng tuyệt vời.`;
      break;
    case 'smart watch':
    case 'đồng hồ thông minh':
      description = `
${productName} là một chiếc đồng hồ thông minh ${quality} với ${design}. 
Sản phẩm không chỉ hiển thị thời gian mà còn có nhiều tính năng thông minh như theo dõi sức khỏe, thông báo tin nhắn, cuộc gọi. 
Với ${performance}, đồng hồ này hoạt động mượt mà và ổn định. 
${productName} là một phụ kiện công nghệ không thể thiếu đối với những người yêu thích công nghệ.`;
      break;
    default:
      description = `
${productName} là một sản phẩm điện tử ${quality} với ${design}. 
Sản phẩm mang đến ${performance}, đáp ứng tốt nhu cầu sử dụng của người dùng. 
${productName} được trang bị ${features}, nâng cao trải nghiệm sử dụng hàng ngày. 
Đây là một lựa chọn tuyệt vời cho những ai đang tìm kiếm một sản phẩm điện tử chất lượng cao.`;
  }

  return description;
}

/**
 * Xác định loại sản phẩm điện tử từ tên sản phẩm
 */
function getProductTypeFromName(productName) {
  const nameLower = productName.toLowerCase();
  
  if (nameLower.includes('laptop') || nameLower.includes('macbook')) {
    return 'laptop';
  } else if (nameLower.includes('ipad') || nameLower.includes('tablet') || nameLower.includes('máy tính bảng')) {
    return 'tablet';
  } else if (nameLower.includes('tai nghe') || nameLower.includes('airpods') || nameLower.includes('earphone') || nameLower.includes('headphone')) {
    return 'tai nghe';
  } else if (nameLower.includes('loa') || nameLower.includes('speaker')) {
    return 'loa';
  } else if (nameLower.includes('camera') || nameLower.includes('máy ảnh')) {
    return 'camera';
  } else if (nameLower.includes('đồng hồ') || nameLower.includes('watch') || nameLower.includes('apple watch')) {
    return 'smart watch';
  } else {
    return 'electronics';
  }
}

/**
 * Lấy thông tin sản phẩm điện thoại từ cellphones.com.vn
 */
async function fetchPhoneProducts() {
  try {
    console.log('Bắt đầu lấy dữ liệu sản phẩm điện thoại từ cellphones.com.vn...');
    
    // Mảng chứa sản phẩm từ các nguồn khác nhau
    const products = [];
    
    try {
      // Lấy từ cellphones.com.vn
      console.log('Đang lấy dữ liệu từ cellphones.com.vn...');
      const response = await axiosInstance.get('https://cellphones.com.vn/mobile.html');
      const $ = cheerio.load(response.data);
      
      // Thu thập thông tin sản phẩm từ danh sách
      $('.product-list .cate-pro-short').each((index, element) => {
        try {
          // Giới hạn số lượng sản phẩm
          if (products.length >= 300) return false;

          const $element = $(element);
          
          // Tên sản phẩm
          const name = $element.find('.product__name a').text().trim();
          
          // Giá gốc và giá khuyến mãi
          const priceText = $element.find('.product__price--regular').text().trim().replace(/[^0-9]/g, '');
          const salePriceText = $element.find('.product__price--show').text().trim().replace(/[^0-9]/g, '');
          
          const price = priceText ? parseInt(priceText) : null;
          const salePrice = salePriceText ? parseInt(salePriceText) : null;
          
          // Hình ảnh
          const imgSrc = $element.find('.product__img img').attr('src') || 
                        $element.find('.product__img img').attr('data-src');
          
          // Tính phần trăm giảm giá
          let discount = 0;
          if (price && salePrice && price > salePrice) {
            discount = Math.round(((price - salePrice) / price) * 100);
          }
          
          // Kiểm tra dữ liệu hợp lệ
          if (name && (price || salePrice) && imgSrc) {
            products.push({
              name,
              price: salePrice || price,
              originalPrice: price,
              discount,
              image: imgSrc,
              link: $element.find('.product__name a').attr('href'),
              source: 'cellphones.com.vn'
            });
          }
        } catch (error) {
          console.error('Lỗi khi xử lý phần tử sản phẩm:', error);
        }
      });

      // Lấy thêm từ trang 2 nếu cần
      if (products.length < 300) {
        const page2Response = await axiosInstance.get('https://cellphones.com.vn/mobile.html?page=2');
        const $page2 = cheerio.load(page2Response.data);
        
        $page2('.product-list .cate-pro-short').each((index, element) => {
          // Giới hạn số lượng sản phẩm
          if (products.length >= 300) return false;
          
          const $element = $(element);
          
          // Tên sản phẩm
          const name = $element.find('.product__name a').text().trim();
          
          // Giá gốc và giá khuyến mãi
          const priceText = $element.find('.product__price--regular').text().trim().replace(/[^0-9]/g, '');
          const salePriceText = $element.find('.product__price--show').text().trim().replace(/[^0-9]/g, '');
          
          const price = priceText ? parseInt(priceText) : null;
          const salePrice = salePriceText ? parseInt(salePriceText) : null;
          
          // Hình ảnh
          const imgSrc = $element.find('.product__img img').attr('src') || 
                        $element.find('.product__img img').attr('data-src');
          
          // Tính phần trăm giảm giá
          let discount = 0;
          if (price && salePrice && price > salePrice) {
            discount = Math.round(((price - salePrice) / price) * 100);
          }
          
          // Kiểm tra dữ liệu hợp lệ
          if (name && (price || salePrice) && imgSrc) {
            products.push({
              name,
              price: salePrice || price,
              originalPrice: price,
              discount,
              image: imgSrc,
              link: $element.find('.product__name a').attr('href'),
              source: 'cellphones.com.vn'
            });
          }
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu từ cellphones.com.vn:', error.message);
    }
    
    // Nếu vẫn chưa đủ 300 sản phẩm, thử lấy từ nguồn thay thế (hcm.thegioididong.com)
    if (products.length < 300) {
      try {
        console.log('Đang lấy dữ liệu từ thegioididong.com...');
        const tgddResponse = await axiosInstance.get('https://www.thegioididong.com/dtdd');
        const $tgdd = cheerio.load(tgddResponse.data);
        
        $tgdd('.listproduct li').each((index, element) => {
          // Giới hạn số lượng sản phẩm
          if (products.length >= 300) return false;
          
          const $element = $tgdd(element);
          
          // Tên sản phẩm
          const name = $element.find('h3').text().trim();
          
          // Giá gốc và giá khuyến mãi
          const priceText = $element.find('.price').text().trim().replace(/[^0-9]/g, '');
          const oldPriceText = $element.find('.price-old').text().trim().replace(/[^0-9]/g, '');
          
          const price = oldPriceText ? parseInt(oldPriceText) : parseInt(priceText);
          const salePrice = oldPriceText ? parseInt(priceText) : null;
          
          // Hình ảnh
          const imgSrc = $element.find('img').attr('src') || $element.find('img').attr('data-src');
          
          // Tính phần trăm giảm giá
          let discount = 0;
          if (price && salePrice && price > salePrice) {
            discount = Math.round(((price - salePrice) / price) * 100);
          }
          
          // Kiểm tra dữ liệu hợp lệ
          if (name && price && imgSrc) {
            products.push({
              name,
              price: salePrice || price,
              originalPrice: price,
              discount,
              image: imgSrc,
              link: 'https://www.thegioididong.com' + $element.find('a').attr('href'),
              source: 'thegioididong.com'
            });
          }
        });
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ thegioididong.com:', error.message);
      }
    }
    
    // Nếu vẫn chưa đủ 300 sản phẩm, thử lấy từ nguồn thứ ba (fptshop.com.vn)
    if (products.length < 300) {
      try {
        console.log('Đang lấy dữ liệu từ fptshop.com.vn...');
        const fptResponse = await axiosInstance.get('https://fptshop.com.vn/dien-thoai');
        const $fpt = cheerio.load(fptResponse.data);
        
        $fpt('.cdt-product').each((index, element) => {
          // Giới hạn số lượng sản phẩm
          if (products.length >= 300) return false;
          
          const $element = $fpt(element);
          
          // Tên sản phẩm
          const name = $element.find('.cdt-product__name').text().trim();
          
          // Giá gốc và giá khuyến mãi
          const priceText = $element.find('.progress').text().trim().replace(/[^0-9]/g, '');
          const oldPriceText = $element.find('.strike-price').text().trim().replace(/[^0-9]/g, '');
          
          const price = oldPriceText ? parseInt(oldPriceText) : parseInt(priceText);
          const salePrice = oldPriceText ? parseInt(priceText) : null;
          
          // Hình ảnh
          const imgSrc = $element.find('img').attr('src') || $element.find('img').attr('data-src');
          
          // Tính phần trăm giảm giá
          let discount = 0;
          if (price && salePrice && price > salePrice) {
            discount = Math.round(((price - salePrice) / price) * 100);
          }
          
          // Kiểm tra dữ liệu hợp lệ
          if (name && price && imgSrc) {
            products.push({
              name,
              price: salePrice || price,
              originalPrice: price,
              discount,
              image: imgSrc,
              link: 'https://fptshop.com.vn' + $element.find('a').attr('href'),
              source: 'fptshop.com.vn'
            });
          }
        });
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ fptshop.com.vn:', error.message);
      }
    }
    
    console.log(`Đã thu thập được ${products.length} sản phẩm điện thoại từ các nguồn.`);
    
    // Xử lý sản phẩm và tạo dữ liệu để lưu vào database
    const detailedProducts = [];
    
    for (let i = 0; i < Math.min(products.length, 300); i++) {
      const product = products[i];
      
      try {
        console.log(`Đang xử lý sản phẩm điện thoại ${i+1}/${Math.min(products.length, 300)}: ${product.name}`);
        
        // Tạo slug từ tên sản phẩm
        const productSlug = generateSlug(product.name);
        
        // Tạo thư mục cho thương hiệu
        const brandName = product.name.split(' ')[0].toLowerCase();
        const brandDir = path.join(phoneImagesDir, brandName);
        if (!fs.existsSync(brandDir)) {
          fs.mkdirSync(brandDir, { recursive: true });
        }
        
        // Tải và lưu hình ảnh chính
        const mainImageExt = path.extname(product.image) || '.jpg';
        const mainImageFilename = `${productSlug}-main${mainImageExt}`;
        const mainImageLocalPath = path.join(brandDir, mainImageFilename);
        const mainImageSuccess = await downloadImage(product.image, mainImageLocalPath);
        
        // Đường dẫn tương đối để sử dụng trong database
        const mainImageRelativePath = mainImageSuccess 
          ? `/images/products/phones/${brandName}/${mainImageFilename}`
          : '';
        
        // Thêm 2-3 hình ảnh giả lập (sản phẩm giống nhau từ các góc nhìn khác)
        const additionalImagesPaths = [];
        
        // Nếu tải được hình ảnh chính, tạo thêm 2-3 hình ảnh từ các góc khác
        if (mainImageSuccess) {
          for (let j = 1; j <= Math.floor(Math.random() * 2) + 2; j++) { // 2-3 hình phụ
            const imgFilename = `${productSlug}-${j}${mainImageExt}`;
            const imgLocalPath = path.join(brandDir, imgFilename);
            
            // Copy hình ảnh chính sang (giả lập nhiều góc nhìn)
            fs.copyFileSync(mainImageLocalPath, imgLocalPath);
            
            const imgRelativePath = `/images/products/phones/${brandName}/${imgFilename}`;
            additionalImagesPaths.push(imgRelativePath);
          }
        }
        
        // Tạo mô tả sản phẩm
        const description = generatePhoneDescription(product.name);
        
        // Tạo mảng hình ảnh cuối cùng
        const images = [mainImageRelativePath, ...additionalImagesPaths].filter(Boolean);
        
        // Thêm vào danh sách sản phẩm chi tiết
        detailedProducts.push({
          name: product.name,
          slug: productSlug,
          price: product.originalPrice || product.price,
          sale_price: product.originalPrice ? product.price : null,
          discount: product.discount,
          images,
          description,
          quantity: Math.floor(Math.random() * 100) + 20, // 20-120 sản phẩm
          rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0 rating
          total_sales: Math.floor(Math.random() * 500) + 10, // 10-510 sales
          is_featured: Math.random() < 0.2, // 20% cơ hội là featured
          is_flash_sale: Math.random() < 0.15, // 15% cơ hội là flash sale
        });
        
      } catch (error) {
        console.error(`Lỗi khi xử lý sản phẩm ${product.name}:`, error);
      }
    }
    
    console.log(`Đã xử lý xong ${detailedProducts.length} sản phẩm điện thoại chi tiết`);
    return detailedProducts.slice(0, 300); // Đảm bảo chỉ lấy đúng 300 sản phẩm
    
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sản phẩm điện thoại:', error);
    return [];
  }
}

/**
 * Lấy thông tin sản phẩm điện tử từ cellphones.com.vn và các nguồn thay thế
 */
async function fetchElectronicsProducts() {
  try {
    console.log('Bắt đầu lấy dữ liệu sản phẩm điện tử...');
    
    // Mảng chứa sản phẩm từ các nguồn khác nhau
    const products = [];
    
    // Các danh mục điện tử và URL tương ứng
    const categories = [
      { url: 'https://cellphones.com.vn/laptop.html', name: 'laptop' },
      { url: 'https://cellphones.com.vn/tablet.html', name: 'tablet' },
      { url: 'https://cellphones.com.vn/am-thanh.html', name: 'audio' },
      { url: 'https://cellphones.com.vn/dong-ho-thong-minh.html', name: 'smartwatch' }
    ];
    
    // Thử lấy từ cellphones.com.vn trước
    for (const category of categories) {
      if (products.length >= 200) break;
      
      try {
        console.log(`Đang lấy dữ liệu từ cellphones.com.vn - danh mục ${category.name}...`);
        const response = await axiosInstance.get(category.url);
        const $ = cheerio.load(response.data);
        
        $('.product-list .cate-pro-short').each((index, element) => {
          // Giới hạn số lượng sản phẩm
          if (products.length >= 200) return false;
          
          try {
            const $element = $(element);
            
            // Tên sản phẩm
            const name = $element.find('.product__name a').text().trim();
            
            // Giá gốc và giá khuyến mãi
            const priceText = $element.find('.product__price--regular').text().trim().replace(/[^0-9]/g, '');
            const salePriceText = $element.find('.product__price--show').text().trim().replace(/[^0-9]/g, '');
            
            const price = priceText ? parseInt(priceText) : null;
            const salePrice = salePriceText ? parseInt(salePriceText) : null;
            
            // Hình ảnh
            const imgSrc = $element.find('.product__img img').attr('src') || 
                          $element.find('.product__img img').attr('data-src');
            
            // Tính phần trăm giảm giá
            let discount = 0;
            if (price && salePrice && price > salePrice) {
              discount = Math.round(((price - salePrice) / price) * 100);
            }
            
            // Kiểm tra dữ liệu hợp lệ
            if (name && (price || salePrice) && imgSrc) {
              products.push({
                name,
                price: salePrice || price,
                originalPrice: price,
                discount,
                image: imgSrc,
                link: $element.find('.product__name a').attr('href'),
                category: category.name,
                source: 'cellphones.com.vn'
              });
            }
          } catch (error) {
            console.error('Lỗi khi xử lý phần tử sản phẩm điện tử:', error);
          }
        });
      } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu từ cellphones.com.vn - danh mục ${category.name}:`, error.message);
      }
    }
    
    // Nếu vẫn chưa đủ, thử lấy từ thegioididong.com
    if (products.length < 200) {
      // Các danh mục điện tử trên thegioididong.com
      const tgddCategories = [
        { url: 'https://www.thegioididong.com/laptop', name: 'laptop' },
        { url: 'https://www.thegioididong.com/may-tinh-bang', name: 'tablet' },
        { url: 'https://www.thegioididong.com/dong-ho-thong-minh', name: 'smartwatch' },
        { url: 'https://www.thegioididong.com/tai-nghe', name: 'headphone' }
      ];
      
      for (const category of tgddCategories) {
        if (products.length >= 200) break;
        
        try {
          console.log(`Đang lấy dữ liệu từ thegioididong.com - danh mục ${category.name}...`);
          const response = await axiosInstance.get(category.url);
          const $ = cheerio.load(response.data);
          
          $('.listproduct li').each((index, element) => {
            // Giới hạn số lượng sản phẩm
            if (products.length >= 200) return false;
            
            try {
              const $element = $(element);
              
              // Tên sản phẩm
              const name = $element.find('h3').text().trim();
              
              // Giá gốc và giá khuyến mãi
              const priceText = $element.find('.price').text().trim().replace(/[^0-9]/g, '');
              const oldPriceText = $element.find('.price-old').text().trim().replace(/[^0-9]/g, '');
              
              const price = oldPriceText ? parseInt(oldPriceText) : parseInt(priceText);
              const salePrice = oldPriceText ? parseInt(priceText) : null;
              
              // Hình ảnh
              const imgSrc = $element.find('img').attr('src') || $element.find('img').attr('data-src');
              
              // Tính phần trăm giảm giá
              let discount = 0;
              if (price && salePrice && price > salePrice) {
                discount = Math.round(((price - salePrice) / price) * 100);
              }
              
              // Kiểm tra dữ liệu hợp lệ
              if (name && price && imgSrc) {
                products.push({
                  name,
                  price: salePrice || price,
                  originalPrice: price,
                  discount,
                  image: imgSrc,
                  link: 'https://www.thegioididong.com' + $element.find('a').attr('href'),
                  category: category.name,
                  source: 'thegioididong.com'
                });
              }
            } catch (error) {
              console.error('Lỗi khi xử lý phần tử sản phẩm điện tử từ thegioididong.com:', error);
            }
          });
        } catch (error) {
          console.error(`Lỗi khi lấy dữ liệu từ thegioididong.com - danh mục ${category.name}:`, error.message);
        }
      }
    }
    
    // Nếu vẫn chưa đủ, thử lấy từ fptshop.com.vn
    if (products.length < 200) {
      // Các danh mục điện tử trên fptshop.com.vn
      const fptCategories = [
        { url: 'https://fptshop.com.vn/may-tinh-xach-tay', name: 'laptop' },
        { url: 'https://fptshop.com.vn/may-tinh-bang', name: 'tablet' },
        { url: 'https://fptshop.com.vn/dong-ho-thong-minh', name: 'smartwatch' },
        { url: 'https://fptshop.com.vn/tai-nghe', name: 'headphone' }
      ];
      
      for (const category of fptCategories) {
        if (products.length >= 200) break;
        
        try {
          console.log(`Đang lấy dữ liệu từ fptshop.com.vn - danh mục ${category.name}...`);
          const response = await axiosInstance.get(category.url);
          const $ = cheerio.load(response.data);
          
          $('.cdt-product').each((index, element) => {
            // Giới hạn số lượng sản phẩm
            if (products.length >= 200) return false;
            
            try {
              const $element = $(element);
              
              // Tên sản phẩm
              const name = $element.find('.cdt-product__name').text().trim();
              
              // Giá gốc và giá khuyến mãi
              const priceText = $element.find('.progress').text().trim().replace(/[^0-9]/g, '');
              const oldPriceText = $element.find('.strike-price').text().trim().replace(/[^0-9]/g, '');
              
              const price = oldPriceText ? parseInt(oldPriceText) : parseInt(priceText);
              const salePrice = oldPriceText ? parseInt(priceText) : null;
              
              // Hình ảnh
              const imgSrc = $element.find('img').attr('src') || $element.find('img').attr('data-src');
              
              // Tính phần trăm giảm giá
              let discount = 0;
              if (price && salePrice && price > salePrice) {
                discount = Math.round(((price - salePrice) / price) * 100);
              }
              
              // Kiểm tra dữ liệu hợp lệ
              if (name && price && imgSrc) {
                products.push({
                  name,
                  price: salePrice || price,
                  originalPrice: price,
                  discount,
                  image: imgSrc,
                  link: 'https://fptshop.com.vn' + $element.find('a').attr('href'),
                  category: category.name,
                  source: 'fptshop.com.vn'
                });
              }
            } catch (error) {
              console.error('Lỗi khi xử lý phần tử sản phẩm điện tử từ fptshop.com.vn:', error);
            }
          });
        } catch (error) {
          console.error(`Lỗi khi lấy dữ liệu từ fptshop.com.vn - danh mục ${category.name}:`, error.message);
        }
      }
    }
    
    console.log(`Đã thu thập được ${products.length} sản phẩm điện tử từ các nguồn.`);
    
    // Xử lý sản phẩm và tạo dữ liệu để lưu vào database
    const detailedProducts = [];
    
    for (let i = 0; i < Math.min(products.length, 200); i++) {
      const product = products[i];
      
      try {
        console.log(`Đang xử lý sản phẩm điện tử ${i+1}/${Math.min(products.length, 200)}: ${product.name}`);
        
        // Xác định loại sản phẩm
        const productType = getProductTypeFromName(product.name);
        
        // Tạo slug từ tên sản phẩm
        const productSlug = generateSlug(product.name);
        
        // Tạo thư mục cho loại sản phẩm
        const productTypeDir = path.join(electronicsImagesDir, productType);
        if (!fs.existsSync(productTypeDir)) {
          fs.mkdirSync(productTypeDir, { recursive: true });
        }
        
        // Tải và lưu hình ảnh chính
        const mainImageExt = path.extname(product.image) || '.jpg';
        const mainImageFilename = `${productSlug}-main${mainImageExt}`;
        const mainImageLocalPath = path.join(productTypeDir, mainImageFilename);
        const mainImageSuccess = await downloadImage(product.image, mainImageLocalPath);
        
        // Đường dẫn tương đối để sử dụng trong database
        const mainImageRelativePath = mainImageSuccess 
          ? `/images/products/electronics/${productType}/${mainImageFilename}`
          : '';
        
        // Thêm 2-3 hình ảnh giả lập (sản phẩm giống nhau từ các góc nhìn khác)
        const additionalImagesPaths = [];
        
        // Nếu tải được hình ảnh chính, tạo thêm 2-3 hình ảnh từ các góc khác
        if (mainImageSuccess) {
          for (let j = 1; j <= Math.floor(Math.random() * 2) + 2; j++) { // 2-3 hình phụ
            const imgFilename = `${productSlug}-${j}${mainImageExt}`;
            const imgLocalPath = path.join(productTypeDir, imgFilename);
            
            // Copy hình ảnh chính sang (giả lập nhiều góc nhìn)
            fs.copyFileSync(mainImageLocalPath, imgLocalPath);
            
            const imgRelativePath = `/images/products/electronics/${productType}/${imgFilename}`;
            additionalImagesPaths.push(imgRelativePath);
          }
        }
        
        // Tạo mô tả sản phẩm
        const description = generateElectronicsDescription(product.name, productType, {
          brand: product.name.split(' ')[0]
        });
        
        // Tạo mảng hình ảnh cuối cùng
        const images = [mainImageRelativePath, ...additionalImagesPaths].filter(Boolean);
        
        // Thêm vào danh sách sản phẩm chi tiết
        detailedProducts.push({
          name: product.name,
          slug: productSlug,
          price: product.originalPrice || product.price,
          sale_price: product.originalPrice ? product.price : null,
          discount: product.discount,
          images,
          description,
          quantity: Math.floor(Math.random() * 100) + 20, // 20-120 sản phẩm
          rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0 rating
          total_sales: Math.floor(Math.random() * 500) + 10, // 10-510 sales
          is_featured: Math.random() < 0.2, // 20% cơ hội là featured
          is_flash_sale: Math.random() < 0.15, // 15% cơ hội là flash sale
          productType
        });
        
      } catch (error) {
        console.error(`Lỗi khi xử lý sản phẩm ${product.name}:`, error);
      }
    }
    
    console.log(`Đã xử lý xong ${detailedProducts.length} sản phẩm điện tử chi tiết`);
    return detailedProducts.slice(0, 200); // Đảm bảo chỉ lấy đúng 200 sản phẩm
    
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sản phẩm điện tử:', error);
    return [];
  }
}

/**
 * Thêm sản phẩm điện thoại vào cơ sở dữ liệu
 */
async function insertPhoneProducts(phoneProducts) {
  try {
    console.log(`Bắt đầu thêm ${phoneProducts.length} sản phẩm điện thoại vào database...`);
    
    // Lấy ID của danh mục Điện thoại
    const { rows: categories } = await pool.query(
      "SELECT id FROM categories WHERE slug = 'dien-thoai'"
    );
    
    if (categories.length === 0) {
      throw new Error('Không tìm thấy danh mục Điện thoại trong database');
    }
    
    const categoryId = categories[0].id;
    
    // Lấy danh sách shopId để phân phối sản phẩm
    const { rows: shops } = await pool.query(
      "SELECT id FROM shops ORDER BY id LIMIT 10"
    );
    
    if (shops.length === 0) {
      throw new Error('Không tìm thấy shop nào trong database');
    }
    
    // Thêm từng sản phẩm vào database
    let successCount = 0;
    
    for (const product of phoneProducts) {
      try {
        // Chọn ngẫu nhiên một shop
        const shopId = shops[Math.floor(Math.random() * shops.length)].id;
        
        // Tạo flash sale date (nếu có flash sale)
        const flashSaleEnd = product.is_flash_sale 
          ? new Date(Date.now() + Math.floor(Math.random() * 7 + 3) * 24 * 60 * 60 * 1000) // 3-10 ngày
          : null;
        
        // Thêm sản phẩm vào database
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
            product.name,
            product.slug,
            product.description,
            product.price,
            product.sale_price,
            product.quantity,
            product.images,
            product.rating,
            product.total_sales,
            product.is_featured,
            product.is_flash_sale,
            flashSaleEnd,
            product.discount,
          ]
        );
        
        successCount++;
        console.log(`Đã thêm sản phẩm điện thoại #${rows[0].id}: ${product.name}`);
      } catch (error) {
        console.error(`Lỗi khi thêm sản phẩm ${product.name}:`, error.message);
      }
    }
    
    console.log(`Đã thêm thành công ${successCount}/${phoneProducts.length} sản phẩm điện thoại`);
    return successCount;
    
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm điện thoại vào database:', error);
    throw error;
  }
}

/**
 * Thêm sản phẩm điện tử vào cơ sở dữ liệu
 */
async function insertElectronicsProducts(electronicsProducts) {
  try {
    console.log(`Bắt đầu thêm ${electronicsProducts.length} sản phẩm điện tử vào database...`);
    
    // Lấy ID của danh mục Điện tử
    const { rows: categories } = await pool.query(
      "SELECT id FROM categories WHERE slug = 'dien-tu'"
    );
    
    if (categories.length === 0) {
      throw new Error('Không tìm thấy danh mục Điện tử trong database');
    }
    
    const categoryId = categories[0].id;
    
    // Lấy danh sách shopId để phân phối sản phẩm
    const { rows: shops } = await pool.query(
      "SELECT id FROM shops ORDER BY id LIMIT 10"
    );
    
    if (shops.length === 0) {
      throw new Error('Không tìm thấy shop nào trong database');
    }
    
    // Thêm từng sản phẩm vào database
    let successCount = 0;
    
    for (const product of electronicsProducts) {
      try {
        // Chọn ngẫu nhiên một shop
        const shopId = shops[Math.floor(Math.random() * shops.length)].id;
        
        // Tạo flash sale date (nếu có flash sale)
        const flashSaleEnd = product.is_flash_sale 
          ? new Date(Date.now() + Math.floor(Math.random() * 7 + 3) * 24 * 60 * 60 * 1000) // 3-10 ngày
          : null;
        
        // Thêm sản phẩm vào database
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
            product.name,
            product.slug,
            product.description,
            product.price,
            product.sale_price,
            product.quantity,
            product.images,
            product.rating,
            product.total_sales,
            product.is_featured,
            product.is_flash_sale,
            flashSaleEnd,
            product.discount,
          ]
        );
        
        successCount++;
        console.log(`Đã thêm sản phẩm điện tử #${rows[0].id}: ${product.name}`);
      } catch (error) {
        console.error(`Lỗi khi thêm sản phẩm ${product.name}:`, error.message);
      }
    }
    
    console.log(`Đã thêm thành công ${successCount}/${electronicsProducts.length} sản phẩm điện tử`);
    return successCount;
    
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm điện tử vào database:', error);
    throw error;
  }
}

/**
 * Hàm chính thực thi
 */
async function main() {
  try {
    console.log('===== BẮT ĐẦU TẢI VÀ THÊM SẢN PHẨM =====');
    
    // Lấy dữ liệu sản phẩm
    const phoneProducts = await fetchPhoneProducts();
    console.log(`Đã lấy được ${phoneProducts.length} sản phẩm điện thoại`);
    
    const electronicsProducts = await fetchElectronicsProducts();
    console.log(`Đã lấy được ${electronicsProducts.length} sản phẩm điện tử`);
    
    // Thêm sản phẩm vào database
    const phoneCount = await insertPhoneProducts(phoneProducts);
    const electronicsCount = await insertElectronicsProducts(electronicsProducts);
    
    console.log(`===== HOÀN THÀNH =====`);
    console.log(`Đã thêm ${phoneCount} sản phẩm điện thoại`);
    console.log(`Đã thêm ${electronicsCount} sản phẩm điện tử`);
    
    // Đóng kết nối database
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi trong quá trình thực thi:', error);
    
    // Đóng kết nối database
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