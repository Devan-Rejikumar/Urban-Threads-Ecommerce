import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';

// Forgot Password Component
const ForgotPasswordForm = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: values.email
      });
      
      setStatus({
        type: 'success',
        message: 'Reset link has been sent to your email!'
      });
      
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send reset link'
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5">
            <div className="card-header">
              <h3 className="text-center">Forgot Password</h3>
            </div>
            <div className="card-body">
              {status.message && (
                <div className={`alert ${status.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                  {status.message}
                </div>
              )}

              <Formik
                initialValues={{ email: '' }}
                validationSchema={Yup.object({
                  email: Yup.string().email('Invalid email').required('Email is required')
                })}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="mb-3">
                      <Field
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="form-control"
                      />
                      <ErrorMessage 
                        name="email" 
                        component="div" 
                        className="text-danger" 
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary w-100"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
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

export default ForgotPasswordForm;