import { Category } from "@shared/schema";
import { Link } from "wouter";
import { 
  BookOpen, // Nhà Sách Tiki
  Building, // Nhà Cửa - Đời Sống
  Smartphone, // Điện Thoại - Máy Tính Bảng
  Gamepad2, // Đồ Chơi - Mẹ & Bé
  Headphones, // Thiết Bị Số - Phụ Kiện Số
  Plug, // Điện Gia Dụng
  Sparkles, // Làm Đẹp - Sức Khỏe
  Bike, // Ô Tô - Xe Máy - Xe Đạp
  Shirt, // Thời trang nữ/nam
  Beaker, // Bách Hóa Online
  Trophy, // Thể Thao - Dã Ngoại
  Package, // Cross Border - Hàng Quốc Tế
  Laptop, // Laptop - Máy Tính - Linh kiện
  Tv, // Điện Tử - Điện Lạnh
  Camera,  // Máy Ảnh - Máy Quay Phim
  
  // Icons khác giữ lại
  Clock,
  Gem,
  CreditCard,
  HelpCircle
} from "lucide-react";

// Icon tùy chỉnh cho giày vì Lucide không có icon giày
function CustomShoeIcon({className}: {className?: string}) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className || "w-6 h-6"} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4 16h16c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2z"/>
      <path d="M4 10V7c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v3"/>
      <path d="M4 16v2c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2"/>
    </svg>
  );
}

interface CategoryItemProps {
  category: Category;
}

// Map danh mục với icon từ Lucide và màu sắc nền theo mẫu mới
const categoryIcons: Record<string, {
  icon: React.ReactNode,
  textColor: string
}> = {
  // Các danh mục đã thiết kế theo mẫu mới
  "dien-thoai": {
    icon: <Smartphone className="w-6 h-6" />,
    textColor: "text-blue-500"
  },
  "nha-sach": {
    icon: <BookOpen className="w-6 h-6" />,
    textColor: "text-sky-500"
  },
  "nha-cua-doi-song": {
    icon: <Building className="w-6 h-6" />,
    textColor: "text-gray-600"
  },
  "me-va-be": {
    icon: <Gamepad2 className="w-6 h-6" />,
    textColor: "text-amber-500"
  },
  "me-va-be-category": {
    icon: <Gamepad2 className="w-6 h-6" />,
    textColor: "text-amber-500"
  },
  "thiet-bi-so": {
    icon: <Headphones className="w-6 h-6" />,
    textColor: "text-gray-700"
  },
  "do-gia-dung": {
    icon: <Plug className="w-6 h-6" />,
    textColor: "text-gray-600"
  },
  "lam-dep": {
    icon: <Sparkles className="w-6 h-6" />,
    textColor: "text-red-500"
  },
  "o-to-xe-may": {
    icon: <Bike className="w-6 h-6" />,
    textColor: "text-gray-700"
  },
  "thoi-trang-nu": {
    icon: <Shirt className="w-6 h-6" />,
    textColor: "text-blue-500"
  },
  "bach-hoa-online": {
    icon: <Beaker className="w-6 h-6" />,
    textColor: "text-yellow-500"
  },
  "the-thao-da-ngoai": {
    icon: <Trophy className="w-6 h-6" />,
    textColor: "text-gray-700"
  },
  "hang-quoc-te": {
    icon: <Package className="w-6 h-6" />,
    textColor: "text-blue-500"
  },
  "laptop-may-tinh": {
    icon: <Laptop className="w-6 h-6" />,
    textColor: "text-purple-500"
  },
  "giay-dep-nam": {
    icon: <CustomShoeIcon className="w-6 h-6" />,
    textColor: "text-gray-700"
  },
  "giay-dep-nu": {
    icon: <CustomShoeIcon className="w-6 h-6" />,
    textColor: "text-blue-500"
  },
  "dien-tu-dien-lanh": {
    icon: <Tv className="w-6 h-6" />,
    textColor: "text-gray-700"
  },
  "may-anh-may-quay": {
    icon: <Camera className="w-6 h-6" />,
    textColor: "text-gray-700"
  },
  
  // Các danh mục khác giữ lại
  "thoi-trang-nam": {
    icon: <Shirt className="w-6 h-6" />,
    textColor: "text-indigo-500"
  },
  "trang-suc-da-quy": {
    icon: <Gem className="w-6 h-6" />,
    textColor: "text-purple-600"
  },
  "the-ky-thuat-so": {
    icon: <CreditCard className="w-6 h-6" />,
    textColor: "text-sky-500"
  },
  "dong-ho-category": {
    icon: <Clock className="w-6 h-6" />,
    textColor: "text-yellow-500"
  },
  "dong-ho": {
    icon: <Clock className="w-6 h-6" />,
    textColor: "text-slate-700"
  },
  "dien-tu": {
    icon: <Tv className="w-6 h-6" />,
    textColor: "text-purple-500"
  },
  // Danh mục mặc định
  "other": {
    icon: <Package className="w-6 h-6" />,
    textColor: "text-gray-600"
  }
};

export default function CategoryItem({ category }: CategoryItemProps) {
  // Kiểm tra dữ liệu đầu vào
  if (!category || !category.slug) {
    return (
      <div className="flex flex-col items-center animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Lấy tên danh mục
  const categoryName = category.name || "Danh mục";
  
  // Lấy cấu hình icon dựa trên slug
  const iconConfig = categoryIcons[category.slug] || categoryIcons["other"];
  
  // Xử lý đặc biệt cho danh mục "Đồng Hồ" có slug = "dong-ho-category"
  let targetSlug = category.slug;
  if (category.slug === "dong-ho-category") {
    targetSlug = "dong-ho";
  }
  
  // Lấy màu nền dựa trên màu văn bản (giảm độ đậm của màu)
  const textColorClass = iconConfig.textColor || "text-blue-500";
  const bgColorClass = textColorClass.replace("text-", "bg-").replace("-500", "-50").replace("-600", "-50").replace("-700", "-50");
  
  return (
    <Link href={`/category/${targetSlug}`} className="flex flex-col items-center group w-full">
      <div 
        className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center ${bgColorClass} rounded-full mb-2 
        transition-all duration-200 transform group-hover:scale-105 group-hover:shadow-md border border-gray-100`}
      >
        <div className={iconConfig.textColor}>
          {iconConfig.icon || <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
        </div>
      </div>
      <div className="w-full text-center">
        <span className="text-xs font-medium text-gray-700 line-clamp-1">{categoryName}</span>
      </div>
    </Link>
  );
}