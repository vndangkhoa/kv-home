import React from 'react';
import { motion } from 'framer-motion';

const PrimaryBlueprint = () => {
  return (
    <svg viewBox="0 0 400 350" className="w-full h-auto text-blue-600" style={{ stroke: 'currentColor', strokeWidth: 1.5 }}>
      {/* 2D Grid Background */}
      <defs>
        <pattern id="grid-2d" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" strokeWidth="0.5" strokeOpacity="0.2" />
        </pattern>
      </defs>
      <rect width="400" height="350" fill="url(#grid-2d)" />

      {/* Frame / Borders */}
      <rect x="10" y="10" width="380" height="330" fill="none" strokeOpacity="0.2" />
      <path d="M 0 10 L 10 10 M 390 10 L 400 10 M 0 340 L 10 340 M 390 340 L 400 340" strokeOpacity="0.5" />

      {/* Group centered vertically on canvas */}
      <g transform="translate(30, 175)">
        {/* Main Pipeline */}
        <path d="M 20 0 L 140 0" strokeDasharray="4 4" strokeWidth="2" strokeOpacity="0.5" />
        
        {/* Router Node Base */}
        <rect x="140" y="-30" width="60" height="60" fill="white" strokeWidth="2" />
        <circle cx="170" cy="0" r="15" fill="none" strokeWidth="2" />
        <circle cx="170" cy="0" r="5" fill="currentColor" fillOpacity="0.2" stroke="none" />
        
        {/* Branch Lines */}
        <path d="M 200 0 L 240 0 L 240 -60 L 270 -60" fill="none" strokeWidth="2" />
        <path d="M 200 0 L 240 0 L 240 60 L 270 60" fill="none" strokeWidth="2" />

        {/* Showcase Node */}
        <rect x="270" y="-80" width="50" height="40" fill="white" strokeWidth="1.5" />
        <path d="M 280 -70 L 310 -70 M 280 -60 L 300 -60" strokeWidth="1" fill="none" />
        
        {/* Archive Node */}
        <rect x="270" y="40" width="50" height="40" fill="white" strokeWidth="1.5" />
        <path d="M 280 50 L 310 50 M 280 60 L 300 60" strokeWidth="1" fill="none" />

        {/* Data Packet Animations - Top Branch */}
        <motion.circle r="4" fill="currentColor" stroke="none"
          animate={{ cx: [20, 140, 240, 240, 270], cy: [0, 0, 0, -60, -60], opacity: [0, 1, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        {/* Data Packet Animations - Bottom Branch */}
        <motion.circle r="4" fill="currentColor" stroke="none"
          animate={{ cx: [20, 140, 240, 240, 270], cy: [0, 0, 0, 60, 60], opacity: [0, 1, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2 }}
        />

        {/* Logic Indicators */}
        <rect x="235" y="-30" width="10" height="10" fill="white" />
        <rect x="235" y="20" width="10" height="10" fill="white" />

        {/* Labels - with white background to cut through lines */}
        <rect x="0" y="-25" width="70" height="15" fill="white" stroke="none" />
        <text x="5" y="-15" className="font-mono text-[9px] fill-current uppercase tracking-widest" stroke="none">SYS_INPUT</text>
        
        <rect x="135" y="40" width="70" height="15" fill="white" stroke="none" />
        <text x="140" y="50" className="font-mono text-[9px] fill-current uppercase tracking-widest" stroke="none">CORE_ROUTER</text>

        <text x="330" y="-60" className="font-mono text-[9px] fill-current opacity-80 uppercase tracking-widest" stroke="none">SHOWCASE</text>
        <text x="330" y="60" className="font-mono text-[9px] fill-current opacity-80 uppercase tracking-widest" stroke="none">ARCHIVE</text>
      </g>
    </svg>
  );
};

export default PrimaryBlueprint;
