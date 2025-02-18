
import axios from 'axios';

export const publicAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: false  // Don't send credentials for public routes
});

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials : true
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || document.cookie.split('token=')[1];
        console.log('Token being sent:', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Request config:', config);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if(error.response?.status === 401){
            const publicRoutes = ['/', '/login', '/register', '/shop', '/category', '/product'];
            const currentPath = window.location.pathname;
            const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
            if(!isPublicRoute){
                localStorage.removeItem('token');
                 window.location.href = '/login'
            }
            
        }
        return Promise.reject(error)
    }
)

export default axiosInstance;