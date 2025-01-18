import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import './otp.css';
// import { loginSuccess } from '../../redux/slices/authSlice';
import { userLoginSuccess as loginSuccess, userLogout as logout } from '../../redux/slices/authSlice';


const OTPVerification = ({ email, onVerificationSuccess, onBackToSignup, userId }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Fixed: Call useDispatch as a function
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // Added missing success state
    const [loading, setLoading] = useState(false);

    // Add countdown timer effect
    useEffect(() => {
        if (timeLeft === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) {
            setOtp(value);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return;

        setLoading(true);
        setError('');

        try {
            console.log('Attempting verification...');
            const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                userId,
                otp
            });

            console.log('Verification response:', response.data);

            if (response.data.token) {
                // Store token in localStorage
                localStorage.setItem('token', response.data.token);
                
                // Dispatch login success action
                dispatch(loginSuccess(response.data.user));
                console.log('Dispatched loginSuccess with user:', response.data.user);

                // Call success callback if provided
                if (onVerificationSuccess) {
                    await onVerificationSuccess(response.data);
                }

                console.log('Auth state updated, attempting navigation...');
                navigate('/', { replace: true });
            } else {
                setError('Verification failed');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError(err.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        setSuccess(''); // Clear previous success message

        try {
            const response = await axios.post('http://localhost:5000/api/auth/resend-otp', {
                email
            });

            if (response.data.success) {
                setTimeLeft(60);
                setOtp('');
                setSuccess('New OTP sent successfully');
            } else {
                setError('Failed to resend OTP');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-verification">
            <h3>Verify Your Email</h3>
            <p className="otp-message">
                We've sent a verification code to <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerify} className="otp-form">
                <input
                    type="text"
                    className="otp-input"
                    value={otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                />

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="timer">
                    {timeLeft > 0 ? (
                        <p>Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
                    ) : (
                        <p className="expired">OTP has expired</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="verify-button"
                    disabled={otp.length !== 6 || loading || timeLeft === 0}
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                {timeLeft === 0 && (
                    <button
                        type="button"
                        className="resend-button"
                        onClick={handleResendOTP}
                        disabled={loading}
                    >
                        Resend OTP
                    </button>
                )}

                <button
                    type="button"
                    className="back-button"
                    onClick={onBackToSignup}
                    disabled={loading}
                >
                    Back to Sign Up
                </button>
            </form>
        </div>
    );
};

export default OTPVerification;