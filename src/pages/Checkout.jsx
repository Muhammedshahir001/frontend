import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Check, MapPin, X, CreditCard, ShieldCheck } from 'lucide-react';
import { setCredentials } from '../store/authSlice';
import { clearCartItems, clearCart } from '../store/cartSlice';
import toast from 'react-hot-toast';
import './Checkout.css';

const IndianRupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector(state => state.cart);
  const { userInfo } = useSelector(state => state.auth);

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCouponData, setAppliedCouponData] = useState(null);
  const [eligibleItems, setEligibleItems] = useState([]);

  useEffect(() => {
    if (!userInfo) {
       navigate('/login');
    }
  }, [userInfo, navigate]);

  if (!userInfo) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.variant?.price || item.price) * item.qty, 0);
  
  // Calculate discount per item
  const calculateFinalTotals = () => {
    let totalDiscount = 0;
    const itemsWithDiscount = cartItems.map(item => {
      const productId = item.product?._id || item.product || item._id;
      let itemDiscount = 0;
      
      if (couponApplied && appliedCouponData && eligibleItems.includes(productId)) {
        const itemTotal = (item.variant?.price || item.price) * item.qty;
        if (appliedCouponData.discountType === 'percentage') {
          itemDiscount = (itemTotal * appliedCouponData.discountValue) / 100;
        } else {
          // For fixed amount, we already have the total discount from validation.
          // Distribution is handled in calculateFinalTotals for fixed coupons.
        }
      }
      return { ...item, itemDiscount };
    });

    // If discountType is fixed, the total discount is just the discountValue (up to eligible total)
    if (couponApplied && appliedCouponData?.discountType === 'fixed') {
      const eligibleTotal = cartItems.reduce((sum, item) => {
        const productId = item.product?._id || item.product || item._id;
        if (eligibleItems.includes(productId)) {
          return sum + (item.variant?.price || item.price) * item.qty;
        }
        return sum;
      }, 0);
      totalDiscount = Math.min(appliedCouponData.discountValue, eligibleTotal);
    } else {
      totalDiscount = itemsWithDiscount.reduce((sum, item) => sum + (item.itemDiscount || 0), 0);
    }

    return {
      itemsWithDiscount,
      totalDiscount,
      finalTotal: subtotal - totalDiscount
    };
  };

  const { itemsWithDiscount, totalDiscount, finalTotal } = calculateFinalTotals();

  const handleApplyCoupon = async () => {
    if (!coupon) return;
    try {
      const { data } = await api.post('/api/coupons/validate', { code: coupon, cartItems });
      
      setAppliedCouponData(data.coupon);
      setEligibleItems(data.eligibleItems);
      setCouponApplied(true);
      toast.success('Coupon applied successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setDiscount(0);
      setCouponApplied(false);
      setAppliedCouponData(null);
      setEligibleItems([]);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/users/address', newAddress);
      dispatch(setCredentials(data));
      setShowAddressModal(false);
      setSelectedAddressIndex(data.addresses.length - 1);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: 'India' });
    } catch (error) {
      alert('Failed to add address. Please try again.');
    }
  };

  const handlePayment = async () => {
    const shippingAddress = userInfo.addresses[selectedAddressIndex];
    if (!shippingAddress) {
      alert('Please select or add a shipping address');
      return;
    }

    if (!finalTotal || isNaN(finalTotal) || finalTotal <= 0) {
      alert('Invalid order total. Please check your cart.');
      return;
    }

    try {
      // 1. Get Key ID dynamically
      const { data: keyData } = await api.get('/api/orders/config/razorpay');
      
      // 2. Create Razorpay Order on Backend
      const { data: rzpOrder } = await api.post('/api/orders/razorpay', { amount: finalTotal });

      const options = {
        key: keyData.keyId, 
        amount: rzpOrder.amount,
        currency: "INR",
        name: "HEEDY PREMIUM",
        description: "Secure Order Payment",
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            // 3. Verified Payment -> Place Real Order
            const { data: finalOrder } = await api.post('/api/orders', {
              products: itemsWithDiscount.map(item => ({
                product: item.product,
                name: item.name,
                quantity: item.qty,
                price: item.variant?.price || item.price,
                discount: item.itemDiscount || 0,
                variant: {
                  ml: item.variant?.ml || 'Standard'
                }
              })),
              shippingAddress,
              paymentMethod: 'razorpay',
              totalAmount: finalTotal,
              discount: totalDiscount,
              couponCode: couponApplied ? appliedCouponData?.code : null,
              paymentDetails: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              }
            });

            dispatch(clearCart());
            navigate('/order-success', { state: { order: finalOrder } });
          } catch (err) {
            console.error('Final Save Error:', err.response?.data || err);
            alert('Order creation failed after payment. Please contact HEEDY support with your Payment ID: ' + response.razorpay_payment_id);
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone || ""
        },
        theme: {
          color: "#111111"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        console.error('RZP Failure Details:', response.error);
        alert(`Payment Failed!\nReason: ${response.error.description}\nCode: ${response.error.code}`);
      });
      rzp1.open();

    } catch (error) {
       console.error('Init Error:', error);
       const message = error.response?.data?.message || error.message || 'Something went wrong initiating the payment.';
       alert(`Payment Initiation Failed: ${message}`);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Secure Checkout</h1>
        
        <div className="checkout-grid">
          <div className="checkout-main">
            {/* Address Section */}
            <section className="checkout-section">
              <div className="section-header">
                <div className="section-title">
                  <span className="step-num">1</span>
                  <h2>Shipping Destination</h2>
                </div>
                <button className="add-new-btn" onClick={() => setShowAddressModal(true)}>
                  <Plus size={16} /> New Address
                </button>
              </div>

              <div className="address-grid">
                {userInfo.addresses && userInfo.addresses.map((addr, index) => (
                  <div 
                    key={index} 
                    className={`address-card ${selectedAddressIndex === index ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressIndex(index)}
                  >
                    {selectedAddressIndex === index && <div className="selected-badge"><Check size={14} /></div>}
                    <div className="card-content">
                      <MapPin size={18} className="pin-icon" />
                      <div className="addr-details">
                        <p className="street">{addr.street}</p>
                        <p className="city">{addr.city}, {addr.state}</p>
                        <p className="zip">{addr.zipCode}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!userInfo.addresses || userInfo.addresses.length === 0) && (
                  <button className="empty-address-btn" onClick={() => setShowAddressModal(true)}>
                    <Plus size={40} strokeWidth={1} />
                    <span>Add your first shipping address</span>
                  </button>
                )}
              </div>
            </section>

            {/* Premium Divider */}
            <div className="checkout-divider" />

            {/* coupon section */}
            <section className="checkout-section">
              <div className="section-title">
                <span className="step-num">2</span>
                <h2>Promotion Code</h2>
              </div>
              <div className="coupon-wrapper">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Enter gift card or discount code" 
                    value={coupon} 
                    disabled={couponApplied}
                    onChange={e => setCoupon(e.target.value.toUpperCase())} 
                    className={couponApplied ? 'coupon-input-applied' : ''}
                  />
                  {couponApplied && (
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                      onClick={() => {
                        setCouponApplied(false);
                        setDiscount(0);
                        setCoupon('');
                      }}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <button 
                  className={`apply-coupon ${couponApplied ? 'applied' : ''}`}
                  onClick={handleApplyCoupon}
                  disabled={couponApplied || !coupon}
                >
                  {couponApplied ? <Check size={20} /> : 'Apply'}
                </button>
              </div>
              {couponApplied && (
                <p className="coupon-success-msg">
                  Awesome! Your discount has been applied to the eligible items.
                </p>
              )}
            </section>

            <div className="checkout-divider" />

            {/* Payment Section */}
            <section className="checkout-section">
              <div className="section-title">
                <span className="step-num">3</span>
                <h2>Payment Method</h2>
              </div>
              <div className="payment-selector">
                <div className="payment-option selected">
                  <div className="option-info">
                    <CreditCard size={20} />
                    <span>Secure Online Payment (Razorpay)</span>
                  </div>
                  <div className="payment-logos">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/RuPay_logo.svg/1200px-RuPay_logo.svg.png" alt="RuPay" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="MC" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="checkout-sidebar">
            <div className="order-summary-card">
              <h3>Order Bag</h3>
              <div className="summary-items">
                {itemsWithDiscount.map(item => (
                  <div className="summary-item" key={`${item.product}-${item.variant?.ml || 'Standard'}`}>
                    <div className="item-thumb">
                      <img src={item.image} alt={item.name} />
                      <span className="item-qty-badge">{item.qty}</span>
                    </div>
                    <div className="item-meta">
                      <h4>{item.name}</h4>
                      <span>{item.variant?.ml || 'Standard'} Edition</span>
                    </div>
                    <div className="item-price-col">
                      {item.itemDiscount > 0 && (
                        <span className="item-old-price">{IndianRupee.format((item.variant?.price || item.price) * item.qty)}</span>
                      )}
                      <p className="item-price">
                        {IndianRupee.format(((item.variant?.price || item.price) * item.qty) - (item.itemDiscount || 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>{IndianRupee.format(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="price-row discount-row">
                    <span>Coupon Discount {appliedCouponData?.code && `(${appliedCouponData.code})`}</span>
                    <span>-{IndianRupee.format(totalDiscount)}</span>
                  </div>
                )}
                <div className="price-row">
                  <span>Shipping</span>
                  <span className="free-tag">Complimentary</span>
                </div>
                <div className="price-row total-final">
                  <span>Total</span>
                  <span>{IndianRupee.format(finalTotal)}</span>
                </div>
              </div>

              <button className="complete-order-btn" onClick={handlePayment}>
                Secure Checkout
              </button>

              <div className="secure-badge">
                <ShieldCheck size={16} /> 256-bit SSL Secured Connection
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="address-modal-overlay">
          <div className="address-modal-box">
            <div className="modal-header">
              <h3>New Shipping Address</h3>
              <button className="close-modal" onClick={() => setShowAddressModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddAddress} className="modal-form">
              <div className="field">
                <label>Street Address</label>
                <input 
                  required 
                  type="text" 
                  value={newAddress.street} 
                  onChange={e => setNewAddress({...newAddress, street: e.target.value})} 
                  placeholder="e.g. 123 Luxury Lane"
                />
              </div>
              <div className="field-group">
                <div className="field">
                  <label>City</label>
                  <input 
                    required 
                    type="text" 
                    value={newAddress.city} 
                    onChange={e => setNewAddress({...newAddress, city: e.target.value})} 
                    placeholder="Mumbai"
                  />
                </div>
                <div className="field">
                  <label>State</label>
                  <input 
                    required 
                    type="text" 
                    value={newAddress.state} 
                    onChange={e => setNewAddress({...newAddress, state: e.target.value})} 
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
              <div className="field-group">
                <div className="field">
                  <label>ZIP Code</label>
                  <input 
                    required 
                    type="text" 
                    value={newAddress.zipCode} 
                    onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} 
                    placeholder="123456"
                  />
                </div>
                <div className="field">
                  <label>Country</label>
                  <input 
                    disabled 
                    type="text" 
                    value={newAddress.country} 
                    placeholder="India"
                  />
                </div>
              </div>
              <button type="submit" className="save-address-btn">Save & Deliver Here</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

