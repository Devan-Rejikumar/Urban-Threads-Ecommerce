import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateQuantity, removeFromCart, setCart } from '../../redux/slices/cartSlice';
import axiosInstance from '../../utils/axiosInstance';

const Cart = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.items); 

  useEffect(() => {
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

    if (show) {
      fetchCart();
    }
  }, [dispatch, show]);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleQuantityChange = async (productId, selectedSize, newQty, stock, maxPerPerson) => {
    if (newQty >= 1 && newQty <= stock && newQty <= maxPerPerson) {
      try {
        await axiosInstance.put('/cart/update-quantity', {
          productId,
          selectedSize,
          quantity: newQty
        });
        dispatch(updateQuantity({ productId, selectedSize, quantity: newQty }));
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

  const handleViewCart = () => {
    onHide();
    navigate('/cart');
  };

  const handleCheckout = () => {
    onHide();
    navigate('/checkout');
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable modal-dialog-end" 
           style={{ margin: '0 0 0 auto', height: '100vh', maxWidth: '400px' }}>
        <div className="modal-content h-100">
    
          <div className="modal-header">
            <h5 className="modal-title">Shopping Cart ({cartItems.length})</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>

     
          <div className="modal-body">
            {cartItems.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">Your cart is empty</p>
              </div>
            ) : (
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.selectedSize}`} 
                       className="card mb-3 border-0 border-bottom rounded-0">
                    <div className="row g-0">
                      <div className="col-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded"
                          style={{ maxHeight: '120px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="col-8 ps-3">
                        <div className="d-flex justify-content-between">
                          <h6 className="mb-1">{item.name}</h6>
                          <button
                            className="btn btn-link p-0 text-danger"
                            onClick={() => handleRemoveItem(item.productId, item.selectedSize)}
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-muted small mb-1">Size: {item.selectedSize}</p>
                        <p className="fw-bold mb-2">₹{item.price}</p>

                        <div className="d-flex align-items-center">
                          <div className="input-group input-group-sm" style={{ width: '120px' }}>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleQuantityChange(
                                item.productId,
                                item.selectedSize,
                                item.quantity - 1,
                                item.stock,
                                item.maxPerPerson
                              )}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="input-group-text bg-white border-secondary">
                              {item.quantity}
                            </span>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleQuantityChange(
                                item.productId,
                                item.selectedSize,
                                item.quantity + 1,
                                item.stock,
                                item.maxPerPerson
                              )}
                              disabled={item.quantity >= Math.min(item.stock, item.maxPerPerson)}
                            >
                              +
                            </button>
                          </div>
                          {item.stock <= 5 && (
                            <span className="text-danger ms-2 small">
                              Only {item.stock} left!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

         
          {cartItems.length > 0 && (
            <div className="modal-footer flex-column">
              <div className="w-100">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>
              <div className="d-flex w-100 gap-2">
                <button 
                  className="btn btn-outline-dark flex-grow-1"
                  onClick={handleViewCart}
                >
                  View Cart
                </button>
                <button 
                  className="btn btn-dark flex-grow-1"
                  onClick={handleCheckout}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;