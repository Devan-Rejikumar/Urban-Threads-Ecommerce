import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    error: null,
    loading: false
};

const userAuthSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user || action.payload;
            state.token = action.payload.token;
            state.error = null;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
        },
        logout: (state) => {
            return initialState;
        },
        blockUser: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = 'User is blocked';
        }
    }
}); 

export const {
    loginStart: userLoginStart,
    loginSuccess: userLoginSuccess,
    loginFailure: userLoginFailure,
    logout: userLogout,
    blockUser: userBlock
} = userAuthSlice.actions;

export default userAuthSlice.reducer;