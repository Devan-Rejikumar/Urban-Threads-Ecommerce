import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../../utils/axiosInstance';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [showRequirements, setShowRequirements] = useState(false);

    const validationSchema = Yup.object().shape({
        currentPassword: Yup.string()
            .required('Current password is required'),
        newPassword: Yup.string()
            .min(8, 'Password must be at least 8 characters')
            .matches(/[0-9]/, 'Must contain at least one number')
            .matches(/[a-z]/, 'Must contain at least one lowercase letter')
            .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
            .matches(/[!@#$%^&*]/, 'Must contain at least one special character')
            .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password')
            .required('New password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword')], 'Passwords must match')
            .required('Please confirm your password')
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const response = await axiosInstance.put('/auth/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });

            console.log('Password update response:', response); // For debugging

            toast.success('Password updated successfully', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            resetForm();

            // Redirect after successful password change
            setTimeout(() => {
                navigate('/');
            }, 2500);

        } catch (err) {
            console.error('Password update error:', err); // For debugging
            
            toast.error(err.response?.data?.message || 'Failed to update password', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mt-5">
            <ToastContainer />
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title mb-4">Change Password</h3>

                            <Formik
                                initialValues={{
                                    currentPassword: '',
                                    newPassword: '',
                                    confirmPassword: ''
                                }}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ errors, touched, values, isSubmitting }) => (
                                    <Form>
                                        <div className="mb-3">
                                            <Field
                                                type="password"
                                                name="currentPassword"
                                                placeholder="Current Password"
                                                className={`form-control ${errors.currentPassword && touched.currentPassword ? 'is-invalid' : ''}`}
                                            />
                                            {errors.currentPassword && touched.currentPassword && (
                                                <div className="invalid-feedback">{errors.currentPassword}</div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <Field
                                                type="password"
                                                name="newPassword"
                                                placeholder="New Password"
                                                className={`form-control ${errors.newPassword && touched.newPassword ? 'is-invalid' : ''}`}
                                                onFocus={() => setShowRequirements(true)}
                                                onBlur={(e) => {
                                                    if (!e.target.value) {
                                                        setShowRequirements(false);
                                                    }
                                                }}
                                            />
                                            {errors.newPassword && touched.newPassword && (
                                                <div className="invalid-feedback">{errors.newPassword}</div>
                                            )}
                                            {showRequirements && (
                                                <div className="mt-2 small text-muted">
                                                    Password must contain:
                                                    <ul className="mb-0">
                                                        <li className={values.newPassword.length >= 8 ? 'text-success' : 'text-danger'}>
                                                            At least 8 characters
                                                        </li>
                                                        <li className={/[0-9]/.test(values.newPassword) ? 'text-success' : 'text-danger'}>
                                                            At least one number
                                                        </li>
                                                        <li className={/[a-z]/.test(values.newPassword) ? 'text-success' : 'text-danger'}>
                                                            At least one lowercase letter
                                                        </li>
                                                        <li className={/[A-Z]/.test(values.newPassword) ? 'text-success' : 'text-danger'}>
                                                            At least one uppercase letter
                                                        </li>
                                                        <li className={/[!@#$%^&*]/.test(values.newPassword) ? 'text-success' : 'text-danger'}>
                                                            At least one special character
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <Field
                                                type="password"
                                                name="confirmPassword"
                                                placeholder="Confirm Password"
                                                className={`form-control ${errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                                            />
                                            {errors.confirmPassword && touched.confirmPassword && (
                                                <div className="invalid-feedback">{errors.confirmPassword}</div>
                                            )}
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => navigate(-1)}
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;