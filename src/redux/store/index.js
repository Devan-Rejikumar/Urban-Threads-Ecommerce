import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userAuthReducer from '../slices/userAuthSlice';
import adminAuthReducer from '../slices/adminAuthSlice';
import cartSlice from '../slices/cartSlice';
import wishlistReducer from '../slices/whishlistSlice';
import couponReducer from '../slices/couponSlice';
import checkoutReducer from '../slices/checkoutSlice';  // Add this import

const userPersistConfig = {
    key: 'userAuth',
    storage,
    whitelist: ['isAuthenticated', 'user', 'token']
};

const adminPersistConfig = {
    key: 'adminAuth',
    storage,
    whitelist: ['isAuthenticated', 'user', 'token']
};

const cartPersistConfig = {
    key: 'cart',
    storage,
    whitelist: ['items', 'totalAmount', 'discount']
};

const checkoutPersistConfig = {
    key: 'checkout',
    storage,
    whitelist: ['selectedAddress', 'selectedPayment', 'couponCode', 'discountAmount']
};

const persistedUserReducer = persistReducer(userPersistConfig, userAuthReducer);
const persistedAdminReducer = persistReducer(adminPersistConfig, adminAuthReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice);
const persistedCheckoutReducer = persistReducer(checkoutPersistConfig, checkoutReducer);  // Fix this line

export const store = configureStore({
    reducer: {
        userAuth: persistedUserReducer,
        adminAuth: persistedAdminReducer,
        cart: persistedCartReducer,
        wishlist: wishlistReducer,
        coupon: couponReducer,
        checkout: persistedCheckoutReducer,  // And use the persisted version here
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export const persistor = persistStore(store);