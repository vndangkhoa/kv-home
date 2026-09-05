import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const ArticleCard = ({ item, index }) => {
  const { title, subtitle, url, category, image } = item;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Default color if none provided
  const accentColor = item.color || '#3b82f6';

  return (
    <motion.a
      ref={ref}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="ms-card group block overflow-hidden bg-white"
    >
      <div className="aspect-[16/9] overflow-hidden bg-gray-50 mb-6 rounded-2xl relative">
        <motion.img 
          src={image || `https://api.placeholder.com/800/450`} 
          alt={title}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      
      <div className="px-1">
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border"
            style={{ color: accentColor, borderColor: `${accentColor}33`, backgroundColor: `${accentColor}11` }}
          >
            {category || 'Software'}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">8 min read</span>
        </div>
        
        <h3 className="text-2xl font-bold tracking-tight mb-3 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
          {subtitle || 'Deep dive into the underlying principles and implementation details of this concept.'}
        </p>
      </div>
    </motion.a>
  );
};

export default ArticleCard;
