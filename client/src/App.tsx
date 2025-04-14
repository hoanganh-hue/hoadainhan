import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import ProductPage from "@/pages/product-page";
import CategoryPage from "@/pages/category-page";
import AllProductsPage from "@/pages/all-products-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import OrderHistoryPage from "@/pages/order-history-page";
import SellerDashboard from "@/pages/seller/dashboard";
import SellerProducts from "@/pages/seller/products";
import SellerOrders from "@/pages/seller/orders";
import SellerWallet from "@/pages/seller/wallet";
import SellerRegisterPage from "@/pages/seller/register";
import AddProductPage from "@/pages/seller/products/add";

// Affiliate pages
import AffiliateDashboardPage from "@/pages/affiliate/dashboard-page";
import AffiliateRegisterPage from "@/pages/affiliate/register-page";
import AffiliatePendingPage from "@/pages/affiliate/pending-page";
import AffiliateWithdrawPage from "@/pages/affiliate/withdraw-page";
import AffiliateCreateLinkPage from "@/pages/affiliate/create-link-page";

// Import tên trang đăng nhập đúng
import LoginRegisterPage from "@/pages/login-register";

// Import AuthProvider
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={LoginRegisterPage} />
      <Route path="/login-register" component={LoginRegisterPage} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/categories/:slug" component={CategoryPage} />
      <Route path="/products" component={AllProductsPage} />
      <ProtectedRoute path="/cart" component={CartPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/orders" component={OrderHistoryPage} />
      
      {/* Seller routes */}
      <ProtectedRoute path="/seller/register" component={SellerRegisterPage} />
      <ProtectedRoute path="/seller/dashboard" component={SellerDashboard} />
      <ProtectedRoute path="/seller/products" component={SellerProducts} />
      <ProtectedRoute path="/seller/products/add" component={AddProductPage} />
      <ProtectedRoute path="/seller/orders" component={SellerOrders} />
      <ProtectedRoute path="/seller/wallet" component={SellerWallet} />
      
      {/* Affiliate routes */}
      <ProtectedRoute path="/affiliate/dashboard" component={AffiliateDashboardPage} />
      <ProtectedRoute path="/affiliate/register" component={AffiliateRegisterPage} />
      <ProtectedRoute path="/affiliate/pending" component={AffiliatePendingPage} />
      <ProtectedRoute path="/affiliate/withdraw" component={AffiliateWithdrawPage} />
      <ProtectedRoute path="/affiliate/create-link" component={AffiliateCreateLinkPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
