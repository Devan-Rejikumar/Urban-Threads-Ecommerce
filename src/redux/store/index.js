import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userAuthReducer from '../slices/userAuthSlice';
import adminAuthReducer from '../slices/adminAuthSlice';
import cartSlice from '../slices/cartSlice';

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

const persistedUserReducer = persistReducer(userPersistConfig, userAuthReducer);
const persistedAdminReducer = persistReducer(adminPersistConfig, adminAuthReducer);

export const store = configureStore({
    reducer: {
        userAuth: persistedUserReducer,
        adminAuth: persistedAdminReducer,
        cart : cartSlice
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export const persistor = persistStore(store);