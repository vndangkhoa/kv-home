import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const Section = ({ title, description, children, index, isFeatured, featuredImage }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Format index as 001, 002, etc.
  const figNumber = String(index + 1).padStart(3, '0');

  return (
    <section className={`ms-container relative py-4 md:py-8 flex flex-col ${isFeatured ? 'md:flex-col lg:flex-row' : 'md:flex-row'} gap-6 md:gap-12`}>
      {/* Sidebar Illustration Info */}
      <div className={`${isFeatured ? 'lg:w-1/2' : 'md:w-1/3'} flex group`}>
        <div className="relative w-full">
          {/* Vertical Label - Desktop Only */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="hidden md:block vertical-text absolute -left-8 top-0 text-[10px] font-mono text-gray-300 tracking-widest uppercase font-bold"
          >
            FIG. {figNumber}
          </motion.div>
          
          <div className="md:pr-4">
            <h2 className={`${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl md:text-sm'} font-pixel text-blue-600 mb-6 md:mb-8 tracking-wider uppercase`}>
              {isFeatured ? `FEATURED: ${title}` : title}
            </h2>
            <p className={`${isFeatured ? 'text-[18px] md:text-[20px] leading-relaxed' : 'text-[15px] md:text-[14px] leading-relaxed'} font-serif text-gray-800 drop-cap opacity-95 group-hover:opacity-100 transition-opacity`}>
              {description}
            </p>

            {isFeatured && featuredImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.2 }}
                className="mt-12 border border-gray-100 p-2 bg-white shadow-2xl shadow-blue-900/5"
              >
                <img src={featuredImage} alt="Featured Technical Illustration" className="w-full h-auto" />
                <div className="mt-4 flex justify-between items-center font-mono text-[9px] text-gray-400 uppercase tracking-widest px-2">
                  <span>SCALE 1:15</span>
                  <span>EXPLODED_VIEW_DIG.V1</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className={`${isFeatured ? 'lg:w-1/2' : 'md:w-2/3'}`}>
        <div className={`grid grid-cols-1 ${isFeatured ? 'sm:grid-cols-1 md:grid-cols-2' : 'sm:grid-cols-2'} gap-4`}>
          {children}
        </div>
      </div>
    </section>
  );
};

export default Section;