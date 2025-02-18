import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';

const PasswordResetOTPVerification = ({ email, onOTPVerified, onBack }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify-reset-otp', {
                email,
                otp
            });
            
            if (response.status === 200) {
                toast.success('OTP verified successfully!');
                onOTPVerified(otp);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/resend-reset-otp', {
                email
            });
            
            if (response.status === 200) {
                setTimer(30);
                setCanResend(false);
                toast.success('New OTP sent successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="otp-verification">
            <h3>Verify OTP</h3>
            <p>Please enter the OTP sent to {email}</p>
            
            <form onSubmit={handleOtpSubmit}>
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    maxLength={6}
                    className="otp-input"
                />
                
                <div className="form-buttons">
                    <button type="button" onClick={onBack} className="back-button">
                        Back
                    </button>
                    <button type="submit" disabled={loading} className="verify-button">
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </div>
            </form>

            <div className="resend-section">
                {timer > 0 ? (
                    <p>Resend OTP in {timer} seconds</p>
                ) : (
                    <button 
                        onClick={handleResendOTP} 
                        disabled={!canResend}
                        className="resend-button"
                    >
                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    );
};

const NewPasswordForm = ({ email, verifiedOTP, onSuccess, onBack }) => {
    return (
        <Formik
            initialValues={{
                newPassword: '',
                confirmPassword: ''
            }}
            validationSchema={Yup.object().shape({
                newPassword: Yup.string()
                    .min(8, 'Password must be at least 8 characters')
                    .matches(/[0-9]/, 'Password must contain at least one number')
                    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
                    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
                    .matches(/[^\w]/, 'Password must contain at least one symbol')
                    .required('Password is required'),
                confirmPassword: Yup.string()
                    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                    .required('Please confirm your password')
            })}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
                        email,
                        otp: verifiedOTP,
                        newPassword: values.newPassword
                    });

                    if (response.status === 200) {
                        toast.success('Password reset successful!');
                        onSuccess();
                    }
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to reset password');
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ isSubmitting }) => (
                <Form className="password-reset-form">
                    <div className="form-group">
                        <Field
                            type="password"
                            name="newPassword"
                            placeholder="New Password"
                            className="password-input"
                        />
                        <ErrorMessage name="newPassword" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                        <Field
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            className="password-input"
                        />
                        <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                    </div>

                    <div className="form-buttons">
                        <button type="button" onClick={onBack} className="back-button">
                            Back
                        </button>
                        <button type="submit" disabled={isSubmitting} className="submit-button">
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export { PasswordResetOTPVerification, NewPasswordForm };