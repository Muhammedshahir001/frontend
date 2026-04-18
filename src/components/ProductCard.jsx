import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star } from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import toast from 'react-hot-toast';

// Indian Rupee Formatter
const IndianRupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { userInfo } = useSelector((state) => state.auth);

  const productId = product._id || product.id;
  const productLink = `/product/${productId}`;
  
  // Ensure we always have multiple images to demonstrate the hover effect robustly
  const images = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length >= 2) {
      return product.images;
    } else if (Array.isArray(product.images) && product.images.length === 1) {
      // Provide a high-quality secondary image for the hover effect if only 1 exists
      return [product.images[0], 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=600&q=80'];
    }
    // Deep fallback
    return [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&w=600&q=80'
    ];
  }, [product.images]);

  const hoverImageIndex = images.length > 1 ? 1 : 0;
  const rating = Number(product.rating || 5);
  const reviews = product.reviewsCount || 0;
  
  const currentPrice = product.variants && product.variants.length > 0 
    ? (product.variants[0].offerPrice || product.variants[0].actualPrice)
    : product.price;

  const actualPrice = product.variants && product.variants.length > 0 
    ? product.variants[0].actualPrice 
    : (product.oldPrice || Math.floor(product.price * 1.5));

  const hasOffer = product.variants && product.variants.length > 0 && product.variants[0].offerPrice;

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!userInfo) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    dispatch(
      addToCart({
        product: productId,
        name: product.name,
        price: currentPrice,
        image: images[activeImageIndex] || images[0],
        variant:
          product.variants && product.variants.length > 0
            ? { ml: product.variants[0].ml, price: currentPrice }
            : { ml: 'Standard', price: currentPrice },
        qty: 1,
      })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Added to bag');
      } else {
        toast.error(result.payload || 'Failed to add to bag');
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white flex flex-col h-full rounded-[20px] md:rounded-[24px] overflow-hidden border border-slate-100 transition-all duration-500 ease-in-out hover:-translate-y-2 md:hover:-translate-y-3 hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.12)] md:hover:shadow-[0_30px_60px_-15px_rgba(15,23,42,0.15)] relative shadow-[0_8px_20px_-8px_rgba(0,0,0,0.06)] md:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] w-full max-w-[340px] md:max-w-[480px] mx-auto"
      onMouseEnter={() => {
        setActiveImageIndex(hoverImageIndex);
      }}
      onMouseLeave={() => {
        setActiveImageIndex(0);
      }}
    >
      {/* Premium Badge - Top Right */}
      {product.badge && (
        <div className="absolute top-5 right-5 z-20 bg-[#0f172a] text-white text-[12px] font-black px-5 py-2.5 uppercase tracking-widest rounded-full shadow-xl">
          {product.badge}
        </div>
      )}

      {/* Image Container with Hover Swap */}
      <Link
        to={productLink}
        className="relative aspect-[4/5.5] overflow-hidden bg-[#f8fbff] block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        {images.map((image, index) => (
          <img
            key={`${productId}-${index}`}
            src={image}
            alt={`${product.name} ${index + 1}`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
              index === activeImageIndex ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 scale-105'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/20 via-transparent to-[#2563eb]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {images.slice(0, 4).map((_, index) => (
            <button
              key={`${productId}-dot-${index}`}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setActiveImageIndex(index);
              }}
              className={`w-2.5 h-2.5 rounded-full border border-white/70 transition-all ${
                activeImageIndex === index ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Show image ${index + 1}`}
            />
          ))}
        </div>
      </Link>

      {/* Product Information Area matching Screenshot */}
      <div className="p-5 md:p-8 flex flex-col flex-grow items-center text-center">
        
        {/* Rating Stars - screenshot style */}
        <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-5">
          <div className="flex gap-1 md:gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`md:size-[18px] ${
                  i < Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[12px] md:text-[16px] text-slate-400 font-bold">
            ({reviews})
          </span>
        </div>

        {/* Product Name - extremely large and readable */}
        <Link to={productLink} className="block w-full">
          <h3 className="text-[17px] md:text-[24px] font-black text-[#0f172a] mb-4 md:mb-5 leading-tight min-h-[50px] md:min-h-[60px] hover:text-blue-700 transition-colors px-1 md:px-2">
            {product.name}
          </h3>
        </Link>

        {/* Pricing Area */}
        <div className="mt-auto w-full pt-1 md:pt-2">
          <div className="flex items-baseline justify-center gap-3 md:gap-4 mb-2 md:mb-4">
            <span className="text-[24px] md:text-[38px] font-black text-[#0f172a] tracking-tight">
              {IndianRupee.format(currentPrice)}
            </span>
            {hasOffer && (
              <span className="text-[14px] md:text-[21px] font-bold text-slate-400 line-through">
                {IndianRupee.format(actualPrice)}
              </span>
            )}
          </div>

          {/* Screenshot style offer tags */}
          <div className="min-h-[50px] md:min-h-[60px] flex flex-col items-center justify-center gap-1.5 md:gap-2">
            <p className="text-[11px] md:text-[14px] font-black text-[#dc2626] uppercase tracking-[0.05em] md:tracking-[0.1em]">
              {product.offer || 'EXCLUSIVE DEAL'}
            </p>
            <p className="text-[12px] md:text-[14px] text-slate-500 font-semibold">
              {product.features || ''}
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER ACTION - Solid Dark Navy Pill Button (Huge) */}
      <div className="px-5 md:px-8 pb-6 md:pb-9 mt-auto">
        <button
          onClick={handleAddToCart}
          className="w-full bg-[#0f172a] text-white py-[14px] md:py-[20px] rounded-full text-[12px] md:text-[16px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all duration-300 ease-in-out hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-blue-700/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;