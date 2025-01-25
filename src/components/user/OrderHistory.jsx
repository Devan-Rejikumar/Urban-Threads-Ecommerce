import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Search, Filter, ShoppingBag, Truck, Package, CheckCircle, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from './Header';
import Footer from './Footer';

const statusIcons = {
    delivered: <CheckCircle className="text-success" />,
    shipped: <Truck className="text-primary" />,
    pending: <Package className="text-warning" />,
};

export default function OrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);

 
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders(1);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const fetchOrders = async (page) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/orders', {
                params: {
                    page,
                    limit: 6,
                    search: searchTerm,
                    status: statusFilter
                }
            });

            if (response.data.success) {
                setOrders(response.data.orders);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
        setLoading(false);
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                const response = await axiosInstance.post(`/orders/${orderId}/cancel`);
                if (response.data.success) {
                    toast.success('Order cancelled successfully');
                    fetchOrders(currentPage); 
                }
            } catch (error) {
                console.error('Error cancelling order:', error);
                toast.error(error.response?.data?.message || 'Failed to cancel order');
            }
        }
    };

    return (
        <>
        <Header />
            <div className="container-fluid mt-4">
                <h1 className="mb-4 display-4 text-center">Order History</h1>
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <Search className="text-muted" size={20} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <Filter className="text-muted" size={20} />
                            </span>
                            <select
                                className="form-select border-start-0"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="delivered">Delivered</option>
                                <option value="shipped">Shipped</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {loading ? (
                        <div className="col-12 text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order._id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="card-title mb-0">Order #{order.orderId}</h5>
                                            <span className="badge bg-light text-dark">
                                                {statusIcons[order.status]}
                                                <span className="ms-2">{order.status}</span>
                                            </span>
                                        </div>
                                        <div className="card-text">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Order Date:</span>
                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Total Items:</span>
                                                <span>{order.items.length}</span>
                                            </div>
                                        </div>
                                        <div className="text-center mt-3">
                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={() => navigate(`/profile/orders/${order.orderId}`)}
                                            >
                                                <ShoppingBag size={18} className="me-2" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {pagination && pagination.totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <nav aria-label="Orders pagination">
                            <ul className="pagination">
                                <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={!pagination.hasPrevPage}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {pagination.totalPages <= 5 ? (
                                    [...Array(pagination.totalPages)].map((_, index) => (
                                        <li
                                            key={index + 1}
                                            className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <>
                                        {[...Array(3)].map((_, index) => (
                                            <li
                                                key={index + 1}
                                                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(index + 1)}
                                                >
                                                    {index + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className="page-item disabled">
                                            <span className="page-link">...</span>
                                        </li>
                                        <li
                                            className={`page-item ${currentPage === pagination.totalPages ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(pagination.totalPages)}
                                            >
                                                {pagination.totalPages}
                                            </button>
                                        </li>
                                    </>
                                )}
                                <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
            <Footer />
        </>

    );
}

