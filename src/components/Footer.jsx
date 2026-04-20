import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Mail, Phone, Heart, ArrowRight } from 'lucide-react';
import './Footer.css'; // kept for any global resets if needed, but styling is moved to Tailwind

const Footer = () => {
  const colAnimation = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <footer className="bg-gradient-to-b from-white via-blue-100/50 to-blue-50/40 pt-24 pb-12 mt-14 border-t-2 border-blue-100 font-sans">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 sm:gap-14 lg:gap-12 mb-16 text-left">
          
          {/* Brand Info */}
          <motion.div className="flex flex-col items-start sm:col-span-2 lg:col-span-1" {...colAnimation(0)}>
             <img src="./logo/footer.png" alt="Logo" className="w-[190px] sm:w-[220px] lg:w-[210px] h-auto object-contain mb-7" />
            <p className="text-slate-700 leading-8 mb-8 text-[1rem] sm:text-[1.05rem] pr-0 max-w-md">
              Redefining high-end beauty. Our carefully curated collections are designed to elevate your everyday routines to extraordinary premium experiences.
            </p>
            <div className="flex justify-start gap-3 sm:gap-3.5">
              {[
                { icon: <Facebook size={18} />, label: 'Facebook' },
                { icon: <Instagram size={18} />, label: 'Instagram' },
                { icon: <Twitter size={18} />, label: 'Twitter' },
                { icon: <Youtube size={18} />, label: 'Youtube' },
              ].map((s) => (
                <motion.a
                  key={s.label}
                  href="#"
                  className="w-11 h-11 rounded-full border border-blue-200 bg-white flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all duration-300 shadow-sm"
                  aria-label={s.label}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="flex flex-col items-start md:pl-8" {...colAnimation(0.1)}>
            <h4 className="text-slate-900 font-extrabold uppercase tracking-[0.18em] text-[0.95rem] sm:text-[1rem] mb-8 relative inline-block">
              Shop Collections
              <span className="absolute -bottom-3 left-0 w-8 h-1 bg-blue-600 rounded-full"></span>
            </h4>
            <ul className="space-y-5">
              {[
                { name: 'Skin Care Essentials', path: '/products?category=Skincare' },
                { name: 'Elite Face Care', path: '/products?category=Face' },
                { name: 'Luxe Lips', path: '/products?category=Lips' },
                { name: 'Radiant Eyes', path: '/products?category=Eyes' },
                { name: 'All Products', path: '/products' }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path} className="text-slate-700 hover:text-blue-700 text-[1rem] sm:text-[1.04rem] leading-7 flex items-center group transition-all font-medium">
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300 text-blue-600" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div className="flex flex-col items-start md:pl-4" {...colAnimation(0.2)}>
             <h4 className="text-slate-900 font-extrabold uppercase tracking-[0.18em] text-[0.95rem] sm:text-[1rem] mb-8 relative inline-block">
              Client Care
              <span className="absolute -bottom-3 left-0 w-8 h-1 bg-blue-600 rounded-full"></span>
            </h4>
            <ul className="space-y-5">
              {['Contact Us', 'Shipping Info', 'Returns & Exchanges', 'FAQ', 'About Us'].map((item, idx) => (
                <li key={idx}>
                  <Link to={`/${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="text-slate-700 hover:text-blue-700 text-[1rem] sm:text-[1.04rem] leading-7 flex items-center group transition-all font-medium">
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 mr-2 transition-all duration-300 text-blue-600" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div className="flex flex-col items-start sm:col-span-2 lg:col-span-1" {...colAnimation(0.3)}>
             <h4 className="text-slate-900 font-extrabold uppercase tracking-[0.18em] text-[0.95rem] sm:text-[1rem] mb-8 relative inline-block">
              Get In Touch
              <span className="absolute -bottom-3 left-0 w-8 h-1 bg-blue-600 rounded-full"></span>
            </h4>
            <ul className="space-y-7 w-full">
              <li className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="block text-[0.72rem] font-bold text-slate-500 uppercase tracking-[0.14em] mb-1.5">Visit Us</span>
                  <span className="text-[1rem] text-slate-800 font-semibold leading-7">Heedy Sajin Land, Kadkkavoor 
<br/>Thiruvanathapuram, Kerala</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="block text-[0.72rem] font-bold text-slate-500 uppercase tracking-[0.14em] mb-1.5">Call Us</span>
                  <span className="text-[1rem] text-slate-800 font-semibold">+91 9074881551</span>
                </div>
              </li>
               <li className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="block text-[0.72rem] font-bold text-slate-500 uppercase tracking-[0.14em] mb-1.5">Email directly</span>
                  <span className="text-[1rem] text-slate-800 font-semibold break-all">infoheedy@gmail.com</span>
                </div>
              </li>
            </ul>
          </motion.div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-9 border-t border-blue-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-600 text-[0.95rem] font-medium flex items-center gap-1.5 text-center md:text-left">
            &copy; {new Date().getFullYear()} Our Brand. Crafted with <Heart size={14} className="text-blue-600 fill-blue-600 animate-pulse mx-0.5" /> for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[0.95rem] font-medium text-slate-600">
            <a href="#" className="hover:text-blue-700 transition-colors">Privacy Policy</a>
            <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
            <a href="#" className="hover:text-blue-700 transition-colors">Terms of Service</a>
            <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
            <a href="#" className="hover:text-blue-700 transition-colors">Cookie Settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
