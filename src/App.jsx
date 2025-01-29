import React, { useEffect } from 'react';
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


function App() {

  // const { user } = useSelector(state => state.userAuth);

  // const dispatch = useDispatch();
  // if(user) {
  //   useEffect(() => {
  //     const fetchCart = async () => {
  //       try {
  //         const response = await axiosInstance.get('/cart');
  //         const cartItems = response.data.items.map(item => ({
  //           productId: item.productId._id,
  //           name: item.productId.name,
  //           price: item.price,
  //           selectedSize: item.selectedSize,
  //           quantity: item.quantity,
  //           image: item.productId.images[0]?.url || item.productId.images[0],
  //           stock: item.productId.variants.find(v => v.size === item.selectedSize)?.stock || 0,
  //           maxPerPerson: 5
  //         }));
  //         dispatch(setCart(cartItems));
  //       } catch (error) {
  //         console.error('Error fetching cart:', error);
  //         if (error.response?.status === 401) {
  //           localStorage.removeItem('token');
  //           window.location.href = '/login';
  //         }
  //       }
  //     };
  
  //       fetchCart();
  //   }, [dispatch]);
  // }

  return (
    <Router>
      <Routes>

        <Route path="/" element={<UserProtectionLayer><Home /></UserProtectionLayer>} />
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
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/profile/orders" element={<OrderHistory />} />
  <Route path="/profile/orders/:orderId" element={<OrderDetails />} />
  <Route path="/profile/wallet" element={<WalletView />} />


        <Route
          path="/admin-login"
          element={
            <AdminLogin />
     
          }
        />
        <Route path="/admin-dashboard" element={<AdminProtectionLayer><AdminDashboard /></AdminProtectionLayer>}
        >
          <Route index element={<div>Welcome to Admin Dashboard</div>} />
          <Route path="users" element={<AdminProtectionLayer><UserListing /></AdminProtectionLayer>} />
          <Route path="products" element={<AdminProtectionLayer ><Product /></AdminProtectionLayer>} />
          <Route path="categories" element={<Category />} />
          <Route path="categories/add" element={<AddCategory />} />
          <Route path="categories/edit/:id" element={<EditCategory />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="coupons" element={<AdminCoupon />} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;