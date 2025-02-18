import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { ORDER_STATUS_UPDATED, orderEventEmitter } from '../../utils/orderEvents.js';
import {Breadcrumb} from 'react-bootstrap';


const adminAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

const POLLING_INTERVAL = 30000;

const getStatusColor = (status) => {
    const statusColors = {
        delivered: 'success',
        shipped: 'info',
        processing: 'warning',
        pending: 'secondary',
        cancelled: 'danger',
        returned: 'primary'
    };
    return statusColors[status?.toLowerCase()] || 'light';
};



const SalesReport = () => {
    const [reportType, setReportType] = useState('today');
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [maxDate, setMaxDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    useEffect(() => {
        const updateMaxDate = () => {
            const today = new Date();
            setMaxDate(today.toISOString().split('T')[0]);
        };


        updateMaxDate();


        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const timeUntilMidnight = tomorrow - now;

        const midnightTimer = setTimeout(() => {
            updateMaxDate();

            setInterval(updateMaxDate, 24 * 60 * 60 * 1000);
        }, timeUntilMidnight);

        return () => {
            clearTimeout(midnightTimer);
        };
    }, []);

    const handleCustomDateChange = (type, value) => {
        setCustomRange(true);
        if (type === 'start') {
            setStartDate(value);

            if (endDate < value) {
                setEndDate(value);
            }

            if (value >= startDate) {
                setEndDate(value);
            }
        }
    };


    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customRange, setCustomRange] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [pollingInterval, setPollingInterval] = useState(null);

    const predefinedRanges = {
        allOrders: {
            label: 'All Orders',
            getRange: () => {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const pastDate = new Date(2020, 0, 1);
                pastDate.setHours(0, 0, 0, 0);
                return {
                    start: pastDate.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0]
                };
            }
        },
        today: {
            label: 'Today',
            getRange: () => {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const startOfDay = new Date(today);
                startOfDay.setHours(0, 0, 0, 0);
                return {
                    start: startOfDay.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0]
                };
            }
        },
        yesterday: {
            label: 'Yesterday',
            getRange: () => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(23, 59, 59, 999);
                const startOfYesterday = new Date(yesterday);
                startOfYesterday.setHours(0, 0, 0, 0);
                return {
                    start: startOfYesterday.toISOString().split('T')[0],
                    end: yesterday.toISOString().split('T')[0]
                };
            }
        },
        lastWeek: {
            label: 'Last 7 Days',
            getRange: () => {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                lastWeek.setHours(0, 0, 0, 0);
                return {
                    start: lastWeek.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0]
                };
            }
        },
        lastMonth: {
            label: 'Last 30 Days',
            getRange: () => {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const lastMonth = new Date(today);
                lastMonth.setDate(lastMonth.getDate() - 30);
                lastMonth.setHours(0, 0, 0, 0);
                return {
                    start: lastMonth.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0]
                };
            }
        },
        thisMonth: {
            label: 'This Month',
            getRange: () => {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                firstDay.setHours(0, 0, 0, 0);
                return {
                    start: firstDay.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0]
                };
            }
        }
    };


    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            generateReport();
        }
    };

    useEffect(() => {
        if (!customRange) {
            const range = predefinedRanges[reportType]?.getRange() || predefinedRanges.today.getRange();
            setStartDate(range.start);
            setEndDate(range.end);
        }
    }, [reportType, customRange]);

    const generateReport = useCallback(async () => {
        if (!startDate || !endDate) {
            setError('Please select a date range.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await adminAxios.get(`/admin/reports/sales-report`, {
                params: {
                    startDate,
                    endDate,
                    page: currentPage,
                    limit: itemsPerPage
                }
            });
            if (response.data.success) {
                setReport(response.data.report);
                setTotalItems(response.data.total || 0);
            } else {
                setError(response.data.message || 'Failed to generate report');
            }
        } catch (error) {
            setError('Error generating report. Please try again.');
            console.error('Error generating report:', error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, currentPage, itemsPerPage]);


    useEffect(() => {
        if (startDate && endDate) {
            generateReport();
            const interval = setInterval(generateReport, POLLING_INTERVAL);
            setPollingInterval(interval);

            const cleanup = orderEventEmitter.on(ORDER_STATUS_UPDATED, () => {
                generateReport();
            });

            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                if (interval) clearInterval(interval);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                cleanup();
            };
        }
    }, [startDate, endDate, generateReport]);


    const handleDateRangeSelect = (type) => {
        setCustomRange(false);
        setReportType(type);
    };




    const downloadReport = async (format) => {
        try {
            setLoading(true);
            
            const response = await adminAxios.get(`/admin/reports/download-report/${format === 'pdf' ? 'pdf' : 'xlsx'}`, {
                params: {
                    startDate,
                    endDate
                },
                responseType: 'blob'
            });
    
            if (response.data.size === 0) {
                throw new Error('Empty report received');
            }
    
        
            const blob = new Blob([response.data], {
                type: format === 'xlsx' 
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'application/pdf'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales-report-${startDate}-to-${endDate}.${format}`);
            
          
            document.body.appendChild(link);
            link.click();
            
      
            window.URL.revokeObjectURL(url);
            link.remove();
        } catch (error) {
            console.error('Download error:', error);
            setError(`Error downloading ${format.toUpperCase()} report. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumb className="mt-3 text-black">
                <Breadcrumb.Item  href="/admin-dashboard">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item active>Sales Report</Breadcrumb.Item>
            </Breadcrumb>
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row align-items-end mb-4">
                        <div className="col-md-6">
                            <div className="dropdown">
                                <button
                                    className="btn btn-light border d-flex align-items-center justify-content-between w-100"
                                    type="button"
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    <span>
                                        {predefinedRanges[reportType]?.label || 'Select Date Range'}
                                        {customRange && ' (Custom)'}
                                    </span>
                                    <i className="fas fa-chevron-down ms-2"></i>
                                </button>
                                <div className={`dropdown-menu w-100 p-3 ${isFilterOpen ? 'show' : ''}`}>
                                    <h6 className="dropdown-header">Preset Ranges</h6>
                                    {Object.entries(predefinedRanges).map(([key, range]) => (
                                        <button
                                            key={key}
                                            className={`dropdown-item d-flex align-items-center ${reportType === key ? 'active' : ''}`}
                                            onClick={() => {
                                                handleDateRangeSelect(key);
                                                setIsFilterOpen(false);
                                            }}
                                        >
                                            <span className="me-2">
                                                {reportType === key && <i className="fas fa-check text-success"></i>}
                                            </span>
                                            {range.label}
                                        </button>
                                    ))}
                                    <div className="dropdown-divider"></div>
                                    <h6 className="dropdown-header">Custom Range</h6>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className="form-label small">Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={startDate}
                                                max={maxDate}
                                                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={endDate}
                                                min={startDate}
                                                max={maxDate}
                                                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mt-3 mt-md-0">
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-primary flex-grow-1"
                                    onClick={generateReport}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Generating...
                                        </span>
                                    ) : (
                                        'Generate Report'
                                    )}
                                </button>
                                <div className="btn-group">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => downloadReport('xlsx')}
                                        title="Download Excel"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                        ) : (
                                            <FaFileExcel />
                                        )}
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => downloadReport('pdf')}
                                        title="Download PDF"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                        ) : (
                                            <FaFilePdf />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center my-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    ) : report ? (
                        report.totalOrders > 0 ? (
                            <div className="report-content">
                                <div className="row mb-4 g-3">
                                    {/* Orders Card */}
                                    <div className="col-md-4 col-lg">
                                        <div className="card h-100 bg-primary bg-opacity-10 border-primary">
                                            <div className="card-body">
                                                <h5 className="card-title text-primary">Total Orders</h5>
                                                <h3 className="card-text mb-0">{report.totalOrders}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4 col-lg">
                                        <div className="card h-100 bg-warning bg-opacity-10 border-warning">
                                            <div className="card-body">
                                                <h5 className="card-title text-warning">Total Items Sold</h5>
                                                <h3 className="card-text mb-0">{(report.totalSales || 0).toLocaleString()}</h3>
                                                <p className="text-muted small mb-0">Excluding cancelled/returned</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Discount Card */}
                                    <div className="col-md-4 col-lg">
                                        <div className="card h-100 bg-danger bg-opacity-10 border-danger">
                                            <div className="card-body">
                                                <h5 className="card-title text-danger">Total Discount</h5>

                                                <h3 className="card-text mb-0">₹{(report.totalDiscount || 0).toLocaleString()}</h3>
                                                <p className="text-muted small mb-0">
                                                    {((report.totalDiscount / report.totalOriginalAmount) * 100).toFixed(1)}% of total
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Revenue Card */}
                                    <div className="col-md-4 col-lg">
                                        <div className="card h-100 bg-info bg-opacity-10 border-info">
                                            <div className="card-body">
                                                <h5 className="card-title text-info">Total Revenue</h5>
                                                <h3 className="card-text mb-0">₹{(report.totalRevenue || 0).toLocaleString()}</h3>
                                                <p className="text-muted small mb-0">After discounts & cancellations</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-striped table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="text-center">Order ID</th>
                                                        <th className="text-center">Date</th>
                                                        <th className="text-end">Original Amount</th>
                                                        <th className="text-end">Discount</th>
                                                        <th className="text-end">Revenue</th>
                                                        <th className="text-center">Payment Method</th>
                                                        <th className="text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.orders
                                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                        .map(order => (
                                                            <tr key={order.orderId}>
                                                                <td className="text-center">{order.orderId}</td>
                                                                <td className="text-center">{new Date(order.date).toLocaleDateString()}</td>
                                                                <td className="text-end">₹{(order.originalAmount || 0).toLocaleString()}</td>
                                                                <td className="text-end">₹{(order.totalDiscount || 0).toLocaleString()}</td>
                                                                <td className="text-end">₹{(order.revenue || 0).toLocaleString()}</td>
                                                                <td className="text-center">{order.paymentMethod}</td>
                                                                <td className="text-center">
                                                                    {console.log(order.status)}
                                                                    <span className={`badge bg-${getStatusColor(order.status)}`}>
                                                                        {order.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                                <tfoot className="table-light">
                                                    <tr>
                                                        <td colSpan="2" className="text-center"><strong>Total</strong></td>
                                                        <td className="text-end"><strong>₹{(report.totalOriginalAmount || 0).toLocaleString()}</strong></td>
                                                        <td className="text-end"><strong>₹{(report.totalDiscount || 0).toLocaleString()}</strong></td>
                                                        <td className="text-end"><strong>₹{(report.totalRevenue || 0).toLocaleString()}</strong></td>
                                                        <td colSpan="2"></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <div className="text-muted">
                                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                                    </div>
                                    <nav aria-label="Page navigation">
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            {[...Array(Math.ceil(totalItems / itemsPerPage))].map((_, index) => (
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
                                            <li className={`page-item ${currentPage === Math.ceil(totalItems / itemsPerPage) ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                                                    disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        ) : (
                            <div className="alert alert-info" role="alert">
                                No orders found for the selected date range.
                            </div>
                        )
                    ) : (
                        <div className="text-center text-muted my-5">
                            <p>Select a date range and generate report to view sales data.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesReport;

