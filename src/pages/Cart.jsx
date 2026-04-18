import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { fetchCart, removeFromCart, updateCartQty } from '../store/cartSlice';
import toast from 'react-hot-toast';
import './Cart.css';

const IndianRupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, loading } = useSelector(state => state.cart);
  const { userInfo } = useSelector(state => state.auth);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchCart());
    }
  }, [dispatch, userInfo]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.variant?.price || item.price) * item.qty, 0);
  const getVariantKey = (item) => item.variant?.ml || 'Standard';

  const handleUpdateQty = (item, newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartQty({ 
      product: item.product, 
      variant: item.variant, 
      qty: newQty 
    }));
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({ 
      itemId: item._id, 
      product: item.product, 
      variantKey: getVariantKey(item) 
    }))
      .then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          toast.success('Item removed from bag');
        }
      });
  };

  if (loading && cartItems.length === 0) {
    return <div className="cart-page"><div className="cart-container"><h1>Shopping Bag</h1><p>Loading your bag...</p></div></div>;
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Shopping Bag</h1>

        {cartItems.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '5rem 0' }}>
             <ShoppingBag size={50} strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
             <p style={{ color: '#71717a', marginBottom: '2rem' }}>Your bag is currently empty.</p>
             <Link to="/products" className="checkout-btn" style={{ maxWidth: '250px', margin: '0 auto' }}>
                Discover Products
             </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="items-column">
              <div className="cart-table-header">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span></span>
              </div>

              {cartItems.map((item) => (
                <div className="cart-item" key={`${item.product}-${getVariantKey(item)}`}>
                  <div className="item-main">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <span className="item-variant">{getVariantKey(item)} Edition</span>
                      <Link to={`/product/${item.product}`}>
                        <h3>{item.name}</h3>
                      </Link>
                    </div>
                  </div>

                  <div className="item-price">{IndianRupee.format(item.variant?.price || item.price)}</div>

                  <div className="item-qty">
                    <div className="qty-stepper">
                      <button onClick={() => handleUpdateQty(item, item.qty - 1)}>
                        <Minus size={14} />
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => handleUpdateQty(item, item.qty + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <button className="remove-btn" onClick={() => handleRemove(item)}>
                    <Trash2 size={18} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Details</h3>
              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>{IndianRupee.format(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Standard Delivery</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Complimentary</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{IndianRupee.format(subtotal)}</span>
              </div>
              
              <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Secure Checkout Powered by Stripe</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;