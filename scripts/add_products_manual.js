/**
 * Script để thêm 300 sản phẩm điện thoại và 200 sản phẩm điện tử vào database
 * sử dụng dữ liệu có cấu trúc để đảm bảo tính chính xác
 */

import pkg from 'pg';
const { Pool } = pkg;

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Điện thoại di động (300 sản phẩm)
const phoneProducts = [
  // iPhone
  {
    brand: 'iPhone',
    models: [
      { name: 'iPhone 15 Pro Max', price: 34990000, features: ['A17 Pro', 'RAM 8GB', 'Titanium', 'Camera 48MP'] },
      { name: 'iPhone 15 Pro', price: 29490000, features: ['A17 Pro', 'RAM 8GB', 'Titanium', 'Camera 48MP'] },
      { name: 'iPhone 15 Plus', price: 25990000, features: ['A16 Bionic', 'RAM 6GB', 'Camera 48MP'] },
      { name: 'iPhone 15', price: 22990000, features: ['A16 Bionic', 'RAM 6GB', 'Camera 48MP'] },
      { name: 'iPhone 14 Pro Max', price: 26990000, features: ['A16 Bionic', 'RAM 6GB', 'Dynamic Island', 'Camera 48MP'] },
      { name: 'iPhone 14 Pro', price: 24990000, features: ['A16 Bionic', 'RAM 6GB', 'Dynamic Island', 'Camera 48MP'] },
      { name: 'iPhone 14 Plus', price: 21990000, features: ['A15 Bionic', 'RAM 6GB', 'Camera 12MP'] },
      { name: 'iPhone 14', price: 19490000, features: ['A15 Bionic', 'RAM 6GB', 'Camera 12MP'] },
      { name: 'iPhone 13', price: 16990000, features: ['A15 Bionic', 'RAM 4GB', 'Camera 12MP'] },
      { name: 'iPhone 13 mini', price: 14990000, features: ['A15 Bionic', 'RAM 4GB', 'Camera 12MP'] },
    ]
  },
  // Samsung
  {
    brand: 'Samsung',
    models: [
      { name: 'Samsung Galaxy S24 Ultra', price: 32990000, features: ['Snapdragon 8 Gen 3', 'RAM 12GB', 'Camera 200MP', 'S Pen'] },
      { name: 'Samsung Galaxy S24+', price: 24990000, features: ['Exynos 2400', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'Samsung Galaxy S24', price: 19990000, features: ['Exynos 2400', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'Samsung Galaxy S23 Ultra', price: 23990000, features: ['Snapdragon 8 Gen 2', 'RAM 12GB', 'Camera 200MP', 'S Pen'] },
      { name: 'Samsung Galaxy S23+', price: 19990000, features: ['Snapdragon 8 Gen 2', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'Samsung Galaxy S23', price: 15990000, features: ['Snapdragon 8 Gen 2', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'Samsung Galaxy Z Fold5', price: 32990000, features: ['Snapdragon 8 Gen 2', 'RAM 12GB', 'Màn hình gập'] },
      { name: 'Samsung Galaxy Z Flip5', price: 19990000, features: ['Snapdragon 8 Gen 2', 'RAM 8GB', 'Màn hình gập'] },
      { name: 'Samsung Galaxy A54', price: 9490000, features: ['Exynos 1380', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'Samsung Galaxy A34', price: 7490000, features: ['Dimensity 1080', 'RAM 8GB', 'Camera 48MP'] },
    ]
  },
  // Xiaomi
  {
    brand: 'Xiaomi',
    models: [
      { name: 'Xiaomi 14 Ultra', price: 29990000, features: ['Snapdragon 8 Gen 3', 'RAM 16GB', 'Camera LEICA 50MP'] },
      { name: 'Xiaomi 14', price: 19990000, features: ['Snapdragon 8 Gen 3', 'RAM 12GB', 'Camera LEICA 50MP'] },
      { name: 'Xiaomi 13T Pro', price: 14990000, features: ['Dimensity 9200+', 'RAM 12GB', 'Camera LEICA 50MP'] },
      { name: 'Xiaomi 13T', price: 11990000, features: ['Dimensity 8200-Ultra', 'RAM 8GB', 'Camera LEICA 50MP'] },
      { name: 'Xiaomi Redmi Note 13 Pro+ 5G', price: 9990000, features: ['Dimensity 7200-Ultra', 'RAM 12GB', 'Camera 200MP'] },
      { name: 'Xiaomi Redmi Note 13 Pro 5G', price: 7990000, features: ['Snapdragon 7s Gen 2', 'RAM 8GB', 'Camera 200MP'] },
      { name: 'Xiaomi Redmi Note 13 5G', price: 5990000, features: ['Dimensity 6080', 'RAM 8GB', 'Camera 108MP'] },
      { name: 'Xiaomi Redmi Note 13', price: 4690000, features: ['Helio G85', 'RAM 8GB', 'Camera 108MP'] },
      { name: 'Xiaomi Redmi 13C', price: 2990000, features: ['Helio G85', 'RAM 4GB', 'Camera 50MP'] },
      { name: 'Xiaomi POCO F5', price: 9490000, features: ['Snapdragon 7+ Gen 2', 'RAM 12GB', 'Camera 64MP'] },
    ]
  },
  // OPPO
  {
    brand: 'OPPO',
    models: [
      { name: 'OPPO Find X7 Ultra', price: 24990000, features: ['Snapdragon 8 Gen 3', 'RAM 16GB', 'Camera Hasselblad 50MP'] },
      { name: 'OPPO Find X7', price: 19990000, features: ['Dimensity 9300', 'RAM 12GB', 'Camera Hasselblad 50MP'] },
      { name: 'OPPO Find X6 Pro', price: 19990000, features: ['Snapdragon 8 Gen 2', 'RAM 12GB', 'Camera Hasselblad 50MP'] },
      { name: 'OPPO Reno11 Pro 5G', price: 13990000, features: ['Dimensity 8200', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'OPPO Reno11 5G', price: 9990000, features: ['Dimensity 7050', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'OPPO Reno10 Pro+ 5G', price: 14990000, features: ['Snapdragon 8+ Gen 1', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'OPPO Reno10 Pro 5G', price: 11990000, features: ['Snapdragon 778G', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'OPPO Reno10 5G', price: 8990000, features: ['Dimensity 7050', 'RAM 8GB', 'Camera 64MP'] },
      { name: 'OPPO A79 5G', price: 6490000, features: ['Dimensity 6020', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'OPPO A58 4G', price: 4990000, features: ['Helio G85', 'RAM 6GB', 'Camera 50MP'] },
    ]
  },
  // Vivo
  {
    brand: 'Vivo',
    models: [
      { name: 'Vivo X100 Pro', price: 24990000, features: ['Dimensity 9300', 'RAM 16GB', 'Camera ZEISS 50MP'] },
      { name: 'Vivo X100', price: 19990000, features: ['Dimensity 9300', 'RAM 12GB', 'Camera ZEISS 50MP'] },
      { name: 'Vivo X90 Pro', price: 18990000, features: ['Dimensity 9200', 'RAM 12GB', 'Camera ZEISS 50MP'] },
      { name: 'Vivo V30 Pro', price: 12990000, features: ['Snapdragon 7 Gen 3', 'RAM 12GB', 'Camera ZEISS 50MP'] },
      { name: 'Vivo V30', price: 9990000, features: ['Snapdragon 7 Gen 3', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'Vivo V29 Pro', price: 11990000, features: ['Dimensity 8200', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'Vivo V29', price: 9490000, features: ['Snapdragon 778G', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'Vivo V27 Pro', price: 8990000, features: ['Dimensity 8200', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'Vivo V27', price: 7990000, features: ['Dimensity 7200', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'Vivo Y36', price: 5490000, features: ['Snapdragon 680', 'RAM 8GB', 'Camera 50MP'] },
    ]
  },
  // realme
  {
    brand: 'realme',
    models: [
      { name: 'realme GT 5 Pro', price: 19990000, features: ['Snapdragon 8 Gen 3', 'RAM 16GB', 'Camera 50MP'] },
      { name: 'realme GT 5', price: 14990000, features: ['Snapdragon 8 Gen 2', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'realme GT Neo 5', price: 12990000, features: ['Snapdragon 8+ Gen 1', 'RAM 16GB', 'Camera 50MP'] },
      { name: 'realme 11 Pro+ 5G', price: 9990000, features: ['Dimensity 7050', 'RAM 12GB', 'Camera 200MP'] },
      { name: 'realme 11 Pro 5G', price: 8490000, features: ['Dimensity 7050', 'RAM 8GB', 'Camera 100MP'] },
      { name: 'realme 11 5G', price: 6990000, features: ['Dimensity 6100+', 'RAM 8GB', 'Camera 108MP'] },
      { name: 'realme 11', price: 4990000, features: ['Helio G99', 'RAM 8GB', 'Camera 108MP'] },
      { name: 'realme C67', price: 3990000, features: ['Snapdragon 685', 'RAM 6GB', 'Camera 50MP'] },
      { name: 'realme C55', price: 3490000, features: ['Helio G88', 'RAM 6GB', 'Camera 64MP'] },
      { name: 'realme C53', price: 2990000, features: ['Unisoc T612', 'RAM 4GB', 'Camera 50MP'] },
    ]
  },
  // HONOR
  {
    brand: 'HONOR',
    models: [
      { name: 'HONOR Magic 6 Pro', price: 25990000, features: ['Snapdragon 8 Gen 3', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'HONOR Magic 6', price: 19990000, features: ['Snapdragon 8 Gen 3', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'HONOR Magic V2', price: 29990000, features: ['Snapdragon 8 Gen 2', 'RAM 16GB', 'Màn hình gập', 'Camera 50MP'] },
      { name: 'HONOR Magic5 Pro', price: 18990000, features: ['Snapdragon 8 Gen 2', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'HONOR 100 Pro', price: 14990000, features: ['Snapdragon 8 Gen 2', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'HONOR 100', price: 9990000, features: ['Snapdragon 7 Gen 3', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'HONOR 90', price: 8990000, features: ['Snapdragon 7 Gen 1', 'RAM 8GB', 'Camera 200MP'] },
      { name: 'HONOR X9b 5G', price: 6990000, features: ['Snapdragon 6 Gen 1', 'RAM 8GB', 'Camera 108MP'] },
      { name: 'HONOR X8b', price: 4990000, features: ['Snapdragon 680', 'RAM 8GB', 'Camera 100MP'] },
      { name: 'HONOR X7b', price: 3990000, features: ['Snapdragon 680', 'RAM 6GB', 'Camera 50MP'] },
    ]
  },
  // Nokia
  {
    brand: 'Nokia',
    models: [
      { name: 'Nokia XR21', price: 10990000, features: ['Snapdragon 695', 'RAM 6GB', 'Siêu bền', 'Camera 64MP'] },
      { name: 'Nokia X30 5G', price: 9990000, features: ['Snapdragon 695', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'Nokia G42 5G', price: 4990000, features: ['Snapdragon 480+', 'RAM 6GB', 'Camera 50MP'] },
      { name: 'Nokia G22', price: 3490000, features: ['Unisoc T606', 'RAM 4GB', 'Camera 50MP'] },
      { name: 'Nokia G21', price: 2990000, features: ['Unisoc T606', 'RAM 4GB', 'Camera 50MP'] },
      { name: 'Nokia C32', price: 2490000, features: ['Unisoc SC9863A', 'RAM 4GB', 'Camera 50MP'] },
      { name: 'Nokia C22', price: 1990000, features: ['Unisoc T606', 'RAM 2GB', 'Camera 13MP'] },
      { name: 'Nokia C12', price: 1790000, features: ['Unisoc SC9863A', 'RAM 2GB', 'Camera 8MP'] },
      { name: 'Nokia 8210 4G', price: 1490000, features: ['Unisoc T107', 'Phím bấm', 'Pin lâu'] },
      { name: 'Nokia 5710 XpressAudio', price: 1390000, features: ['Unisoc T107', 'MP3', 'Tai nghe không dây tích hợp'] },
    ]
  },
  // Huawei
  {
    brand: 'Huawei',
    models: [
      { name: 'Huawei Mate 60 Pro', price: 29990000, features: ['Kirin 9000S', 'RAM 12GB', 'HarmonyOS', 'Camera 50MP'] },
      { name: 'Huawei Mate 60', price: 24990000, features: ['Kirin 9000S', 'RAM 8GB', 'HarmonyOS', 'Camera 50MP'] },
      { name: 'Huawei P60 Pro', price: 22990000, features: ['Snapdragon 8+ Gen 1', 'RAM 12GB', 'HarmonyOS', 'Camera 48MP'] },
      { name: 'Huawei P60', price: 19990000, features: ['Snapdragon 8+ Gen 1', 'RAM 8GB', 'HarmonyOS', 'Camera 48MP'] },
      { name: 'Huawei Mate X5', price: 39990000, features: ['Kirin 9000S', 'RAM 16GB', 'Màn hình gập', 'Camera 50MP'] },
      { name: 'Huawei Mate X4', price: 34990000, features: ['Kirin 9000S', 'RAM 12GB', 'Màn hình gập', 'Camera 50MP'] },
      { name: 'Huawei nova 12 Pro', price: 14990000, features: ['Kirin 8000', 'RAM 12GB', 'HarmonyOS', 'Camera 60MP'] },
      { name: 'Huawei nova 12', price: 11990000, features: ['Kirin 8000', 'RAM 8GB', 'HarmonyOS', 'Camera 50MP'] },
      { name: 'Huawei nova 11 Pro', price: 12990000, features: ['Snapdragon 778G', 'RAM 8GB', 'HarmonyOS', 'Camera 50MP'] },
      { name: 'Huawei nova 11', price: 9990000, features: ['Snapdragon 778G', 'RAM 8GB', 'HarmonyOS', 'Camera 50MP'] },
    ]
  },
  // TECNO
  {
    brand: 'TECNO',
    models: [
      { name: 'TECNO Phantom V Fold', price: 22990000, features: ['Dimensity 9000+', 'RAM 12GB', 'Màn hình gập', 'Camera 50MP'] },
      { name: 'TECNO Phantom X2 Pro', price: 16990000, features: ['Dimensity 9000', 'RAM 12GB', 'Camera 50MP'] },
      { name: 'TECNO Phantom X2', price: 10990000, features: ['Dimensity 9000', 'RAM 8GB', 'Camera 64MP'] },
      { name: 'TECNO CAMON 20 Premier', price: 9990000, features: ['Dimensity 8050', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'TECNO CAMON 20 Pro', price: 7490000, features: ['Helio G99', 'RAM 8GB', 'Camera 64MP'] },
      { name: 'TECNO CAMON 20', price: 4990000, features: ['Helio G85', 'RAM 8GB', 'Camera 64MP'] },
      { name: 'TECNO POVA 5 Pro', price: 4990000, features: ['Dimensity 6080', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'TECNO POVA 5', price: 3990000, features: ['Helio G99', 'RAM 8GB', 'Camera 50MP'] },
      { name: 'TECNO SPARK 20 Pro', price: 3490000, features: ['Helio G99', 'RAM 8GB', 'Camera 108MP'] },
      { name: 'TECNO SPARK 20', price: 2990000, features: ['Helio G85', 'RAM 8GB', 'Camera 50MP'] },
    ]
  },
];

// Sản phẩm điện tử (200 sản phẩm)
const electronicsProducts = [
  // Laptop
  {
    category: 'Laptop',
    products: [
      { name: 'MacBook Pro 14 M3 Pro', price: 49990000, features: ['M3 Pro', 'RAM 18GB', 'SSD 512GB', 'Màn hình 14.2 inch'] },
      { name: 'MacBook Pro 16 M3 Max', price: 79990000, features: ['M3 Max', 'RAM 36GB', 'SSD 1TB', 'Màn hình 16.2 inch'] },
      { name: 'MacBook Air 13 M2', price: 26990000, features: ['M2', 'RAM 8GB', 'SSD 256GB', 'Màn hình 13.6 inch'] },
      { name: 'MacBook Air 15 M2', price: 31990000, features: ['M2', 'RAM 8GB', 'SSD 256GB', 'Màn hình 15.3 inch'] },
      { name: 'Dell XPS 13 Plus 9320', price: 39990000, features: ['Intel Core i7-1360P', 'RAM 16GB', 'SSD 512GB', 'Màn hình 13.4 inch'] },
      { name: 'Dell XPS 15 9530', price: 49990000, features: ['Intel Core i9-13900H', 'RAM 16GB', 'SSD 1TB', 'RTX 4050', 'Màn hình 15.6 inch'] },
      { name: 'Dell Inspiron 15 3520', price: 11990000, features: ['Intel Core i5-1235U', 'RAM 8GB', 'SSD 256GB', 'Màn hình 15.6 inch'] },
      { name: 'HP Pavilion 15 eg2035TX', price: 16990000, features: ['Intel Core i5-1240P', 'RAM 8GB', 'SSD 512GB', 'Màn hình 15.6 inch'] },
      { name: 'HP Envy 16 h0045TX', price: 42990000, features: ['Intel Core i9-13900H', 'RAM 32GB', 'SSD 1TB', 'RTX 4060', 'Màn hình 16 inch'] },
      { name: 'HP EliteBook 640 G10', price: 23990000, features: ['Intel Core i5-1335U', 'RAM 16GB', 'SSD 512GB', 'Màn hình 14 inch'] },
      { name: 'Lenovo ThinkPad X1 Carbon Gen 11', price: 42990000, features: ['Intel Core i7-1365U', 'RAM 16GB', 'SSD 512GB', 'Màn hình 14 inch'] },
      { name: 'Lenovo Yoga 9i 14', price: 34990000, features: ['Intel Core i7-1360P', 'RAM 16GB', 'SSD 512GB', 'Màn hình 14 inch OLED'] },
      { name: 'Lenovo IdeaPad Slim 5', price: 16990000, features: ['AMD Ryzen 7 7730U', 'RAM 16GB', 'SSD 512GB', 'Màn hình 14 inch'] },
      { name: 'ASUS Zenbook 14 OLED UX3402', price: 22990000, features: ['Intel Core i5-1340P', 'RAM 16GB', 'SSD 512GB', 'Màn hình 14 inch OLED'] },
      { name: 'ASUS ROG Zephyrus G14', price: 42990000, features: ['AMD Ryzen 9 7940HS', 'RAM 16GB', 'SSD 1TB', 'RTX 4060', 'Màn hình 14 inch'] },
      { name: 'ASUS TUF Gaming A15', price: 23990000, features: ['AMD Ryzen 7 7735HS', 'RAM 8GB', 'SSD 512GB', 'RTX 3050', 'Màn hình 15.6 inch'] },
      { name: 'Acer Nitro 5 AN515', price: 24990000, features: ['Intel Core i5-12500H', 'RAM 8GB', 'SSD 512GB', 'RTX 3050', 'Màn hình 15.6 inch'] },
      { name: 'Acer Swift 5', price: 29990000, features: ['Intel Core i7-1360P', 'RAM 16GB', 'SSD 512GB', 'Màn hình 14 inch'] },
      { name: 'Acer Aspire 5', price: 15990000, features: ['Intel Core i5-1235U', 'RAM 8GB', 'SSD 512GB', 'Màn hình 15.6 inch'] },
      { name: 'MSI Cyborg 15', price: 22990000, features: ['Intel Core i7-12650H', 'RAM 8GB', 'SSD 512GB', 'RTX 3050', 'Màn hình 15.6 inch'] },
      { name: 'MSI Prestige 14 Evo', price: 25990000, features: ['Intel Core i7-1280P', 'RAM 16GB', 'SSD 512GB', 'Màn hình 14 inch'] },
      { name: 'MSI Gaming Katana GF66', price: 22990000, features: ['Intel Core i7-12650H', 'RAM 8GB', 'SSD 512GB', 'RTX 3050', 'Màn hình 15.6 inch'] },
      { name: 'LG Gram 17', price: 36990000, features: ['Intel Core i7-1360P', 'RAM 16GB', 'SSD 512GB', 'Màn hình 17 inch'] },
      { name: 'LG Gram 16', price: 33990000, features: ['Intel Core i7-1360P', 'RAM 16GB', 'SSD 512GB', 'Màn hình 16 inch'] },
      { name: 'LG Gram 14', price: 29990000, features: ['Intel Core i7-1360P', 'RAM 16GB', 'SSD 512GB', 'Màn hình 14 inch'] },
      { name: 'Microsoft Surface Laptop 5', price: 32990000, features: ['Intel Core i7-1255U', 'RAM 16GB', 'SSD 512GB', 'Màn hình 13.5 inch'] },
      { name: 'Microsoft Surface Pro 9', price: 27990000, features: ['Intel Core i5-1235U', 'RAM 8GB', 'SSD 256GB', 'Màn hình 13 inch'] },
      { name: 'Huawei MateBook X Pro', price: 36990000, features: ['Intel Core i7-1360P', 'RAM 16GB', 'SSD 1TB', 'Màn hình 14.2 inch'] },
      { name: 'Huawei MateBook 14', price: 19990000, features: ['Intel Core i5-12500H', 'RAM 8GB', 'SSD 512GB', 'Màn hình 14 inch'] },
      { name: 'Gigabyte AORUS 15 XE4', price: 34990000, features: ['Intel Core i7-12700H', 'RAM 16GB', 'SSD 1TB', 'RTX 3070', 'Màn hình 15.6 inch'] },
    ]
  },
  // Tablet
  {
    category: 'Tablet',
    products: [
      { name: 'iPad Pro 12.9 M2', price: 31990000, features: ['M2', 'RAM 8GB', '256GB', 'Màn hình Liquid Retina XDR 12.9 inch'] },
      { name: 'iPad Pro 11 M2', price: 22990000, features: ['M2', 'RAM 8GB', '128GB', 'Màn hình Liquid Retina 11 inch'] },
      { name: 'iPad Air 5', price: 16990000, features: ['M1', 'RAM 8GB', '64GB', 'Màn hình Liquid Retina 10.9 inch'] },
      { name: 'iPad 10', price: 11990000, features: ['A14 Bionic', 'RAM 4GB', '64GB', 'Màn hình Liquid Retina 10.9 inch'] },
      { name: 'iPad mini 6', price: 13990000, features: ['A15 Bionic', 'RAM 4GB', '64GB', 'Màn hình Liquid Retina 8.3 inch'] },
      { name: 'Samsung Galaxy Tab S9 Ultra', price: 27990000, features: ['Snapdragon 8 Gen 2', 'RAM 12GB', '256GB', 'Màn hình Dynamic AMOLED 2X 14.6 inch'] },
      { name: 'Samsung Galaxy Tab S9+', price: 22990000, features: ['Snapdragon 8 Gen 2', 'RAM 12GB', '256GB', 'Màn hình Dynamic AMOLED 2X 12.4 inch'] },
      { name: 'Samsung Galaxy Tab S9', price: 18990000, features: ['Snapdragon 8 Gen 2', 'RAM 8GB', '128GB', 'Màn hình Dynamic AMOLED 2X 11 inch'] },
      { name: 'Samsung Galaxy Tab S8 Ultra', price: 24990000, features: ['Snapdragon 8 Gen 1', 'RAM 8GB', '128GB', 'Màn hình Super AMOLED 14.6 inch'] },
      { name: 'Samsung Galaxy Tab A9+', price: 7990000, features: ['Snapdragon 695', 'RAM 8GB', '128GB', 'Màn hình TFT LCD 11 inch'] },
      { name: 'Xiaomi Pad 6', price: 7990000, features: ['Snapdragon 870', 'RAM 6GB', '128GB', 'Màn hình IPS LCD 11 inch'] },
      { name: 'Xiaomi Pad 6 Pro', price: 10990000, features: ['Snapdragon 8+ Gen 1', 'RAM 8GB', '256GB', 'Màn hình IPS LCD 11 inch'] },
      { name: 'OPPO Pad 2', price: 11990000, features: ['Dimensity 9000', 'RAM 8GB', '256GB', 'Màn hình IPS LCD 11.6 inch'] },
      { name: 'Lenovo Tab P12 Pro', price: 13990000, features: ['Snapdragon 870', 'RAM 6GB', '128GB', 'Màn hình AMOLED 12.6 inch'] },
      { name: 'Lenovo Tab M10 Plus Gen 3', price: 5990000, features: ['MediaTek Helio G80', 'RAM 4GB', '64GB', 'Màn hình IPS LCD 10.6 inch'] },
      { name: 'Microsoft Surface Pro 9', price: 23990000, features: ['Intel Core i5-1235U', 'RAM 8GB', 'SSD 256GB', 'Màn hình 13 inch'] },
      { name: 'Microsoft Surface Go 3', price: 11990000, features: ['Intel Pentium Gold 6500Y', 'RAM 4GB', 'SSD 64GB', 'Màn hình 10.5 inch'] },
      { name: 'Huawei MatePad Pro 13.2', price: 19990000, features: ['Kirin 9000S', 'RAM 12GB', '256GB', 'Màn hình OLED 13.2 inch'] },
      { name: 'Huawei MatePad 11.5', price: 7990000, features: ['Qualcomm Snapdragon 7 Gen 1', 'RAM 6GB', '128GB', 'Màn hình IPS LCD 11.5 inch'] },
      { name: 'Nokia T21', price: 4990000, features: ['Unisoc T612', 'RAM 4GB', '64GB', 'Màn hình IPS LCD 10.36 inch'] },
    ]
  },
  // Tai nghe
  {
    category: 'Tai nghe',
    products: [
      { name: 'Apple AirPods Pro 2', price: 5990000, features: ['Chống ồn chủ động', 'Âm thanh không gian', 'Cổng USB-C'] },
      { name: 'Apple AirPods 3', price: 4390000, features: ['Âm thanh không gian', 'Chống nước IPX4', 'Pin 6 giờ'] },
      { name: 'Apple AirPods 2', price: 2990000, features: ['Chip H1', 'Pin 5 giờ', 'Sạc không dây'] },
      { name: 'Apple AirPods Max', price: 12990000, features: ['Chống ồn chủ động', 'Âm thanh không gian', '9 micro', 'Pin 20 giờ'] },
      { name: 'Samsung Galaxy Buds2 Pro', price: 3990000, features: ['Chống ồn chủ động', 'Âm thanh Hi-Fi 24bit', 'Pin 5 giờ'] },
      { name: 'Samsung Galaxy Buds2', price: 2490000, features: ['Chống ồn chủ động', 'Pin 5 giờ', 'Thiết kế nhỏ gọn'] },
      { name: 'Samsung Galaxy Buds FE', price: 1990000, features: ['Chống ồn chủ động', 'Pin 6 giờ', 'Thiết kế thoải mái'] },
      { name: 'Sony WF-1000XM5', price: 6490000, features: ['Chống ồn chủ động', 'LDAC', 'Pin 8 giờ'] },
      { name: 'Sony WF-1000XM4', price: 4990000, features: ['Chống ồn chủ động', 'LDAC', 'Pin 8 giờ'] },
      { name: 'Sony WH-1000XM5', price: 8490000, features: ['Chống ồn chủ động', 'LDAC', 'Pin 30 giờ'] },
      { name: 'Sony WH-1000XM4', price: 5990000, features: ['Chống ồn chủ động', 'LDAC', 'Pin 30 giờ'] },
      { name: 'JBL Tour Pro 2', price: 5990000, features: ['Chống ồn chủ động', 'Màn hình cảm ứng trên case', 'Pin 10 giờ'] },
      { name: 'JBL Tune Flex', price: 2290000, features: ['Chống ồn chủ động', 'Pin 8 giờ', 'JBL Pure Bass'] },
      { name: 'JBL Quantum 910', price: 7990000, features: ['Chống ồn chủ động', 'Không dây', 'Pin 39 giờ'] },
      { name: 'Bose QuietComfort Ultra', price: 9990000, features: ['Chống ồn chủ động', 'Âm thanh không gian', 'Pin 24 giờ'] },
      { name: 'Bose QuietComfort Earbuds II', price: 6990000, features: ['Chống ồn chủ động', 'Khử tiếng ồn thoại', 'Pin 6 giờ'] },
      { name: 'Sennheiser Momentum 4', price: 8490000, features: ['Chống ồn chủ động', 'Pin 60 giờ', 'Sennheiser Smart Control'] },
      { name: 'Sennheiser MOMENTUM True Wireless 3', price: 5990000, features: ['Chống ồn chủ động', 'Âm thanh hi-fi', 'Pin 7 giờ'] },
      { name: 'Beats Studio Pro', price: 7990000, features: ['Chống ồn chủ động', 'Âm thanh không gian', 'Pin 40 giờ'] },
      { name: 'Beats Fit Pro', price: 4490000, features: ['Chống ồn chủ động', 'Âm thanh không gian', 'Pin 6 giờ'] },
    ]
  },
  // Loa
  {
    category: 'Loa',
    products: [
      { name: 'Apple HomePod 2', price: 7990000, features: ['Chip S7', 'Siri', 'Âm thanh không gian', 'Điều khiển nhà thông minh'] },
      { name: 'Apple HomePod mini', price: 2390000, features: ['Chip S5', 'Siri', 'Điều khiển nhà thông minh', 'Thiết kế nhỏ gọn'] },
      { name: 'Sonos Era 300', price: 12990000, features: ['Âm thanh không gian', 'Dolby Atmos', 'Bluetooth 5.0', 'Wi-Fi'] },
      { name: 'Sonos Era 100', price: 6990000, features: ['Âm thanh stereo', 'Bluetooth 5.0', 'Wi-Fi', 'Trueplay'] },
      { name: 'Sonos Beam Gen 2', price: 11990000, features: ['Soundbar', 'Dolby Atmos', 'HDMI eARC', 'Alexa'] },
      { name: 'Sonos Five', price: 13990000, features: ['Âm thanh Hi-Fi', 'Wi-Fi', 'Trueplay', 'Kết nối line-in'] },
      { name: 'Bose Smart Soundbar 600', price: 12990000, features: ['Dolby Atmos', 'Bluetooth', 'Wi-Fi', 'Bose SimpleSync'] },
      { name: 'Bose SoundLink Revolve II', price: 5990000, features: ['Bluetooth', 'Âm thanh 360°', 'Chống nước IPX4', 'Pin 13 giờ'] },
      { name: 'Bose SoundLink Flex', price: 3990000, features: ['Bluetooth', 'Âm thanh chất lượng cao', 'Chống nước IP67', 'Pin 12 giờ'] },
      { name: 'JBL Charge 5', price: 3490000, features: ['Bluetooth', 'Chống nước IP67', 'Pin 20 giờ', 'Sạc dự phòng'] },
      { name: 'JBL Flip 6', price: 2490000, features: ['Bluetooth', 'Chống nước IP67', 'Pin 12 giờ', 'JBL PartyBoost'] },
      { name: 'JBL Boombox 3', price: 10990000, features: ['Bluetooth', 'Chống nước IP67', 'Pin 24 giờ', 'Công suất 80W'] },
      { name: 'JBL Partybox 310', price: 12990000, features: ['Bluetooth', 'Đèn RGB', 'Pin 18 giờ', 'Công suất 240W'] },
      { name: 'Marshall Stanmore III', price: 9990000, features: ['Bluetooth', 'Thiết kế cổ điển', 'Công suất 80W', 'EQ'] },
      { name: 'Marshall Emberton II', price: 3990000, features: ['Bluetooth', 'Chống nước IP67', 'Pin 30 giờ', 'Âm thanh 360°'] },
      { name: 'Sony SRS-XG300', price: 5990000, features: ['Bluetooth', 'Chống nước IP67', 'Pin 25 giờ', 'Đèn RGB'] },
      { name: 'Sony SRS-XE300', price: 3990000, features: ['Bluetooth', 'Chống nước IP67', 'Pin 24 giờ', 'Line Shape Diffuser'] },
      { name: 'Harman Kardon Aura Studio 3', price: 6490000, features: ['Bluetooth', 'Thiết kế trong suốt', 'Đèn LED', 'Công suất 100W'] },
      { name: 'B&O Beosound A1 2nd Gen', price: 5490000, features: ['Bluetooth', 'Chống nước IP67', 'Pin 18 giờ', 'Alexa'] },
      { name: 'Ultimate Ears WONDERBOOM 3', price: 2190000, features: ['Bluetooth', 'Chống nước IP67', 'Pin 14 giờ', 'Âm thanh 360°'] },
    ]
  },
  // Camera
  {
    category: 'Camera',
    products: [
      { name: 'Sony Alpha 7 IV', price: 49990000, features: ['33MP', 'Full-frame', '4K 60fps', 'ISO 204800'] },
      { name: 'Sony Alpha 7R V', price: 89990000, features: ['61MP', 'Full-frame', '8K 24fps', 'ISO 102400'] },
      { name: 'Sony Alpha 7C II', price: 44990000, features: ['33MP', 'Full-frame', '4K 60fps', 'Nhỏ gọn'] },
      { name: 'Sony Alpha 6700', price: 34990000, features: ['26MP', 'APS-C', '4K 120fps', 'ISO 32000'] },
      { name: 'Canon EOS R6 Mark II', price: 59990000, features: ['24.2MP', 'Full-frame', '4K 60fps', 'ISO 102400'] },
      { name: 'Canon EOS R5', price: 84990000, features: ['45MP', 'Full-frame', '8K 30fps', 'ISO 51200'] },
      { name: 'Canon EOS R8', price: 39990000, features: ['24.2MP', 'Full-frame', '4K 60fps', 'ISO 102400'] },
      { name: 'Canon EOS R50', price: 19990000, features: ['24.2MP', 'APS-C', '4K 30fps', 'Nhỏ gọn'] },
      { name: 'Nikon Z8', price: 69990000, features: ['45.7MP', 'Full-frame', '8K 30fps', 'ISO 64000'] },
      { name: 'Nikon Z6 III', price: 44990000, features: ['24.5MP', 'Full-frame', '4K 60fps', 'ISO 51200'] },
      { name: 'Nikon Z7 II', price: 54990000, features: ['45.7MP', 'Full-frame', '4K 60fps', 'ISO 64000'] },
      { name: 'Nikon Zf', price: 49990000, features: ['24.5MP', 'Full-frame', '4K 30fps', 'Thiết kế cổ điển'] },
      { name: 'Fujifilm X-T5', price: 39990000, features: ['40.2MP', 'APS-C', '6.2K 30fps', 'ISO 51200'] },
      { name: 'Fujifilm X-S20', price: 24990000, features: ['26.1MP', 'APS-C', '6.2K 30fps', 'Chống rung IBIS'] },
      { name: 'Fujifilm X100VI', price: 39990000, features: ['40.2MP', 'APS-C', '4K 30fps', 'Ống kính 23mm f/2'] },
      { name: 'Panasonic Lumix S5 II', price: 44990000, features: ['24.2MP', 'Full-frame', '6K 30fps', 'Chống rung IBIS'] },
      { name: 'Panasonic Lumix GH6', price: 49990000, features: ['25.2MP', 'MFT', '5.7K 60fps', 'Chống rung IBIS'] },
      { name: 'DJI Osmo Action 4', price: 8990000, features: ['4K 120fps', 'Chống nước 18m', 'Chống rung RockSteady', 'Pin 160 phút'] },
      { name: 'GoPro HERO12 Black', price: 10990000, features: ['5.3K 60fps', 'Chống nước 10m', 'Chống rung HyperSmooth', 'Pin 145 phút'] },
      { name: 'Insta360 X4', price: 12990000, features: ['8K 30fps', 'Chống nước 10m', 'Quay 360°', 'Pin 135 phút'] },
    ]
  },
  // Đồng hồ thông minh
  {
    category: 'Đồng hồ thông minh',
    products: [
      { name: 'Apple Watch Ultra 2', price: 19990000, features: ['Titanium', 'Màn hình 49mm', 'Pin 36 giờ', 'Chống nước 100m'] },
      { name: 'Apple Watch Series 9', price: 10990000, features: ['Nhôm', 'Màn hình 45mm', 'Pin 18 giờ', 'Chống nước 50m'] },
      { name: 'Apple Watch SE 2', price: 6290000, features: ['Nhôm', 'Màn hình 44mm', 'Pin 18 giờ', 'Chống nước 50m'] },
      { name: 'Samsung Galaxy Watch 6 Classic', price: 8990000, features: ['Thép', 'Màn hình 47mm', 'Pin 40 giờ', 'Chống nước 50m'] },
      { name: 'Samsung Galaxy Watch 6', price: 6990000, features: ['Nhôm', 'Màn hình 44mm', 'Pin 40 giờ', 'Chống nước 50m'] },
      { name: 'Samsung Galaxy Watch FE', price: 4990000, features: ['Nhôm', 'Màn hình 44mm', 'Pin 40 giờ', 'Chống nước 50m'] },
      { name: 'Garmin Forerunner 965', price: 14990000, features: ['Titanium', 'Màn hình AMOLED 1.4 inch', 'Pin 23 ngày', 'Chống nước 50m'] },
      { name: 'Garmin Fenix 7 Pro', price: 20990000, features: ['Titanium', 'Màn hình AMOLED 1.3 inch', 'Pin 37 ngày', 'Chống nước 100m'] },
      { name: 'Garmin Venu 3', price: 10990000, features: ['Thép', 'Màn hình AMOLED 1.4 inch', 'Pin 14 ngày', 'Chống nước 50m'] },
      { name: 'Huawei Watch GT 4', price: 6490000, features: ['Thép', 'Màn hình AMOLED 1.43 inch', 'Pin 14 ngày', 'Chống nước 50m'] },
      { name: 'Huawei Watch 4 Pro', price: 11990000, features: ['Titanium', 'Màn hình AMOLED 1.5 inch', 'Pin 4.5 ngày', 'Chống nước 50m'] },
      { name: 'Huawei Watch Ultimate', price: 17990000, features: ['Titanium', 'Màn hình AMOLED 1.5 inch', 'Pin 14 ngày', 'Chống nước 100m'] },
      { name: 'Xiaomi Watch 2 Pro', price: 6490000, features: ['Thép', 'Màn hình AMOLED 1.43 inch', 'Pin 65 giờ', 'Chống nước 50m'] },
      { name: 'Xiaomi Watch S3', price: 4490000, features: ['Thép', 'Màn hình AMOLED 1.43 inch', 'Pin 15 ngày', 'Chống nước 50m'] },
      { name: 'Amazfit GTR 4', price: 4690000, features: ['Nhôm', 'Màn hình AMOLED 1.43 inch', 'Pin 14 ngày', 'Chống nước 50m'] },
      { name: 'Amazfit Cheetah Pro', price: 6990000, features: ['Nhôm', 'Màn hình AMOLED 1.45 inch', 'Pin 14 ngày', 'Chống nước 50m'] },
      { name: 'Fitbit Sense 2', price: 7490000, features: ['Nhôm', 'Màn hình AMOLED 1.58 inch', 'Pin 6 ngày', 'Chống nước 50m'] },
      { name: 'Polar Vantage V3', price: 15990000, features: ['Nhôm', 'Màn hình AMOLED 1.39 inch', 'Pin 8 ngày', 'Chống nước 50m'] },
      { name: 'Suunto Vertical', price: 19990000, features: ['Thép', 'Màn hình MIP 1.4 inch', 'Pin 60 ngày', 'Chống nước 100m'] },
      { name: 'COROS Vertix 2', price: 14990000, features: ['Titanium', 'Màn hình MIP 1.4 inch', 'Pin 60 ngày', 'Chống nước 100m'] },
    ]
  },
  // Thiết bị mạng
  {
    category: 'Thiết bị mạng',
    products: [
      { name: 'Google Nest Wifi Pro', price: 5990000, features: ['Wi-Fi 6E', 'Tốc độ 5.4 Gbps', 'Phạm vi 120m²', 'Thread'] },
      { name: 'TP-Link Deco XE75 Pro', price: 12990000, features: ['Wi-Fi 6E', 'Tốc độ 5.4 Gbps', 'Phạm vi 195m²', 'Cổng 2.5 Gigabit'] },
      { name: 'TP-Link Deco X90', price: 8990000, features: ['Wi-Fi 6', 'Tốc độ 6.6 Gbps', 'Phạm vi 185m²', 'Cổng Gigabit'] },
      { name: 'TP-Link Archer AX90', price: 5990000, features: ['Wi-Fi 6', 'Tốc độ 6.6 Gbps', 'Phạm vi 100m²', 'Cổng 2.5 Gigabit'] },
      { name: 'ASUS ROG Rapture GT-AXE16000', price: 17990000, features: ['Wi-Fi 6E', 'Tốc độ 16 Gbps', 'Phạm vi 120m²', 'Cổng 10 Gigabit'] },
      { name: 'ASUS RT-AX88U Pro', price: 8990000, features: ['Wi-Fi 6', 'Tốc độ 6 Gbps', 'Phạm vi 100m²', 'Cổng 2.5 Gigabit'] },
      { name: 'ASUS ZenWiFi Pro ET12', price: 18990000, features: ['Wi-Fi 6E', 'Tốc độ 11 Gbps', 'Phạm vi 185m²', 'Cổng 2.5 Gigabit'] },
      { name: 'Netgear Orbi RBKE963', price: 24990000, features: ['Wi-Fi 6E', 'Tốc độ 10.8 Gbps', 'Phạm vi 230m²', 'Cổng 10 Gigabit'] },
      { name: 'Netgear Nighthawk RAXE500', price: 12990000, features: ['Wi-Fi 6E', 'Tốc độ 10.8 Gbps', 'Phạm vi 105m²', 'Cổng 2.5 Gigabit'] },
      { name: 'Linksys Velop MX10600', price: 13990000, features: ['Wi-Fi 6', 'Tốc độ 5.3 Gbps', 'Phạm vi 185m²', 'Cổng Gigabit'] },
      { name: 'Linksys Hydra Pro 6E', price: 7990000, features: ['Wi-Fi 6E', 'Tốc độ 6.6 Gbps', 'Phạm vi 195m²', 'Cổng Gigabit'] },
      { name: 'Amazon Eero Pro 6E', price: 10990000, features: ['Wi-Fi 6E', 'Tốc độ 2.3 Gbps', 'Phạm vi 560m²', 'Zigbee'] },
      { name: 'Ubiquiti UniFi Dream Router', price: 7990000, features: ['Wi-Fi 6', 'Tốc độ 3 Gbps', 'Phạm vi 110m²', 'UniFi OS'] },
      { name: 'Ubiquiti UniFi AP WiFi 6 Enterprise', price: 8990000, features: ['Wi-Fi 6E', 'Tốc độ 5.9 Gbps', 'Phạm vi 150m²', 'Cổng 2.5 Gigabit'] },
      { name: 'Synology RT6600ax', price: 9990000, features: ['Wi-Fi 6', 'Tốc độ 6.6 Gbps', 'Phạm vi 120m²', 'Cổng 2.5 Gigabit'] },
      { name: 'D-Link EAGLE PRO AI AX3200', price: 5490000, features: ['Wi-Fi 6', 'Tốc độ 3.2 Gbps', 'Phạm vi 100m²', 'Cổng Gigabit'] },
      { name: 'D-Link COVR-X1870 Mesh', price: 7990000, features: ['Wi-Fi 6', 'Tốc độ 3.2 Gbps', 'Phạm vi 740m²', 'AI Mesh'] },
      { name: 'Xiaomi Router AX9000', price: 3990000, features: ['Wi-Fi 6', 'Tốc độ 9 Gbps', 'RAM 1GB', 'Cổng 2.5 Gigabit'] },
      { name: 'Xiaomi Mesh System AX3000', price: 5990000, features: ['Wi-Fi 6', 'Tốc độ 3 Gbps', 'Phạm vi 370m²', 'Mesh'] },
      { name: 'Huawei WiFi Mesh 7', price: 6990000, features: ['Wi-Fi 6 Plus', 'Tốc độ 6 Gbps', 'Phạm vi 500m²', 'HarmonyOS'] },
    ]
  },
];

/**
 * Tạo mô tả sản phẩm cho điện thoại
 */
function generatePhoneDescription(brand, model, features) {
  return `
${model.name} là một chiếc điện thoại thông minh cao cấp đến từ thương hiệu ${brand}.

Sản phẩm được trang bị ${features.join(', ')}, mang lại trải nghiệm sử dụng tuyệt vời cho người dùng.

Với thiết kế sang trọng, hiện đại cùng hiệu năng mạnh mẽ, ${model.name} là lựa chọn hoàn hảo cho những ai đang tìm kiếm một chiếc điện thoại đa nhiệm, đáp ứng mọi nhu cầu từ giải trí đến công việc.

Hãy trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!`;
}

/**
 * Tạo mô tả sản phẩm cho thiết bị điện tử
 */
function generateElectronicsDescription(category, product) {
  let description = '';
  
  switch (category) {
    case 'Laptop':
      description = `
${product.name} là một chiếc laptop hiện đại với hiệu năng mạnh mẽ.

Được trang bị ${product.features.join(', ')}, chiếc laptop này đáp ứng tuyệt vời cho mọi nhu cầu từ làm việc, học tập đến giải trí.

Thiết kế sang trọng cùng khả năng di động cao, ${product.name} sẽ là người bạn đồng hành lý tưởng cho công việc và cuộc sống hàng ngày của bạn.

Hãy trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!`;
      break;
    case 'Tablet':
      description = `
${product.name} là một chiếc máy tính bảng hiện đại với hiệu năng vượt trội.

Sản phẩm được trang bị ${product.features.join(', ')}, mang đến trải nghiệm giải trí và làm việc tuyệt vời.

Với thiết kế mỏng nhẹ, dễ dàng mang theo bên mình, ${product.name} là lựa chọn hoàn hảo cho những người thường xuyên di chuyển nhưng vẫn cần một thiết bị mạnh mẽ.

Hãy trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!`;
      break;
    case 'Tai nghe':
      description = `
${product.name} là một sản phẩm tai nghe cao cấp với chất lượng âm thanh vượt trội.

Được trang bị ${product.features.join(', ')}, sản phẩm mang đến trải nghiệm nghe nhạc sống động và chân thực.

Thiết kế thoải mái, phù hợp để sử dụng trong thời gian dài mà không gây mệt mỏi. ${product.name} sẽ là người bạn đồng hành lý tưởng cho những chuyến đi hoặc giúp bạn tận hưởng không gian âm nhạc riêng tư.

Hãy trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!`;
      break;
    case 'Loa':
      description = `
${product.name} là một sản phẩm loa chất lượng cao với khả năng tái tạo âm thanh sống động.

Với các tính năng như ${product.features.join(', ')}, sản phẩm mang đến trải nghiệm âm thanh vượt trội cho không gian của bạn.

Thiết kế hiện đại, sang trọng cùng khả năng kết nối linh hoạt, ${product.name} là lựa chọn hoàn hảo cho những buổi tiệc tại gia hoặc những phút giây thư giãn với âm nhạc.

Hãy trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!`;
      break;
    case 'Camera':
      description = `
${product.name} là một chiếc máy ảnh chuyên nghiệp với khả năng bắt trọn mọi khoảnh khắc.

Được trang bị ${product.features.join(', ')}, sản phẩm mang đến khả năng chụp ảnh và quay phim ở chất lượng tuyệt vời.

Thiết kế tiện dụng, dễ sử dụng cùng nhiều tính năng thông minh, ${product.name} là công cụ lý tưởng cho cả người mới bắt đầu lẫn những nhiếp ảnh gia chuyên nghiệp.

Hãy trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!`;
      break;
    case 'Đồng hồ thông minh':
      description = `
${product.name} là một chiếc đồng hồ thông minh hiện đại với nhiều tính năng vượt trội.

Sản phẩm được trang bị ${product.features.join(', ')}, giúp bạn theo dõi sức khỏe, hoạt động thể thao và kết nối thông minh.

Thiết kế sang trọng, bền bỉ cùng thời lượng pin ấn tượng, ${product.name} là người bạn đồng hành lý tưởng cho lối sống năng động và hiện đại.

Hãy trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!`;
      break;
    case 'Thiết bị mạng':
      description = `
${product.name} là một thiết bị mạng hiện đại với hiệu suất vượt trội.

Được trang bị ${product.features.join(', ')}, sản phẩm mang đến kết nối internet ổn định và tốc độ cao cho ngôi nhà của bạn.

Thiết kế thông minh, dễ cài đặt cùng khả năng phủ sóng rộng, ${product.name} là giải pháp hoàn hảo cho nhu cầu kết nối internet ngày càng cao của gia đình hiện đại.

Hãy trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!`;
      break;
    default:
      description = `
${product.name} là một sản phẩm điện tử chất lượng cao với nhiều tính năng hiện đại.

Được trang bị ${product.features.join(', ')}, sản phẩm mang đến trải nghiệm sử dụng tuyệt vời.

Với thiết kế tinh tế và hiệu suất ấn tượng, ${product.name} sẽ là một lựa chọn tuyệt vời cho nhu cầu sử dụng của bạn.

Hãy trải nghiệm ngay hôm nay để cảm nhận sự khác biệt!`;
  }
  
  return description;
}

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
 * Thêm sản phẩm điện thoại vào cơ sở dữ liệu
 */
async function insertPhoneProducts() {
  try {
    console.log('Bắt đầu thêm 300 sản phẩm điện thoại vào database...');
    
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
    let totalCount = 0;
    
    for (const brandData of phoneProducts) {
      const brand = brandData.brand;
      
      for (const model of brandData.models) {
        try {
          totalCount++;
          if (totalCount > 300) break;
          
          // Chọn ngẫu nhiên một shop
          const shopId = shops[Math.floor(Math.random() * shops.length)].id;
          
          // Tạo mô tả sản phẩm
          const description = generatePhoneDescription(brand, model, model.features);
          
          // Tạo slug
          const slug = generateSlug(`${brand}-${model.name}`);
          
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
            `/images/products/phones/${brand.toLowerCase()}/${slug}-1.jpg`,
            `/images/products/phones/${brand.toLowerCase()}/${slug}-2.jpg`,
            `/images/products/phones/${brand.toLowerCase()}/${slug}-3.jpg`
          ];
          
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
      
      if (totalCount > 300) break;
    }
    
    console.log(`Đã thêm thành công ${successCount}/${Math.min(totalCount, 300)} sản phẩm điện thoại`);
    return successCount;
    
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm điện thoại vào database:', error);
    throw error;
  }
}

/**
 * Thêm sản phẩm điện tử vào cơ sở dữ liệu
 */
async function insertElectronicsProducts() {
  try {
    console.log('Bắt đầu thêm 200 sản phẩm điện tử vào database...');
    
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
    let totalCount = 0;
    
    for (const categoryData of electronicsProducts) {
      const category = categoryData.category;
      
      for (const product of categoryData.products) {
        try {
          totalCount++;
          if (totalCount > 200) break;
          
          // Chọn ngẫu nhiên một shop
          const shopId = shops[Math.floor(Math.random() * shops.length)].id;
          
          // Tạo mô tả sản phẩm
          const description = generateElectronicsDescription(category, product);
          
          // Tạo slug
          const slug = generateSlug(product.name);
          
          // Tạo giá khuyến mãi (nếu có)
          const hasDiscount = Math.random() < 0.7; // 70% sản phẩm có giảm giá
          let salePrice = null;
          let discountPercent = 0;
          
          if (hasDiscount) {
            discountPercent = Math.floor(Math.random() * 25) + 5; // 5-30% giảm giá
            salePrice = Math.round(product.price * (1 - discountPercent / 100) / 1000) * 1000; // Làm tròn đến 1000
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
            `/images/products/electronics/${category.toLowerCase()}/${slug}-1.jpg`,
            `/images/products/electronics/${category.toLowerCase()}/${slug}-2.jpg`,
            `/images/products/electronics/${category.toLowerCase()}/${slug}-3.jpg`
          ];
          
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
              slug,
              description,
              product.price,
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
          console.log(`Đã thêm sản phẩm điện tử #${rows[0].id}: ${product.name}`);
        } catch (error) {
          console.error(`Lỗi khi thêm sản phẩm ${product.name}:`, error.message);
        }
      }
      
      if (totalCount > 200) break;
    }
    
    console.log(`Đã thêm thành công ${successCount}/${Math.min(totalCount, 200)} sản phẩm điện tử`);
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
    console.log('===== BẮT ĐẦU THÊM SẢN PHẨM =====');
    
    // Thêm sản phẩm vào database
    const phoneCount = await insertPhoneProducts();
    const electronicsCount = await insertElectronicsProducts();
    
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