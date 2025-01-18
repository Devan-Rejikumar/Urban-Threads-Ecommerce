import React, { useEffect, useState } from 'react';

import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminProtectionLayer = ({ children }) => {
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/admin/verify-adminToken',{
                    withCredentials : true,
                });
                if (response.status === 200) {
                    console.log('Token verification successful');
                    setIsVerified(true);
                } else {
                    console.log('Token verification failed');
                    navigate('/admin-login');
                }
            } catch (error) {
                console.log('Token verification error:', error);
                navigate('/admin-login');
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
        return <Navigate to="/admin-login" replace />;
    }

    return children;
};

export default AdminProtectionLayer;
