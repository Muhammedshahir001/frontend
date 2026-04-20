import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setCredentials, adminLogout, setAdminCredentials } from './store/authSlice';
import api from './utils/api';
import Header from './components/Header';
import Footer from './components/Footer';
import GlobalLoader from './components/GlobalLoader';
import FloatingActions from './components/FloatingActions';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo, adminInfo } = useSelector((state) => state.auth);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const isAdminPath = location.pathname.startsWith('/admin');
  const showHeader = !isAdminPath && location.pathname !== '/admin-login';

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check User Auth
      if (userInfo?.token) {
        try {
          const { data } = await api.get('/api/users/profile');
          dispatch(setCredentials({ ...data, token: userInfo.token }));
        } catch (error) {
          console.error('User auth check failed:', error);
          dispatch(logout());
        }
      }

      // 2. Check Admin Auth
      if (adminInfo?.token) {
        try {
          // You might have a specific admin profile check or reuse profile
          const { data } = await api.get('/api/users/profile', {
            headers: { Authorization: `Bearer ${adminInfo.token}` }
          });
          dispatch(setAdminCredentials({ ...data, token: adminInfo.token }));
        } catch (error) {
          console.error('Admin auth check failed:', error);
          dispatch(adminLogout());
        }
      }
      
      setIsAuthChecking(false);
    };

    checkAuth();
  }, [dispatch]); // Only run once on mount

  if (isAuthChecking) {
    return <GlobalLoader />; // Or a simpler loader if preferred
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <GlobalLoader />
      {showHeader && <Header />}
      {!isAdminPath && <FloatingActions />}
      <main style={{ minHeight: '100vh', padding: 0 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
            <Route path="/products" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
            <Route path="/contact-us" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/checkout" element={<ProtectedRoute><PageTransition><Checkout /></PageTransition></ProtectedRoute>} />
            <Route path="/order-success" element={<ProtectedRoute><PageTransition><OrderSuccess /></PageTransition></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
            <Route path="/admin-login" element={<PageTransition><AdminLogin /></PageTransition>} />
            <Route path="/admin" element={<AdminRoute><PageTransition><AdminDashboard /></PageTransition></AdminRoute>} />
            {/* Fallback for unhandled admin routes */}
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdminPath && <Footer />}
    </>
  );
}

export default App;
