import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaUsers, FaShoppingBag, FaMoneyBillWave,
    FaBoxOpen, FaListAlt
} from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [timeFilter, setTimeFilter] = useState('30days');
    const [chartFilter, setChartFilter] = useState('revenue'); 
    const [stats, setStats] = useState({
        basicStats: {
            totalUsers: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalProducts: 0,
            totalCategories: 0
        },
        revenueData: {},
        recentOrders: [],
        topProducts: [],
        topCategories: [],
        recentUsers: [],
        timeRange: {
            start: null,
            end: null,
            filter: '30days'
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching dashboard stats...');
            const response = await axios.get(`http://localhost:5000/api/admin/dashboard/stats?timeFilter=${timeFilter}`, {
                withCredentials: true
            });
            
            if (response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('Authentication failed, redirecting to login...');
                localStorage.removeItem('adminData');
                navigate('/admin-login');
            } else {
                setError(error.response?.data?.message || error.message || 'Failed to fetch dashboard statistics');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
        const interval = setInterval(fetchDashboardStats, 300000);
        return () => clearInterval(interval);
    }, [timeFilter]);

    if (loading) return <div className="loading">Loading dashboard data...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    const getChartData = () => {
        let labels = [];
        let data = [];
        let backgroundColor = [];
        let title = '';

        const generateColors = (count) => {
            const colors = [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
            ];
            return colors.slice(0, count);
        };

        switch(chartFilter) {
            case 'revenue':
                labels = Object.keys(stats.revenueData);
                data = Object.values(stats.revenueData);
                backgroundColor = generateColors(labels.length);
                title = 'Revenue Distribution';
                break;
            case 'products':
                labels = stats.topProducts.map(p => p.name);
                data = stats.topProducts.map(p => p.totalSales); // Changed to show sales
                backgroundColor = generateColors(10);
                title = 'Top 10 Products by Sales';
                break;
            case 'categories':
                labels = stats.topCategories.map(c => c.name);
                data = stats.topCategories.map(c => c.totalSales); // Changed to show sales
                backgroundColor = generateColors(10);
                title = 'Top 10 Categories by Sales';
                break;
            default:
                break;
        }

     
    return {
        labels,
        datasets: [{
            data,
            backgroundColor,
            borderWidth: 1
        }]
    };
};

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'right',
        },
        title: {
            display: true,
            text: `${chartFilter === 'revenue' ? 'Revenue Distribution' : 
                   chartFilter === 'products' ? 'Top 10 Products by Sales' :
                   'Top 10 Categories by Sales'} (${
                       timeFilter === '7days' ? 'Last 7 Days' :
                       timeFilter === '30days' ? 'Last 30 Days' :
                       timeFilter === '90days' ? 'Last 90 Days' :
                       timeFilter === 'all' ? 'All Time' :
                       'Last Year'
                   })`
        },
        tooltip: {
            callbacks: {
                label: (context) => {
                    const value = context.raw;
                    return chartFilter === 'revenue' 
                        ? `₹${value.toLocaleString()}`
                        : `${value.toLocaleString()} units`;
                }
            }
        }
    }
};

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="filters">
                    <select 
                        value={timeFilter} 
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <select 
                        value={chartFilter} 
                        onChange={(e) => setChartFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="revenue">Revenue Distribution</option>
                        <option value="products">Top Products</option>
                        <option value="categories">Top Categories</option>
                    </select>
                </div>
            </div>
            
            {/* Basic Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <FaUsers className="stat-icon" />
                    <div className="stat-info">
                        <h3>Total Users</h3>
                        <p>{stats.basicStats.totalUsers}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <FaShoppingBag className="stat-icon" />
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <p>{stats.basicStats.totalOrders}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <FaMoneyBillWave className="stat-icon" />
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <p>₹{stats.basicStats.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <FaBoxOpen className="stat-icon" />
                    <div className="stat-info">
                        <h3>Total Products</h3>
                        <p>{stats.basicStats.totalProducts}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <FaListAlt className="stat-icon" />
                    <div className="stat-info">
                        <h3>Categories</h3>
                        <p>{stats.basicStats.totalCategories}</p>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="chart-container">
                <div className="chart-wrapper">
                    <Pie data={getChartData()} options={chartOptions} />
                </div>
            </div>

            {/* Top Products and Categories */}
            <div className="data-section">
                <div className="split-section">
                    <div className="section-half">
                        <h2>Top 10 Products</h2>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Sales (Units)</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topProducts.map((product, index) => (
                                        <tr key={product._id}>
                                            <td>
                                                <span className="rank-badge">{index + 1}</span>
                                                {product.name}
                                            </td>
                                            <td>{product.totalSales}</td>
                                            <td>₹{product.totalRevenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="section-half">
                        <h2>Top 10 Categories</h2>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Sales (Units)</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topCategories.map((category, index) => (
                                        <tr key={category._id}>
                                            <td>
                                                <span className="rank-badge">{index + 1}</span>
                                                {category.name}
                                            </td>
                                            <td>{category.totalSales}</td>
                                            <td>₹{category.totalRevenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="data-section">
                <h2>Recent Orders</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map(order => (
                                <tr key={order.orderId}>
                                    <td>{order.orderId}</td>
                                    <td>{order.customerName}</td>
                                    <td>₹{order.totalAmount.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{new Date(order.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

         
            <div className="data-section">
                <h2>Recent Users</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentUsers.map(user => (
                                <tr key={user._id}>
                                    <td>{`${user.firstName} ${user.lastName}`}</td>
                                    <td>{user.email}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
