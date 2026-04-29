import React from 'react';
import { motion } from 'framer-motion';

const FeaturedCard = ({ title, subtitle, url, type, videoSrc, index = 0 }) => {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        backgroundColor: 'var(--color-border-default)',
        transition: { duration: 0.15 }
      }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className="block p-3 md:p-4"
      style={{ 
        backgroundColor: 'var(--color-surface-base)',
        border: '1px solid var(--color-border-default)'
      }}
    >
      <div className="flex flex-col min-h-[100px]">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <span 
            className="font-mono text-[9px] uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            featured
          </span>
          <div 
            className="w-1 h-1"
            style={{ backgroundColor: 'var(--color-text-primary)' }}
          />
        </div>
        
        {type === 'cv' && videoSrc && (
          <div 
            className="relative w-full h-12 md:h-16 mb-2 overflow-hidden"
            style={{ border: '1px solid var(--color-border-default)' }}
          >
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        )}
        
        <h3 
          className="font-mono text-sm md:text-base" 
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h3>
        
        <p 
          className="font-mono text-[9px]" 
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {subtitle}
        </p>
        
        <div className="mt-auto pt-2">
          <span 
            className="font-mono text-[9px] uppercase"
            style={{ color: 'var(--color-text-primary)' }}
          >
            enter
          </span>
        </div>
      </div>
    </motion.a>
  );
};

export default FeaturedCard;