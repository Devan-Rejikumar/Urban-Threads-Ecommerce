import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Badge, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import { Search } from 'lucide-react';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/admin/orders?status=${filter}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setOrders(response.data.orders);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await axios.patch(
                `http://localhost:5000/api/admin/orders/${orderId}/status`,
                { status: newStatus },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
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

    const handleAcceptReturn = async (orderId) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/admin/orders/${orderId}/accept-return`,
                {action : 'accept'},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setOrders(orders.map(order =>
                    order._id === orderId
                        ? { ...order, status: 'returned' }
                        : order
                ));
                setShowReturnModal(false);
            }
        } catch (error) {
            console.error('Failed to accept return:', error);
        }
    };

    const handleRejectReturn = async (orderId) => {
        try {
            console.log('Rejecting order with IDffffffff:', orderId);
            const response = await axios.post(
                `http://localhost:5000/api/admin/orders/${orderId}/reject-return`,
                { action: 'reject',
                    rejectionReason: rejectionReason },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setOrders(orders.map(order =>
                    order._id === orderId
                        ? { ...order, status: 'delivered' }
                        : order
                ));
                setShowReturnModal(false);
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Failed to reject return:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    };


    const handleViewDetails = (order) => {
        console.log('orderrrrrrrr',order.status)
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleReturnAction = (order) => {
        console.log('Selected order for return action:', order);
        setSelectedOrder(order);
        setShowReturnModal(true);
    };

    const getStatusOptions = (currentStatus) => {
        console.log('Current Status:', currentStatus);
        const capitalizedStatus = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).toLowerCase();
        const statusFlow = {
            'Pending': ['Processing', 'Shipped', 'Cancelled'],
            'Processing': ['Shipped', 'Cancelled'],
            'Shipped': ['Delivered', 'Cancelled'],
            'Delivered': [],
            'Cancelled': [],
            'return_requested': [],
            'returned': []

        };
        return statusFlow[capitalizedStatus] || [];
    };

    const getStatusBadgeVariant = (status) => {
        const statusVariants = {
            'pending': 'warning',
            'processing': 'info',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'danger',
            'return_requested': 'warning',
            'returned': 'secondary'
        };
        return statusVariants[status] || 'secondary';
    };

    useEffect(() => {
        if (searchTerm) {
            const filtered = orders.filter(order =>
                order.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(orders);
        }
    }, [searchTerm, orders]);

    const displayOrders = searchTerm ? filteredOrders : orders;

    if (loading) {
        return <div>Loading orders...</div>;
    }

    return (
        <Container fluid>
            <h2 className="my-4">Order Management</h2>

            <div className="d-flex gap-3 mb-3">
                <InputGroup className="w-50">
                    <InputGroup.Text>
                        <Search size={20} />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Search by customer name, email or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <Form.Select
                    className="w-25"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="All">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </Form.Select>
            </div>

            {displayOrders.length === 0 ? (
                <div className="text-center py-5">
                    <h4>No orders found</h4>
                    <p className="text-muted">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Total Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayOrders.map(order => (
                            <tr key={order._id}>
                                <td>#{order.orderId}</td>
                                <td>₹{order.totalAmount}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <Badge bg={getStatusBadgeVariant(order.status)}>
                                        {order.status}
                                    </Badge>
                                </td>
                                <td>
                                    {order.status === 'return_requested' ? (
                                        <Button
                                            variant="warning"
                                            onClick={() => handleReturnAction(order)}
                                        >
                                            Handle Return Request
                                        </Button>
                                    ) : (
                                        <Dropdown>
                                            <Dropdown.Toggle
                                                variant="secondary"
                                                disabled={['cancelled', 'delivered', 'returned', 'return_requested'].includes(order.status)}
                                            >
                                                Change Status
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {getStatusOptions(order.status).map(status => (
                                                    <Dropdown.Item
                                                        key={status}
                                                        onClick={() => handleUpdateOrderStatus(order._id, status)}
                                                    >
                                                        {status}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    )}
                                </td>
                                <td>
                                    <Button
                                        variant="info"
                                        size="sm"
                                        onClick={() => handleViewDetails(order)}
                                    >
                                        View Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Handle Return Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <p><strong>Order ID:</strong> #{selectedOrder.orderId}</p>
                            <p><strong>Return Reason:</strong> {selectedOrder.returnReason}</p>
                            <p><strong>Requested Date:</strong> {new Date(selectedOrder.returnRequestedAt).toLocaleString()}</p>

                            <Form.Group className="mb-3">
                                <Form.Label>Rejection Reason (required if rejecting)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReturnModal(false)}>
                        Close
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => handleRejectReturn(selectedOrder?._id)}
                        disabled={!rejectionReason.trim()}
                    >
                        Reject Return
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => handleAcceptReturn(selectedOrder?._id)}
                    >
                        Accept Return
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Order Details Modal */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Order Details #{selectedOrder?.orderId}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6>Customer Information</h6>
                                    <p>
                                        Name: {selectedOrder.userId?.firstName}<br />
                                        Email: {selectedOrder.userId?.email}<br />
                                        Order Date: {new Date(selectedOrder.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <h6>Shipping Address</h6>
                                    <p>
                                        {selectedOrder.addressId?.firstName} {selectedOrder.addressId?.lastName}<br />
                                        {selectedOrder.addressId?.streetAddress}<br />
                                        {selectedOrder.addressId?.city}, {selectedOrder.addressId?.state}<br />
                                        {selectedOrder.addressId?.pincode}<br />
                                        Phone: {selectedOrder.addressId?.phoneNumber}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6>Order Status</h6>
                                <Badge bg={getStatusBadgeVariant(selectedOrder.status)}>
                                    {selectedOrder.status}
                                </Badge>
                            </div>

                            <h6>Order Items</h6>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Size</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item) => (
                                        <tr key={item._id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={item.productId.images[0]}
                                                        alt={item.productId.name}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        className="me-2"
                                                    />
                                                    {item.productId.name}
                                                </div>
                                            </td>
                                            <td>{item.selectedSize}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{item.price}</td>
                                            <td>
                                                <Badge bg={getStatusBadgeVariant(selectedOrder.status)}>
                                                    {selectedOrder.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <p>Payment Method: {selectedOrder.paymentMethod}</p>
                                </div>
                                <div className="col-md-6 text-end">
                                    <h5>Total: ₹{selectedOrder.totalAmount}</h5>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default OrderManagement;