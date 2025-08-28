// features/api/apiSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_SERVER,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    }
  }),
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => '/api/users',
    }),
    getMyBatches: builder.query({
      query: () => '/api/batches/my',
    }),
    // ...other endpoints
  }),
});

export const { useGetMeQuery, useGetMyBatchesQuery } = apiSlice;
