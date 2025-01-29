// import React, { Fragment, useEffect, useState } from "react"
// import axiosInstance from "../../../utils/axiosInstance"
// import 'bootstrap/dist/css/bootstrap.min.css'
// import './UserDetails.css'
// import { toast } from "react-toastify"
// import { X, Edit2, User } from 'lucide-react'
// import Header from "../Header"
// import Footer from "../Footer"

// const UserDetails = () => {
//     const [userDetails, setUserDetails] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         email: '',
//         phone: ''
//     })

//     useEffect(() => {
//         const fetchUserDetails = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 if (!token) {
//                     setError('Not authenticated');
//                     return;
//                 }

//                 const response = await axiosInstance.get('/auth/profile', {
//                     headers: {
//                         'Authorization': `Bearer ${token}`
//                     }
//                 });
//                 setUserDetails(response.data);
//                 setFormData({
//                     firstName: response.data.firstName,
//                     lastName: response.data.lastName,
//                     email: response.data.email,
//                     phone: response.data.phone
//                 });
//                 setLoading(false);
//             } catch (error) {
//                 console.error('Error fetching user details:', error);
//                 setError(error.response?.data?.message || 'Failed to fetch user details');
//                 setLoading(false);
//             }
//         };
//         fetchUserDetails();
//     }, []);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }))
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 toast.error('Not authenticated');
//                 return;
//             }

//             const response = await axiosInstance.put('/auth/profile/update', formData, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });

//             if (response.data.user) {
//                 setUserDetails(response.data.user);
//                 setIsModalOpen(false);
//                 toast.success(response.data.message || 'Profile updated successfully');
//             }
//         } catch (error) {
//             console.error('Failed to update user details:', error.response?.data || error);
//             toast.error(error.response?.data?.message || 'Failed to update user details');
//         }
//     }

//     if (loading) return (
//         <div className="d-flex justify-content-center align-items-center min-vh-100">
//             <div className="spinner-border text-primary" role="status">
//                 <span className="visually-hidden">Loading...</span>
//             </div>
//         </div>
//     )

//     if (error) return (
//         <div className="alert alert-danger text-center m-5" role="alert">
//             {error}
//         </div>
//     )

//     return (
//         <Fragment>
//             <Header />
//             <div className="container my-5">
//                 <div className="card shadow p-4 mb-5">
//                     <div className="d-flex justify-content-between align-items-center mb-4">
//                         <h2 className="mb-0 fs-4">User Details</h2>
//                         <button 
//                             className="btn btn-link p-2 rounded-circle hover-purple"
//                             onClick={() => setIsModalOpen(true)}
//                             aria-label="Edit user details"
//                         >
//                             <Edit2 size={18} className="text-primary" />
//                         </button>
//                     </div>
//                     <div className="row g-3">
//                         <div className="col-12 mb-3">
//                             <div className="d-flex align-items-center">
//                                 <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
//                                     <User size={24} className="text-primary" />
//                                 </div>
//                                 <div>
//                                     <h3 className="fs-5 mb-1">{userDetails.firstName} {userDetails.lastName}</h3>
//                                     <p className="text-muted mb-0">{userDetails.email}</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="col-12">
//                             <div className="p-3 rounded bg-opacity-10" style={{ backgroundColor: 'rgba(108, 93, 211, 0.1)' }}>
//                                 <p className="mb-2"><strong>Email : </strong> {userDetails.email}</p>
//                                 <p className="mb-0"><strong>Phone : </strong> {userDetails.phone}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {isModalOpen && (
//                     <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
//                         <div className="modal-dialog modal-dialog-centered">
//                             <div className="modal-content modal-slide-in">
//                                 <div className="modal-header">
//                                     <h5 className="modal-title fs-5">Edit User Details</h5>
//                                     <button 
//                                         type="button" 
//                                         className="btn-close btn-close-white" 
//                                         aria-label="Close" 
//                                         onClick={() => setIsModalOpen(false)}
//                                     >
//                                         <X size={18} />
//                                     </button>
//                                 </div>
//                                 <form onSubmit={handleSubmit}>
//                                     <div className="modal-body">
//                                         <div className="mb-3">
//                                             <label htmlFor="firstName" className="form-label">First Name</label>
//                                             <input
//                                                 id="firstName"
//                                                 type="text"
//                                                 name="firstName"
//                                                 className="form-control"
//                                                 value={formData.firstName}
//                                                 onChange={handleInputChange}
//                                             />
//                                         </div>
//                                         <div className="mb-3">
//                                             <label htmlFor="lastName" className="form-label">Last Name</label>
//                                             <input 
//                                                 id="lastName"
//                                                 type="text"
//                                                 name="lastName"
//                                                 className="form-control"
//                                                 value={formData.lastName}
//                                                 onChange={handleInputChange}
//                                             />
//                                         </div>
//                                         <div className="mb-3">
//                                             <label htmlFor="email" className="form-label">Email</label>
//                                             <input 
//                                                 id="email"
//                                                 type="email"
//                                                 name="email"
//                                                 className="form-control"
//                                                 value={formData.email}
//                                                 onChange={handleInputChange}
//                                             />
//                                         </div>
//                                         <div className="mb-3">
//                                             <label htmlFor="phone" className="form-label">Phone</label>
//                                             <input 
//                                                 id="phone"
//                                                 type="tel"
//                                                 name="phone"
//                                                 className="form-control"
//                                                 value={formData.phone}
//                                                 onChange={handleInputChange}
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="modal-footer">
//                                         <button 
//                                             type="button" 
//                                             className="btn btn-secondary" 
//                                             onClick={() => setIsModalOpen(false)}
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button type="submit" className="btn btn-primary">
//                                             Save Changes
//                                         </button>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <Footer />
//         </Fragment>
//     )
// }

// export default UserDetails


import React, { Fragment, useEffect, useState } from "react"
import axiosInstance from "../../../utils/axiosInstance"
import 'bootstrap/dist/css/bootstrap.min.css'
import './UserDetails.css'
import { X, Edit2, User } from 'lucide-react'
import Header from "../Header"
import Footer from "../Footer"

const Toast = ({ message, type, onClose }) => {
    return (
        <div 
            className={`alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`} 
            style={{ zIndex: 1070 }}
            role="alert"
        >
            {message}
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>
    );
};

const UserDetails = () => {
    const [userDetails, setUserDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    })
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [updateType, setUpdateType] = useState(null);
    const [newValue, setNewValue] = useState('');
    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Not authenticated');
                    return;
                }

                const response = await axiosInstance.get('/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setUserDetails(response.data);
                setFormData({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    phone: response.data.phone
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user details:', error);
                setError(error.response?.data?.message || 'Failed to fetch user details');
                setLoading(false);
            }
        };
        fetchUserDetails();
    }, []);

    const startOtpTimer = () => {
        setTimer(300); // 5 minutes in seconds
        setCanResend(false);

        const interval = setInterval(() => {
            setTimer((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    };

    const handleSendOTP = async (type, value) => {
        try {
            const response = await axiosInstance.post('/auth/send-contact-update-otp', {
                type,
                newValue: value
            });

            if (response.data.success) {
                setUpdateType(type);
                setNewValue(value);
                setShowOtpModal(true);
                startOtpTimer();
                showNotification('OTP sent successfully. Check your email!', 'success');
            }
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to send OTP', 'danger');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await axiosInstance.post('/auth/verify-contact-update-otp', {
                type: updateType,
                otp,
                newValue: formData[updateType]
            });

            if (response.data.success) {
                setShowOtpModal(false);
                setIsModalOpen(false);
                setUserDetails(response.data.user);
                showNotification(`${updateType} updated successfully!`, 'success');
                setOtp('');
                setUpdateType(null);
            }
        } catch (error) {
            console.error('OTP verification error:', error.response?.data);
            showNotification(error.response?.data?.message || 'OTP verification failed', 'danger');
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;
        await handleSendOTP(updateType, newValue);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailChanged = formData.email !== userDetails.email;
        const phoneChanged = formData.phone !== userDetails.phone;

        if (emailChanged) {
            await handleSendOTP('email', formData.email);
            return;
        }

        if (phoneChanged) {
            await handleSendOTP('phone', formData.phone);
            return;
        }

        try {
            const response = await axiosInstance.put('/auth/profile/update', {
                firstName: formData.firstName,
                lastName: formData.lastName
            });

            if (response.data.success) {
                setUserDetails(response.data.user);
                setIsModalOpen(false);
                showNotification('Profile updated successfully', 'success');
            }
        } catch (error) {
            showNotification(error.response?.data?.message || 'Update failed', 'danger');
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )

    if (error) return (
        <div className="alert alert-danger text-center m-5" role="alert">
            {error}
        </div>
    )

    return (
        <Fragment>
            <Header />
            {toast.show && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}
            <div className="container my-5">
                <div className="card shadow p-4 mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0 fs-4">User Details</h2>
                        <button
                            className="btn btn-link p-2 rounded-circle hover-purple"
                            onClick={() => setIsModalOpen(true)}
                            aria-label="Edit user details"
                        >
                            <Edit2 size={18} className="text-primary" />
                        </button>
                    </div>
                    <div className="row g-3">
                        <div className="col-12 mb-3">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                    <User size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="fs-5 mb-1">{userDetails.firstName} {userDetails.lastName}</h3>
                                    <p className="text-muted mb-0">{userDetails.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="p-3 rounded bg-opacity-10" style={{ backgroundColor: 'rgba(108, 93, 211, 0.1)' }}>
                                <p className="mb-2"><strong>Email : </strong> {userDetails.email}</p>
                                <p className="mb-0"><strong>Phone : </strong> {userDetails.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content modal-slide-in">
                                <div className="modal-header">
                                    <h5 className="modal-title fs-5">Edit User Details</h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        aria-label="Close"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="firstName" className="form-label">First Name</label>
                                            <input
                                                id="firstName"
                                                type="text"
                                                name="firstName"
                                                className="form-control"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="lastName" className="form-label">Last Name</label>
                                            <input
                                                id="lastName"
                                                type="text"
                                                name="lastName"
                                                className="form-control"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">Email</label>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="phone" className="form-label">Phone</label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                name="phone"
                                                className="form-control"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {showOtpModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Verify OTP</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowOtpModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <p>Please enter the OTP sent to your {updateType}</p>
                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength="6"
                                    />
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            {timer > 0 ? (
                                                `Time remaining: ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`
                                            ) : (
                                                'OTP expired'
                                            )}
                                        </small>
                                        <button
                                            className="btn btn-link p-0"
                                            onClick={handleResendOTP}
                                            disabled={!canResend}
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowOtpModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleVerifyOtp}
                                        disabled={otp.length !== 6}
                                    >
                                        Verify OTP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </Fragment>
    )
}

export default UserDetails

