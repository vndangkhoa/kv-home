import React, { useState, useEffect, useRef, useMemo } from 'react';
import { saveVideoToIndexedDB } from '../utils/videoStorage';
import { getIconSlug } from '../utils/iconResolver';
import { safeSessionStorage } from '../utils/safeStorage';
import IconPickerModal from './IconPickerModal';
import {
  Sliders,
  Sparkles,
  Type,
  Terminal,
  Link2,
  FileJson,
  Shield,
  Columns,
  X,
  AlertTriangle,
  LogOut,
  Radar
} from 'lucide-react';
import { getAdminThemeTokens, PRESET_COLORS } from './admin/adminTheme';
import AdminLogin from './admin/AdminLogin';
import ThemesTab from './admin/ThemesTab';
import BrandingTab from './admin/BrandingTab';
import TerminalTab from './admin/TerminalTab';
import WidgetsTab from './admin/WidgetsTab';
import LinksTab from './admin/LinksTab';
import DiscoveryTab from './admin/DiscoveryTab';
import JsonTab from './admin/JsonTab';
import SecurityTab from './admin/SecurityTab';

export default function AdminModal({ 
  isOpen, 
  onClose, 
  links, 
  onSaveLinks, 
  onLivePreviewLinks,
  settings,
  onSaveSettings,
  onLivePreviewSettings,
  currentTheme,
  onSelectTheme,
  activeLayout,
  onSelectLayout,
  isSplitView,
  onToggleSplitView,
  isDark,
  gridInfo 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(() => safeSessionStorage.getItem('kv_admin_token') || '');
  const [password, setPassword] = useState('');
  const [loginStep, setLoginStep] = useState('password'); // 'password' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [items, setItems] = useState(() => JSON.parse(JSON.stringify(links || [])));
  const [activeTab, setActiveTab] = useState('themes');
  const [themeSubTab, setThemeSubTab] = useState('layouts');
  const [saveStatus, setSaveStatus] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState({});
  const [iconPickerItemIdx, setIconPickerItemIdx] = useState(null);

  // UX State: Accordion, Search, Drag-and-drop, Color picker popover, Safety
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [colorPickerOpenIdx, setColorPickerOpenIdx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Initial snapshot to track dirty state
  const [initialSnapshot, setInitialSnapshot] = useState(() => JSON.stringify(links || []));
  const colorPickerContainerRef = useRef(null);

  // Unsaved changes check
  const hasUnsavedChanges = useMemo(() => {
    if (!initialSnapshot) return false;
    return JSON.stringify(items) !== initialSnapshot;
  }, [items, initialSnapshot]);

  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(max-width: 768px)').matches : false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.matchMedia ? window.matchMedia('(max-width: 768px)').matches : window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // External links prop synchronization (only when content differs and modal is clean)
  const prevLinksJsonRef = useRef(JSON.stringify(links || []));
  useEffect(() => {
    const newLinksJson = JSON.stringify(links || []);
    if (prevLinksJsonRef.current !== newLinksJson) {
      prevLinksJsonRef.current = newLinksJson;
      if (links && links.length > 0 && newLinksJson !== JSON.stringify(items) && !hasUnsavedChanges) {
        const cloned = JSON.parse(newLinksJson);
        /* eslint-disable-next-line react-hooks/set-state-in-effect */
        setItems(cloned);
        setInitialSnapshot(newLinksJson);
      }
    }
  }, [links, items, hasUnsavedChanges]);

  // Handle modal open/close reset
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (links && links.length > 0) {
        const cloned = JSON.parse(JSON.stringify(links));
        setItems(cloned);
        setInitialSnapshot(JSON.stringify(cloned));
      }
      setSaveStatus('');
      setAuthError('');
      setSearchQuery('');
      setDeletingId(null);
      setColorPickerOpenIdx(null);
      setShowUnsavedWarning(false);
      setLoginStep('password');
      setOtpCode('');
      setIsAuthenticated(false);
    }
  }

  // Validate existing session token against server on open
  useEffect(() => {
    if (isOpen) {
      const existingToken = safeSessionStorage.getItem('kv_admin_token');
      if (existingToken) {
        fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${existingToken}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && data.authenticated) {
              setIsAuthenticated(true);
              setToken(existingToken);
              setTwoFactorEnabled(!!data.twoFactorEnabled);
            } else {
              setIsAuthenticated(false);
              safeSessionStorage.removeItem('kv_admin_token');
            }
          })
          .catch(() => {
            setIsAuthenticated(false);
          });
      } else {
        fetch('/api/auth/status')
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) setTwoFactorEnabled(!!data.twoFactorEnabled);
          })
          .catch(() => {});
      }
    }
  }, [isOpen]);

  // Centralized items updater that explicitly triggers live preview on user actions only
  const updateItems = (updated, shouldPreview = true) => {
    setItems(updated);
    if (shouldPreview && onLivePreviewLinks && isAuthenticated) {
      onLivePreviewLinks(updated);
    }
  };

  // Click outside to close color picker
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (colorPickerContainerRef.current && !colorPickerContainerRef.current.contains(e.target)) {
        setColorPickerOpenIdx(null);
      }
    };
    if (colorPickerOpenIdx !== null) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [colorPickerOpenIdx]);


  const handleSafeClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setAuthError('');

    try {
      const payload = { password };
      if (loginStep === 'otp') {
        payload.otp = otpCode.trim();
      }

      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setAuthError(data.error || 'Too many attempts. Access temporarily locked.');
        return;
      }

      if (!res.ok) {
        setAuthError(data.error || 'Incorrect password.');
        return;
      }

      if (data.twoFactorRequired) {
        setLoginStep('otp');
        setAuthError('');
        return;
      }

      if (data.token) {
        setIsAuthenticated(true);
        setToken(data.token);
        safeSessionStorage.setItem('kv_admin_token', data.token);
        setTwoFactorEnabled(!!data.twoFactorEnabled);
        setPassword('');
        setOtpCode('');
        setLoginStep('password');
      }
    } catch (err) {
      console.error('[AdminModal] Login error:', err);
      setAuthError(`Connection error: ${err?.message || 'Failed to communicate with server.'}`);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken('');
    safeSessionStorage.removeItem('kv_admin_token');
    setPassword('');
    setOtpCode('');
    setLoginStep('password');
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'label' && !updated[index].title) {
      updated[index].title = value.toUpperCase();
    }
    
    if (field === 'hoverColor' || field === 'color') {
      updated[index].color = value;
      updated[index].hoverColor = value;
    }

    updateItems(updated);
  };

  const handleColorSelect = (index, colorHex) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      color: colorHex,
      hoverColor: colorHex,
    };
    updateItems(updated);
  };

  const handleDisplayModeChange = (index, mode) => {
    const updated = [...items];
    if (mode === 'solid') {
      updated[index].featured = true;
      updated[index].isVideo = false;
    } else if (mode === 'hover') {
      updated[index].featured = false;
      updated[index].isVideo = false;
    } else if (mode === 'video') {
      updated[index].isVideo = true;
      updated[index].featured = false;
      if (!updated[index].videoUrl) {
        updated[index].videoUrl = '/cv-video.mp4';
      }
    }
    updateItems(updated);
  };

  const handleVideoUpload = async (index, file) => {
    if (!file) return;
    setUploadingIdx(index);
    setUploadSuccessMsg((prev) => ({ ...prev, [index]: '' }));

    const itemId = items[index]?.id || `item_${index}`;

    // 1. Save to IndexedDB
    try {
      const idbKey = `video_${itemId}_${Date.now()}`;
      await saveVideoToIndexedDB(idbKey, file);
      handleItemChange(index, 'videoUrl', `idb://${idbKey}`);
      handleItemChange(index, 'isVideo', true);
      setUploadSuccessMsg((prev) => ({ ...prev, [index]: `✓ Loaded: ${file.name}` }));
    } catch (e) {
      console.warn('IndexedDB save warning:', e);
    }

    // 2. Upload to server
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        try {
          const authToken = safeSessionStorage.getItem('kv_admin_token') || token;
          const res = await fetch('/api/upload-video', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken || ''}`,
            },
            body: JSON.stringify({ filename: file.name, base64Data }),
          });

          if (res.status === 401) {
            handleLogout();
            alert('Session expired. Please log in again.');
            setUploadingIdx(null);
            return;
          }

          if (res.ok) {
            const result = await res.json();
            if (result.url) {
              handleItemChange(index, 'videoUrl', result.url);
              setUploadSuccessMsg((prev) => ({ ...prev, [index]: `✓ Server: ${result.url}` }));
            }
          } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || 'Failed to upload video');
          }
        } catch {
          // Server offline, using IndexedDB
        }
        setUploadingIdx(null);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingIdx(null);
    }
  };

  const handleMove = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    updateItems(updated);
  };

  // Drag and Drop Reordering
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    if (e.target) {
      e.target.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e) => {
    if (e.target) {
      e.target.style.opacity = '1';
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    setDragOverIdx(index);
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const updated = [...items];
    const [draggedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, draggedItem);
    updateItems(updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleAddItem = () => {
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
    const defaultColor = PRESET_COLORS[(items.length) % PRESET_COLORS.length];
    const newItem = {
      id: nextId,
      label: `app_${nextId}`,
      title: `App ${nextId}`,
      subtitle: 'Tool',
      link: 'https://',
      group: 'tools',
      color: defaultColor,
      hoverColor: defaultColor,
      featured: true,
      isVideo: false,
      videoUrl: ''
    };
    updateItems([...items, newItem]);
    setExpandedIds((prev) => new Set([...prev, nextId]));
  };

  const handleDeleteItem = (index) => {
    if (items.length <= 1) {
      alert('You must keep at least 1 link.');
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    updateItems(updated);
    setDeletingId(null);
  };

  const handleToggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(items.map((item, idx) => item.id || idx)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleSave = async () => {
    if (!items || items.length === 0) {
      alert('Cannot save an empty list of links.');
      return;
    }
    if (links && links.length > 2 && items.length <= 1) {
      if (!window.confirm(`Warning: You are about to save only ${items.length} link (previously ${links.length}). Are you sure you want to delete all other links?`)) {
        return;
      }
    }
    setSaveStatus('Saving...');
    try {
      const result = await onSaveLinks(items);
      setInitialSnapshot(JSON.stringify(items));
      if (result && result.synced) {
        setSaveStatus('✓ Saved & synced across all devices!');
      } else {
        setSaveStatus('⚠ Saved locally only (server offline)');
      }
      setTimeout(() => setSaveStatus(''), 4000);
    } catch {
      setSaveStatus('✗ Failed to save changes.');
    }
  };

  const handleExportJson = () => {
    setJsonText(JSON.stringify(items, null, 2));
    setActiveTab('json');
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        updateItems(parsed);
        setActiveTab('links');
        alert(`Successfully loaded ${parsed.length} links! Click "Save Changes" to apply.`);
      } else {
        alert('Invalid JSON format: Expected a non-empty array of link objects.');
      }
    } catch (e) {
      alert('Error parsing JSON: ' + e.message);
    }
  };

  const handleSelectIconForLink = (slug) => {
    if (iconPickerItemIdx !== null && items[iconPickerItemIdx]) {
      const updated = [...items];
      updated[iconPickerItemIdx] = {
        ...updated[iconPickerItemIdx],
        iconSlug: slug,
        iconUrl: '',
      };
      updateItems(updated);
    }
  };

  const handleClearIconForLink = () => {
    if (iconPickerItemIdx !== null && items[iconPickerItemIdx]) {
      const updated = [...items];
      updated[iconPickerItemIdx] = {
        ...updated[iconPickerItemIdx],
        iconSlug: '',
        iconUrl: '',
      };
      updateItems(updated);
    }
  };

  // Filtered links for search
  const filteredItemsWithIdx = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items
      .map((item, originalIdx) => ({ item, originalIdx }))
      .filter(({ item }) => {
        if (!q) return true;
        return (
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.label && item.label.toLowerCase().includes(q)) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          (item.link && item.link.toLowerCase().includes(q))
        );
      });
  }, [items, searchQuery]);

  // Design Tokens
  const tokens = useMemo(() => getAdminThemeTokens(isDark), [isDark]);
  const { bg, border, text, subText, badgeBg } = tokens;

  const NAV_TABS = [
    {
      id: 'themes',
      label: 'Layouts',
      title: 'Layout & Themes',
      subtitle: 'Switch dashboard layout engines and customize block themes',
      icon: Sparkles,
      badge: '4 Engines',
    },
    {
      id: 'branding',
      label: 'Brand',
      title: 'Branding & Unified Logo',
      subtitle: 'Header logo, browser favicon, site title, and tagline',
      icon: Type,
      badge: '1-Photo Sync',
    },
    {
      id: 'terminal',
      label: 'Terminal',
      title: 'Terminal & ASCII Banner',
      subtitle: 'Customize banner text, stylish ASCII fonts, and shell appearance',
      icon: Terminal,
      badge: 'ASCII Art',
    },
    {
      id: 'widgets',
      label: 'Widgets',
      title: 'Widgets & Center Deck',
      subtitle: 'Customize Clock, World Timezones, Live Weather, and News Ticker',
      icon: Sliders,
      badge: 'Interactive',
    },
    {
      id: 'links',
      label: 'Links',
      title: 'Services & Links Directory',
      subtitle: 'Configure service cards, URLs, ordering, and video media',
      icon: Link2,
      badge: gridInfo ? `${items.length} Links · ${gridInfo.cols}×${gridInfo.rows}` : `${items.length} Links`,
    },
    {
      id: 'discovery',
      label: 'Discover',
      title: 'Auto-Discover & Port Scanner',
      subtitle: 'Scan host ports and Docker containers to automatically map services',
      icon: Radar,
      badge: 'Auto-Detect',
    },
    {
      id: 'json',
      label: 'JSON',
      title: 'Raw JSON Editor',
      subtitle: 'Direct configuration backup, export, and manual import',
      icon: FileJson,
      badge: 'Direct Data',
      onClick: handleExportJson,
    },
    {
      id: 'security',
      label: 'Security',
      title: 'Security & Two-Factor Authentication',
      subtitle: 'RFC 6238 TOTP authentication and password controls',
      icon: Shield,
      badge: twoFactorEnabled ? '2FA Active' : '2FA Off',
      badgeColor: twoFactorEnabled ? '#4CAF50' : '#ff9800',
    },
  ];

  const currentNavTab = NAV_TABS.find((t) => t.id === activeTab) || NAV_TABS[0];
  const CurrentTabIcon = currentNavTab.icon;

  if (!isOpen) return null;

  return (
    <div 
      style={isSplitView ? {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(500px, 100vw)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
        borderLeft: `1px solid ${border}`,
        background: bg,
      } : {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: isMobile ? '0px' : '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
      onClick={(e) => {
        if (!isSplitView && e.target === e.currentTarget) handleSafeClose();
      }}
    >
      <div 
        style={isSplitView ? {
          background: bg,
          color: text,
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        } : {
          background: bg,
          color: text,
          border: isMobile ? 'none' : `1px solid ${border}`,
          borderRadius: isMobile ? '0px' : '10px',
          width: '100%',
          maxWidth: isMobile ? '100vw' : '890px',
          height: isMobile ? '100%' : 'auto',
          maxHeight: isMobile ? '100dvh' : '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Unsaved Changes Dialog Overlay */}
        {showUnsavedWarning && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: bg,
              border: `1px solid ${border}`,
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff9800' }}>
                <AlertTriangle size={20} />
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Unsaved Changes</span>
              </div>
              <p style={{ fontSize: '12px', color: subText, lineHeight: '1.5', margin: 0 }}>
                You have modified links that haven't been saved yet. Exiting now will discard your changes.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowUnsavedWarning(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '5px',
                    border: `1px solid ${border}`,
                    background: 'transparent',
                    color: text,
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedWarning(false);
                    if (initialSnapshot) {
                      try {
                        const revert = JSON.parse(initialSnapshot);
                        setItems(revert);
                        if (onLivePreviewLinks) onLivePreviewLinks(revert);
                      } catch {
                        // ignore revert error
                      }
                    }
                    onClose();
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '5px',
                    border: 'none',
                    background: '#e53935',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          borderBottom: `1px solid ${border}`,
          background: isDark ? '#181818' : '#f9f9f9',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* macOS Window Traffic Lights */}
            <div className="mac-traffic-lights" style={{ marginRight: '4px' }}>
              <div
                className="mac-traffic-dot mac-traffic-close"
                onClick={handleSafeClose}
                title="Close (Esc)"
              />
              <div
                className="mac-traffic-dot mac-traffic-min"
                onClick={onToggleSplitView}
                title="Toggle Split View"
              />
              <div
                className="mac-traffic-dot mac-traffic-max"
                onClick={onToggleSplitView}
                title="Zoom / Center"
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: isDark ? '#262626' : '#ebebeb',
              color: text
            }}>
              <Sliders size={15} />
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.2px', display: 'block' }}>
                Admin Management
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onToggleSplitView}
              title={isSplitView ? "Switch to Centered Modal Dialog" : "Switch to Docked Split-View"}
              style={{
                background: isSplitView ? (isDark ? '#2e2e2e' : '#eaeaea') : 'transparent',
                border: `1px solid ${border}`,
                color: text,
                fontSize: '11px',
                padding: '5px 9px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Columns size={13} />
              <span>{isSplitView ? 'Split View' : 'Center'}</span>
            </button>
            <button
              type="button"
              onClick={handleSafeClose}
              style={{
                background: 'none',
                border: 'none',
                color: subText,
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          <AdminLogin
            loginStep={loginStep}
            password={password}
            setPassword={setPassword}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            authError={authError}
            handleLogin={handleLogin}
            setLoginStep={setLoginStep}
            setAuthError={setAuthError}
            isDark={isDark}
            tokens={tokens}
          />
        ) : (
          /* Authenticated Dashboard with Left Navigation Rail */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
            minHeight: 0,
            height: '100%',
          }}>
            {/* Left Navigation Rail */}
            <div style={{
              width: isMobile ? '50px' : '64px',
              flexShrink: 0,
              background: isDark ? '#141414' : '#f5f5f5',
              borderRight: `1px solid ${border}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: isMobile ? '8px 4px' : '12px 6px',
              userSelect: 'none',
              zIndex: 2,
            }}>
              {/* Primary Navigation Tabs */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
              }}>
                {NAV_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        if (tab.onClick) tab.onClick();
                        else setActiveTab(tab.id);
                      }}
                      title={tab.title}
                      style={{
                        width: isMobile ? '42px' : '52px',
                        height: isMobile ? '44px' : '52px',
                        borderRadius: '10px',
                        border: `1px solid ${isActive ? '#00BCD4' : 'transparent'}`,
                        background: isActive
                          ? (isDark ? 'rgba(0, 188, 212, 0.16)' : '#e0f7fa')
                          : 'transparent',
                        color: isActive ? '#00BCD4' : subText,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                        position: 'relative',
                        transition: 'all 0.18s ease',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = isDark ? '#222' : '#ebebeb';
                          e.currentTarget.style.color = text;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = subText;
                        }
                      }}
                    >
                      <Icon size={18} />
                      <span style={{
                        fontSize: '9px',
                        fontWeight: isActive ? '600' : '500',
                        lineHeight: 1,
                        letterSpacing: '-0.2px'
                      }}>
                        {tab.label}
                      </span>

                      {/* Small badge count for links */}
                      {tab.id === 'links' && (
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          fontSize: '8px',
                          padding: '1px 4px',
                          borderRadius: '6px',
                          background: isActive ? '#00BCD4' : (isDark ? '#333' : '#ddd'),
                          color: isActive ? '#000' : text,
                          fontWeight: '700',
                        }}>
                          {items.length}
                        </span>
                      )}

                      {/* Active indicator dot for security */}
                      {tab.id === 'security' && twoFactorEnabled && (
                        <span style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#4CAF50',
                          boxShadow: '0 0 6px #4CAF50',
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Actions: Log Out */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                paddingTop: '10px',
                borderTop: `1px solid ${border}`,
              }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log Out of Admin"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'transparent',
                    color: subText,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? '#2e1c1c' : '#ffebee';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = subText;
                  }}
                >
                  <LogOut size={16} />
                  <span style={{ fontSize: '9px', fontWeight: '500' }}>Logout</span>
                </button>
              </div>
            </div>

            {/* Right Main Content Pane */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minWidth: 0,
              background: isDark ? '#191919' : '#ffffff',
            }}>
              {/* Active Section Header Banner */}
              <div style={{
                padding: '12px 20px',
                borderBottom: `1px solid ${border}`,
                background: isDark ? '#161616' : '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                gap: '12px',
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    letterSpacing: '-0.2px'
                  }}>
                    {CurrentTabIcon && <CurrentTabIcon size={16} color="#00BCD4" />}
                    <span>{currentNavTab.title}</span>
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: subText,
                    marginTop: '2px',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {currentNavTab.subtitle}
                  </span>
                </div>

                {currentNavTab.badge && (
                  <span style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: currentNavTab.badgeColor
                      ? `${currentNavTab.badgeColor}22`
                      : badgeBg,
                    color: currentNavTab.badgeColor || subText,
                    border: `1px solid ${currentNavTab.badgeColor ? `${currentNavTab.badgeColor}55` : border}`,
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {currentNavTab.badge}
                  </span>
                )}
              </div>

              {/* Scrollable Content Body */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {activeTab === 'themes' && (
                  <ThemesTab
                    activeLayout={activeLayout}
                    onSelectLayout={onSelectLayout}
                    currentTheme={currentTheme}
                    onSelectTheme={onSelectTheme}
                    settings={settings}
                    onSaveSettings={onSaveSettings}
                    onLivePreviewSettings={onLivePreviewSettings}
                    themeSubTab={themeSubTab}
                    setThemeSubTab={setThemeSubTab}
                    isDark={isDark}
                    tokens={tokens}
                    isSplitView={isSplitView}
                  />
                )}

                {activeTab === 'branding' && (
                  <BrandingTab
                    settings={settings}
                    onSaveSettings={onSaveSettings}
                    onLivePreviewSettings={onLivePreviewSettings}
                    token={token}
                    isDark={isDark}
                    tokens={tokens}
                    setActiveTab={setActiveTab}
                    adminBannerText={settings?.terminal?.bannerText}
                    adminBannerFont={settings?.terminal?.bannerFont}
                    isSplitView={isSplitView}
                  />
                )}

                {activeTab === 'terminal' && (
                  <TerminalTab
                    settings={settings}
                    onSaveSettings={onSaveSettings}
                    onLivePreviewSettings={onLivePreviewSettings}
                    isDark={isDark}
                    tokens={tokens}
                    isSplitView={isSplitView}
                  />
                )}

                {activeTab === 'widgets' && (
                  <WidgetsTab
                    settings={settings}
                    onSaveSettings={onSaveSettings}
                    onLivePreviewSettings={onLivePreviewSettings}
                    isDark={isDark}
                    tokens={tokens}
                    isSplitView={isSplitView}
                  />
                )}

                {activeTab === 'links' && (
                  <LinksTab
                    items={items}
                    filteredItemsWithIdx={filteredItemsWithIdx}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    expandedIds={expandedIds}
                    handleToggleExpand={handleToggleExpand}
                    handleExpandAll={handleExpandAll}
                    handleCollapseAll={handleCollapseAll}
                    handleAddItem={handleAddItem}
                    onOpenDiscovery={() => setActiveTab('discovery')}
                    handleDeleteItem={handleDeleteItem}
                    handleMove={handleMove}
                    handleItemChange={handleItemChange}
                    handleColorSelect={handleColorSelect}
                    handleDisplayModeChange={handleDisplayModeChange}
                    handleVideoUpload={handleVideoUpload}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    draggedIdx={draggedIdx}
                    dragOverIdx={dragOverIdx}
                    colorPickerOpenIdx={colorPickerOpenIdx}
                    setColorPickerOpenIdx={setColorPickerOpenIdx}
                    colorPickerContainerRef={colorPickerContainerRef}
                    deletingId={deletingId}
                    setDeletingId={setDeletingId}
                    uploadingIdx={uploadingIdx}
                    uploadSuccessMsg={uploadSuccessMsg}
                    setIconPickerItemIdx={setIconPickerItemIdx}
                    isDark={isDark}
                    tokens={tokens}
                    isSplitView={isSplitView}
                  />
                )}

                {activeTab === 'discovery' && (
                  <DiscoveryTab
                    items={items}
                    setItems={setItems}
                    token={token}
                    onSaveLinks={onSaveLinks}
                    onLivePreviewLinks={onLivePreviewLinks}
                    isDark={isDark}
                    tokens={tokens}
                    isSplitView={isSplitView}
                  />
                )}

                {activeTab === 'json' && (
                  <JsonTab
                    jsonText={jsonText}
                    setJsonText={setJsonText}
                    handleImportJson={handleImportJson}
                    isDark={isDark}
                    tokens={tokens}
                    isSplitView={isSplitView}
                  />
                )}

                {activeTab === 'security' && (
                  <SecurityTab
                    token={token}
                    twoFactorEnabled={twoFactorEnabled}
                    setTwoFactorEnabled={setTwoFactorEnabled}
                    onLogout={handleLogout}
                    isDark={isDark}
                    tokens={tokens}
                    isSplitView={isSplitView}
                  />
                )}
              </div>

              {/* Modal Footer for Links Tab */}
              {activeTab === 'links' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderTop: `1px solid ${border}`,
                  background: isDark ? '#181818' : '#fafafa',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {hasUnsavedChanges && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#ff9800',
                        fontWeight: '500'
                      }}>
                        ● Unsaved edits
                      </span>
                    )}
                    <span style={{
                      fontSize: '11px',
                      color: saveStatus.includes('✓') ? '#4CAF50' : (saveStatus.includes('✗') ? '#f44336' : subText)
                    }}>
                      {saveStatus}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleSafeClose}
                      style={{
                        padding: '8px 14px',
                        background: 'none',
                        border: `1px solid ${border}`,
                        borderRadius: '5px',
                        color: text,
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      style={{
                        padding: '8px 18px',
                        background: isDark ? '#ffffff' : '#000000',
                        color: isDark ? '#000000' : '#ffffff',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'opacity 0.15s'
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Universal Homelab Icon Picker Modal */}
      {iconPickerItemIdx !== null && items[iconPickerItemIdx] && (
        <IconPickerModal
          isOpen={true}
          onClose={() => setIconPickerItemIdx(null)}
          currentSlug={items[iconPickerItemIdx].iconSlug || getIconSlug(items[iconPickerItemIdx])}
          onSelectIcon={handleSelectIconForLink}
          onClearIcon={handleClearIconForLink}
          isDark={isDark}
        />
      )}
    </div>
  );
}
