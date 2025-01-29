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
  const [showOrderCancelDialog, setShowOrderCancelDialog] = useState(false);
  const [orderCancelReason, setOrderCancelReason] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
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
        setError(error.response?.data?.message || 'Error fetching order details');
        console.error('Error fetching order details:', error); 
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);


  const handleCancelOrder = async () => {
    if (!orderCancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      const response = await axiosInstance.post(`/orders/${orderId}/cancel`, {
        reason: orderCancelReason
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setOrder(response.data.order);
        setShowOrderCancelDialog(false);
        setOrderCancelReason('');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
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
        setShowOrderCancelDialog(false);
        setOrderCancelReason('');
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
    setShowOrderCancelDialog(true);
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

  if (error) {
    return (
      <div className="text-center py-5">
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/profile/orders')}
        >
          Back to Orders
        </button>
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

  const renderOrderItem = (item) => {
    if (!item.productId) return null;

    return (
      <div key={item._id} className="row mb-3 align-items-center">
        <div className="col-md-2">
          {item.productId.images && item.productId.images.length > 0 && (
            <img
              src={item.productId.images[0]}
              alt={item.productId.name}
              className="img-fluid rounded"
              style={{ maxHeight: '100px', objectFit: 'cover' }}
            />
          )}
        </div>
        <div className="col-md-6">
        <h6>{item.productId.name}</h6>
        <p className="text-muted mb-0">
          Size: {item.selectedSize} | Quantity: {item.quantity}
        </p>
        {item.status === 'cancelled' && (
          <>
            <p className="text-danger mb-0">
              Cancelled - Reason: {item.cancellationReason}
            </p>
            {item.refundStatus === 'processed' && (
              <p className="text-success mb-0">
                Refunded ₹{item.refundAmount} to wallet
              </p>
            )}
          </>
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
    );
  };

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
            onClick={() => setShowOrderCancelDialog(true)}
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
          {order.items.map(renderOrderItem)}
          <hr />
          <div className="text-end">
            <h5>Total: ₹{order.totalAmount.toFixed(2)}</h5>
          </div>
        </div>
        </div>
      </div>
      <Footer />

      {/* Add Cancellation Dialog */}
      <div className={`modal fade ${showOrderCancelDialog ? 'show' : ''}`}
           style={{ display: showOrderCancelDialog ? 'block' : 'none' }}
           tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cancel Order</h5>
              <button type="button" className="btn-close" 
                      onClick={() => {
                        setShowOrderCancelDialog(false);
                        setOrderCancelReason('');
                      }}></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <strong>Note:</strong> {' '}
                {order?.paymentMethod === 'online' ? 
                  'Refund will be credited to your wallet.' : 
                  'No refund will be processed for COD orders.'}
              </div>
              <div className="form-group">
                <label>Please provide a reason for cancellation:</label>
                <textarea
                  className="form-control mt-2"
                  rows="3"
                  value={orderCancelReason}
                  onChange={(e) => setOrderCancelReason(e.target.value)}
                  placeholder="Enter your reason for cancellation..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" 
                      onClick={() => {
                        setShowOrderCancelDialog(false);
                        setOrderCancelReason('');
                      }}>Close</button>
              <button type="button" className="btn btn-danger" 
                      onClick={handleCancelOrder}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      </div>
      {showOrderCancelDialog && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default OrderDetails;
