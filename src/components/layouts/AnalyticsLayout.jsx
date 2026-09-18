import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ExternalLink,
  Activity,
  Sun,
  Moon,
  Sliders,
  LayoutGrid,
  List,
  Server,
  FolderTree,
  X,
  Shield,
  Radio,
  Plus,
  ArrowUpRight,
  Globe,
  Clock,
  CloudSun,
  Zap,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { getServiceIconUrl } from '../../utils/iconResolver';
import ClockWidget from '../widgets/ClockWidget';
import WeatherWidget from '../widgets/WeatherWidget';
import NewsTicker from '../widgets/NewsTicker';

/**
 * Service Icon / Logo Component
 */
const ServiceIcon = React.memo(function ServiceIcon({ item, size = 32, isDark = true }) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = useMemo(() => getServiceIconUrl(item), [item]);
  const accentColor = item.hoverColor || item.color || '#10b981';
  const initials = item.title
    ? item.title.slice(0, 2).toUpperCase()
    : item.label
    ? item.label.slice(0, 2).toUpperCase()
    : 'SR';

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        borderRadius: '9px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: isDark
          ? `linear-gradient(135deg, ${accentColor}18, rgba(255, 255, 255, 0.04))`
          : `linear-gradient(135deg, ${accentColor}15, rgba(0, 0, 0, 0.02))`,
        border: `1px solid ${accentColor}${isDark ? '33' : '44'}`,
        boxShadow: `0 2px 8px ${accentColor}${isDark ? '18' : '15'}`,
        flexShrink: 0,
      }}
    >
      {iconUrl && !imgError ? (
        <img
          src={iconUrl}
          alt={item.title || item.label}
          onError={() => setImgError(true)}
          style={{ width: `${Math.round(size * 0.65)}px`, height: `${Math.round(size * 0.65)}px`, objectFit: 'contain' }}
        />
      ) : (
        <span style={{ fontSize: `${Math.round(size * 0.34)}px`, fontWeight: '700', color: accentColor }}>
          {initials}
        </span>
      )}
    </div>
  );
});

/**
 * Bento Featured Hero Card: Prominent, wide hero card at the top of the dashboard
 */
function FeaturedHeroCard({ item, pingStatus, hotkeyIndex, theme, isDark = true }) {
  const [isHovered, setIsHovered] = useState(false);
  const accentColor = item.hoverColor || item.color || '#10b981';
  const isHealthy = !pingStatus || pingStatus.ok !== false;
  const latency = pingStatus?.latencyMs;

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
        padding: '18px 22px',
        borderRadius: '18px',
        background: isHovered
          ? (isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)), #161F33' : '#ffffff')
          : (isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), #111726' : '#ffffff'),
        border: `1px solid ${isHovered ? `${accentColor}88` : `${accentColor}44`}`,
        boxShadow: isHovered
          ? `0 16px 36px -6px ${accentColor}33, 0 6px 18px rgba(0,0,0,0.4)`
          : `0 4px 20px ${accentColor}12, ${theme.cardShadow}`,
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
        minHeight: '155px',
        boxSizing: 'border-box',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Ambient background accent glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: accentColor,
          opacity: isHovered ? (isDark ? 0.30 : 0.20) : (isDark ? 0.16 : 0.08),
          filter: 'blur(36px)',
          pointerEvents: 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Top row: Icon + Title & Subtitle + Badges & Launch button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ServiceIcon item={item} size={48} isDark={isDark} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: '800',
                  color: theme.textPrimary,
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}
              >
                {item.title || item.label}
              </h3>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  background: `${accentColor}${isDark ? '25' : '18'}`,
                  color: accentColor,
                  border: `1px solid ${accentColor}${isDark ? '55' : '44'}`,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Sparkles size={10} />
                Featured
              </span>
            </div>
            <p
              style={{
                fontSize: '12.5px',
                color: theme.textSecondary,
                margin: 0,
                fontWeight: '500',
              }}
            >
              {item.subtitle || 'Production Service'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {hotkeyIndex && (
            <span
              title={`Press '${hotkeyIndex}' to launch`}
              style={{
                fontSize: '10.5px',
                fontFamily: 'monospace',
                fontWeight: '700',
                padding: '2px 7px',
                borderRadius: '6px',
                background: theme.badgeBg,
                color: theme.textMuted,
                border: `1px solid ${theme.border}`,
              }}
            >
              {hotkeyIndex}
            </span>
          )}
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'capitalize',
              padding: '3px 9px',
              borderRadius: '6px',
              background: theme.badgeBg,
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
            }}
          >
            {item.group || 'general'}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '7px',
              background: isHovered ? accentColor : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'),
              color: isHovered ? '#ffffff' : theme.textMuted,
              fontSize: '11px',
              fontWeight: '700',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Launch</span>
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>

      {/* Bottom row: Health status, real latency, and endpoint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '10px',
          borderTop: `1px solid ${theme.borderSubtle}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isHealthy ? '#10b981' : '#ef4444',
              boxShadow: isHealthy ? '0 0 10px #10b981' : '0 0 10px #ef4444',
            }}
          />
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: '700',
              color: isHealthy ? (isDark ? '#34d399' : '#059669') : (isDark ? '#f87171' : '#dc2626'),
            }}
          >
            {isHealthy ? (typeof latency === 'number' ? `${latency}ms Latency` : 'Active') : 'Offline'}
          </span>
        </div>

        <span style={{ fontSize: '11px', color: theme.textMuted, fontFamily: 'monospace' }}>
          {(() => {
            try {
              return new URL(item.link).hostname;
            } catch {
              return item.link;
            }
          })()}
        </span>
      </div>
    </a>
  );
}

/**
 * Bento Standard Service Card: Substantial, clean box with comfortable proportions
 */
function ServiceCard({ item, pingStatus, hotkeyIndex, isFeatured = false, theme, isDark = true }) {
  const [isHovered, setIsHovered] = useState(false);
  const accentColor = item.hoverColor || item.color || '#10b981';
  const isHealthy = !pingStatus || pingStatus.ok !== false;
  const latency = pingStatus?.latencyMs;

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
        padding: '16px 18px',
        borderRadius: '16px',
        background: isHovered ? theme.cardBgHover : theme.cardBg,
        border: `1px solid ${isHovered ? `${accentColor}66` : isFeatured ? `${accentColor}44` : theme.border}`,
        boxShadow: isHovered ? theme.hoverShadow(accentColor) : theme.cardShadow,
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
        minHeight: '146px',
        gridColumn: 'span 1',
        boxSizing: 'border-box',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Ambient corner glow */}
      <div
        style={{
          position: 'absolute',
          top: '-35px',
          right: '-35px',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          background: accentColor,
          opacity: isHovered ? (isDark ? 0.24 : 0.15) : (isDark ? 0.08 : 0.04),
          filter: 'blur(26px)',
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Top row: Icon + Hotkey badge + Category Badge + Launch icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ServiceIcon item={item} size={42} isDark={isDark} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {hotkeyIndex && (
            <span
              title={`Press '${hotkeyIndex}' to launch`}
              style={{
                fontSize: '10.5px',
                fontFamily: 'monospace',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '5px',
                background: theme.badgeBg,
                color: theme.textMuted,
                border: `1px solid ${theme.border}`,
              }}
            >
              {hotkeyIndex}
            </span>
          )}

          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'capitalize',
              padding: '2.5px 8px',
              borderRadius: '6px',
              background: theme.badgeBg,
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
            }}
          >
            {item.group || 'general'}
          </span>

          <div
            style={{
              padding: '4px',
              borderRadius: '6px',
              background: isHovered ? (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)') : 'transparent',
              color: isHovered ? (isDark ? '#fff' : '#000') : theme.textMuted,
              transition: 'all 0.15s',
            }}
          >
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>

      {/* Center: Title and Subtitle */}
      <div style={{ marginTop: '10px', position: 'relative', zIndex: 1 }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: '700',
            color: theme.textPrimary,
            margin: '0 0 3px 0',
            letterSpacing: '-0.25px',
            lineHeight: 1.25,
          }}
        >
          {item.title || item.label}
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: theme.textSecondary,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.subtitle || item.link}
        </p>
      </div>

      {/* Bottom: Health Status & Latency readout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
          paddingTop: '9px',
          borderTop: `1px solid ${theme.borderSubtle}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '7.5px',
              height: '7.5px',
              borderRadius: '50%',
              background: isHealthy ? '#10b981' : '#ef4444',
              boxShadow: isHealthy ? '0 0 8px #10b981' : '0 0 8px #ef4444',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: isHealthy ? (isDark ? '#34d399' : '#059669') : (isDark ? '#f87171' : '#dc2626'),
            }}
          >
            {isHealthy ? (typeof latency === 'number' ? `${latency}ms` : 'Active') : 'Offline'}
          </span>
        </div>

        <span style={{ fontSize: '11px', color: theme.textMuted, fontFamily: 'monospace' }}>
          {(() => {
            try {
              return new URL(item.link).hostname;
            } catch {
              return item.link;
            }
          })()}
        </span>
      </div>
    </a>
  );
}

export default function AnalyticsLayout({
  links = [],
  isDark = true,
  settings = {},
  onSaveSettings,
  onOpenAdmin,
  toggleTheme,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'sections' | 'table'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [gridColumns, setGridColumns] = useState('auto'); // 'auto' | '4' | '6'
  const [pingResults, setPingResults] = useState({});
  const searchInputRef = useRef(null);

  // Dynamic semantic color tokens for Dark vs Light mode
  const theme = useMemo(() => ({
    bg: isDark ? '#0A0E17' : '#F8FAFC',
    cardBg: isDark ? '#111726' : '#FFFFFF',
    cardBgHover: isDark ? '#151D2F' : '#F1F5F9',
    sidebarBg: isDark ? '#0A0E17' : '#FFFFFF',
    inputBg: isDark ? '#111726' : '#FFFFFF',
    subtleBg: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
    badgeBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    borderSubtle: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    textPrimary: isDark ? '#F8FAFC' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    textMuted: isDark ? '#64748B' : '#94A3B8',
    cardShadow: isDark
      ? '0 4px 16px rgba(0, 0, 0, 0.35)'
      : '0 4px 16px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
    hoverShadow: (accent) => isDark
      ? `0 14px 30px -6px ${accent}25, 0 4px 14px rgba(0, 0, 0, 0.45)`
      : `0 12px 24px -4px ${accent}20, 0 4px 12px rgba(15, 23, 42, 0.08)`,
  }), [isDark]);

  // Dynamic groups from links
  const groups = useMemo(() => {
    const set = new Set();
    links.forEach((l) => {
      if (l.group) set.add(l.group);
    });
    return ['all', ...Array.from(set)];
  }, [links]);

  // Filtered links based on search & category
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

  // Bento layout grouping: Hero featured cards on top, followed by standard cluster services
  const featuredServices = useMemo(() => filteredLinks.filter((item) => !!item.featured), [filteredLinks]);
  const regularServices = useMemo(() => filteredLinks.filter((item) => !item.featured), [filteredLinks]);
  const allOrderedLinks = useMemo(() => [...featuredServices, ...regularServices], [featuredServices, regularServices]);

  // Keyboard shortcuts: Cmd+K, /, and 1-9 fast-launch
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= 9 && allOrderedLinks[num - 1]?.link) {
          e.preventDefault();
          window.open(allOrderedLinks[num - 1].link, '_blank', 'noopener,noreferrer');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allOrderedLinks]);

  // Fast parallel ping health probes for real homelab services
  useEffect(() => {
    let isMounted = true;
    async function probeHealth() {
      const updates = {};
      await Promise.allSettled(
        links.map(async (item) => {
          if (!item.link) return;
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
        })
      );
      if (isMounted) {
        setPingResults((prev) => ({ ...prev, ...updates }));
      }
    }

    probeHealth();
    const timer = setInterval(probeHealth, 60000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [links]);

  // Real homelab telemetry metrics
  const totalCount = links.length;
  const onlineCount = useMemo(() => {
    const keys = Object.keys(pingResults);
    if (keys.length === 0) return totalCount;
    return links.filter((l) => pingResults[l.id || l.link]?.ok !== false).length;
  }, [links, pingResults, totalCount]);

  const onlineRate = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 100;

  // Real group count distribution for progress bar
  const groupCounts = useMemo(() => {
    const counts = {};
    links.forEach((l) => {
      const g = l.group || 'other';
      counts[g] = (counts[g] || 0) + 1;
    });
    return counts;
  }, [links]);

  // Real average probe latency
  const avgLatency = useMemo(() => {
    const validLatencies = Object.values(pingResults)
      .filter((p) => p.ok && typeof p.latencyMs === 'number')
      .map((p) => p.latencyMs);
    if (validLatencies.length === 0) return null;
    const sum = validLatencies.reduce((a, b) => a + b, 0);
    return Math.round(sum / validLatencies.length);
  }, [pingResults]);

  const appTitle = settings.title || 'ApexCloud';
  const weatherConfig = settings.widgets?.weather || {};
  const clockConfig = settings.widgets?.clock || {};
  const newsConfig = settings.widgets?.news?.topStrip || {};

  const sidebarWidth = isSidebarCollapsed ? 48 : 148;

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        background: theme.bg,
        color: theme.textPrimary,
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* Left Slim Sidebar Navigation Rail */}
      <aside
        style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: `1px solid ${theme.border}`,
          background: theme.sidebarBg,
          padding: isSidebarCollapsed ? '10px 4px' : '12px 7px',
          boxSizing: 'border-box',
          transition: 'width 0.2s ease, min-width 0.2s ease, padding 0.2s ease, background-color 0.25s ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Brand Header with Collapse Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', paddingLeft: isSidebarCollapsed ? '0' : '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div
                style={{
                  width: '27px',
                  height: '27px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(16, 185, 129, 0.25)',
                  flexShrink: 0,
                }}
              >
                <Activity size={15} color="#0A0E17" strokeWidth={2.5} />
              </div>
              {!isSidebarCollapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: theme.textPrimary, display: 'block', textTransform: 'capitalize', letterSpacing: '-0.3px', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                    {appTitle}
                  </span>
                  <span style={{ fontSize: '8.5px', fontWeight: '700', color: '#10B981', letterSpacing: '0.4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10B981' }} />
                    Homelab Hub
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textMuted,
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
          </div>

          {/* Navigation Categories */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {!isSidebarCollapsed && (
              <div style={{ fontSize: '9.5px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 6px 2px 6px' }}>
                Categories
              </div>
            )}

            {groups.map((grp) => {
              const isActive = selectedGroup === grp;
              const count = grp === 'all' ? totalCount : links.filter((l) => l.group === grp).length;

              return (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  title={isSidebarCollapsed ? `${grp} (${count})` : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                    padding: isSidebarCollapsed ? '7px 0' : '6px 9px',
                    borderRadius: '9px',
                    border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                    background: isActive ? (isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.12)') : 'transparent',
                    color: isActive ? (isDark ? '#34d399' : '#059669') : theme.textSecondary,
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: isActive ? '700' : '500',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = theme.subtleBg;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Server size={14} />
                    {!isSidebarCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{grp}</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 5px',
                        borderRadius: '5px',
                        background: isActive ? 'rgba(16, 185, 129, 0.2)' : theme.badgeBg,
                        color: isActive ? (isDark ? '#34d399' : '#059669') : theme.textMuted,
                        fontFamily: 'monospace',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: `1px solid ${theme.border}`, width: '100%', boxSizing: 'border-box' }}>
          {!isSidebarCollapsed ? (
            <>
              {/* Full-width segmented theme switch (fits 100% inside slim sidebar without overflow) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: theme.badgeBg,
                  borderRadius: '8px',
                  padding: '2px',
                  border: `1px solid ${theme.border}`,
                  width: '100%',
                  boxSizing: 'border-box',
                  gap: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (isDark && toggleTheme) toggleTheme();
                  }}
                  title="Switch to Light Theme"
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    borderRadius: '6px',
                    border: 'none',
                    background: !isDark ? (isDark ? 'rgba(255, 255, 255, 0.15)' : '#FFFFFF') : 'transparent',
                    color: !isDark ? '#0F172A' : theme.textMuted,
                    cursor: isDark ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: !isDark ? '700' : '500',
                    boxShadow: !isDark ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Sun size={12} color={!isDark ? '#f59e0b' : 'currentColor'} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDark && toggleTheme) toggleTheme();
                  }}
                  title="Switch to Dark Theme"
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    borderRadius: '6px',
                    border: 'none',
                    background: isDark ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                    color: isDark ? '#F8FAFC' : theme.textMuted,
                    cursor: !isDark ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: isDark ? '700' : '500',
                    boxShadow: isDark ? '0 1px 4px rgba(0, 0, 0, 0.2)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Moon size={12} color={isDark ? '#38bdf8' : 'currentColor'} />
                  <span>Dark</span>
                </button>
              </div>

              <div
                onClick={onOpenAdmin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '10px',
                  background: theme.subtleBg,
                  border: `1px solid ${theme.borderSubtle}`,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = theme.subtleBg)}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    color: '#0A0E17',
                    flexShrink: 0,
                  }}
                >
                  AD
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '11.5px', fontWeight: '700', color: theme.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {appTitle}
                  </p>
                  <p style={{ fontSize: '9.5px', color: theme.textMuted, margin: 0 }}>Settings</p>
                </div>
                <Sliders size={13} color={theme.textMuted} />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light' : 'Switch to Dark'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: theme.subtleBg,
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: theme.textPrimary,
                }}
              >
                {isDark ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#38bdf8" />}
              </button>
              <button
                onClick={onOpenAdmin}
                title="Admin Settings"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: '800',
                  fontSize: '11px',
                  color: '#0A0E17',
                }}
              >
                AD
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Dashboard Content Viewport - Fits 100% of apps without vertical scrolling */}
      <main
        style={{
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          padding: '12px 18px 8px 18px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          minWidth: 0,
        }}
      >
        {/* Top Header Bar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '17px',
                fontWeight: '800',
                color: theme.textPrimary,
                letterSpacing: '-0.3px',
                margin: '0 0 2px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Homelab Services & Controls</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: isDark ? '#34d399' : '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                {onlineRate}% Operational
              </span>
            </h1>
            <p style={{ fontSize: '11.5px', color: theme.textSecondary, margin: 0 }}>
              Centralized launcher and operational controls for all your self-hosted services.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Real-time Search Box */}
            <div style={{ position: 'relative', width: '230px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.textMuted,
                }}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search services... (⌘K / /)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 26px 6px 30px',
                  borderRadius: '10px',
                  background: theme.inputBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.textPrimary,
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: theme.cardShadow,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: theme.textMuted,
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* View Mode Toggle: Grid vs Sections vs Table */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '2px',
                boxShadow: theme.cardShadow,
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                title="Bento Card Grid"
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'grid' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)') : 'transparent',
                  color: viewMode === 'grid' ? theme.textPrimary : theme.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                <LayoutGrid size={13} />
                <span>Bento</span>
              </button>
              <button
                onClick={() => setViewMode('sections')}
                title="Categorized Sections"
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'sections' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)') : 'transparent',
                  color: viewMode === 'sections' ? theme.textPrimary : theme.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                <FolderTree size={13} />
                <span>Sections</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Directory Table"
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'table' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)') : 'transparent',
                  color: viewMode === 'table' ? theme.textPrimary : theme.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                <List size={13} />
                <span>Table</span>
              </button>
            </div>

          </div>
        </header>

        {/* Compact Real Widgets Bento Deck */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          {/* Card 1: Homelab Cluster Vitals */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.cardShadow,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '118px',
              boxSizing: 'border-box',
              transition: 'background-color 0.25s ease, border-color 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Cluster Vitals
              </span>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: '700',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: isDark ? '#34d399' : '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                {onlineRate}% Online
              </span>
            </div>

            <div>
              <span style={{ fontSize: '24px', fontWeight: '800', color: theme.textPrimary, letterSpacing: '-0.5px' }}>
                {onlineCount} <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '500' }}>/ {totalCount} Services</span>
              </span>
            </div>

            {/* Category Stacked Progress Bar */}
            <div style={{ margin: '4px 0' }}>
              <div style={{ display: 'flex', height: '5px', width: '100%', borderRadius: '3px', overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', gap: '2px' }}>
                {Object.entries(groupCounts).map(([grp, cnt], idx) => {
                  const colors = ['#06B6D4', '#A855F7', '#10B981', '#F59E0B'];
                  const pct = totalCount > 0 ? (cnt / totalCount) * 100 : 0;
                  return (
                    <div
                      key={grp}
                      title={`${grp}: ${cnt} services (${Math.round(pct)}%)`}
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: colors[idx % colors.length],
                        borderRadius: '2px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bottom Details */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: `1px solid ${theme.borderSubtle}`, fontSize: '10.5px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.entries(groupCounts).slice(0, 3).map(([grp, cnt], idx) => {
                  const colors = ['#06B6D4', '#A855F7', '#10B981', '#F59E0B'];
                  return (
                    <span key={grp} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: theme.textSecondary, fontSize: '10.5px', textTransform: 'capitalize' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: colors[idx % colors.length] }} />
                      {grp} ({cnt})
                    </span>
                  );
                })}
              </div>
              {avgLatency !== null && (
                <span style={{ color: '#38bdf8', fontWeight: '600', fontSize: '10.5px', whiteSpace: 'nowrap' }}>
                  {avgLatency}ms Avg
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Compact Digital Clock & World Clocks */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '14px',
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '118px',
              boxSizing: 'border-box',
              transition: 'background-color 0.25s ease, border-color 0.25s ease',
            }}
          >
            <ClockWidget
              clockConfig={clockConfig}
              isDark={isDark}
              title={settings.title || 'Admin'}
              compact={true}
            />
          </div>

          {/* Card 3: Compact Live Weather Hero */}
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '14px',
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '118px',
              boxSizing: 'border-box',
              transition: 'background-color 0.25s ease, border-color 0.25s ease',
            }}
          >
            <WeatherWidget
              weatherConfig={weatherConfig}
              isDark={isDark}
              onUpdateWeatherConfig={onSaveSettings}
              mode="hero"
              compact={true}
            />
          </div>
        </section>

        {/* Real News Ticker Ribbon if enabled */}
        {newsConfig.enabled !== false && (
          <section
            style={{
              borderRadius: '10px',
              overflow: 'hidden',
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.cardShadow,
              flexShrink: 0,
              transition: 'background-color 0.25s ease, border-color 0.25s ease',
            }}
          >
            <NewsTicker
              position="top"
              newsConfig={newsConfig}
              isDark={isDark}
              onUpdateConfig={(newCfg) => {
                if (onSaveSettings) {
                  onSaveSettings({
                    widgets: {
                      ...settings.widgets,
                      news: {
                        ...settings.widgets?.news,
                        topStrip: newCfg,
                      },
                    },
                  });
                }
              }}
            />
          </section>
        )}

        {/* Real Services Section - Grid configured so all 12 cards fit cleanly */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '13.5px', fontWeight: '700', color: theme.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={15} color="#10B981" />
              <span>
                {selectedGroup === 'all' ? 'All Services' : `${selectedGroup} Cluster`} ({filteredLinks.length})
              </span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: theme.textMuted }}>
              <span style={{ display: 'none', md: 'inline' }}>Tip: Press 1-9 to launch</span>
              {viewMode === 'grid' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: theme.badgeBg,
                    borderRadius: '7px',
                    padding: '2px',
                    border: `1px solid ${theme.border}`,
                    gap: '2px',
                  }}
                >
                  {[
                    { id: 'auto', label: 'Auto' },
                    { id: '4', label: '4 Cols' },
                    { id: '6', label: '6 Cols' },
                  ].map((colOpt) => {
                    const isSel = gridColumns === colOpt.id;
                    return (
                      <button
                        key={colOpt.id}
                        type="button"
                        onClick={() => setGridColumns(colOpt.id)}
                        title={`Switch grid to ${colOpt.label}`}
                        style={{
                          padding: '2px 7px',
                          borderRadius: '5px',
                          border: 'none',
                          background: isSel ? (isDark ? 'rgba(255, 255, 255, 0.15)' : '#ffffff') : 'transparent',
                          color: isSel ? theme.textPrimary : theme.textMuted,
                          fontSize: '10.5px',
                          fontWeight: isSel ? '700' : '500',
                          cursor: 'pointer',
                          boxShadow: isSel && !isDark ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {colOpt.label}
                      </button>
                    );
                  })}
                </div>
              )}
              <span>Showing {filteredLinks.length} entries</span>
            </div>
          </div>

          {filteredLinks.length === 0 ? (
            <div
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                borderRadius: '14px',
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                color: theme.textMuted,
                fontSize: '13px',
              }}
            >
              No services match the query "{searchQuery}".
            </div>
          ) : viewMode === 'grid' ? (
            /* Apple Bento Grid Hierarchy: Prominent Hero Featured Services at top + Enlarged Modular Cards below */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 1. Featured Services Top Shelf */}
              {featuredServices.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        color: theme.textMuted,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Sparkles size={13} color="#f59e0b" />
                      Featured Stacks ({featuredServices.length})
                    </span>
                    <span style={{ fontSize: '10.5px', color: theme.textMuted }}>Core Infrastructure</span>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
                      gap: '14px',
                    }}
                  >
                    {featuredServices.map((item, idx) => (
                      <FeaturedHeroCard
                        key={item.id || item.link}
                        item={item}
                        pingStatus={pingResults[item.id || item.link]}
                        hotkeyIndex={idx < 9 ? String(idx + 1) : null}
                        theme={theme}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 2. All Applications Grid */}
              {regularServices.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {featuredServices.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          color: theme.textMuted,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Server size={13} color="#10b981" />
                        {selectedGroup === 'all' ? 'All Applications' : `${selectedGroup} Cluster`} ({regularServices.length})
                      </span>
                      <span style={{ fontSize: '10.5px', color: theme.textMuted }}>Showing {regularServices.length} entries</span>
                    </div>
                  )}
                  <div className="services-viewport-container">
                    <div
                      className={`services-adaptive-grid ${
                        gridColumns === '4'
                          ? 'cols-4'
                          : gridColumns === '6'
                          ? 'cols-6'
                          : 'balanced-auto'
                      }`}
                      style={
                        regularServices.length <= 3
                          ? { gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 340px))' }
                          : undefined
                      }
                    >
                      {regularServices.map((item, idx) => {
                        const globalIdx = featuredServices.length + idx;
                        return (
                          <ServiceCard
                            key={item.id || item.link}
                            item={item}
                            pingStatus={pingResults[item.id || item.link]}
                            hotkeyIndex={globalIdx < 9 ? String(globalIdx + 1) : null}
                            isFeatured={false}
                            theme={theme}
                            isDark={isDark}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : viewMode === 'sections' ? (
            /* Categorized Sections View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {groups.filter(g => g !== 'all').map((grp) => {
                const groupItems = filteredLinks.filter((l) => (l.group || 'other') === grp);
                if (groupItems.length === 0) return null;

                return (
                  <div key={grp} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', borderBottom: `1px solid ${theme.border}` }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: theme.textPrimary, textTransform: 'capitalize', letterSpacing: '-0.2px' }}>
                        {grp} Stack
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '1px 5px', borderRadius: '5px', background: theme.badgeBg, color: theme.textSecondary }}>
                        {groupItems.length}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                      {groupItems.map((item) => (
                        <ServiceCard
                          key={item.id || item.link}
                          item={item}
                          pingStatus={pingResults[item.id || item.link]}
                          isFeatured={!!item.featured}
                          theme={theme}
                          isDark={isDark}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Directory Table View */
            <div
              style={{
                borderRadius: '14px',
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.cardShadow,
                overflow: 'hidden',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: `1px solid ${theme.border}`,
                        color: theme.textMuted,
                        fontSize: '10.5px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                      }}
                    >
                      <th style={{ padding: '10px 16px' }}>Service</th>
                      <th style={{ padding: '10px 12px' }}>Category</th>
                      <th style={{ padding: '10px 12px' }}>Health Status</th>
                      <th style={{ padding: '10px 12px' }}>Endpoint</th>
                      <th style={{ padding: '10px 16px', textAlign: 'right' }}>Launch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLinks.map((item) => {
                      const ping = pingResults[item.id || item.link];
                      const isHealthy = !ping || ping.ok !== false;
                      const latency = ping?.latencyMs;

                      return (
                        <tr
                          key={item.id || item.link}
                          style={{
                            borderBottom: `1px solid ${theme.borderSubtle}`,
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ServiceIcon item={item} size={28} isDark={isDark} />
                            <div>
                              <p style={{ margin: 0, fontWeight: '700', color: theme.textPrimary }}>{item.title || item.label}</p>
                              <p style={{ margin: 0, fontSize: '10.5px', color: theme.textSecondary }}>{item.subtitle || ''}</p>
                            </div>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                padding: '2px 6px',
                                borderRadius: '5px',
                                background: theme.badgeBg,
                                color: theme.textSecondary,
                                textTransform: 'capitalize',
                              }}
                            >
                              {item.group || 'general'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '10px',
                                fontWeight: '600',
                                padding: '2px 7px',
                                borderRadius: '16px',
                                background: isHealthy ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                color: isHealthy ? (isDark ? '#34d399' : '#059669') : (isDark ? '#f87171' : '#dc2626'),
                                border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                              }}
                            >
                              <span
                                style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  background: isHealthy ? '#10b981' : '#ef4444',
                                }}
                              />
                              {isHealthy ? (latency ? `${latency}ms` : 'Active') : 'Offline'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: theme.textMuted, fontFamily: 'monospace', fontSize: '10.5px' }}>
                            {item.link}
                          </td>
                          <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '7px',
                                background: theme.badgeBg,
                                color: theme.textPrimary,
                                textDecoration: 'none',
                                fontSize: '11px',
                                fontWeight: '600',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#10B981';
                                e.currentTarget.style.color = '#0A0E17';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = theme.badgeBg;
                                e.currentTarget.style.color = theme.textPrimary;
                              }}
                            >
                              <span>Open</span>
                              <ExternalLink size={11} />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
