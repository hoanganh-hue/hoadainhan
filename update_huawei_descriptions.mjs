/**
 * Script để cập nhật mô tả chi tiết sản phẩm HUAWEI từ file JSON
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Client } = pg;
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Thực thi truy vấn SQL
 * @param {string} query Câu truy vấn SQL
 * @param {Array} params Tham số cho câu truy vấn
 * @returns {Promise<Array>} Kết quả truy vấn
 */
async function execute(query, params = []) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Lỗi khi thực thi truy vấn:", error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Đọc file JSON
 * @param {string} filePath Đường dẫn file JSON
 * @returns {Promise<Object>} Nội dung file JSON
 */
async function readJsonFile(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Lỗi khi đọc file ${filePath}:`, error);
    return null;
  }
}

/**
 * Lấy danh sách sản phẩm HUAWEI
 * @returns {Promise<Array>} Danh sách sản phẩm
 */
async function getHuaweiProducts() {
  const query = `
    SELECT p.* 
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug = 'huawei'
    ORDER BY p.id
  `;
  
  return await execute(query);
}

/**
 * Cập nhật mô tả sản phẩm
 * @param {number} productId ID sản phẩm
 * @param {string} description Mô tả mới
 * @returns {Promise<void>}
 */
async function updateProductDescription(productId, description) {
  const query = `
    UPDATE products
    SET description = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;
  
  await execute(query, [description, productId]);
}

/**
 * Tạo mô tả chi tiết từ dữ liệu JSON
 * @param {Object} phoneData Dữ liệu điện thoại từ JSON
 * @returns {string} Mô tả chi tiết
 */
function createDetailedDescription(phoneData) {
  // Truy cập an toàn các trường dữ liệu
  const specs = phoneData['thông số kỹ thuật'] || {};
  const colors = phoneData['màu sắc'] || [];
  
  // Tạo mô tả trong định dạng Markdown
  let description = `${phoneData.model} - ${phoneData.model} ${phoneData.năm || ''}.

## Thông số kỹ thuật

- Màn hình: ${specs['màn hình'] || ''}
- Chip: ${specs['bộ xử lý'] || ''}
- RAM: ${specs.ram || ''}
- Bộ nhớ trong: ${specs['lưu trữ'] || ''}
- Camera: ${specs.camera || ''}
- Pin: ${specs.pin || ''}
- Hệ điều hành: ${specs['hệ điều hành'] || ''}

## Màu sắc có sẵn

${colors.map(color => `- ${color}`).join('\n')}

## Phạm vi giá

${phoneData['phạm vi giá'] || 'Liên hệ để biết giá'}

## Màu sắc sản phẩm

${colors.join(', ')}
`;

  return description;
}

/**
 * Tìm sản phẩm phù hợp với model từ dữ liệu JSON
 * @param {Array} products Danh sách sản phẩm
 * @param {string} model Tên model
 * @returns {Object|null} Sản phẩm phù hợp
 */
function findMatchingProduct(products, model) {
  // Loại bỏ dấu cách, đưa về chữ thường và các ký tự đặc biệt để dễ so sánh
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '')
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd');
  };

  const normalizedModel = normalizeText(model);
  
  return products.find(product => {
    const normalizedName = normalizeText(product.name);
    return normalizedName.includes(normalizedModel);
  });
}

/**
 * Hàm chính
 * @returns {Promise<void>}
 */
async function main() {
  try {
    console.log("===== Đang xử lý thương hiệu: HUAWEI =====");
    
    // Đọc dữ liệu JSON HUAWEI
    const jsonPath = path.join('dien-thoai', 'huawei', 'huawei.json');
    const jsonData = await readJsonFile(jsonPath);
    
    if (!jsonData) {
      console.error('Không thể đọc dữ liệu JSON HUAWEI');
      return;
    }
    
    // Lấy danh sách điện thoại HUAWEI từ JSON
    const phonesKey = 'điện thoại Huawei';
    const phonesData = jsonData[phonesKey];
    
    if (!phonesData || !Array.isArray(phonesData)) {
      console.error(`Không tìm thấy dữ liệu sản phẩm hợp lệ trong file JSON với khóa ${phonesKey}`);
      return;
    }
    
    console.log(`Đọc được ${phonesData.length} mô tả HUAWEI từ file JSON`);
    
    // Lấy danh sách sản phẩm HUAWEI từ cơ sở dữ liệu
    const products = await getHuaweiProducts();
    console.log(`Tìm thấy ${products.length} sản phẩm HUAWEI trong cơ sở dữ liệu`);
    
    // Đếm số sản phẩm được cập nhật
    let updatedCount = 0;
    
    // Duyệt qua từng mô tả điện thoại trong JSON
    for (const phoneData of phonesData) {
      const model = phoneData.model;
      
      // Tìm sản phẩm phù hợp trong cơ sở dữ liệu
      const matchedProduct = findMatchingProduct(products, model);
      
      if (matchedProduct) {
        // Tạo mô tả chi tiết từ dữ liệu JSON
        const description = createDetailedDescription(phoneData);
        
        // Cập nhật mô tả trong cơ sở dữ liệu
        await updateProductDescription(matchedProduct.id, description);
        
        console.log(`Đã cập nhật mô tả cho sản phẩm: ${matchedProduct.name} (ID: ${matchedProduct.id})`);
        updatedCount++;
      } else {
        console.log(`Không tìm thấy sản phẩm khớp với model: ${model}`);
      }
    }
    
    console.log(`Đã cập nhật ${updatedCount}/${phonesData.length} mô tả cho thương hiệu HUAWEI`);
    console.log("\nHoàn tất cập nhật mô tả sản phẩm HUAWEI từ file JSON.");
  } catch (error) {
    console.error("Lỗi khi cập nhật mô tả sản phẩm:", error);
  }
}

// Thực thi script
main().catch(console.error);