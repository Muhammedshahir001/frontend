import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Eleanor R.",
      role: "Verified Buyer",
      text: "The most exquisite sunscreen I have ever used. Unbelievably lightweight and invisible on my skin tone. A true luxury staple.",
      rating: 5
    },
    {
      name: "Sophia M.",
      role: "Skincare Enthusiast",
      text: "Finally, a premium SPF that doesn't ruin my makeup base. It leaves a radiant glow without any greasiness. 10/10 recommendation!",
      rating: 5
    },
    {
      name: "Isabella K.",
      role: "Verified Buyer",
      text: "I love the Maison Lumière philosophy. The glass packaging is beautiful, and the formula is clearly backed by serious science.",
      rating: 5
    },
    {
      name: "Marcus V.",
      role: "Daily User",
      text: "Zero white cast and zero irritation. As someone with sensitive skin, this is the only sun protection I trust for daily wear.",
      rating: 5
    }
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #001F54 0%, #000F29 100%)' }}>
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
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

        {/* Auto Slider */}
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
            <SwiperSlide key={i}>
              <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl flex flex-col justify-between transition-all duration-500 hover:bg-white/10 hover:border-white/20">
                
                <div>
                  {/* Stars & Quote Icon */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-blue-400 text-blue-400" />
                      ))}
                    </div>
                    <Quote size={32} className="text-white/10" />
                  </div>

                  <p className="text-white/80 text-lg md:text-xl font-serif italic leading-relaxed mb-8">
                    "{t.text}"
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-xs">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm uppercase tracking-widest">{t.name}</h5>
                    <span className="text-blue-400/60 text-[10px] uppercase font-bold">{t.role}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom Styles for Swiper Pagination */}
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