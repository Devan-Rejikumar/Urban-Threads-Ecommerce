import React from 'react';
import { RefreshCw } from 'lucide-react';

const RetryPaymentButton = ({ order, onRetryPayment }) => {
  if (order.paymentStatus !== 'failed') {
    return null;
  }

  return (
    <div className="alert alert-danger mt-3">
      <h5 className="alert-heading">Payment Failed</h5>
      <p>The payment for this order was unsuccessful. You can retry the payment using the button below.</p>
      <button
        className="btn btn-danger"
        onClick={onRetryPayment}
      >
        <RefreshCw size={18} className="me-2" />
        Retry Payment
      </button>
    </div>
  );
};

export default RetryPaymentButton;