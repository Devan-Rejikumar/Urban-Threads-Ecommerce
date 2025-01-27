import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Edit, MapPin, CreditCard, DollarSign } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import Header from './Header';
import Footer from './Footer';
import AddressModal from './AddressForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

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
                    <span className="badge bg-primary">Selected</span>
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
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [showCouponDropdown, setShowCouponDropDown] = useState(false);


    useEffect(() => {
        fetchAddresses();
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [])

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('dfghjkl;lkjhgfdToken',token);

            if (!token) {
                throw new Error('No authentication token found');
            }

            
            const response = await axiosInstance.get('/coupons', {
                headers : {
                    'Authorization' : `Bearer ${token}`
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

    const handlePlaceOrder = async () => {
        try {
            if (!selectedAddress || !selectedPayment) {
                toast.error('Please select both address and payment method');
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
                    status: 'pending'
                })),
                totalAmount: cartTotal
            };

            console.log('Sending order payload:', orderPayload);


            const response = await axiosInstance.post('/orders', orderPayload);

            if (response.data.success) {
                dispatch({ type: 'cart/clearCart' });
                Swal.fire({
                    title: 'Order Placed Successfully!',
                    text: `Your order #${response.data.orderId} has been placed`,
                    icon: 'success',
                    confirmButtonText: 'View Order',
                    showCancelButton: true,
                    cancelButtonText: 'Continue Shopping'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/profile/orders', {
                            state: { orderId: response.data.orderId }
                        });
                    } else {
                        navigate('/shop');
                    }
                });
            }
        } catch (error) {
            console.error('Order placement failed:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to place order');
        }
    };


    const handleApplyCoupon = async () => {
        try {
            const response = await axiosInstance.post('/apply-coupon', {
                code: couponCode,
                cartTotal: cartTotal
            });
            if (response.data.success) {
                setDiscountAmount(response.data.discountAmount)
                setSelectedCoupon(response.data.coupon);
                toast.success('Coupon applied successfully')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to appluy coupon')
        }
    }

    const handleCouponSelect = (coupon) => {
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
    return (
        <>
            <Header />
            <div className="container py-4">
                <div className="row">

                    <div className="col-md-7">

                        <div className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Shipping Addresses</h5>
                                <button
                                    className="btn btn-outline-primary btn-sm"
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
                                            <p className="fw-bold">₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}

                                <hr />
                                <div className="d-flex justify-content-between">
                                    <span>Total</span>
                                    <strong>₹{cartTotal}</strong>
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