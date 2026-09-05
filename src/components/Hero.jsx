import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="ms-section pt-24 pb-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="mono text-[10px] uppercase font-bold tracking-[0.3em] text-blue-600 mb-2 block">
          Central Access Portal
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
          VNDANGKHOA<span className="text-gray-300">.</span>PORTAL
        </h1>
        <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
          Quick entry point for all internal systems, media platforms, and utility tools. 
          Powered by the <span className="ms-highlight font-medium text-black">Making Software</span> design system.
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;
