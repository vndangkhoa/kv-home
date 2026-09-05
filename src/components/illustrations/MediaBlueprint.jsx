import React from 'react';
import { motion } from 'framer-motion';

const MediaBlueprint = () => {
  const Iso = ({ children, yOffset = 0 }) => (
    <g transform={`translate(200, ${180 + yOffset}) scale(1, 0.5) rotate(45)`}>
      {children}
    </g>
  );

  return (
    <svg viewBox="0 0 400 350" className="w-full h-auto text-blue-600" style={{ stroke: 'currentColor', strokeWidth: 1.2 }}>
      
      {/* Background Plane */}
      <motion.g animate={{ y: [0, 4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <Iso yOffset={40}>
          <rect x="-100" y="-100" width="200" height="200" fill="white" />
          {/* Isometric Grid */}
          <path d="M-100,-60 L100,-60 M-100,-20 L100,-20 M-100,20 L100,20 M-100,60 L100,60" strokeOpacity="0.2" fill="none" />
          <path d="M-60,-100 L-60,100 M-20,-100 L-20,100 M20,-100 L20,100 M60,-100 L60,100" strokeOpacity="0.2" fill="none" />
          <rect x="-100" y="-100" width="200" height="200" fill="none" strokeWidth="1.5" />
        </Iso>
      </motion.g>

      {/* Floating Media Waveform */}
      <motion.g animate={{ y: [-30, -35, -30] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
        <Iso yOffset={0}>
          {/* A surface looking like a gaussian bump - using paths in isometric space */}
          {/* We define points directly in local SVG space, they'll be projected. */}
          {/* Bottom plane of wave */}
          <path d="M-80,-20 L80,-20 L80,20 L-80,20 Z" fill="rgba(255,255,255,0.8)" strokeDasharray="2 2" strokeOpacity="0.5" />
          
          {/* The Waveform Curve */}
          <motion.path 
            d="M-80,0 Q-40,0 -20,-40 T0,-80 T20,-40 T80,0" 
            fill="none" strokeWidth="2"
            animate={{ d: [
              "M-80,0 Q-40,0 -20,-40 T0,-80 T20,-40 T80,0",
              "M-80,0 Q-40,0 -20,-30 T0,-60 T20,-30 T80,0",
              "M-80,0 Q-40,0 -20,-40 T0,-80 T20,-40 T80,0"
            ] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Secondary Sine Wave */}
          <motion.path
            d="M-80,0 Q-40,-40 0,0 T80,0"
            fill="none" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="4 4"
            animate={{ d: [
              "M-80,0 Q-40,-40 0,0 T80,0",
              "M-80,0 Q-40,40 0,0 T80,0",
              "M-80,0 Q-40,-40 0,0 T80,0"
            ] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </Iso>
      </motion.g>

      {/* Vertical Guides */}
      <path d="M 200 60 L 200 240" strokeDasharray="3 3" strokeOpacity="0.3" fill="none" />

      {/* Labels */}
      <text x="350" y="80" className="font-mono text-[9px] fill-current opacity-80 uppercase tracking-widest" textAnchor="end" stroke="none">FREQUENCY_MOD</text>
      <text x="350" y="160" className="font-mono text-[9px] fill-current opacity-80 uppercase tracking-widest" textAnchor="end" stroke="none">MEDIA_BUFFER</text>

    </svg>
  );
};

export default MediaBlueprint;
