import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Edit, MapPin, CreditCard, DollarSign } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import Header from './Header';
import Footer from './Footer';
import AddressModal from './AddressForm';

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

    // Address State
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const cartItems = useSelector(state => state.cart.items);
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Payment State
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Modal States
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    // Fetch Addresses on Component Mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await axiosInstance.get('/auth/addresses');
            if (response.data.success) {
                setAddresses(response.data.addresses);
                // Auto-select default address if exists
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
        fetchAddresses(); // Refresh addresses after modal close
    };

    const handlePlaceOrder = async () => {
        // Validate selection
        if (!selectedAddress) {
            alert('Please select a shipping address');
            return;
        }

        if (!selectedPayment) {
            alert('Please select a payment method');
            return;
        }

        try {
            const orderPayload = {
                addressId: selectedAddress,
                paymentMethod: selectedPayment,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    selectedSize: item.selectedSize,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: cartTotal
            };

            const response = await axiosInstance.post('/orders', orderPayload);

            if (response.data.success) {
                // Clear cart after successful order
                dispatch({ type: 'cart/clearCart' });

                // Navigate to order confirmation
                navigate('/order-confirmation', {
                    state: {
                        orderId: response.data.orderId
                    }
                });
            }
        } catch (error) {
            console.error('Order placement failed:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    return (
        <>
            <Header />
            <div className="container py-4">
                <div className="row">
                    {/* Left Column: Shipping & Payment */}
                    <div className="col-md-7">
                        {/* Shipping Address Section */}
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

                        {/* Payment Methods Section */}
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

                    {/* Right Column: Order Summary */}
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