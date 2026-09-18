import React, { useState } from 'react';
import {
  Clock as ClockIcon,
  Sun,
  Globe,
  Radio,
  MapPin,
  Check,
  Plus,
  X
} from 'lucide-react';

export default function WidgetsTab({
  settings,
  onSaveSettings,
  onLivePreviewSettings,
  isDark,
  tokens,
  isSplitView = false,
}) {
  const { border, text, subText, cardBg, cardBorder, inputBg, inputBorder } = tokens;
  const initialWidgets = settings?.widgets || {};

  // Clock Configuration State
  const [widgetFormat24, setWidgetFormat24] = useState(() => !!initialWidgets.clock?.format24);
  const [widgetShowSeconds, setWidgetShowSeconds] = useState(() => initialWidgets.clock?.showSeconds !== false);
  const [widgetShowGreeting, setWidgetShowGreeting] = useState(() => initialWidgets.clock?.showGreeting !== false);
  const [widgetWorldClocks, setWidgetWorldClocks] = useState(() => Array.isArray(initialWidgets.clock?.worldClocks) ? initialWidgets.clock.worldClocks : [
    { label: 'UTC', timezone: 'UTC' },
    { label: 'Tokyo', timezone: 'Asia/Tokyo' }
  ]);

  // Weather Configuration State
  const [widgetWeatherEnabled, setWidgetWeatherEnabled] = useState(() => initialWidgets.weather?.enabled !== false);
  const [widgetWeatherUnit, setWidgetWeatherUnit] = useState(() => initialWidgets.weather?.unit || 'celsius');
  const [widgetWeatherCity, setWidgetWeatherCity] = useState(() => initialWidgets.weather?.city || 'Ho Chi Minh City');
  const [widgetWeatherLat, setWidgetWeatherLat] = useState(() => initialWidgets.weather?.latitude ?? 10.823);
  const [widgetWeatherLon, setWidgetWeatherLon] = useState(() => initialWidgets.weather?.longitude ?? 106.630);

  // Dual News Strips State (Top and Bottom)
  const initialTop = initialWidgets.news?.topStrip || (initialWidgets.news?.feed ? initialWidgets.news : {});
  const [widgetNewsTopEnabled, setWidgetNewsTopEnabled] = useState(() => initialTop.enabled !== false);
  const [widgetNewsTopFeed, setWidgetNewsTopFeed] = useState(() => initialTop.feed || 'vnexpress');
  const [widgetNewsTopSpeed, setWidgetNewsTopSpeed] = useState(() => initialTop.speed || 'slow');
  const [widgetNewsTopCustomUrl, setWidgetNewsTopCustomUrl] = useState(() => initialTop.customUrl || '');

  const initialBottom = initialWidgets.news?.bottomStrip || {};
  const [widgetNewsBottomEnabled, setWidgetNewsBottomEnabled] = useState(() => initialBottom.enabled !== false);
  const [widgetNewsBottomFeed, setWidgetNewsBottomFeed] = useState(() => initialBottom.feed || 'tuoitre');
  const [widgetNewsBottomSpeed, setWidgetNewsBottomSpeed] = useState(() => initialBottom.speed || 'slow');
  const [widgetNewsBottomCustomUrl, setWidgetNewsBottomCustomUrl] = useState(() => initialBottom.customUrl || '');

  // Weather city search state
  const [citySearchInput, setCitySearchInput] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [citySearching, setCitySearching] = useState(false);
  const [citySelectedMsg, setCitySelectedMsg] = useState('');

  // New world clock input state
  const [newClockLabel, setNewClockLabel] = useState('');
  const [newClockTz, setNewClockTz] = useState('UTC');

  const [widgetsSaving, setWidgetsSaving] = useState(false);
  const [widgetsSavedMsg, setWidgetsSavedMsg] = useState('');

  const triggerWidgetsLivePreview = (overrides = {}) => {
    if (!onLivePreviewSettings) return;
    onLivePreviewSettings({
      widgets: {
        clock: {
          format24: overrides.format24 ?? widgetFormat24,
          showSeconds: overrides.showSeconds ?? widgetShowSeconds,
          showGreeting: overrides.showGreeting ?? widgetShowGreeting,
          worldClocks: overrides.worldClocks ?? widgetWorldClocks,
        },
        weather: {
          enabled: overrides.weatherEnabled ?? widgetWeatherEnabled,
          unit: overrides.weatherUnit ?? widgetWeatherUnit,
          city: overrides.weatherCity ?? widgetWeatherCity,
          latitude: overrides.weatherLat ?? widgetWeatherLat,
          longitude: overrides.weatherLon ?? widgetWeatherLon,
        },
        news: {
          topStrip: {
            enabled: overrides.newsTopEnabled ?? widgetNewsTopEnabled,
            feed: overrides.newsTopFeed ?? widgetNewsTopFeed,
            speed: overrides.newsTopSpeed ?? widgetNewsTopSpeed,
            customUrl: overrides.newsTopCustomUrl ?? widgetNewsTopCustomUrl,
          },
          bottomStrip: {
            enabled: overrides.newsBottomEnabled ?? widgetNewsBottomEnabled,
            feed: overrides.newsBottomFeed ?? widgetNewsBottomFeed,
            speed: overrides.newsBottomSpeed ?? widgetNewsBottomSpeed,
            customUrl: overrides.newsBottomCustomUrl ?? widgetNewsBottomCustomUrl,
          }
        }
      }
    });
  };

  const handleSaveWidgets = async (e) => {
    if (e) e.preventDefault();
    setWidgetsSaving(true);
    setWidgetsSavedMsg('');
    const newWidgetsConfig = {
      clock: {
        format24: widgetFormat24,
        showSeconds: widgetShowSeconds,
        showGreeting: widgetShowGreeting,
        worldClocks: widgetWorldClocks,
      },
      weather: {
        enabled: widgetWeatherEnabled,
        unit: widgetWeatherUnit,
        city: widgetWeatherCity,
        latitude: widgetWeatherLat,
        longitude: widgetWeatherLon,
      },
      news: {
        topStrip: {
          enabled: widgetNewsTopEnabled,
          feed: widgetNewsTopFeed,
          speed: widgetNewsTopSpeed,
          customUrl: widgetNewsTopCustomUrl,
        },
        bottomStrip: {
          enabled: widgetNewsBottomEnabled,
          feed: widgetNewsBottomFeed,
          speed: widgetNewsBottomSpeed,
          customUrl: widgetNewsBottomCustomUrl,
        }
      }
    };

    if (onSaveSettings) {
      await onSaveSettings({
        widgets: newWidgetsConfig,
      });
    }

    setWidgetsSaving(false);
    setWidgetsSavedMsg('Widgets configuration saved successfully!');
    setTimeout(() => setWidgetsSavedMsg(''), 4000);
  };

  const handleSearchCities = async () => {
    if (!citySearchInput || citySearchInput.trim().length < 2) return;
    setCitySearching(true);
    try {
      const res = await fetch(`/api/weather/search?q=${encodeURIComponent(citySearchInput.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setCitySearchResults(data.results || []);
      }
    } catch {
      // fallback
    } finally {
      setCitySearching(false);
    }
  };

  const handleSelectCity = (result) => {
    const cityName = result.name + (result.country ? `, ${result.country}` : '');
    setWidgetWeatherCity(cityName);
    setWidgetWeatherLat(result.latitude);
    setWidgetWeatherLon(result.longitude);
    setCitySearchResults([]);
    setCitySearchInput('');
    setCitySelectedMsg(`Selected ${cityName}`);
    setTimeout(() => setCitySelectedMsg(''), 3000);
    triggerWidgetsLivePreview({
      weatherCity: cityName,
      weatherLat: result.latitude,
      weatherLon: result.longitude,
    });
  };

  const handleAddWorldClock = () => {
    if (!newClockLabel.trim() || !newClockTz.trim()) return;
    const updated = [...widgetWorldClocks, { label: newClockLabel.trim(), timezone: newClockTz.trim() }];
    setWidgetWorldClocks(updated);
    setNewClockLabel('');
    triggerWidgetsLivePreview({ worldClocks: updated });
  };

  const handleRemoveWorldClock = (index) => {
    const updated = widgetWorldClocks.filter((_, i) => i !== index);
    setWidgetWorldClocks(updated);
    triggerWidgetsLivePreview({ worldClocks: updated });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Card 1: Clock & Timezones */}
      <div style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ClockIcon size={16} color="#3b82f6" />
          <h4 style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: text }}>
            Clock & World Timezones
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isSplitView ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {/* Toggle 24-Hour */}
          <button
            type="button"
            onClick={() => {
              const next = !widgetFormat24;
              setWidgetFormat24(next);
              triggerWidgetsLivePreview({ format24: next });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${widgetFormat24 ? '#3b82f6' : inputBorder}`,
              background: widgetFormat24 ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff') : inputBg,
              color: text,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.15s ease',
            }}
          >
            <span>24-Hour Format</span>
            {widgetFormat24 && <Check size={14} color="#3b82f6" />}
          </button>

          {/* Toggle Seconds */}
          <button
            type="button"
            onClick={() => {
              const next = !widgetShowSeconds;
              setWidgetShowSeconds(next);
              triggerWidgetsLivePreview({ showSeconds: next });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${widgetShowSeconds ? '#3b82f6' : inputBorder}`,
              background: widgetShowSeconds ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff') : inputBg,
              color: text,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Show Seconds</span>
            {widgetShowSeconds && <Check size={14} color="#3b82f6" />}
          </button>

          {/* Toggle Greeting */}
          <button
            type="button"
            onClick={() => {
              const next = !widgetShowGreeting;
              setWidgetShowGreeting(next);
              triggerWidgetsLivePreview({ showGreeting: next });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${widgetShowGreeting ? '#3b82f6' : inputBorder}`,
              background: widgetShowGreeting ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff') : inputBg,
              color: text,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Show Greeting</span>
            {widgetShowGreeting && <Check size={14} color="#3b82f6" />}
          </button>
        </div>

        {/* World Clocks Manager */}
        <div style={{ borderTop: `1px solid ${border}`, paddingTop: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: subText, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            World Clocks (Secondary Timezones)
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {widgetWorldClocks.map((wc, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  border: `1px solid ${inputBorder}`,
                  fontSize: '11px',
                  color: text,
                }}
              >
                <Globe size={11} color="#3b82f6" />
                <strong>{wc.label}:</strong>
                <span style={{ color: subText }}>{wc.timezone}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveWorldClock(idx)}
                  title="Remove clock"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '1px 3px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Add World Clock Input */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Label (e.g. London, NYC)"
              value={newClockLabel}
              onChange={(e) => setNewClockLabel(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '6px',
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: text,
                fontSize: '11px',
                fontFamily: 'inherit',
                width: '130px',
              }}
            />

            <select
              value={newClockTz}
              onChange={(e) => setNewClockTz(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '6px',
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: text,
                fontSize: '11px',
                fontFamily: 'inherit',
                minWidth: '160px',
              }}
            >
              <option value="UTC">UTC (Universal)</option>
              <option value="Asia/Tokyo">Tokyo (JST, UTC+9)</option>
              <option value="Asia/Singapore">Singapore (SGT, UTC+8)</option>
              <option value="Asia/Ho_Chi_Minh">Hanoi / HCMC (ICT, UTC+7)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Paris / Berlin (CET)</option>
              <option value="America/New_York">New York (EDT/EST)</option>
              <option value="America/Los_Angeles">San Francisco (PDT/PST)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>

            <button
              type="button"
              onClick={handleAddWorldClock}
              disabled={!newClockLabel.trim()}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                background: '#3b82f6',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '600',
                cursor: newClockLabel.trim() ? 'pointer' : 'not-allowed',
                opacity: newClockLabel.trim() ? 1 : 0.5,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={12} />
              <span>Add Timezone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card 2: Real-time Weather */}
      <div style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={16} color="#f59e0b" />
            <h4 style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: text }}>
              Live Weather (Open-Meteo)
            </h4>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !widgetWeatherEnabled;
              setWidgetWeatherEnabled(next);
              triggerWidgetsLivePreview({ weatherEnabled: next });
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: `1px solid ${widgetWeatherEnabled ? '#10b981' : inputBorder}`,
              background: widgetWeatherEnabled ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5') : inputBg,
              color: widgetWeatherEnabled ? '#10b981' : subText,
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {widgetWeatherEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {widgetWeatherEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Unit Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11.5px', color: subText }}>Temperature Unit:</span>
              <div style={{ display: 'inline-flex', borderRadius: '6px', border: `1px solid ${inputBorder}`, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => {
                    setWidgetWeatherUnit('celsius');
                    triggerWidgetsLivePreview({ weatherUnit: 'celsius' });
                  }}
                  style={{
                    padding: '5px 12px',
                    border: 'none',
                    background: widgetWeatherUnit === 'celsius' ? '#3b82f6' : inputBg,
                    color: widgetWeatherUnit === 'celsius' ? '#ffffff' : text,
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Celsius (°C)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWidgetWeatherUnit('fahrenheit');
                    triggerWidgetsLivePreview({ weatherUnit: 'fahrenheit' });
                  }}
                  style={{
                    padding: '5px 12px',
                    border: 'none',
                    background: widgetWeatherUnit === 'fahrenheit' ? '#3b82f6' : inputBg,
                    color: widgetWeatherUnit === 'fahrenheit' ? '#ffffff' : text,
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            {/* Location search & current location */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: text, marginBottom: '6px' }}>
                <MapPin size={12} color="#f59e0b" />
                <span>Current Location: <strong>{widgetWeatherCity}</strong> (Lat: {widgetWeatherLat}, Lon: {widgetWeatherLon})</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Search city (e.g. Tokyo, London, Hanoi)..."
                  value={citySearchInput}
                  onChange={(e) => setCitySearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearchCities(); }}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: text,
                    fontSize: '11px',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearchCities}
                  disabled={citySearching}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#f59e0b',
                    color: '#000',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {citySearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {citySelectedMsg && (
                <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px' }}>
                  ✓ {citySelectedMsg}
                </div>
              )}

              {citySearchResults.length > 0 && (
                <div style={{
                  marginTop: '8px',
                  background: inputBg,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  maxWidth: '400px',
                }}>
                  {citySearchResults.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '7px 12px',
                        border: 'none',
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                        background: 'transparent',
                        color: text,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span>{city.name}{city.country ? `, ${city.country}` : ''}</span>
                      <span style={{ color: subText, fontSize: '10px' }}>({city.latitude?.toFixed(2)}, {city.longitude?.toFixed(2)})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card 3: Top Running News Strip */}
      <div style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={16} color="#a855f7" />
            <h4 style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: text }}>
              Top Running News Strip (Under Header)
            </h4>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !widgetNewsTopEnabled;
              setWidgetNewsTopEnabled(next);
              triggerWidgetsLivePreview({ newsTopEnabled: next });
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: `1px solid ${widgetNewsTopEnabled ? '#10b981' : inputBorder}`,
              background: widgetNewsTopEnabled ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5') : inputBg,
              color: widgetNewsTopEnabled ? '#10b981' : subText,
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {widgetNewsTopEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {widgetNewsTopEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11.5px', color: subText }}>
              Choose news feed preset or custom RSS/Atom for the top marquee ribbon:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isSplitView ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              {[
                { id: 'vnexpress', label: 'VnExpress Số Hóa (VN)' },
                { id: 'tuoitre', label: 'Tuổi Trẻ Tech (VN)' },
                { id: 'thanhnien', label: 'Thanh Niên Tech (VN)' },
                { id: 'vietnamnet', label: 'VietNamNet Tech (VN)' },
                { id: 'hackernews', label: 'Hacker News' },
                { id: 'verge', label: 'The Verge' },
                { id: 'bbc', label: 'BBC World News' },
                { id: 'reddit', label: 'Reddit r/homelab' },
                { id: 'arstechnica', label: 'Ars Technica' },
                { id: 'custom', label: 'Custom RSS URL' },
              ].map((f) => {
                const isSelected = widgetNewsTopFeed === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setWidgetNewsTopFeed(f.id);
                      triggerWidgetsLivePreview({ newsTopFeed: f.id });
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isSelected ? '#a855f7' : inputBorder}`,
                      background: isSelected ? (isDark ? 'rgba(168, 85, 247, 0.15)' : '#faf5ff') : inputBg,
                      color: text,
                      fontSize: '11.5px',
                      fontWeight: isSelected ? '600' : '400',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{f.label}</span>
                    {isSelected && <Check size={13} color="#a855f7" />}
                  </button>
                );
              })}
            </div>

            {widgetNewsTopFeed === 'custom' && (
              <div style={{ marginTop: '6px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: subText, marginBottom: '4px' }}>
                  Custom RSS / Atom Feed URL:
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/rss.xml"
                  value={widgetNewsTopCustomUrl}
                  onChange={(e) => {
                    setWidgetNewsTopCustomUrl(e.target.value);
                    triggerWidgetsLivePreview({ newsTopCustomUrl: e.target.value });
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: text,
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Top Marquee Speed Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <span style={{ fontSize: '11.5px', color: subText }}>Marquee Speed:</span>
              <div style={{ display: 'inline-flex', borderRadius: '6px', border: `1px solid ${inputBorder}`, overflow: 'hidden' }}>
                {[
                  { id: 'slow', label: '🐢 Slow (Relaxed)' },
                  { id: 'normal', label: '⏱️ Normal' },
                  { id: 'fast', label: '⚡ Fast' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setWidgetNewsTopSpeed(s.id);
                      triggerWidgetsLivePreview({ newsTopSpeed: s.id });
                    }}
                    style={{
                      padding: '5px 12px',
                      border: 'none',
                      background: widgetNewsTopSpeed === s.id ? '#a855f7' : inputBg,
                      color: widgetNewsTopSpeed === s.id ? '#ffffff' : text,
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card 4: Bottom Running News Strip */}
      <div style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={16} color="#06b6d4" />
            <h4 style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: text }}>
              Bottom Running News Strip (Above Footer)
            </h4>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !widgetNewsBottomEnabled;
              setWidgetNewsBottomEnabled(next);
              triggerWidgetsLivePreview({ newsBottomEnabled: next });
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: `1px solid ${widgetNewsBottomEnabled ? '#10b981' : inputBorder}`,
              background: widgetNewsBottomEnabled ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5') : inputBg,
              color: widgetNewsBottomEnabled ? '#10b981' : subText,
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {widgetNewsBottomEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {widgetNewsBottomEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11.5px', color: subText }}>
              Choose news feed preset or custom RSS/Atom for the bottom marquee ribbon:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isSplitView ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              {[
                { id: 'vnexpress', label: 'VnExpress Số Hóa (VN)' },
                { id: 'tuoitre', label: 'Tuổi Trẻ Tech (VN)' },
                { id: 'thanhnien', label: 'Thanh Niên Tech (VN)' },
                { id: 'vietnamnet', label: 'VietNamNet Tech (VN)' },
                { id: 'hackernews', label: 'Hacker News' },
                { id: 'verge', label: 'The Verge' },
                { id: 'bbc', label: 'BBC World News' },
                { id: 'reddit', label: 'Reddit r/homelab' },
                { id: 'arstechnica', label: 'Ars Technica' },
                { id: 'custom', label: 'Custom RSS URL' },
              ].map((f) => {
                const isSelected = widgetNewsBottomFeed === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setWidgetNewsBottomFeed(f.id);
                      triggerWidgetsLivePreview({ newsBottomFeed: f.id });
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isSelected ? '#06b6d4' : inputBorder}`,
                      background: isSelected ? (isDark ? 'rgba(6, 182, 212, 0.15)' : '#ecfeff') : inputBg,
                      color: text,
                      fontSize: '11.5px',
                      fontWeight: isSelected ? '600' : '400',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{f.label}</span>
                    {isSelected && <Check size={13} color="#06b6d4" />}
                  </button>
                );
              })}
            </div>

            {widgetNewsBottomFeed === 'custom' && (
              <div style={{ marginTop: '6px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: subText, marginBottom: '4px' }}>
                  Custom RSS / Atom Feed URL:
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/rss.xml"
                  value={widgetNewsBottomCustomUrl}
                  onChange={(e) => {
                    setWidgetNewsBottomCustomUrl(e.target.value);
                    triggerWidgetsLivePreview({ newsBottomCustomUrl: e.target.value });
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: text,
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Bottom Marquee Speed Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <span style={{ fontSize: '11.5px', color: subText }}>Marquee Speed:</span>
              <div style={{ display: 'inline-flex', borderRadius: '6px', border: `1px solid ${inputBorder}`, overflow: 'hidden' }}>
                {[
                  { id: 'slow', label: '🐢 Slow (Relaxed)' },
                  { id: 'normal', label: '⏱️ Normal' },
                  { id: 'fast', label: '⚡ Fast' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setWidgetNewsBottomSpeed(s.id);
                      triggerWidgetsLivePreview({ newsBottomSpeed: s.id });
                    }}
                    style={{
                      padding: '5px 12px',
                      border: 'none',
                      background: widgetNewsBottomSpeed === s.id ? '#06b6d4' : inputBg,
                      color: widgetNewsBottomSpeed === s.id ? '#ffffff' : text,
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Footer Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: `1px solid ${border}`,
      }}>
        <span style={{ fontSize: '12px', color: '#4CAF50', fontWeight: '500' }}>
          {widgetsSavedMsg}
        </span>

        <button
          type="button"
          onClick={handleSaveWidgets}
          disabled={widgetsSaving}
          style={{
            padding: '9px 18px',
            borderRadius: '6px',
            border: 'none',
            background: '#3b82f6',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Check size={14} />
          <span>{widgetsSaving ? 'Saving...' : 'Save Widgets Configuration'}</span>
        </button>
      </div>
    </div>
  );
}
