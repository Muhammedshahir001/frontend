import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async Thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/api/cart');
    return data.items;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (item, { getState, rejectWithValue }) => {
  try {
    const { auth: { userInfo } } = getState();
    if (!userInfo) return item; // Return item for local storage if not logged in

    const { data } = await api.post('/api/cart', {
      productId: item.product,
      quantity: item.qty,
      variant: item.variant
    });
    
    return data.items;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (payload, { getState, rejectWithValue }) => {
  try {
    const { auth: { userInfo } } = getState();
    if (!userInfo) return payload;

    // If payload is an object with itemId (backend ID)
    if (payload.itemId) {
      const { data } = await api.delete(`/api/cart/${payload.itemId}`);
      return data.items;
    }
    
    return payload;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateCartQty = createAsyncThunk('cart/updateCartQty', async (payload, { getState, rejectWithValue }) => {
  try {
    const { auth: { userInfo } } = getState();
    if (!userInfo) return payload;

    const { data } = await api.put('/api/cart', {
      productId: payload.product,
      quantity: payload.qty,
      variant: payload.variant
    });

    return data.items;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { getState, rejectWithValue }) => {
  try {
    const { auth: { userInfo } } = getState();
    if (!userInfo) return;

    await api.delete('/api/cart');
    return [];
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const initialState = {
  cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
  shippingAddress: JSON.parse(localStorage.getItem('shippingAddress')) || {},
  paymentMethod: 'Razorpay',
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCartLocal: (state, action) => {
      const item = action.payload;
      const incomingVariant = (typeof item.variant === 'string' ? item.variant : item.variant?.ml) || 'Standard';
      const existItem = state.cartItems.find(
        (x) =>
          x.product === item.product &&
          (x.variant?.ml || 'Standard') === incomingVariant
      );

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product === item.product &&
          (x.variant?.ml || 'Standard') === incomingVariant
            ? { ...x, ...item, qty: Number(x.qty) + Number(item.qty || 1) }
            : x
        );
      } else {
        state.cartItems.push({ ...item, qty: Number(item.qty || 1) });
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCartLocal: (state, action) => {
      const productId = action.payload?.product || action.payload;
      const variantKey = action.payload?.variantKey || 'Standard';
      
      state.cartItems = state.cartItems.filter(
        (x) =>
          !(
            x.product === productId &&
            (x.variant?.ml || 'Standard') === variantKey
          )
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateCartQtyLocal: (state, action) => {
      const { product, variantKey, qty } = action.payload;
      state.cartItems = state.cartItems.map((item) => {
        const itemVariant = item.variant?.ml || 'Standard';
        if (item.product === product && itemVariant === variantKey) {
          return { ...item, qty: Math.max(1, Number(qty) || 1) };
        }
        return item;
      });
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(state.shippingAddress));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', JSON.stringify(state.paymentMethod));
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.map(item => ({
          product: item.product?._id,
          name: item.product?.name,
          price: item.product?.price,
          category: item.product?.category,
          image: item.product?.images?.[0],
          variant: item.variant,
          qty: item.quantity,
          _id: item._id // backend item ID
        }));
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.cartItems = action.payload.map(item => ({
            product: item.product?._id || item.product,
            name: item.product?.name || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.name,
            price: item.product?.price || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.price,
            category: item.product?.category || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.category,
            image: item.product?.images?.[0] || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.image,
            variant: item.variant,
            qty: item.quantity,
            _id: item._id
          }));
        }
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.cartItems = action.payload.map(item => ({
            product: item.product?._id || item.product,
            name: item.product?.name || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.name,
            price: item.product?.price || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.price,
            category: item.product?.category || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.category,
            image: item.product?.images?.[0] || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.image,
            variant: item.variant,
            qty: item.quantity,
            _id: item._id
          }));
        }
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      })
      .addCase(updateCartQty.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.cartItems = action.payload.map(item => ({
            product: item.product?._id || item.product,
            name: item.product?.name || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.name,
            price: item.product?.price || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.price,
            category: item.product?.category || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.category,
            image: item.product?.images?.[0] || state.cartItems.find(x => x.product === (item.product?._id || item.product))?.image,
            variant: item.variant,
            qty: item.quantity,
            _id: item._id
          }));
        }
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cartItems = [];
        localStorage.removeItem('cartItems');
      });
  }
});

export const {
  addToCartLocal,
  removeFromCartLocal,
  updateCartQtyLocal,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
} = cartSlice.actions;
export default cartSlice.reducer;
