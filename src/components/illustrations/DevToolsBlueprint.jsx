import React from 'react';
import { motion } from 'framer-motion';

const DevToolsBlueprint = () => {
  const layerTransition = { duration: 4.5, repeat: Infinity, ease: "easeInOut" };

  const Iso = ({ children, yOffset = 0 }) => (
    <g transform={`translate(200, ${180 + yOffset}) scale(1, 0.5) rotate(45)`}>
      {children}
    </g>
  );

  return (
    <svg viewBox="0 0 400 350" className="w-full h-auto text-blue-600" style={{ stroke: 'currentColor', strokeWidth: 1 }}>
      
      {/* Base Layer */}
      <motion.g animate={{ y: [0, 5, 0] }} transition={{ ...layerTransition, delay: 0 }}>
        <Iso yOffset={60}>
          <rect x="-100" y="-100" width="200" height="200" fill="white" />
          <path d="M-80,-80 L80,-80 L80,80 L-80,80 Z" fill="none" strokeDasharray="4 2" strokeOpacity="0.5" />
          <circle cx="0" cy="0" r="50" fill="none" strokeWidth="2" strokeOpacity="0.4" />
          <circle cx="0" cy="0" r="10" fill="currentColor" fillOpacity="0.2" stroke="none" />
          <rect x="-100" y="-100" width="200" height="200" fill="none" strokeWidth="1.5" />
        </Iso>
      </motion.g>

      {/* Middle Layer (Disk) */}
      <motion.g animate={{ y: [-40, -50, -40] }} transition={{ ...layerTransition, delay: 0.7 }}>
        <Iso yOffset={10}>
          <circle cx="0" cy="0" r="90" fill="rgba(255,255,255,0.9)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="30" fill="none" />
          <circle cx="0" cy="0" r="9" fill="currentColor" stroke="none" />
        </Iso>
      </motion.g>

      {/* Top Layer (Processor/Chip) */}
      <motion.g animate={{ y: [-80, -95, -80] }} transition={{ ...layerTransition, delay: 1.4 }}>
        <Iso yOffset={-40}>
          <rect x="-60" y="-60" width="120" height="120" fill="rgba(255,255,255,0.9)" strokeWidth="1.5" />
          {/* Chip pins */}
          <path d="M-70,-40 L-60,-40 M-70,0 L-60,0 M-70,40 L-60,40" strokeWidth="2" />
          <path d="M70,-40 L60,-40 M70,0 L60,0 M70,40 L60,40" strokeWidth="2" />
          <rect x="-40" y="-40" width="80" height="80" fill="none" strokeWidth="2" />
        </Iso>
      </motion.g>

      {/* Connection Lines */}
      <path d="M 100 120 L 100 240" strokeDasharray="4 4" strokeOpacity="0.3" fill="none" />
      <path d="M 300 120 L 300 240" strokeDasharray="4 4" strokeOpacity="0.3" fill="none" />

      {/* Labels */}
      <text x="350" y="80" className="font-mono text-[9px] fill-current opacity-80 uppercase tracking-widest" textAnchor="end" stroke="none">SHELL_EXEC</text>
      <text x="350" y="160" className="font-mono text-[9px] fill-current opacity-80 uppercase tracking-widest" textAnchor="end" stroke="none">IMAGE_RASTERIZER</text>
      <text x="350" y="280" className="font-mono text-[9px] fill-current opacity-80 uppercase tracking-widest" textAnchor="end" stroke="none">PDF_PARSER</text>
    </svg>
  );
};

export default DevToolsBlueprint;
