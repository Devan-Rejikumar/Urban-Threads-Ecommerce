import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthenticated: false,
    user: null,
    error: null,
    token: null,
    loading: false
};

const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = { ...action.payload, role: 'admin' };
            state.error = null;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            return initialState;
        }
    }
});

export const {
    loginStart: adminLoginStart,
    loginSuccess: adminLoginSuccess,
    loginFailure: adminLoginFailure,
    logout: adminLogout
} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
