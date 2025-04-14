import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Youtube, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-5">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" 
                alt="TikTok Shop Logo" 
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold text-gray-900">TikTok Shop</span>
            </Link>
            <p className="text-gray-700 mb-5 font-medium leading-relaxed">
              Nền tảng thương mại điện tử kết nối người mua và người bán, mang đến trải nghiệm mua sắm tuyệt vời cho người tiêu dùng Việt Nam.
            </p>
            <div className="flex space-x-5">
              <span className="text-gray-600 hover:text-primary transition-colors cursor-default">
                <Facebook size={22} />
              </span>
              <span className="text-gray-600 hover:text-primary transition-colors cursor-default">
                <Instagram size={22} />
              </span>
              <span className="text-gray-600 hover:text-primary transition-colors cursor-default">
                <Twitter size={22} />
              </span>
              <span className="text-gray-600 hover:text-primary transition-colors cursor-default">
                <Youtube size={22} />
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-5 text-gray-900">Về TikTok Shop</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Giới thiệu
                </span>
              </li>
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Tuyển dụng
                </span>
              </li>
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Điều khoản
                </span>
              </li>
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Chính sách bảo mật
                </span>
              </li>
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Kênh người bán
                </span>
              </li>
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Tiếp thị liên kết
                </span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-5 text-gray-900">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Trung tâm trợ giúp
                </span>
              </li>
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Câu hỏi thường gặp
                </span>
              </li>
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Chính sách vận chuyển
                </span>
              </li>
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Chính sách đổi trả
                </span>
              </li>
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Hướng dẫn thanh toán
                </span>
              </li>
              <li>
                <span className="text-gray-700 cursor-default font-medium">
                  Liên hệ
                </span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-5 text-gray-900">Đăng ký nhận tin</h3>
            <p className="text-gray-700 mb-4 font-medium">
              Cập nhật các chương trình khuyến mãi mới nhất từ TikTok Shop
            </p>
            <div className="flex shadow-sm">
              <Input 
                type="email" 
                placeholder="Nhập email của bạn" 
                className="rounded-r-none border-gray-300 font-medium"
              />
              <Button className="rounded-l-none bg-primary hover:bg-primary/90" size="default">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6">
              <h3 className="font-bold text-lg mb-3 text-gray-900">Tải ứng dụng</h3>
              <div className="flex space-x-3">
                <span className="block transition-transform hover:scale-105 cursor-default">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                    alt="App Store" 
                    className="h-10 rounded"
                  />
                </span>
                <span className="block transition-transform hover:scale-105 cursor-default">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                    alt="Google Play" 
                    className="h-10 rounded"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <hr className="my-8 border-gray-300" />
        
        <div className="text-center text-gray-700 text-base font-medium">
          <p>&copy; {new Date().getFullYear()} TikTok Shop. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}