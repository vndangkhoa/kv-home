import React from 'react';
import { motion } from 'framer-motion';

const MaintenanceBlueprint = () => {
  return (
    <svg viewBox="0 0 400 350" className="w-full h-auto text-blue-600" style={{ stroke: 'currentColor', strokeWidth: 1.5 }}>
      <defs>
        <pattern id="grid-small" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" strokeWidth="0.5" strokeOpacity="0.15" />
        </pattern>
      </defs>
      
      <rect width="400" height="350" fill="url(#grid-small)" />
      
      <g transform="translate(50, 50)">
        {/* Main Interface Frame */}
        <rect x="0" y="0" width="300" height="250" fill="rgba(255,255,255,0.95)" />
        <rect x="0" y="0" width="300" height="250" fill="none" strokeWidth="2" />
        
        {/* Header bar */}
        <path d="M 0 30 L 300 30" strokeWidth="2" fill="none" />
        <circle cx="15" cy="15" r="4" fill="currentColor" stroke="none" />
        <circle cx="30" cy="15" r="4" fill="currentColor" stroke="none" />
        <circle cx="45" cy="15" r="4" fill="currentColor" stroke="none" />
        <text x="285" y="20" className="font-mono text-[9px] fill-current uppercase tracking-widest" stroke="none" textAnchor="end">TERMINAL_DIAGNOSTICS</text>

        {/* Process Bar 1 */}
        <text x="20" y="70" className="font-mono text-[9px] fill-current uppercase tracking-widest" stroke="none">NET_PATCH_SEQ</text>
        <rect x="20" y="80" width="260" height="10" fill="none" />
        <motion.rect x="20" y="80" height="10" fill="currentColor" stroke="none" opacity="0.3"
          animate={{ width: [0, 260, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Process Bar 2 */}
        <text x="20" y="120" className="font-mono text-[9px] fill-current uppercase tracking-widest" stroke="none">RM8_VALIDATION</text>
        <rect x="20" y="130" width="260" height="10" fill="none" />
        <motion.rect x="20" y="130" height="10" fill="currentColor" stroke="none" opacity="0.3"
          animate={{ width: [0, 200, 200, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Diagnostic Grid Lights */}
        <text x="20" y="180" className="font-mono text-[9px] fill-current uppercase tracking-widest" stroke="none">SYSTEM_NODES</text>
        <g transform="translate(20, 195)">
          {/* Row of blinking squares */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
             <motion.rect key={`light-${i}`} x={i * 30} y="0" width="15" height="15" fill="currentColor" stroke="none"
                animate={{ opacity: [0.1, 0.8, 0.1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "linear" }}
             />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
             <rect key={`border-${i}`} x={i * 30} y="0" width="15" height="15" fill="none" strokeOpacity="0.5" />
          ))}
        </g>
      </g>
    </svg>
  );
};

export default MaintenanceBlueprint;
