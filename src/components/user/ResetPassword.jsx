import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ResetPasswordForm = () => {
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isValidToken, setIsValidToken] = useState(true);
    const { token } = useParams();
    const navigate = useNavigate();
  
    React.useEffect(() => {
      const verifyToken = async () => {
        try {
          await axios.get(`http://localhost:5000/api/auth/reset-password/${token}`);
        } catch (error) {
          setIsValidToken(false);
          setStatus({
            type: 'error',
            message: 'Invalid or expired reset link'
          });
        }
      };
  
      verifyToken();
    }, [token]);
  
    const handleSubmit = async (values, { setSubmitting }) => {
      try {
        await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
          password: values.password,
          confirmPassword: values.confirmPassword
        });
  
        setStatus({
          type: 'success',
          message: 'Password reset successful! Redirecting to login...'
        });
  
        setTimeout(() => navigate('/login'), 2000);
      } catch (error) {
        setStatus({
          type: 'error',
          message: error.response?.data?.message || 'Failed to reset password'
        });
      }
      setSubmitting(false);
    };
  
    if (!isValidToken) {
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger">
                {status.message}
              </div>
            </div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card mt-5">
              <div className="card-header">
                <h3 className="text-center">Reset Password</h3>
              </div>
              <div className="card-body">
                {status.message && (
                  <div className={`alert ${status.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                    {status.message}
                  </div>
                )}
  
                <Formik
                  initialValues={{ password: '', confirmPassword: '' }}
                  validationSchema={Yup.object({
                    password: Yup.string()
                      .min(8, 'Password must be at least 8 characters')
                      .matches(/[0-9]/, 'Password must contain at least one number')
                      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
                      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
                      .matches(/[^\w]/, 'Password must contain at least one symbol')
                      .required('Password is required'),
                    confirmPassword: Yup.string()
                      .oneOf([Yup.ref('password'), null], 'Passwords must match')
                      .required('Confirm password is required')
                  })}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="mb-3">
                        <Field
                          type="password"
                          name="password"
                          placeholder="New Password"
                          className="form-control"
                        />
                        <ErrorMessage 
                          name="password" 
                          component="div" 
                          className="text-danger" 
                        />
                      </div>
  
                      <div className="mb-3">
                        <Field
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm New Password"
                          className="form-control"
                        />
                        <ErrorMessage 
                          name="confirmPassword" 
                          component="div" 
                          className="text-danger" 
                        />
                      </div>
  
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary w-100"
                      >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

  export default ResetPasswordForm;