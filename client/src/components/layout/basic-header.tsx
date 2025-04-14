import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { User, ShoppingBag } from "lucide-react";

export default function BasicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" 
            alt="TikTok Shop Logo" 
            className="w-8 h-8"
          />
          <span className="text-xl font-bold">TikTok Shop</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <User className="h-4 w-4" />
              <span>Đăng nhập</span>
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm" className="hidden sm:flex gap-2">
              <User className="h-4 w-4" />
              <span>Đăng ký</span>
            </Button>
          </Link>
          
          {/* Mobile buttons */}
          <Link href="/auth" className="sm:hidden">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}