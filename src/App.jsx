import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/user/home.jsx'
import AuthForm from '../src/components/AuthForm.jsx';
import OTPVerification from './components/user/otp.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard.jsx';
import UserListing from './pages/admin/UserManagement/UserListing.jsx';
import Product from './components/admin/Product.jsx';
import Category from './components/admin/category/Category.jsx';
import AddCategory from "./pages/admin/Category-Management/Add-Category.jsx";
import EditCategory from "./pages/admin/Category-Management/Edit-Category.jsx";
import CategoryProducts from './pages/user/CategoryProducts.jsx';
import ProductDetail from './pages/user/ProductDetails.jsx';
import UserProtectionLayer from './components/UserProtectionLayer.jsx';
import AdminProtectionLayer from './components/admin/AdminProtectionLayer.jsx';
import UserDetails from './components/user/profile/UserDetails.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AddressManagement from './components/user/profile/Address.jsx';
import ForgotPasswordForm from './components/user/ForgotPassword.jsx';
import ResetPasswordForm from './components/user/ResetPassword.jsx';
import ChangePassword from './components/user/profile/ChangePassword.jsx';
import Shop from './components/user/Shop.jsx';
import CartPage from './pages/user/CartPage.jsx';
import Wishlist from './components/user/WishList.jsx';
import CheckoutPage from './components/user/CheckoutPage.jsx';
import OrderHistory from './components/user/OrderHistory.jsx';
import OrderManagement from './components/admin/OrderManagement.jsx';
import OrderDetails from './components/user/OrderDetails.jsx';
import AdminCoupon from './components/admin/AdminCoupon.jsx';
import WalletView from './pages/user/WalletView.jsx';
import OfferList from './components/admin/OfferList.jsx';
import CreateOffer from './components/admin/CreateOffer.jsx';
import EditOffer from './components/admin/EditOffer.jsx';
import SalesReport from './components/admin/Report.jsx';
import Dashboard from './components/admin/Dashboard.jsx';
import PageNotFound from './pages/user/PageNotFound.jsx'
import AboutPage from './pages/user/About.jsx';
import ContactPage from './pages/user/ContactPage.jsx';
import ResetPassword from './components/admin/ResetPassword.jsx';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryId" element={<UserProtectionLayer><CategoryProducts /></UserProtectionLayer>} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path='/profile/details' element={<UserProtectionLayer><UserDetails /></UserProtectionLayer>} />
        <Route path="/profile/address" element={<UserProtectionLayer><AddressManagement /></UserProtectionLayer>} />
        <Route path="/shop" element={<UserProtectionLayer><Shop /></UserProtectionLayer>} />
        <Route
          path="/login"
          element={
            <AuthForm />
          }
        />
        <Route
          path="/register"
          element={
            <AuthForm type="register" />
          }
        />
        <Route
          path="/verify-otp"
          element={
            <OTPVerification />
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
        <Route path="/profile/change-password" element={<ChangePassword />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile/orders" element={<OrderHistory />} />
        <Route path="/profile/orders/:orderId" element={<OrderDetails />} />
        <Route path="/profile/wallet" element={<WalletView />} />
        <Route path='/about' element = {<AboutPage />} />
        <Route path='/contact' element = {<ContactPage />} />

        <Route
          path="/admin-login"
          element={
            <AdminLogin />
          }
        />
        <Route path="/admin-dashboard" element={<AdminProtectionLayer><AdminDashboard /></AdminProtectionLayer>}
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<AdminProtectionLayer><UserListing /></AdminProtectionLayer>} />
          <Route path="products" element={<AdminProtectionLayer ><Product /></AdminProtectionLayer>} />
          <Route path="categories" element={<Category />} />
          <Route path="categories/add" element={<AddCategory />} />
          <Route path="categories/edit/:id" element={<EditCategory />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="coupons" element={<AdminCoupon />} />
          <Route path="offers" element={<OfferList />} />
          <Route path="offers/create" element={<CreateOffer />} />
          <Route path="offers/edit/:id" element={<EditOffer />} />
          <Route path="sales-report" element={<SalesReport />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;