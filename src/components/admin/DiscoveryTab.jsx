import React, { useState } from 'react';
import {
  Radar,
  RefreshCw,
  Check,
  CheckSquare,
  Square,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Layers,
  Server,
  Boxes
} from 'lucide-react';
import { getServiceIconUrl } from '../../utils/iconResolver';

const CATEGORY_OPTIONS = [
  { id: 'primary', label: 'Primary' },
  { id: 'media', label: 'Media & Audio' },
  { id: 'tools', label: 'Tools & Admin' },
  { id: 'downloads', label: 'Downloads & *Arr' },
  { id: 'smart_home', label: 'Smart Home' },
  { id: 'storage', label: 'Storage & Cloud' },
  { id: 'networking', label: 'Networking & DNS' },
  { id: 'security', label: 'Security & Auth' },
  { id: 'dev_ai', label: 'Dev & AI' },
  { id: 'productivity', label: 'Productivity' },
];

export default function DiscoveryTab({
  items,
  setItems,
  token,
  onSaveLinks,
  onLivePreviewLinks,
  isDark,
  tokens,
  _isSplitView = false,
}) {
  const { border, text, subText, inputBg, inputBorder, badgeBg } = tokens;

  // Scan settings state
  const defaultHost = typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : '127.0.0.1';

  const [targetHost, setTargetHost] = useState(defaultHost);
  const [scanDocker, setScanDocker] = useState(true);
  const [scanPorts, setScanPorts] = useState(true);

  // Scan operation state
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [discoveredServices, setDiscoveredServices] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [hasScanned, setHasScanned] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanError('');
    setImportSuccessMsg('');

    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          host: targetHost.trim() || defaultHost,
          scanDocker,
          scanPorts,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Scan failed with HTTP status ${res.status}`);
      }

      const data = await res.json();
      const services = data.services || [];
      setDiscoveredServices(services);
      setHasScanned(true);

      // Pre-select all newly discovered items that are not already on the dashboard
      const newIds = new Set(
        services.filter((s) => !s.alreadyExists).map((s) => s.id)
      );
      setSelectedIds(newIds);
    } catch (err) {
      console.error('[DiscoveryTab] Scan error:', err);
      setScanError(err.message || 'Failed to scan host. Please verify your connection.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAllNew = () => {
    const newIds = new Set(
      discoveredServices.filter((s) => !s.alreadyExists).map((s) => s.id)
    );
    setSelectedIds(newIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleServiceFieldChange = (id, field, value) => {
    setDiscoveredServices((prev) =>
      prev.map((svc) => (svc.id === id ? { ...svc, [field]: value } : svc))
    );
  };

  const handleImportSelected = async () => {
    if (selectedIds.size === 0) return;

    const toImport = discoveredServices
      .filter((s) => selectedIds.has(s.id))
      .map((s) => ({
        id: Date.now() + Math.floor(Math.random() * 100000),
        label: s.label || s.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24),
        title: s.title || 'Discovered Service',
        subtitle: s.subtitle || '',
        link: s.link || `http://${targetHost}`,
        group: s.group || 'tools',
        color: s.color || '#00BCD4',
        hoverColor: s.hoverColor || s.color || '#00BCD4',
        featured: false,
        isVideo: false,
        iconSlug: s.iconSlug || '',
      }));

    const updatedItems = [...items, ...toImport];
    setItems(updatedItems);
    if (onLivePreviewLinks) onLivePreviewLinks(updatedItems);

    if (onSaveLinks) {
      try {
        await onSaveLinks(updatedItems);
        setImportSuccessMsg(`🎉 Successfully imported ${toImport.length} service(s) to your dashboard!`);
        // Deselect imported
        setSelectedIds(new Set());
        // Mark as alreadyExists in current discovery view
        setDiscoveredServices((prev) =>
          prev.map((s) => (selectedIds.has(s.id) ? { ...s, alreadyExists: true } : s))
        );
      } catch (e) {
        console.error('Save error:', e);
      }
    }
  };

  const newCount = discoveredServices.filter((s) => !s.alreadyExists).length;
  const existingCount = discoveredServices.filter((s) => s.alreadyExists).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Configuration & Controls Card */}
      <div
        style={{
          background: isDark ? '#1f1f1f' : '#f8f9fa',
          border: `1px solid ${border}`,
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: text, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radar size={16} color="#00BCD4" />
              Automated Host & Container Discovery
            </span>
            <span style={{ fontSize: '11px', color: subText, marginTop: '2px', display: 'block' }}>
              Scan local or remote host ports and Docker containers to automatically map homelab applications.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setTargetHost('127.0.0.1')}
              style={{
                fontSize: '10px',
                padding: '3px 7px',
                borderRadius: '5px',
                background: targetHost === '127.0.0.1' ? '#00BCD422' : badgeBg,
                color: targetHost === '127.0.0.1' ? '#00BCD4' : subText,
                border: `1px solid ${targetHost === '127.0.0.1' ? '#00BCD4' : border}`,
                cursor: 'pointer',
              }}
            >
              127.0.0.1
            </button>
            {defaultHost !== '127.0.0.1' && (
              <button
                type="button"
                onClick={() => setTargetHost(defaultHost)}
                style={{
                  fontSize: '10px',
                  padding: '3px 7px',
                  borderRadius: '5px',
                  background: targetHost === defaultHost ? '#00BCD422' : badgeBg,
                  color: targetHost === defaultHost ? '#00BCD4' : subText,
                  border: `1px solid ${targetHost === defaultHost ? '#00BCD4' : border}`,
                  cursor: 'pointer',
                }}
              >
                Host ({defaultHost})
              </button>
            )}
          </div>
        </div>

        {/* Input & Checkboxes Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: subText }}>Target Host IP / Domain</label>
            <input
              type="text"
              value={targetHost}
              onChange={(e) => setTargetHost(e.target.value)}
              placeholder="e.g. 192.168.1.100 or localhost"
              disabled={isScanning}
              style={{
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                color: text,
                outline: 'none',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '16px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: text, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={scanDocker}
                onChange={(e) => setScanDocker(e.target.checked)}
                disabled={isScanning}
              />
              <Boxes size={14} color="#2496ED" />
              <span>Docker Containers</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: text, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={scanPorts}
                onChange={(e) => setScanPorts(e.target.checked)}
                disabled={isScanning}
              />
              <Server size={14} color="#00BCD4" />
              <span>Homelab TCP Ports</span>
            </label>
          </div>

          <div style={{ paddingTop: '16px', marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={handleStartScan}
              disabled={isScanning}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: '6px',
                border: 'none',
                background: isScanning ? '#666' : '#00BCD4',
                color: '#000',
                fontWeight: '700',
                fontSize: '12px',
                cursor: isScanning ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Scanning Host...' : '🔍 Start Auto-Discovery'}</span>
            </button>
          </div>
        </div>

        {scanError && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: '#ef444422',
              border: '1px solid #ef444466',
              color: '#ef4444',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertCircle size={14} />
            <span>{scanError}</span>
          </div>
        )}

        {importSuccessMsg && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: '#22c55e22',
              border: '1px solid #22c55e66',
              color: '#22c55e',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} />
            <span>{importSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Results Header / Stats */}
      {hasScanned && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '2px 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: text }}>
              Discovered Services ({discoveredServices.length})
            </span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '4px',
                background: '#00BCD422',
                color: '#00BCD4',
                fontWeight: '600',
              }}
            >
              {newCount} New
            </span>
            {existingCount > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: badgeBg,
                  color: subText,
                  fontWeight: '500',
                }}
              >
                {existingCount} Already in Dashboard
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleSelectAllNew}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: `1px solid ${border}`,
                background: badgeBg,
                color: text,
                cursor: 'pointer',
              }}
            >
              Select All New
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: `1px solid ${border}`,
                background: badgeBg,
                color: subText,
                cursor: 'pointer',
              }}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Discovered Items List */}
      {discoveredServices.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {discoveredServices.map((svc) => {
            const isSelected = selectedIds.has(svc.id);
            const iconUrl = getServiceIconUrl(svc);

            return (
              <div
                key={svc.id}
                style={{
                  background: isDark ? '#1c1c1c' : '#ffffff',
                  border: `1px solid ${isSelected ? '#00BCD488' : border}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'border-color 0.15s ease',
                  opacity: svc.alreadyExists && !isSelected ? 0.75 : 1,
                }}
              >
                {/* Select Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleSelect(svc.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: isSelected ? '#00BCD4' : subText,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={isSelected ? 'Deselect' : 'Select'}
                >
                  {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>

                {/* Service Icon Preview */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: isDark ? '#262626' : '#f0f0f0',
                    border: `1px solid ${border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={svc.title}
                      style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Server size={18} color={svc.color || subText} />
                  )}
                </div>

                {/* Editable Fields: Title & Subtitle */}
                <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      value={svc.title}
                      onChange={(e) => handleServiceFieldChange(svc.id, 'title', e.target.value)}
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: text,
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `1px dashed ${border}`,
                        outline: 'none',
                        padding: '1px 2px',
                        width: '100%',
                        maxWidth: '240px',
                      }}
                    />
                    {svc.source === 'docker' ? (
                      <span
                        style={{
                          fontSize: '9px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: '#2496ED22',
                          color: '#2496ED',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        🐳 Docker
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '9px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: '#00BCD422',
                          color: '#00BCD4',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        ⚡ Port {svc.port}
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={svc.subtitle}
                    onChange={(e) => handleServiceFieldChange(svc.id, 'subtitle', e.target.value)}
                    placeholder="Subtitle or description..."
                    style={{
                      fontSize: '11px',
                      color: subText,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      padding: '1px 2px',
                      width: '100%',
                    }}
                  />
                </div>

                {/* Category Selector */}
                <div style={{ flexShrink: 0 }}>
                  <select
                    value={svc.group}
                    onChange={(e) => handleServiceFieldChange(svc.id, 'group', e.target.value)}
                    style={{
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      borderRadius: '5px',
                      padding: '4px 6px',
                      fontSize: '11px',
                      color: text,
                      outline: 'none',
                    }}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* URL Link */}
                <div style={{ flexShrink: 0, maxWidth: '160px', overflow: 'hidden' }}>
                  <a
                    href={svc.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '11px',
                      color: '#00BCD4',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={svc.link}
                  >
                    <ExternalLink size={12} />
                    <span>{svc.port ? `:${svc.port}` : svc.link}</span>
                  </a>
                </div>

                {/* Status Badge */}
                <div style={{ flexShrink: 0 }}>
                  {svc.alreadyExists ? (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: badgeBg,
                        color: subText,
                        fontWeight: '500',
                      }}
                    >
                      In Dashboard
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#10B98122',
                        color: '#10B981',
                        fontWeight: '700',
                      }}
                    >
                      New
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State when scanned but nothing found */}
      {hasScanned && discoveredServices.length === 0 && (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: isDark ? '#1a1a1a' : '#f9f9f9',
            border: `1px dashed ${border}`,
            borderRadius: '10px',
            color: subText,
            fontSize: '13px',
          }}
        >
          <Radar size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <p style={{ fontWeight: '600', color: text }}>No open applications detected on {targetHost}</p>
          <p style={{ fontSize: '11px', marginTop: '4px' }}>
            Check that the target IP is correct and that containers expose ports to the host.
          </p>
        </div>
      )}

      {/* Import Action Footer Banner */}
      {selectedIds.size > 0 && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: isDark ? '#141414ee' : '#ffffffee',
            backdropFilter: 'blur(10px)',
            borderTop: `1px solid ${border}`,
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.2)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#00BCD4" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: text }}>
              {selectedIds.size} service{selectedIds.size > 1 ? 's' : ''} ready to add
            </span>
          </div>

          <button
            type="button"
            onClick={handleImportSelected}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '6px',
              border: 'none',
              background: '#00BCD4',
              color: '#000',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 188, 212, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <Check size={15} />
            <span>Add Selected to Dashboard</span>
          </button>
        </div>
      )}
    </div>
  );
}
