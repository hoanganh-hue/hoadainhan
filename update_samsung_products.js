/**
 * Script để cập nhật nhanh sản phẩm Samsung còn lại
 */
import pkg from 'pg';
const { Client } = pkg;

// Kết nối đến PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Bảng dữ liệu cập nhật
const updates = [
  {
    oldName: "Các màu sắc Phantom Black, Phantom Silver, Phantom Green, Phantom Blue, Cream",
    newName: "Samsung Galaxy Z Fold 5"
  },
  {
    oldName: "Các màu sắc Quantum Black, Quantum Silver, Quantum Blue",
    newName: "Samsung Galaxy Z Fold 6"
  },
  {
    oldName: "Hình ảnh sản phẩm mẫu cho Samsung Galaxy A54 5G với các màu sắc Awesome Lime, Awesome Graphite, Awesome Violet, Awesome White.",
    newName: "Samsung Galaxy A54 5G Special"
  },
  {
    oldName: "Hình ảnh sản phẩm mẫu cho Samsung Galaxy A55 5G với các màu sắc Awesome Black, Awesome Blue, Awesome Lilac, Awesome Lime.",
    newName: "Samsung Galaxy A55 5G"
  },
  {
    oldName: "Hình ảnh sản phẩm mẫu cho Samsung Galaxy S24 Plus với các màu sắc Titanium Black, Titanium Gray, Titanium Violet, Titanium Blue, Titanium Green, Titanium Yellow",
    newName: "Samsung Galaxy S24 Plus"
  },
  {
    oldName: "Hình ảnh sản phẩm mẫu cho Samsung Galaxy S24 Ultra với các màu sắc Titanium Black, Titanium Gray, Titanium Violet, Titanium Yellow, Titanium Green, Titanium Blue",
    newName: "Samsung Galaxy S24 Ultra"
  },
  {
    oldName: "samsung-sample-1",
    newName: "Samsung Galaxy Z Fold 3"
  },
  {
    oldName: "samsung-sample-2",
    newName: "Samsung Galaxy Z Flip 3"
  },
  {
    oldName: "samsung-sample-3",
    newName: "Samsung Galaxy S21 Ultra"
  },
  {
    oldName: "samsung-sample-4",
    newName: "Samsung Galaxy S22"
  },
  {
    oldName: "samsung-sample-5",
    newName: "Samsung Galaxy Note 20"
  },
  {
    oldName: "Điện thoại Samsung Galaxy A04 (Màu sắc có thể là một trong các màu Đen, Xanh, Đồng)",
    newName: "Samsung Galaxy A04"
  },
  {
    oldName: "Điện thoại Samsung Galaxy A14 5G (Màu sắc có thể là một trong các màu Đen, Bạc, Xanh dương)",
    newName: "Samsung Galaxy A14 5G"
  },
  {
    oldName: "Điện thoại Samsung Galaxy A24 (Màu sắc có thể là một trong các màu Đen, Bạc, Xanh dương, Xanh lá)",
    newName: "Samsung Galaxy A24"
  },
  {
    oldName: "Điện thoại Samsung Galaxy A34 5G (Màu sắc có thể là một trong các màu Đen, Bạc, Xanh dương, Xanh lá)",
    newName: "Samsung Galaxy A34 5G"
  },
  {
    oldName: "Điện thoại Samsung Galaxy A53 5G (Màu sắc có thể là một trong các màu Đen, Trắng, Xanh dương, Cam)",
    newName: "Samsung Galaxy A53 5G"
  },
  {
    oldName: "Điện thoại Samsung Galaxy A73 5G (Màu sắc có thể là một trong các màu Xám, Trắng, Xanh dương)",
    newName: "Samsung Galaxy A73 5G"
  },
  {
    oldName: "Điện thoại Samsung Galaxy M14 (Màu sắc có thể là một trong các màu Xanh Navy, Xanh lá, Bạc)",
    newName: "Samsung Galaxy M14"
  },
  {
    oldName: "Điện thoại Samsung Galaxy M34 5G (Màu sắc có thể là một trong các màu Xanh Navy, Xanh lá, Bạc)",
    newName: "Samsung Galaxy M34 5G"
  },
  {
    oldName: "Điện thoại Samsung Galaxy S21 FE (Màu sắc có thể là một trong các màu Xanh, Tím, Xám, Trắng)",
    newName: "Samsung Galaxy S21 FE"
  },
  {
    oldName: "Điện thoại Samsung Galaxy S22 Ultra (Màu sắc có thể là một trong các màu Đỏ, Xanh, Tím, Trắng, Đen)",
    newName: "Samsung Galaxy S22 Ultra"
  },
  {
    oldName: "Điện thoại Samsung Galaxy S23 (Màu sắc có thể là một trong các màu Cream, Green, Lavender, Phantom Black)",
    newName: "Samsung Galaxy S23"
  },
  {
    oldName: "Điện thoại Samsung Galaxy S23 Plus (Màu sắc có thể là một trong các màu Cream, Green, Lavender, Phantom Black)",
    newName: "Samsung Galaxy S23 Plus"
  },
  {
    oldName: "Điện thoại Samsung Galaxy S23 Ultra (Màu sắc có thể là một trong các màu Cream, Green, Lavender, Phantom Black, Red, Sky Blue)",
    newName: "Samsung Galaxy S23 Ultra"
  },
  {
    oldName: "Điện thoại Samsung Galaxy Z Flip 4 (Màu sắc có thể là một trong các màu Bora Purple, Graphite, Pink Gold, Blue)",
    newName: "Samsung Galaxy Z Flip 4"
  },
  {
    oldName: "Điện thoại Samsung Galaxy Z Fold 4 (Graygreen, Phantom Black, Beige, Burgundy)",
    newName: "Samsung Galaxy Z Fold 4"
  }
];

async function main() {
  try {
    // Kết nối đến database
    await client.connect();
    console.log('Đã kết nối đến PostgreSQL database');
    
    let updated = 0;
    
    // Cập nhật từng sản phẩm
    for (const update of updates) {
      // Kiểm tra xem sản phẩm cũ có tồn tại không
      const checkQuery = `
        SELECT id, name FROM products 
        WHERE name = $1 AND category_id = 13
      `;
      const checkResult = await client.query(checkQuery, [update.oldName]);
      
      if (checkResult.rows.length === 0) {
        console.log(`Không tìm thấy sản phẩm: ${update.oldName}`);
        continue;
      }
      
      const productId = checkResult.rows[0].id;
      const newSlug = update.newName.toLowerCase().replace(/\s+/g, '-');
      
      // Cập nhật tên sản phẩm và slug
      const updateQuery = `
        UPDATE products 
        SET name = $1, slug = $2
        WHERE id = $3
      `;
      
      await client.query(updateQuery, [
        update.newName, newSlug, productId
      ]);
      
      console.log(`Đã cập nhật sản phẩm: ${update.oldName} -> ${update.newName}`);
      updated++;
    }
    
    console.log(`Đã cập nhật thành công ${updated} sản phẩm Samsung`);
  } catch (err) {
    console.error('Lỗi:', err);
  } finally {
    // Đóng kết nối database
    await client.end();
    console.log('Đã đóng kết nối database');
  }
}

main();