import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import axios from 'axios';
import TestimonialSection from '../components/TestimonialSection';
import ProductSection from '../components/ProductSection';
import './Home.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
const FadeInWhenVisible = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: catData } = await axios.get('/api/categories');
        const mappedCats = catData.filter(c => c.isActive).map((cat) => ({
          ...cat,
          image: cat.image || '/images/placeholder.jpg'
        }));
        setCategories(mappedCats);

        const { data: prodData } = await axios.get('/api/products');
        setTrendingProducts(prodData.slice(0, 8));
      } catch (error) {
        console.error('Home data fetch error', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-wrapper overflow-x-hidden">
      <HeroSlider />

      {/* Section 1: Categories - Fixed Spacing & Responsive Strip */}
      <section className="relative py-12 md:py-20 bg-white">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-[-10%] w-72 h-72 bg-blue-100 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 right-[-10%] w-96 h-96 bg-blue-50 rounded-full blur-[150px] opacity-40 pointer-events-none"></div>
        
        <div className="max-w-[1440px] mx-auto px-4 md:px-0">
          <FadeInWhenVisible>
            <div className="text-center mb-10 md:mb-16 px-4">
              <span className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-blue-800 mb-3">
                The Curated Selection
              </span>
              <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-4">
                Sensory Categories
              </h2>
              <p className="max-w-xl mx-auto text-slate-500 text-sm md:text-base">
                Explore our world of high-performance luxury cosmetics, where science meets sensory indulgence.
              </p>
            </div>
          </FadeInWhenVisible>
          
          {/* Categories View: Swiper on Mobile, Flex Strip/Grid on Desktop */}
          <div className="px-4 md:px-0">
            {categories.length > 0 ? (
              <>
                {/* Desktop View (Flexible Strip/Grid) */}
                 <div 
                   className="hidden md:grid w-full h-auto min-h-[500px] md:gap-0"
                   style={{ 
                     gridTemplateColumns: categories.length <= 4 
                       ? `repeat(${categories.length}, 1fr)` 
                       : 'repeat(auto-fill, minmax(300px, 1fr))' 
                   }}
                 >
                   {categories.map((cat, idx) => (
                    <Link 
                      key={cat._id || cat.name} 
                      to={`/products?category=${cat.name}`} 
                      className={`relative group overflow-hidden h-[500px] border-white/10 ${
                        categories.length <= 4 
                          ? 'border-r last:border-0' 
                          : 'border'
                      }`}
                    >
                      <motion.img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/30 transition-opacity duration-500 group-hover:bg-black/10"></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                        <h3 className="text-white text-3xl font-serif tracking-wide text-center drop-shadow-lg">
                          {cat.name}
                        </h3>
                        <div className="w-0 h-[1px] bg-white transition-all duration-500 group-hover:w-20 mt-4"></div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Mobile View (Swiper Slider) */}
                <div className="md:hidden w-full h-[400px]">
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={20}
                    slidesPerView={1.2}
                    centeredSlides={true}
                    loop={true}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    className="category-swiper h-full"
                  >
                    {categories.map((cat) => (
                      <SwiperSlide key={cat._id || cat.name} className="h-full">
                        <Link 
                          to={`/products?category=${cat.name}`} 
                          className="relative block w-full h-full overflow-hidden rounded-[32px] shadow-2xl"
                        >
                          <img 
                            src={cat.image} 
                            alt={cat.name} 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                          <div className="absolute inset-x-0 bottom-0 p-8 text-center">
                            <h3 className="text-white text-3xl font-serif mb-2">{cat.name}</h3>
                            <span className="inline-block px-5 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                              Explore Collection
                            </span>
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </>
            ) : (
              <div className="w-full flex justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-medium tracking-widest text-[10px] uppercase">Curating your experience...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop Bottom Labels */}
          <div className="hidden md:flex flex-wrap justify-center gap-x-12 gap-y-4 py-8 border-b border-gray-100">
            {categories.map((cat) => (
              <span key={cat.name} className="text-[11px] uppercase tracking-[0.3em] font-extrabold text-slate-400 hover:text-blue-600 transition-colors cursor-default">
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Trending Arrivals */}
      <ProductSection title="Our Products" products={trendingProducts} />

      {/* Section 3: Summer Offer */}
     <section className="relative py-20 md:py-32 bg-[#001F54] overflow-hidden">
  {/* Abstract background elements for premium feel */}
  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
    <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-400 rounded-full blur-[120px]"></div>
    <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[150px]"></div>
  </div>

  <div className="max-w-7xl mx-auto px-6 relative z-10">
    <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
      
      {/* Image Side with Decorative Border */}
      <div className="w-full lg:w-1/2 relative">
        <div className="absolute -inset-4 border border-blue-400/20 rounded-2xl translate-x-4 translate-y-4 hidden md:block"></div>
        <div className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-2xl shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=1974&auto=format&fit=crop" 
            alt="Scientific Skincare" 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001F54]/60 to-transparent"></div>
        </div>
      </div>

      {/* Content Side */}
      <div className="w-full lg:w-1/2 text-center lg:text-left space-y-8">
        <div className="space-y-4">
          <span className="text-blue-300 text-xs font-bold uppercase tracking-[0.4em]">Our Scientific Heritage</span>
          <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
            Why Choose <span className="italic">Lumière</span>
          </h2>
        </div>
        
        <p className="text-blue-100/70 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
          We combine Alpine botanical purity with advanced dermatological science to create sun protection that feels like a second skin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Swiss Bio-Active</h4>
            <p className="text-blue-200/50 text-xs uppercase leading-loose">Clinically proven to reduce cellular oxidation by 85%.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Ocean Safe</h4>
            <p className="text-blue-200/50 text-xs uppercase leading-loose">100% reef-friendly filters with zero microplastics.</p>
          </div>
        </div>

        <button className="group relative overflow-hidden bg-white text-[#001F54] px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:pr-16 active:scale-95">
          <span className="relative z-10">Discover Our Process</span>
          <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">→</span>
        </button>
      </div>

    </div>
  </div>
</section>

      {/* Section 4: New Arrivals */}
      {/* <ProductSection title="New Arrivals" products={newArrivals} /> */}

      {/* Section 5: Best Sellers */}
      {/* <ProductSection title="Best Sellers" products={bestSellers} /> */}

      {/* Section 6: Why Choose Us (Blue Theme) */}
     {/* Section 7: Key Features - White Premium Gallery */}
{/* Section 7: Key Features - High-End Minimalist Typography */}
<section className="py-16 md:py-24 bg-white overflow-hidden">
  <div className="max-w-[1400px] mx-auto px-6">
    
    {/* Header Section - Clean & Balanced */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
      <div className="max-w-2xl">
        <motion.span 
          initial={{ opacity: 0, tracking: "0.1em" }}
          whileInView={{ opacity: 1, tracking: "0.5em" }}
          className="text-blue-800 text-[10px] font-extrabold uppercase block mb-3"
        >
          Superior Standards
        </motion.span>
        <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-none">
          Advanced Solar Defence
        </h2>
      </div>
      <p className="text-slate-400 text-sm md:text-base max-w-sm border-l border-slate-100 pl-6">
        Every drop is infused with antioxidants to combat photo-aging and environmental stress.
      </p>
    </div>

    {/* Features Grid - No Images, High Interaction */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[
        { 
          num: "01", 
          title: "Micro-Zinc Shield", 
          desc: "Ultra-fine physical blockers for high-strength protection without the heavy texture.",
          tag: "Technology"
        },
        { 
          num: "02", 
          title: "Hydration Lock", 
          desc: "Ceramides and Hyaluronic acid ensure your moisture barrier remains intact during exposure.",
          tag: "Hydration"
        },
        { 
          num: "03", 
          title: "Photo-Stable", 
          desc: "Formulas that don't degrade under UV light, ensuring long-lasting defense all day.",
          tag: "Efficacy"
        },
        { 
          num: "04", 
          title: "Reef Friendly", 
          desc: "Sustainably sourced ingredients that protect your skin and the marine ecosystem.",
          tag: "Ethics"
        }
      ].map((feature, i) => (
        <FadeInWhenVisible key={i} delay={i * 0.1}>
          <motion.div 
            whileHover={{ y: -8 }}
            className="group relative h-full p-8 md:p-10 bg-slate-50/50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)]"
          >
            {/* Animated Index Number */}
            <div className="text-slate-200 group-hover:text-blue-600/20 text-5xl font-serif mb-8 transition-colors duration-500">
              {feature.num}
            </div>

            {/* Content */}
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {feature.tag}
              </span>
              
              <h3 className="text-xl md:text-2xl font-serif text-slate-900 group-hover:translate-x-1 transition-transform">
                {feature.title}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>

            {/* Subtle Bottom Line Animation */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 group-hover:w-full transition-all duration-700 ease-in-out"></div>
          </motion.div>
        </FadeInWhenVisible>
      ))}
    </div>

    {/* Mobile Compact Hint */}
    <div className="mt-12 lg:hidden text-center">
      <p className="text-[10px] text-slate-300 uppercase tracking-widest italic">
        Scroll to explore features
      </p>
    </div>
  </div>
</section>

      {/* Section 5: Testimonials */}
      <TestimonialSection />
    </div>
  );
};

export default Home;