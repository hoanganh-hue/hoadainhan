import React from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Package,
  ShoppingBag,
  Users,
  Wallet,
  Settings,
  LineChart,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger, 
  SheetClose 
} from "@/components/ui/sheet";

interface SidebarProps {
  isMobile?: boolean;
  closeMobileMenu?: () => void;
}

const navigationItems = [
  {
    title: "Tổng quan",
    icon: <Home className="h-5 w-5" />,
    href: "/seller/dashboard"
  },
  {
    title: "Sản phẩm",
    icon: <ShoppingBag className="h-5 w-5" />,
    href: "/seller/products"
  },
  {
    title: "Đơn hàng",
    icon: <Package className="h-5 w-5" />,
    href: "/seller/orders"
  },
  {
    title: "Ví thanh toán",
    icon: <Wallet className="h-5 w-5" />,
    href: "/seller/wallet"
  },
  {
    title: "Thống kê",
    icon: <LineChart className="h-5 w-5" />,
    href: "/seller/analytics"
  },
  {
    title: "Khách hàng",
    icon: <Users className="h-5 w-5" />,
    href: "/seller/customers"
  },
  {
    title: "Cài đặt",
    icon: <Settings className="h-5 w-5" />,
    href: "/seller/settings"
  }
];

export default function SellerSidebar({ isMobile, closeMobileMenu }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const SidebarContent = () => (
    <>
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="p-4">
            <Link href="/" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-pink-500" viewBox="0 0 512 512" fill="currentColor">
                <path d="M412.19,118.66a109.27,109.27,0,0,1-9.45-5.5,132.87,132.87,0,0,1-24.27-20.62c-18.1-20.71-24.86-41.72-27.35-56.43h.1C349.14,23.9,350,16,350.13,16H267.69V334.78c0,4.28,0,8.51-.18,12.69,0,.52-.05,1-.08,1.56,0,.23,0,.47-.05.71,0,.06,0,.12,0,.18a70,70,0,0,1-35.22,55.56,68.8,68.8,0,0,1-34.11,9c-38.41,0-69.54-31.32-69.54-70s31.13-70,69.54-70a68.9,68.9,0,0,1,21.41,3.39l.1-83.94a153.14,153.14,0,0,0-118,34.52,161.79,161.79,0,0,0-35.3,43.53c-3.48,6-16.61,30.11-18.2,69.24-1,22.21,5.67,45.22,8.85,54.73v.2c2,5.6,9.75,24.71,22.38,40.82A167.53,167.53,0,0,0,115,470.66v-.2l.2.2C155.11,497.78,199.36,496,199.36,496c7.66-.31,33.32,0,62.46-13.81,32.32-15.31,50.72-38.12,50.72-38.12a158.46,158.46,0,0,0,27.64-45.93c7.46-19.61,9.95-43.13,9.95-52.53V176.49c1,.6,14.32,9.41,14.32,9.41s19.19,12.3,49.13,20.31c21.48,5.7,50.42,6.9,50.42,6.9V131.27C453.86,132.37,433.27,129.17,412.19,118.66Z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-lg font-bold">TikTok Shop</span>
                <span className="text-xs text-gray-500">Kênh người bán</span>
              </div>
            </Link>
          </div>

          <Separator className="my-2" />

          {/* Shop information */}
          <div className="px-4 py-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="font-medium text-gray-600">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "S"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium truncate max-w-[140px]">
                  {user?.fullName || user?.username || "Shop của tôi"}
                </span>
                <span className="text-xs text-gray-500">Người bán</span>
              </div>
            </div>
          </div>

          <div className="px-2 py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      location === item.href
                        ? "bg-secondary/20 text-secondary hover:bg-secondary/30"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                    onClick={isMobile && closeMobileMenu ? closeMobileMenu : undefined}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Đăng xuất</span>
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col h-screen sticky top-0">
      <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
        <SidebarContent />
      </div>
    </div>
  );
}
