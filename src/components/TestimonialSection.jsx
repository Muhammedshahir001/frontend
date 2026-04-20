import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import api from '../utils/api';

import 'swiper/css';
import 'swiper/css/pagination';

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await api.get('/api/testimonials');
        setTestimonials(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch testimonials', error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #001F54 0%, #000F29 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #001F54 0%, #000F29 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-blue-400 text-[10px] font-extrabold uppercase tracking-[0.5em] block mb-4"
            >
              Clientele Voices
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-serif text-white">Voices of Excellence</h2>
          </div>
          <div className="text-center text-white/40 py-12">
            <p>No testimonials yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #001F54 0%, #000F29 100%)' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-blue-400 text-[10px] font-extrabold uppercase tracking-[0.5em] block mb-4"
          >
            Clientele Voices
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-serif text-white">Voices of Excellence</h2>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="testimonial-swiper !pb-16"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={t._id || i}>
              <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl flex flex-col justify-between transition-all duration-500 hover:bg-white/10 hover:border-white/20">

                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < (t.rating || 5)
                              ? 'fill-blue-400 text-blue-400'
                              : 'fill-white/20 text-white/20'
                          }
                        />
                      ))}
                    </div>
                    <Quote size={32} className="text-white/10" />
                  </div>

                  <p className="text-white/80 text-lg md:text-xl font-serif italic leading-relaxed mb-8">
                    "{t.reviewMessage}"
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                  {t.profileImage ? (
                    <img
                      src={t.profileImage}
                      alt={t.clientName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-xs">
                      {t.clientName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h5 className="text-white font-bold text-sm uppercase tracking-widest">{t.clientName}</h5>
                    <span className="text-blue-400/60 text-[10px] uppercase font-bold">{t.role || 'Verified Buyer'}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .testimonial-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.2) !important;
          width: 10px;
          height: 10px;
          opacity: 1;
        }
        .testimonial-swiper .swiper-pagination-bullet-active {
          background: #3b82f6 !important;
          width: 30px;
          border-radius: 5px;
        }
      `}</style>
    </section>
  );
};

export default TestimonialSection;