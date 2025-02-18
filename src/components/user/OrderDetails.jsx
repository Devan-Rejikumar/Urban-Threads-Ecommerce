import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Package, RefreshCw, RotateCcw } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { loadScript } from '../../utils/razorpay';
import Header from './Header';
import Footer from './Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrderCancelDialog, setShowOrderCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [orderCancelReason, setOrderCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
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

  const handleReturnOrder = async () => {
    if (!returnReason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }

    try {
      const response = await axiosInstance.post(`/orders/${orderId}/return`, {
        reason: returnReason
      });

      if (response.data.success) {
        setOrder(response.data.order);
        setShowReturnDialog(false);
        setReturnReason('');
        toast.success('Return request submitted successfully');

        if (response.data.refundInitiated) {
          toast.info('Refund will be processed after return verification');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    }
  };
  const canOrderBeCancelled = (order) => {
    return order.status === 'pending' && order.paymentStatus !== 'failed';
  };

  const handleCancelOrder = async () => {
    if (!orderCancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
     
      if (order.paymentStatus === 'failed') {
      
        const response = await axiosInstance.post(`/orders/${orderId}/cancel`, {
          reason: orderCancelReason,
          isFailedPayment: true 
        });

        if (response.data.success) {
          setOrder(response.data.order);
          setShowOrderCancelDialog(false);
          setOrderCancelReason('');
          toast.success('Order cancelled successfully');
          navigate('/profile/orders'); // Redirect to orders page
        }
      } else {
        // Normal cancellation flow for paid orders
        const response = await axiosInstance.post(`/orders/${orderId}/cancel`, {
          reason: orderCancelReason
        });

        if (response.data.success) {
          setOrder(response.data.order);
          setShowOrderCancelDialog(false);
          setOrderCancelReason('');
          toast.success('Order cancelled successfully');

          if (response.data.refundProcessed) {
            toast.success(`Refund of ₹${response.data.order.refundAmount} has been credited to your wallet`);
          }
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order || order.status !== 'delivered') return;
    setDownloadingInvoice(true);

    try {
      const response = await axiosInstance.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
     

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${order.orderId}.pdf`
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);


      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  }

  const handleItemCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      const response = await axiosInstance.post(`/orders/${orderId}/cancel-item`, {
        itemId: selectedItem.itemId,
        reason: cancelReason
      });

      if (response.data.success) {
        setOrder(response.data.order);
        setShowOrderCancelDialog(false);
        setOrderCancelReason('');
        setSelectedItem(null);
        toast.success('Item cancelled successfully');

        const cancelledItem = response.data.order.items.find(item => item._id === selectedItem.itemId);
        if (cancelledItem && cancelledItem.refundStatus === 'processed') {
          toast.success(`Refund of ₹${cancelledItem.refundAmount} has been credited to your wallet`);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel item');
    }
  };

  const handleRetryPayment = async () => {
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      const response = await axiosInstance.post('/payment/retry-payment', {
        orderId: order.orderId
      });

      if (!response.data.success) {
        toast.error(response.data.message || 'Failed to initialize payment');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.data.order.amount,
        currency: "INR",
        name: "Urban Threads",
        description: `Payment retry for order ${order.orderId}`,
        order_id: response.data.order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axiosInstance.post('/payment/verify-payment', {
              orderId: order.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              window.location.reload();
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
            window.location.reload();
          }
        },
        modal: {
          ondismiss: async function () {
            try {
              await axiosInstance.post('/payment/failed-payment', {
                orderId: order.orderId
              });
            } catch (error) {
              console.error('Failed payment error:', error);
            }
            window.location.reload();
          }
        },
        prefill: {
          name: order.addressId?.firstName,
          email: order.userId?.email,
          contact: order.addressId?.phoneNumber
        },
        theme: {
          color: "#3399cc"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment retry error:', error);
      toast.error('Failed to initialize payment retry. Please try again.');
    }
  };

  const openCancelDialog = (item) => {
    setSelectedItem({
      itemId: item._id,
      name: item.productId.name
    });
    setShowOrderCancelDialog(true);
  };
  

  const isReturnEligible = (order) => {
    if (order.status !== 'delivered') return false;
    const deliveryDate = new Date(order.updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now - deliveryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
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
  
  const renderCancelModalContent = () => {
    if (order.paymentStatus === 'failed') {
      return (
        <div className="alert alert-info">
          <strong>Note:</strong> This order will be cancelled as no payment was processed.
        </div>
      );
    }

    return (
      <div className="alert alert-warning">
        <strong>Note:</strong> {' '}
        {order?.paymentMethod === 'online' ?
          'Refund will be credited to your wallet.' :
          'No refund will be processed for COD orders.'}
      </div>
    );
  };

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
          {item.status === 'returned' && (
            <p className="text-info mb-0">
              Returned - Reason: {item.returnReason}
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
              <div className="d-flex gap-2">
                {/* <span className={`badge ${order.status === 'delivered' ? 'bg-success' : 'bg-warning'}`}>
                  {order.status.toUpperCase()}
                </span> */}
                {order.paymentStatus === 'failed' ? (
                  <span className="badge bg-danger">
                    Payment Failed
                  </span>
                ) : (<span className={`badge ${order.status === 'delivered' ? 'bg-success' : 'bg-warning'}`}>
                  {order.status.toUpperCase()}
                </span>)}
                {order.status === 'returned' && (
                  <span className="badge bg-info">
                   Returned
                  </span>
                )}
              </div>
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

        <div className="d-flex justify-content-end gap-2 mb-3">
          {order.status === 'delivered' && (
            <button
              className="btn btn-primary"
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
            >
              <FileText size={18} className="me-2" />
              {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
            </button>
          )}
          {canOrderBeCancelled(order) && order.paymentStatus !== 'failed' && (
            <button
              className="btn btn-danger"
              onClick={() => setShowOrderCancelDialog(true)}
            >
              Cancel Order
            </button>
          )}
          {isReturnEligible(order) && (
            <button
              className="btn btn-warning"
              onClick={() => setShowReturnDialog(true)}
            >
              <RotateCcw size={18} className="me-2" />
              Return Order
            </button>
          )}
        </div>

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
          {order.paymentStatus === 'failed' && (
            <div className="alert alert-danger mt-3">
              <h5 className="alert-heading">Payment Failed</h5>
              <p>The payment for this order was unsuccessful. You can retry the payment using the button below.</p>
              <button
                className="btn btn-danger"
                onClick={handleRetryPayment}
              >
                <RefreshCw size={18} className="me-2" />
                Retry Payment
              </button>
            </div>
          )}
        </div>
      </div>

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
              {renderCancelModalContent()}
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

      <div className={`modal fade ${showReturnDialog ? 'show' : ''}`}
        style={{ display: showReturnDialog ? 'block' : 'none' }}
        tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Return Order</h5>
              <button type="button" className="btn-close"
                onClick={() => {
                  setShowReturnDialog(false);
                  setReturnReason('');
                }}></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                <strong>Return Policy:</strong>
                <ul className="mb-0 mt-2">
                  <li>Returns are accepted within 7 days of delivery</li>
                  <li>Item must be unused and in original packaging</li>
                  <li>Refund will be processed after return verification</li>
                </ul>
              </div>
              <div className="form-group">
                <label>Please provide a reason for return:</label>
                <textarea
                  className="form-control mt-2"
                  rows="3"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Enter your reason for return..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary"
                onClick={() => {
                  setShowReturnDialog(false);
                  setReturnReason('');
                }}>Close</button>
              <button type="button" className="btn btn-warning"
                onClick={handleReturnOrder}>
                Submit Return Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {(showOrderCancelDialog || showReturnDialog) && <div className="modal-backdrop fade show"></div>}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Footer />
    </>
  );
};

export default OrderDetails;