import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { logout, setCredentials } from '../store/authSlice';
import { 
  LogOut, MapPin, Package, Settings, PackageCheck, 
  Truck, RotateCcw, User, ChevronRight
} from 'lucide-react';
import './Profile.css';

const IndianRupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

const Profile = () => {
  const { userInfo } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', zipCode: '', country: ''
  });
  const [editingAddress, setEditingAddress] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/api/users/profile');
        // Ensure token is preserved even if backend doesn't send it back
        dispatch(setCredentials({ ...data, token: userInfo.token }));
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const { data } = await api.get('/api/orders/myorders');
        console.log("Fetched Orders Data:", data); // Intended for the user to verify DB payload

        // Safety check in case it's paginated or nested { orders: [...] }
        const parsedOrders = Array.isArray(data) ? data : (data.orders || []);
        setOrders(parsedOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (userInfo?.token) {
      fetchProfile();
      fetchOrders();
    }
  }, [userInfo?.token, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/users/address', newAddress);
      dispatch(setCredentials(data));
      setIsModalOpen(false);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
      toast.success('Address saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to sync address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/api/users/address/${editingAddress._id}`, newAddress);
      dispatch(setCredentials(data));
      setIsEditModalOpen(false);
      setEditingAddress(null);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
      toast.success('Address updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;
    try {
      const { data } = await api.delete(`/api/users/address/${addressId}`);
      dispatch(setCredentials(data));
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to remove address');
    }
  };

  const openEditModal = (addr) => {
    setEditingAddress(addr);
    setNewAddress({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country
    });
    setIsEditModalOpen(true);
  };

  // const mockOrders = [
  //   { _id: 'HEEDY-9821', date: '2026-04-12', total: 154.00, status: 'Shipped', items: 2 },
  //   { _id: 'HEEDY-8742', date: '2026-03-22', total: 89.50, status: 'Delivered', items: 1 },
  //   { _id: 'HEEDY-7631', date: '2026-02-15', total: 210.00, status: 'Delivered', items: 4 }
  // ];

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shipped': return <span className="status-badge badge-shipped"><Truck size={14} /> Shipped</span>;
      case 'Delivered': return <span className="status-badge badge-delivered"><PackageCheck size={14} /> Delivered</span>;
      case 'Returned': return <span className="status-badge badge-returned"><RotateCcw size={14} /> Returned</span>;
      default: return <span className="status-badge"><Package size={14} /> Processing</span>;
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <User size={20} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={20} /> },
  ];

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* Modern Sidebar */}
        <aside className="profile-sidebar">
          <div className="user-info-card">
            <div className="user-avatar-wrapper">
              <div className="user-avatar">{userInfo?.name?.charAt(0) || 'U'}</div>
              <div className="user-badge">VIP</div>
            </div>
            <h3>{userInfo?.name || 'Guest User'}</h3>
            <p>{userInfo?.email || 'user@example.com'}</p>
          </div>
          
          <nav className="profile-nav">
            {menuItems.map(item => (
              <button 
                key={item.id}
                className={activeTab === item.id ? 'active' : ''} 
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={20} /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Dynamic Content Area */}
        <main className="profile-content">
          <AnimatePresence mode="wait">
            
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="section-header">
                  <h2>Account Overview</h2>
                  <p>Welcome back, {userInfo?.name?.split(' ')[0]}. Here's what's happening with your account.</p>
                </div>

                <div className="profile-stats">
                  <div className="stat-item">
                    <h4>Total Orders</h4>
                    <div className="stat-value">{orders.length}</div>
                  </div>
                  <div className="stat-item">
                    <h4>Heedy Points</h4>
                    <div className="stat-value">1,450</div>
                  </div>
                </div>

                <div className="section-header activity-header">
                  <h3>Recent Activity</h3>
                </div>
                <div className="orders-list">
                  {loadingOrders ? (
                    <p>Loading orders...</p>
                  ) : orders.length > 0 ? (
                    orders.slice(0, 1).map(order => (
                      <div className="order-card" key={order._id} onClick={() => openOrderModal(order)} style={{ cursor: 'pointer' }}>
                        <div className="order-icon-box"><Package size={24} /></div>
                        <div className="order-main">
                          <h4>Last Order #{order._id.substring(0, 8)}...</h4>
                          <div className="order-meta">
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>{order.products?.reduce((acc, p) => acc + p.quantity, 0) || 0} Items</span>
                            <span>{IndianRupee.format(order.totalAmount)}</span>
                          </div>
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
                      </div>
                    ))
                  ) : (
                    <p>No recent orders found. Raw Response: {JSON.stringify(orders)}</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="section-header">
                  <h2>Order History</h2>
                  <p>Track, manage and view your previous luxury purchases.</p>
                </div>
                <div className="orders-list">
                  {loadingOrders ? (
                    <p>Loading orders...</p>
                  ) : orders.length > 0 ? (
                    orders.map(order => (
                      <div className="order-card" key={order._id} onClick={() => openOrderModal(order)} style={{ cursor: 'pointer' }}>
                        <div className="order-icon-box"><Package size={24} /></div>
                        <div className="order-main">
                          <h4>Order #{order._id.substring(0, 8)}...</h4>
                          <div className="order-meta">
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>{order.products?.reduce((acc, p) => acc + p.quantity, 0) || 0} Items</span>
                            <span>{IndianRupee.format(order.totalAmount)}</span>
                          </div>
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
                      </div>
                    ))
                  ) : (
                    <p>You haven't placed any orders yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div 
                key="addresses"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="section-header">
                  <h2>Shipping Addresses</h2>
                  <p>Manage your delivery locations for a faster checkout.</p>
                </div>
                <div className="address-grid">
                  {userInfo?.addresses && userInfo.addresses.length > 0 ? (
                    userInfo.addresses.map((addr, idx) => (
                      <div className="address-card" key={idx}>
                        {idx === 0 && <span className="address-type-tag">Primary</span>}
                        <h4>Address {idx + 1}</h4>
                        <p className="address-details">
                          <span>{addr.street}</span>
                          <span>{addr.city}, {addr.state} {addr.zipCode}</span>
                          <span>{addr.country}</span>
                        </p>
                        <div className="address-actions">
                          <button onClick={() => openEditModal(addr)} className="text-blue">Edit Details</button>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="text-red">Remove</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="stat-item" style={{ gridColumn: '1 / -1' }}>
                      <p>You haven't added any addresses yet.</p>
                    </div>
                  )}
                </div>
                <button className="add-address-btn" onClick={() => setIsModalOpen(true)}>+ Add New Shipping Location</button>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Modern Address Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="address-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="address-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="modal-header">
                <h2>Add New Address</h2>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleAddAddress} className="address-form">
                <div className="form-group">
                  <label>Street Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 123 Luxury St." 
                    required 
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      placeholder="New York" 
                      required 
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input 
                      type="text" 
                      placeholder="NY" 
                      required 
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Zip Code</label>
                    <input 
                      type="text" 
                      placeholder="10001" 
                      required 
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input 
                      type="text" 
                      placeholder="United States" 
                      required 
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="submit-address-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Address'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
        {isEditModalOpen && (
          <motion.div 
            className="address-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="address-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="modal-header">
                <h2>Edit Address</h2>
                <button className="close-modal" onClick={() => setIsEditModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleEditAddress} className="address-form">
                <div className="form-group">
                  <label>Street Address</label>
                  <input 
                    type="text" 
                    required 
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      required 
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input 
                      type="text" 
                      required 
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Zip Code</label>
                    <input 
                      type="text" 
                      required 
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input 
                      type="text" 
                      required 
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="submit-address-btn" disabled={loading}>
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
        {isOrderModalOpen && selectedOrder && (
          <motion.div 
            className="address-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="address-modal order-detail-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="modal-header">
                <h2>Order Details</h2>
                <button className="close-modal" onClick={() => setIsOrderModalOpen(false)}>&times;</button>
              </div>
              
              <div className="order-detail-content">
                <div className="order-detail-section">
                  <div className="detail-row">
                    <span>Order ID:</span>
                    <strong>#{selectedOrder._id}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Date:</span>
                    <strong>{new Date(selectedOrder.createdAt).toLocaleString()}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Status:</span>
                    <strong>{selectedOrder.status || 'Pending'}</strong>
                  </div>
                </div>

                <div className="order-detail-section">
                  <h3>Items</h3>
                  <div className="order-items-detail">
                    {selectedOrder.products?.map((item, idx) => (
                      <div className="order-item-detail" key={idx}>
                        <div className="item-name">
                          <strong>{item.name}</strong>
                          {item.variant?.ml && (
                            <span className="item-variant">
                              ({item.variant.ml} Edition)
                            </span>
                          )}
                        </div>
                        <div className="item-price-qty">
                          {item.quantity} × {IndianRupee.format(item.price)} = {IndianRupee.format(item.quantity * item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-total-detail">
                    <span>Total Amount:</span>
                    <strong>{IndianRupee.format(selectedOrder.totalAmount)}</strong>
                  </div>
                </div>

                {selectedOrder.shippingAddress && (
                  <div className="order-detail-section">
                    <h3>Shipping Address</h3>
                    <p className="shipping-addr-text">
                      {selectedOrder.shippingAddress.street}<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>
                )}
                
                <div className="order-detail-section">
                  <h3>Payment Info</h3>
                  <div className="detail-row">
                    <span>Method:</span>
                    <strong>{selectedOrder.paymentMethod}</strong>
                  </div>
                  {selectedOrder.paymentDetails?.razorpayPaymentId && (
                    <div className="detail-row">
                      <span>Payment ID:</span>
                      <strong>{selectedOrder.paymentDetails.razorpayPaymentId}</strong>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
