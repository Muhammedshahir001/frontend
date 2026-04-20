import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Shop.css';

// Indian Rupee Formatter
const IndianRupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

// Price graph data for visual display
const priceGraphBins = [10, 15, 25, 45, 80, 100, 75, 40, 30, 50, 20, 15, 10, 5, 8, 12, 10, 5, 2, 0];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const absoluteMin = 0;
  const absoluteMax = 50000;
  const priceStep = 100;
  
  const [minPrice, setMinPrice] = useState(absoluteMin);
  const [maxPrice, setMaxPrice] = useState(absoluteMax);
  
  // Local state for the price filter inputs before 'Apply' is clicked
  const [localMinPrice, setLocalMinPrice] = useState(absoluteMin);
  const [localMaxPrice, setLocalMaxPrice] = useState(absoluteMax);
  
  const clampPrice = (value) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return absoluteMin;
    return Math.min(absoluteMax, Math.max(absoluteMin, numericValue));
  };

  useEffect(() => {
    const incomingCategory = searchParams.get('category');
    if (incomingCategory) {
      setCategoryFilter(incomingCategory);
    }
    const incomingSearch = searchParams.get('search');
    if (incomingSearch) {
      setSearchQuery(incomingSearch);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: prodData } = await axios.get('/api/products');
        setProducts(Array.isArray(prodData) ? prodData : []);
        
        const { data: catData } = await axios.get('/api/categories');
        setCategories(Array.isArray(catData) ? catData.filter(c => c.isActive) : []);
      } catch (error) {
        console.error('Failed to fetch store data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const applyPriceFilter = () => {
    const safeMin = clampPrice(localMinPrice);
    const safeMax = clampPrice(localMaxPrice);
    const nextMin = Math.min(safeMin, safeMax);
    const nextMax = Math.max(safeMin, safeMax);

    setLocalMinPrice(nextMin);
    setLocalMaxPrice(nextMax);
    setMinPrice(nextMin);
    setMaxPrice(nextMax);
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setSearchQuery('');
    setMinPrice(absoluteMin);
    setMaxPrice(absoluteMax);
    setLocalMinPrice(absoluteMin);
    setLocalMaxPrice(absoluteMax);
    // Also clear URL params
    navigate('/products');
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => {
    if (!p) return false;
    const productPrice = Number(p.price) || 0;
    const catName = p.category?.name || p.category;
    const matchCategory = categoryFilter ? catName === categoryFilter : true;
    const matchPrice = productPrice >= minPrice && productPrice <= maxPrice;
    const matchSearch = searchQuery 
      ? (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchCategory && matchPrice && matchSearch;
  }) : [];

  const visibleProducts = filteredProducts;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        {/* Local fallback loader if global one is hidden */}
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="shop-page bg-slate-50 min-h-screen font-sans pt-[80px]">
      {/* Main Shop Container */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 py-4 md:py-8 flex flex-col xl:flex-row gap-8 lg:gap-12 min-h-0">
        
        {/* Mobile Filter Toggle */}
        <div className="xl:hidden mb-2 sticky top-[80px] z-[100] bg-slate-50/80 backdrop-blur-md py-2">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-full bg-white border border-slate-200 py-4 px-6 rounded-2xl flex items-center justify-between font-bold text-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="2" x2="6" y1="14" y2="14"></line><line x1="10" x2="14" y1="8" y2="8"></line><line x1="18" x2="22" y1="16" y2="16"></line></svg>
              <span>Filter & Sort</span>
            </div>
            {categoryFilter && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">{categoryFilter}</span>}
          </button>
        </div>

        {/* Sidebar Overlay for Mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-[2000] xl:hidden backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar - Filters */}
        <aside className={`fixed xl:sticky top-0 xl:top-[100px] left-0 h-full xl:h-[calc(100vh-120px)] w-[85%] sm:w-[360px] xl:w-[320px] 2xl:w-[350px] bg-white z-[2001] xl:z-auto transition-transform duration-500 xl:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} xl:rounded-[24px] border-r xl:border border-slate-100 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.06)] overflow-y-auto custom-scrollbar`}>
          <div className="p-6 md:p-8">
             <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
               <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-widest">Filters</h2>
               <div className="flex items-center gap-4">
                 <button 
                   onClick={resetFilters}
                   className="text-xs md:text-sm uppercase tracking-widest font-bold text-blue-600 hover:text-blue-800 transition-colors"
                 >
                   Clear
                 </button>
                 <button className="xl:hidden" onClick={() => setIsSidebarOpen(false)}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
               </div>
             </div>
             
             {/* Category Filter */}
             <div className="mb-10">
                <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Shop By Category</h3>
                <div className="flex flex-col gap-2.5">
                   <button 
                     onClick={() => setCategoryFilter('')}
                     className={`text-left px-5 py-3.5 rounded-[14px] text-base font-bold transition-all duration-300 ${categoryFilter === '' ? 'bg-[#111827] text-white shadow-lg shadow-slate-900/20' : 'bg-[#f4f6fa] text-slate-600 hover:bg-blue-50 hover:text-blue-800'}`}
                   >
                     All Categories
                   </button>
                   {categories.map((c, i) => (
                     <button 
                       key={c._id || c.id || i}
                       onClick={() => setCategoryFilter(c.name)}
                       className={`text-left px-5 py-3.5 rounded-[14px] text-base font-bold transition-all duration-300 ${categoryFilter === c.name ? 'bg-[#111827] text-white shadow-lg shadow-slate-900/20' : 'bg-[#f4f6fa] text-slate-600 hover:bg-blue-50 hover:text-blue-800'}`}
                     >
                       {c.name}
                     </button>
                   ))}
                </div>
             </div>

             {/* Price Filter with Graphic Graph Line */}
             <div>
                <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Price Range</h3>
                <div className="pt-2">
                  
                  {/* Graph visual */}
                  <div className="relative pt-6 pb-2">
                    <div className="price-graph-container absolute bottom-4 left-2 right-2 z-0 pointer-events-none">
                      {priceGraphBins.map((height, idx) => {
                        const binPercent = (idx / 20) * 100;
                        const minPercent = (localMinPrice / absoluteMax) * 100;
                        const maxPercent = (localMaxPrice / absoluteMax) * 100;
                        const isActive = binPercent >= minPercent && binPercent <= maxPercent;
                        return (
                          <div 
                            key={idx} 
                            className={`price-graph-bar ${isActive ? 'active' : ''}`}
                            style={{ height: `${Math.max(8, height)}%` }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Dual Range Track */}
                    <div className="relative z-10 mx-3 h-2 bg-slate-200 rounded-full flex items-center">
                      <div 
                        className="absolute h-full bg-blue-600 rounded-full pointer-events-none" 
                        style={{ 
                          left: `${(localMinPrice / absoluteMax) * 100}%`, 
                          right: `${100 - (localMaxPrice / absoluteMax) * 100}%` 
                        }}
                      ></div>
                      
                      <input
                        type="range"
                        min={absoluteMin}
                        max={absoluteMax}
                        step={priceStep}
                        value={localMinPrice}
                        onChange={(e) => setLocalMinPrice(Math.min(clampPrice(e.target.value), localMaxPrice))}
                        className="absolute w-full appearance-none pointer-events-none bg-transparent dual-range"
                      />
                      <input
                        type="range"
                        min={absoluteMin}
                        max={absoluteMax}
                        step={priceStep}
                        value={localMaxPrice}
                        onChange={(e) => setLocalMaxPrice(Math.max(clampPrice(e.target.value), localMinPrice))}
                        className="absolute w-full appearance-none pointer-events-none bg-transparent dual-range"
                      />
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="flex items-center gap-3 mt-8 mb-6">
                    <div className="flex-1 bg-[#f4f6fa] border border-slate-200 rounded-[12px] p-2.5 px-4 shadow-inner">
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Min (₹)</label>
                      <input 
                        type="number" 
                        value={localMinPrice} 
                        min={absoluteMin}
                        max={absoluteMax}
                        step={priceStep}
                        onChange={(e) => setLocalMinPrice(Math.min(clampPrice(e.target.value), localMaxPrice))}
                        className="w-full border-none bg-transparent text-lg font-black text-[#111827] focus:outline-none"
                      />
                    </div>
                    <div className="text-slate-300 font-bold text-lg">-</div>
                    <div className="flex-1 bg-[#f4f6fa] border border-slate-200 rounded-[12px] p-2.5 px-4 shadow-inner">
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Max (₹)</label>
                      <input 
                        type="number" 
                        value={localMaxPrice} 
                        min={absoluteMin}
                        max={absoluteMax}
                        step={priceStep}
                        onChange={(e) => setLocalMaxPrice(Math.max(clampPrice(e.target.value), localMinPrice))}
                        className="w-full border-none bg-transparent text-lg font-black text-[#111827] focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={applyPriceFilter}
                    className="w-full bg-[#111827] text-white py-4 rounded-[14px] text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
                  >
                    Apply Filter
                  </button>
                </div>
             </div>
          </div>
        </aside>

        {/* Right Section - Products */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
           {/* Premium Header Banner moved here for alignment */}
           <section className="shop-banner relative flex items-center justify-center overflow-hidden bg-[#111827] rounded-[24px] shadow-sm">
             <div className="absolute inset-0 z-0">
               <img 
                 src="https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=2080&auto=format&fit=crop" 
                 alt="Shop Our Collection" 
                 className="w-full h-full object-cover opacity-60"
               />
               <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
             </div>
             <div className="relative z-10 text-center px-4 py-12 md:py-16 flex flex-col items-center justify-center">
               <motion.span 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6 }}
                 className="block text-blue-300 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-3 drop-shadow-md"
               >
                 Curated For You
               </motion.span>
               <motion.h1 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.1 }}
                 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-1 drop-shadow-2xl font-bold"
               >
                 Our Collection
               </motion.h1>
             </div>
           </section>

           <div className="bg-white rounded-[20px] p-4 md:px-6 md:py-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
             <p className="text-base md:text-lg text-slate-600 font-medium">
               Showing
               <span className="font-extrabold text-[#111827] text-xl mx-1.5">{visibleProducts.length}</span>
               of
               <span className="font-extrabold text-[#111827] text-xl mx-1.5">{filteredProducts.length}</span>
               Products
             </p>
            {categoryFilter && (
               <div className="flex items-center gap-3 text-base bg-[#111827] px-6 py-3 rounded-full text-white font-bold shadow-md">
                 <span>{categoryFilter}</span>
                 <button onClick={() => setCategoryFilter('')} className="ml-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                    &times;
                 </button>
               </div>
            )}
          </div>

          {/* Enhanced Grid - 2 per row for larger cards on laptops/MacBooks, 3 on ultra-wide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-8 sm:gap-10 lg:gap-14">
            {visibleProducts.map((product, i) => (
               <ProductCard key={product._id || product.id || i} product={product} />
            ))}
          </div>

          {visibleProducts.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[24px] border border-slate-100 mt-6 shadow-sm">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl">
                <i className="fi fi-rr-search"></i>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#111827] mb-4">No products found</h3>
              <p className="text-slate-500 text-base max-w-md mx-auto mb-8">We couldn't find anything matching your current filters. Try expanding your search or clearing the filters.</p>
              <button 
                onClick={resetFilters}
                className="px-8 py-3.5 bg-blue-600 text-white rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[#111827] transition-all shadow-lg hover:shadow-xl"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
