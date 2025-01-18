// // import { loginStart, loginSuccess, loginFailure } from "../redux/slices/authSlice";
// import { 
//     userLoginStart as loginStart,
//     userLoginSuccess as loginSuccess,
//     userLoginFailure as loginFailure 
// } from '../redux/slices/authSlice';

// import axios from "axios";

// export const initializeAuth = async (store) => {
//     store.dispatch(loginStart());
    
//     try {
//         // Set up axios defaults
//         axios.defaults.baseURL = 'http://localhost:5000';
//         axios.defaults.withCredentials = true;  // This is crucial for cookies to be sent
        
//         // Verify auth status - cookies will be automatically sent
//         const response = await axios.get('/api/auth/verify-status');

//         if (response.data.user) {
//             store.dispatch(loginSuccess(response.data.user));
//             return true;
//         }
//     } catch (error) {
//         // console.error('Auth initialization failed:', error);
//         store.dispatch(loginFailure('Session expired'));
//     }
//     return false;
// };

import { 
    userLoginStart,
    userLoginSuccess,
    userLoginFailure,
    adminLoginStart,
    adminLoginSuccess,
    adminLoginFailure 
} from '../redux/slices/authSlice';

import axios from "axios";

export const initializeAuth = async (store) => {
    // Start both auth checks
    store.dispatch(userLoginStart());
    store.dispatch(adminLoginStart());
    
    try {
        // Set up axios defaults
        axios.defaults.baseURL = 'http://localhost:5000';
        axios.defaults.withCredentials = true;
        
        // Verify user auth status
        const userResponse = await axios.get('/api/auth/verify-status');
        if (userResponse.data.user) {
            store.dispatch(userLoginSuccess(userResponse.data.user));
        }

        // Verify admin auth status
        const adminResponse = await axios.get('/api/admin/verify-status');
        if (adminResponse.data.user) {
            store.dispatch(adminLoginSuccess(adminResponse.data.user));
        }

        return true;
    } catch (error) {
        // Handle errors appropriately
        if (error.response?.status === 401) {
            store.dispatch(userLoginFailure('Session expired'));
            store.dispatch(adminLoginFailure('Session expired'));
        } else {
            console.error('Auth initialization failed:', error);
            store.dispatch(userLoginFailure('Authentication failed'));
            store.dispatch(adminLoginFailure('Authentication failed'));
        }
        return false;
    }
};