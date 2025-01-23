import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`/api/admin/orders?status=${filter}`, {
                withCredentials: true
            });
            setOrders(response.data.orders);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await axios.patch(`/api/admin/orders/${orderId}/status`, 
                { status: newStatus },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Update local state
                setOrders(orders.map(order => 
                    order._id === orderId 
                    ? { ...order, status: newStatus } 
                    : order
                ));
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const renderStatusOptions = (currentStatus) => {
        const statusFlow = {
            'Pending': ['Processing', 'Cancelled'],
            'Processing': ['Shipped', 'Cancelled'],
            'Shipped': ['Delivered', 'Cancelled'],
            'Delivered': [],
            'Cancelled': []
        };

        return statusFlow[currentStatus]?.map(status => (
            <button 
                key={status} 
                className="dropdown-item" 
                onClick={() => handleUpdateOrderStatus(currentStatus._id, status)}
            >
                {status}
            </button>
        ));
    };

    if (loading) {
        return <div>Loading orders...</div>;
    }

    return (
        <div className="container-fluid">
            <h2 className="my-4">Order Management</h2>
            
            <div className="mb-3">
                <select 
                    className="form-select w-25" 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="All">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.userId.name}</td>
                            <td>₹{order.totalAmount}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <span className={`badge bg-${
                                    order.status === 'Pending' ? 'warning' :
                                    order.status === 'Processing' ? 'info' :
                                    order.status === 'Shipped' ? 'primary' :
                                    order.status === 'Delivered' ? 'success' :
                                    'danger'
                                }`}>
                                    {order.status}
                                </span>
                            </td>
                            <td>
                                <div className="dropdown">
                                    <button 
                                        className="btn btn-secondary dropdown-toggle" 
                                        type="button" 
                                        data-bs-toggle="dropdown"
                                    >
                                        Change Status
                                    </button>
                                    <ul className="dropdown-menu">
                                        {renderStatusOptions(order.status)}
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManagement;