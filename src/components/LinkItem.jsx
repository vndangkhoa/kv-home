import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const LinkItem = ({ link, index }) => {
  const { title, subtitle, url, icon: Icon } = link;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.a
      ref={ref}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 box-thin invert-hover cursor-pointer group"
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="p-0.5">
          <Icon size={16} strokeWidth={2} className="sm:size-[20px]" />
        </div>
        <div>
          <span className="font-semibold text-sm sm:text-lg">{title}</span>
          <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2 group-hover:text-white">{subtitle}</span>
        </div>
      </div>
      <ExternalLink size={14} className="sm:size-[18px] group-hover:text-white" />
    </motion.a>
  );
};

export default LinkItem;