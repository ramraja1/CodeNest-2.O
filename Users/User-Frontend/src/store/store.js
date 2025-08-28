import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';  // your apiSlice
import userReducer from './userSlice';  // import reducer as userReducer

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,  // RTK Query API reducer
    user: userReducer,                         // Add user reducer here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
