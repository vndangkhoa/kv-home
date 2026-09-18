import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search,
  ExternalLink,
  Sparkles,
  Command,
  X,
  Cpu,
  Activity,
  Server,
  Clock,
  CheckCircle2,
  Layers,
  LayoutGrid,
  Boxes,
  AppWindow,
  Terminal,
  Feather,
  Zap,
  Sliders,
  Sun,
  Moon,
  Wifi,
  RefreshCw,
  Trash2,
  Folder,
  Shield,
  Palette,
  ChevronDown,
  Monitor,
  Volume2,
} from 'lucide-react';
import { getServiceIconUrl } from '../../utils/iconResolver';
import ClockWidget from '../widgets/ClockWidget';
import WeatherWidget from '../widgets/WeatherWidget';
import NewsTicker from '../widgets/NewsTicker';
import { LAYOUTS } from '../../data/layouts';

/**
 * Apple SVG Logo: Renders perfectly across all OSes (Linux, Windows, Android, macOS)
 * without depending on Apple Private Use Area Unicode (U+F8FF) which shows as a broken box [].
 */
const AppleIcon = React.memo(function AppleIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.2)}
      viewBox="0 0 170 170"
      fill="currentColor"
      style={{ display: 'block', marginTop: '-1px' }}
    >
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.7-7.94-12-14.58-6.19-9.55-11.07-20.73-14.65-33.54-3.58-12.81-5.37-24.97-5.37-36.48 0-16.71 4.56-30.43 13.68-41.16 9.13-10.73 20.31-16.27 33.54-16.63 4.8 0 10.02 1.17 15.66 3.51 5.64 2.34 9.61 3.56 11.91 3.67 1.8.12 5.86-1.12 12.18-3.73 6.32-2.61 11.97-3.78 16.96-3.52 14.15.82 25.21 5.86 33.19 15.12-12.24 7.42-18.17 17.51-17.78 30.28.39 10.15 4.38 18.52 11.97 25.1 7.59 6.58 16.48 10.23 26.68 10.96-2.5 7.82-5.71 15.65-9.63 23.49zM119.22 31.84c0-7.72 2.76-14.98 8.27-21.78 5.51-6.8 12.29-10.87 20.34-12.21-.13 1.13-.2 2.12-.2 2.97 0 7.46-2.91 14.85-8.73 22.18-5.82 7.33-12.77 11.58-20.85 12.75-.27-1.13-.4-2.12-.4-2.97-.24-.31-.43-.63-.43-.94z" />
    </svg>
  );
});

/**
 * MenuBarClock: Dedicated lightweight clock for the top menu bar.
 * Keeps text compact (e.g. "Fri Sep 18  17:49") without expanding or overlapping.
 */
const MenuBarClock = React.memo(function MenuBarClock({ format24 = true }) {
  const [timeStr, setTimeStr] = useState(() => {
    const now = new Date();
    const day = now.toLocaleDateString([], { weekday: 'short' });
    const month = now.toLocaleDateString([], { month: 'short' });
    const date = now.getDate();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !format24 });
    return `${day} ${month} ${date}  ${time}`;
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const day = now.toLocaleDateString([], { weekday: 'short' });
      const month = now.toLocaleDateString([], { month: 'short' });
      const date = now.getDate();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !format24 });
      setTimeStr(`${day} ${month} ${date}  ${time}`);
    };
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [format24]);

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: '600' }}>
      {timeStr}
    </span>
  );
});

/**
 * ServiceIcon: Memoized icon component using lightweight faux-glass gradients
 * instead of heavy backdrop-filter blur, eliminating GPU compositing lag.
 */
const ServiceIcon = React.memo(function ServiceIcon({ item, isDark, size = 52, iconSize = 30 }) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = useMemo(() => getServiceIconUrl(item), [item]);
  const accentColor = item.hoverColor || item.color || '#38bdf8';
  const initials = item.title
    ? item.title.slice(0, 2).toUpperCase()
    : (item.label || 'KV').slice(0, 2).toUpperCase();

  const effectiveIconSize = iconSize || Math.round(size * 0.58);
  const hasValidLogo = iconUrl && !imgError;

  return (
    <div
      className="mac-icon-squircle"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: hasValidLogo
          ? (isDark
            ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%), #131b2e'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.9) 100%)')
          : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
        border: `1px solid ${hasValidLogo
          ? (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)')
          : 'rgba(255, 255, 255, 0.35)'
        }`,
        boxShadow: isDark
          ? '0 8px 20px -4px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
          : '0 6px 16px -3px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1)',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Subtle brand tint aura */}
      {hasValidLogo && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${accentColor}22 0%, transparent 75%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Official SVG Logo or Initials */}
      {hasValidLogo ? (
        <img
          src={iconUrl}
          alt={item.title || item.label}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            width: `${effectiveIconSize}px`,
            height: `${effectiveIconSize}px`,
            objectFit: 'contain',
            filter: isDark
              ? 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5))'
              : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))',
            position: 'relative',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      ) : (
        <span
          style={{
            position: 'relative',
            zIndex: 1,
            fontWeight: '700',
            fontSize: `${Math.round(size * 0.34)}px`,
            color: '#ffffff',
            letterSpacing: '0.5px',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          {initials}
        </span>
      )}

      {/* Featured Indicator Dot */}
      {item.featured && (
        <div
          title="Featured Service"
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 6px ${accentColor}`,
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
});

/**
 * Format uptime into clean readable string
 */
function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return 'Just now';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// Wallpaper preset themes
const WALLPAPERS = {
  sequoia: {
    id: 'sequoia',
    name: 'Sequoia Obsidian (Dark)',
    bgDark: 'radial-gradient(at 15% 15%, rgba(30, 58, 138, 0.45) 0%, transparent 60%), radial-gradient(at 85% 85%, rgba(109, 40, 217, 0.35) 0%, transparent 60%), radial-gradient(at 50% 50%, rgba(14, 165, 233, 0.12) 0%, transparent 70%), #080c14',
    bgLight: 'radial-gradient(at 10% 10%, rgba(199, 210, 254, 0.6) 0%, transparent 50%), radial-gradient(at 90% 10%, rgba(254, 215, 170, 0.5) 0%, transparent 50%), radial-gradient(at 50% 90%, rgba(186, 230, 253, 0.6) 0%, transparent 60%), #f8fafc',
  },
  liquid: {
    id: 'liquid',
    name: 'Liquid Glass (iOS 26)',
    bgDark: 'radial-gradient(at 25% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 55%), radial-gradient(at 75% 25%, rgba(56, 189, 248, 0.35) 0%, transparent 55%), radial-gradient(at 50% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 60%), #090d16',
    bgLight: 'radial-gradient(at 20% 20%, rgba(251, 207, 232, 0.65) 0%, transparent 55%), radial-gradient(at 80% 25%, rgba(186, 230, 253, 0.7) 0%, transparent 55%), radial-gradient(at 50% 85%, rgba(221, 214, 254, 0.65) 0%, transparent 60%), #fbfcfd',
  },
  sonoma: {
    id: 'sonoma',
    name: 'Sonoma Horizon',
    bgDark: 'radial-gradient(at 30% 80%, rgba(249, 115, 22, 0.25) 0%, transparent 60%), radial-gradient(at 70% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 60%), #0a0e1a',
    bgLight: 'radial-gradient(at 30% 80%, rgba(254, 215, 170, 0.7) 0%, transparent 60%), radial-gradient(at 70% 20%, rgba(191, 219, 254, 0.7) 0%, transparent 60%), #f8fafc',
  },
  nebula: {
    id: 'nebula',
    name: 'Deep Space Nebula',
    bgDark: 'radial-gradient(at 50% 0%, rgba(30, 41, 59, 0.8) 0%, transparent 75%), radial-gradient(at 80% 90%, rgba(16, 185, 129, 0.15) 0%, transparent 60%), #020617',
    bgLight: 'radial-gradient(at 50% 0%, rgba(226, 232, 240, 0.85) 0%, transparent 75%), #f1f5f9',
  },
};

export default function DockLayout({
  links = [],
  isDark = true,
  settings = {},
  onSaveSettings,
  onSelectLayout,
  onOpenAdmin,
  toggleTheme,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [telemetry, setTelemetry] = useState(null);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // 'apple' | 'finder' | 'services'
  const [hoveredDockIndex, setHoveredDockIndex] = useState(null);
  const [bouncingId, setBouncingId] = useState(null);
  const [wallpaperId, setWallpaperId] = useState(() => {
    try {
      return localStorage.getItem('kv_mac_wallpaper') || 'sequoia';
    } catch {
      return 'sequoia';
    }
  });

  const searchInputRef = useRef(null);
  const menuBarRef = useRef(null);
  const controlCenterRef = useRef(null);

  const widgetsConfig = settings.widgets || {};
  const clockConfig = widgetsConfig.clock || {
    format24: true,
    showSeconds: false,
    showGreeting: true,
    worldClocks: [
      { label: 'UTC', timezone: 'UTC' },
      { label: 'Tokyo', timezone: 'Asia/Tokyo' }
    ]
  };
  const weatherConfig = widgetsConfig.weather || {
    enabled: true,
    unit: 'celsius',
    city: 'Ho Chi Minh City',
    latitude: 10.823,
    longitude: 106.630
  };
  const newsConfig = widgetsConfig.news || {};

  // News configuration
  const topStripConfig = useMemo(() => {
    return newsConfig.topStrip || (newsConfig.feed ? {
      enabled: newsConfig.enabled !== false,
      feed: newsConfig.feed,
      speed: newsConfig.speed || 'slow',
      customUrl: newsConfig.customUrl || '',
    } : {
      enabled: true,
      feed: 'vnexpress',
      speed: 'slow',
      customUrl: '',
    });
  }, [newsConfig.topStrip, newsConfig.feed, newsConfig.enabled, newsConfig.speed, newsConfig.customUrl]);

  // Fetch telemetry status (every 10s without full-page re-renders)
  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/system/status');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setTelemetry(data);
        }
      } catch {
        // static fallback
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Global Keyboard Shortcuts: ⌘+Space or / for Spotlight, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ⌘+Space or / opens Spotlight
      if (((e.metaKey || e.ctrlKey) && e.code === 'Space') || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        setIsSpotlightOpen(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      } else if (e.key === 'Escape') {
        setIsSpotlightOpen(false);
        setIsControlCenterOpen(false);
        setActiveMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
      if (controlCenterRef.current && !controlCenterRef.current.contains(e.target) && !e.target.closest('.control-center-toggle')) {
        setIsControlCenterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Wallpaper changer
  const handleSelectWallpaper = (wId) => {
    setWallpaperId(wId);
    try {
      localStorage.setItem('kv_mac_wallpaper', wId);
    } catch {
      // ignore
    }
  };

  const currentWallpaper = WALLPAPERS[wallpaperId] || WALLPAPERS.sequoia;
  const wallpaperBg = isDark ? currentWallpaper.bgDark : currentWallpaper.bgLight;

  // Filter links by search query
  const filteredLinks = useMemo(() => {
    let result = links;
    if (selectedGroup !== 'all') {
      result = result.filter(item => item.group === selectedGroup);
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return result;
    return result.filter((item) => (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.label && item.label.toLowerCase().includes(q)) ||
      (item.group && item.group.toLowerCase().includes(q))
    ));
  }, [links, selectedGroup, searchQuery]);

  // Layout matching in Spotlight
  const matchedLayouts = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) return [];
    const isCommand = raw.startsWith('>');
    const clean = raw.replace(/^>\s*/, '').trim();
    if (!clean && !isCommand) return [];

    return Object.values(LAYOUTS).filter((l) => {
      if (isCommand && !clean) return true;
      return (
        l.id.toLowerCase().includes(clean) ||
        l.name.toLowerCase().includes(clean) ||
        (l.subtitle && l.subtitle.toLowerCase().includes(clean))
      );
    });
  }, [searchQuery]);

  const handleSwitchLayout = useCallback((layoutId) => {
    if (onSelectLayout) {
      onSelectLayout(layoutId);
    } else if (onSaveSettings) {
      onSaveSettings({ activeLayout: layoutId });
    }
    setIsSpotlightOpen(false);
    setSearchQuery('');
  }, [onSelectLayout, onSaveSettings]);

  // Handle launch service
  const handleLaunchService = (item) => {
    setBouncingId(item.id || item.label);
    setTimeout(() => setBouncingId(null), 800);
    if (item.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
    setIsSpotlightOpen(false);
  };

  // Telemetry metrics
  const cpuPercent = useMemo(() => {
    if (!telemetry) return 18;
    if (telemetry.loadAvg && telemetry.cpuCount) {
      const load = (telemetry.loadAvg[0] / telemetry.cpuCount) * 100;
      return Math.min(100, Math.max(1, Math.round(load)));
    }
    return 18;
  }, [telemetry]);

  const memPercent = useMemo(() => {
    if (!telemetry?.memory) return 42;
    return telemetry.memory.percent || 42;
  }, [telemetry]);

  const memUsedGb = useMemo(() => {
    if (!telemetry?.memory?.used) return '6.2';
    return (telemetry.memory.used / (1024 ** 3)).toFixed(1);
  }, [telemetry]);

  const memTotalGb = useMemo(() => {
    if (!telemetry?.memory?.total) return '16.0';
    return (telemetry.memory.total / (1024 ** 3)).toFixed(1);
  }, [telemetry]);

  const uptimeString = formatUptime(telemetry?.uptime || 86400 * 3.4);

  // Group tags
  const availableGroups = useMemo(() => {
    const groups = new Set();
    links.forEach(l => {
      if (l.group && l.group.trim()) groups.add(l.group.trim());
    });
    return ['all', ...Array.from(groups)];
  }, [links]);

  return (
    <div
      className="mac-gpu"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: wallpaperBg,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        userSelect: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      }}
    >
      {/* Subtle Dynamic Ambient Refraction */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: isDark
            ? 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)'
            : 'radial-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          zIndex: 0,
        }}
      />

      {/* =========================================================================
          1. TOP macOS LIQUID GLASS MENU BAR (Fixed 32px)
          ========================================================================= */}
      <nav
        ref={menuBarRef}
        className={`mac-menu-bar ${isDark ? 'dark' : 'light'}`}
      >
        {/* Left: Apple / Logo & System Menus */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Apple Logo Trigger */}
          <div
            className="mac-menu-item"
            style={{ padding: '2px 8px' }}
            onClick={() => setActiveMenu(activeMenu === 'apple' ? null : 'apple')}
            title="About KV-OS & System Info"
          >
            <AppleIcon size={13} />
          </div>

          {/* Site Title / Host Brand */}
          <div
            className="mac-menu-item"
            style={{ fontWeight: '700', letterSpacing: '-0.2px' }}
            onClick={() => setActiveMenu(activeMenu === 'finder' ? null : 'finder')}
          >
            <span>{settings.title || 'KV-OS'}</span>
          </div>

          {/* macOS Dropdown Menus */}
          <div
            className="mac-menu-item"
            onClick={() => setActiveMenu(activeMenu === 'services' ? null : 'services')}
          >
            Services
          </div>
          <div
            className="mac-menu-item"
            onClick={() => setIsSpotlightOpen(true)}
          >
            Spotlight
          </div>
          <div
            className="mac-menu-item"
            onClick={() => onOpenAdmin && onOpenAdmin()}
          >
            Admin
          </div>

          {/* Active Menu Dropdown Popover */}
          {activeMenu && (
            <div
              style={{
                position: 'absolute',
                top: '34px',
                left: activeMenu === 'apple' ? '8px' : (activeMenu === 'finder' ? '40px' : '90px'),
                minWidth: '220px',
                borderRadius: '12px',
                background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(0, 0, 0, 0.12)',
                boxShadow: isDark ? '0 16px 36px -4px rgba(0,0,0,0.8)' : '0 14px 30px -4px rgba(15,23,42,0.15)',
                padding: '6px',
                zIndex: 9999,
                fontSize: '12.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                color: isDark ? '#ffffff' : '#0f172a',
                animation: 'macTooltipPop 0.14s ease-out',
              }}
            >
              {activeMenu === 'apple' && (
                <>
                  <div style={{ padding: '6px 10px', fontWeight: '600', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
                    About KV-OS (Liquid Glass 2026)
                  </div>
                  <div className="mac-menu-item" onClick={() => { onOpenAdmin && onOpenAdmin(); setActiveMenu(null); }}>
                    System Settings...
                  </div>
                  <div className="mac-menu-item" onClick={() => { setIsSpotlightOpen(true); setActiveMenu(null); }}>
                    Spotlight Search (⌘ Space)
                  </div>
                  <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', margin: '4px 0' }} />
                  <div className="mac-menu-item" onClick={() => window.location.reload()}>
                    Restart Interface
                  </div>
                </>
              )}

              {activeMenu === 'finder' && (
                <>
                  <div style={{ padding: '6px 10px', fontWeight: '600', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
                    Workspace: {settings.tagline || 'where design meets intelligence'}
                  </div>
                  <div className="mac-menu-item" onClick={() => { setIsControlCenterOpen(true); setActiveMenu(null); }}>
                    Open Control Center
                  </div>
                  <div className="mac-menu-item" onClick={() => { onSelectLayout && onSelectLayout('bento'); setActiveMenu(null); }}>
                    Switch to Bento Engine (Alt+2)
                  </div>
                  <div className="mac-menu-item" onClick={() => { onSelectLayout && onSelectLayout('tetris'); setActiveMenu(null); }}>
                    Switch to Procedural Tetris (Alt+4)
                  </div>
                  <div className="mac-menu-item" onClick={() => { onSelectLayout && onSelectLayout('terminal'); setActiveMenu(null); }}>
                    Switch to CLI Terminal (Alt+3)
                  </div>
                </>
              )}

              {activeMenu === 'services' && (
                <>
                  <div style={{ padding: '6px 10px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Quick Launch ({links.length})
                  </div>
                  {links.slice(0, 7).map((item) => (
                    <div
                      key={item.id || item.label}
                      className="mac-menu-item"
                      onClick={() => { handleLaunchService(item); setActiveMenu(null); }}
                    >
                      <span>{item.title || item.label}</span>
                      <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                    </div>
                  ))}
                  {links.length > 7 && (
                    <div className="mac-menu-item" onClick={() => { setIsSpotlightOpen(true); setActiveMenu(null); }} style={{ color: '#38bdf8' }}>
                      View all {links.length} services...
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: macOS Status Tray (Weather, Vitals, Pulse, Clean MenuBar Time, Control Center) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Live Weather Pill */}
          {weatherConfig.enabled !== false && (
            <div
              className="mac-menu-item"
              style={{ fontSize: '12px', padding: '2px 7px' }}
              title={`Weather in ${weatherConfig.city || 'Ho Chi Minh City'}`}
            >
              <span>⛅</span>
              <span>26°C</span>
            </div>
          )}

          {/* Mini Telemetry Pill */}
          <div
            className="mac-menu-item"
            style={{ fontSize: '11.5px', padding: '2px 7px', gap: '5px' }}
            title={`CPU: ${cpuPercent}% | RAM: ${memPercent}% (${memUsedGb} / ${memTotalGb} GB)`}
          >
            <Cpu size={12} style={{ color: isDark ? '#38bdf8' : '#0284c7' }} />
            <span>{cpuPercent}%</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <Activity size={12} style={{ color: isDark ? '#c084fc' : '#7c3aed' }} />
            <span>{memPercent}%</span>
          </div>

          {/* Network / Status Dot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
            }}
            title={`Host Status: Online (${links.length} Services up ${uptimeString})`}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          </div>

          {/* Real-time Compact Menu Bar Time */}
          <div
            className="mac-menu-item"
            style={{ fontSize: '12.5px', padding: '2px 8px' }}
            onClick={() => setIsControlCenterOpen(prev => !prev)}
            title="Click to toggle Control Center"
          >
            <MenuBarClock format24={clockConfig.format24 !== false} />
          </div>

          {/* Control Center Icon */}
          <div
            className="mac-menu-item control-center-toggle"
            onClick={() => setIsControlCenterOpen(prev => !prev)}
            title="macOS Control Center"
            style={{
              padding: '3px 7px',
              borderRadius: '6px',
              background: isControlCenterOpen ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)') : 'transparent',
            }}
          >
            <Sliders size={13} />
          </div>

          {/* Spotlight Search Icon */}
          <div
            className="mac-menu-item"
            onClick={() => setIsSpotlightOpen(true)}
            title="Spotlight Search (⌘ Space)"
            style={{ padding: '3px 7px' }}
          >
            <Search size={13} />
          </div>
        </div>
      </nav>

      {/* =========================================================================
          2. macOS CONTROL CENTER (Slide-down Liquid Glass Panel)
          ========================================================================= */}
      {isControlCenterOpen && (
        <div
          ref={controlCenterRef}
          style={{
            position: 'absolute',
            top: '38px',
            right: '12px',
            width: '320px',
            borderRadius: '20px',
            background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: isDark
              ? '0 24px 50px -12px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.25)'
              : '0 20px 40px -10px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,1)',
            backdropFilter: 'blur(36px) saturate(210%)',
            WebkitBackdropFilter: 'blur(36px) saturate(210%)',
            zIndex: 9999,
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'macTooltipPop 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            color: isDark ? '#ffffff' : '#0f172a',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '-0.2px' }}>Control Center</span>
            <button
              onClick={() => setIsControlCenterOpen(false)}
              style={{ background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Quick Toggle Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {/* Dark / Light Mode Toggle */}
            <div
              onClick={() => toggleTheme && toggleTheme()}
              className="liquid-glass-card"
              style={{
                padding: '10px',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: isDark ? '#38bdf8' : '#0284c7',
                color: isDark ? '#000' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isDark ? <Moon size={15} /> : <Sun size={15} />}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>Theme</div>
                <div style={{ fontSize: '10.5px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </div>
              </div>
            </div>

            {/* Admin Settings Trigger */}
            <div
              onClick={() => { onOpenAdmin && onOpenAdmin(); setIsControlCenterOpen(false); }}
              className="liquid-glass-card"
              style={{
                padding: '10px',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: isDark ? '#a855f7' : '#9333ea',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={15} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>Admin</div>
                <div style={{ fontSize: '10.5px', color: isDark ? '#94a3b8' : '#64748b' }}>Manage Nodes</div>
              </div>
            </div>
          </div>

          {/* Wallpaper Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
              Desktop Wallpaper
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {Object.values(WALLPAPERS).map((w) => {
                const isActive = wallpaperId === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => handleSelectWallpaper(w.id)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '10px',
                      border: isActive
                        ? '1px solid #38bdf8'
                        : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'),
                      background: isActive
                        ? (isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.1)')
                        : 'transparent',
                      color: isActive ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#ffffff' : '#0f172a'),
                      fontSize: '11px',
                      fontWeight: isActive ? '700' : '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Palette size={12} />
                    <span>{w.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Homelab Vitals Mini Sliders */}
          <div style={{ padding: '8px 10px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
              <span>CPU Utilization</span>
              <span style={{ color: '#38bdf8' }}>{cpuPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '5px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${cpuPercent}%`, height: '100%', background: '#38bdf8', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
              <span>RAM Allocation</span>
              <span style={{ color: '#c084fc' }}>{memPercent}% ({memUsedGb} GB)</span>
            </div>
            <div style={{ width: '100%', height: '5px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ width: `${memPercent}%`, height: '100%', background: '#c084fc', borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. DESKTOP WORKSPACE CANVAS & INTERACTIVE WIDGETS
          ========================================================================= */}
      <main
        style={{
          flex: 1,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 20px 120px 20px', // bottom clearance for dock
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Upper Desktop Row: macOS Sonoma Style Hero Clock & Vitals Deck */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '920px',
          margin: '0 auto',
        }}>
          {/* Hero Digital Clock & Weather Accessory */}
          <div style={{ marginBottom: '16px' }}>
            <ClockWidget
              clockConfig={clockConfig}
              isDark={isDark}
              title={settings.title || 'Admin'}
            />
          </div>

          {/* Desktop Homelab Vitals */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            width: '100%',
            maxWidth: '780px',
            boxSizing: 'border-box',
            marginBottom: '20px',
          }}>
            {/* Card 1: CPU Load */}
            <div
              className={`liquid-glass-card ${isDark ? 'dark' : 'light'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(2, 132, 199, 0.12)',
                  color: isDark ? '#38bdf8' : '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Cpu size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>
                    CPU Load
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                    {cpuPercent}%
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '34px', height: '34px', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                  <path stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'} strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path
                    stroke={cpuPercent > 80 ? '#ef4444' : (isDark ? '#38bdf8' : '#0284c7')}
                    strokeDasharray={`${cpuPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>

            {/* Card 2: Memory Load */}
            <div
              className={`liquid-glass-card ${isDark ? 'dark' : 'light'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: isDark ? 'rgba(168, 85, 247, 0.18)' : 'rgba(147, 51, 234, 0.12)',
                  color: isDark ? '#c084fc' : '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Activity size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>
                    RAM {memPercent}%
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                    {memUsedGb} <span style={{ fontSize: '10px', fontWeight: '400', color: isDark ? '#64748b' : '#94a3b8' }}>/ {memTotalGb} GB</span>
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '34px', height: '34px', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                  <path stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'} strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path
                    stroke={memPercent > 85 ? '#ef4444' : (isDark ? '#c084fc' : '#9333ea')}
                    strokeDasharray={`${memPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>

            {/* Card 3: Host Uptime & Status */}
            <div
              className={`liquid-glass-card ${isDark ? 'dark' : 'light'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.12)',
                  color: isDark ? '#34d399' : '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>
                    {links.length} Services
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                    {uptimeString} <span style={{ fontSize: '10px', fontWeight: '400', color: isDark ? '#64748b' : '#94a3b8' }}>online</span>
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '12px',
                background: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span style={{ fontSize: '10.5px', fontWeight: '700', color: isDark ? '#34d399' : '#059669' }}>Live</span>
              </div>
            </div>
          </div>

          {/* Category Filter Segmented Control */}
          {availableGroups.length > 2 && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              padding: '3px',
              borderRadius: '14px',
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
              backdropFilter: 'blur(16px)',
              boxShadow: isDark ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08)' : 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
              marginBottom: '24px',
            }}>
              {availableGroups.map((grp) => {
                const isActive = selectedGroup === grp;
                const count = grp === 'all'
                  ? links.length
                  : links.filter(item => item.group === grp).length;

                return (
                  <button
                    key={grp}
                    onClick={() => setSelectedGroup(grp)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: isActive ? '700' : '500',
                      textTransform: 'capitalize',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: 'none',
                      background: isActive
                        ? (isDark ? 'rgba(255, 255, 255, 0.18)' : '#ffffff')
                        : 'transparent',
                      color: isActive
                        ? (isDark ? '#ffffff' : '#0f172a')
                        : (isDark ? '#94a3b8' : '#64748b'),
                      boxShadow: isActive
                        ? (isDark
                          ? '0 4px 12px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                          : '0 2px 6px rgba(15, 23, 42, 0.08)')
                        : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.16s ease',
                    }}
                  >
                    <span>{grp}</span>
                    <span style={{
                      fontSize: '9.5px',
                      opacity: 0.75,
                      fontFamily: 'monospace',
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* =====================================================================
            Desktop Service Apps Grid (Restored and Upgraded with Liquid Glass)
            ===================================================================== */}
        <div style={{
          width: '100%',
          maxWidth: '1020px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '20px 14px',
          justifyItems: 'center',
          alignContent: 'start',
          boxSizing: 'border-box',
          marginBottom: '32px',
        }}>
          {filteredLinks.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '36px 20px',
              color: isDark ? '#64748b' : '#94a3b8',
              fontSize: '13.5px',
            }}>
              No matching services found for "{searchQuery}"
            </div>
          ) : (
            filteredLinks.map((item) => (
              <a
                key={item.id || item.label}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setBouncingId(item.id || item.label);
                  setTimeout(() => setBouncingId(null), 800);
                }}
                title={`${item.title || item.label}${item.subtitle ? ` - ${item.subtitle}` : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  width: '106px',
                  padding: '8px 4px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.22s var(--apple-smooth)',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Brand Squircle Icon */}
                <ServiceIcon item={item} isDark={isDark} size={60} iconSize={36} />

                {/* App Label */}
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  textAlign: 'center',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  letterSpacing: '-0.1px',
                }}>
                  {item.title || item.label}
                </div>

                {/* Subtitle */}
                {item.subtitle && (
                  <div style={{
                    fontSize: '10.5px',
                    fontWeight: '400',
                    textAlign: 'center',
                    color: isDark ? '#94a3b8' : '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    marginTop: '-4px',
                  }}>
                    {item.subtitle}
                  </div>
                )}
              </a>
            ))
          )}
        </div>

        {/* Optional News Notification Ribbon */}
        {topStripConfig.enabled !== false && (
          <div style={{
            width: '100%',
            maxWidth: '820px',
            marginBottom: '16px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(15,23,42,0.06)'
          }}>
            <NewsTicker
              position="top"
              newsConfig={topStripConfig}
              isDark={isDark}
            />
          </div>
        )}
      </main>

      {/* =========================================================================
          4. FLOATING LIQUID GLASS macOS DOCK (Centered Bottom with Magnification)
          ========================================================================= */}
      <div
        style={{
          position: 'fixed',
          bottom: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 8000,
          pointerEvents: 'auto',
        }}
      >
        <div
          className={`liquid-glass-dock ${isDark ? 'dark' : 'light'}`}
          onMouseLeave={() => setHoveredDockIndex(null)}
        >
          {/* Render Service App Icons */}
          {filteredLinks.map((item, idx) => {
            const isHovered = hoveredDockIndex === idx;
            const isAdjacent1 = hoveredDockIndex !== null && Math.abs(hoveredDockIndex - idx) === 1;
            const isAdjacent2 = hoveredDockIndex !== null && Math.abs(hoveredDockIndex - idx) === 2;

            // Fish-eye magnification scale & translate
            let scale = 1.0;
            let translateY = 0;
            if (isHovered) {
              scale = 1.36;
              translateY = -12;
            } else if (isAdjacent1) {
              scale = 1.18;
              translateY = -6;
            } else if (isAdjacent2) {
              scale = 1.08;
              translateY = -2;
            }

            const isBouncing = bouncingId === (item.id || item.label);

            return (
              <div
                key={item.id || item.label}
                className={`mac-dock-item ${isBouncing ? 'dock-bouncing' : ''}`}
                style={{
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                }}
                onMouseEnter={() => setHoveredDockIndex(idx)}
                onClick={() => handleLaunchService(item)}
              >
                {/* Tooltip Pill */}
                {isHovered && (
                  <div className={`mac-dock-tooltip ${isDark ? 'dark' : 'light'}`}>
                    <div>{item.title || item.label}</div>
                    {item.subtitle && (
                      <div style={{ fontSize: '9.5px', opacity: 0.7, fontWeight: '400' }}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                )}

                {/* Squircle Brand Logo Box */}
                <ServiceIcon
                  item={item}
                  isDark={isDark}
                  size={48}
                  iconSize={28}
                />

                {/* Running App Indicator Dot */}
                <div className={`dock-running-dot ${isDark ? 'dark' : 'light'}`} />
              </div>
            );
          })}

          {/* Glass Dock Separator */}
          <div className="mac-dock-divider" />

          {/* System Utilities on Dock */}
          {/* Spotlight Launcher */}
          <div
            className="mac-dock-item"
            onClick={() => setIsSpotlightOpen(true)}
            onMouseEnter={() => setHoveredDockIndex('spotlight')}
            style={{
              transform: hoveredDockIndex === 'spotlight' ? 'scale(1.24) translateY(-8px)' : 'scale(1.0)',
            }}
          >
            {hoveredDockIndex === 'spotlight' && (
              <div className={`mac-dock-tooltip ${isDark ? 'dark' : 'light'}`}>
                Spotlight Search (⌘ Space)
              </div>
            )}
            <div
              className="mac-icon-squircle"
              style={{
                width: '48px',
                height: '48px',
                background: isDark
                  ? 'linear-gradient(135deg, #1e293b, #0f172a)'
                  : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.1)',
                color: isDark ? '#38bdf8' : '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search size={22} />
            </div>
            <div className={`dock-running-dot ${isDark ? 'dark' : 'light'}`} />
          </div>

          {/* Admin Launcher */}
          <div
            className="mac-dock-item"
            onClick={() => onOpenAdmin && onOpenAdmin()}
            onMouseEnter={() => setHoveredDockIndex('admin')}
            style={{
              transform: hoveredDockIndex === 'admin' ? 'scale(1.24) translateY(-8px)' : 'scale(1.0)',
            }}
          >
            {hoveredDockIndex === 'admin' && (
              <div className={`mac-dock-tooltip ${isDark ? 'dark' : 'light'}`}>
                System Settings
              </div>
            )}
            <div
              className="mac-icon-squircle"
              style={{
                width: '48px',
                height: '48px',
                background: isDark
                  ? 'linear-gradient(135deg, #334155, #1e293b)'
                  : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.1)',
                color: isDark ? '#f8fafc' : '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders size={22} />
            </div>
            <div className={`dock-running-dot ${isDark ? 'dark' : 'light'}`} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. macOS SPOTLIGHT / RAYCAST MODAL (⌘ + Space or /)
          ========================================================================= */}
      {isSpotlightOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '16vh',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            animation: 'macTooltipPop 0.15s ease-out',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSpotlightOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              borderRadius: '18px',
              background: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: isDark
                ? '0 30px 60px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.15)'
                : '0 24px 50px -10px rgba(15, 23, 42, 0.2), 0 0 20px rgba(2, 132, 199, 0.08)',
              backdropFilter: 'blur(36px) saturate(200%)',
              WebkitBackdropFilter: 'blur(36px) saturate(200%)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Search Input Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 18px',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
              gap: '12px',
            }}>
              <Search size={18} style={{ color: isDark ? '#38bdf8' : '#0284c7' }} />
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                placeholder="Spotlight Search: type a service name or '>' for layout engines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (matchedLayouts.length > 0) {
                      handleSwitchLayout(matchedLayouts[0].id);
                    } else if (filteredLinks.length > 0) {
                      handleLaunchService(filteredLinks[0]);
                    }
                  }
                }}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontFamily: 'inherit',
                }}
              />
              <kbd style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '5px',
                background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                color: isDark ? '#94a3b8' : '#64748b',
                fontFamily: 'monospace',
                fontWeight: '700',
              }}>
                ESC
              </kbd>
            </div>

            {/* Spotlight Results List */}
            <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
              {/* Layout Commands Result */}
              {matchedLayouts.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: isDark ? '#38bdf8' : '#0284c7', padding: '4px 10px' }}>
                    Layout Engines
                  </div>
                  {matchedLayouts.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => handleSwitchLayout(l.id)}
                      className="mac-menu-item"
                      style={{ padding: '8px 12px', borderRadius: '10px' }}
                    >
                      <Sparkles size={15} style={{ color: '#38bdf8' }} />
                      <span style={{ fontWeight: '600' }}>Switch to {l.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {l.subtitle || l.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Service Results */}
              <div style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: isDark ? '#94a3b8' : '#64748b', padding: '4px 10px' }}>
                Services ({filteredLinks.length})
              </div>
              {filteredLinks.length === 0 && matchedLayouts.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8', fontSize: '13px' }}>
                  No results found for "{searchQuery}"
                </div>
              ) : (
                filteredLinks.slice(0, 8).map((item) => (
                  <div
                    key={item.id || item.label}
                    onClick={() => handleLaunchService(item)}
                    className="mac-menu-item"
                    style={{ padding: '8px 12px', borderRadius: '10px', gap: '10px' }}
                  >
                    <ServiceIcon item={item} isDark={isDark} size={32} iconSize={20} />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '600' }}>
                        {item.title || item.label}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                    <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
