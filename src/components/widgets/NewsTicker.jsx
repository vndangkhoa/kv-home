import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, RefreshCw, Radio, ChevronDown, Check, Pause, Play, Sparkles } from 'lucide-react';

const FEED_OPTIONS = [
  { id: 'vnexpress', label: 'VnExpress Số Hóa', icon: '🇻🇳', color: '#e11d48' },
  { id: 'tuoitre', label: 'Tuổi Trẻ Tech', icon: '⚡', color: '#0ea5e9' },
  { id: 'thanhnien', label: 'Thanh Niên Tech', icon: '📰', color: '#3b82f6' },
  { id: 'vietnamnet', label: 'VietNamNet Tech', icon: '🌐', color: '#10b981' },
  { id: 'hackernews', label: 'Hacker News', icon: '🔥', color: '#ff6600' },
  { id: 'verge', label: 'The Verge', icon: '📱', color: '#ec4899' },
  { id: 'bbc', label: 'BBC World', icon: '🌍', color: '#ef4444' },
  { id: 'reddit', label: 'r/homelab', icon: '🖥️', color: '#f97316' },
  { id: 'arstechnica', label: 'Ars Technica', icon: '🔬', color: '#f59e0b' },
  { id: 'custom', label: 'Custom RSS', icon: '📡', color: '#8b5cf6' },
];

const SPEED_DURATIONS = {
  slow: '220s',
  normal: '160s',
  fast: '90s',
};

function NewsTicker({
  position = 'top', // 'top' | 'bottom'
  newsConfig = {},
  isDark = true,
  onUpdateConfig,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManualPaused, setIsManualPaused] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [customInputUrl, setCustomInputUrl] = useState('');
  const popoverRef = useRef(null);

  const enabled = newsConfig.enabled !== false;
  const feed = newsConfig.feed || (position === 'top' ? 'vnexpress' : 'tuoitre');
  const speed = newsConfig.speed || 'slow';
  const customUrl = newsConfig.customUrl || '';
  const currentSpeedDuration = SPEED_DURATIONS[speed] || '220s';

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowSourcePicker(false);
      }
    }
    if (showSourcePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSourcePicker]);

  // Fetch news items
  useEffect(() => {
    let active = true;

    async function load() {
      if (!enabled) return;
      try {
        const q = new URLSearchParams();
        if (feed) q.set('feed', feed);
        if (customUrl) q.set('url', customUrl);

        const res = await fetch(`/api/news?${q.toString()}`);
        if (res.ok && active) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items);
            return;
          }
        }
      } catch (err) {
        console.warn(`[NewsStrip-${position}] Fetch error:`, err);
      } finally {
        if (active) {
          setLoading(false);
          setItems(prev => prev.length > 0 ? prev : [
            { title: 'KV Homelab Portal is online and operational', link: '#', source: 'SYSTEM', timeAgo: 'Now' },
            { title: 'VnExpress & Tuổi Trẻ live tech headlines stream', link: 'https://vnexpress.net', source: 'NEWS', timeAgo: 'Live' },
            { title: 'High-speed cluster connectivity established across nodes', link: '#', source: 'TELEMETRY', timeAgo: 'Active' }
          ]);
        }
      }
    }

    load();
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [enabled, feed, customUrl, position]);

  if (!enabled) return null;

  const activeOption = FEED_OPTIONS.find(o => o.id === feed) || FEED_OPTIONS[0];
  const accentColor = activeOption.color || '#3b82f6';

  const handleSelectFeed = (newFeedId) => {
    if (newFeedId !== 'custom') {
      setShowSourcePicker(false);
      if (onUpdateConfig) {
        onUpdateConfig({
          ...newsConfig,
          feed: newFeedId,
        });
      }
    } else {
      setCustomInputUrl(customUrl);
    }
  };

  const handleSaveCustomUrl = () => {
    if (!customInputUrl.trim()) return;
    setShowSourcePicker(false);
    if (onUpdateConfig) {
      onUpdateConfig({
        ...newsConfig,
        feed: 'custom',
        customUrl: customInputUrl.trim(),
      });
    }
  };

  const handleCycleSpeed = (e) => {
    e.stopPropagation();
    const nextSpeed = speed === 'slow' ? 'normal' : (speed === 'normal' ? 'fast' : 'slow');
    if (onUpdateConfig) {
      onUpdateConfig({
        ...newsConfig,
        speed: nextSpeed,
      });
    }
  };

  // Re-fetch trigger
  const handleReload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (feed) q.set('feed', feed);
      if (customUrl) q.set('url', customUrl);
      const res = await fetch(`/api/news?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) setItems(data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const isTop = position === 'top';

  return (
    <div
      className="news-marquee-container"
      style={{
        width: '100%',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
        background: isDark ? '#0c1220' : '#ffffff',
        borderBottom: isTop ? `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}` : 'none',
        borderTop: !isTop ? `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}` : 'none',
        fontSize: '12px',
        userSelect: 'none',
        flexShrink: 0,
        boxSizing: 'border-box',
        contain: 'paint',
      }}
    >
      {/* 1. Left Fixed Badge / Source Selector */}
      <div style={{ position: 'relative', zIndex: 20, flexShrink: 0 }} ref={popoverRef}>
        <button
          type="button"
          onClick={() => setShowSourcePicker(prev => !prev)}
          title="Change News Source & Speed"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 12px',
            height: '32px',
            background: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
            border: 'none',
            borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
            color: isDark ? '#f8fafc' : '#0f172a',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(30, 41, 59, 0.9)' : '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff'}
        >
          <span style={{ fontSize: '13px' }}>{activeOption.icon}</span>
          <span className="hidden sm:inline">{activeOption.label}</span>
          <ChevronDown size={11} style={{ opacity: 0.6, transform: showSourcePicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>

        {/* Floating Source & Speed Picker Popover */}
        {showSourcePicker && (
          <div
            style={{
              position: 'absolute',
              top: isTop ? '36px' : 'auto',
              bottom: !isTop ? '36px' : 'auto',
              left: '8px',
              width: '240px',
              background: isDark ? '#0f172a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'}`,
              borderRadius: '10px',
              boxShadow: isDark
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)'
                : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              padding: '8px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div style={{
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isDark ? '#64748b' : '#94a3b8',
              padding: '4px 6px',
            }}>
              Select Feed Source ({position === 'top' ? 'Top Ribbon' : 'Bottom Ribbon'})
            </div>

            {FEED_OPTIONS.map((opt) => {
              const isSelected = feed === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectFeed(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelected
                      ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
                      : 'transparent',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px' }}>{opt.icon}</span>
                    <span style={{ fontWeight: isSelected ? '600' : '400' }}>{opt.label}</span>
                  </div>
                  {isSelected && <Check size={13} color={opt.color} />}
                </button>
              );
            })}

            {feed === 'custom' && (
              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
                <input
                  type="url"
                  placeholder="https://example.com/rss.xml"
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCustomUrl(); }}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                    background: isDark ? '#000000' : '#ffffff',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '11px',
                    boxSizing: 'border-box',
                    marginBottom: '6px',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveCustomUrl}
                  style={{
                    width: '100%',
                    padding: '5px 0',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#3b82f6',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Apply Custom RSS
                </button>
              </div>
            )}

            {/* Speed Control Section */}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
              <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#64748b' : '#94a3b8', padding: '0 4px 6px 4px' }}>
                Marquee Speed
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {[
                  { id: 'slow', label: '🐢 Slow' },
                  { id: 'normal', label: '⏱️ Normal' },
                  { id: 'fast', label: '⚡ Fast' },
                ].map((s) => {
                  const isCurrentSpeed = speed === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (onUpdateConfig) {
                          onUpdateConfig({ ...newsConfig, speed: s.id });
                        }
                      }}
                      style={{
                        padding: '5px 2px',
                        fontSize: '10.5px',
                        borderRadius: '6px',
                        border: `1px solid ${isCurrentSpeed ? accentColor : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                        background: isCurrentSpeed ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)') : 'transparent',
                        color: isCurrentSpeed ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b'),
                        fontWeight: isCurrentSpeed ? '600' : '400',
                        cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Middle Continuous Running Ticker Track */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Static Edge Fades (0% GPU mask overhead) */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '28px',
          background: isDark ? 'linear-gradient(to right, #0c1220, transparent)' : 'linear-gradient(to right, #ffffff, transparent)',
          pointerEvents: 'none',
          zIndex: 3,
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: '28px',
          background: isDark ? 'linear-gradient(to left, #0c1220, transparent)' : 'linear-gradient(to left, #ffffff, transparent)',
          pointerEvents: 'none',
          zIndex: 3,
        }} />
        {loading && items.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: isDark ? '#64748b' : '#94a3b8',
            fontSize: '11px',
            paddingLeft: '20px',
          }}>
            <RefreshCw size={11} className="animate-spin" />
            <span>Streaming {activeOption.label} headlines...</span>
          </div>
        ) : (
          <div
            className="news-marquee-track"
            style={{
              '--marquee-speed': currentSpeedDuration,
              animationPlayState: isManualPaused ? 'paused' : 'running',
              gap: '24px',
              paddingLeft: '10px',
            }}
          >
            {/* Seamless duplicate arrays so the loop is infinite */}
            {[...items, ...items].map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                title={`${item.title} (${item.timeAgo})`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  fontSize: '11.5px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = accentColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isDark ? '#e2e8f0' : '#1e293b';
                }}
              >
                <span>{item.title}</span>
                {item.timeAgo && (
                  <span style={{ fontSize: '10px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    • {item.timeAgo}
                  </span>
                )}
                <span style={{ opacity: 0.35, fontSize: '9px', marginLeft: '12px' }}>✦</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 3. Right Fixed Controls: Manual Pause / Refresh Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0 8px',
        height: '100%',
        background: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
        borderLeft: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
        zIndex: 2,
        flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={handleCycleSpeed}
          title={`Speed: ${speed.toUpperCase()} (${currentSpeedDuration}). Click to cycle speed.`}
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
            borderRadius: '4px',
            color: isDark ? '#94a3b8' : '#64748b',
            cursor: 'pointer',
            padding: '1px 5px',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            marginRight: '2px',
          }}
        >
          <span>{speed === 'slow' ? '🐢 Slow' : (speed === 'fast' ? '⚡ Fast' : '⏱️ Normal')}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsManualPaused(prev => !prev)}
          title={isManualPaused ? "Resume news ticker" : "Pause news ticker"}
          style={{
            background: 'none',
            border: 'none',
            color: isManualPaused ? accentColor : (isDark ? '#64748b' : '#94a3b8'),
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isManualPaused ? <Play size={12} /> : <Pause size={12} />}
        </button>

        <button
          type="button"
          onClick={handleReload}
          title="Refresh headlines now"
          style={{
            background: 'none',
            border: 'none',
            color: isDark ? '#64748b' : '#94a3b8',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
}

export default React.memo(NewsTicker);
