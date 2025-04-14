import { Link, useLocation } from "wouter";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    {
      id: "home",
      icon: <Home className="h-6 w-6" />,
      label: "Trang chủ",
      href: "/",
      isClickable: true
    },
    {
      id: "search",
      icon: <Search className="h-6 w-6" />,
      label: "Tìm kiếm",
      href: "/products",
      isClickable: true
    },
    {
      id: "cart",
      icon: <ShoppingCart className="h-6 w-6" />,
      label: "Giỏ hàng",
      href: "/cart",
      isClickable: true
    },
    {
      id: "wishlist",
      icon: <Heart className="h-6 w-6" />,
      label: "Yêu thích",
      href: "/wishlist",
      isClickable: false
    },
    {
      id: "account",
      icon: <User className="h-6 w-6" />,
      label: "Tài khoản",
      href: "/auth",
      isClickable: true
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 py-3 shadow-lg md:hidden backdrop-blur-lg bg-opacity-95">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          item.isClickable ? (
            <Link 
              key={item.id} 
              href={item.href}
              className="flex flex-col items-center w-1/5 transition-all duration-200 hover:scale-110"
            >
              <div className={`p-1.5 rounded-full ${location === item.href 
                ? 'text-white bg-primary bg-opacity-20' 
                : 'text-gray-400 hover:text-gray-300'}`}
              >
                {item.icon}
              </div>
              <span className={`text-xs mt-1 text-center ${location === item.href 
                ? 'text-white font-medium' 
                : 'text-gray-400'}`}
              >
                {item.label}
              </span>
            </Link>
          ) : (
            <div 
              key={item.id}
              className="flex flex-col items-center w-1/5 cursor-not-allowed opacity-60"
            >
              <div className="p-1.5 text-gray-600">
                {item.icon}
              </div>
              <span className="text-xs mt-1 text-center text-gray-600">
                {item.label}
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}