import React from 'react';
import { motion } from 'framer-motion';

const PortalCard = ({ item, index }) => {
  const { title, subtitle, url, color } = item;
  
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="tech-label group block relative"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-gray-300 font-bold uppercase tracking-tight">
            [ PORT_ACCESS ]
          </span>
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        
        <h3 className="font-mono text-[13px] font-extrabold text-black flex items-center gap-1 group-hover:text-blue-600 transition-colors">
          <span className="opacity-40 group-hover:opacity-100 transition-opacity">→</span> {title.toUpperCase()}
        </h3>
        
        <p className="font-serif text-[11px] italic text-gray-400 leading-tight">
          {subtitle}
        </p>
      </div>

      {/* Technical bracket decorations */}
      <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-all">
        <div className="font-mono text-[8px] vertical-text">
          EST. 2026
        </div>
      </div>
    </motion.a>
  );
};

export default PortalCard;
