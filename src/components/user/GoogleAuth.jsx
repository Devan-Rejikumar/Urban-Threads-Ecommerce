import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { loginSuccess } from '../../redux/slices/authSlice';
import { userLoginSuccess as loginSuccess, userLogout as logout } from '../../redux/slices/authSlice';


const GoogleCallback = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleCallback = () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            const userStr = params.get('user');

            if (token && userStr) {
                try {
                    const user = JSON.parse(decodeURIComponent(userStr));
                    
                    // Store token and user data
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // Update axios default headers
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    // Update Redux state
                    dispatch(loginSuccess(user));
                    
                    // Redirect to home page
                    navigate('/');
                } catch (error) {
                    console.error('Error processing Google callback:', error);
                    navigate('/login?error=callback_failed');
                }
            } else {
                navigate('/login?error=no_token');
            }
        };

        handleCallback();
    }, [dispatch, navigate]);

    return <div>Processing login...</div>;
};

export default GoogleCallback;