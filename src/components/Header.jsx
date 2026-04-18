import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Search, Menu, X, LogOut } from 'lucide-react';
import { fetchCart } from '../store/cartSlice';
import { logout } from '../store/authSlice';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchCart());
    }
  }, [dispatch, userInfo]);

  const cartCount = cartItems.reduce((acc, item) => acc + Number(item.qty), 0);
  const profileRoute = userInfo ? '/profile' : '/login';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">

        {/* Mobile: Hamburger */}
        <div className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
        </div>

        {/* Logo */}
        <Link to="/" className="brand-logo">
          <img src="/logo/logo.png" alt="HEEDY" className="logo-img" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/products" className="nav-link">Shop</Link>
          {/* <Link to="/about" className="nav-link">Our Universe</Link> */}
          <Link to="/contact-us" className="nav-link">Contact</Link>
        </nav>

        {/* Right: Icons (Bumped Sizes) */}
        <div className="nav-icons">
          <div className={`search-container ${isSearchOpen ? 'active' : ''}`}>
            <AnimatePresence>
              {isSearchOpen && (
                <motion.form 
                  onSubmit={handleSearch}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '200px', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="search-form"
                >
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <div className="icon-wrapper search-wrapper" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              {isSearchOpen ? <X size={22} strokeWidth={2} /> : <Search size={22} strokeWidth={2} />}
              <span className="icon-label">Search</span>
            </div>
          </div>
          
          <Link to={profileRoute} className="icon-wrapper profile-icon">
            <User size={22} strokeWidth={2} />
            <span className="icon-label">Account</span>
          </Link>

          {userInfo && (
            <div className="icon-wrapper logout-icon" onClick={() => {
              dispatch(logout());
              navigate('/login');
            }} title="Logout">
              <LogOut size={22} strokeWidth={2} />
              <span className="icon-label">Sign Out</span>
            </div>
          )}

          <Link to="/cart" className="icon-wrapper cart-icon">
            <ShoppingBag size={22} strokeWidth={2} />
            <span className="icon-label">Bag</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="mobile-overlay"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="mobile-overlay-top">
              <Link to="/" className="mobile-logo" onClick={() => setIsMobileMenuOpen(false)}>
                <img src="/logo/logo.png" alt="HEEDY" className="mobile-logo-img" style={{height: '50px'}} />
              </Link>
              <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={28} />
              </button>
            </div>

            <div className="mobile-nav-content">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mobile-search-form">
                <Search size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <Link to="/products" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
              {/* <Link to="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Our Universe</Link> */}
              <Link to="/contact-us" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            </div>

            <div className="mobile-nav-footer">
              <Link to={profileRoute} className="mobile-nav-link-sm" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
              <Link to="/cart" className="mobile-nav-link-sm" onClick={() => setIsMobileMenuOpen(false)}>Cart ({cartCount})</Link>
              {userInfo && (
                <div className="mobile-nav-link-sm" style={{color: '#ef4444'}} onClick={() => {
                  dispatch(logout());
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}>Sign Out</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;