import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Heart, ShoppingBag, ChevronRight, Droplets, Shield, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import './ProductDetail.css';

// Indian Rupee Formatter
const IndianRupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

// Animations
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// Dummy High Quality Fallback Images
const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
];

  const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const [activeImage, setActiveImage] = useState(FALLBACK_GALLERY[0]);
  const [isAdded, setIsAdded] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);

  const currentPrice = product?.variants && product.variants.length > 0 
    ? (product.variants[selectedVariant]?.offerPrice || product.variants[selectedVariant]?.actualPrice)
    : product?.price;

  const currentActualPrice = product?.variants && product.variants.length > 0
    ? product.variants[selectedVariant]?.actualPrice
    : null;

  const hasOffer = product?.variants && product.variants.length > 0 && product.variants[selectedVariant]?.offerPrice;

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        const { data: currentProduct } = await axios.get(`/api/products/${id}`);
        setProduct(currentProduct);
        if (currentProduct && currentProduct.images && currentProduct.images.length > 0) {
          setActiveImage(currentProduct.images[0]);
        } else {
          setActiveImage(FALLBACK_GALLERY[0]);
        }

        const { data: allProducts } = await axios.get('/api/products');
        const related = allProducts.filter(p => String(p._id) !== String(id)).slice(0, 4);
        setRelatedProducts(related);
      } catch (error) {
        console.error('Failed to fetch product data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();
    window.scrollTo(0, 0);
  }, [id]);

  const handleMouseMove = (e) => {
    // Disable zoom effect on touch devices to avoid layout issues
    if (window.innerWidth <= 1024) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      left: `${e.clientX - left}px`,
      top: `${e.clientY - top}px`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${activeImage})`,
      backgroundSize: '250%' // massive zoom feature
    });
  };

  const handleAddToCart = () => {
    if (!userInfo) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    dispatch(addToCart({ 
      product: product._id || product.id, 
      name: product.name,
      price: currentPrice,
      image: activeImage,
      variant: product.variants && product.variants.length > 0 
        ? { 
            ml: product.variants[selectedVariant].ml, 
            price: currentPrice 
          } 
        : { ml: 'Standard', price: currentPrice },
      qty 
    })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Added to bag');
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      } else {
        toast.error(result.payload || 'Failed to add to bag');
      }
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-2xl px-6">
        <div className="relative w-full aspect-[4/4.5] rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/50">
          <img
            src={activeImage}
            alt="Loading product..."
            className="w-full h-full object-cover"
            onLoad={(e) => e.target.classList.remove('opacity-0')}
            style={{ transition: 'opacity 0.3s ease' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60"></div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-600 font-bold text-lg uppercase tracking-widest animate-pulse">
            Loading Product Details...
          </span>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-blue-600 font-bold text-3xl uppercase tracking-widest animate-pulse">
      Product Not Found
    </div>
  );

  const imagesToMap = (product.images && product.images.length > 0) ? product.images : FALLBACK_GALLERY;
  const productOffer = product.offer || 'LIMITED TIME OFFER';

  return (
    <div className="product-detail-page bg-white min-h-screen overflow-x-hidden pt-[100px] md:pt-[180px] font-sans text-slate-800">
      
      {/* Breadcrumbs Navigation */}
      <div className="w-full max-w-[1700px] mx-auto px-4 md:px-12 pt-4 pb-8">
        <nav className="flex items-center text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-400">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-1.5 md:mx-4 opacity-50" />
          <Link to="/products" className="hover:text-blue-600 transition-colors">Shop</Link>
          <ChevronRight size={14} className="mx-1.5 md:mx-4 opacity-50" />
          <span className="text-blue-600 line-clamp-1">{product.name}</span>
        </nav>
      </div>

      <div className="pd-container w-full max-w-[1700px] mx-auto px-4 md:px-12 flex flex-col lg:flex-row gap-8 lg:gap-20 pb-20">
        
        {/* Product Image Gallery Wrapper */}
        <div className="pd-image-section w-full lg:w-[55%] flex flex-col gap-6">
          <div 
            className="main-image-container relative bg-[#f4f6fa] rounded-[32px] overflow-hidden aspect-[4/4.5] shadow-[0_20px_60px_-15px_rgba(37,99,235,0.1)] cursor-zoom-in border border-blue-50"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomStyle({ display: 'none' })}
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </AnimatePresence>
            <div className="magnifier shadow-2xl rounded-full border-4 border-white" style={zoomStyle}></div>
            
            {/* Hover instruction tag */}
            <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 font-bold text-[10px] uppercase tracking-widest text-blue-800 border border-white rounded-full shadow-sm hidden md:block">
              Hover to Zoom
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide py-2">
            {imagesToMap.map((imgUrl, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(imgUrl)}
                className={`flex-shrink-0 w-24 h-32 md:w-28 md:h-36 rounded-[16px] overflow-hidden border-2 transition-all duration-300 ${activeImage === imgUrl ? 'border-blue-600 shadow-xl transform -translate-y-2' : 'border-transparent hover:border-blue-300 opacity-60 hover:opacity-100 shadow-md transform hover:-translate-y-1'}`}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info Section (Animated) */}
        <motion.div 
          className="pd-info-section w-full lg:w-[45%] flex flex-col justify-start lg:pt-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={fadeUp} className="text-blue-600 text-[12px] md:text-[14px] font-black uppercase tracking-[0.3em] mb-4 md:mb-6 block bg-blue-50 w-max px-4 py-1.5 rounded-full">
            {product.category?.name || product.category || 'Premium Collection'}
          </motion.span>

          {/* Rating Stars */}
          <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={
                    i < Math.floor(product.rating || 5)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }
                />
              ))}
            </div>
            <span className="text-sm text-slate-400 font-bold">
              ({product.reviewsCount || 0} reviews)
            </span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-[#0f172a] mb-6 leading-[1.1] tracking-tight">
            {product.name}
          </motion.h1>
          
          {/* Prices & Offers */}
          <motion.div variants={fadeUp} className="mb-6 md:mb-8 border-b border-blue-50 pb-6 md:pb-8 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="text-3xl md:text-5xl font-extrabold text-blue-600">
                {IndianRupee.format(currentPrice)}
              </span>
              {hasOffer && (
                <span className="text-lg md:text-2xl font-bold text-slate-300 line-through">
                  {IndianRupee.format(currentActualPrice)}
                </span>
              )}
            </div>
            {/* Offer Tag */}
            <div className="flex items-center gap-2">
               <span className="bg-red-50 text-red-600 font-extrabold px-3 py-1 text-[10px] md:text-sm uppercase tracking-widest rounded-md border border-red-100">
                 {productOffer}
               </span>
               <span className="text-slate-500 font-bold text-[11px] md:text-sm">Inclusive of all taxes</span>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p variants={fadeUp} className="text-slate-500 text-sm md:text-lg leading-relaxed mb-8 md:mb-10 max-w-2xl font-medium">
            {product.description || "A technologically advanced formula designed to revitalize and protect. Experience clinical efficacy wrapped in a highly sensory, lightweight texture. Suitable for all skin types, crafted for daily premium use."}
          </motion.p>
          
          {/* Variants */}
          <motion.div variants={fadeUp} className="mb-8 md:mb-10">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h4 className="text-xs md:text-[14px] font-black uppercase tracking-widest text-slate-900">
                Select Size
              </h4>
              <span className="text-blue-600 text-[10px] md:text-xs font-bold underline cursor-pointer hover:text-blue-800">Size Guide</span>
            </div>
            <div className="flex gap-3 md:gap-4 flex-wrap">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((v, i) => (
                  <button 
                    key={v._id || i} 
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-[12px] md:rounded-[16px] text-xs md:text-base font-black uppercase tracking-widest transition-all duration-300 border-2 ${selectedVariant === i ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/30 transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'}`}
                    onClick={() => setSelectedVariant(i)}
                  >
                    {v.ml}
                  </button>
                ))
              ) : (
                <button className="px-6 md:px-8 py-3 md:py-4 rounded-[12px] md:rounded-[16px] text-xs md:text-base font-black uppercase tracking-widest bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/30">
                  Standard
                </button>
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={fadeUp} className="flex flex-col gap-4 pt-6 border-t border-blue-50">
            
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between border-2 border-slate-200 bg-slate-50 rounded-2xl px-4 w-[140px] md:w-[180px] h-[56px] md:h-[70px]">
                <button className="text-slate-400 hover:text-blue-600 text-xl md:text-2xl font-bold transition-colors p-2" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="text-base md:text-xl font-black text-slate-900">{qty}</span>
                <button className="text-slate-400 hover:text-blue-600 text-xl md:text-2xl font-bold transition-colors p-2" onClick={() => setQty(qty + 1)}>+</button>
              </div>

              {/* Wishlist Button */}
              <button className="w-[56px] md:h-[70px] md:w-[70px] h-[56px] bg-white border-2 border-slate-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50 rounded-2xl flex flex-shrink-0 items-center justify-center text-slate-400 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/20 hover:-translate-y-1">
                <Heart size={24} />
              </button>
            </div>
            
            {/* Add to Cart Premium Button */}
            <button 
              className={`w-full h-[60px] md:h-[70px] rounded-2xl flex items-center justify-center gap-3 text-sm md:text-[16px] font-black uppercase tracking-widest transition-all duration-300 overflow-hidden relative shadow-2xl ${isAdded ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:-translate-y-1'}`} 
              onClick={handleAddToCart}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.div key="added" initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:-20, opacity:0}} className="flex items-center gap-3">
                    <CheckCircle2 size={24} /> Added to Cart
                  </motion.div>
                ) : (
                  <motion.div key="add" initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:-20, opacity:0}} className="flex items-center gap-3">
                    <ShoppingBag size={22} /> Add To Cart
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Benefits Section */}
      <section className="bg-[#f0f4f8] py-20 md:py-32 border-y border-blue-100">
        <div className="w-full max-w-[1700px] mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
             <span className="text-blue-600 text-[12px] md:text-[14px] font-black uppercase tracking-widest mb-4 block">Proven Efficacy</span>
             <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">The Formulation Promise</h3>
             <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="flex flex-col items-center text-center group cursor-default">
              <div className="w-24 h-24 rounded-[24px] bg-white shadow-2xl shadow-blue-900/5 flex items-center justify-center text-blue-600 mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 border border-blue-50">
                <Droplets size={40} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-4">Deep Hydration</h4>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">Formulated with micro-hyaluronic acid to penetrate deeper and lock in moisture for 48 hours.</p>
            </motion.div>
            
            <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay: 0.1}} className="flex flex-col items-center text-center group cursor-default">
              <div className="w-24 h-24 rounded-[24px] bg-white shadow-2xl shadow-blue-900/5 flex items-center justify-center text-blue-600 mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 border border-blue-50">
                <Shield size={40} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-4">Barrier Defense</h4>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">Rich in ceramides and protective antioxidants to shield against environmental aggressors.</p>
            </motion.div>
            
            <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay: 0.2}} className="flex flex-col items-center text-center group cursor-default">
              <div className="w-24 h-24 rounded-[24px] bg-white shadow-2xl shadow-blue-900/5 flex items-center justify-center text-blue-600 mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 border border-blue-50">
                <Sparkles size={40} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-4">Clinical Radiance</h4>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">Dermatologically tested. 94% of users reported significantly improved skin texture and glow within 14 days.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* You May Also Like / Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="bg-white py-24 md:py-32">
          <div className="w-full max-w-[1900px] mx-auto px-6 md:px-12 xl:px-16">
            <div className="flex flex-col items-center mb-20 text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6">
                You May Also Like
              </h2>
              <div className="w-20 h-1.5 bg-blue-600 rounded-full mb-6"></div>
              <p className="text-sm md:text-base uppercase font-black tracking-widest text-slate-400">Curated specifically for you</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
              {relatedProducts.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
export default ProductDetail;
