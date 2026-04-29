import React from 'react';
import { motion } from 'framer-motion';

const Section = ({ title, children }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <section className="px-3 md:px-5 py-4 md:py-5">
        <div className="max-w-[1100px] mx-auto">
          {title && (
            <div className="mb-3 md:mb-4">
              <h2 
                className="font-mono text-[9px] uppercase" 
                style={{ color: 'var(--color-text-primary)' }}
              >
                {title}
              </h2>
              <motion.div 
                className="h-[1px] w-6 mt-1" 
                style={{ backgroundColor: 'var(--color-text-primary)' }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.15, delay: 0.05 }}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
            {children}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Section;