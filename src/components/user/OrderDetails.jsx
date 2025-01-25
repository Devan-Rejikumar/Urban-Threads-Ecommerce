import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import Header from './Header';
import Footer from './Footer';
import { toast } from 'react-toastify';

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axiosInstance.get(`/orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.order);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await axiosInstance.post(`/orders/${orderId}/cancel`);
        if (response.data.success) {
          toast.success(response.data.message);
          setOrder(response.data.order);
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to cancel order';
        toast.error(message);
      }
    }
  };

  const handleItemCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      console.log('Sending cancel request:', {
        orderId,
        itemId: selectedItem.itemId,
        reason: cancelReason
      });

      const response = await axiosInstance.post(`/orders/${orderId}/cancel-item`, {
        itemId: selectedItem.itemId,
        reason: cancelReason
      });
      
      console.log('Cancel response:', response.data); // Debug log

      if (response.data.success) {
        toast.success(response.data.message);
        setOrder(response.data.order);
        setShowCancelDialog(false);
        setCancelReason('');
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Cancel item error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Failed to cancel item');
    }
  };

  const openCancelDialog = (item) => {
    setSelectedItem({
      itemId: item._id,
      name: item.productId.name
    });
    setShowCancelDialog(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-5">
        <h2>Order not found</h2>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/profile/orders')}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container py-5">
        <button 
          className="btn btn-link mb-4"
          onClick={() => navigate('/profile/orders')}
        >
          <ArrowLeft className="me-2" />
          Back to Orders
        </button>

        <div className="card mb-4">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Order #{order.orderId}</h4>
              <span className={`badge bg-${order.status === 'delivered' ? 'success' : 'warning'}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h5>Shipping Address</h5>
                <p>
                  {order.addressId.firstName} {order.addressId.lastName}<br />
                  {order.addressId.streetAddress}<br />
                  {order.addressId.city}, {order.addressId.state} {order.addressId.pincode}<br />
                  Phone: {order.addressId.phoneNumber}
                </p>
              </div>
              <div className="col-md-6">
                <h5>Order Info</h5>
                <p>
                  Date: {new Date(order.createdAt).toLocaleDateString()}<br />
                  Payment Method: {order.paymentMethod.toUpperCase()}<br />
                  Total Amount: ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {order && order.status === 'pending' && (
          <div className="text-end mb-3">
            <button
              className="btn btn-danger"
              onClick={handleCancelOrder}
            >
              Cancel Order
            </button>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Order Items</h5>
          </div>
          <div className="card-body">
            {order.items.map((item) => (
              <div key={item._id} className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <img
                    src={item.productId.images[0]}
                    alt={item.productId.name}
                    className="img-fluid rounded"
                    style={{ maxHeight: '100px', objectFit: 'cover' }}
                  />
                </div>
                <div className="col-md-6">
                  <h6>{item.productId.name}</h6>
                  <p className="text-muted mb-0">
                    Size: {item.selectedSize} | Quantity: {item.quantity}
                  </p>
                  {item.status === 'cancelled' && (
                    <p className="text-danger mb-0">
                      Cancelled - Reason: {item.cancellationReason}
                    </p>
                  )}
                </div>
                <div className="col-md-4 text-end">
                  <p className="fw-bold mb-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-muted small mb-0">₹{item.price} each</p>
                  {item.status === 'active' && order.status === 'pending' && (
                    <button 
                      className="btn btn-outline-danger btn-sm mt-2"
                      onClick={() => openCancelDialog(item)}
                    >
                      Cancel Item
                    </button>
                  )}
                </div>
              </div>
            ))}
            <hr />
            <div className="text-end">
              <h5>Total: ₹{order.totalAmount.toFixed(2)}</h5>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Add Cancellation Dialog */}
      <div className={`modal fade ${showCancelDialog ? 'show' : ''}`}
           style={{ display: showCancelDialog ? 'block' : 'none' }}
           tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cancel Item</h5>
              <button type="button" className="btn-close" 
                      onClick={() => {
                        setShowCancelDialog(false);
                        setCancelReason('');
                        setSelectedItem(null);
                      }}></button>
            </div>
            <div className="modal-body">
              {selectedItem && (
                <p>You are about to cancel: <strong>{selectedItem.name}</strong></p>
              )}
              <div className="form-group">
                <label>Please provide a reason for cancellation:</label>
                <textarea
                  className="form-control mt-2"
                  rows="3"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter your reason for cancellation..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" 
                      onClick={() => {
                        setShowCancelDialog(false);
                        setCancelReason('');
                        setSelectedItem(null);
                      }}>Close</button>
              <button type="button" className="btn btn-danger" 
                      onClick={handleItemCancel}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      </div>
      {showCancelDialog && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default OrderDetails;
