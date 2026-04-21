import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchActiveCoupons = createAsyncThunk(
  'coupons/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/coupons/active');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const couponSlice = createSlice({
  name: 'coupons',
  initialState: {
    activeCoupons: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.activeCoupons = action.payload;
      })
      .addCase(fetchActiveCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default couponSlice.reducer;
