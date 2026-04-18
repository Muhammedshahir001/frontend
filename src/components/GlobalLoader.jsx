import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './GlobalLoader.css';

const GlobalLoader = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800); 
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const containerVariants = {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };

  const textVariants = {
    initial: { y: 20, opacity: 0 },
    animate: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut",
      }
    })
  };

  const lineVariants = {
    initial: { scaleX: 0, opacity: 0 },
    animate: { 
      scaleX: 1, 
      opacity: 1,
      transition: { 
        delay: 0.5, 
        duration: 0.8, 
        ease: "easeInOut" 
      } 
    }
  };

  return (
    <AnimatePresence>
      {loading && (
        <motion.div 
          key="global-loader-overlay"
          className="global-loader-container"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="loader-content">
            <div className="loader-text-wrapper">
              {["H", "E", "E", "D", "Y"].map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={textVariants}
                  className="loader-letter"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
            <div className="loader-progress-container">
              <motion.div 
                className="loader-progress-bar"
                variants={lineVariants}
                style={{ originX: 0 }}
              />
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="loader-tagline"
            >
              Premium Skincare Experience
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default GlobalLoader;
