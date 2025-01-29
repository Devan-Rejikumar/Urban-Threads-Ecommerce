// import { useState } from "react"
// import { useSelector, useDispatch } from "react-redux"
// import { updateQuantity, removeFromCart } from "../../redux/slices/cartSlice"
// import { Link } from "react-router-dom"
// import { ShoppingCart, X, Plus, Minus } from "lucide-react"
// import "./MiniCart.css"

// const MiniCart = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   const { items, totalAmount, totalQuantity } = useSelector((state) => state.cart)
//   const dispatch = useDispatch()

//   const handleRemoveItem = (productId, selectedSize) => {
//     dispatch(removeFromCart({ productId, selectedSize }))
//   }

//   const handleQuantityChange = (productId, selectedSize, currentQuantity, change) => {
//     const newQuantity = currentQuantity + change
//     const item = items.find((item) => item.productId === productId)
//     if (item && newQuantity >= 1 && newQuantity <= item.stock && newQuantity <= item.maxPerPerson) {
//       dispatch(updateQuantity({ productId, selectedSize, quantity: newQuantity }))
//     }
//   }

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="mini-cart-button flex items-center p-2 hover:bg-gray-100 bg-white rounded-full"
//       >
//         <ShoppingCart className="text-black" />
//         {totalQuantity > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
//             {totalQuantity}
//           </span>
//         )}
//         <span className="ml-2 font-medium">BAG</span>
//       </button>

//       {isOpen && (
//         <div className="mini-cart-dropdown absolute right-0 top-full mt-2 w-96 bg-white rounded-lg z-50">
//           <div className="p-4 border-b border-gray-200">
//             <div className="flex justify-between items-center">
//               <h3 className="font-semibold text-lg">Shopping Cart ({totalQuantity})</h3>
//               <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           <div className="max-h-96 overflow-auto mini-cart-scrollbar">
//             {items.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">Your cart is empty</div>
//             ) : (
//               <div className="p-4 space-y-4">
//                 {items.map((item) => (
//                   <div
//                     key={item.productId}
//                     className="mini-cart-item flex gap-4 py-2 border-b border-gray-100 last:border-b-0"
//                   >
//                     <img
//                       src={item.image || "/placeholder.svg"}
//                       alt={item.name}
//                       className="w-20 h-20 object-cover rounded"
//                     />
//                     <div className="flex-1">
//                       <h4 className="font-medium">{item.name}</h4>
//                       <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
//                       <div className="flex items-center gap-2 mt-2">
//                         <button
//                           onClick={() => handleQuantityChange(item.productId, item.selectedSize, item.quantity, -1)}
//                           className="quantity-button p-1 hover:bg-gray-100 rounded"
//                         >
//                           <Minus className="w-4 h-4" />
//                         </button>
//                         <span className="w-8 text-center">{item.quantity}</span>
//                         <button
//                           onClick={() => handleQuantityChange(item.productId, item.selectedSize, item.quantity, 1)}
//                           className="quantity-button p-1 hover:bg-gray-100 rounded"
//                         >
//                           <Plus className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-medium">₹{item.totalPrice}</p>
//                       <button
//                         onClick={() => handleRemoveItem(item.productId, item.selectedSize)}
//                         className="remove-button text-sm text-red-500 hover:text-red-700 mt-1"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {items.length > 0 && (
//             <div className="p-4 border-t border-gray-200">
//               <div className="flex justify-between mb-4">
//                 <span className="font-semibold text-lg">Total:</span>
//                 <span className="font-semibold text-lg">₹{totalAmount}</span>
//               </div>
//               <Link
//                 to="/cart"
//                 className="view-cart-button block w-full bg-black text-white text-center py-3 rounded-lg hover:bg-gray-800 font-medium"
//                 onClick={() => setIsOpen(false)}
//               >
//                 View Cart
//               </Link>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// export default MiniCart

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