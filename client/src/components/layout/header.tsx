import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  Heart, 
  User,
  UserPlus,
  LogOut,
  Package,
  Wallet,
  Home,
  Settings,
  Store
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  // Get cart items count
  const { data: cartItems = [] } = useQuery<any[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
    initialData: []
  });
  
  const cartItemsCount = cartItems ? cartItems.length : 0;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
  };
  
  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.321 5.562a5.124 5.124 0 01-1.38-3.114v-.238H14.9v12.674c0 1.283-.985 2.34-2.252 2.424a2.42 2.42 0 01-1.838-.696 2.425 2.425 0 01-.749-1.812c.026-1.319 1.052-2.396 2.347-2.396.249-.012.5.037.736.12V8.093a6.1 6.1 0 00-1.628-.229c-3.219 0-5.878 2.656-5.878 5.888 0 2.358 1.38 4.393 3.349 5.313a5.895 5.895 0 002.53.587c3.219 0-5.878-2.656-5.878-5.888V8.41a8.568 8.568 0 004.946 1.553V6.709a5.171 5.171 0 01-3.02-1.147z"></path>
              </svg>
              <span className="text-xl font-bold text-gray-800">TikTok Shop</span>
            </Link>
          </div>
          
          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </form>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Thêm giỏ hàng */}
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900">
                    <ShoppingCart className="w-6 h-6" />
                    {cartItemsCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] min-h-[1.25rem] flex items-center justify-center">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                {/* User menu (desktop) */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-gray-700 hover:text-gray-900 flex items-center">
                        <User className="w-5 h-5 mr-1" />
                        <span>Quản lý tài khoản</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center justify-start p-2">
                        <div className="flex-shrink-0 mr-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.fullName || user.username}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Thông tin tài khoản</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="flex items-center cursor-pointer">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Đơn hàng của tôi</span>
                        </Link>
                      </DropdownMenuItem>
                      {user.isSeller ? (
                        <DropdownMenuItem asChild>
                          <Link href="/seller/dashboard" className="flex items-center cursor-pointer">
                            <Store className="mr-2 h-4 w-4" />
                            <span>Quản lý cửa hàng</span>
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem asChild>
                          <Link href="/seller/register" className="flex items-center cursor-pointer">
                            <Store className="mr-2 h-4 w-4" />
                            <span>Đăng ký bán hàng</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {user.isAffiliate ? (
                        <DropdownMenuItem asChild>
                          <Link href="/affiliate/dashboard" className="flex items-center cursor-pointer">
                            <Wallet className="mr-2 h-4 w-4" />
                            <span>Tiếp thị liên kết</span>
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem asChild>
                          <Link href="/affiliate/register" className="flex items-center cursor-pointer">
                            <Wallet className="mr-2 h-4 w-4" />
                            <span>Đăng ký tiếp thị liên kết</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login-register">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-1" />
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-primary hover:bg-primary/90">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile buttons */}
            <div className="md:hidden flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                      <User className="w-6 h-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start p-2">
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.fullName || user.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Thông tin tài khoản</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Đơn hàng của tôi</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.isSeller ? (
                      <DropdownMenuItem asChild>
                        <Link href="/seller/dashboard" className="flex items-center cursor-pointer">
                          <Store className="mr-2 h-4 w-4" />
                          <span>Quản lý cửa hàng</span>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href="/seller/register" className="flex items-center cursor-pointer">
                          <Store className="mr-2 h-4 w-4" />
                          <span>Đăng ký bán hàng</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex">
                  <Link href="/login-register">
                    <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                      <User className="w-6 h-6" />
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button variant="ghost" size="icon" className="text-pink-500 hover:text-pink-600">
                      <UserPlus className="w-6 h-6" />
                    </Button>
                  </Link>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                {showMobileSearch ? <Menu className="w-6 h-6" /> : <Search className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile search (visible on mobile only) */}
        {showMobileSearch && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
