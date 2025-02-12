
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart, setCart } from "../../redux/slices/cartSlice";
import Cart from '../../pages/user/Cart.jsx';
import axiosInstance from '../../utils/axiosInstance';

const MiniCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  console.log('MiniCart re-rendered with items:', items);

  useEffect(() => {
    if (isOpen) {
      const fetchCart = async () => {
        try {
          const response = await axiosInstance.get('/cart');
          const cartItems = response.data.items.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            price: item.price,
            selectedSize: item.selectedSize,
            quantity: item.quantity,
            image: item.productId.images[0]?.url || item.productId.images[0],
            stock: item.productId.variants.find(v => v.size === item.selectedSize)?.stock || 0,
            maxPerPerson: 5
          }));
          dispatch(setCart(cartItems));
        } catch (error) {
          console.error('Error fetching cart:', error);
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
      };

      fetchCart();
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    refreshCart();
}, [dispatch]);

  const handleQuantityChange = async (productId, selectedSize, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    const item = items.find((item) => item.productId === productId);
    
    if (item && newQuantity >= 1 && newQuantity <= item.stock && newQuantity <= item.maxPerPerson) {
      try {
        await axiosInstance.put('/cart/update-quantity', {
          productId,
          selectedSize,
          quantity: newQuantity
        });
        dispatch(updateQuantity({ productId, selectedSize, quantity: newQuantity }));
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }
  };

  const handleRemoveItem = async (productId, selectedSize) => {
    try {
      await axiosInstance.delete(`/cart/remove/${productId}/${selectedSize}`);
      dispatch(removeFromCart({ productId, selectedSize }));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const refreshCart = async () => {
    try {
        const response = await axiosInstance.get('/cart');
        const cartItems = response.data.items.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            price: item.price,
            selectedSize: item.selectedSize,
            quantity: item.quantity,
            image: item.productId.images[0]?.url || item.productId.images[0],
            stock: item.productId.variants.find(v => v.size === item.selectedSize)?.stock || 0,
            maxPerPerson: 5
        }));
        dispatch(setCart(cartItems));
    } catch (error) {
        console.error('Error refreshing cart:', error);
    }
};
  return (
    <div className="mini-cart position-relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="btn btn-light position-relative" 
        aria-label="Shopping cart"
      >
        <i className="bi bi-bag"></i>
        {totalQuantity > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {totalQuantity}
          </span>
        )}
      </button>

      <Cart 
        show={isOpen}
        onHide={() => setIsOpen(false)}
      />
    </div>
  );
};

export default MiniCart;