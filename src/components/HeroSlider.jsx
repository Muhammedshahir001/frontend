import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import './HeroSlider.css';

const DEFAULT_SLIDES = [
  { id: 1, image: '/hero/slide1.png', title: 'Luxury Sun Care', subtitle: 'Protect your radiance with golden hour defense.', cta: 'Shop Sunscreen' },
  { id: 2, image: '/hero/slide2.png', title: 'Oceanic Purity', subtitle: 'Mineral protection derived from nature.', cta: 'Discover More' },
  { id: 3, image: '/hero/slide3.png', title: 'Dynamic Hydration', subtitle: 'Sweat-resistant, feather-light, invisible finish.', cta: 'Explore Formula' }
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState(DEFAULT_SLIDES);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await axios.get('/api/banners');
        if (data && data.length > 0) {
          const mappedBanners = data.map(b => ({
            id: b._id,
            image: b.image,
            title: b.title,
            subtitle: b.description,
            cta: 'Shop Now'
          }));
          setSlides(mappedBanners);
        }
      } catch (error) {
        console.error('Failed to fetch banners', error);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

  if (slides.length === 0) return null;

  return (
    <div className="hero-slider">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="slide"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          style={{ backgroundImage: `url(${slides[current].image})` }}
        >
          <div className="slide-overlay">
            <motion.div 
               className="slide-content"
               initial={{ y: 30, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              >
                {slides[current].title}
              </motion.h1>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              >
                {slides[current].subtitle}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              >
                <button className="btn-carved cta-btn">{slides[current].cta}</button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button className="slider-btn prev" onClick={prevSlide}><ChevronLeft size={30}/></button>
      <button className="slider-btn next" onClick={nextSlide}><ChevronRight size={30}/></button>
      
      <div className="slider-dots">
        {slides.map((_, idx) => (
           <div key={idx} className={`dot ${idx === current ? 'active' : ''}`} onClick={() => setCurrent(idx)}></div>
        ))}
      </div>
    </div>
  );
};
export default HeroSlider;
