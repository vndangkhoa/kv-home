import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getServiceIconUrl } from '../../utils/iconResolver';

/**
 * 12 Signs of the Zodiac with Astronomical Constellations & Elements
 */
const ZODIAC_DATA = [
  {
    symbol: '♈',
    name: 'Aries',
    french: 'Bélier',
    element: 'Feu',
    elementIcon: '🜂',
    house: 'Maison I',
    stars: [
      { x: 18, y: 72, r: 2.2 },
      { x: 44, y: 48, r: 2.6 },
      { x: 74, y: 36, r: 2.2 },
      { x: 86, y: 22, r: 2.8 },
    ],
    lines: [[0, 1], [1, 2], [2, 3]],
  },
  {
    symbol: '♉',
    name: 'Taurus',
    french: 'Taureau',
    element: 'Terre',
    elementIcon: '🜃',
    house: 'Maison II',
    stars: [
      { x: 22, y: 32, r: 2.4 },
      { x: 46, y: 52, r: 3 },
      { x: 68, y: 56, r: 2.2 },
      { x: 82, y: 36, r: 2.4 },
      { x: 66, y: 76, r: 2.2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [1, 4]],
  },
  {
    symbol: '♊',
    name: 'Gemini',
    french: 'Gémeaux',
    element: 'Air',
    elementIcon: '🜁',
    house: 'Maison III',
    stars: [
      { x: 28, y: 22, r: 3 },
      { x: 68, y: 20, r: 2.8 },
      { x: 34, y: 54, r: 2.2 },
      { x: 64, y: 54, r: 2.2 },
      { x: 38, y: 80, r: 2.4 },
      { x: 60, y: 80, r: 2.4 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [2, 3]],
  },
  {
    symbol: '♋',
    name: 'Cancer',
    french: 'Cancer',
    element: 'Eau',
    elementIcon: '🜄',
    house: 'Maison IV',
    stars: [
      { x: 48, y: 50, r: 3 },
      { x: 28, y: 30, r: 2.2 },
      { x: 70, y: 34, r: 2.4 },
      { x: 50, y: 80, r: 2.4 },
    ],
    lines: [[0, 1], [0, 2], [0, 3]],
  },
  {
    symbol: '♌',
    name: 'Leo',
    french: 'Lion',
    element: 'Feu',
    elementIcon: '🜂',
    house: 'Maison V',
    stars: [
      { x: 24, y: 72, r: 3 },
      { x: 52, y: 74, r: 2.2 },
      { x: 58, y: 50, r: 2.4 },
      { x: 44, y: 32, r: 2.6 },
      { x: 74, y: 34, r: 2.2 },
      { x: 84, y: 22, r: 2.8 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
  {
    symbol: '♍',
    name: 'Virgo',
    french: 'Vierge',
    element: 'Terre',
    elementIcon: '🜃',
    house: 'Maison VI',
    stars: [
      { x: 18, y: 40, r: 2.2 },
      { x: 38, y: 28, r: 2.4 },
      { x: 58, y: 44, r: 3 },
      { x: 82, y: 38, r: 2.2 },
      { x: 70, y: 76, r: 2.6 },
      { x: 34, y: 70, r: 2.4 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4], [1, 5]],
  },
  {
    symbol: '♎',
    name: 'Libra',
    french: 'Balance',
    element: 'Air',
    elementIcon: '🜁',
    house: 'Maison VII',
    stars: [
      { x: 50, y: 24, r: 2.8 },
      { x: 24, y: 54, r: 2.4 },
      { x: 76, y: 54, r: 2.4 },
      { x: 50, y: 76, r: 2.8 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 3]],
  },
  {
    symbol: '♏',
    name: 'Scorpio',
    french: 'Scorpion',
    element: 'Eau',
    elementIcon: '🜄',
    house: 'Maison VIII',
    stars: [
      { x: 18, y: 26, r: 2.4 },
      { x: 36, y: 36, r: 2.2 },
      { x: 50, y: 56, r: 3 },
      { x: 56, y: 76, r: 2.4 },
      { x: 76, y: 78, r: 2.6 },
      { x: 84, y: 64, r: 2.4 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
  {
    symbol: '♐',
    name: 'Sagittarius',
    french: 'Sagittaire',
    element: 'Feu',
    elementIcon: '🜂',
    house: 'Maison IX',
    stars: [
      { x: 28, y: 66, r: 2.6 },
      { x: 46, y: 46, r: 2.4 },
      { x: 64, y: 36, r: 2.8 },
      { x: 86, y: 24, r: 3 },
      { x: 44, y: 76, r: 2.2 },
      { x: 66, y: 62, r: 2.2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5]],
  },
  {
    symbol: '♑',
    name: 'Capricorn',
    french: 'Capricorne',
    element: 'Terre',
    elementIcon: '🜃',
    house: 'Maison X',
    stars: [
      { x: 24, y: 32, r: 2.6 },
      { x: 74, y: 30, r: 2.6 },
      { x: 50, y: 72, r: 3 },
      { x: 34, y: 56, r: 2.2 },
      { x: 64, y: 56, r: 2.2 },
    ],
    lines: [[0, 1], [1, 4], [4, 2], [2, 3], [3, 0]],
  },
  {
    symbol: '♒',
    name: 'Aquarius',
    french: 'Verseau',
    element: 'Air',
    elementIcon: '🜁',
    house: 'Maison XI',
    stars: [
      { x: 18, y: 36, r: 2.4 },
      { x: 44, y: 30, r: 2.6 },
      { x: 64, y: 40, r: 2.4 },
      { x: 84, y: 34, r: 2.6 },
      { x: 24, y: 66, r: 2.2 },
      { x: 48, y: 60, r: 2.4 },
      { x: 72, y: 70, r: 2.4 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6]],
  },
  {
    symbol: '♓',
    name: 'Pisces',
    french: 'Poissons',
    element: 'Eau',
    elementIcon: '🜄',
    house: 'Maison XII',
    stars: [
      { x: 24, y: 30, r: 2.8 },
      { x: 34, y: 56, r: 2.2 },
      { x: 54, y: 72, r: 2.6 },
      { x: 74, y: 66, r: 2.4 },
      { x: 80, y: 40, r: 2.8 },
      { x: 64, y: 34, r: 2.2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
];

/**
 * Roman Numeral Formatter
 */
function toRoman(num) {
  const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman || 'I';
}

/**
 * Celestial Sunburst, Moon Phases & Sinuous Orbits SVG Divider
 */
function CelestialDivider({ color = '#D8A48F', width = 340, height = 34 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 340 34" fill="none" style={{ maxWidth: '100%' }}>
      {/* Sinuous Whiplash Horizon Curves */}
      <path
        d="M10 17C45 17 65 6 95 6C125 6 145 28 170 28C195 28 215 6 245 6C275 6 295 17 330 17"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M25 17C60 17 75 26 105 26C135 26 150 8 170 8C190 8 205 26 235 26C265 26 280 17 315 17"
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />

      {/* Waxing Crescent Moon (Left) */}
      <path
        d="M75 12 A 6 6 0 0 0 75 22 A 4.5 4.5 0 0 1 75 12"
        fill={color}
        fillOpacity="0.75"
      />

      {/* Left 4-point star */}
      <path
        d="M115 17 Q115 14 117 14 Q115 14 115 11 Q115 14 113 14 Q115 14 115 17"
        fill={color}
      />
      <circle cx="115" cy="14" r="1" fill={color} />

      {/* Central Radiance: Sun & Astrolabe Centerpiece */}
      <circle cx="170" cy="17" r="4.5" fill={color} />
      <circle cx="170" cy="17" r="8.5" stroke={color} strokeWidth="0.9" strokeDasharray="2 3" />
      <circle cx="170" cy="17" r="12" stroke={color} strokeWidth="0.6" strokeOpacity="0.4" />

      {/* 8 Radial Sun Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 170 + Math.cos(rad) * 9.5;
        const y1 = 170 + Math.sin(rad) * 9.5;
        const x2 = 170 + Math.cos(rad) * 13.5;
        const y2 = 170 + Math.sin(rad) * 13.5;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1 - 153}
            x2={x2}
            y2={y2 - 153}
            stroke={color}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        );
      })}

      {/* Right 4-point star */}
      <path
        d="M225 17 Q225 14 227 14 Q225 14 225 11 Q225 14 223 14 Q225 14 225 17"
        fill={color}
      />
      <circle cx="225" cy="14" r="1" fill={color} />

      {/* Waning Crescent Moon (Right) */}
      <path
        d="M265 12 A 6 6 0 0 1 265 22 A 4.5 4.5 0 0 0 265 12"
        fill={color}
        fillOpacity="0.75"
      />

      {/* Ambient Starlight Nodes */}
      <circle cx="45" cy="17" r="1.5" fill={color} />
      <circle cx="295" cy="17" r="1.5" fill={color} />
    </svg>
  );
}

/**
 * Constellation Watermark for Card Background
 */
function ConstellationWatermark({ zodiac, color, isHovered }) {
  if (!zodiac) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        right: '4px',
        bottom: '8px',
        width: '100px',
        height: '100px',
        pointerEvents: 'none',
        opacity: isHovered ? 0.38 : 0.12,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'scale(1.08) rotate(2deg)' : 'scale(1) rotate(0deg)',
      }}
    >
      {/* Constellation Connection Hairlines */}
      {zodiac.lines.map(([fromIdx, toIdx], i) => {
        const from = zodiac.stars[fromIdx];
        const to = zodiac.stars[toIdx];
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={color}
            strokeWidth="0.85"
            strokeDasharray={isHovered ? 'none' : '1.5 1.5'}
          />
        );
      })}

      {/* Constellation Star Nodes */}
      {zodiac.stars.map((s, idx) => (
        <g key={idx}>
          <circle
            cx={s.x}
            cy={s.y}
            r={isHovered ? s.r * 1.3 : s.r}
            fill={color}
            style={{
              filter: isHovered ? `drop-shadow(0 0 4px ${color})` : 'none',
              transition: 'all 0.3s ease',
            }}
          />
          {isHovered && s.r >= 2.6 && (
            <circle
              cx={s.x}
              cy={s.y}
              r={s.r * 2.2}
              stroke={color}
              strokeWidth="0.5"
              strokeOpacity="0.4"
              fill="none"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

/**
 * Oval Cameo Locket Icon Seal with Beaded Pearl Rings & Crescent Moon
 */
function NouveauIconSeal({ item, isDark, goldColor, _zodiac, isHovered }) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = useMemo(() => getServiceIconUrl(item), [item]);
  const hasIcon = iconUrl && !imgError;
  const initials = (item.title || item.label || 'KV').slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        position: 'relative',
        width: '46px',
        height: '54px', // Sinuous vertical oval cameo aspect
        borderRadius: '50% / 60% 60% 40% 40%',
        border: `1.5px solid ${goldColor}`,
        outline: `1px dotted ${goldColor}77`,
        outlineOffset: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark
          ? 'radial-gradient(ellipse at 50% 30%, rgba(45, 32, 54, 0.95), rgba(20, 15, 26, 0.95))'
          : 'radial-gradient(ellipse at 50% 30%, #FFFFFF, #FAF0EB)',
        boxShadow: isHovered
          ? (isDark ? `0 4px 18px rgba(0,0,0,0.6), 0 0 16px ${goldColor}44` : `0 4px 16px ${goldColor}38`)
          : (isDark ? '0 2px 10px rgba(0,0,0,0.5)' : `0 2px 8px ${goldColor}22`),
        flexShrink: 0,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Delicate Crescent Moon Halo */}
      <span
        style={{
          position: 'absolute',
          top: '-6px',
          left: '-5px',
          fontSize: '11px',
          color: goldColor,
          opacity: isHovered ? 0.95 : 0.55,
          transition: 'all 0.3s ease',
          pointerEvents: 'none',
          transform: isHovered ? 'scale(1.15) rotate(-10deg)' : 'scale(1)',
        }}
      >
        ☽
      </span>

      {hasIcon ? (
        <img
          src={iconUrl}
          alt={item.title || item.label}
          onError={() => setImgError(true)}
          style={{
            width: '24px',
            height: '24px',
            objectFit: 'contain',
            filter: isDark ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' : 'none',
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: '"Cinzel Decorative", "Italiana", serif',
            fontSize: '13px',
            fontWeight: '700',
            color: goldColor,
            letterSpacing: '0.05em',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

/**
 * Celestial Zodiac Arched Dome Card
 */
function NouveauCard({ item, index, isDark, pingStatus, goldColor, textColor, subTextColor }) {
  const [isHovered, setIsHovered] = useState(false);
  const zodiac = ZODIAC_DATA[index % ZODIAC_DATA.length];

  // Status jewel styling
  let statusColor = '#10B981'; // Emerald pearl
  let statusTitle = 'Online';
  if (pingStatus) {
    if (!pingStatus.ok) {
      statusColor = '#EF4444'; // Ruby
      statusTitle = 'Unreachable';
    } else if (pingStatus.timeMs > 300) {
      statusColor = '#F59E0B'; // Amber
      statusTitle = `Latency: ${pingStatus.timeMs}ms`;
    } else if (pingStatus.timeMs) {
      statusTitle = `Latency: ${pingStatus.timeMs}ms`;
    }
  }

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '28px 22px 20px 22px',
        textDecoration: 'none',
        position: 'relative',
        /* Curved Architectural Dome Top with Sinuous Bottom Corners */
        borderRadius: '52px 52px 22px 22px',
        background: isDark
          ? (isHovered ? 'rgba(38, 27, 46, 0.95)' : 'rgba(23, 17, 28, 0.82)')
          : (isHovered ? '#FFFFFF' : 'rgba(255, 250, 247, 0.88)'),
        backdropFilter: 'blur(10px)',
        border: `1.5px solid ${isHovered ? goldColor : `${goldColor}55`}`,
        outline: `1px solid ${isHovered ? `${goldColor}44` : `${goldColor}18`}`,
        outlineOffset: '4px',
        boxShadow: isHovered
          ? (isDark
              ? `0 16px 36px rgba(0,0,0,0.65), 0 0 24px ${goldColor}33`
              : `0 14px 32px ${goldColor}28, 0 0 18px rgba(255, 255, 255, 0.8)`)
          : (isDark
              ? '0 4px 18px rgba(0,0,0,0.45)'
              : `0 3px 12px ${goldColor}10`),
        transform: isHovered ? 'translateY(-4px) scale(1.008)' : 'translateY(0) scale(1)',
        transition: 'all 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        minHeight: '178px',
      }}
    >
      {/* Background Constellation Diagram Watermark */}
      <ConstellationWatermark zodiac={zodiac} color={goldColor} isHovered={isHovered} />

      {/* Top-Right Twinkling Starlight Marker */}
      <span
        style={{
          position: 'absolute',
          top: '12px',
          right: '15px',
          fontSize: '14px',
          color: goldColor,
          opacity: isHovered ? 1 : 0.45,
          textShadow: isHovered ? `0 0 10px ${goldColor}` : 'none',
          transform: isHovered ? 'rotate(45deg) scale(1.2)' : 'rotate(0deg) scale(1)',
          transition: 'all 0.35s ease',
          pointerEvents: 'none',
        }}
      >
        ✧
      </span>

      {/* Top Meta: Oval Cameo Icon, Zodiac Sign, House & Status Pearl */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NouveauIconSeal
              item={item}
              isDark={isDark}
              goldColor={goldColor}
              zodiac={zodiac}
              isHovered={isHovered}
            />
            <div>
              {/* Zodiac Glyph + Latin Name + House */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15px', color: goldColor, lineHeight: 1 }}>{zodiac.symbol}</span>
                <span
                  style={{
                    fontFamily: '"Cinzel Decorative", "Italiana", serif',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: goldColor,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {zodiac.french} · {zodiac.house}
                </span>
              </div>

              {/* Elemental Sphere & Group */}
              <div
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontStyle: 'italic',
                  fontSize: '12px',
                  color: subTextColor,
                  letterSpacing: '0.04em',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{zodiac.elementIcon} {zodiac.element}</span>
                {item.group && (
                  <>
                    <span style={{ opacity: 0.5 }}>·</span>
                    <span style={{ textTransform: 'capitalize' }}>{item.group}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pearl Jewel Status Dot */}
          <div
            title={statusTitle}
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 10px ${statusColor}aa`,
              border: `1.5px solid ${goldColor}66`,
              flexShrink: 0,
            }}
          />
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: '"Italiana", "Cinzel Decorative", serif',
            fontSize: '19px',
            fontWeight: '600',
            color: textColor,
            margin: '0 0 6px 0',
            letterSpacing: '0.03em',
            lineHeight: '1.25',
            transition: 'color 0.2s ease',
          }}
        >
          {item.title || item.label}
        </h3>

        {/* Subtitle in Poetic Garamond Italic */}
        <p
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: '13.5px',
            color: subTextColor,
            margin: 0,
            lineHeight: '1.45',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.subtitle || item.description || "Point d'ancrage céleste et utilitaire"}
        </p>
      </div>

      {/* Card Footer: Delicate Pearl Bead Divider & Romantic Portal Link */}
      <div>
        {/* Beaded pearl divider */}
        <div
          style={{
            marginTop: '16px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            opacity: 0.35,
          }}
        >
          <span style={{ fontSize: '7px', color: goldColor }}>◦</span>
          <span style={{ fontSize: '7px', color: goldColor }}>◦</span>
          <span style={{ fontSize: '7px', color: goldColor }}>✦</span>
          <span style={{ fontSize: '7px', color: goldColor }}>◦</span>
          <span style={{ fontSize: '7px', color: goldColor }}>◦</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: '12px',
              color: goldColor,
              letterSpacing: '0.05em',
            }}
          >
            Traverser l'astre
          </span>
          <span
            style={{
              color: goldColor,
              fontSize: '15px',
              transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
              transition: 'transform 0.25s ease',
            }}
          >
            ⟶
          </span>
        </div>
      </div>
    </a>
  );
}

export default function NouveauLayout({ links = [], isDark = true, settings = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [pingResults, setPingResults] = useState({});
  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Periodic health check
  useEffect(() => {
    let isMounted = true;
    async function probeHealth() {
      const updates = {};
      for (const item of links) {
        if (!item.link) continue;
        const key = item.id || item.link;
        try {
          const res = await fetch(`/api/ping?target=${encodeURIComponent(item.link)}`);
          if (res.ok) {
            const data = await res.json();
            updates[key] = data;
          } else {
            updates[key] = { ok: false, error: 'ERR' };
          }
        } catch {
          updates[key] = { ok: false, error: 'TIMEOUT' };
        }
      }
      if (isMounted) {
        setPingResults((prev) => ({ ...prev, ...updates }));
      }
    }
    probeHealth();
    const interval = setInterval(probeHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [links]);

  // Unique groups
  const groups = useMemo(() => {
    const set = new Set();
    links.forEach((l) => {
      if (l.group) set.add(l.group);
    });
    return ['all', ...Array.from(set)];
  }, [links]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((item) => {
      const matchesGroup = selectedGroup === 'all' || item.group === selectedGroup;
      if (!matchesGroup) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.label && item.label.toLowerCase().includes(q)) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.group && item.group.toLowerCase().includes(q))
      );
    });
  }, [links, selectedGroup, searchQuery]);

  // Feminine Celestial Rose-Gold & Velvet Cosmos Palette
  const pageBg = isDark
    ? 'radial-gradient(ellipse at 50% 12%, #22182D 0%, #140E1D 55%, #0B0810 100%)'
    : 'radial-gradient(ellipse at 50% 10%, #FDF8F5 0%, #FAF1EC 55%, #F5E7DF 100%)';

  const goldColor = isDark ? '#E5B2A0' : '#C58F7D'; // Luminous Rose Gold / Champagne
  const textColor = isDark ? '#FAF0EB' : '#2A2024';
  const subTextColor = isDark ? '#BCAAB3' : '#76666B';
  const pillBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#F5EAE4';
  const pillActiveBg = isDark ? 'rgba(229, 178, 160, 0.2)' : '#EAD5CB';

  return (
    <div
      className="nouveau-layout-container"
      style={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: pageBg,
        color: textColor,
        padding: '36px 24px 70px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes stardust-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 0.85; transform: scale(1.15); }
        }
        .nouveau-layout-container {
          scrollbar-width: thin;
          scrollbar-color: ${goldColor}55 transparent;
        }
        .nouveau-layout-container::-webkit-scrollbar {
          width: 7px;
        }
        .nouveau-layout-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .nouveau-layout-container::-webkit-scrollbar-thumb {
          background: ${goldColor}44;
          border-radius: 4px;
        }
        .nouveau-layout-container::-webkit-scrollbar-thumb:hover {
          background: ${goldColor}88;
        }
      `}</style>

      {/* Ambient Stardust in the Universe */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '8%',
          color: goldColor,
          fontSize: '12px',
          animation: 'stardust-pulse 4s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      >
        ✦
      </div>
      <div
        style={{
          position: 'absolute',
          top: '80px',
          right: '9%',
          color: goldColor,
          fontSize: '14px',
          animation: 'stardust-pulse 5s ease-in-out 1.5s infinite',
          pointerEvents: 'none',
        }}
      >
        ✧
      </div>
      <div
        style={{
          position: 'absolute',
          top: '160px',
          left: '14%',
          color: goldColor,
          fontSize: '10px',
          animation: 'stardust-pulse 6s ease-in-out 3s infinite',
          pointerEvents: 'none',
        }}
      >
        ⋆
      </div>
      <div
        style={{
          position: 'absolute',
          top: '240px',
          right: '15%',
          color: goldColor,
          fontSize: '11px',
          animation: 'stardust-pulse 4.5s ease-in-out 2s infinite',
          pointerEvents: 'none',
        }}
      >
        ✧
      </div>

      <div style={{ width: '100%', maxWidth: '1180px', position: 'relative', zIndex: 1 }}>
        {/* Celestial Universe Header */}
        <div style={{ textAlign: 'center', marginBottom: '34px' }}>
          {/* Header Subtitle with Moons and Stars */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ color: goldColor, fontSize: '13px' }}>☽</span>
            <span
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                fontSize: '13px',
                letterSpacing: '0.22em',
                color: goldColor,
                textTransform: 'uppercase',
              }}
            >
              Sphère Céleste · L'Univers & Les Douze Maisons
            </span>
            <span style={{ color: goldColor, fontSize: '13px' }}>☾</span>
          </div>

          <h1
            style={{
              fontFamily: '"Cinzel Decorative", "Italiana", serif',
              fontSize: 'clamp(30px, 4.8vw, 50px)',
              fontWeight: '700',
              letterSpacing: '0.05em',
              margin: '0 0 10px 0',
              color: textColor,
              lineHeight: '1.15',
              textShadow: isDark ? `0 2px 20px ${goldColor}33` : 'none',
            }}
          >
            {settings.title || 'Khoa.vo'}
          </h1>

          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: '16.5px',
              color: subTextColor,
              margin: '0 auto 16px auto',
              maxWidth: '620px',
              lineHeight: '1.4',
            }}
          >
            {settings.tagline || 'Cartographie céleste des portails et sanctuaires numériques à travers le zodiaque'}
          </p>

          <CelestialDivider color={goldColor} width={320} height={28} />
        </div>

        {/* Search & Planetary Group Filter Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            marginBottom: '38px',
          }}
        >
          {/* Sinuous Oval Capsule Search Input */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: goldColor,
                pointerEvents: 'none',
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Explorer une constellation ou un portail... (/)"
              style={{
                width: '100%',
                padding: '11px 40px 11px 44px',
                borderRadius: '9999px',
                border: `1.2px solid ${goldColor}66`,
                outline: 'none',
                background: isDark ? 'rgba(32, 23, 38, 0.85)' : '#FAF3EE',
                color: textColor,
                fontSize: '13.5px',
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                boxShadow: isDark
                  ? '0 3px 12px rgba(0,0,0,0.35)'
                  : `0 2px 10px ${goldColor}18`,
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = goldColor;
                e.target.style.boxShadow = `0 0 14px ${goldColor}44`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = `${goldColor}66`;
                e.target.style.boxShadow = isDark
                  ? '0 3px 12px rgba(0,0,0,0.35)'
                  : `0 2px 10px ${goldColor}18`;
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: goldColor,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Group Tabs (Sphères & Chapitres) */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            {groups.map((grp, idx) => {
              const isActive = selectedGroup === grp;
              const romanNum = toRoman(idx + 1);
              return (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  style={{
                    background: isActive ? pillActiveBg : pillBg,
                    color: isActive ? goldColor : subTextColor,
                    border: `1px solid ${isActive ? goldColor : `${goldColor}33`}`,
                    borderRadius: '9999px',
                    padding: '6px 16px',
                    fontFamily: '"Cormorant Garamond", serif',
                    fontStyle: 'italic',
                    fontSize: '13px',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: isActive ? `0 0 10px ${goldColor}33` : 'none',
                  }}
                >
                  <span style={{ fontSize: '10px', opacity: 0.75 }}>
                    {grp === 'all' ? '✦' : romanNum + '.'}
                  </span>
                  <span style={{ textTransform: 'capitalize' }}>
                    {grp === 'all' ? 'Toutes les Maisons' : grp}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Folio Grid of Celestial Arched Cards */}
        {filteredLinks.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: '16.5px',
              color: subTextColor,
            }}
          >
            <p>Aucun astre ne correspond à votre recherche « {searchQuery} ».</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredLinks.map((item, index) => {
              const pingKey = item.id || item.link;
              return (
                <NouveauCard
                  key={item.id || item.link || index}
                  item={item}
                  index={index}
                  isDark={isDark}
                  pingStatus={pingResults[pingKey]}
                  goldColor={goldColor}
                  textColor={textColor}
                  subTextColor={subTextColor}
                />
              );
            })}
          </div>
        )}

        {/* Vintage Celestial Footer Delimiter */}
        <div style={{ textAlign: 'center', marginTop: '64px', opacity: 0.75 }}>
          <CelestialDivider color={goldColor} width={220} height={20} />
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: '12.5px',
              color: subTextColor,
              marginTop: '10px',
              letterSpacing: '0.08em',
            }}
          >
            ✧ Fin de la cartographie céleste — {filteredLinks.length} astres répertoriés dans l'Univers ✧
          </div>
        </div>
      </div>
    </div>
  );
}
