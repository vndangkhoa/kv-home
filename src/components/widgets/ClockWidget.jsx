import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Clock, Globe, Settings2, Check } from 'lucide-react';

export default function ClockWidget({
  currentTime,
  clockConfig = {},
  isDark = true,
  title = 'Admin',
  onUpdateClockConfig,
  compact = false,
}) {
  const [internalTime, setInternalTime] = useState(() => currentTime || new Date());
  const [showOptions, setShowOptions] = useState(false);
  const popoverRef = useRef(null);

  // Isolate real-time clock tick inside ClockWidget so parent layouts never re-render every second
  useEffect(() => {
    const timer = setInterval(() => setInternalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTime = internalTime;

  const format24 = !!clockConfig.format24;
  const showSeconds = clockConfig.showSeconds !== false;
  const showGreeting = clockConfig.showGreeting !== false;
  const worldClocks = Array.isArray(clockConfig.worldClocks) ? clockConfig.worldClocks : [];

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    }
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOptions]);

  // Primary digital clock breakdown (hours:minutes, period, seconds)
  const { timeDigits, period, secondsString } = useMemo(() => {
    let hours = activeTime.getHours();
    const minutes = String(activeTime.getMinutes()).padStart(2, '0');
    const seconds = String(activeTime.getSeconds()).padStart(2, '0');
    let p = '';
    if (!format24) {
      p = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
    }
    const h = String(hours).padStart(2, '0');
    return {
      timeDigits: `${h}:${minutes}`,
      period: p,
      secondsString: showSeconds ? `${seconds}s` : '',
    };
  }, [activeTime, format24, showSeconds]);

  // Date string
  const dateString = useMemo(() => {
    return activeTime.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [activeTime]);

  // Dynamic greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = activeTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [activeTime]);

  // Quick toggle 12h/24h on clock click
  const handleToggleFormat = () => {
    if (onUpdateClockConfig) {
      onUpdateClockConfig({
        ...clockConfig,
        format24: !format24,
      });
    }
  };

  const handleToggleSeconds = () => {
    if (onUpdateClockConfig) {
      onUpdateClockConfig({
        ...clockConfig,
        showSeconds: !showSeconds,
      });
    }
  };

  const handleToggleGreeting = () => {
    if (onUpdateClockConfig) {
      onUpdateClockConfig({
        ...clockConfig,
        showGreeting: !showGreeting,
      });
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      position: 'relative',
      userSelect: 'none',
    }}>
      {/* Subtitle Greeting */}
      {showGreeting && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? '5px' : '6px',
          fontSize: compact ? '10.5px' : '11px',
          letterSpacing: compact ? '1.5px' : '2.5px',
          textTransform: 'uppercase',
          color: isDark ? '#94a3b8' : '#64748b',
          marginBottom: compact ? '3px' : '4px',
          fontWeight: '700',
          transition: 'color 0.2s ease',
        }}>
          <span>{greeting}</span>
          <span style={{
            display: 'inline-block',
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
          }} />
          <span style={{ color: isDark ? '#38bdf8' : '#2563eb', fontWeight: '700' }}>
            {title || 'Admin'}
          </span>
        </div>
      )}

      {/* Main Interactive Digital Clock */}
      <div
        className="group"
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          position: 'relative',
          padding: '1px 6px',
        }}
      >
        <button
          onClick={handleToggleFormat}
          title="Click to toggle 12-hour (AM/PM) / 24-hour format"
          style={{
            background: 'none',
            border: 'none',
            padding: '0 4px',
            margin: 0,
            cursor: 'pointer',
            fontSize: compact ? '36px' : 'clamp(44px, 6vw, 68px)',
            fontWeight: '700',
            letterSpacing: compact ? '-1px' : '-2px',
            color: isDark ? '#ffffff' : '#0f172a',
            lineHeight: '1.0',
            fontVariantNumeric: 'tabular-nums',
            textShadow: isDark
              ? '0 0 35px rgba(56, 189, 248, 0.3), 0 0 10px rgba(56, 189, 248, 0.15)'
              : 'none',
            fontFamily: 'inherit',
            borderRadius: '16px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'baseline',
            gap: compact ? '4px' : '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.015)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
          }}
        >
          <span>{timeDigits}</span>
          {(period || secondsString) && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              lineHeight: '1.1',
              marginLeft: '2px',
              textAlign: 'left',
            }}>
              {secondsString && (
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: isDark ? '#64748b' : '#94a3b8',
                  letterSpacing: '0.5px',
                  fontWeight: '500',
                }}>
                  {secondsString}
                </span>
              )}
              {period && (
                <span style={{
                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                  fontWeight: '700',
                  letterSpacing: '-0.5px',
                  color: isDark ? '#38bdf8' : '#2563eb',
                }}>
                  {period}
                </span>
              )}
            </div>
          )}
        </button>

        {/* Quick Settings Gear Popover Button */}
        <button
          onClick={() => setShowOptions(prev => !prev)}
          title="Clock & Timezone Controls"
          style={{
            position: 'absolute',
            right: '-32px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isDark ? '#94a3b8' : '#64748b',
            transition: 'all 0.2s ease',
            opacity: showOptions ? 1 : 0.35,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(-50%) rotate(30deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%)';
            if (!showOptions) e.currentTarget.style.opacity = '0.35';
          }}
        >
          <Settings2 size={13} />
        </button>

        {/* Quick Options Popover */}
        {showOptions && (
          <div
            ref={popoverRef}
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              background: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '14px',
              padding: '8px',
              minWidth: '200px',
              boxShadow: isDark
                ? '0 16px 36px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)'
                : '0 12px 30px rgba(15, 23, 42, 0.12)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              textAlign: 'left',
            }}
          >
            <div style={{
              fontSize: '10.5px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: isDark ? '#64748b' : '#94a3b8',
              padding: '4px 8px',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}>
              Clock Settings
            </div>

            <button
              onClick={handleToggleFormat}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: isDark ? '#f1f5f9' : '#0f172a',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>24-Hour Format</span>
              {format24 && <Check size={14} color="#3b82f6" />}
            </button>

            <button
              onClick={handleToggleSeconds}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: isDark ? '#f1f5f9' : '#0f172a',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>Show Seconds</span>
              {showSeconds && <Check size={14} color="#3b82f6" />}
            </button>

            <button
              onClick={handleToggleGreeting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: isDark ? '#f1f5f9' : '#0f172a',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>Show Greeting</span>
              {showGreeting && <Check size={14} color="#3b82f6" />}
            </button>
          </div>
        )}
      </div>

      {/* Date & World Clocks Integrated Capsule Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? '5px' : '8px',
        flexWrap: 'wrap',
        marginTop: compact ? '2px' : '6px',
        fontSize: compact ? '10.5px' : '12px',
        color: isDark ? '#94a3b8' : '#64748b',
      }}>
        <span style={{ fontWeight: '500', letterSpacing: '0.2px' }}>
          {dateString}
        </span>

        {worldClocks.length > 0 && (
          <>
            <span style={{ color: isDark ? '#475569' : '#cbd5e1' }}>•</span>
            {worldClocks.map((wc, idx) => {
              let tzTimeString = '';
              try {
                tzTimeString = activeTime.toLocaleTimeString([], {
                  timeZone: wc.timezone,
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: !format24,
                });
              } catch {
                tzTimeString = '--:--';
              }

              return (
                <div
                  key={idx}
                  title={`Time in ${wc.label} (${wc.timezone})`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: compact ? '3px' : '5px',
                    padding: compact ? '1px 6px' : '2px 8px',
                    borderRadius: '9999px',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                    boxShadow: isDark ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08)' : 'none',
                    fontSize: compact ? '10px' : '11px',
                    fontFamily: 'monospace',
                    color: isDark ? '#cbd5e1' : '#475569',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: idx % 2 === 0 ? '#38bdf8' : '#a855f7',
                    boxShadow: isDark ? `0 0 6px ${idx % 2 === 0 ? '#38bdf8' : '#a855f7'}` : 'none',
                  }} />
                  <span style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px', fontSize: '10px' }}>
                    {wc.label}
                  </span>
                  <span style={{ fontWeight: '500' }}>
                    {tzTimeString}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
