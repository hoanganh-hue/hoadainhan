/**
 * Script để cập nhật hình ảnh sản phẩm từ Google Drive vào database
 * 
 * Cách sử dụng:
 * 1. Tải hình ảnh lên Google Drive và đặt quyền chia sẻ "Ai có link đều xem được"
 * 2. Cập nhật đường dẫn hình ảnh trong các đối tượng imageMap bên dưới
 *    với ID của hình ảnh trong Google Drive
 * 3. Chạy script này để cập nhật vào database
 */

import { db } from './server/db.ts';
import { products } from './shared/schema.ts';
import { eq, like } from 'drizzle-orm';

// ========== CẤU HÌNH ĐƯỜNG DẪN HÌNH ẢNH ==========

/**
 * Đường dẫn hình ảnh Google Drive cho các sản phẩm iPhone
 * Định dạng: { "tên sản phẩm": ["id_hình_1", "id_hình_2", "id_hình_3"] }
 */
const iphoneImageMap = {
  // Thay thế bằng tên sản phẩm thực tế và ID hình ảnh từ Google Drive
  "iPhone 15 Pro Max": [
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_1",
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_2",
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_3"
  ],
  "iPhone 14 Pro": [
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_4",
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_5",
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_6"
  ],
  // Thêm nhiều sản phẩm khác nếu cần
};

/**
 * Đường dẫn hình ảnh Google Drive cho các sản phẩm Samsung
 */
const samsungImageMap = {
  // Thay thế bằng tên sản phẩm thực tế và ID hình ảnh từ Google Drive
  "Samsung Galaxy S24 Ultra": [
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_7",
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_8",
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_9"
  ],
  // Thêm nhiều sản phẩm khác nếu cần
};

/**
 * Đường dẫn hình ảnh Google Drive cho các sản phẩm laptop
 */
const laptopImageMap = {
  // Thay thế bằng tên sản phẩm thực tế và ID hình ảnh từ Google Drive  
  "MacBook Pro M3": [
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_10",
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_11",
    "YOUR_GOOGLE_DRIVE_IMAGE_ID_12"
  ],
  // Thêm nhiều sản phẩm khác nếu cần
};

// ========== CÁC HÀM XỬ LÝ ==========

/**
 * Tạo URL hình ảnh Google Drive
 * @param {string} id - ID của hình ảnh trong Google Drive 
 * @returns {string} URL trực tiếp đến hình ảnh
 */
function createGoogleDriveImageUrl(id) {
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

/**
 * Cập nhật hình ảnh cho sản phẩm dựa trên tên sản phẩm và danh sách ID hình ảnh
 */
async function updateProductImagesById(productId, imageIds) {
  try {
    // Tạo danh sách đường dẫn hình ảnh từ ID
    const imageUrls = imageIds.map(id => createGoogleDriveImageUrl(id));
    
    // Cập nhật vào database
    const result = await db
      .update(products)
      .set({ images: imageUrls })
      .where(eq(products.id, productId))
      .returning({ id: products.id, name: products.name });
    
    if (result.length > 0) {
      console.log(`✅ Đã cập nhật hình ảnh cho sản phẩm: ${result[0].name}`);
      return true;
    } else {
      console.log(`❌ Không tìm thấy sản phẩm với ID: ${productId}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật hình ảnh cho sản phẩm ID ${productId}:`, error);
    return false;
  }
}

/**
 * Cập nhật hình ảnh cho sản phẩm dựa trên tên sản phẩm và danh sách ID hình ảnh
 */
async function updateProductImagesByName(productName, imageIds) {
  try {
    // Tìm sản phẩm theo tên
    const foundProducts = await db
      .select({
        id: products.id,
        name: products.name,
      })
      .from(products)
      .where(like(products.name, `%${productName}%`))
      .limit(1);
    
    if (foundProducts.length === 0) {
      console.log(`❌ Không tìm thấy sản phẩm có tên: ${productName}`);
      return false;
    }
    
    const productId = foundProducts[0].id;
    return await updateProductImagesById(productId, imageIds);
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật hình ảnh cho sản phẩm ${productName}:`, error);
    return false;
  }
}

/**
 * Cập nhật hình ảnh cho nhiều sản phẩm từ một bản đồ tên sản phẩm -> danh sách ID hình ảnh
 */
async function updateMultipleProductImages(imageMap) {
  let successCount = 0;
  let failCount = 0;
  
  for (const [productName, imageIds] of Object.entries(imageMap)) {
    const success = await updateProductImagesByName(productName, imageIds);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  return { successCount, failCount };
}

/**
 * Hàm chính
 */
async function main() {
  console.log("===== Bắt đầu cập nhật hình ảnh sản phẩm từ Google Drive =====\n");
  
  // Cập nhật hình ảnh cho sản phẩm iPhone
  console.log("\n📱 Cập nhật hình ảnh cho iPhone:");
  const iphoneResult = await updateMultipleProductImages(iphoneImageMap);
  console.log(`✅ Đã cập nhật: ${iphoneResult.successCount} | ❌ Thất bại: ${iphoneResult.failCount}`);
  
  // Cập nhật hình ảnh cho sản phẩm Samsung
  console.log("\n📱 Cập nhật hình ảnh cho Samsung:");
  const samsungResult = await updateMultipleProductImages(samsungImageMap);
  console.log(`✅ Đã cập nhật: ${samsungResult.successCount} | ❌ Thất bại: ${samsungResult.failCount}`);
  
  // Cập nhật hình ảnh cho laptop
  console.log("\n💻 Cập nhật hình ảnh cho laptop:");
  const laptopResult = await updateMultipleProductImages(laptopImageMap);
  console.log(`✅ Đã cập nhật: ${laptopResult.successCount} | ❌ Thất bại: ${laptopResult.failCount}`);
  
  // Tổng kết
  const totalSuccess = iphoneResult.successCount + samsungResult.successCount + laptopResult.successCount;
  const totalFail = iphoneResult.failCount + samsungResult.failCount + laptopResult.failCount;
  
  console.log("\n===== Tổng kết =====");
  console.log(`✅ Tổng số sản phẩm đã cập nhật thành công: ${totalSuccess}`);
  console.log(`❌ Tổng số sản phẩm cập nhật thất bại: ${totalFail}`);
  console.log("===== Hoàn tất cập nhật hình ảnh sản phẩm =====");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Lỗi:", error);
    process.exit(1);
  });