import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  wishlistItems: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.wishlistItems = action.payload;
    },
    toggleWishlistItem: (state, action) => {
      const productId = action.payload;
      const index = state.wishlistItems.indexOf(productId);
      if (index > -1) {
        state.wishlistItems.splice(index, 1);
      } else {
        state.wishlistItems.push(productId);
      }
    }
  },
});

export const { setWishlist, toggleWishlistItem } = wishlistSlice.actions;
export default wishlistSlice.reducer;
