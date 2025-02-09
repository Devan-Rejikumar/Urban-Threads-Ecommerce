import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import { toast } from 'react-toastify';
import './WalletView.css';

const WalletView = () => {
    const [walletData, setWalletData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const response = await axiosInstance.get('/wallet');
                if (response.data.success) {
                    // Sort transactions by date (newest first)
                    const sortedTransactions = response.data.wallet.transactions.sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setWalletData({
                        ...response.data.wallet,
                        transactions: sortedTransactions
                    });
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Error fetching wallet data');
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, []);

    // Get current transactions for the page
    const indexOfLastTransaction = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstTransaction = indexOfLastTransaction - ITEMS_PER_PAGE;
    const currentTransactions = walletData?.transactions?.slice(indexOfFirstTransaction, indexOfLastTransaction) || [];
    const totalPages = walletData?.transactions ? Math.ceil(walletData.transactions.length / ITEMS_PER_PAGE) : 0;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getTransactionIcon = (type) => {
        return type === 'credit' ?
            <i className="fas fa-arrow-up text-success"></i> :
            <i className="fas fa-arrow-down text-danger"></i>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAddMoney = async () => {
        try {
            const amountValue = parseFloat(amount);
            if (isNaN(amountValue) || amountValue <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }
    
            // Create Razorpay order
            const orderResponse = await axiosInstance.post('/payment/create-order', {
                totalAmount: amountValue
            });
    
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderResponse.data.order.amount,
                currency: "INR",
                name: "Urban Threads",
                description: "Add money to wallet",
                order_id: orderResponse.data.order.id,
                handler: async function(response) {
                    try {
                        // Verify payment
                        await axiosInstance.post('/payment/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
    
                        // Add money to wallet
                        const walletResponse = await axiosInstance.post('/wallet/add', {
                            amount: amountValue,
                            razorpayPaymentId: response.razorpay_payment_id
                        });
    
                        if (walletResponse.data.success) {
                            toast.success('Money added successfully');
                            setShowAddMoneyModal(false);
                            setAmount('');
                            await fetchWalletData(); // Refresh wallet data
                        }
                    } catch (error) {
                        console.error('Wallet update error:', error);
                        toast.error(error.response?.data?.message || 'Failed to add money');
                    }
                },
                theme: {
                    color: "#3399cc"
                }
            };
    
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Failed to process payment');
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="container py-5 text-center">
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="container py-5">
                {/* Wallet Balance Card */}
                <div className="row mb-4">
                    <div className="col-md-6 mx-auto">
                        <div className="card wallet-balance-card">
                            <div className="card-body text-center">
                                <h5 className="card-title mb-3">
                                    <i className="fas fa-wallet me-2"></i>
                                    Wallet Balance
                                </h5>
                                <h2 className="balance mb-3">₹{walletData?.balance || 0}</h2>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setShowAddMoneyModal(true)}
                                >
                                    Add Money
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Transaction History</h5>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : walletData?.transactions?.length > 0 ? (
                            <>
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Description</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentTransactions.map((transaction) => (
                                                <tr key={transaction._id}>
                                                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                                                    <td>{transaction.description}</td>
                                                    <td>
                                                        <span className={`badge bg-${transaction.type === 'credit' ? 'success' : 'danger'}`}>
                                                            {transaction.type}
                                                        </span>
                                                    </td>
                                                    <td>₹{transaction.amount}</td>
                                                    <td>₹{transaction.balance}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center mt-4">
                                        <nav aria-label="Transaction history pagination">
                                            <ul className="pagination">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>
                                                {[...Array(totalPages)].map((_, index) => (
                                                    <li
                                                        key={index + 1}
                                                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(index + 1)}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center">
                                <p className="mb-0">No transactions found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Money Modal */}
                <div className={`modal fade ${showAddMoneyModal ? 'show' : ''}`}
                     style={{ display: showAddMoneyModal ? 'block' : 'none' }}
                     tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Money to Wallet</h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => {
                                        setShowAddMoneyModal(false);
                                        setAmount('');
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Enter Amount (₹):</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="1"
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowAddMoneyModal(false);
                                        setAmount('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleAddMoney}
                                >
                                    Add Money
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {showAddMoneyModal && <div className="modal-backdrop fade show"></div>}
            </div>
            <Footer />
        </>
    );
};

export default WalletView;