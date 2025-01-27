import { createSlice } from '@reduxjs/toolkit';

const checkoutSlice = createSlice({
    name: 'checkout',
    initialState: {
        selectedAddress: null,
        selectedPayment: null,
        couponCode: '',
        discountAmount: 0,
    },
    reducers: {
        setSelectedAddress: (state, action) => {
            state.selectedAddress = action.payload;
        },
        setSelectedPayment: (state, action) => {
            state.selectedPayment = action.payload;
        },
        setCouponData: (state, action) => {
            state.couponCode = action.payload.code;
            state.discountAmount = action.payload.discount;
        },
        clearCheckoutData: (state) => {
            state.selectedAddress = null;
            state.selectedPayment = null;
            state.couponCode = '';
            state.discountAmount = 0;
        }
    }
});

export const { 
    setSelectedAddress, 
    setSelectedPayment, 
    setCouponData, 
    clearCheckoutData 
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
