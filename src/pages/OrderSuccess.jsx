import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, MapPin, ArrowRight, ShoppingBag, User } from 'lucide-react';
import './OrderSuccess.css';

const formatINR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

const OrderSuccess = () => {
  const location = useLocation();
  const { order } = location.state || {};
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!order) {
    return (
      <div className="os-page">
        <div className={`os-container ${visible ? 'os-visible' : ''}`}>
          <div className="os-header">
            <CheckCircle size={80} className="os-check-icon" />
            <h1>Order Confirmed!</h1>
            <p className="os-subtitle">Your order has been placed successfully.</p>
          </div>
          <div className="os-actions">
            <Link to="/products" className="os-btn-primary">
              Continue Shopping <ArrowRight size={16} />
            </Link>
            <Link to="/profile" className="os-btn-secondary">
              <User size={14} /> View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="os-page">
      <div className={`os-container ${visible ? 'os-visible' : ''}`}>

        {/* --- Header --- */}
        <div className="os-header">
          <div className="os-check-wrap">
            <CheckCircle size={72} className="os-check-icon" strokeWidth={1.5} />
          </div>
          <div className="os-badge">CONFIRMED</div>
          <h1>Thank You for Your Purchase!</h1>
          <p className="os-subtitle">
            Your order has been received and is being prepared with care.
          </p>
          <p className="os-order-id">
            Order Reference: <strong>#{order._id?.substring(0, 10).toUpperCase()}</strong>
          </p>
        </div>

        {/* --- Divider --- */}
        <div className="os-divider" />

        {/* --- Order Items --- */}
        <div className="os-section">
          <div className="os-section-title">
            <Package size={18} />
            <span>Items Ordered</span>
          </div>

          <div className="os-items-list">
            {order.products?.map((item, idx) => (
              <div className="os-item" key={idx}>
                <div className="os-item-left">
                  <div className="os-item-dot" />
                  <div className="os-item-info">
                    <p className="os-item-name">{item.name || `Product ${idx + 1}`}</p>
                    {item.variant?.ml && (
                      <p className="os-item-variant">
                        {item.variant.ml} Edition
                      </p>
                    )}
                  </div>
                </div>
                <div className="os-item-right">
                  <span className="os-item-qty">×{item.quantity}</span>
                  <span className="os-item-price">{formatINR.format(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="os-total-row">
            <span>Total Paid</span>
            <span className="os-total-amount">{formatINR.format(order.totalAmount)}</span>
          </div>
        </div>

        {/* --- Divider --- */}
        <div className="os-divider" />

        {/* --- Shipping --- */}
        {order.shippingAddress?.street && (
          <div className="os-section">
            <div className="os-section-title">
              <MapPin size={18} />
              <span>Shipping Address</span>
            </div>
            <div className="os-address">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                {order.shippingAddress.zipCode && ` – ${order.shippingAddress.zipCode}`}
              </p>
              {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
            </div>
          </div>
        )}

        {/* --- Status chip --- */}
        <div className="os-status-row">
          <span className="os-status-chip">
            <span className="os-status-dot" />
            {order.status || 'Pending'}
          </span>
          <span className="os-payment-method">
            Paid via {order.paymentMethod === 'razorpay' ? 'Razorpay' : order.paymentMethod}
          </span>
        </div>

        {/* --- Divider --- */}
        <div className="os-divider" />

        {/* --- Actions --- */}
        <div className="os-actions">
          <Link to="/products" className="os-btn-primary">
            Continue Shopping <ArrowRight size={16} />
          </Link>
          <Link to="/profile" className="os-btn-secondary">
            <User size={14} /> My Orders
          </Link>
        </div>

        <p className="os-footer-note">
          A confirmation has been saved to your account. For any queries, contact HEEDY support.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
