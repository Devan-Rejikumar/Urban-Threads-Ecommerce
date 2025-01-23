import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, message } = location.state || {};

  return (
    <>
      <Header />
      <div className="container my-5 text-center">
        <div className="card p-5">
          <div className="mb-4">
            <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h2 className="mb-4">Order Placed Successfully!</h2>
          <p className="mb-3">{message}</p>
          {orderId && <p className="mb-4">Order ID: {orderId}</p>}
          <div>
            <button 
              className="btn btn-primary me-3"
              onClick={() => navigate('/orders')}
            >
              View Orders
            </button>
            <button 
              className="btn btn-outline-primary"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderSuccessPage;