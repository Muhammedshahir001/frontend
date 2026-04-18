import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleWishlistItem } from '../store/wishlistSlice';
import { Trash2 } from 'lucide-react';
import './Wishlist.css';

const Wishlist = () => {
  const dispatch = useDispatch();
  // Using mock state simulation for UI demonstration
  const { wishlistItems } = useSelector(state => state.wishlist);
  
  const mockProducts = [
    { _id: '1', name: 'Luminous Foundation', price: 45, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500' },
    { _id: '2', name: 'Velvet Matte Lipstick', price: 25, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500' }
  ];

  const handleRemove = (id) => {
    dispatch(toggleWishlistItem(id));
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>Your Wishlist</h1>
      </div>
      <div className="wishlist-container">
        {mockProducts.length === 0 ? (
          <p className="empty-message">Your wishlist is bare. Discover something beautiful.</p>
        ) : (
          <div className="wishlist-grid">
            {mockProducts.map(item => (
              <div key={item._id} className="wishlist-card">
                <Link to={`/product/${item._id}`}>
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="wl-info">
                  <Link to={`/product/${item._id}`}><h4>{item.name}</h4></Link>
                  <p>${item.price}</p>
                </div>
                <button className="remove-btn" onClick={() => handleRemove(item._id)}>
                  <Trash2 size={18} /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Wishlist;
