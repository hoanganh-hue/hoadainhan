import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Redirect } from "wouter";
import SellerSidebar from "@/components/layout/seller-sidebar";
import { Loader2 } from "lucide-react";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not authenticated or not a seller
  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (!user.isSeller) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <SellerSidebar isMobile={isMobile} />
      <div className="flex-1 overflow-auto">
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}