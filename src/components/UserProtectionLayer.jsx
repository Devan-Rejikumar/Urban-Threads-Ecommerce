import React, { useEffect, useState } from 'react';
import axiosInstances from '../utils/axiosInstance';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const UserProtectionLayer = ({ children }) => {
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login', {state : {from : location.pathname}});
                    return;
                }
                const response = await axiosInstances.get('/auth/verify-token-status');
                
                if (response.status === 200) {
                    setIsVerified(true);
                } else {
                    localStorage.clear();
                    navigate('/login');
                }
            } catch (error) {
                // Handle blocked status specifically
                if (error.response?.status === 403) {
                    localStorage.clear();
                    navigate('/login', { 
                        state: { 
                            message: 'Your account has been blocked. Please contact support.' 
                        }
                    });
                    return;
                }
                
                localStorage.clear();
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; 
    }
    if (!isVerified) {
        return null; 
    }

    return children;
};

export default UserProtectionLayer;