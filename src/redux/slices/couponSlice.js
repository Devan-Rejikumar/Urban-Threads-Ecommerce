import { createSlice} from '@reduxjs/toolkit';
import axios from 'axios';


const initialState = {
    coupons : [],
    loading : false,
    error : null,
    currentCoupon : null
};

const couponSlice = createSlice ({
    name : 'coupon',
    initialState,
    reducers : {
        setCoupons : (state, action) => {
            state.coupons = action.payload;
            state.loading = false;
        },
        setLoading : (state) => {
            state.loading = true;
        },
        setError : (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setCurrentCoupon : (state, action) => {
            state.currentCoupon = action.payload;
        }
    }
});

export const { setCoupons, setLoading, setError, setCurrentCoupon} = couponSlice.actions;
export default couponSlice.reducer;