import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const Section = ({ title, description, children, index, isFeatured, featuredImage }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Format index as 001, 002, etc.
  const figNumber = String(index + 1).padStart(3, '0');
  const isEven = index % 2 === 0;

  return (
    <div className={isFeatured ? "w-full bg-blue-50/20 border-y-2 border-blue-50/50 py-4 my-8 relative shadow-sm" : "w-full"}>
      <section className={`ms-container relative py-8 md:py-16 flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-start`}>
      {/* Sidebar Label - Desktop Only */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -10 : 10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`hidden lg:block vertical-text absolute ${isEven ? '-left-8' : '-right-8'} top-0 text-[11px] font-mono text-gray-300 tracking-[0.3em] uppercase font-bold`}
      >
        FIG. {figNumber}
      </motion.div>

      {/* Content Column (Text & Buttons) */}
      <div className="w-full lg:w-[45%] flex flex-col z-10 w-full relative">
        <h2 className={`font-pixel text-blue-600 mb-6 tracking-wider uppercase leading-tight ${isFeatured ? 'text-3xl md:text-4xl lg:text-5xl drop-shadow-sm' : 'text-xl md:text-2xl'}`}>
          {title}
        </h2>
        
        <div className="manual-text drop-cap mb-8">
          {description}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children}
        </div>
      </div>

      {/* Blueprint Column (Animation) */}
      <div className="w-full lg:w-[55%]">
        {featuredImage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="blueprint-container"
          >
             {typeof featuredImage === 'string' ? (
               <img src={featuredImage} alt={title} className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" />
             ) : (
               <div className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700">
                 {featuredImage}
               </div>
             )}
            <div className="mt-3 flex justify-between items-center font-mono text-[9px] text-gray-400 uppercase tracking-widest px-1">
              <span>SYSTEM_SCHEMATIC_V.1</span>
              <span>ID_{figNumber}</span>
            </div>
          </motion.div>
        )}
      </div>
      </section>
    </div>
  );
};

export default Section;