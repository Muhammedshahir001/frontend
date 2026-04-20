import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { adminLogout } from '../store/authSlice';
import { 
  LayoutDashboard, ShoppingBag, Layers, 
  Image as ImageIcon, Users, Ticket, 
  TrendingUp, Package, DollarSign,
  Plus, Edit, Trash2, Check, X,
  ChevronRight, LogOut, Menu, Star, Eye
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { adminInfo } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({ 
    revenue: 0, 
    orders: 0, 
    users: 0,
    products: 0,
    categories: 0,
    banners: 0,
    coupons: 0,
    testimonials: 0
  });

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', 
    description: '', 
    category: '', 
    images: [], 
    variants: [],
    rating: 0,
    reviewsCount: 0,
    offer: '',
    features: ''
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '' });

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: '', description: '', image: '' });
  const [uploading, setUploading] = useState(false);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({ 
    code: '', 
    discountType: 'percentage', 
    discountValue: '', 
    categoryId: '', 
    expiryDate: '', 
    isActive: true 
  });

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    clientName: '',
    reviewMessage: '',
    rating: 5,
    profileImage: '',
    role: 'Verified Buyer',
    isActive: true
  });

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [prodRes, catRes, orderRes, bannerRes, userRes, couponRes, testimonialRes] = await Promise.all([
        api.get('/api/products').catch(e => ({ data: [] })),
        api.get('/api/categories').catch(e => ({ data: [] })),
        api.get('/api/orders').catch(e => ({ data: [] })),
        api.get('/api/banners').catch(e => ({ data: [] })),
        api.get('/api/users').catch(e => ({ data: [] })),
        api.get('/api/coupons').catch(e => ({ data: [] })),
        api.get('/api/testimonials/admin').catch(e => ({ data: [] }))
      ]);

      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
      setBanners(Array.isArray(bannerRes.data) ? bannerRes.data : []);
      setCoupons(Array.isArray(couponRes.data) ? couponRes.data : []);
      setTestimonials(Array.isArray(testimonialRes.data) ? testimonialRes.data : []);
      setUsersList(Array.isArray(userRes.data) ? userRes.data : []);
      
      // Calculate Stats
      const totalRevenue = (Array.isArray(orderRes.data) ? orderRes.data : []).reduce((acc, ord) => acc + (ord.totalAmount || 0), 0);
      setStats({
        revenue: totalRevenue,
        orders: (Array.isArray(orderRes.data) ? orderRes.data : []).length,
        users: (Array.isArray(userRes.data) ? userRes.data : []).length,
        products: (Array.isArray(prodRes.data) ? prodRes.data : []).length,
        categories: (Array.isArray(catRes.data) ? catRes.data : []).length,
        banners: (Array.isArray(bannerRes.data) ? bannerRes.data : []).length,
        coupons: (Array.isArray(couponRes.data) ? couponRes.data : []).length,
        testimonials: (Array.isArray(testimonialRes.data) ? testimonialRes.data : []).length
      });
    } catch (err) {
      console.error('Admin Data Fetch Error:', err);
      toast.error('Some data failed to load');
    }
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, image: cat.image || '' });
    setIsCategoryModalOpen(true);
  };

  const openEditBanner = (banner) => {
    setEditingBanner(banner);
    setBannerForm({ title: banner.title, description: banner.description, image: banner.image });
    setIsBannerModalOpen(true);
  };

  const openEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || coupon.discountPercentage,
      categoryId: coupon.categoryId || '',
      expiryDate: coupon.expiryDate.split('T')[0],
      isActive: coupon.isActive
    });
    setIsCouponModalOpen(true);
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await api.put(`/api/users/${id}/status`, {});
      fetchAllData();
      toast.success(`User ${currentStatus ? 'Blocked' : 'Unblocked'} Successfully`);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const uploadFileHandler = async (e, multiple = false) => {
    const files = e.target.files;
    const formData = new FormData();

    setUploading(true);
    try {
      if (multiple) {
        for (let i = 0; i < files.length; i++) {
          formData.append('images', files[i]);
        }
        const { data } = await api.post('/api/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProductForm({ ...productForm, images: [...productForm.images, ...data.urls] });
      } else {
        formData.append('image', files[0]);
        const { data } = await api.post('/api/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (isProductModalOpen) {
          setProductForm({ ...productForm, images: [...productForm.images, data.url] });
        } else if (isBannerModalOpen) {
          setBannerForm({ ...bannerForm, image: data.url });
        } else if (isCategoryModalOpen) {
          setCategoryForm({ ...categoryForm, image: data.url });
        }
      }
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert('Upload failed');
    }
  };

  const addVariant = () => {
    setProductForm({
      ...productForm,
      variants: [...productForm.variants, { ml: '', actualPrice: '', offerPrice: '', stock: '' }]
    });
  };

  const removeVariant = (index) => {
    const updatedVariants = productForm.variants.filter((_, i) => i !== index);
    setProductForm({ ...productForm, variants: updatedVariants });
  };

  const updateVariant = (index, field, value) => {
    const updatedVariants = productForm.variants.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    );
    setProductForm({ ...productForm, variants: updatedVariants });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, productForm);
      } else {
        await api.post('/api/products', productForm);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({ 
        name: '', 
        description: '', 
        category: '', 
        images: [], 
        variants: [],
        rating: 0,
        reviewsCount: 0,
        offer: '',
        features: ''
      });
      fetchAllData();
      toast.success(editingProduct ? 'Product updated' : 'Product created');
    } catch (err) {
      toast.error('Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${id}`);
        fetchAllData();
        toast.success('Product deleted');
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category?._id || product.category,
      images: product.images,
      variants: product.variants || [],
      rating: product.rating || 0,
      reviewsCount: product.reviewsCount || 0,
      offer: product.offer || '',
      features: product.features || ''
    });
    setIsProductModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory._id}`, categoryForm);
      } else {
        await api.post('/api/categories', categoryForm);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', image: '' });
      fetchAllData();
      toast.success(editingCategory ? 'Category updated' : 'Category created');
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/api/categories/${id}`);
        fetchAllData();
        toast.success('Category deleted');
      } catch (err) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await api.put(`/api/banners/${editingBanner._id}`, bannerForm);
      } else {
        await api.post('/api/banners', bannerForm);
      }
      setIsBannerModalOpen(false);
      setEditingBanner(null);
      setBannerForm({ title: '', description: '', image: '' });
      fetchAllData();
      toast.success(editingBanner ? 'Banner updated' : 'Banner created');
    } catch (err) {
      toast.error('Failed to save banner');
    }
  };

  const deleteBanner = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await api.delete(`/api/banners/${id}`);
        fetchAllData();
        toast.success('Banner deleted');
      } catch (err) {
        toast.error('Failed to delete banner');
      }
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await api.put(`/api/coupons/${editingCoupon._id}`, couponForm);
      } else {
        await api.post('/api/coupons', couponForm);
      }
      setIsCouponModalOpen(false);
      setEditingCoupon(null);
      setCouponForm({ code: '', discountType: 'percentage', discountValue: '', categoryId: '', expiryDate: '', isActive: true });
      fetchAllData();
      toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created');
    } catch (err) {
      toast.error('Failed to save coupon');
    }
  };

  const deleteCoupon = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await api.delete(`/api/coupons/${id}`);
        fetchAllData();
        toast.success('Coupon deleted');
      } catch (err) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await api.put(`/api/testimonials/${editingTestimonial._id}`, testimonialForm);
      } else {
        await api.post('/api/testimonials', testimonialForm);
      }
      setIsTestimonialModalOpen(false);
      setEditingTestimonial(null);
      setTestimonialForm({
        clientName: '',
        reviewMessage: '',
        rating: 5,
        profileImage: '',
        role: 'Verified Buyer',
        isActive: true
      });
      fetchAllData();
      toast.success(editingTestimonial ? 'Testimonial updated' : 'Testimonial created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save testimonial');
    }
  };

  const openEditTestimonial = (testimonial) => {
    setEditingTestimonial(testimonial);
    setTestimonialForm({
      clientName: testimonial.clientName,
      reviewMessage: testimonial.reviewMessage,
      rating: testimonial.rating || 5,
      profileImage: testimonial.profileImage || '',
      role: testimonial.role || 'Verified Buyer',
      isActive: testimonial.isActive !== false
    });
    setIsTestimonialModalOpen(true);
  };

  const deleteTestimonial = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await api.delete(`/api/testimonials/${id}`);
        fetchAllData();
        toast.success('Testimonial deleted');
      } catch (err) {
        toast.error('Failed to delete testimonial');
      }
    }
  };

  const toggleTestimonialStatus = async (id, currentStatus) => {
    try {
      await api.put(`/api/testimonials/${id}`, { isActive: !currentStatus });
      fetchAllData();
      toast.success(`Testimonial ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to update testimonial status');
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/api/orders/${id}/status`, { status });
      fetchAllData();
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const toggleCategoryStatus = async (id, currentStatus) => {
    try {
      await api.put(`/api/categories/${id}`, { isActive: !currentStatus });
      fetchAllData();
      toast.success(`Category ${!currentStatus ? 'Unblocked' : 'Blocked'}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openOrderDetails = async (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
    setLoadingOrderDetails(true);
    try {
      const { data } = await api.get(`/api/orders/${order._id}`);
      setOrderDetails(data);
    } catch (err) {
      console.error('Failed to fetch order details', err);
      toast.error('Failed to load order details');
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Products', icon: <ShoppingBag size={20} /> },
    { id: 'categories', label: 'Categories', icon: <Layers size={20} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={20} /> },
    { id: 'banners', label: 'Banners', icon: <ImageIcon size={20} /> },
    { id: 'coupons', label: 'Coupons', icon: <Ticket size={20} /> },
    { id: 'testimonials', label: 'Testimonials', icon: <Star size={20} /> },
    { id: 'users', label: 'Customers', icon: <Users size={20} /> },
  ];

  const IndianRupee = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  });

  return (
    <div className="admin-layout">
      {/* Mobile Menu Toggle */}
      <button className={`mobile-toggle ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Modern Sidebar */}
      <aside className={`admin-sidebar-new ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <div className="logo-icon">H</div>
            <span>HEEDY ADMIN</span>
          </div>
          <button className="sidebar-close-mobile" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button 
              key={item.id}
              className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth <= 768) setIsSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {activeTab === item.id && <ChevronRight size={16} className="active-arrow" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn-admin" onClick={() => {
            dispatch(adminLogout());
            navigate('/admin-login');
          }}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1>{navItems.find(i => i.id === activeTab)?.label}</h1>
            <p>Welcome back, {adminInfo?.name}</p>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <div className="admin-avatar">{adminInfo?.name?.charAt(0)}</div>
              <div className="admin-info">
                <span className="name">{adminInfo?.name}</span>
                <span className="role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-scroll-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid-new">
                <div className="stat-card-new revenue">
                  <div className="stat-icon"><DollarSign size={24} /></div>
                  <div className="stat-info">
                    <h3>Total Revenue</h3>
                    <p>{IndianRupee.format(stats.revenue)}</p>
                  </div>
                </div>
                <div className="stat-card-new orders">
                  <div className="stat-icon"><Package size={24} /></div>
                  <div className="stat-info">
                    <h3>Total Orders</h3>
                    <p>{stats.orders}</p>
                  </div>
                </div>
                <div className="stat-card-new products">
                  <div className="stat-icon"><ShoppingBag size={24} /></div>
                  <div className="stat-info">
                    <h3>Products</h3>
                    <p>{stats.products}</p>
                  </div>
                </div>
                <div className="stat-card-new categories">
                  <div className="stat-icon"><Layers size={24} /></div>
                  <div className="stat-info">
                    <h3>Categories</h3>
                    <p>{stats.categories}</p>
                  </div>
                </div>
                <div className="stat-card-new banners">
                  <div className="stat-icon"><ImageIcon size={24} /></div>
                  <div className="stat-info">
                    <h3>Banners</h3>
                    <p>{stats.banners}</p>
                  </div>
                </div>
                <div className="stat-card-new coupons">
                  <div className="stat-icon"><Ticket size={24} /></div>
                  <div className="stat-info">
                    <h3>Coupons</h3>
                    <p>{stats.coupons}</p>
                  </div>
                </div>
                <div className="stat-card-new testimonials">
                  <div className="stat-icon"><Star size={24} /></div>
                  <div className="stat-info">
                    <h3>Testimonials</h3>
                    <p>{stats.testimonials}</p>
                  </div>
                </div>
                <div className="stat-card-new users">
                  <div className="stat-icon"><Users size={24} /></div>
                  <div className="stat-info">
                    <h3>Customers</h3>
                    <p>{stats.users}</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="recent-orders-card">
                  <div className="card-header">
                    <h2>Recent Transactions</h2>
                    <button onClick={() => setActiveTab('orders')}>View All</button>
                  </div>
                  <div className="table-responsive">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order._id}>
                            <td className="id-cell">#{order._id.substring(0, 8)}</td>
                            <td>{order.user?.name || 'Guest'}</td>
                            <td className="price-cell">{IndianRupee.format(order.totalAmount)}</td>
                            <td>
                              <span className={`status-pill ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="management-tab">
              <div className="tab-header">
                <h2>Product Catalog</h2>
                <button className="add-btn-main" onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ 
                    name: '', 
                    description: '', 
                    category: '', 
                    images: [], 
                    variants: [],
                    rating: 0,
                    reviewsCount: 0,
                    offer: '',
                    features: ''
                  });
                  setIsProductModalOpen(true);
                }}>
                  <Plus size={20} /> Add New Product
                </button>
              </div>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Starting Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td><img src={product.images[0]} alt="" className="table-img" /></td>
                        <td className="font-bold">{product.name}</td>
                        <td>{product.category?.name || 'Uncategorized'}</td>
                        <td className="price-cell">
                          {product.variants?.[0]?.offerPrice ? (
                            <div className="flex flex-col">
                              <span className="text-blue-600">{IndianRupee.format(product.variants[0].offerPrice)}</span>
                              <span className="text-sm text-slate-400 line-through">{IndianRupee.format(product.variants[0].actualPrice)}</span>
                            </div>
                          ) : (
                            IndianRupee.format(product.variants?.[0]?.actualPrice || 0)
                          )}
                        </td>
                        <td>
                          <span className={`stock-badge ${product.variants?.some(v => v.stock > 0) ? 'in-stock' : 'out-of-stock'}`}>
                            {product.variants?.some(v => v.stock > 0) ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="edit-btn" onClick={() => openEditProduct(product)}><Edit size={16} /></button>
                            <button className="delete-btn" onClick={() => deleteProduct(product._id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="management-tab">
              <div className="tab-header">
                <h2>Product Categories</h2>
                <button className="add-btn-main" onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', image: '' });
                  setIsCategoryModalOpen(true);
                }}>
                  <Plus size={20} /> Add New Category
                </button>
              </div>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat._id}>
                        <td><img src={cat.image || '/images/placeholder.jpg'} alt="" className="table-img" /></td>
                        <td className="font-bold">{cat.name}</td>
                        <td>
                          <span className={`status-pill ${cat.isActive ? 'delivered' : 'cancelled'}`}>
                            {cat.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="edit-btn" onClick={() => openEditCategory(cat)} title="Edit"><Edit size={16} /></button>
                            <button 
                              className={cat.isActive ? "delete-btn" : "edit-btn"} 
                              onClick={() => toggleCategoryStatus(cat._id, cat.isActive)}
                              title={cat.isActive ? "Block" : "Unblock"}
                            >
                              {cat.isActive ? <X size={16} /> : <Check size={16} />}
                            </button>
                            <button className="delete-btn" onClick={() => deleteCategory(cat._id)} title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="management-tab">
              <div className="tab-header">
                <h2>Homepage Banners</h2>
                <button className="add-btn-main" onClick={() => {
                  setEditingBanner(null);
                  setBannerForm({ title: '', description: '', image: '' });
                  setIsBannerModalOpen(true);
                }}>
                  <Plus size={20} /> Add New Banner
                </button>
              </div>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map(banner => (
                      <tr key={banner._id}>
                        <td><img src={banner.image} alt="" className="table-img banner-img" /></td>
                        <td className="font-bold">{banner.title}</td>
                        <td>{banner.description}</td>
                        <td>
                          <div className="action-btns">
                            <button className="edit-btn" onClick={() => openEditBanner(banner)}><Edit size={16} /></button>
                            <button className="delete-btn" onClick={() => deleteBanner(banner._id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="management-tab">
              <div className="tab-header">
                <h2>All Orders</h2>
              </div>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td className="id-cell">#{order._id.substring(0, 8)}</td>
                        <td>
                          <div className="cust-info">
                            <strong>{order.user?.name}</strong>
                            <span>{order.user?.email}</span>
                          </div>
                        </td>
                        <td>{order.products?.length} items</td>
                        <td className="price-cell">{IndianRupee.format(order.totalAmount)}</td>
                        <td>
                          <select 
                            className={`status-select ${order.status.toLowerCase()}`}
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="edit-btn"
                            onClick={() => openOrderDetails(order)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="management-tab">
              <div className="tab-header">
                <h2>Discount Coupons</h2>
                <button className="add-btn-main" onClick={() => {
                  setEditingCoupon(null);
                  setCouponForm({ code: '', discountPercentage: '', expiryDate: '', isActive: true });
                  setIsCouponModalOpen(true);
                }}>
                  <Plus size={20} /> Add New Coupon
                </button>
              </div>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(coupon => (
                      <tr key={coupon._id}>
                        <td className="font-bold">{coupon.code}</td>
                        <td>{coupon.discountPercentage}%</td>
                        <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-pill ${coupon.isActive ? 'delivered' : 'cancelled'}`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="edit-btn" onClick={() => openEditCoupon(coupon)} title="Edit"><Edit size={16} /></button>
                            <button className="delete-btn" onClick={() => deleteCoupon(coupon._id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="management-tab">
              <div className="tab-header">
                <h2>Customer Management</h2>
              </div>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(user => (
                      <tr key={user._id}>
                        <td className="font-bold">{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>
                          <span className={`status-pill ${user.isActive ? 'delivered' : 'cancelled'}`}>
                            {user.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button 
                              className={user.isActive ? "delete-btn" : "status-btn-unblock"} 
                              onClick={() => toggleUserStatus(user._id, user.isActive)}
                              title={user.isActive ? "Block User" : "Unblock User"}
                            >
                              {user.isActive ? <X size={16} /> : <Check size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="management-tab">
              <div className="tab-header">
                <h2>Client Testimonials</h2>
                <button className="add-btn-main" onClick={() => {
                  setEditingTestimonial(null);
                  setTestimonialForm({
                    clientName: '',
                    reviewMessage: '',
                    rating: 5,
                    profileImage: '',
                    role: 'Verified Buyer',
                    isActive: true
                  });
                  setIsTestimonialModalOpen(true);
                }}>
                  <Plus size={20} /> Add New Review
                </button>
              </div>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Review</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.map(t => (
                      <tr key={t._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {t.profileImage ? (
                              <img src={t.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                                {t.clientName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold">{t.clientName}</div>
                              <div className="text-xs text-slate-400">{t.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-xs truncate">{t.reviewMessage}</td>
                        <td>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < (t.rating || 5)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                }
                              />
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${t.isActive ? 'delivered' : 'cancelled'}`}>
                            {t.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="edit-btn" onClick={() => openEditTestimonial(t)} title="Edit"><Edit size={16} /></button>
                            <button 
                              className={t.isActive ? "delete-btn" : "status-btn-unblock"} 
                              onClick={() => toggleTestimonialStatus(t._id, t.isActive)}
                              title={t.isActive ? "Hide" : "Show"}
                            >
                              {t.isActive ? <X size={16} /> : <Check size={16} />}
                            </button>
                            <button className="delete-btn" onClick={() => deleteTestimonial(t._id)} title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add placeholders for other tabs */}
          {activeTab !== 'overview' && activeTab !== 'products' && activeTab !== 'categories' && activeTab !== 'banners' && activeTab !== 'orders' && activeTab !== 'coupons' && activeTab !== 'testimonials' && activeTab !== 'users' && (
            <div className="coming-soon">
              <div className="placeholder-content">
                <h2>{navItems.find(i => i.id === activeTab)?.label} Management</h2>
                <p>This module is currently being finalized for production.</p>
                <button className="add-btn-main">
                  <Plus size={20} /> Add New {navItems.find(i => i.id === activeTab)?.label.slice(0, -1)}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsProductModalOpen(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleProductSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input 
                    required 
                    type="text" 
                    value={productForm.name} 
                    onChange={e => setProductForm({...productForm, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    required 
                    value={productForm.category} 
                    onChange={e => setProductForm({...productForm, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.filter(c => c.isActive).map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <div className="variants-header">
                  <label>Product Variants (ML based)</label>
                  <button type="button" className="add-variant-btn" onClick={addVariant}>
                    <Plus size={14} /> Add Variant
                  </button>
                </div>
                <div className="variants-list">
                  {productForm.variants.map((v, i) => (
                    <div key={i} className="variant-row">
                      <input 
                        placeholder="e.g. 100ml" 
                        value={v.ml} 
                        onChange={e => updateVariant(i, 'ml', e.target.value)} 
                        required
                      />
                      <input 
                        type="number" 
                        placeholder="Actual Price" 
                        value={v.actualPrice} 
                        onChange={e => updateVariant(i, 'actualPrice', e.target.value)} 
                        required
                      />
                      <input 
                        type="number" 
                        placeholder="Offer Price" 
                        value={v.offerPrice} 
                        onChange={e => updateVariant(i, 'offerPrice', e.target.value)} 
                      />
                      <input 
                        type="number" 
                        placeholder="Stock" 
                        value={v.stock} 
                        onChange={e => updateVariant(i, 'stock', e.target.value)} 
                        required
                      />
                      <button type="button" className="remove-variant-btn" onClick={() => removeVariant(i)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  required 
                  rows="4"
                  value={productForm.description} 
                  onChange={e => setProductForm({...productForm, description: e.target.value})}
                ></textarea>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Star Rating (0-5)</label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={
                            star <= productForm.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold">{productForm.rating} Stars</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Reviews Count</label>
                  <input 
                    type="number" 
                    value={productForm.reviewsCount} 
                    onChange={e => setProductForm({...productForm, reviewsCount: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Offer Text (e.g. FLAT 35% OFF)</label>
                  <input 
                    type="text" 
                    placeholder="Leave empty for default"
                    value={productForm.offer} 
                    onChange={e => setProductForm({...productForm, offer: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Key Features (e.g. Brightens Skin)</label>
                  <input 
                    type="text" 
                    placeholder="Main product benefit"
                    value={productForm.features} 
                    onChange={e => setProductForm({...productForm, features: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Upload Images (Multiple)</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => uploadFileHandler(e, true)}
                />
                {uploading && <p className="upload-text">Uploading...</p>}
              </div>
              <div className="form-group">
                <label>Image URLs (comma separated or add via upload)</label>
                <input 
                  type="text" 
                  placeholder="https://image1.jpg, https://image2.jpg"
                  value={productForm.images.join(', ')} 
                  onChange={e => setProductForm({...productForm, images: e.target.value.split(',').map(s => s.trim())})}
                />
              </div>
              <div className="image-previews">
                {productForm.images.map((img, i) => img && (
                  <div key={i} className="preview-container">
                    <img src={img} alt="" className="preview-img" />
                    <button type="button" className="remove-img-btn" onClick={() => setProductForm({...productForm, images: productForm.images.filter((_, idx) => idx !== i)})}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="submit" className="save-btn-admin">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleCategorySubmit} className="admin-form">
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  required 
                  type="text" 
                  value={categoryForm.name} 
                  onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                  style={{ color: '#000000' }}
                />
              </div>
              <div className="form-group">
                <label>Upload Category Image</label>
                <input 
                  type="file" 
                  onChange={(e) => uploadFileHandler(e, false)}
                />
                {uploading && <p className="upload-text">Uploading...</p>}
              </div>
              {categoryForm.image && (
                <div className="image-previews">
                  <div className="preview-container">
                    <img src={categoryForm.image} alt="" className="preview-img" />
                    <button type="button" className="remove-img-btn" onClick={() => setCategoryForm({...categoryForm, image: ''})}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}
              <button type="submit" className="save-btn-admin">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button onClick={() => setIsBannerModalOpen(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleBannerSubmit} className="admin-form">
              <div className="form-group">
                <label>Banner Title</label>
                <input 
                  required 
                  type="text" 
                  value={bannerForm.title} 
                  onChange={e => setBannerForm({...bannerForm, title: e.target.value})}
                  style={{ color: '#000000' }}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={bannerForm.description} 
                  onChange={e => setBannerForm({...bannerForm, description: e.target.value})}
                  style={{ color: '#000000' }}
                />
              </div>
              <div className="form-group">
                <label>Upload Banner Image</label>
                <input 
                  type="file" 
                  onChange={(e) => uploadFileHandler(e, false)}
                />
                {uploading && <p className="upload-text">Uploading...</p>}
              </div>
              <div className="form-group">
                <label>Banner Image URL</label>
                <input 
                  required 
                  type="text" 
                  value={bannerForm.image} 
                  onChange={e => setBannerForm({...bannerForm, image: e.target.value})}
                />
              </div>
              {bannerForm.image && (
                <div className="banner-preview">
                  <img src={bannerForm.image} alt="Preview" />
                </div>
              )}
              <button type="submit" className="save-btn-admin">
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
              <button onClick={() => setIsCouponModalOpen(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleCouponSubmit} className="admin-form">
              <div className="form-group">
                <label>Coupon Code</label>
                <input 
                  required 
                  type="text" 
                  value={couponForm.code} 
                  onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Discount Type</label>
                  <select 
                    value={couponForm.discountType} 
                    onChange={e => setCouponForm({...couponForm, discountType: e.target.value})}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value</label>
                  <input 
                    required 
                    type="number" 
                    min="1"
                    value={couponForm.discountValue} 
                    onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Applicable Category (Optional)</label>
                  <select 
                    value={couponForm.categoryId} 
                    onChange={e => setCouponForm({...couponForm, categoryId: e.target.value})}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    required 
                    type="date" 
                    value={couponForm.expiryDate} 
                    onChange={e => setCouponForm({...couponForm, expiryDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={couponForm.isActive} 
                  onChange={e => setCouponForm({...couponForm, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <button type="submit" className="save-btn-admin">
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {isTestimonialModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingTestimonial ? 'Edit Review' : 'Add New Review'}</h2>
              <button onClick={() => setIsTestimonialModalOpen(false)} className="close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleTestimonialSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Client Name</label>
                  <input 
                    required 
                    type="text" 
                    value={testimonialForm.clientName} 
                    onChange={e => setTestimonialForm({...testimonialForm, clientName: e.target.value})}
                    style={{ color: '#000000' }}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Role / Title</label>
                  <input 
                    type="text" 
                    value={testimonialForm.role} 
                    onChange={e => setTestimonialForm({...testimonialForm, role: e.target.value})}
                    style={{ color: '#000000' }}
                    placeholder="e.g., Verified Buyer"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Review Message</label>
                <textarea 
                  required 
                  rows="4"
                  value={testimonialForm.reviewMessage} 
                  onChange={e => setTestimonialForm({...testimonialForm, reviewMessage: e.target.value})}
                  style={{ color: '#000000' }}
                  placeholder="Write the client's review here..."
                ></textarea>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Rating (1-5 Stars)</label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTestimonialForm({ ...testimonialForm, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={
                            star <= testimonialForm.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold">{testimonialForm.rating} Stars</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Profile Image URL (Optional)</label>
                  <input 
                    type="text" 
                    value={testimonialForm.profileImage} 
                    onChange={e => setTestimonialForm({...testimonialForm, profileImage: e.target.value})}
                    style={{ color: '#000000' }}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={testimonialForm.isActive} 
                  onChange={e => setTestimonialForm({...testimonialForm, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active (Visible on website)</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
              {testimonialForm.profileImage && (
                <div className="image-previews">
                  <div className="preview-container">
                    <img src={testimonialForm.profileImage} alt="Profile Preview" className="preview-img rounded-full" />
                  </div>
                </div>
              )}
              <button type="submit" className="save-btn-admin">
                {editingTestimonial ? 'Update Review' : 'Create Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isOrderModalOpen && (
        <div className="admin-modal-overlay" onClick={closeOrderModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button onClick={closeOrderModal} className="close-btn"><X size={24} /></button>
            </div>
            {loadingOrderDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-4 text-slate-500">Loading...</span>
              </div>
            ) : orderDetails ? (
              <div className="admin-form">
                <div className="order-details-grid">
                  <div className="order-info-section">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Order Information</h3>
                    <div className="info-row">
                      <span className="info-label">Order ID:</span>
                      <span className="info-value font-mono">#{orderDetails._id}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Status:</span>
                      <span className={`status-pill ${orderDetails.status?.toLowerCase()}`}>
                        {orderDetails.status}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{new Date(orderDetails.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Payment:</span>
                      <span className="info-value">{orderDetails.paymentMethod}</span>
                    </div>
                    {orderDetails.paymentDetails?.razorpayOrderId && (
                      <div className="info-row">
                        <span className="info-label">Razorpay ID:</span>
                        <span className="info-value font-mono text-xs">{orderDetails.paymentDetails.razorpayOrderId}</span>
                      </div>
                    )}
                  </div>

                  <div className="customer-info-section">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Customer Information</h3>
                    <div className="info-row">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{orderDetails.user?.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{orderDetails.user?.email}</span>
                    </div>
                    {orderDetails.user?.phone && (
                      <div className="info-row">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{orderDetails.user?.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="shipping-info-section">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Shipping Address</h3>
                    {orderDetails.shippingAddress ? (
                      <div className="text-slate-600">
                        <p>{orderDetails.shippingAddress.street}</p>
                        <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}</p>
                        <p>{orderDetails.shippingAddress.zipCode}, {orderDetails.shippingAddress.country}</p>
                      </div>
                    ) : (
                      <p className="text-slate-400">No shipping address provided</p>
                    )}
                  </div>

                  <div className="items-section">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Order Items</h3>
                    <div className="order-items-list">
                      {orderDetails.products?.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <div className="item-info">
                            <span className="item-name font-bold">{item.name || item.product}</span>
                            <span className="item-variant text-slate-500">
                              {item.variant?.ml ? `${item.variant.ml}` : ''}
                            </span>
                          </div>
                          <div className="item-qty">x{item.quantity}</div>
                          <div className="item-price font-bold">
                            {IndianRupee.format(item.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-total mt-4 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-800">Total Amount:</span>
                        <span className="text-xl font-black text-blue-600">
                          {IndianRupee.format(orderDetails.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">Failed to load order details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
