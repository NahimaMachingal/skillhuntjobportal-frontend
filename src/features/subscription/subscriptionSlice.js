import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/subscription`; // Base URL for your API

// Handle subscription request
export const createSubscription = createAsyncThunk(
  'subscription/create',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const accessToken = state.auth.accessToken; // Get accessToken from Redux store

      console.log("Full auth state:", state.auth);
      console.log("Access token:", accessToken);
      console.log("Token type:", typeof accessToken);

      if (!accessToken) {
        return rejectWithValue("Access token is missing.");
      }

      const response = await axios.post(
        `${API_URL}/create-subscription/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data; // Returns the subscription response data
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      // **CRITICAL FIX**: Return error message string, not object
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Subscription failed';
      return rejectWithValue(error.response?.data || 'Subscription failed');
    }
  }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
  'subscription/verify',
  async (paymentData, { getState, rejectWithValue }) => {
    try {
      const state = getState(); // Access the Redux store
      const accessToken = state.auth.accessToken; // Get accessToken from Redux store

      if (!accessToken) {
        return rejectWithValue("Access token is missing.");
      }
      
      const response = await axios.post(
        `${API_URL}/verify-payment/`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: { order: null, status: null, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.order = action.payload;
        state.status = 'success';
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.status = 'completed';
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
      });
  },
});

export default subscriptionSlice.reducer;
