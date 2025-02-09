import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateQuantity, removeFromCart, setCart } from '../../redux/slices/cartSlice';
import axiosInstance from '../../utils/axiosInstance';
import Footer from '../../components/user/Footer';
import Header from '../../components/user/Header';

const CartPage = () => {
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

    fetchCart();
  }, [dispatch]);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCharges = cartTotal >= 1200 ? 0 : 100;

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

  return (
    <>
    <Header />
      <div className="container py-5">
        <h1 className="mb-4">Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">Your cart is empty</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-8">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.selectedSize}`}
                  className="card mb-3">
                  <div className="row g-0">
                    <div className="col-md-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded-start"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="col-md-8">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <h5 className="card-title">{item.name}</h5>
                          <button
                            className="btn btn-link text-danger"
                            onClick={() => handleRemoveItem(item.productId, item.selectedSize)}
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-muted mb-1">Size: {item.selectedSize}</p>
                        <p className="fw-bold mb-3">₹{item.price}</p>

                        <div className="d-flex align-items-center">
                          <div className="input-group" style={{ width: '150px' }}>
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
                            <span className="input-group-text bg-white">
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
                            <span className="text-danger ms-3">
                              Only {item.stock} left!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Cart Summary</h5>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Subtotal:</span>
                    <strong>₹{Math.round(cartTotal)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Shipping Charges {cartTotal >= 1200 && <span className="text-success">(Free)</span>}:</span>
                    <strong>₹{shippingCharges}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-3">
                    <span className="h5 mb-0">Total:</span>
                    <strong className="h5 mb-0">₹{Math.round(cartTotal + shippingCharges)}</strong>
                  </div>
                  <button
                    className="btn btn-dark w-100"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </>

  );
};

export default CartPage;