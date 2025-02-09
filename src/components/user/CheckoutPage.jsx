import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Edit, MapPin, CreditCard, DollarSign, Wallet } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import Header from './Header';
import Footer from './Footer';
import AddressModal from './AddressForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { loadScript } from '../../utils/razorpay.js';


const AddressCard = ({ address, onSelect, isSelected, onEdit }) => (
    <div
        className={`card mb-3 ${isSelected ? 'border-primary' : ''}`}
        onClick={() => onSelect(address)}
        style={{ cursor: 'pointer' }}
    >
        <div className="card-body d-flex align-items-center">
            <div>
                <h6 className="mb-1">{address.firstName} {address.lastName}</h6>
                <p className="text-muted small mb-0">
                    {address.streetAddress}, {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="text-muted small">{address.phoneNumber}</p>
            </div>
            <div className="ms-auto">
                <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(address);
                    }}
                >
                    <Edit size={16} />
                </button>
                {isSelected && (
                    <span className="badge bg-primary">Selecte</span>
                )}
            </div>
        </div>
    </div>
);

const PaymentMethod = ({
    method,
    title,
    description,
    icon,
    selected,
    onSelect
}) => (
    <div
        className={`card mb-3 ${selected ? 'border-primary' : ''}`}
        onClick={onSelect}
        style={{ cursor: 'pointer' }}
    >
        <div className="card-body d-flex align-items-center">
            <div className="me-3">{icon}</div>
            <div>
                <h6 className="mb-1">{title}</h6>
                <p className="text-muted small mb-0">{description}</p>
            </div>
            {selected && (
                <div className="ms-auto">
                    <span className="badge bg-primary">Selected</span>
                </div>
            )}
        </div>
    </div>
);

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const cartItems = useSelector(state => state.cart.items);
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingCharges = cartTotal >= 1200 ? 0 : 100;
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [showCouponDropdown, setShowCouponDropDown] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [useWallet, setUseWallet] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [])

    useEffect(() => {
        fetchWalletBalance();
    }, []);

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('dfghjkl;lkjhgfdToken', token);

            if (!token) {
                throw new Error('No authentication token found');
            }


            const response = await axiosInstance.get('/coupons', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCoupons(response.data.coupons);
        } catch (error) {
            console.error('Failed to fetch coupons', error)
        }
    }


    const fetchAddresses = async () => {
        try {
            const response = await axiosInstance.get('/auth/addresses');
            if (response.data.success) {
                setAddresses(response.data.addresses);

                const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddress(defaultAddress._id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        }
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address._id);
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setShowAddressModal(true);
    };

    const handleAddressModalClose = () => {
        setShowAddressModal(false);
        setEditingAddress(null);
        fetchAddresses();
    };

    const initializeRazorpayPayment = async () => {
        try {
          const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      
          if (!res) {
            toast.error('Razorpay SDK failed to load');
            return;
          }
      
          const response = await axiosInstance.post('/payment/create-order', {
            totalAmount: Math.round(cartTotal - discountAmount + shippingCharges),
            discountAmount: discountAmount,
            couponCode: selectedCoupon,
          });
      
          console.log('Razorpay Order Response:', response.data);
      
          if (!response.data.success) {
            toast.error('Failed to create Razorpay order');
            return;
          }
      
          const addressDetails = addresses.find(addr => addr._id === selectedAddress);
      
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: response.data.order.amount,
            currency: 'INR',
            name: 'Urban Threads',
            description: 'Payment for order',
            order_id: response.data.order.id,
            handler: async function (response) {
              try {
                const verifyResponse = await axiosInstance.post('/payment/verify-payment', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
      
                if (verifyResponse.data.success) {
                
                  const orderPayload = {
                    addressId: selectedAddress,
                    paymentMethod: 'online',
                    items: cartItems.map(item => ({
                      productId: item.productId,
                      selectedSize: item.selectedSize,
                      quantity: item.quantity,
                      price: item.price
                    })),
                    totalAmount: Math.round(cartTotal - discountAmount + shippingCharges),
                    discountAmount: discountAmount,
                    couponCode: selectedCoupon,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    paymentStatus: 'paid' 
                  };
      
                
                  await handleOrderCompletion(orderPayload);
                  
                  toast.success('Payment successful!');
                }
              } catch (error) {
                console.error('Payment verification error:', error);
                
                
                const failedOrderPayload = {
                  addressId: selectedAddress,
                  paymentMethod: 'online',
                  items: cartItems.map(item => ({
                    productId: item.productId,
                    selectedSize: item.selectedSize,
                    quantity: item.quantity,
                    price: item.price
                  })),
                  totalAmount: Math.round(cartTotal - discountAmount + shippingCharges),
                  discountAmount: discountAmount,
                  couponCode: selectedCoupon,
                  razorpayOrderId: response.razorpay_order_id,
                  paymentStatus: 'failed' 
                };
      
             
                await handleOrderCompletion(failedOrderPayload);
                
                toast.error('Payment verification failed');
              }
            },
            modal: {
              ondismiss: async function () {
                try {
             
                  const cancelledOrderPayload = {
                    addressId: selectedAddress,
                    paymentMethod: 'online',
                    items: cartItems.map(item => ({
                      productId: item.productId,
                      selectedSize: item.selectedSize,
                      quantity: item.quantity,
                      price: item.price
                    })),
                    totalAmount: Math.round(cartTotal - discountAmount + shippingCharges),
                    discountAmount: discountAmount,
                    couponCode: selectedCoupon,
                    razorpayOrderId: response.data.order.id,
                    paymentStatus: 'failed' 
                  };
      
                
                  await handleOrderCompletion(cancelledOrderPayload);
      
                  await axiosInstance.post('/payment/failed-payment', {
                    orderId: response.data.order.id,
                  });
                } catch (error) {
                  console.error('Failed payment error:', error);
                }
              },
            },
            prefill: {
              name: addressDetails?.firstName,
              email: '', // Add user email if available
              contact: addressDetails?.phoneNumber,
            },
            theme: {
              color: '#3399cc',
            },
          };
      
          console.log('Razorpay Options:', options);
      
          const paymentObject = new window.Razorpay(options);
          paymentObject.open();
        } catch (error) {
          console.error('Payment initialization error:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
          });
          toast.error('Failed to initialize payment retry');
        }
      };
   

    const handlePlaceOrder = async () => {
        try {
            if (!selectedAddress || !selectedPayment) {
                toast.error('Please select both address and payment method');
                return;
            }

            const finalAmount = Math.round(cartTotal - discountAmount + shippingCharges);

            if (selectedPayment === 'wallet' && walletBalance < finalAmount) {
                toast.error('Insufficient wallet balance');
                return;
            }

            const orderPayload = {
                addressId: selectedAddress,
                paymentMethod: selectedPayment,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    selectedSize: item.selectedSize,
                    quantity: item.quantity,
                    price: item.price,
                })),
                totalAmount: finalAmount,
                discountAmount: discountAmount,
                couponCode: selectedCoupon

            };

            console.log('Order Payloadwwwwwwwww:', orderPayload); // Log the payload

            if (selectedPayment === 'wallet') {
                const walletResponse = await axiosInstance.post('/wallet/debit', {
                    amount: finalAmount,
                    description: `Payment for order`,
                });

                if (!walletResponse.data.success) {
                    toast.error('Failed to deduct wallet balance');
                    return;
                }
            }

            if (selectedPayment === 'online') {
                await initializeRazorpayPayment();
                return;
            }

            if (selectedPayment === 'cod') {
                toast.error('Cash on delivery is not available on orders above ₹999');
                return;
            }

            const response = await axiosInstance.post('/orders', orderPayload);

            if (response.data.success) {
                dispatch({ type: 'cart/clearCart' });
                Swal.fire({
                    title: 'Order Placed Successfully!',
                    text: `Your order #${response.data.orderId} has been placed`,
                    icon: 'success',
                    confirmButtonText: 'View Order',
                    showCancelButton: true,
                    cancelButtonText: 'Continue Shopping',
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/profile/orders');
                    } else {
                        navigate('/shop');
                    }
                });
            } else {
                toast.error('Failed to place order');
            }
        } catch (error) {
            console.error('Order placement failed:', error);
            toast.error('Failed to place order');
        }
    };



    const handleApplyCoupon = async () => {
        try {

            const selectedCouponDetails = coupons.find(coupon => coupon.code === couponCode);

            if (selectedCouponDetails && cartTotal < selectedCouponDetails.minimumPurchase) {
                toast.info(`Minimum purchase of ₹${selectedCouponDetails.minimumPurchase} required for coupon ${couponCode}. Add items worth ₹${selectedCouponDetails.minimumPurchase - cartTotal} more to use this coupon!`);
                return;
            }

            const response = await axiosInstance.post('/apply-coupon', {
                code: couponCode
            });
            if (response.data.success) {
                setDiscountAmount(response.data.cart.discount);
                setSelectedCoupon(response.data.cart.couponCode);
                toast.success('Coupon applied successfully');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply coupon');
        }
    };

    const handleCouponSelect = (coupon) => {
        if (cartTotal < coupon.minimumPurchase) {
            toast.info(`Add items worth ₹${coupon.minimumPurchase - cartTotal} more to use coupon ${coupon.code}`);
            return;
        }
        setCouponCode(coupon.code);
        setShowCouponDropDown(false);
    }

    const handleRemoveCoupon = async () => {
        try {
            await axiosInstance.delete('/remove-coupon');
            setSelectedCoupon(null);
            setDiscountAmount(0);
            setCouponCode('');
            toast.success('Coupon removed successfully');
        } catch (error) {
            toast.error('Failed to remove coupon');
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const response = await axiosInstance.get('/wallet', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            if (response.data && response.data.wallet && typeof response.data.wallet.balance === 'number') {
                setWalletBalance(response.data.wallet.balance);
            } else {
                console.error('Invalid wallet balance format received:', response.data);
                setWalletBalance(0);
            }
        } catch (error) {
            console.error('Failed to fetch wallet balance:', error);
            setWalletBalance(0);
        }
    };
 

    const handleOrderCompletion = async (orderPayload) => {
        try {
           
            if (orderPayload.paymentMethod === 'online') {
                orderPayload.paymentStatus = orderPayload.razorpayPaymentId ? 'paid' : 'failed';
            } else {
               
                orderPayload.paymentStatus = orderPayload.paymentMethod === 'cod' ? 'pending' : 'paid';
                orderPayload.orderStatus = 'pending';
            }
    
            const response = await axiosInstance.post('/orders', orderPayload);
    
            if (response.data.success) {
                dispatch({ type: 'cart/clearCart' });
    
                // Handle failed payments
                if (orderPayload.paymentStatus === 'failed') {
                    navigate('/profile/orders');
                    toast.error('Payment failed. Please try again from your order history.');
                    return;
                }
    
                // For successful payments
                Swal.fire({
                    title: 'Order Placed Successfully!',
                    text: `Your order #${response.data.orderId} has been placed`,
                    icon: 'success',
                    confirmButtonText: 'View Order',
                    showCancelButton: true,
                    cancelButtonText: 'Continue Shopping'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/profile/orders');
                    } else {
                        navigate('/shop');
                    }
                });
            }
        } catch (error) {
            console.error('Order completion error:', error);
            toast.error('Failed to complete order');
            navigate('/cart');
        }
    };
    

    return (
        <>
            <Header />

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="container py-4">
                <div className="row">

                    <div className="col-md-7">

                        <div className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Shipping Addresses</h5>
                                <button
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => {
                                        setEditingAddress(null);
                                        setShowAddressModal(true);
                                    }}
                                >
                                    <Edit className="me-2" size={16} /> Add Address
                                </button>
                            </div>
                            <div className="card-body">
                                {addresses.map(address => (
                                    <AddressCard
                                        key={address._id}
                                        address={address}
                                        onSelect={handleAddressSelect}
                                        onEdit={handleEditAddress}
                                        isSelected={selectedAddress === address._id}
                                    />
                                ))}
                            </div>
                        </div>


                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">Payment Method</h5>
                            </div>
                            <div className="card-body">
                                <PaymentMethod
                                    method="cod"
                                    title="Cash on Delivery (COD)"
                                    description="Pay when you receive the items"
                                    icon={<DollarSign />}
                                    selected={selectedPayment === 'cod'}
                                    onSelect={() => setSelectedPayment('cod')}
                                />

                                <PaymentMethod
                                    method="online"
                                    title="Pay Online"
                                    description="Pay securely with Razorpay"
                                    icon={<CreditCard />}
                                    selected={selectedPayment === 'online'}
                                    onSelect={() => setSelectedPayment('online')}
                                />

                                {walletBalance > 0 && (
                                    <PaymentMethod
                                        method="wallet"
                                        title="Pay with Wallet"
                                        description={`Available balance: ₹${walletBalance}`}
                                        icon={<Wallet />}
                                        selected={selectedPayment === 'wallet'}
                                        onSelect={() => setSelectedPayment('wallet')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="col-md-5">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Order Summary</h5>
                            </div>
                            <div className="card-body">
                                {cartItems.map(item => (
                                    <div key={`${item.productId}-${item.selectedSize}`} className="d-flex mb-3">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="me-3"
                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h6 className="mb-1">{item.name}</h6>
                                            <p className="text-muted small mb-0">
                                                Size: {item.selectedSize} | Qty: {item.quantity}
                                            </p>
                                            <p className="fw-bold">₹{Math.round(item.price * item.quantity)

                                            }</p>
                                        </div>
                                    </div>
                                ))}

                                <hr />
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal</span>
                                    <strong>₹{Math.round(cartTotal)}</strong>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                                        <span>Discount ({couponCode})</span>
                                        <div>
                                            <strong className="me-2">-₹{discountAmount}</strong>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={handleRemoveCoupon}
                                                title="Remove Coupon"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Shipping Charges {cartTotal >= 1200 && <span className="text-success">(Free)</span>}</span>
                                    <strong>₹{shippingCharges}</strong>
                                </div>
                                <div className="d-flex justify-content-between border-top pt-2">
                                    <span className="fw-bold">Final Total</span>
                                    <strong>₹{Math.round(cartTotal - discountAmount + shippingCharges)}</strong>
                                </div>
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h5 className="mb-0">Apply Coupon</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter coupon code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                            />
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleApplyCoupon}
                                                disabled={!couponCode}
                                            >
                                                Apply
                                            </button>
                                        </div>

                                        <div className="dropdown">
                                            <button
                                                className="btn btn-secondary dropdown-toggle w-100"
                                                onClick={() => setShowCouponDropDown(!showCouponDropdown)}
                                            >
                                                Available Coupons
                                            </button>

                                            {showCouponDropdown && (
                                                <div className="dropdown-menu show w-100">
                                                    {coupons.map(coupon => (
                                                        <button
                                                            key={coupon._id}
                                                            className="dropdown-item"
                                                            onClick={() => handleCouponSelect(coupon)}
                                                        >
                                                            <strong>{coupon.code}</strong>
                                                            <br />
                                                            <small>
                                                                {coupon.discountType === 'percentage'
                                                                    ? `${coupon.discountAmount}% off`
                                                                    : `₹${coupon.discountAmount} off`}
                                                            </small>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary w-100 mt-3"
                                    onClick={handlePlaceOrder}
                                    disabled={!selectedAddress || !selectedPayment}
                                >
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddressModal
                show={showAddressModal}
                onHide={handleAddressModalClose}
                editingAddress={editingAddress}
            />

            <Footer />
        </>
    );
};

export default Checkout;