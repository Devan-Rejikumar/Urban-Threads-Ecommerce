
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthenticated: false,
    user: null,
    error: null,
    loading: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // User authentication actions
        userLoginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        userLoginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
        },
        userLoginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        userLogout: (state) => {
            return initialState;
        },

        // Admin authentication actions
        adminLoginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        adminLoginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = { ...action.payload, role: 'admin' };
            state.error = null;
        },
        adminLoginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        adminLogout: (state) => {
            return initialState;
        }
    }
});

export const {
    userLoginStart,
    userLoginSuccess,
    userLoginFailure,
    userLogout,
    adminLoginStart,
    adminLoginSuccess,
    adminLoginFailure,
    adminLogout
} = authSlice.actions;

export default authSlice.reducer;