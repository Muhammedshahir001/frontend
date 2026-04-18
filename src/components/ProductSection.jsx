import React from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProductSection = ({ title, products }) => {
  return (
    <section className="bg-white py-16 md:py-0 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1500px] mx-auto">
        
        {/* Section Header - Clean, screenshot style */}
        <div className="flex flex-col items-center mb-12 md:mb-16">
          <h2 className="text-xl md:text-3xl font-bold text-slate-950 tracking-[0.15em] uppercase mb-4 text-center">
            {title}
          </h2>
          <div className="w-[40px] md:w-[60px] h-[3px] bg-slate-950 rounded-full"></div>
        </div>

        {/* Fully Responsive Premium Grid - 3 items per row on desktop, 2 on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10 lg:gap-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All - Matching screenshot aesthetic */}
        <div className="mt-16 md:mt-20 md:mb-10 text-center">
          <Link to="/products">
            <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="pb-4 inline-block border border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white px-12 md:px-16 py-3.5 md:py-4 text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] rounded-sm transition-all duration-300"
          >
            View All Products
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;