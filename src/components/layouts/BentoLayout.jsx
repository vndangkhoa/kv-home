import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ExternalLink,
  Activity,
  Sparkles,
  Film,
  Folder,
  X,
  Wifi,
  WifiOff,
  Command
} from 'lucide-react';
import { getVideoFromIndexedDB } from '../../utils/videoStorage';
import { getServiceIcon } from '../../utils/serviceIcons';
import { getServiceIconUrl } from '../../utils/iconResolver';

/**
 * Bento card with video support, vector brand icons, real-time health checks, and ambient glow
 */
function BentoCard({ item, isDark, pingStatus }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState(item.videoUrl || (item.label === 'cv' ? '/cv-video.mp4' : ''));

  const iconUrl = useMemo(() => getServiceIconUrl(item), [item]);
  const hasValidLogo = iconUrl && !imgError;
  const isVideo = !!(item.isVideo || item.label === 'cv');
  const accentColor = item.hoverColor || item.color || '#00BCD4';
  const ServiceIcon = getServiceIcon(item);

  useEffect(() => {
    let active = true;
    let objectUrlToRevoke = null;

    async function loadVideo() {
      const src = item.videoUrl || (item.label === 'cv' ? '/cv-video.mp4' : '');
      if (!src) {
        if (active) setResolvedVideoSrc('');
        return;
      }

      if (src.startsWith('idb://')) {
        try {
          const blobUrl = await getVideoFromIndexedDB(src);
          if (active && blobUrl) {
            objectUrlToRevoke = blobUrl;
            setResolvedVideoSrc(blobUrl);
          }
        } catch {
          // fallback
        }
      } else {
        if (active) setResolvedVideoSrc(src);
      }
    }

    if (isVideo) {
      loadVideo();
    }

    return () => {
      active = false;
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
    };
  }, [item.videoUrl, item.label, isVideo]);

  // Deep dark glassmorphism surfaces
  const cardBg = isDark
    ? (isHovered ? 'rgba(26, 30, 46, 0.78)' : 'rgba(17, 20, 31, 0.68)')
    : (isHovered ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.82)');

  const borderColor = isHovered
    ? `${accentColor}88`
    : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)');

  const shadow = isHovered
    ? `0 16px 36px -8px ${accentColor}33, 0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)`
    : (isDark ? '0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 2px 10px rgba(0, 0, 0, 0.04)');

  const domain = useMemo(() => {
    try {
      const u = new URL(item.link);
      return u.hostname;
    } catch {
      return item.link || '';
    }
  }, [item.link]);

  // Ping latency / status badge helper
  const renderPingBadge = () => {
    if (!pingStatus) {
      // Default direct connection
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: isDark ? '#a1a1aa' : '#64748b' }}>{domain}</span>
        </div>
      );
    }

    if (pingStatus.ok) {
      const latency = pingStatus.latencyMs ?? 0;
      const isFast = latency < 150;
      const isModerate = latency >= 150 && latency < 400;
      const dotColor = isFast ? '#10b981' : (isModerate ? '#f59e0b' : '#3b82f6');

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={`Status: 200 OK (${latency}ms)`}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: dotColor,
            boxShadow: `0 0 8px ${dotColor}`
          }} />
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: isDark ? '#a1a1aa' : '#64748b' }}>{domain}</span>
          <span style={{
            fontSize: '10px',
            padding: '1px 5px',
            borderRadius: '4px',
            background: `${dotColor}18`,
            color: dotColor,
            fontWeight: '600'
          }}>
            {latency}ms
          </span>
        </div>
      );
    }

    // Ping failed / unreachable
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={`Service Unreachable (${pingStatus.error || 'Offline'})`}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#ef4444',
          boxShadow: '0 0 8px #ef4444'
        }} />
        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: isDark ? '#a1a1aa' : '#64748b' }}>{domain}</span>
        <span style={{
          fontSize: '10px',
          padding: '1px 5px',
          borderRadius: '4px',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          fontWeight: '600'
        }}>
          Offline
        </span>
      </div>
    );
  };

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
        borderRadius: '16px',
        background: cardBg,
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
        minHeight: item.featured ? '175px' : '150px',
        gridColumn: item.featured ? 'span 2' : 'span 1',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Ambient background glow on hover */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          background: accentColor,
          opacity: isHovered ? 0.22 : 0.04,
          filter: 'blur(35px)',
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Video preview background if enabled */}
      {isVideo && resolvedVideoSrc && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: isHovered ? 0.85 : 0.45,
          transition: 'opacity 0.3s ease',
          overflow: 'hidden',
        }}>
          <video
            src={resolvedVideoSrc}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(to top, rgba(15,15,15,0.92) 20%, rgba(15,15,15,0.4) 100%)'
              : 'linear-gradient(to top, rgba(255,255,255,0.92) 20%, rgba(255,255,255,0.4) 100%)'
          }} />
        </div>
      )}

      {/* Top row: Category tag & External link */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: '700',
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            color: isDark ? '#a1a1aa' : '#64748b',
          }}>
            {item.group || 'service'}
          </span>
          {item.featured && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: '700',
              background: `${accentColor}22`,
              color: accentColor,
            }}>
              <Sparkles size={11} /> Featured
            </span>
          )}
          {isVideo && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: '700',
              background: 'rgba(255, 87, 34, 0.15)',
              color: '#FF5722',
            }}>
              <Film size={11} /> Video
            </span>
          )}
        </div>

        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isHovered ? accentColor : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'),
          color: isHovered ? '#fff' : (isDark ? '#71717a' : '#94a3b8'),
          transition: 'all 0.2s ease',
        }}>
          <ExternalLink size={13} />
        </div>
      </div>

      {/* Middle: Brand Vector Icon & Titles */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        margin: 'auto 0'
      }}>
        {/* Brand Vector Icon Container */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: hasValidLogo
            ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.92)')
            : (isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.04)'),
          border: `1px solid ${isHovered ? accentColor : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
          flexShrink: 0,
          boxShadow: isHovered ? `0 4px 14px ${accentColor}44` : 'none',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          padding: hasValidLogo ? '6px' : 0,
        }}>
          {hasValidLogo ? (
            <img
              src={iconUrl}
              alt={item.title || item.label}
              loading="lazy"
              onError={() => setImgError(true)}
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'contain',
                filter: isDark ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' : 'none',
              }}
            />
          ) : ServiceIcon ? (
            ServiceIcon({ size: 24, color: accentColor })
          ) : (
            <span style={{
              fontWeight: '700',
              fontSize: '15px',
              color: isDark ? '#fff' : '#111827',
              letterSpacing: '0.5px'
            }}>
              {item.title ? item.title.slice(0, 2).toUpperCase() : (item.label || 'KV').slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            lineHeight: '1.25',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: isDark ? '#f8fafc' : '#0f172a',
          }}>
            {item.title || item.label}
          </div>
          {item.subtitle && (
            <div style={{
              fontSize: '12px',
              marginTop: '4px',
              color: isDark ? '#94a3b8' : '#64748b',
              lineHeight: '1.3',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {item.subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Live Host / Domain / Latency indicator */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '10px',
        borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
        fontSize: '11px',
        color: isDark ? '#71717a' : '#9ca3af',
        marginTop: '12px'
      }}>
        {renderPingBadge()}
        <span style={{ fontSize: '10px', color: isHovered ? accentColor : (isDark ? '#64748b' : '#94a3b8'), transition: 'color 0.2s' }}>
          ↗ Direct
        </span>
      </div>
    </a>
  );
}

export default function BentoLayout({ links = [], isDark = true }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [pingResults, setPingResults] = useState({});
  const searchInputRef = useRef(null);

  // Keyboard shortcut: press '/' to focus search, 'Escape' to clear
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

  // Periodic health ping probe for all services
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
    const timer = setInterval(probeHealth, 60000); // refresh every 60s
    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(timer);
    };
  }, [targetsSignature]);

  const groups = useMemo(() => {
    const list = new Set();
    links.forEach((l) => {
      if (l.group) list.add(l.group);
    });
    return ['all', ...Array.from(list)];
  }, [links]);

  const filteredLinks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return links.filter((item) => {
      const matchGroup = selectedGroup === 'all' || item.group === selectedGroup;
      if (!matchGroup) return false;
      if (!q) return true;
      return (
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.label && item.label.toLowerCase().includes(q)) ||
        (item.link && item.link.toLowerCase().includes(q)) ||
        (item.group && item.group.toLowerCase().includes(q))
      );
    });
  }, [links, searchQuery, selectedGroup]);

  // Online count calculation
  const onlineCount = useMemo(() => {
    const keys = Object.keys(pingResults);
    if (keys.length === 0) return filteredLinks.length;
    return filteredLinks.filter((l) => pingResults[l.id || l.link]?.ok).length;
  }, [filteredLinks, pingResults]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      padding: '16px 24px',
      gap: '20px',
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>
      {/* Controls & Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '16px',
        background: isDark ? 'rgba(17, 20, 31, 0.7)' : 'rgba(255, 255, 255, 0.75)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
        backdropFilter: 'blur(16px)',
        boxShadow: isDark ? '0 8px 30px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.03)',
      }}>
        {/* Search Box */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          minWidth: '240px',
          flex: '1 1 280px',
        }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              color: isDark ? '#71717a' : '#9ca3af',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search services, tools, nodes... (Press /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 36px 9px 38px',
              fontSize: '13px',
              borderRadius: '10px',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              background: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.9)',
              color: isDark ? '#fff' : '#000',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: isDark ? '#888' : '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          ) : (
            <span style={{
              position: 'absolute',
              right: '10px',
              fontSize: '10px',
              fontFamily: 'monospace',
              padding: '2px 5px',
              borderRadius: '4px',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              color: isDark ? '#71717a' : '#94a3af',
              pointerEvents: 'none',
            }}>
              /
            </span>
          )}
        </div>

        {/* Group Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          maxWidth: '100%',
          paddingBottom: '2px',
        }}>
          {groups.map((grp) => {
            const isSelected = selectedGroup === grp;
            return (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9px',
                  fontSize: '12px',
                  fontWeight: isSelected ? '600' : '400',
                  border: `1px solid ${isSelected ? '#00BCD4' : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)')}`,
                  background: isSelected
                    ? (isDark ? 'rgba(0, 188, 212, 0.15)' : '#e0f7fa')
                    : 'transparent',
                  color: isSelected ? '#00BCD4' : (isDark ? '#a1a1aa' : '#64748b'),
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
              >
                {grp === 'all' ? 'All Services' : grp}
              </button>
            );
          })}
        </div>

        {/* Stats Indicator with Pulse */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: isDark ? '#a1a1aa' : '#64748b',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="#10b981" />
            <strong style={{ color: isDark ? '#fff' : '#0f172a' }}>{onlineCount}</strong> of {filteredLinks.length} active
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      {filteredLinks.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          alignItems: 'stretch',
        }}>
          {filteredLinks.map((item) => (
            <BentoCard
              key={item.id || item.label}
              item={item}
              isDark={isDark}
              pingStatus={pingResults[item.id || item.link]}
            />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          gap: '12px',
          color: isDark ? '#71717a' : '#9ca3af',
        }}>
          <Folder size={36} strokeWidth={1.5} />
          <div style={{ fontSize: '14px', fontWeight: '500' }}>No matching services found</div>
          <div style={{ fontSize: '12px' }}>Try searching with a different keyword or select another category.</div>
        </div>
      )}
    </div>
  );
}
