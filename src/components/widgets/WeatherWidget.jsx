import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  MapPin,
  RefreshCw,
  Thermometer,
} from 'lucide-react';

// Maps WMO Weather Interpretation Codes to friendly label and icon component
function getWeatherDetails(code) {
  if (code === 0) return { label: 'Clear sky', icon: Sun, color: '#f59e0b' };
  if (code === 1 || code === 2) return { label: 'Partly cloudy', icon: CloudSun, color: '#38bdf8' };
  if (code === 3) return { label: 'Overcast', icon: Cloud, color: '#94a3b8' };
  if (code === 45 || code === 48) return { label: 'Foggy', icon: CloudFog, color: '#94a3b8' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: CloudDrizzle, color: '#0284c7' };
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: CloudRain, color: '#2563eb' };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: Snowflake, color: '#67e8f9' };
  if (code >= 80 && code <= 82) return { label: 'Showers', icon: CloudRain, color: '#3b82f6' };
  if (code >= 95) return { label: 'Thunderstorm', icon: CloudLightning, color: '#a855f7' };
  return { label: 'Clear', icon: Sun, color: '#f59e0b' };
}

export default function WeatherWidget({
  weatherConfig = {},
  isDark = true,
  onUpdateWeatherConfig,
  mode = 'pill',
  compact = false,
}) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const popoverRef = useRef(null);

  const enabled = weatherConfig.enabled !== false;
  const unit = weatherConfig.unit || 'celsius'; // 'celsius' | 'fahrenheit'
  const city = weatherConfig.city || 'Ho Chi Minh City';
  const latitude = weatherConfig.latitude ?? 10.823;
  const longitude = weatherConfig.longitude ?? 106.630;

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowDetails(false);
      }
    }
    if (showDetails) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDetails]);

  // Safe fetch helper: uses backend proxy first for CSP compliance, falls back to direct API
  const fetchWeatherApi = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(`/api/weather?latitude=${lat}&longitude=${lon}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(directUrl);
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Weather data unavailable');
  }, []);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await fetchWeatherApi(latitude, longitude);
      if (data?.current) {
        setWeatherData(data.current);
        try {
          const cacheKey = `kv_weather_${latitude}_${longitude}`;
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: data.current }));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('Could not refresh weather:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, latitude, longitude, fetchWeatherApi]);

  // Mount & interval fetch effect
  useEffect(() => {
    let active = true;

    async function init() {
      if (!enabled) return;
      const cacheKey = `kv_weather_${latitude}_${longitude}`;
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 12 * 60 * 1000) {
            if (active) {
              setWeatherData(parsed.data);
              setLoading(false);
              return;
            }
          }
        }
      } catch {
        // ignore
      }

      try {
        const data = await fetchWeatherApi(latitude, longitude);
        if (data?.current && active) {
          setWeatherData(data.current);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: data.current }));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Could not fetch weather data:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    init();
    const interval = setInterval(init, 15 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [enabled, latitude, longitude, fetchWeatherApi]);

  if (!enabled || !weatherData) {
    if (!enabled) return null;
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '11px',
        color: isDark ? '#64748b' : '#94a3b8',
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      }}>
        <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        <span>Loading weather...</span>
      </div>
    );
  }

  const rawTempC = weatherData.temperature_2m ?? 28;
  const rawApparentC = weatherData.apparent_temperature ?? rawTempC;
  const humidity = weatherData.relative_humidity_2m ?? 65;
  const windSpeed = weatherData.wind_speed_10m ?? 8;
  const code = weatherData.weather_code ?? 0;

  const { label: conditionLabel, icon: WeatherIcon, color: iconColor } = getWeatherDetails(code);

  const displayTemp = unit === 'fahrenheit'
    ? `${Math.round((rawTempC * 9) / 5 + 32)}°F`
    : `${Math.round(rawTempC)}°C`;

  const displayFeelsLike = unit === 'fahrenheit'
    ? `${Math.round((rawApparentC * 9) / 5 + 32)}°F`
    : `${Math.round(rawApparentC)}°C`;

  const handleToggleUnit = (e) => {
    e.stopPropagation();
    const nextUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
    if (onUpdateWeatherConfig) {
      onUpdateWeatherConfig({
        ...weatherConfig,
        unit: nextUnit,
      });
    }
  };

  if (mode === 'hero' || mode === 'card') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Top Header: City & Condition */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: compact ? '11px' : '12px', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b' }}>
            <MapPin size={compact ? 12 : 13} color="#f59e0b" />
            <span>{city}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '5px' : '8px' }}>
            <button
              onClick={handleToggleUnit}
              title="Toggle °C / °F"
              style={{
                fontSize: compact ? '10px' : '11px',
                fontWeight: '700',
                padding: compact ? '1px 5px' : '2px 7px',
                borderRadius: '5px',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: 'none',
                color: isDark ? '#38bdf8' : '#0284c7',
                cursor: 'pointer',
              }}
            >
              {unit === 'fahrenheit' ? '°F' : '°C'}
            </button>
            <span
              style={{
                fontSize: compact ? '10px' : '11px',
                fontWeight: '700',
                padding: compact ? '1px 6px' : '2px 8px',
                borderRadius: '5px',
                background: `${iconColor}22`,
                color: iconColor,
                border: `1px solid ${iconColor}44`,
              }}
            >
              {conditionLabel}
            </span>
          </div>
        </div>

        {/* Center: Big Temperature & Icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: compact ? '6px 0 3px 0' : '14px 0 10px 0' }}>
          <div>
            <div style={{ fontSize: compact ? '32px' : '38px', fontWeight: '800', color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: '-1px', lineHeight: 1 }}>
              {displayTemp}
            </div>
            <div style={{ fontSize: compact ? '11.5px' : '12px', color: isDark ? '#94A3B8' : '#64748B', marginTop: compact ? '3px' : '6px' }}>
              Feels like <span style={{ color: isDark ? '#F8FAFC' : '#1E293B', fontWeight: '700' }}>{displayFeelsLike}</span>
            </div>
          </div>
          <div style={{
            width: compact ? '42px' : '52px',
            height: compact ? '42px' : '52px',
            borderRadius: compact ? '11px' : '14px',
            background: `${iconColor}18`,
            border: `1px solid ${iconColor}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 16px ${iconColor}25`,
            flexShrink: 0,
          }}>
            <WeatherIcon size={compact ? 20 : 28} color={iconColor} />
          </div>
        </div>

        {/* Bottom Stats: Humidity & Wind Speed */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? '10px' : '16px',
          paddingTop: compact ? '6px' : '12px',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          fontSize: compact ? '10px' : '11.5px',
          color: isDark ? '#64748B' : '#94A3B8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Droplets size={13} color="#38bdf8" />
            <span style={{ color: isDark ? '#CBD5E1' : '#334155', fontWeight: '600' }}>{humidity}%</span> Humidity
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Wind size={13} color={isDark ? '#94a3b8' : '#64748b'} />
            <span style={{ color: isDark ? '#CBD5E1' : '#334155', fontWeight: '600' }}>{windSpeed} km/h</span> Wind
          </div>
          <button
            onClick={handleRefresh}
            title="Refresh weather data"
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Weather Pill Badge */}
      <div
        onClick={() => setShowDetails(prev => !prev)}
        title="Click to view weather details or switch °C/°F"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '9px',
          padding: '5px 16px',
          borderRadius: '9999px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)'}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isDark
            ? 'inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 8px 24px -4px rgba(0, 0, 0, 0.5)'
            : 'inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 16px -2px rgba(15, 23, 42, 0.06)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
          e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)';
        }}
      >
        <WeatherIcon size={16} color={iconColor} style={{ flexShrink: 0 }} />

        {/* Clickable Temp */}
        <button
          onClick={handleToggleUnit}
          title="Click to switch °C / °F"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '700',
            color: isDark ? '#f8fafc' : '#0f172a',
            fontFamily: 'inherit',
          }}
        >
          {displayTemp}
        </button>

        <span style={{
          fontSize: '11px',
          color: isDark ? '#94a3b8' : '#64748b',
          fontWeight: '500',
        }}>
          {conditionLabel}
        </span>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          fontSize: '10.5px',
          color: isDark ? '#64748b' : '#94a3b8',
          borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          paddingLeft: '6px',
        }}>
          <MapPin size={10} />
          <span>{city}</span>
        </div>
      </div>

      {/* Popover Card */}
      {showDetails && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '16px',
            padding: '14px 16px',
            minWidth: '220px',
            boxShadow: isDark
              ? '0 16px 36px rgba(0, 0, 0, 0.6)'
              : '0 12px 30px rgba(15, 23, 42, 0.12)',
            zIndex: 100,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>
              {city}
            </div>
            <button
              onClick={handleToggleUnit}
              style={{
                fontSize: '10.5px',
                fontWeight: '600',
                padding: '2px 7px',
                borderRadius: '6px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                color: isDark ? '#f8fafc' : '#0f172a',
                cursor: 'pointer',
              }}
            >
              Switch to {unit === 'celsius' ? '°F' : '°C'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <WeatherIcon size={28} color={iconColor} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.1 }}>
                {displayTemp}
              </div>
              <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                {conditionLabel}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            paddingTop: '8px',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            fontSize: '11px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isDark ? '#94a3b8' : '#64748b' }}>
              <Thermometer size={13} color="#f97316" />
              <span>Feels {displayFeelsLike}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isDark ? '#94a3b8' : '#64748b' }}>
              <Droplets size={13} color="#38bdf8" />
              <span>Humidity {humidity}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isDark ? '#94a3b8' : '#64748b' }}>
              <Wind size={13} color="#a855f7" />
              <span>Wind {windSpeed} km/h</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isDark ? '#94a3b8' : '#64748b' }}>
              <RefreshCw
                size={12}
                onClick={handleRefresh}
                style={{ cursor: 'pointer', opacity: 0.8 }}
                title="Refresh weather"
              />
              <span onClick={handleRefresh} style={{ cursor: 'pointer' }}>Refresh</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
