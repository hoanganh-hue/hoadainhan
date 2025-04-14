/**
 * Script để thêm 200 sản phẩm điện tử
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
 * Thêm sản phẩm điện tử
 */
async function addElectronicsProducts() {
  try {
    console.log('Đang thêm sản phẩm điện tử...');
    
    // Lấy ID danh mục điện tử
    const { rows: categories } = await pool.query("SELECT id FROM categories WHERE slug = 'dien-tu'");
    if (categories.length === 0) throw new Error('Không tìm thấy danh mục Điện tử');
    const categoryId = categories[0].id;
    
    // Lấy danh sách shops
    const { rows: shops } = await pool.query("SELECT id FROM shops ORDER BY id LIMIT 10");
    if (shops.length === 0) throw new Error('Không tìm thấy shop');
    
    // Danh sách các sản phẩm điện tử
    const electronics = [
      // Laptop
      { name: 'MacBook Pro 14 M3 Pro', price: 49990000, type: 'Laptop' },
      { name: 'MacBook Air 13 M2', price: 26990000, type: 'Laptop' },
      { name: 'Dell XPS 13 Plus', price: 39990000, type: 'Laptop' },
      { name: 'Dell XPS 15', price: 49990000, type: 'Laptop' },
      { name: 'HP Spectre x360', price: 35990000, type: 'Laptop' },
      { name: 'HP Envy 16', price: 42990000, type: 'Laptop' },
      { name: 'Lenovo ThinkPad X1 Carbon', price: 42990000, type: 'Laptop' },
      { name: 'Lenovo Yoga 9i', price: 34990000, type: 'Laptop' },
      { name: 'Asus Zenbook 14 OLED', price: 22990000, type: 'Laptop' },
      { name: 'Asus ROG Zephyrus G14', price: 42990000, type: 'Laptop' },
      { name: 'Acer Swift 5', price: 29990000, type: 'Laptop' },
      { name: 'Acer Nitro 5', price: 24990000, type: 'Laptop' },
      { name: 'MSI Stealth 16', price: 49990000, type: 'Laptop' },
      { name: 'MSI Prestige 14', price: 25990000, type: 'Laptop' },
      { name: 'LG Gram 17', price: 36990000, type: 'Laptop' },
      { name: 'Samsung Galaxy Book 3 Ultra', price: 44990000, type: 'Laptop' },
      { name: 'Microsoft Surface Laptop 5', price: 32990000, type: 'Laptop' },
      { name: 'Huawei MateBook X Pro', price: 36990000, type: 'Laptop' },
      { name: 'Razer Blade 16', price: 69990000, type: 'Laptop' },
      { name: 'Gigabyte Aero 16', price: 54990000, type: 'Laptop' },
      { name: 'Alienware m16 R2', price: 79990000, type: 'Laptop' },
      { name: 'Framework Laptop 16', price: 41990000, type: 'Laptop' },
      { name: 'ASUS ProArt Studiobook 16', price: 59990000, type: 'Laptop' },
      { name: 'Lenovo Legion Pro 7i', price: 69990000, type: 'Laptop' },
      { name: 'HP Omen 16', price: 39990000, type: 'Laptop' },
      
      // Tablet
      { name: 'iPad Pro 12.9 M2', price: 31990000, type: 'Tablet' },
      { name: 'iPad Air 5', price: 16990000, type: 'Tablet' },
      { name: 'iPad 10', price: 11990000, type: 'Tablet' },
      { name: 'iPad mini 6', price: 13990000, type: 'Tablet' },
      { name: 'Samsung Galaxy Tab S9 Ultra', price: 27990000, type: 'Tablet' },
      { name: 'Samsung Galaxy Tab S9+', price: 22990000, type: 'Tablet' },
      { name: 'Samsung Galaxy Tab S9', price: 18990000, type: 'Tablet' },
      { name: 'Samsung Galaxy Tab A9+', price: 7990000, type: 'Tablet' },
      { name: 'Xiaomi Pad 6', price: 7990000, type: 'Tablet' },
      { name: 'Xiaomi Pad 6 Pro', price: 10990000, type: 'Tablet' },
      { name: 'OPPO Pad 2', price: 11990000, type: 'Tablet' },
      { name: 'Lenovo Tab P12 Pro', price: 13990000, type: 'Tablet' },
      { name: 'Microsoft Surface Pro 9', price: 23990000, type: 'Tablet' },
      { name: 'Huawei MatePad Pro 13.2', price: 19990000, type: 'Tablet' },
      { name: 'Nokia T21', price: 4990000, type: 'Tablet' },
      { name: 'vivo Pad2', price: 9990000, type: 'Tablet' },
      { name: 'OnePlus Pad', price: 14990000, type: 'Tablet' },
      { name: 'Google Pixel Tablet', price: 13990000, type: 'Tablet' },
      { name: 'realme Pad 2', price: 5990000, type: 'Tablet' },
      { name: 'HONOR Pad X8', price: 3990000, type: 'Tablet' },
      
      // Tai nghe
      { name: 'Apple AirPods Pro 2', price: 5990000, type: 'Tai nghe' },
      { name: 'Apple AirPods 3', price: 4390000, type: 'Tai nghe' },
      { name: 'Apple AirPods Max', price: 12990000, type: 'Tai nghe' },
      { name: 'Samsung Galaxy Buds2 Pro', price: 3990000, type: 'Tai nghe' },
      { name: 'Sony WF-1000XM5', price: 6490000, type: 'Tai nghe' },
      { name: 'Sony WH-1000XM5', price: 8490000, type: 'Tai nghe' },
      { name: 'Bose QuietComfort Ultra', price: 9990000, type: 'Tai nghe' },
      { name: 'Sennheiser Momentum 4', price: 8490000, type: 'Tai nghe' },
      { name: 'Beats Studio Pro', price: 7990000, type: 'Tai nghe' },
      { name: 'JBL Tour Pro 2', price: 5990000, type: 'Tai nghe' },
      { name: 'JBL Quantum 910', price: 7990000, type: 'Tai nghe' },
      { name: 'Anker Soundcore Liberty 4 Pro', price: 3490000, type: 'Tai nghe' },
      { name: 'Jabra Elite 10', price: 5990000, type: 'Tai nghe' },
      { name: 'Google Pixel Buds Pro', price: 4990000, type: 'Tai nghe' },
      { name: 'Shure AONIC Free', price: 5490000, type: 'Tai nghe' },
      { name: 'Razer BlackShark V2 Pro', price: 4990000, type: 'Tai nghe' },
      { name: 'SteelSeries Arctis Nova Pro', price: 8990000, type: 'Tai nghe' },
      { name: 'Audio-Technica ATH-M50xBT2', price: 5290000, type: 'Tai nghe' },
      { name: 'Logitech G Pro X 2', price: 4990000, type: 'Tai nghe' },
      { name: 'HyperX Cloud Alpha Wireless', price: 3990000, type: 'Tai nghe' },
      
      // Loa
      { name: 'Apple HomePod 2', price: 7990000, type: 'Loa' },
      { name: 'Sonos Era 300', price: 12990000, type: 'Loa' },
      { name: 'Sonos Beam Gen 2', price: 11990000, type: 'Loa' },
      { name: 'Bose Smart Soundbar 600', price: 12990000, type: 'Loa' },
      { name: 'JBL Charge 5', price: 3490000, type: 'Loa' },
      { name: 'JBL Boombox 3', price: 10990000, type: 'Loa' },
      { name: 'Marshall Stanmore III', price: 9990000, type: 'Loa' },
      { name: 'Sony SRS-XG300', price: 5990000, type: 'Loa' },
      { name: 'Harman Kardon Aura Studio 3', price: 6490000, type: 'Loa' },
      { name: 'B&O Beosound A1 2nd Gen', price: 5490000, type: 'Loa' },
      { name: 'Ultimate Ears WONDERBOOM 3', price: 2190000, type: 'Loa' },
      { name: 'Yamaha YAS-209', price: 8990000, type: 'Loa' },
      { name: 'LG S95QR', price: 14990000, type: 'Loa' },
      { name: 'Bang & Olufsen Beosound Balance', price: 39990000, type: 'Loa' },
      { name: 'Devialet Phantom II', price: 59990000, type: 'Loa' },
      { name: 'KEF LSX II', price: 29990000, type: 'Loa' },
      { name: 'Sonos Move 2', price: 11990000, type: 'Loa' },
      { name: 'JBL PartyBox 710', price: 18990000, type: 'Loa' },
      { name: 'Klipsch The Fives', price: 25990000, type: 'Loa' },
      { name: 'DALI Oberon 7', price: 26990000, type: 'Loa' },
      
      // Camera
      { name: 'Sony Alpha 7 IV', price: 49990000, type: 'Camera' },
      { name: 'Sony Alpha 7R V', price: 89990000, type: 'Camera' },
      { name: 'Canon EOS R6 Mark II', price: 59990000, type: 'Camera' },
      { name: 'Canon EOS R5', price: 84990000, type: 'Camera' },
      { name: 'Nikon Z8', price: 69990000, type: 'Camera' },
      { name: 'Nikon Z6 III', price: 44990000, type: 'Camera' },
      { name: 'Fujifilm X-T5', price: 39990000, type: 'Camera' },
      { name: 'Fujifilm X100VI', price: 39990000, type: 'Camera' },
      { name: 'Panasonic Lumix S5 II', price: 44990000, type: 'Camera' },
      { name: 'DJI Osmo Action 4', price: 8990000, type: 'Camera' },
      { name: 'GoPro HERO12 Black', price: 10990000, type: 'Camera' },
      { name: 'Insta360 X4', price: 12990000, type: 'Camera' },
      { name: 'Leica Q3', price: 149990000, type: 'Camera' },
      { name: 'Sony ZV-E10', price: 19990000, type: 'Camera' },
      { name: 'Canon PowerShot G7 X Mark III', price: 16990000, type: 'Camera' },
      { name: 'Nikon COOLPIX P1000', price: 23990000, type: 'Camera' },
      { name: 'Sony RX100 VII', price: 29990000, type: 'Camera' },
      { name: 'Ricoh GR IIIx', price: 25990000, type: 'Camera' },
      { name: 'Fujifilm Instax Mini 12', price: 2490000, type: 'Camera' },
      { name: 'Polaroid Now+', price: 4490000, type: 'Camera' },
      
      // Đồng hồ thông minh
      { name: 'Apple Watch Ultra 2', price: 19990000, type: 'Đồng hồ thông minh' },
      { name: 'Apple Watch Series 9', price: 10990000, type: 'Đồng hồ thông minh' },
      { name: 'Samsung Galaxy Watch 6 Classic', price: 8990000, type: 'Đồng hồ thông minh' },
      { name: 'Samsung Galaxy Watch 6', price: 6990000, type: 'Đồng hồ thông minh' },
      { name: 'Garmin Forerunner 965', price: 14990000, type: 'Đồng hồ thông minh' },
      { name: 'Garmin Fenix 7 Pro', price: 20990000, type: 'Đồng hồ thông minh' },
      { name: 'Huawei Watch GT 4', price: 6490000, type: 'Đồng hồ thông minh' },
      { name: 'Huawei Watch Ultimate', price: 17990000, type: 'Đồng hồ thông minh' },
      { name: 'Xiaomi Watch 2 Pro', price: 6490000, type: 'Đồng hồ thông minh' },
      { name: 'Amazfit GTR 4', price: 4690000, type: 'Đồng hồ thông minh' },
      { name: 'Fitbit Sense 2', price: 7490000, type: 'Đồng hồ thông minh' },
      { name: 'Polar Vantage V3', price: 15990000, type: 'Đồng hồ thông minh' },
      { name: 'Suunto Vertical', price: 19990000, type: 'Đồng hồ thông minh' },
      { name: 'COROS Vertix 2', price: 14990000, type: 'Đồng hồ thông minh' },
      { name: 'Garmin Venu 3', price: 10990000, type: 'Đồng hồ thông minh' },
      { name: 'Xiaomi Watch S3', price: 4490000, type: 'Đồng hồ thông minh' },
      { name: 'Amazfit Cheetah Pro', price: 6990000, type: 'Đồng hồ thông minh' },
      { name: 'Withings ScanWatch 2', price: 8990000, type: 'Đồng hồ thông minh' },
      { name: 'Google Pixel Watch 2', price: 9990000, type: 'Đồng hồ thông minh' },
      { name: 'Tag Heuer Connected Calibre E4', price: 49990000, type: 'Đồng hồ thông minh' },
      
      // Thiết bị mạng
      { name: 'Google Nest Wifi Pro', price: 5990000, type: 'Thiết bị mạng' },
      { name: 'TP-Link Deco XE75 Pro', price: 12990000, type: 'Thiết bị mạng' },
      { name: 'TP-Link Archer AX90', price: 5990000, type: 'Thiết bị mạng' },
      { name: 'ASUS ROG Rapture GT-AXE16000', price: 17990000, type: 'Thiết bị mạng' },
      { name: 'ASUS RT-AX88U Pro', price: 8990000, type: 'Thiết bị mạng' },
      { name: 'Netgear Orbi RBKE963', price: 24990000, type: 'Thiết bị mạng' },
      { name: 'Linksys Velop MX10600', price: 13990000, type: 'Thiết bị mạng' },
      { name: 'Amazon Eero Pro 6E', price: 10990000, type: 'Thiết bị mạng' },
      { name: 'Ubiquiti UniFi Dream Router', price: 7990000, type: 'Thiết bị mạng' },
      { name: 'Synology RT6600ax', price: 9990000, type: 'Thiết bị mạng' },
      { name: 'D-Link EAGLE PRO AI AX3200', price: 5490000, type: 'Thiết bị mạng' },
      { name: 'Xiaomi Router AX9000', price: 3990000, type: 'Thiết bị mạng' },
      { name: 'Huawei WiFi Mesh 7', price: 6990000, type: 'Thiết bị mạng' },
      { name: 'Netgear Nighthawk RAXE500', price: 12990000, type: 'Thiết bị mạng' },
      { name: 'TP-Link Deco X50', price: 8990000, type: 'Thiết bị mạng' },
      { name: 'ASUS ZenWiFi Pro ET12', price: 18990000, type: 'Thiết bị mạng' },
      { name: 'Linksys Hydra Pro 6E', price: 7990000, type: 'Thiết bị mạng' },
      { name: 'Ubiquiti UniFi AP WiFi 6 Enterprise', price: 8990000, type: 'Thiết bị mạng' },
      { name: 'Xiaomi Mesh System AX3000', price: 5990000, type: 'Thiết bị mạng' },
      { name: 'D-Link COVR-X1870 Mesh', price: 7990000, type: 'Thiết bị mạng' },
      
      // Phụ kiện
      { name: 'Apple Pencil Pro', price: 3490000, type: 'Phụ kiện' },
      { name: 'Apple Magic Keyboard', price: 6990000, type: 'Phụ kiện' },
      { name: 'Samsung S Pen Pro', price: 2490000, type: 'Phụ kiện' },
      { name: 'Samsung DeX Station', price: 2990000, type: 'Phụ kiện' },
      { name: 'Logitech MX Master 3S', price: 2790000, type: 'Phụ kiện' },
      { name: 'Logitech MX Keys', price: 2590000, type: 'Phụ kiện' },
      { name: 'Anker 747 Charger', price: 2690000, type: 'Phụ kiện' },
      { name: 'Anker Prime Power Bank', price: 3990000, type: 'Phụ kiện' },
      { name: 'SteelSeries Apex Pro TKL', price: 4990000, type: 'Phụ kiện' },
      { name: 'Razer Huntsman V2', price: 3990000, type: 'Phụ kiện' },
      { name: 'WD Black SN850X 2TB', price: 5490000, type: 'Phụ kiện' },
      { name: 'Samsung T7 Shield 2TB', price: 3990000, type: 'Phụ kiện' },
      { name: 'Satechi Pro Hub Max', price: 2990000, type: 'Phụ kiện' },
      { name: 'CalDigit TS4', price: 9990000, type: 'Phụ kiện' },
      { name: 'Zhiyun Smooth 5', price: 3490000, type: 'Phụ kiện' },
      { name: 'DJI OM 6', price: 3990000, type: 'Phụ kiện' },
      { name: 'Nomad Base One Max', price: 2990000, type: 'Phụ kiện' },
      { name: 'Keychron Q1 Pro', price: 3990000, type: 'Phụ kiện' },
      { name: 'Moft Laptop Stand', price: 1490000, type: 'Phụ kiện' },
      { name: 'Peak Design Mobile Tripod', price: 1990000, type: 'Phụ kiện' },
    ];
    
    // Thêm sản phẩm vào database
    let successCount = 0;
    
    for (const product of electronics) {
      try {
        // Tạo slug
        const slug = generateSlug(product.name);
        
        // Tạo mô tả dựa trên loại sản phẩm
        let description;
        
        switch (product.type) {
          case 'Laptop':
            description = `
${product.name} là một chiếc laptop cao cấp với hiệu năng mạnh mẽ và thiết kế sang trọng.

Được trang bị bộ vi xử lý hiệu năng cao, bộ nhớ RAM lớn và ổ cứng SSD nhanh, sản phẩm mang đến khả năng xử lý mượt mà cho mọi tác vụ.

Màn hình sắc nét với độ phân giải cao cùng hệ thống âm thanh chất lượng giúp nâng cao trải nghiệm giải trí.

Thiết kế mỏng nhẹ, dễ dàng mang theo, ${product.name} là người bạn đồng hành lý tưởng cho công việc và giải trí hàng ngày.`;
            break;
          case 'Tablet':
            description = `
${product.name} là một chiếc máy tính bảng hiện đại với màn hình sắc nét và hiệu năng mạnh mẽ.

Sản phẩm mang đến trải nghiệm giải trí tuyệt vời với màn hình lớn, độ phân giải cao và hệ thống loa stereo chất lượng.

Với thiết kế mỏng nhẹ, dễ dàng mang theo bên mình, ${product.name} là công cụ lý tưởng cho cả công việc và giải trí.

Hỗ trợ bút cảm ứng, sản phẩm còn là công cụ sáng tạo tuyệt vời cho các công việc thiết kế, vẽ và ghi chú.`;
            break;
          case 'Tai nghe':
            description = `
${product.name} là một sản phẩm tai nghe cao cấp với chất lượng âm thanh vượt trội.

Được trang bị công nghệ chống ồn chủ động tiên tiến, sản phẩm mang đến không gian nghe nhạc yên tĩnh và riêng tư.

Thiết kế thoải mái, phù hợp để sử dụng trong thời gian dài mà không gây mệt mỏi.

Thời lượng pin ấn tượng cùng khả năng kết nối không dây ổn định, ${product.name} là lựa chọn hoàn hảo cho những người yêu âm nhạc.`;
            break;
          case 'Loa':
            description = `
${product.name} là một sản phẩm loa cao cấp với khả năng tái tạo âm thanh sống động và chi tiết.

Với công suất lớn cùng âm bass mạnh mẽ và treble trong trẻo, sản phẩm mang đến trải nghiệm âm thanh chất lượng cao cho mọi thể loại nhạc.

Thiết kế hiện đại, sang trọng cùng khả năng kết nối linh hoạt, ${product.name} dễ dàng phù hợp với mọi không gian sống.

Khả năng chống nước và pin dung lượng lớn giúp bạn thoải mái tận hưởng âm nhạc ở mọi nơi, mọi lúc.`;
            break;
          case 'Camera':
            description = `
${product.name} là một chiếc máy ảnh chuyên nghiệp với khả năng chụp ảnh và quay phim vượt trội.

Trang bị cảm biến ảnh lớn cùng bộ xử lý hình ảnh tiên tiến, sản phẩm cho phép bắt trọn mọi khoảnh khắc với độ chi tiết ấn tượng.

Hệ thống lấy nét nhanh chóng và chính xác cùng khả năng chụp liên tục tốc độ cao, ${product.name} không bỏ lỡ bất kỳ khoảnh khắc nào.

Với thiết kế cầm nắm thoải mái và giao diện thân thiện, sản phẩm phù hợp cho cả người mới và nhiếp ảnh gia chuyên nghiệp.`;
            break;
          case 'Đồng hồ thông minh':
            description = `
${product.name} là một chiếc đồng hồ thông minh hiện đại với nhiều tính năng hữu ích.

Sản phẩm kết hợp hoàn hảo giữa thời trang và công nghệ với thiết kế sang trọng cùng màn hình hiển thị sắc nét.

Được trang bị nhiều cảm biến sức khỏe tiên tiến, ${product.name} giúp theo dõi nhịp tim, đo nồng độ oxy trong máu, phân tích giấc ngủ và nhiều chỉ số khác.

Với thời lượng pin ấn tượng và khả năng chống nước, đồng hồ là người bạn đồng hành lý tưởng cho cả ngày dài hoạt động.`;
            break;
          case 'Thiết bị mạng':
            description = `
${product.name} là một thiết bị mạng hiện đại với khả năng cung cấp kết nối internet ổn định và tốc độ cao.

Sản phẩm hỗ trợ công nghệ Wi-Fi tiên tiến, cung cấp tốc độ truyền dữ liệu nhanh chóng và phạm vi phủ sóng rộng lớn.

Với khả năng kết nối đồng thời nhiều thiết bị và quản lý thông minh thông qua ứng dụng, ${product.name} mang đến trải nghiệm mạng tối ưu cho mọi gia đình.

Thiết kế nhỏ gọn, thanh lịch phù hợp với mọi không gian, sản phẩm còn tích hợp nhiều tính năng bảo mật để bảo vệ mạng gia đình bạn.`;
            break;
          default:
            description = `
${product.name} là một sản phẩm điện tử chất lượng cao với nhiều tính năng hiện đại.

Được thiết kế tinh tế với sự chú trọng đến từng chi tiết, sản phẩm mang đến cảm giác cao cấp và bền bỉ.

Với hiệu suất mạnh mẽ và khả năng đáp ứng nhanh chóng, ${product.name} hứa hẹn mang đến trải nghiệm sử dụng mượt mà và hiệu quả.

Đây là lựa chọn lý tưởng cho những ai đang tìm kiếm một sản phẩm chất lượng cao với giá trị xứng đáng.`;
        }
        
        // Chọn shop ngẫu nhiên
        const shopId = shops[Math.floor(Math.random() * shops.length)].id;
        
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
        const folderName = product.type.toLowerCase().replace(/\s+/g, '');
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
        
        // Dừng nếu đã đạt đủ 200 sản phẩm
        if (successCount >= 200) break;
      } catch (error) {
        console.error(`Lỗi khi thêm sản phẩm ${product.name}:`, error.message);
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
 * Hàm kiểm tra kết quả và hiển thị
 */
async function checkResults() {
  const { rows } = await pool.query(`
    SELECT c.name, COUNT(p.id) as product_count 
    FROM categories c 
    LEFT JOIN products p ON c.id = p.category_id 
    WHERE c.slug IN ('dien-thoai', 'dien-tu')
    GROUP BY c.id, c.name;
  `);
  
  console.log('===== KẾT QUẢ CUỐI CÙNG =====');
  for (const row of rows) {
    console.log(`${row.name}: ${row.product_count} sản phẩm`);
  }
}

/**
 * Hàm chính thực thi
 */
async function main() {
  try {
    console.log('===== BẮT ĐẦU THÊM SẢN PHẨM ĐIỆN TỬ =====');
    
    // Thêm sản phẩm điện tử
    const electronicsCount = await addElectronicsProducts();
    
    // Kiểm tra kết quả
    await checkResults();
    
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