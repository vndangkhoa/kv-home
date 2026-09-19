import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { getServiceIconUrl } from '../../utils/iconResolver';

const GLYPHS = '█▓▒░/\\*+-<>!#%&?=~_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * 2026 Kinetic Cryptographic Glyph Decryption Hook
 */
function useScrambleText(originalText = '', isTriggered = false) {
  const [scrambled, setScrambled] = useState(null);

  useEffect(() => {
    if (!isTriggered) return;

    let iteration = 0;
    const len = originalText.length;
    const maxIterations = Math.min(len * 2, 28);
    const interval = setInterval(() => {
      setScrambled(
        originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration / 2) return originalText[index];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('')
      );

      iteration += 1;
      if (iteration >= maxIterations) {
        setScrambled(null);
        clearInterval(interval);
      }
    }, 22);

    return () => clearInterval(interval);
  }, [originalText, isTriggered]);

  return isTriggered && scrambled !== null ? scrambled : originalText;
}

/**
 * Editorial Miniature Barcode Graphic
 */
function MiniBarcode({ color = 'currentColor', height = 16 }) {
  return (
    <svg
      width="58"
      height={height}
      viewBox="0 0 58 16"
      fill="none"
      style={{ opacity: 0.8, flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="2" height="16" fill={color} />
      <rect x="4" y="0" width="1" height="16" fill={color} />
      <rect x="7" y="0" width="3" height="16" fill={color} />
      <rect x="12" y="0" width="1" height="16" fill={color} />
      <rect x="15" y="0" width="2" height="16" fill={color} />
      <rect x="19" y="0" width="4" height="16" fill={color} />
      <rect x="25" y="0" width="1" height="16" fill={color} />
      <rect x="28" y="0" width="2" height="16" fill={color} />
      <rect x="32" y="0" width="1" height="16" fill={color} />
      <rect x="35" y="0" width="3" height="16" fill={color} />
      <rect x="40" y="0" width="2" height="16" fill={color} />
      <rect x="44" y="0" width="1" height="16" fill={color} />
      <rect x="47" y="0" width="4" height="16" fill={color} />
      <rect x="53" y="0" width="2" height="16" fill={color} />
      <rect x="56" y="0" width="2" height="16" fill={color} />
    </svg>
  );
}

/**
 * High-Impact Kinetic Marquee Telemetry Ticker
 */
function KineticTicker({ linksCount, isDark, accentColor }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    `SYS // ONLINE`,
    `DAEMON ENDPOINTS // ${linksCount}`,
    `UTC CLOCK // ${timeStr || 'LIVE'}`,
    `PROTOCOL // HTTP/3 QUICK-CONNECT`,
    `LAYOUT // KINETIC-ITALIC TYPE-ENGINE`,
    `TELEMETRY // OPTIMAL`,
    `PRINT SPEC // 300 DPI ARCHIVE`,
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '32px',
        minHeight: '32px',
        maxHeight: '32px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        background: isDark ? '#050507' : '#111114',
        color: accentColor,
        borderTop: `1px solid ${accentColor}33`,
        borderBottom: `1.5px solid ${accentColor}`,
        padding: '0',
        fontFamily: '"Space Mono", monospace',
        fontSize: '11px',
        fontWeight: '700',
        lineHeight: 1,
        letterSpacing: '0.16em',
        userSelect: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '36px',
          animation: 'kineticMarquee 26s linear infinite',
          willChange: 'transform',
        }}
      >
        {[...items, ...items, ...items].map((t, idx) => (
          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', lineHeight: 1, flexShrink: 0 }}>
            <span style={{ fontSize: '9px', opacity: 0.8, lineHeight: 1 }}>✛</span>
            <span style={{ lineHeight: 1 }}>{t}</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes kineticMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

/**
 * Curated Service Icon with Monochrome Stamp Mode & Hover Inversion
 */
function KineticServiceIcon({ item, isDark, isHovered, accentColor }) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = useMemo(() => getServiceIconUrl(item), [item]);
  const hasIcon = iconUrl && !imgError;
  const initials = (item.title || item.label || 'KV').slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        width: '38px',
        height: '38px',
        background: isHovered
          ? '#000000'
          : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
        color: isHovered ? accentColor : (isDark ? '#FFFFFF' : '#111113'),
        border: `1.5px solid ${isHovered ? '#000000' : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)')}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transform: isHovered ? 'skewX(-14deg) scale(1.08)' : 'skewX(-8deg) scale(1)',
        boxShadow: isHovered
          ? (isDark ? `0 0 14px ${accentColor}88` : '3px 3px 0px #000000')
          : 'none',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {hasIcon ? (
        <img
          src={iconUrl}
          alt={item.title || item.label}
          onError={() => setImgError(true)}
          style={{
            width: '20px',
            height: '20px',
            objectFit: 'contain',
            transform: isHovered ? 'skewX(14deg)' : 'skewX(8deg)',
            filter: isHovered
              ? 'none'
              : (isDark
                ? 'grayscale(100%) brightness(1.2) contrast(1.2)'
                : 'grayscale(100%) contrast(1.4) brightness(0.2)'),
            transition: 'filter 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '11px',
            fontWeight: '700',
            transform: isHovered ? 'skewX(14deg)' : 'skewX(8deg)',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

/**
 * 2026 Kinetic Title with Holographic Decryption Scramble & Chromatic Aberration
 */
function KineticTitle({ text, isHovered, isDark, _accentColor }) {
  const scrambled = useScrambleText(text, isHovered);

  return (
    <h2
      className="kinetic-title-text"
      style={{
        fontFamily: '"Syne", sans-serif',
        fontSize: 'clamp(22px, 3.8vw, 44px)',
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: isHovered ? '-0.015em' : '-0.045em',
        textTransform: 'uppercase',
        lineHeight: '0.94',
        margin: 0,
        transform: isHovered ? 'translateX(10px) skewX(-4deg)' : 'translateX(0) skewX(0deg)',
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), letter-spacing 0.22s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textShadow: isHovered
          ? (isDark
            ? '-1.5px 0 #00E5FF, 1.5px 0 #FF0055'
            : '-1.5px 0 rgba(0,229,255,0.8), 1.5px 0 rgba(255,0,85,0.8)')
          : 'none',
      }}
    >
      {scrambled}
    </h2>
  );
}

/**
 * Dynamic Runaway Telemetry Ticker on Hover
 */
function KineticTelemetryTape({ subtitle, isHovered, _isDark, _accentColor }) {
  if (!subtitle) return null;

  return (
    <div
      style={{
        display: 'none',
        position: 'relative',
        overflow: 'hidden',
        height: '20px',
        alignItems: 'center',
        maxWidth: '380px',
      }}
      className="kinetic-subtitle"
    >
      {!isHovered ? (
        <span
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '11px',
            fontStyle: 'italic',
            opacity: 0.55,
            whiteSpace: 'nowrap',
            display: 'inline-block',
            transition: 'opacity 0.2s ease',
          }}
        >
          / {subtitle}
        </span>
      ) : (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            whiteSpace: 'nowrap',
            animation: 'kineticTapeScroll 8s linear infinite',
            fontFamily: '"Space Mono", monospace',
            fontSize: '10.5px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#000000',
          }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>// {subtitle}</span>
              <span style={{ fontSize: '8px' }}>■</span>
              <span>TELEMETRY ONLINE</span>
              <span style={{ fontSize: '8px' }}>■</span>
              <span>CONNECT ➔</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Kinetic Full-Bleed Typographic Strip (List Mode) with Diagonal Polygon Wipe
 */
function KineticStripRow({ item, index, isDark, pingStatus, accentColor }) {
  const [isHovered, setIsHovered] = useState(false);
  const numIndex = String(index + 1).padStart(2, '0');
  const isHealthy = !pingStatus || pingStatus.ok;
  const subtitle = item.subtitle || item.description || '';

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        textDecoration: 'none',
        position: 'relative',
        color: isHovered ? '#000000' : (isDark ? '#FFFFFF' : '#111113'),
        borderBottom: `1.5px solid ${isHovered ? '#000000' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
        overflow: 'hidden',
        transition: 'color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* High-Speed Diagonal Polygon Wipe Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: accentColor,
          clipPath: isHovered
            ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
            : 'polygon(0 0, 0 0, 0 100%, 0 100%)',
          transition: 'clip-path 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Left: Index + Icon + Kinetic Title + Telemetry Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1, minWidth: 0 }}>
        {/* Slanted Index Number with bracket snap */}
        <span
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '12px',
            fontWeight: '700',
            fontStyle: 'italic',
            opacity: isHovered ? 1 : 0.45,
            width: '30px',
            flexShrink: 0,
            transition: 'all 0.18s ease',
            letterSpacing: isHovered ? '0.04em' : '0em',
          }}
        >
          {isHovered ? `[${numIndex}]` : numIndex}
        </span>

        <KineticServiceIcon item={item} isDark={isDark} isHovered={isHovered} accentColor={accentColor} />

        {/* Slanted Title with Decryption & Subtitle Tape */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', minWidth: 0 }}>
          <KineticTitle
            text={item.title || item.label}
            isHovered={isHovered}
            isDark={isDark}
            accentColor={accentColor}
          />

          <KineticTelemetryTape
            subtitle={subtitle}
            isHovered={isHovered}
            isDark={isDark}
            accentColor={accentColor}
          />
        </div>
      </div>

      {/* Right: Tag Pill + Latency Dot + Angled Action Arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1, flexShrink: 0 }}>
        {item.group && (
          <span
            className="hidden sm:inline-block"
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              padding: '3px 8px',
              border: `1px solid ${isHovered ? '#000000' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}`,
              background: isHovered ? 'rgba(0,0,0,0.1)' : 'transparent',
              transform: 'skewX(-8deg)',
              transition: 'border-color 0.18s ease',
            }}
          >
            <span style={{ display: 'inline-block', transform: 'skewX(8deg)' }}>
              {item.group}
            </span>
          </span>
        )}

        {/* Real-time ping indicator */}
        <div
          title={isHealthy ? 'Online' : 'Unreachable'}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isHovered ? '#000000' : (isHealthy ? '#10B981' : '#EF4444'),
            boxShadow: isHovered ? 'none' : (isHealthy ? '0 0 6px #10B981' : '0 0 6px #EF4444'),
            transition: 'background 0.18s ease',
          }}
        />

        {/* Oversized Slanted Arrow with spring snap */}
        <span
          style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: 'clamp(20px, 3vw, 32px)',
            fontWeight: '900',
            fontStyle: 'italic',
            transform: isHovered ? 'translate(4px, -4px) scale(1.2)' : 'translate(0, 0) scale(1)',
            transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'inline-block',
          }}
        >
          ↗
        </span>
      </div>
    </a>
  );
}

/**
 * Kinetic Poster Block (Grid Mode) with Barcode & Editorial Frame
 */
function KineticPosterCard({ item, index, isDark, pingStatus, accentColor }) {
  const [isHovered, setIsHovered] = useState(false);
  const numIndex = String(index + 1).padStart(2, '0');
  const isHealthy = !pingStatus || pingStatus.ok;
  const title = item.title || item.label;
  const scrambledTitle = useScrambleText(title, isHovered);

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
        padding: '24px 20px',
        textDecoration: 'none',
        position: 'relative',
        background: isHovered
          ? accentColor
          : (isDark ? '#0D0D11' : '#FFFFFF'),
        color: isHovered
          ? '#000000'
          : (isDark ? '#FFFFFF' : '#111113'),
        border: `2px solid ${isHovered ? '#000000' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')}`,
        transform: isHovered ? 'translate(-4px, -4px)' : 'translate(0, 0)',
        boxShadow: isHovered
          ? (isDark ? '6px 6px 0 #FFFFFF' : '6px 6px 0 #000000')
          : 'none',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        minHeight: '210px',
        overflow: 'hidden',
      }}
    >
      {/* Corner Crop Marks inside Card */}
      <span
        style={{
          position: 'absolute',
          top: '6px',
          left: '8px',
          fontFamily: '"Space Mono", monospace',
          fontSize: '9px',
          opacity: 0.35,
          userSelect: 'none',
        }}
      >
        ⌜
      </span>
      <span
        style={{
          position: 'absolute',
          top: '6px',
          right: '8px',
          fontFamily: '"Space Mono", monospace',
          fontSize: '9px',
          opacity: 0.35,
          userSelect: 'none',
        }}
      >
        ⌝
      </span>

      {/* Colossal Watermark Number in Background */}
      <span
        style={{
          position: 'absolute',
          right: '8px',
          bottom: '-14px',
          fontFamily: '"Syne", sans-serif',
          fontSize: '104px',
          fontWeight: '900',
          fontStyle: 'italic',
          lineHeight: '0.8',
          opacity: isHovered ? 0.14 : (isDark ? 0.05 : 0.04),
          pointerEvents: 'none',
          userSelect: 'none',
          transform: isHovered ? 'skewX(-4deg) translateX(4px)' : 'skewX(0)',
          transition: 'transform 0.22s ease',
        }}
      >
        {numIndex}
      </span>

      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <KineticServiceIcon item={item} isDark={isDark} isHovered={isHovered} accentColor={accentColor} />
          <span
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: '11px',
              fontWeight: '700',
              fontStyle: 'italic',
            }}
          >
            INDEX // {numIndex}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            title={isHealthy ? 'Online' : 'Unreachable'}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isHovered ? '#000000' : (isHealthy ? '#10B981' : '#EF4444'),
            }}
          />
          <span
            style={{
              fontFamily: '"Syne", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              fontStyle: 'italic',
              transform: isHovered ? 'translate(2px, -2px) scale(1.15)' : 'none',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            ↗
          </span>
        </div>
      </div>

      {/* Middle: Giant Italic Title with Decryption */}
      <div style={{ margin: '22px 0 16px 0', zIndex: 1 }}>
        <h3
          style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: 'clamp(22px, 2.5vw, 34px)',
            fontWeight: '900',
            fontStyle: 'italic',
            letterSpacing: isHovered ? '-0.02em' : '-0.04em',
            textTransform: 'uppercase',
            lineHeight: '0.92',
            margin: '0 0 8px 0',
            textShadow: isHovered
              ? (isDark ? '-1px 0 #00E5FF, 1px 0 #FF0055' : '-1px 0 rgba(0,229,255,0.7), 1px 0 rgba(255,0,85,0.7)')
              : 'none',
          }}
        >
          {scrambledTitle}
        </h3>

        {(item.subtitle || item.description) && (
          <p
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: '11px',
              margin: 0,
              opacity: isHovered ? 0.9 : 0.6,
              lineHeight: '1.4',
            }}
          >
            {item.subtitle || item.description}
          </p>
        )}
      </div>

      {/* Bottom: Barcode + Group Tag */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${isHovered ? '#00000033' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
          paddingTop: '10px',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '9.5px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          TAG // {item.group || 'GENERAL'}
        </span>

        <MiniBarcode color={isHovered ? '#000000' : (isDark ? '#FFFFFF' : '#111113')} height={14} />
      </div>
    </a>
  );
}

export default function KineticItalicLayout({ links = [], isDark = true, settings = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [viewMode, setViewMode] = useState('strips'); // 'strips' | 'poster'
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

  // Stable targets signature: only re-probe if target links actually change
  const targetsSignature = useMemo(() => {
    return (links || []).map((l) => `${l.id || ''}:${l.link || ''}`).join('|');
  }, [links]);

  // Periodic health check
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function probeHealth() {
      const updates = {};
      for (const item of links) {
        if (!item.link || !isMounted) continue;
        const key = item.id || item.link;
        try {
          const res = await fetch(`/api/ping?target=${encodeURIComponent(item.link)}`, {
            signal: controller.signal,
          });
          if (res.ok) {
            const data = await res.json();
            updates[key] = data;
          } else {
            updates[key] = { ok: false, error: 'ERR' };
          }
        } catch (err) {
          if (err.name === 'AbortError') return;
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
      controller.abort();
      clearInterval(interval);
    };
  }, [targetsSignature]);

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

  // Styling: Warm Archival Paper in light mode, Obsidian Noir in dark mode
  const pageBg = isDark ? '#0A0A0D' : '#F5F2EB';
  const textColor = isDark ? '#FFFFFF' : '#111113';
  const accentColor = isDark ? '#D4FF00' : '#FF3700'; // Volt Lime in dark, Bauhaus Vermilion in light
  const borderRule = isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(0,0,0,0.1)';

  return (
    <div
      className="kinetic-layout-container"
      style={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: pageBg,
        backgroundImage: isDark
          ? 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 0)'
          : 'radial-gradient(rgba(0, 0, 0, 0.055) 1px, transparent 0)',
        backgroundSize: '20px 20px',
        color: textColor,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <style>{`
        .kinetic-layout-container {
          scrollbar-width: thin;
          scrollbar-color: ${accentColor} transparent;
        }
        .kinetic-layout-container::-webkit-scrollbar {
          width: 6px;
        }
        .kinetic-layout-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .kinetic-layout-container::-webkit-scrollbar-thumb {
          background: ${accentColor}88;
        }
        .kinetic-layout-container::-webkit-scrollbar-thumb:hover {
          background: ${accentColor};
        }
        @keyframes kineticTapeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @media (min-width: 768px) {
          .kinetic-subtitle {
            display: inline-flex !important;
          }
        }
      `}</style>

      {/* High-Impact Kinetic Marquee Telemetry Ticker */}
      <KineticTicker linksCount={links.length} isDark={isDark} accentColor={accentColor} />

      <div
        className="p-3 sm:p-6 pb-20 sm:pb-24"
        style={{
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Editorial Top Registration Marks */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            fontFamily: '"Space Mono", monospace',
            fontSize: '10px',
            letterSpacing: '0.14em',
            opacity: 0.45,
            userSelect: 'none',
          }}
        >
          <span>⌜ REGISTER: HOMELAB_CATALOGUE_2026</span>
          <span>SYSTEM_GRID // 300_DPI ⌝</span>
        </div>

        {/* Massive Slanted Hero Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '24px',
            marginBottom: '36px',
            paddingBottom: '24px',
            borderBottom: `2.5px solid ${textColor}`,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.2em',
                color: accentColor,
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>// SYSTEM DIRECTORY VOL. {new Date().getFullYear()}</span>
              <span style={{ fontSize: '9px', opacity: 0.7 }}>✛</span>
              <span>INDEX UNITS: {links.length}</span>
            </div>

            <h1
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: 'clamp(30px, 7.5vw, 84px)',
                fontWeight: '900',
                fontStyle: 'italic',
                letterSpacing: '-0.055em',
                textTransform: 'uppercase',
                lineHeight: '0.9',
                margin: 0,
              }}
            >
              {settings.title || 'Khoa.vo'}
            </h1>

            {settings.tagline && (
              <p
                style={{
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '13px',
                  margin: '12px 0 0 0',
                  opacity: 0.7,
                  letterSpacing: '0.02em',
                }}
              >
                {settings.tagline}
              </p>
            )}
          </div>

          {/* View Mode Toggle Buttons & Barcode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div className="hidden sm:block">
              <MiniBarcode color={textColor} height={20} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setViewMode('strips')}
                title="Kinetic Strips (Editorial List)"
                style={{
                  background: viewMode === 'strips' ? textColor : 'transparent',
                  color: viewMode === 'strips' ? (isDark ? '#000000' : '#FFFFFF') : textColor,
                  border: `1.5px solid ${textColor}`,
                  padding: '8px 14px',
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transform: 'skewX(-8deg)',
                  transition: 'all 0.15s ease',
                }}
              >
                <List size={13} style={{ transform: 'skewX(8deg)' }} />
                <span style={{ transform: 'skewX(8deg)' }}>STRIPS</span>
              </button>

              <button
                onClick={() => setViewMode('poster')}
                title="Poster Blocks (Editorial Grid)"
                style={{
                  background: viewMode === 'poster' ? textColor : 'transparent',
                  color: viewMode === 'poster' ? (isDark ? '#000000' : '#FFFFFF') : textColor,
                  border: `1.5px solid ${textColor}`,
                  padding: '8px 14px',
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transform: 'skewX(-8deg)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Grid size={13} style={{ transform: 'skewX(8deg)' }} />
                <span style={{ transform: 'skewX(8deg)' }}>POSTER</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar: Brutalist Search & Category Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* High-Contrast Search Input */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
            }}
          >
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: textColor,
                opacity: 0.7,
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH PROTOCOLS... (Press /)"
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                background: isDark ? '#121217' : '#FFFFFF',
                color: textColor,
                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                fontFamily: '"Space Mono", monospace',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: textColor,
                  cursor: 'pointer',
                  fontWeight: '700',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Group Category Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {groups.map((grp) => {
              const isActive = selectedGroup === grp;
              return (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  style={{
                    background: isActive ? accentColor : 'transparent',
                    color: isActive ? '#000000' : textColor,
                    border: `1px solid ${isActive ? accentColor : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}`,
                    padding: '6px 12px',
                    fontFamily: '"Space Mono", monospace',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    transform: 'skewX(-8deg)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ display: 'inline-block', transform: 'skewX(8deg)' }}>
                    {grp}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Services List / Grid */}
        {filteredLinks.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              border: borderRule,
              fontFamily: '"Space Mono", monospace',
              fontSize: '13px',
              opacity: 0.7,
            }}
          >
            // ZERO UNITS FOUND MATCHING &quot;{searchQuery}&quot;
          </div>
        ) : viewMode === 'strips' ? (
          /* Strips View (Full Bleed Stacked Bands) */
          <div
            style={{
              borderTop: `1.5px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'}`,
            }}
          >
            {filteredLinks.map((item, index) => {
              const pingKey = item.id || item.link;
              return (
                <KineticStripRow
                  key={item.id || item.link || index}
                  item={item}
                  index={index}
                  isDark={isDark}
                  pingStatus={pingResults[pingKey]}
                  accentColor={accentColor}
                />
              );
            })}
          </div>
        ) : (
          /* Poster View (Editorial Asymmetric Grid) */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))',
              gap: '14px',
            }}
          >
            {filteredLinks.map((item, index) => {
              const pingKey = item.id || item.link;
              return (
                <KineticPosterCard
                  key={item.id || item.link || index}
                  item={item}
                  index={index}
                  isDark={isDark}
                  pingStatus={pingResults[pingKey]}
                  accentColor={accentColor}
                />
              );
            })}
          </div>
        )}

        {/* Editorial Colophon & Bottom Crop Marks */}
        <div
          style={{
            marginTop: '60px',
            paddingTop: '20px',
            borderTop: `2px solid ${textColor}`,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: '"Space Mono", monospace',
            fontSize: '11px',
            opacity: 0.75,
            gap: '12px',
          }}
        >
          <span>INDEX COUNT: {filteredLinks.length} / {links.length} UNITS</span>
          <span style={{ color: accentColor, fontWeight: '700' }}>
            TYPE SET: SYNE 900 ITALIC + SPACE MONO
          </span>
          <span>AUTONOMOUS DISPATCH // ACTIVE</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            fontFamily: '"Space Mono", monospace',
            fontSize: '10px',
            letterSpacing: '0.14em',
            opacity: 0.45,
            userSelect: 'none',
          }}
        >
          <span>⌞ END_OF_REGISTER // EDITION_01</span>
          <span>KINETIC_MOTION_ENGINE_2026 ⌟</span>
        </div>
      </div>
    </div>
  );
}
