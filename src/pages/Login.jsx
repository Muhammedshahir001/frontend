import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import axios from 'axios';
import { setCredentials } from '../store/authSlice';
import { fetchCart } from '../store/cartSlice';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      dispatch(setCredentials(data));
      dispatch(fetchCart());
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Email or Password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const { data } = await axios.post('/api/auth/google', { credential: credentialResponse.credential });
      dispatch(setCredentials(data));
      dispatch(fetchCart());
      toast.success(`Welcome, ${data.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed. Please try again.');
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-bg-container">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 2 }}
          src="/images/auth-bg.png" 
          alt="background" 
          className="auth-bg-image" 
        />
        <div className="auth-overlay" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="auth-shell"
      >
        <div className="auth-panel auth-copy">
          <motion.div variants={itemVariants}>
            <p className="auth-kicker">Heedy Luxury Commerce</p>
            <h1>Welcome back to your premium beauty experience.</h1>
            <p className="auth-subtext">
              Sign in to access your curated collection, track orders, and enjoy a seamless luxury shopping journey.
            </p>
            <div className="auth-copy-chip">
              <span className="flex items-center gap-2">
                <LogIn size={16} /> Secure Authentication
              </span>
            </div>
          </motion.div>
        </div>

        <div className="auth-panel auth-form-panel">
          <motion.div variants={itemVariants}>
            <h2>Sign In</h2>
            <p className="auth-form-subtitle">Enter your credentials to continue.</p>

            {error && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="auth-error">{error}</motion.div>}

            <form onSubmit={handleLogin} className="auth-form">
              <motion.div variants={itemVariants} className="auth-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@luxury.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="auth-input-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </motion.div>

              <motion.button 
                variants={itemVariants} 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="auth-btn-primary" 
                disabled={loading}
              >
                {loading ? 'Authenticating...' : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In <ArrowRight size={20} />
                  </span>
                )}
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="auth-divider"><span>or continue with</span></motion.div>
            
            <motion.div variants={itemVariants} className="auth-google-wrap">
              <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => setError('Google login was cancelled.')}
                theme="outline"
                shape="pill"
                size="large"
                width="100%"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="auth-links">
              <span>New to Heedy?</span> 
              <Link to="/signup">
                <span className="flex items-center justify-center gap-1 inline-flex">
                  Create Account <UserPlus size={16} />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;
