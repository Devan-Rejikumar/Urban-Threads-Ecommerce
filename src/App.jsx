import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import AdminProtectionLayer from './components/admin/adminProtectionLayer.jsx';
import UserDetails from './components/user/profile/UserDetails.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import AddressManagement from './components/user/profile/Address.jsx';
import ForgotPasswordForm from './components/user/ForgotPassword.jsx';
import ResetPasswordForm from './components/user/ResetPassword.jsx';
import ChangePassword from './components/user/profile/ChangePassword.jsx';
import Shop from './components/user/Shop.jsx';
import CartPage from './pages/user/CartPage.jsx';
import Wishlist from './components/user/WishList.jsx';




function App() {

  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryId" element={<CategoryProducts />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path='/profile/details' element={<UserDetails />} />
        <Route path="/profile/address" element={<AddressManagement />} />
        <Route path="/shop" element={<Shop   />} />
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


        <Route
          path="/admin-login"
          element={
            // <PublicRoute authType="admin">
            <AdminLogin />
            // </PublicRoute>
          }
        />


        <Route
          path="/admin-dashboard"
          element={

            <AdminDashboard />

          }
        >
          <Route index element={<div>Welcome to Admin Dashboard</div>} />
          <Route path="users" element={<AdminProtectionLayer><UserListing /></AdminProtectionLayer>} />
          <Route path="products" element={<AdminProtectionLayer ><Product /></AdminProtectionLayer>} />
          <Route path="categories" element={<Category />} />
          <Route path="categories/add" element={<AddCategory />} />
          <Route path="categories/edit/:id" element={<EditCategory />} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;