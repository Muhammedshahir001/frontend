import React from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProductSection = ({ title, products }) => {
  return (
    <section className="bg-white py-16 md:py-0 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1700px] mx-auto">
        
        {/* Section Header - Clean, screenshot style */}
        <div className="flex flex-col items-center mb-16 md:mb-24">
          <h2 className="text-2xl md:text-5xl font-black text-[#0f172a] tracking-[0.2em] uppercase mb-6 text-center">
            {title}
          </h2>
          <div className="w-[60px] md:w-[100px] h-[4px] bg-[#0f172a] rounded-full"></div>
        </div>

        {/* Fully Responsive Premium Grid - Large cards, balanced for all screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
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