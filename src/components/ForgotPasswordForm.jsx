import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPasswordForm = ({ onBack, setShowOtpForm, setResetEmail }) => {
    return (
        <Formik
            initialValues={{
                email: ''
            }}
            validationSchema={Yup.object().shape({
                email: Yup.string()
                    .email('Invalid email')
                    .required('Email is required')
            })}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
                        email: values.email
                    });

                    if (response.status === 200) {
                        toast.success('OTP sent to your email!');
                        setResetEmail(values.email);
                        setShowOtpForm(true);
                    }
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to process request');
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ isSubmitting }) => (
                <Form className="login-form">
                    <div className="form-group">
                        <Field
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            disabled={isSubmitting}
                        />
                        <ErrorMessage name="email" component="div" className="error-message" />
                    </div>

                    <div className="form-buttons">
                        <button
                            type="button"
                            className="back-button"
                            onClick={onBack}
                            disabled={isSubmitting}
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="login-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : 'Send OTP'}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default ForgotPasswordForm;