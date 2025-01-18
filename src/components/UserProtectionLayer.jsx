import React, { useEffect, useState } from 'react';
import axiosInstances from '../utils/axiosInstance';
import { Navigate, useNavigate } from 'react-router-dom';

const UserProtectionLayer = ({ children }) => {
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await axiosInstances.get('/api/auth/verify-token');
                if (response.status === 200) {
                    console.log('Token verification successful');
                    setIsVerified(true);
                } else {
                    console.log('Token verification failed');
                    navigate('/login');
                }
            } catch (error) {
                console.log('Token verification error:', error);
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
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default UserProtectionLayer;
