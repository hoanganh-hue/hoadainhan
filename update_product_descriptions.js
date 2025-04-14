/**
 * Script để cập nhật mô tả sản phẩm điện thoại và điện tử cho phù hợp với từng sản phẩm cụ thể
 */

import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Kết nối với PostgreSQL
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const pool = new Pool({ connectionString });

/**
 * Tạo mô tả chi tiết cho điện thoại dựa trên thương hiệu và tên sản phẩm
 */
function generatePhoneDescription(brandName, productName) {
  // Phân tích tên sản phẩm để xác định loại dòng điện thoại
  const lowercaseName = productName.toLowerCase();
  let series = '';
  let screenSize = '';
  let ram = '';
  let storage = '';
  let camera = '';
  let battery = '';
  let chipset = '';
  let special = '';
  
  // Xác định dòng điện thoại
  if (lowercaseName.includes('iphone')) {
    if (lowercaseName.includes('15 pro max') || lowercaseName.includes('15pro max')) {
      series = 'iPhone 15 Pro Max';
      screenSize = '6.7 inch Super Retina XDR OLED';
      ram = '8GB';
      camera = 'Camera chính 48MP, camera góc siêu rộng 12MP, camera tele 12MP với zoom quang học 5x';
      chipset = 'Chip A17 Pro';
      battery = '4422 mAh';
      special = 'Khung Titanium, Action Button, cổng USB-C';
    } else if (lowercaseName.includes('15 pro') || lowercaseName.includes('15pro')) {
      series = 'iPhone 15 Pro';
      screenSize = '6.1 inch Super Retina XDR OLED';
      ram = '8GB';
      camera = 'Camera chính 48MP, camera góc siêu rộng 12MP, camera tele 12MP với zoom quang học 3x';
      chipset = 'Chip A17 Pro';
      battery = '3274 mAh';
      special = 'Khung Titanium, Action Button, cổng USB-C';
    } else if (lowercaseName.includes('15 plus') || lowercaseName.includes('15plus')) {
      series = 'iPhone 15 Plus';
      screenSize = '6.7 inch Super Retina XDR OLED';
      ram = '6GB';
      camera = 'Camera chính 48MP, camera góc siêu rộng 12MP';
      chipset = 'Chip A16 Bionic';
      battery = '4383 mAh';
      special = 'Dynamic Island, cổng USB-C';
    } else if (lowercaseName.includes('15')) {
      series = 'iPhone 15';
      screenSize = '6.1 inch Super Retina XDR OLED';
      ram = '6GB';
      camera = 'Camera chính 48MP, camera góc siêu rộng 12MP';
      chipset = 'Chip A16 Bionic';
      battery = '3349 mAh';
      special = 'Dynamic Island, cổng USB-C';
    } else if (lowercaseName.includes('14 pro max') || lowercaseName.includes('14pro max')) {
      series = 'iPhone 14 Pro Max';
      screenSize = '6.7 inch Super Retina XDR OLED';
      ram = '6GB';
      camera = 'Camera chính 48MP, camera góc siêu rộng 12MP, camera tele 12MP với zoom quang học 3x';
      chipset = 'Chip A16 Bionic';
      battery = '4323 mAh';
      special = 'Dynamic Island, màn hình Always-On';
    } else if (lowercaseName.includes('14 pro') || lowercaseName.includes('14pro')) {
      series = 'iPhone 14 Pro';
      screenSize = '6.1 inch Super Retina XDR OLED';
      ram = '6GB';
      camera = 'Camera chính 48MP, camera góc siêu rộng 12MP, camera tele 12MP với zoom quang học 3x';
      chipset = 'Chip A16 Bionic';
      battery = '3200 mAh';
      special = 'Dynamic Island, màn hình Always-On';
    } else if (lowercaseName.includes('14 plus') || lowercaseName.includes('14plus')) {
      series = 'iPhone 14 Plus';
      screenSize = '6.7 inch Super Retina XDR OLED';
      ram = '6GB';
      camera = 'Camera kép 12MP (chính và góc siêu rộng)';
      chipset = 'Chip A15 Bionic';
      battery = '4325 mAh';
      special = 'Phát hiện va chạm';
    } else if (lowercaseName.includes('14')) {
      series = 'iPhone 14';
      screenSize = '6.1 inch Super Retina XDR OLED';
      ram = '6GB';
      camera = 'Camera kép 12MP (chính và góc siêu rộng)';
      chipset = 'Chip A15 Bionic';
      battery = '3279 mAh';
      special = 'Phát hiện va chạm';
    } else if (lowercaseName.includes('13')) {
      series = 'iPhone 13';
      screenSize = '6.1 inch Super Retina XDR OLED';
      ram = '4GB';
      camera = 'Camera kép 12MP (chính và góc siêu rộng)';
      chipset = 'Chip A15 Bionic';
      battery = '3240 mAh';
      special = 'Chế độ điện ảnh';
    }
  } else if (lowercaseName.includes('samsung') || lowercaseName.includes('galaxy')) {
    if (lowercaseName.includes('s24 ultra') || lowercaseName.includes('s24ultra')) {
      series = 'Samsung Galaxy S24 Ultra';
      screenSize = '6.8 inch Dynamic AMOLED 2X, 120Hz';
      ram = '12GB';
      camera = 'Camera chính 200MP, camera góc siêu rộng 12MP, camera tele 50MP với zoom quang học 5x, camera tele 10MP với zoom quang học 3x';
      chipset = 'Snapdragon 8 Gen 3';
      battery = '5000 mAh';
      special = 'Bút S Pen tích hợp, Galaxy AI, khung Titanium';
    } else if (lowercaseName.includes('s24+') || lowercaseName.includes('s24 plus')) {
      series = 'Samsung Galaxy S24+';
      screenSize = '6.7 inch Dynamic AMOLED 2X, 120Hz';
      ram = '12GB';
      camera = 'Camera chính 50MP, camera góc siêu rộng 12MP, camera tele 10MP với zoom quang học 3x';
      chipset = 'Exynos 2400';
      battery = '4900 mAh';
      special = 'Galaxy AI, khung nhôm bền bỉ';
    } else if (lowercaseName.includes('s24')) {
      series = 'Samsung Galaxy S24';
      screenSize = '6.2 inch Dynamic AMOLED 2X, 120Hz';
      ram = '8GB';
      camera = 'Camera chính 50MP, camera góc siêu rộng 12MP, camera tele 10MP với zoom quang học 3x';
      chipset = 'Exynos 2400';
      battery = '4000 mAh';
      special = 'Galaxy AI, khung nhôm bền bỉ';
    } else if (lowercaseName.includes('s23 ultra') || lowercaseName.includes('s23ultra')) {
      series = 'Samsung Galaxy S23 Ultra';
      screenSize = '6.8 inch Dynamic AMOLED 2X, 120Hz';
      ram = '8GB/12GB';
      camera = 'Camera chính 200MP, camera góc siêu rộng 12MP, camera tele 10MP với zoom quang học 3x, camera tele 10MP với zoom quang học 10x';
      chipset = 'Snapdragon 8 Gen 2';
      battery = '5000 mAh';
      special = 'Bút S Pen tích hợp, khung nhôm Armor Aluminum';
    } else if (lowercaseName.includes('s23+') || lowercaseName.includes('s23 plus')) {
      series = 'Samsung Galaxy S23+';
      screenSize = '6.6 inch Dynamic AMOLED 2X, 120Hz';
      ram = '8GB';
      camera = 'Camera chính 50MP, camera góc siêu rộng 12MP, camera tele 10MP với zoom quang học 3x';
      chipset = 'Snapdragon 8 Gen 2';
      battery = '4700 mAh';
      special = 'Chống nước IP68, sạc nhanh 45W';
    } else if (lowercaseName.includes('s23')) {
      series = 'Samsung Galaxy S23';
      screenSize = '6.1 inch Dynamic AMOLED 2X, 120Hz';
      ram = '8GB';
      camera = 'Camera chính 50MP, camera góc siêu rộng 12MP, camera tele 10MP với zoom quang học 3x';
      chipset = 'Snapdragon 8 Gen 2';
      battery = '3900 mAh';
      special = 'Thiết kế nhỏ gọn, chống nước IP68';
    } else if (lowercaseName.includes('z fold5') || lowercaseName.includes('z fold 5')) {
      series = 'Samsung Galaxy Z Fold5';
      screenSize = 'Màn hình chính: 7.6 inch Dynamic AMOLED 2X, 120Hz. Màn hình ngoài: 6.2 inch Dynamic AMOLED 2X, 120Hz';
      ram = '12GB';
      camera = 'Camera chính 50MP, camera góc siêu rộng 12MP, camera tele 10MP với zoom quang học 3x';
      chipset = 'Snapdragon 8 Gen 2';
      battery = '4400 mAh';
      special = 'Thiết kế gập, màn hình lớn, S Pen tương thích';
    } else if (lowercaseName.includes('z flip5') || lowercaseName.includes('z flip 5')) {
      series = 'Samsung Galaxy Z Flip5';
      screenSize = 'Màn hình chính: 6.7 inch Dynamic AMOLED 2X, 120Hz. Màn hình ngoài: 3.4 inch Super AMOLED';
      ram = '8GB';
      camera = 'Camera kép 12MP (chính và góc siêu rộng)';
      chipset = 'Snapdragon 8 Gen 2';
      battery = '3700 mAh';
      special = 'Thiết kế gập, màn hình ngoài lớn';
    }
  } else if (lowercaseName.includes('xiaomi')) {
    if (lowercaseName.includes('14 ultra') || lowercaseName.includes('14ultra')) {
      series = 'Xiaomi 14 Ultra';
      screenSize = '6.73 inch AMOLED LTPO, 120Hz';
      ram = '12GB/16GB';
      camera = 'Camera chính 50MP Light Fusion 900, camera tele 50MP với zoom quang học 5x, camera góc siêu rộng 50MP, camera tele 50MP với zoom quang học 3.2x';
      chipset = 'Snapdragon 8 Gen 3';
      battery = '5000 mAh';
      special = 'Chụp ảnh chuyên nghiệp, sạc nhanh 90W';
    } else if (lowercaseName.includes('14') && (lowercaseName.includes('pro') || lowercaseName.includes('pro'))) {
      series = 'Xiaomi 14 Pro';
      screenSize = '6.73 inch AMOLED LTPO, 120Hz';
      ram = '12GB/16GB';
      camera = 'Camera chính 50MP Light Fusion 900, camera tele 50MP với zoom quang học 3.2x, camera góc siêu rộng 50MP';
      chipset = 'Snapdragon 8 Gen 3';
      battery = '4880 mAh';
      special = 'Sạc nhanh 120W, sạc không dây 50W';
    } else if (lowercaseName.includes('14')) {
      series = 'Xiaomi 14';
      screenSize = '6.36 inch AMOLED LTPO, 120Hz';
      ram = '8GB/12GB/16GB';
      camera = 'Camera chính 50MP Light Fusion 900, camera tele 50MP với zoom quang học 3.2x, camera góc siêu rộng 50MP';
      chipset = 'Snapdragon 8 Gen 3';
      battery = '4610 mAh';
      special = 'Sạc nhanh 90W, sạc không dây 50W';
    } else if (lowercaseName.includes('13') && (lowercaseName.includes('pro') || lowercaseName.includes('pro'))) {
      series = 'Xiaomi 13 Pro';
      screenSize = '6.73 inch AMOLED LTPO, 120Hz';
      ram = '8GB/12GB';
      camera = 'Camera chính 50MP IMX989, camera tele 50MP với zoom quang học 3.2x, camera góc siêu rộng 50MP';
      chipset = 'Snapdragon 8 Gen 2';
      battery = '4820 mAh';
      special = 'Ống kính Leica, sạc nhanh 120W';
    } else if (lowercaseName.includes('13')) {
      series = 'Xiaomi 13';
      screenSize = '6.36 inch AMOLED, 120Hz';
      ram = '8GB/12GB';
      camera = 'Camera chính 50MP, camera tele 10MP với zoom quang học 3.2x, camera góc siêu rộng 12MP';
      chipset = 'Snapdragon 8 Gen 2';
      battery = '4500 mAh';
      special = 'Ống kính Leica, thiết kế mỏng nhẹ';
    } else if (lowercaseName.includes('redmi note 13 pro') || lowercaseName.includes('redmi note13pro')) {
      series = 'Redmi Note 13 Pro';
      screenSize = '6.67 inch AMOLED, 120Hz';
      ram = '8GB/12GB';
      camera = 'Camera chính 200MP, camera góc siêu rộng 8MP, camera macro 2MP';
      chipset = 'MediaTek Dimensity 7200 Ultra';
      battery = '5000 mAh';
      special = 'Sạc nhanh 67W, chống nước IP54';
    } else if (lowercaseName.includes('redmi note 13') || lowercaseName.includes('redmi note13')) {
      series = 'Redmi Note 13';
      screenSize = '6.67 inch AMOLED, 120Hz';
      ram = '6GB/8GB/12GB';
      camera = 'Camera chính 108MP, camera góc siêu rộng 8MP, camera macro 2MP';
      chipset = 'MediaTek Helio G99-Ultra';
      battery = '5000 mAh';
      special = 'Sạc nhanh 33W, thiết kế mỏng nhẹ';
    }
  } else if (lowercaseName.includes('oppo')) {
    if (lowercaseName.includes('find x7 ultra') || lowercaseName.includes('find x7ultra')) {
      series = 'OPPO Find X7 Ultra';
      screenSize = '6.82 inch AMOLED LTPO, 120Hz';
      ram = '12GB/16GB';
      camera = 'Hệ thống 4 camera sau 50MP (chính, tele, góc siêu rộng, tele tiềm vọng với zoom quang học 6x)';
      chipset = 'Snapdragon 8 Gen 3';
      battery = '5000 mAh';
      special = 'Ống kính Hasselblad, sạc nhanh 100W';
    } else if (lowercaseName.includes('find x7 pro') || lowercaseName.includes('find x7pro')) {
      series = 'OPPO Find X7 Pro';
      screenSize = '6.78 inch AMOLED LTPO, 120Hz';
      ram = '12GB/16GB';
      camera = 'Hệ thống 4 camera sau 50MP (chính, tele, góc siêu rộng, tele với zoom quang học 3x)';
      chipset = 'MediaTek Dimensity 9300';
      battery = '5000 mAh';
      special = 'Ống kính Hasselblad, sạc nhanh 100W';
    } else if (lowercaseName.includes('find x7')) {
      series = 'OPPO Find X7';
      screenSize = '6.78 inch AMOLED LTPO, 120Hz';
      ram = '12GB/16GB';
      camera = 'Hệ thống 3 camera sau 50MP (chính, tele với zoom quang học 3x, góc siêu rộng)';
      chipset = 'MediaTek Dimensity 9300';
      battery = '5000 mAh';
      special = 'Ống kính Hasselblad, sạc nhanh 80W';
    } else if (lowercaseName.includes('reno 12 pro') || lowercaseName.includes('reno12pro')) {
      series = 'OPPO Reno12 Pro';
      screenSize = '6.7 inch AMOLED, 120Hz';
      ram = '8GB/12GB';
      camera = 'Camera chính 50MP, camera tele 50MP, camera góc siêu rộng 8MP';
      chipset = 'MediaTek Dimensity 8200';
      battery = '4800 mAh';
      special = 'Sạc nhanh 80W, thiết kế siêu mỏng';
    } else if (lowercaseName.includes('reno 12') || lowercaseName.includes('reno12')) {
      series = 'OPPO Reno12';
      screenSize = '6.7 inch AMOLED, 120Hz';
      ram = '8GB/12GB';
      camera = 'Camera chính 50MP, camera góc siêu rộng 8MP, camera tele 32MP';
      chipset = 'MediaTek Dimensity 8200';
      battery = '5000 mAh';
      special = 'Sạc nhanh 80W, thiết kế siêu mỏng';
    }
  } else if (lowercaseName.includes('vivo')) {
    if (lowercaseName.includes('x100 pro') || lowercaseName.includes('x100pro')) {
      series = 'vivo X100 Pro';
      screenSize = '6.78 inch AMOLED LTPO, 120Hz';
      ram = '12GB/16GB';
      camera = 'Camera chính 50MP, camera tele 50MP với zoom quang học 4.3x, camera góc siêu rộng 50MP';
      chipset = 'MediaTek Dimensity 9300';
      battery = '5400 mAh';
      special = 'Ống kính ZEISS, sạc nhanh 100W';
    } else if (lowercaseName.includes('x100')) {
      series = 'vivo X100';
      screenSize = '6.78 inch AMOLED LTPO, 120Hz';
      ram = '12GB/16GB';
      camera = 'Camera chính 50MP, camera tele 64MP với zoom quang học 3x, camera góc siêu rộng 50MP';
      chipset = 'MediaTek Dimensity 9300';
      battery = '5000 mAh';
      special = 'Ống kính ZEISS, sạc nhanh 120W';
    } else if (lowercaseName.includes('v30 pro') || lowercaseName.includes('v30pro')) {
      series = 'vivo V30 Pro';
      screenSize = '6.78 inch AMOLED, 120Hz';
      ram = '8GB/12GB';
      camera = 'Camera chính 50MP, camera góc siêu rộng 50MP, camera tele 50MP';
      chipset = 'MediaTek Dimensity 8200';
      battery = '5000 mAh';
      special = 'Ảnh chân dung Aura Light, sạc nhanh 80W';
    } else if (lowercaseName.includes('v30')) {
      series = 'vivo V30';
      screenSize = '6.78 inch AMOLED, 120Hz';
      ram = '8GB/12GB';
      camera = 'Camera chính 50MP, camera tele 50MP, camera góc siêu rộng 8MP';
      chipset = 'Snapdragon 7 Gen 3';
      battery = '5000 mAh';
      special = 'Ảnh chân dung Aura Light, sạc nhanh 80W';
    }
  }
  
  // Xác định RAM và bộ nhớ từ tên sản phẩm
  if (ram === '') {
    // Lấy thông tin RAM từ tên sản phẩm
    const ramMatch = lowercaseName.match(/(\d+)gb/);
    if (ramMatch) {
      ram = `${ramMatch[1]}GB`;
    } else {
      ram = '8GB'; // Giá trị mặc định
    }
  }
  
  // Tìm dung lượng bộ nhớ từ tên
  if (storage === '') {
    const storageMatch = lowercaseName.match(/(\d+)gb/);
    if (storageMatch && storageMatch.length > 0) {
      // Kiểm tra nếu có nhiều kết quả, lấy giá trị lớn nhất làm bộ nhớ
      if (storageMatch.length > 1) {
        const values = storageMatch.map(match => parseInt(match));
        storage = `${Math.max(...values)}GB`;
      } else {
        storage = `${storageMatch[1]}GB`;
      }
    } else {
      // Tìm theo cách khác, thường RAM/ROM được ghi như 6/128GB
      const ramRomMatch = lowercaseName.match(/(\d+)\/(\d+)gb/);
      if (ramRomMatch) {
        storage = `${ramRomMatch[2]}GB`;
      } else {
        storage = '128GB'; // Giá trị mặc định
      }
    }
  }
  
  // Tạo mô tả chi tiết
  let description = `Điện thoại ${series} `;
  
  if (screenSize) {
    description += `với màn hình ${screenSize}, `;
  }
  
  if (ram && storage) {
    description += `cấu hình mạnh mẽ ${ram} RAM, ${storage} bộ nhớ trong. `;
  } else if (ram) {
    description += `cấu hình mạnh mẽ ${ram} RAM. `;
  }
  
  if (camera) {
    description += `Hệ thống ${camera} cho chất lượng ảnh chụp chuyên nghiệp. `;
  }
  
  if (chipset) {
    description += `Hiệu năng vượt trội với ${chipset}. `;
  }
  
  if (battery) {
    description += `Pin ${battery} `;
  }
  
  if (special) {
    description += `với ${special}. `;
  }
  
  description += `Thiết kế cao cấp, hiện đại đến từ thương hiệu ${brandName}, ${productName} là sự lựa chọn hoàn hảo cho người dùng yêu thích công nghệ.`;
  
  return description;
}

/**
 * Tạo mô tả chi tiết cho sản phẩm điện tử
 */
function generateElectronicsDescription(productName, productType) {
  const lowercaseName = productName.toLowerCase();
  let description = '';
  
  // Sản phẩm laptop
  if (productType === 'laptop') {
    let brand = '';
    let series = '';
    let processor = '';
    let ram = '';
    let storage = '';
    let graphics = '';
    let display = '';
    let special = '';
    
    if (lowercaseName.includes('macbook')) {
      brand = 'Apple';
      if (lowercaseName.includes('pro')) {
        series = 'MacBook Pro';
        if (lowercaseName.includes('m3')) {
          processor = 'chip M3';
          special = 'hiệu năng mạnh mẽ với chip M3, hỗ trợ tốt các tác vụ đồ họa và xử lý video chuyên nghiệp';
        } else if (lowercaseName.includes('m2')) {
          processor = 'chip M2';
          special = 'hiệu năng vượt trội với chip M2, thời lượng pin dài và khả năng xử lý đa nhiệm mượt mà';
        } else if (lowercaseName.includes('m1')) {
          processor = 'chip M1';
          special = 'hiệu năng ấn tượng với chip M1, thời lượng pin dài và khả năng xử lý đa nhiệm mượt mà';
        }
        
        if (lowercaseName.includes('14')) {
          display = 'màn hình Liquid Retina XDR 14.2 inch';
        } else if (lowercaseName.includes('16')) {
          display = 'màn hình Liquid Retina XDR 16.2 inch';
        }
      } else if (lowercaseName.includes('air')) {
        series = 'MacBook Air';
        if (lowercaseName.includes('m3')) {
          processor = 'chip M3';
          special = 'thiết kế siêu mỏng nhẹ, hiệu năng mạnh mẽ với chip M3 và thời lượng pin cả ngày';
        } else if (lowercaseName.includes('m2')) {
          processor = 'chip M2';
          special = 'thiết kế siêu mỏng nhẹ, hiệu năng vượt trội với chip M2 và thời lượng pin dài';
        } else if (lowercaseName.includes('m1')) {
          processor = 'chip M1';
          special = 'thiết kế mỏng nhẹ, hiệu năng ấn tượng với chip M1 và thời lượng pin dài';
        }
        
        if (lowercaseName.includes('13')) {
          display = 'màn hình Liquid Retina 13.6 inch';
        } else if (lowercaseName.includes('15')) {
          display = 'màn hình Liquid Retina 15.3 inch';
        }
      }
      
      // Xác định RAM và bộ nhớ
      if (lowercaseName.includes('16gb')) {
        ram = '16GB unified memory';
      } else if (lowercaseName.includes('8gb')) {
        ram = '8GB unified memory';
      } else {
        ram = '8GB unified memory';
      }
      
      if (lowercaseName.includes('1tb')) {
        storage = 'ổ cứng SSD 1TB';
      } else if (lowercaseName.includes('512')) {
        storage = 'ổ cứng SSD 512GB';
      } else if (lowercaseName.includes('256')) {
        storage = 'ổ cứng SSD 256GB';
      } else {
        storage = 'ổ cứng SSD 256GB';
      }
      
      description = `Laptop ${series} với ${processor}, ${ram}, ${storage}, ${display}. Thiết bị với ${special}. Sản phẩm cao cấp từ ${brand} với thiết kế sang trọng, hiệu năng mạnh mẽ và chất lượng hoàn thiện hàng đầu. Thích hợp cho công việc sáng tạo, lập trình và giải trí.`;
      
    } else if (lowercaseName.includes('dell')) {
      brand = 'Dell';
      if (lowercaseName.includes('xps')) {
        series = 'XPS';
        special = 'thiết kế cao cấp, màn hình InfinityEdge với viền siêu mỏng và khả năng xử lý công việc chuyên nghiệp';
      } else if (lowercaseName.includes('inspiron')) {
        series = 'Inspiron';
        special = 'thiết kế hiện đại, đa dạng cấu hình phù hợp cho công việc văn phòng và giải trí';
      } else if (lowercaseName.includes('vostro')) {
        series = 'Vostro';
        special = 'thiết kế doanh nghiệp, bền bỉ và phù hợp cho công việc văn phòng';
      } else if (lowercaseName.includes('latitude')) {
        series = 'Latitude';
        special = 'thiết kế doanh nghiệp cao cấp, bảo mật tốt và độ bền cao';
      } else if (lowercaseName.includes('alienware')) {
        series = 'Alienware';
        special = 'hiệu năng gaming mạnh mẽ, hệ thống tản nhiệt tiên tiến và màn hình chất lượng cao';
      }
    } else if (lowercaseName.includes('hp')) {
      brand = 'HP';
      if (lowercaseName.includes('spectre')) {
        series = 'Spectre';
        special = 'thiết kế sang trọng, màn hình cảm ứng chất lượng cao và hiệu năng mạnh mẽ';
      } else if (lowercaseName.includes('envy')) {
        series = 'ENVY';
        special = 'thiết kế cao cấp, hiệu năng mạnh mẽ và màn hình sắc nét';
      } else if (lowercaseName.includes('pavilion')) {
        series = 'Pavilion';
        special = 'cân bằng giữa hiệu năng và giá thành, phù hợp cho sinh viên và người dùng văn phòng';
      } else if (lowercaseName.includes('omen')) {
        series = 'OMEN';
        special = 'hiệu năng gaming mạnh mẽ, màn hình tần số quét cao và hệ thống tản nhiệt hiệu quả';
      }
    } else if (lowercaseName.includes('lenovo')) {
      brand = 'Lenovo';
      if (lowercaseName.includes('thinkpad')) {
        series = 'ThinkPad';
        special = 'độ bền đạt chuẩn quân đội, bàn phím tốt nhất trong ngành và bảo mật doanh nghiệp';
      } else if (lowercaseName.includes('yoga')) {
        series = 'Yoga';
        special = 'thiết kế 2-trong-1 linh hoạt, màn hình cảm ứng xoay 360° và hiệu năng ổn định';
      } else if (lowercaseName.includes('ideapad')) {
        series = 'IdeaPad';
        special = 'giá cả phải chăng, đa dạng cấu hình và phù hợp cho nhiều nhu cầu sử dụng';
      } else if (lowercaseName.includes('legion')) {
        series = 'Legion';
        special = 'hiệu năng gaming mạnh mẽ, hệ thống tản nhiệt tiên tiến và màn hình tần số quét cao';
      }
    }
    
    // Xác định các thông số khác nếu chưa có
    if (processor === '') {
      if (lowercaseName.includes('intel')) {
        if (lowercaseName.includes('i9')) {
          processor = 'Intel Core i9';
        } else if (lowercaseName.includes('i7')) {
          processor = 'Intel Core i7';
        } else if (lowercaseName.includes('i5')) {
          processor = 'Intel Core i5';
        } else if (lowercaseName.includes('i3')) {
          processor = 'Intel Core i3';
        } else {
          processor = 'Intel Core';
        }
      } else if (lowercaseName.includes('amd') || lowercaseName.includes('ryzen')) {
        if (lowercaseName.includes('ryzen 9')) {
          processor = 'AMD Ryzen 9';
        } else if (lowercaseName.includes('ryzen 7')) {
          processor = 'AMD Ryzen 7';
        } else if (lowercaseName.includes('ryzen 5')) {
          processor = 'AMD Ryzen 5';
        } else if (lowercaseName.includes('ryzen 3')) {
          processor = 'AMD Ryzen 3';
        } else {
          processor = 'AMD Ryzen';
        }
      } else {
        processor = 'bộ vi xử lý mạnh mẽ';
      }
    }
    
    if (ram === '') {
      if (lowercaseName.includes('32gb')) {
        ram = '32GB RAM';
      } else if (lowercaseName.includes('16gb')) {
        ram = '16GB RAM';
      } else if (lowercaseName.includes('8gb')) {
        ram = '8GB RAM';
      } else {
        ram = 'RAM đủ lớn';
      }
    }
    
    if (storage === '') {
      if (lowercaseName.includes('2tb')) {
        storage = 'ổ cứng SSD 2TB';
      } else if (lowercaseName.includes('1tb')) {
        storage = 'ổ cứng SSD 1TB';
      } else if (lowercaseName.includes('512')) {
        storage = 'ổ cứng SSD 512GB';
      } else if (lowercaseName.includes('256')) {
        storage = 'ổ cứng SSD 256GB';
      } else {
        storage = 'ổ cứng SSD tốc độ cao';
      }
    }
    
    if (display === '') {
      if (lowercaseName.includes('17')) {
        display = 'màn hình 17 inch';
      } else if (lowercaseName.includes('16')) {
        display = 'màn hình 16 inch';
      } else if (lowercaseName.includes('15')) {
        display = 'màn hình 15.6 inch';
      } else if (lowercaseName.includes('14')) {
        display = 'màn hình 14 inch';
      } else if (lowercaseName.includes('13')) {
        display = 'màn hình 13.3 inch';
      } else {
        display = 'màn hình chất lượng cao';
      }
    }
    
    if (graphics === '') {
      if (lowercaseName.includes('rtx 4090')) {
        graphics = 'card đồ họa NVIDIA GeForce RTX 4090';
      } else if (lowercaseName.includes('rtx 4080')) {
        graphics = 'card đồ họa NVIDIA GeForce RTX 4080';
      } else if (lowercaseName.includes('rtx 4070')) {
        graphics = 'card đồ họa NVIDIA GeForce RTX 4070';
      } else if (lowercaseName.includes('rtx 4060')) {
        graphics = 'card đồ họa NVIDIA GeForce RTX 4060';
      } else if (lowercaseName.includes('rtx 4050')) {
        graphics = 'card đồ họa NVIDIA GeForce RTX 4050';
      } else if (lowercaseName.includes('rtx 30')) {
        graphics = 'card đồ họa NVIDIA GeForce RTX 30 series';
      } else if (lowercaseName.includes('rtx')) {
        graphics = 'card đồ họa NVIDIA GeForce RTX';
      } else if (lowercaseName.includes('gtx')) {
        graphics = 'card đồ họa NVIDIA GeForce GTX';
      } else if (lowercaseName.includes('radeon')) {
        graphics = 'card đồ họa AMD Radeon';
      } else if (lowercaseName.includes('iris')) {
        graphics = 'đồ họa Intel Iris Xe';
      } else {
        graphics = 'đồ họa tích hợp';
      }
    }
    
    // Nếu không phải là MacBook, tạo mô tả chung
    if (!lowercaseName.includes('macbook')) {
      description = `Laptop ${brand} ${series} với ${processor}, ${ram}, ${storage}, ${display} và ${graphics}. Sản phẩm với ${special}. Thiết kế hiện đại, hiệu năng ổn định và đa dạng cổng kết nối. Phù hợp cho công việc, học tập và giải trí.`;
    }
  } 
  // Sản phẩm TV
  else if (productType === 'tv') {
    let brand = '';
    let series = '';
    let size = '';
    let resolution = '';
    let technology = '';
    let smart = '';
    let special = '';
    
    // Xác định thương hiệu
    if (lowercaseName.includes('samsung')) {
      brand = 'Samsung';
      if (lowercaseName.includes('neo qled')) {
        technology = 'Neo QLED';
        special = 'công nghệ Quantum Mini LED, độ tương phản cao, màu sắc chân thực';
      } else if (lowercaseName.includes('qled')) {
        technology = 'QLED';
        special = 'công nghệ Quantum Dot, màu sắc rực rỡ, độ sáng cao';
      } else if (lowercaseName.includes('crystal uhd')) {
        technology = 'Crystal UHD';
        special = 'hình ảnh sắc nét, màu sắc tinh khiết';
      }
      
      smart = 'hệ điều hành Tizen OS, hỗ trợ đa dạng ứng dụng streaming';
    } 
    else if (lowercaseName.includes('lg')) {
      brand = 'LG';
      if (lowercaseName.includes('oled')) {
        technology = 'OLED';
        special = 'màu đen sâu, góc nhìn rộng, màu sắc chân thực';
      } else if (lowercaseName.includes('qned')) {
        technology = 'QNED';
        special = 'kết hợp công nghệ Quantum Dot và NanoCell, màu sắc rực rỡ, độ tương phản cao';
      } else if (lowercaseName.includes('nanocell')) {
        technology = 'NanoCell';
        special = 'màu sắc tinh khiết, góc nhìn rộng';
      }
      
      smart = 'hệ điều hành webOS, giao diện thân thiện, đa dạng ứng dụng';
    } 
    else if (lowercaseName.includes('sony')) {
      brand = 'Sony';
      if (lowercaseName.includes('bravia oled')) {
        technology = 'BRAVIA OLED';
        special = 'màu đen sâu, công nghệ XR OLED Contrast Pro, âm thanh vượt trội';
      } else if (lowercaseName.includes('bravia xr')) {
        technology = 'BRAVIA XR';
        special = 'bộ xử lý nhận thức XR, hình ảnh và âm thanh sống động như thật';
      } else if (lowercaseName.includes('bravia')) {
        technology = 'BRAVIA';
        special = 'công nghệ Triluminos Pro, màu sắc rực rỡ và chân thực';
      }
      
      smart = 'hệ điều hành Google TV, kho ứng dụng phong phú, tìm kiếm thông minh';
    }
    else if (lowercaseName.includes('tcl')) {
      brand = 'TCL';
      if (lowercaseName.includes('qled')) {
        technology = 'QLED';
        special = 'công nghệ Quantum Dot, màu sắc rực rỡ, giá cả hợp lý';
      } else if (lowercaseName.includes('mini led')) {
        technology = 'Mini LED';
        special = 'hàng nghìn vùng điều khiển đèn nền, độ tương phản cao';
      }
      
      smart = 'hệ điều hành Google TV hoặc Android TV, đa dạng ứng dụng giải trí';
    }
    
    // Xác định kích thước màn hình
    const sizeMatch = lowercaseName.match(/(\d{2})(\.\d+)?[\s-]?inch/);
    if (sizeMatch) {
      size = `${sizeMatch[1]} inch`;
    } else {
      // Tìm số 2 chữ số liên tiếp
      const numMatch = lowercaseName.match(/(\d{2})/);
      if (numMatch && parseInt(numMatch[1]) > 30 && parseInt(numMatch[1]) < 100) {
        size = `${numMatch[1]} inch`;
      } else {
        size = 'kích thước lớn';
      }
    }
    
    // Xác định độ phân giải
    if (lowercaseName.includes('8k')) {
      resolution = '8K';
    } else if (lowercaseName.includes('4k')) {
      resolution = '4K UHD';
    } else if (lowercaseName.includes('uhd')) {
      resolution = 'UHD';
    } else if (lowercaseName.includes('full hd') || lowercaseName.includes('fhd')) {
      resolution = 'Full HD';
    } else if (lowercaseName.includes('hd')) {
      resolution = 'HD';
    } else {
      resolution = 'độ phân giải cao';
    }
    
    // Tạo mô tả
    description = `TV ${brand} ${technology} ${size} với độ phân giải ${resolution}. Màn hình với ${special}, cung cấp trải nghiệm xem hình ảnh sắc nét, màu sắc sống động. Smart TV với ${smart}, kết nối Internet dễ dàng, hỗ trợ các ứng dụng phổ biến như Netflix, YouTube, Spotify. Thiết kế hiện đại, viền mỏng tinh tế, phù hợp với mọi không gian nội thất.`;
  }
  // Sản phẩm tai nghe, loa (âm thanh)
  else if (productType === 'audio') {
    let brand = '';
    let type = '';
    let wireless = false;
    let features = [];
    let special = '';
    
    // Xác định loại sản phẩm âm thanh
    if (lowercaseName.includes('tai nghe') || lowercaseName.includes('headphone') || lowercaseName.includes('earphone') || lowercaseName.includes('earbud')) {
      if (lowercaseName.includes('over-ear') || lowercaseName.includes('over ear')) {
        type = 'tai nghe chụp tai (over-ear)';
      } else if (lowercaseName.includes('on-ear') || lowercaseName.includes('on ear')) {
        type = 'tai nghe on-ear';
      } else if (lowercaseName.includes('in-ear') || lowercaseName.includes('in ear') || lowercaseName.includes('earbud')) {
        type = 'tai nghe nhét tai (in-ear)';
      } else {
        type = 'tai nghe';
      }
      
      // Kiểm tra có phải tai nghe không dây
      if (lowercaseName.includes('wireless') || lowercaseName.includes('bluetooth') || lowercaseName.includes('không dây')) {
        wireless = true;
        features.push('kết nối Bluetooth không dây');
      } else {
        features.push('kết nối có dây chất lượng cao');
      }
      
      // Kiểm tra tính năng chống ồn
      if (lowercaseName.includes('anc') || lowercaseName.includes('noise cancel') || lowercaseName.includes('chống ồn')) {
        features.push('công nghệ chống ồn chủ động');
      }
      
      // Kiểm tra chống nước
      if (lowercaseName.includes('waterproof') || lowercaseName.includes('water resistant') || lowercaseName.includes('ipx')) {
        features.push('khả năng chống nước/mồ hôi');
      }
    } 
    else if (lowercaseName.includes('loa') || lowercaseName.includes('speaker')) {
      if (lowercaseName.includes('soundbar')) {
        type = 'loa soundbar';
        if (lowercaseName.includes('subwoofer')) {
          features.push('đi kèm loa siêu trầm không dây');
        }
      } else if (lowercaseName.includes('bluetooth') || lowercaseName.includes('wireless') || lowercaseName.includes('không dây')) {
        type = 'loa bluetooth di động';
        wireless = true;
        features.push('kết nối không dây linh hoạt');
      } else if (lowercaseName.includes('smart') || lowercaseName.includes('thông minh')) {
        type = 'loa thông minh';
        wireless = true;
        features.push('tích hợp trợ lý ảo');
      } else if (lowercaseName.includes('bookshelf')) {
        type = 'loa kệ';
      } else if (lowercaseName.includes('tower') || lowercaseName.includes('floor')) {
        type = 'loa đứng';
      } else {
        type = 'loa';
      }
      
      // Kiểm tra chống nước cho loa
      if (lowercaseName.includes('waterproof') || lowercaseName.includes('water resistant') || lowercaseName.includes('ipx')) {
        features.push('khả năng chống nước');
      }
    }
    
    // Xác định thương hiệu
    if (lowercaseName.includes('sony')) {
      brand = 'Sony';
      if (type.includes('tai nghe')) {
        if (lowercaseName.includes('wh-1000') || lowercaseName.includes('wf-1000')) {
          features.push('chất lượng âm thanh vượt trội, công nghệ LDAC');
        }
      }
    } 
    else if (lowercaseName.includes('bose')) {
      brand = 'Bose';
      features.push('âm thanh cân bằng đặc trưng');
      if (type.includes('tai nghe')) {
        if (lowercaseName.includes('quietcomfort') || lowercaseName.includes('qc')) {
          features.push('công nghệ chống ồn hàng đầu thế giới');
        }
      }
    } 
    else if (lowercaseName.includes('jbl')) {
      brand = 'JBL';
      features.push('âm bass mạnh mẽ, thiết kế bền bỉ');
    } 
    else if (lowercaseName.includes('apple') || lowercaseName.includes('airpods')) {
      brand = 'Apple';
      if (lowercaseName.includes('airpods pro')) {
        features.push('khả năng chống ồn chủ động, âm thanh không gian');
        features.push('tích hợp hoàn hảo với hệ sinh thái Apple');
      } else if (lowercaseName.includes('airpods')) {
        features.push('kết nối nhanh chóng, chất lượng âm thanh trong trẻo');
        features.push('tích hợp hoàn hảo với hệ sinh thái Apple');
      }
    }
    else if (lowercaseName.includes('samsung') || lowercaseName.includes('galaxy buds')) {
      brand = 'Samsung';
      if (lowercaseName.includes('galaxy buds')) {
        features.push('âm thanh AKG tinh chỉnh');
        features.push('tích hợp tốt với thiết bị Galaxy');
      }
    }
    else if (lowercaseName.includes('sennheiser')) {
      brand = 'Sennheiser';
      features.push('âm thanh chi tiết, dải tần rộng');
      features.push('chất lượng xây dựng cao cấp');
    }
    
    // Thêm tính năng dựa trên tên sản phẩm
    if (lowercaseName.includes('gaming')) {
      features.push('tối ưu cho trải nghiệm chơi game');
    }
    if (lowercaseName.includes('bass') || lowercaseName.includes('extra bass')) {
      features.push('âm bass mạnh mẽ, sâu lắng');
    }
    if (lowercaseName.includes('hi-res') || lowercaseName.includes('hi res')) {
      features.push('hỗ trợ âm thanh độ phân giải cao');
    }
    
    // Mô tả pin nếu là thiết bị không dây
    if (wireless) {
      features.push('thời lượng pin dài');
    }
    
    // Tạo câu mô tả đặc biệt
    if (features.length > 0) {
      special = features.join(', ');
    }
    
    // Tạo mô tả
    if (type.includes('tai nghe')) {
      description = `${type.charAt(0).toUpperCase() + type.slice(1)} ${brand} với ${special}. Mang đến trải nghiệm nghe nhạc chất lượng cao, thoải mái khi đeo trong thời gian dài. Thiết kế hiện đại, phù hợp cho cả nghe nhạc và đàm thoại. Sản phẩm chính hãng, chất lượng vượt trội.`;
    } else {
      description = `${type.charAt(0).toUpperCase() + type.slice(1)} ${brand} với ${special}. Mang đến trải nghiệm âm thanh sống động, mạnh mẽ với âm bass dày và treble chi tiết. Thiết kế hiện đại, dễ dàng kết nối và sử dụng. Sản phẩm chính hãng, chất lượng âm thanh vượt trội.`;
    }
  }
  // Sản phẩm máy ảnh, camera
  else if (productType === 'camera') {
    let brand = '';
    let type = '';
    let resolution = '';
    let sensor = '';
    let features = [];
    
    // Xác định loại máy ảnh
    if (lowercaseName.includes('dslr')) {
      type = 'máy ảnh DSLR';
    } else if (lowercaseName.includes('mirrorless')) {
      type = 'máy ảnh mirrorless (không gương lật)';
    } else if (lowercaseName.includes('compact') || lowercaseName.includes('point and shoot')) {
      type = 'máy ảnh compact';
    } else if (lowercaseName.includes('action') || lowercaseName.includes('gopro')) {
      type = 'action camera';
    } else if (lowercaseName.includes('webcam')) {
      type = 'webcam';
    } else if (lowercaseName.includes('security') || lowercaseName.includes('cctv') || lowercaseName.includes('giám sát')) {
      type = 'camera giám sát';
    } else if (lowercaseName.includes('drone')) {
      type = 'camera drone';
    } else {
      type = 'máy ảnh kỹ thuật số';
    }
    
    // Xác định thương hiệu
    if (lowercaseName.includes('canon')) {
      brand = 'Canon';
      if (lowercaseName.includes('eos')) {
        if (lowercaseName.includes('r')) {
          features.push('công nghệ mirrorless tiên tiến');
        } else {
          features.push('hệ thống lấy nét nhanh chóng');
        }
      }
    } 
    else if (lowercaseName.includes('nikon')) {
      brand = 'Nikon';
      if (lowercaseName.includes('z')) {
        features.push('ngàm Z tiên tiến, chất lượng ảnh vượt trội');
      }
    } 
    else if (lowercaseName.includes('sony')) {
      brand = 'Sony';
      if (lowercaseName.includes('alpha') || lowercaseName.includes('a7') || lowercaseName.includes('a6')) {
        features.push('khả năng chụp trong điều kiện thiếu sáng tuyệt vời');
        features.push('hệ thống lấy nét tự động nhanh và chính xác');
      }
    } 
    else if (lowercaseName.includes('fujifilm') || lowercaseName.includes('fuji')) {
      brand = 'Fujifilm';
      features.push('màu sắc đặc trưng Fujifilm');
      if (lowercaseName.includes('x-t') || lowercaseName.includes('x-pro')) {
        features.push('thiết kế retro cổ điển');
      }
    }
    else if (lowercaseName.includes('gopro')) {
      brand = 'GoPro';
      features.push('chống nước, chống va đập');
      features.push('quay video chất lượng cao trong mọi điều kiện');
    }
    else if (lowercaseName.includes('dji')) {
      brand = 'DJI';
      if (lowercaseName.includes('osmo')) {
        features.push('công nghệ chống rung tiên tiến');
      } else {
        features.push('công nghệ bay và quay phim tiên tiến');
      }
    }
    else if (lowercaseName.includes('logitech')) {
      brand = 'Logitech';
      features.push('chất lượng hình ảnh rõ nét');
      features.push('tích hợp microphone chất lượng cao');
    }
    
    // Xác định độ phân giải
    const mpMatch = lowercaseName.match(/(\d+)mp/i);
    if (mpMatch) {
      resolution = `${mpMatch[1]} megapixel`;
    } else if (lowercaseName.includes('4k')) {
      resolution = 'độ phân giải 4K';
    } else if (lowercaseName.includes('1080p') || lowercaseName.includes('full hd')) {
      resolution = 'độ phân giải Full HD';
    } else if (lowercaseName.includes('720p') || lowercaseName.includes('hd')) {
      resolution = 'độ phân giải HD';
    } else {
      resolution = 'độ phân giải cao';
    }
    
    // Xác định cảm biến
    if (lowercaseName.includes('full-frame') || lowercaseName.includes('full frame')) {
      sensor = 'cảm biến full-frame';
      features.push('khả năng chụp trong điều kiện thiếu sáng tốt');
    } else if (lowercaseName.includes('aps-c') || lowercaseName.includes('apsc')) {
      sensor = 'cảm biến APS-C';
    } else if (lowercaseName.includes('micro four thirds') || lowercaseName.includes('m43')) {
      sensor = 'cảm biến Micro Four Thirds';
    } else if (lowercaseName.includes('1 inch')) {
      sensor = 'cảm biến 1 inch';
    } else {
      sensor = 'cảm biến chất lượng cao';
    }
    
    // Thêm các tính năng
    if (lowercaseName.includes('wifi') || lowercaseName.includes('wi-fi')) {
      features.push('kết nối WiFi');
    }
    if (lowercaseName.includes('bluetooth')) {
      features.push('kết nối Bluetooth');
    }
    if (lowercaseName.includes('touch') || lowercaseName.includes('cảm ứng')) {
      features.push('màn hình cảm ứng');
    }
    if (lowercaseName.includes('stabilization') || lowercaseName.includes('chống rung')) {
      features.push('công nghệ chống rung hình ảnh');
    }
    if (lowercaseName.includes('4k') || lowercaseName.includes('uhd')) {
      features.push('quay video 4K');
    }
    
    // Tạo mô tả
    const featureString = features.join(', ');
    
    if (type.includes('webcam')) {
      description = `${type.charAt(0).toUpperCase() + type.slice(1)} ${brand} với ${resolution}, ${featureString}. Thiết kế nhỏ gọn, dễ dàng gắn lên màn hình máy tính hoặc laptop. Cung cấp hình ảnh rõ nét cho các cuộc gọi video, học trực tuyến hoặc live stream. Sản phẩm chính hãng, chất lượng cao.`;
    } else if (type.includes('camera giám sát')) {
      description = `${type.charAt(0).toUpperCase() + type.slice(1)} ${brand} với ${resolution}, ${featureString}. Góc quan sát rộng, khả năng quan sát trong điều kiện thiếu sáng, lưu trữ đám mây an toàn. Dễ dàng lắp đặt và cài đặt, kết nối với điện thoại thông minh để giám sát từ xa. Sản phẩm chính hãng, bảo vệ an ninh cho gia đình và doanh nghiệp.`;
    } else {
      description = `${type.charAt(0).toUpperCase() + type.slice(1)} ${brand} với ${resolution}, ${sensor}, ${featureString}. Chụp ảnh sắc nét, màu sắc chân thực trong mọi điều kiện ánh sáng. Thiết kế nhỏ gọn, dễ dàng mang theo, phù hợp với cả người mới bắt đầu và nhiếp ảnh gia bán chuyên. Sản phẩm chính hãng, bảo hành uy tín.`;
    }
  }
  // Sản phẩm đồng hồ, thiết bị đeo
  else if (productType === 'wearable') {
    let brand = '';
    let type = '';
    let features = [];
    
    // Xác định loại thiết bị đeo
    if (lowercaseName.includes('smartwatch') || lowercaseName.includes('smart watch') || lowercaseName.includes('đồng hồ thông minh')) {
      type = 'đồng hồ thông minh';
    } else if (lowercaseName.includes('fitness tracker') || lowercaseName.includes('smart band') || lowercaseName.includes('vòng đeo')) {
      type = 'vòng đeo thông minh';
    } else {
      type = 'thiết bị đeo thông minh';
    }
    
    // Xác định thương hiệu
    if (lowercaseName.includes('apple') || lowercaseName.includes('watch')) {
      brand = 'Apple';
      if (lowercaseName.includes('series 9')) {
        features.push('chip S9 mạnh mẽ, màn hình luôn hiển thị');
      } else if (lowercaseName.includes('ultra')) {
        features.push('thiết kế chắc chắn, pin dài, GPS chính xác');
      } else if (lowercaseName.includes('se')) {
        features.push('thiết kế nhỏ gọn, đầy đủ tính năng cơ bản');
      }
      features.push('tích hợp hoàn hảo với hệ sinh thái Apple');
    }
    else if (lowercaseName.includes('samsung') || lowercaseName.includes('galaxy watch')) {
      brand = 'Samsung';
      features.push('màn hình Super AMOLED sắc nét');
      features.push('hệ điều hành Wear OS tiên tiến');
      if (lowercaseName.includes('galaxy watch 6')) {
        features.push('theo dõi sức khỏe toàn diện, phân tích giấc ngủ nâng cao');
      }
    }
    else if (lowercaseName.includes('garmin')) {
      brand = 'Garmin';
      features.push('dành cho người đam mê thể thao');
      features.push('GPS chính xác, thời lượng pin dài');
      features.push('phân tích chuyên sâu các chỉ số luyện tập');
    }
    else if (lowercaseName.includes('fitbit')) {
      brand = 'Fitbit';
      features.push('theo dõi sức khỏe và hoạt động toàn diện');
      features.push('phân tích giấc ngủ chuyên sâu');
    }
    else if (lowercaseName.includes('xiaomi') || lowercaseName.includes('mi band')) {
      brand = 'Xiaomi';
      features.push('giá cả hợp lý, đầy đủ tính năng cơ bản');
      features.push('thời lượng pin lên đến nhiều ngày');
    }
    else if (lowercaseName.includes('huawei')) {
      brand = 'Huawei';
      features.push('thiết kế sang trọng, đa dạng chế độ thể thao');
      features.push('màn hình AMOLED sắc nét');
    }
    
    // Thêm các tính năng
    if (lowercaseName.includes('gps')) {
      features.push('GPS tích hợp');
    }
    if (lowercaseName.includes('heart rate') || lowercaseName.includes('nhịp tim')) {
      features.push('cảm biến đo nhịp tim');
    }
    if (lowercaseName.includes('ecg') || lowercaseName.includes('điện tâm đồ')) {
      features.push('đo điện tâm đồ ECG');
    }
    if (lowercaseName.includes('spo2') || lowercaseName.includes('blood oxygen') || lowercaseName.includes('oxy máu')) {
      features.push('đo nồng độ oxy trong máu SpO2');
    }
    if (lowercaseName.includes('sleep') || lowercaseName.includes('giấc ngủ')) {
      features.push('theo dõi giấc ngủ');
    }
    if (lowercaseName.includes('stress') || lowercaseName.includes('căng thẳng')) {
      features.push('theo dõi mức độ căng thẳng');
    }
    if (lowercaseName.includes('waterproof') || lowercaseName.includes('water resistant') || lowercaseName.includes('chống nước')) {
      features.push('chống nước');
    }
    
    // Đảm bảo có ít nhất một số tính năng cơ bản
    if (features.length < 3) {
      features.push('theo dõi hoạt động thể chất');
      features.push('thông báo điện thoại');
      features.push('thời lượng pin tốt');
    }
    
    // Tạo mô tả
    const featureString = features.join(', ');
    
    description = `${type.charAt(0).toUpperCase() + type.slice(1)} ${brand} với ${featureString}. Theo dõi sức khỏe và hoạt động hàng ngày, hiển thị thông báo từ điện thoại, đồng bộ dữ liệu với ứng dụng di động. Thiết kế hiện đại, thoải mái khi đeo cả ngày. Sản phẩm chính hãng, hỗ trợ khách hàng tận tâm.`;
  }
  // Mặc định cho các sản phẩm phụ kiện khác
  else {
    if (lowercaseName.includes('pin dự phòng') || lowercaseName.includes('power bank')) {
      const brand = lowercaseName.includes('xiaomi') ? 'Xiaomi' :
                    lowercaseName.includes('anker') ? 'Anker' :
                    lowercaseName.includes('energizer') ? 'Energizer' :
                    lowercaseName.includes('belkin') ? 'Belkin' : 'chất lượng cao';
      
      // Tìm dung lượng pin
      let capacity = '';
      const capacityMatch = lowercaseName.match(/(\d+)[\s]?mah/i);
      if (capacityMatch) {
        capacity = `${capacityMatch[1]} mAh`;
      } else {
        capacity = 'dung lượng lớn';
      }
      
      description = `Pin dự phòng ${brand} với ${capacity}, thiết kế nhỏ gọn dễ mang theo. Hỗ trợ sạc nhanh, nhiều cổng sạc cho các thiết bị di động. Tích hợp các tính năng bảo vệ an toàn, chống quá tải và quá nhiệt. Sản phẩm chính hãng, bảo hành uy tín.`;
    }
    else if (lowercaseName.includes('cáp sạc') || lowercaseName.includes('cable')) {
      const brand = lowercaseName.includes('anker') ? 'Anker' :
                    lowercaseName.includes('ugreen') ? 'Ugreen' :
                    lowercaseName.includes('belkin') ? 'Belkin' : 'chất lượng cao';
                    
      let type = '';
      if (lowercaseName.includes('type-c') || lowercaseName.includes('usb-c')) {
        type = 'USB-C';
      } else if (lowercaseName.includes('lightning')) {
        type = 'Lightning';
      } else if (lowercaseName.includes('micro usb')) {
        type = 'Micro USB';
      } else {
        type = 'đa chuẩn';
      }
      
      description = `Cáp sạc ${brand} chuẩn ${type}, bền bỉ với lớp bọc dây bền chắc. Hỗ trợ sạc nhanh và truyền dữ liệu tốc độ cao. Thiết kế chống rối, chiều dài phù hợp sử dụng hàng ngày. Sản phẩm chính hãng, chất lượng vượt trội so với cáp thông thường.`;
    }
    else if (lowercaseName.includes('sạc') || lowercaseName.includes('adapter') || lowercaseName.includes('charger')) {
      const brand = lowercaseName.includes('anker') ? 'Anker' :
                    lowercaseName.includes('ugreen') ? 'Ugreen' :
                    lowercaseName.includes('belkin') ? 'Belkin' : 'chất lượng cao';
                    
      let features = [];
      
      if (lowercaseName.includes('gan')) {
        features.push('công nghệ GaN tiên tiến');
      }
      
      if (lowercaseName.includes('pd') || lowercaseName.includes('power delivery')) {
        features.push('hỗ trợ Power Delivery');
      }
      
      if (lowercaseName.includes('quick charge') || lowercaseName.includes('sạc nhanh')) {
        features.push('hỗ trợ sạc nhanh');
      }
      
      // Tìm công suất
      let power = '';
      const powerMatch = lowercaseName.match(/(\d+)[\s]?w/i);
      if (powerMatch) {
        power = `công suất ${powerMatch[1]}W`;
        features.push(power);
      }
      
      const ports = lowercaseName.includes('2 cổng') || lowercaseName.includes('dual') ? 'nhiều cổng sạc' : 'thiết kế nhỏ gọn';
      features.push(ports);
      
      const featureString = features.join(', ');
      
      description = `Adapter sạc ${brand} với ${featureString}. Cung cấp nguồn điện ổn định, an toàn cho thiết bị. Tích hợp công nghệ bảo vệ quá nhiệt, quá áp và quá dòng. Thiết kế nhỏ gọn, dễ dàng mang theo. Sản phẩm chính hãng, chất lượng cao.`;
    }
    else if (lowercaseName.includes('ốp lưng') || lowercaseName.includes('case')) {
      let phoneBrand = '';
      let phoneModel = '';
      
      if (lowercaseName.includes('iphone')) {
        phoneBrand = 'iPhone';
        if (lowercaseName.includes('15 pro max')) phoneModel = '15 Pro Max';
        else if (lowercaseName.includes('15 pro')) phoneModel = '15 Pro';
        else if (lowercaseName.includes('15 plus')) phoneModel = '15 Plus';
        else if (lowercaseName.includes('15')) phoneModel = '15';
        else if (lowercaseName.includes('14 pro max')) phoneModel = '14 Pro Max';
        else if (lowercaseName.includes('14 pro')) phoneModel = '14 Pro';
        else if (lowercaseName.includes('14 plus')) phoneModel = '14 Plus';
        else if (lowercaseName.includes('14')) phoneModel = '14';
        else if (lowercaseName.includes('13 pro max')) phoneModel = '13 Pro Max';
        else if (lowercaseName.includes('13 pro')) phoneModel = '13 Pro';
        else if (lowercaseName.includes('13')) phoneModel = '13';
        else phoneModel = 'các dòng';
      } else if (lowercaseName.includes('samsung') || lowercaseName.includes('galaxy')) {
        phoneBrand = 'Samsung Galaxy';
        if (lowercaseName.includes('s24 ultra')) phoneModel = 'S24 Ultra';
        else if (lowercaseName.includes('s24+') || lowercaseName.includes('s24 plus')) phoneModel = 'S24+';
        else if (lowercaseName.includes('s24')) phoneModel = 'S24';
        else if (lowercaseName.includes('s23 ultra')) phoneModel = 'S23 Ultra';
        else if (lowercaseName.includes('s23')) phoneModel = 'S23';
        else phoneModel = 'các dòng';
      } else {
        phoneBrand = 'điện thoại';
        phoneModel = 'đa dạng các mẫu máy';
      }
      
      let material = '';
      if (lowercaseName.includes('silicon') || lowercaseName.includes('silicone')) {
        material = 'silicone mềm mại';
      } else if (lowercaseName.includes('leather') || lowercaseName.includes('da')) {
        material = 'da cao cấp';
      } else if (lowercaseName.includes('tpu')) {
        material = 'TPU dẻo';
      } else if (lowercaseName.includes('hard') || lowercaseName.includes('cứng')) {
        material = 'nhựa cứng bền bỉ';
      } else {
        material = 'chất liệu cao cấp';
      }
      
      description = `Ốp lưng cho ${phoneBrand} ${phoneModel} được làm từ ${material}. Thiết kế vừa vặn, ôm sát, bảo vệ toàn diện cho điện thoại khỏi va đập và trầy xước. Các chi tiết camera, phím bấm được thiết kế chính xác. Nhiều màu sắc thời trang, thể hiện cá tính người dùng.`;
    }
    else if (lowercaseName.includes('thẻ nhớ') || lowercaseName.includes('memory card') || lowercaseName.includes('sd card')) {
      const brand = lowercaseName.includes('sandisk') ? 'SanDisk' :
                    lowercaseName.includes('samsung') ? 'Samsung' :
                    lowercaseName.includes('kingston') ? 'Kingston' : 'chất lượng cao';
      
      let type = '';
      if (lowercaseName.includes('microsd')) {
        type = 'MicroSD';
      } else if (lowercaseName.includes('sd')) {
        type = 'SD';
      } else if (lowercaseName.includes('cf')) {
        type = 'CompactFlash';
      } else {
        type = 'MicroSD';
      }
      
      // Tìm dung lượng
      let capacity = '';
      const capacityMatch = lowercaseName.match(/(\d+)[\s]?gb/i);
      if (capacityMatch) {
        capacity = `${capacityMatch[1]}GB`;
      } else {
        capacity = 'dung lượng lớn';
      }
      
      let speed = '';
      if (lowercaseName.includes('uhs-i')) {
        speed = 'tốc độ cao UHS-I';
      } else if (lowercaseName.includes('uhs-ii')) {
        speed = 'tốc độ cực cao UHS-II';
      } else if (lowercaseName.includes('class 10')) {
        speed = 'Class 10';
      } else {
        speed = 'tốc độ đọc/ghi nhanh';
      }
      
      description = `Thẻ nhớ ${brand} ${type} ${capacity} với ${speed}. Lưu trữ an toàn hình ảnh, video và dữ liệu. Chống nước, chống sốc và chống từ tính. Tương thích với điện thoại, máy ảnh, máy quay và các thiết bị khác. Sản phẩm chính hãng, bảo hành uy tín.`;
    }
    else if (lowercaseName.includes('tai nghe') || lowercaseName.includes('chuột') || lowercaseName.includes('bàn phím') || lowercaseName.includes('loa')) {
      // Những sản phẩm này đã được xử lý ở các loại khác
      description = 'Sản phẩm công nghệ chất lượng cao, thiết kế hiện đại phù hợp với nhiều nhu cầu sử dụng. Chất lượng đảm bảo, bền bỉ theo thời gian. Sản phẩm chính hãng, được bảo hành uy tín.';
    }
    else {
      description = 'Sản phẩm công nghệ chất lượng cao, thiết kế hiện đại phù hợp với nhiều nhu cầu sử dụng. Chất lượng đảm bảo, bền bỉ theo thời gian. Sản phẩm chính hãng, được bảo hành uy tín.';
    }
  }
  
  return description;
}

/**
 * Lấy danh sách điện thoại cần cập nhật
 */
async function getPhonesToUpdate() {
  try {
    const query = `
      SELECT id, name, description, category_id 
      FROM products 
      WHERE category_id = 3 -- Điện thoại
      ORDER BY id
      LIMIT 100
    `;
    
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách điện thoại:', error);
    return [];
  }
}

/**
 * Lấy danh sách sản phẩm điện tử cần cập nhật
 */
async function getElectronicsToUpdate() {
  try {
    const query = `
      SELECT id, name, description, category_id,
      CASE 
        WHEN LOWER(description) LIKE '%webcam%' OR LOWER(description) LIKE '%camera%' OR LOWER(description) LIKE '%máy ảnh%' THEN 'camera'
        WHEN LOWER(description) LIKE '%tai nghe%' OR LOWER(description) LIKE '%loa%' OR LOWER(description) LIKE '%headphone%' OR LOWER(description) LIKE '%earbud%' OR LOWER(description) LIKE '%speaker%' THEN 'audio'
        WHEN LOWER(description) LIKE '%laptop%' OR LOWER(description) LIKE '%notebook%' THEN 'laptop'
        WHEN LOWER(description) LIKE '%tv%' OR LOWER(description) LIKE '%màn hình%' OR LOWER(description) LIKE '%television%' OR LOWER(description) LIKE '%monitor%' THEN 'tv'
        WHEN LOWER(description) LIKE '%đồng hồ%' OR LOWER(description) LIKE '%smart watch%' OR LOWER(description) LIKE '%band%' THEN 'wearable'
        ELSE 'accessories'
      END as product_type
      FROM products 
      WHERE category_id = 7 -- Điện tử
      ORDER BY id
      LIMIT 100
    `;
    
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm điện tử:', error);
    return [];
  }
}

/**
 * Cập nhật mô tả sản phẩm
 */
async function updateProductDescription(product, newDescription) {
  try {
    await pool.query(
      `UPDATE "products" SET "description" = $1 WHERE "id" = $2`,
      [newDescription, product.id]
    );
    return true;
  } catch (error) {
    console.error(`Lỗi khi cập nhật mô tả sản phẩm ${product.id}:`, error);
    return false;
  }
}

/**
 * Hàm cập nhật mô tả cho sản phẩm điện thoại
 */
async function updatePhoneDescriptions() {
  try {
    console.log("Bắt đầu cập nhật mô tả cho sản phẩm điện thoại...");
    
    // Lấy danh sách điện thoại cần cập nhật
    const phones = await getPhonesToUpdate();
    console.log(`Tìm thấy ${phones.length} điện thoại cần cập nhật mô tả`);
    
    // Giới hạn số lượng cần cập nhật
    const phonesToProcess = phones.slice(0, 100);
    
    let successCount = 0;
    
    for (const phone of phonesToProcess) {
      // Xác định thương hiệu từ tên điện thoại
      const brandMatch = phone.name.match(/^(Apple|Samsung|Xiaomi|OPPO|Vivo|realme|Google|Nokia|Motorola|OnePlus|Asus|Tecno|Honor|Huawei|iPhone)/i);
      const brandName = brandMatch ? brandMatch[1] : 'Smartphone';
      
      // Tạo mô tả chi tiết
      const newDescription = generatePhoneDescription(brandName, phone.name);
      
      console.log(`Cập nhật mô tả cho [${phone.id}]: ${phone.name}`);
      
      // Cập nhật mô tả
      const success = await updateProductDescription(phone, newDescription);
      if (success) {
        successCount++;
      }
      
      // Đợi một chút giữa các yêu cầu cập nhật
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`\n===== KẾT QUẢ =====`);
    console.log(`Đã cập nhật thành công mô tả cho ${successCount}/${phonesToProcess.length} điện thoại`);
    
  } catch (error) {
    console.error('Lỗi khi cập nhật mô tả điện thoại:', error);
  }
}

/**
 * Hàm cập nhật mô tả cho sản phẩm điện tử
 */
async function updateElectronicsDescriptions() {
  try {
    console.log("Bắt đầu cập nhật mô tả cho sản phẩm điện tử...");
    
    // Lấy danh sách sản phẩm điện tử cần cập nhật
    const electronics = await getElectronicsToUpdate();
    console.log(`Tìm thấy ${electronics.length} sản phẩm điện tử cần cập nhật mô tả`);
    
    // Giới hạn số lượng cần cập nhật
    const electronicsToProcess = electronics.slice(0, 100);
    
    let successCount = 0;
    
    for (const product of electronicsToProcess) {
      // Tạo mô tả chi tiết dựa trên loại sản phẩm
      const newDescription = generateElectronicsDescription(product.name, product.product_type);
      
      console.log(`Cập nhật mô tả cho [${product.id}]: ${product.name} (Loại: ${product.product_type})`);
      
      // Cập nhật mô tả
      const success = await updateProductDescription(product, newDescription);
      if (success) {
        successCount++;
      }
      
      // Đợi một chút giữa các yêu cầu cập nhật
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`\n===== KẾT QUẢ =====`);
    console.log(`Đã cập nhật thành công mô tả cho ${successCount}/${electronicsToProcess.length} sản phẩm điện tử`);
    
  } catch (error) {
    console.error('Lỗi khi cập nhật mô tả sản phẩm điện tử:', error);
  }
}

/**
 * Hàm chính thực thi cập nhật mô tả
 */
async function main() {
  try {
    // Cập nhật mô tả cho điện thoại
    await updatePhoneDescriptions();
    
    console.log("\n==============================================\n");
    
    // Cập nhật mô tả cho sản phẩm điện tử
    await updateElectronicsDescriptions();
    
  } catch (error) {
    console.error('Lỗi khi thực thi cập nhật mô tả:', error);
  } finally {
    await pool.end();
  }
}

// Thực thi
main().catch(err => {
  console.error('Lỗi khi chạy script:', err);
  process.exit(1);
});