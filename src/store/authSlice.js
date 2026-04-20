import { createSlice } from '@reduxjs/toolkit';

const userInfoFromStorage = localStorage.getItem('userInfo') 
  ? JSON.parse(localStorage.getItem('userInfo')) 
  : null;

const adminInfoFromStorage = localStorage.getItem('adminInfo') 
  ? JSON.parse(localStorage.getItem('adminInfo')) 
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
  adminInfo: adminInfoFromStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
    setAdminCredentials: (state, action) => {
      state.adminInfo = action.payload;
      localStorage.setItem('adminInfo', JSON.stringify(action.payload));
    },
    adminLogout: (state) => {
      state.adminInfo = null;
      localStorage.removeItem('adminInfo');
    },
  },
});

export const { setCredentials, logout, setAdminCredentials, adminLogout } = authSlice.actions;
export default authSlice.reducer;
