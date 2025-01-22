import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],
    },
    reducers: {
        setWishlist: (state, action) => {
            console.log('Previous state:', state.items);
            console.log('Setting wishlist:', action.payload);
            state.items = action.payload || [];
            console.log('New state:', state.items);
        },
        addToWishlist: (state, action) => {
            console.log('Adding to wishlist:', action.payload);
            const existingItem = state.items.find(item => item._id === action.payload._id);
            if (!existingItem) {
                state.items.push(action.payload);
            }
        },
        removeFromWishlist: (state, action) => {
            state.items = state.items.filter(item => item._id !== action.payload);
        },
        clearWishlist: (state) => {
            state.items = [];
        },
    },
});

export const { setWishlist, addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;