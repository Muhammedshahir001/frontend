import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import api from '../utils/api';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import './HeroSlider.css';

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/banners');
        if (data && data.length > 0) {
          const mappedBanners = data.map(b => ({
            id: b._id,
            image: b.image,
            title: b.title,
            subtitle: b.description,
            cta: 'Shop Now'
          }));
          setSlides(mappedBanners);
        } else {
          setSlides([]);
        }
      } catch (error) {
        console.error('Failed to fetch banners', error);
        setSlides([]);
      } finally {
        setLoading(false);
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

  if (loading) return null; // Or a small loader
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
