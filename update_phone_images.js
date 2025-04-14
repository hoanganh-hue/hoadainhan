import pkg from 'pg';
const { Pool } = pkg;

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Các URL hình ảnh đã tải thành công
const localImages = [
  {
    productNamePattern: 'iPhone 14 Pro Max',
    imageUrl: '/images/products/product_sample_1.jpg'
  },
  {
    productNamePattern: 'iPhone 14 Plus',
    imageUrl: '/images/products/product_sample_3.jpg'
  },
  {
    productNamePattern: 'iPhone 14',
    imageUrl: '/images/products/product_sample_4.jpg'
  },
  {
    productNamePattern: 'iPhone 11',
    imageUrl: '/images/products/product_sample_5.jpg'
  },
  {
    productNamePattern: 'iPhone 12',
    imageUrl: '/images/products/product_sample_6.jpg'
  }
];

async function updateProductImages() {
  try {
    console.log('Bắt đầu cập nhật hình ảnh sản phẩm...');
    
    let updatedCount = 0;
    
    // Cập nhật từng mẫu hình ảnh
    for (const sample of localImages) {
      // Tìm các sản phẩm phù hợp với mẫu tên
      const { rows: products } = await pool.query(
        "SELECT id, name FROM products WHERE category_id = 3 AND name ILIKE $1",
        [`%${sample.productNamePattern}%`]
      );
      
      console.log(`Tìm thấy ${products.length} sản phẩm khớp với "${sample.productNamePattern}"`);
      
      // Cập nhật hình ảnh cho mỗi sản phẩm phù hợp
      for (const product of products) {
        // Tạo mảng hình ảnh với hình ảnh đầu tiên là hình ảnh địa phương
        // và các hình ảnh còn lại là giữ nguyên
        await pool.query(
          "UPDATE products SET images = ARRAY[$1] WHERE id = $2",
          [sample.imageUrl, product.id]
        );
        
        console.log(`Đã cập nhật hình ảnh cho sản phẩm #${product.id}: ${product.name}`);
        updatedCount++;
      }
    }
    
    console.log(`Hoàn thành cập nhật ${updatedCount} sản phẩm với hình ảnh mới`);
  } catch (error) {
    console.error('Lỗi khi cập nhật hình ảnh sản phẩm:', error);
  } finally {
    await pool.end();
  }
}

updateProductImages();