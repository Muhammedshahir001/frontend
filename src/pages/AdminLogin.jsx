import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../store/authSlice';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo.role === 'admin') {
      navigate('/admin');
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/admin-login', { email, password });
      dispatch(setCredentials(data));
      toast.success('Welcome to Admin Panel');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Admin Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="login-header">
            <div className="shield-icon">
              <ShieldCheck size={40} />
            </div>
            <h1>Heedy Admin</h1>
            <p>Secure Management Portal Access</p>
          </div>

          <form onSubmit={submitHandler} className="admin-login-form">
            <div className="form-group">
              <label>Administrator Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  placeholder="admin@heedy.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Security Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Access Dashboard'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="login-footer">
            <p>© 2026 HEEDY LUXURY COSMETICS</p>
            <div className="security-badge">
              256-bit AES Encrypted Session
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
