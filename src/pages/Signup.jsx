import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Home, MapPin, Globe, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import { GoogleLogin } from '@react-oauth/google';
import { setCredentials } from '../store/authSlice';
import { fetchCart } from '../store/cartSlice';
import toast from 'react-hot-toast';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

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
        staggerChildren: 0.08 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/register', form);
      setOtpSent(true);
      toast.success('Verification code sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/verify-otp', { email: form.email, otp });
      dispatch(setCredentials(data));
      dispatch(fetchCart());
      toast.success(`Welcome to Heedy, ${data.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/resend-otp', { email: form.email });
      toast.success('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const { data } = await api.post('/api/auth/google', { credential: credentialResponse.credential });
      dispatch(setCredentials(data));
      dispatch(fetchCart());
      toast.success(`Welcome to Heedy, ${data.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google signup failed. Please try again.');
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
        className="auth-shell auth-shell-wide"
      >
        <div className="auth-panel auth-copy">
          <motion.div variants={itemVariants}>
            <p className="auth-kicker">Heedy Membership</p>
            <h1>Join the world of refined beauty.</h1>
            <p className="auth-subtext">
              Create an account to unlock exclusive benefits, personalized recommendations, and a faster checkout experience.
            </p>
            <div className="auth-copy-chip">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} /> Premium Account Access
              </span>
            </div>
          </motion.div>
        </div>

        <div className="auth-panel auth-form-panel">
          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.div
                key="signup-form"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <motion.h2 variants={itemVariants}>Create Account</motion.h2>
                <motion.p variants={itemVariants} className="auth-form-subtitle">Join us today for a premium experience.</motion.p>

                {error && <motion.div variants={itemVariants} className="auth-error">{error}</motion.div>}

                <form onSubmit={handleSignup} className="auth-form">
                  <motion.div variants={itemVariants} className="auth-input-group">
                    <label>Full Name</label>
                    <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Enter your full name" required />
                  </motion.div>

                  <motion.div variants={itemVariants} className="auth-grid-two">
                    <div className="auth-input-group">
                      <label>Email Address</label>
                      <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@luxury.com" required />
                    </div>
                    <div className="auth-input-group">
                      <label>Phone Number</label>
                      <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 555 000 0000" required />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="auth-grid-two">
                    <div className="auth-input-group">
                      <label>Password</label>
                      <div className="auth-password-wrapper">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={form.password} 
                          onChange={(e) => updateField('password', e.target.value)} 
                          placeholder="Minimum 6 characters" 
                          minLength={6} 
                          required 
                        />
                        <button 
                          type="button" 
                          className="auth-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div className="auth-input-group">
                      <label>Confirm Password</label>
                      <div className="auth-password-wrapper">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          value={form.confirmPassword} 
                          onChange={(e) => updateField('confirmPassword', e.target.value)} 
                          placeholder="Repeat your password" 
                          required 
                        />
                        <button 
                          type="button" 
                          className="auth-password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="auth-divider"><span>Address (Optional)</span></motion.div>

                  <motion.div variants={itemVariants} className="auth-grid-two">
                    <div className="auth-input-group">
                      <label>Street</label>
                      <input type="text" value={form.street} onChange={(e) => updateField('street', e.target.value)} placeholder="Street address" />
                    </div>
                    <div className="auth-input-group">
                      <label>City</label>
                      <input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="City" />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="auth-grid-three">
                    <div className="auth-input-group">
                      <label>State</label>
                      <input type="text" value={form.state} onChange={(e) => updateField('state', e.target.value)} placeholder="State" />
                    </div>
                    <div className="auth-input-group">
                      <label>Zip Code</label>
                      <input type="text" value={form.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} placeholder="Zip" />
                    </div>
                    <div className="auth-input-group">
                      <label>Country</label>
                      <input type="text" value={form.country} onChange={(e) => updateField('country', e.target.value)} placeholder="Country" />
                    </div>
                  </motion.div>

                  <motion.button 
                    variants={itemVariants} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="auth-btn-primary" 
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (
                      <span className="flex items-center justify-center gap-2">
                        Create Account <ArrowRight size={20} />
                      </span>
                    )}
                  </motion.button>
                </form>

                <motion.div variants={itemVariants} className="auth-divider"><span>or continue with</span></motion.div>
                <motion.div variants={itemVariants} className="auth-google-wrap">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google signup failed.')} theme="outline" shape="pill" size="large" width="100%" />
                </motion.div>

                <motion.div variants={itemVariants} className="auth-links">
                  <span>Already have an account?</span> <Link to="/login">Sign In</Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-form"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col h-full"
              >
                <motion.h2 variants={itemVariants}>Verify Email</motion.h2>
                <motion.p variants={itemVariants} className="auth-form-subtitle">We've sent a 6-digit code to <strong>{form.email}</strong></motion.p>

                {error && <motion.div variants={itemVariants} className="auth-error">{error}</motion.div>}

                <form onSubmit={handleVerifyOTP} className="auth-form">
                  <motion.div variants={itemVariants} className="auth-input-group">
                    <label>Enter OTP Code</label>
                    <input 
                      type="text" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                      placeholder="000000" 
                      minLength={6} 
                      maxLength={6} 
                      className="text-center text-3xl tracking-[12px] font-bold"
                      required 
                      autoFocus
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
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </motion.button>

                  <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 mt-8">
                    <button 
                      type="button" 
                      className="text-sm font-bold text-black hover:opacity-60 transition-opacity"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      Resend Verification Code
                    </button>
                    
                    <button 
                      type="button" 
                      className="text-sm text-gray-500 hover:text-black underline transition-colors"
                      onClick={() => setOtpSent(false)}
                    >
                      Back to Registration
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default Signup;
