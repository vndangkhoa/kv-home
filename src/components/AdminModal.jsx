import React, { useState, useEffect, useRef } from 'react';
import { saveVideoToIndexedDB } from '../utils/videoStorage';

const PRESET_COLORS = [
  '#00BCD4', '#FF9800', '#2196F3', '#FF5722', 
  '#9C27B0', '#4CAF50', '#FFC107', '#E91E63', 
  '#673AB7', '#795548', '#607D8B', '#3F51B5',
  '#009688', '#E65100', '#1E88E5', '#8E24AA',
  '#00E676', '#FFD600', '#FF1744', '#00B0FF'
];

export default function AdminModal({ 
  isOpen, 
  onClose, 
  links, 
  onSaveLinks, 
  isDark,
  gridInfo 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('links'); // 'links' | 'password' | 'json'
  const [saveStatus, setSaveStatus] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState({});
  
  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMessage, setPwMessage] = useState({ text: '', isError: false });

  const fileInputRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      setItems(JSON.parse(JSON.stringify(links)));
      setSaveStatus('');
      setAuthError('');
      const sessionAuth = sessionStorage.getItem('kv_admin_auth');
      if (sessionAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, [isOpen, links]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e?.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('kv_admin_auth', 'true');
        return;
      }
    } catch (err) {
      console.warn('API auth unavailable, checking local');
    }

    const savedPw = localStorage.getItem('kv_admin_pw') || 'thieugia';
    if (password === savedPw) {
      setIsAuthenticated(true);
      sessionStorage.setItem('kv_admin_auth', 'true');
    } else {
      setAuthError('Incorrect password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kv_admin_auth');
    setPassword('');
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'label' && !updated[index].title) {
      updated[index].title = value.toUpperCase();
    }
    
    // Synchronize color & hoverColor
    if (field === 'hoverColor' || field === 'color') {
      updated[index].color = value;
      updated[index].hoverColor = value;
    }

    setItems(updated);
  };

  const handleColorSelect = (index, colorHex) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      color: colorHex,
      hoverColor: colorHex,
    };
    setItems(updated);
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
    setItems(updated);
  };

  const handleVideoUpload = async (index, file) => {
    if (!file) return;
    setUploadingIdx(index);
    setUploadSuccessMsg(prev => ({ ...prev, [index]: '' }));

    const itemId = items[index]?.id || `item_${index}`;

    // 1. Always save to IndexedDB first for instant, guaranteed browser playback
    try {
      const idbKey = `video_${itemId}_${Date.now()}`;
      await saveVideoToIndexedDB(idbKey, file);
      handleItemChange(index, 'videoUrl', `idb://${idbKey}`);
      handleItemChange(index, 'isVideo', true);
      setUploadSuccessMsg(prev => ({ ...prev, [index]: `✓ Loaded video: ${file.name}` }));
    } catch (e) {
      console.warn('IndexedDB save warning:', e);
    }

    // 2. Also try uploading to server if backend is active
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        try {
          const res = await fetch('/api/upload-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, base64Data }),
          });

          if (res.ok) {
            const result = await res.json();
            if (result.url) {
              handleItemChange(index, 'videoUrl', result.url);
              setUploadSuccessMsg(prev => ({ ...prev, [index]: `✓ Saved to server: ${result.url}` }));
            }
          }
        } catch (serverErr) {
          // Server offline, using IndexedDB
        }
        setUploadingIdx(null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadingIdx(null);
    }
  };

  const handleMove = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setItems(updated);
  };

  const handleAddItem = () => {
    const nextId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1;
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
      featured: true, // Default to Solid Color so user immediately sees color!
      isVideo: false,
      videoUrl: ''
    };
    setItems([...items, newItem]);
  };

  const handleDeleteItem = (index) => {
    if (items.length <= 1) {
      alert('You must keep at least 1 link.');
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const handleSave = async () => {
    setSaveStatus('Saving...');
    try {
      const result = await onSaveLinks(items);
      if (result && result.synced) {
        setSaveStatus('✓ Saved & synced across all devices!');
      } else {
        setSaveStatus('⚠ Saved locally only (server offline)');
      }
      setTimeout(() => setSaveStatus(''), 4000);
    } catch (err) {
      setSaveStatus('✗ Failed to save changes.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage({ text: '', isError: false });

    if (!newPw || newPw.length < 3) {
      setPwMessage({ text: 'New password must be at least 3 characters', isError: true });
      return;
    }

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) {
        localStorage.setItem('kv_admin_pw', newPw);
        setPwMessage({ text: '✓ Password updated on server!', isError: false });
        setCurrentPw('');
        setNewPw('');
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        setPwMessage({ text: data.error || 'Current password incorrect', isError: true });
        return;
      }
    } catch (err) {
      // fallback local
    }

    const savedPw = localStorage.getItem('kv_admin_pw') || 'thieugia';
    if (currentPw === savedPw) {
      localStorage.setItem('kv_admin_pw', newPw);
      setPwMessage({ text: '⚠ Password updated locally (server offline)', isError: false });
      setCurrentPw('');
      setNewPw('');
    } else {
      setPwMessage({ text: 'Current password is incorrect.', isError: true });
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
        setItems(parsed);
        setActiveTab('links');
        alert(`Successfully loaded ${parsed.length} links! Click "Save Changes" to apply.`);
      } else {
        alert('Invalid JSON format: Expected a non-empty array of link objects.');
      }
    } catch (e) {
      alert('Error parsing JSON: ' + e.message);
    }
  };

  // Styles
  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const cardBg = isDark ? '#262626' : '#f7f7f7';
  const text = isDark ? '#ffffff' : '#000000';
  const subText = isDark ? '#999999' : '#666666';
  const border = isDark ? '#383838' : '#e0e0e0';
  const inputBg = isDark ? '#141414' : '#ffffff';
  const inputBorder = isDark ? '#444444' : '#cccccc';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
      fontFamily: 'var(--font-mono, monospace)'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    >
      <div style={{
        background: bg,
        color: text,
        border: `1px solid ${border}`,
        borderRadius: '8px',
        width: '100%',
        maxWidth: '880px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: `1px solid ${border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '-0.5px' }}>
              ⚙ Admin Management
            </span>
            {isAuthenticated && gridInfo && (
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: isDark ? '#333' : '#eee',
                borderRadius: '4px',
                color: subText,
              }}>
                {items.length} Links · {gridInfo.cols}×{gridInfo.rows} Grid ({gridInfo.cols * gridInfo.rows} Cells)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: text,
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* Login Form */
          <div style={{ padding: '32px 24px', maxWidth: '380px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: subText, marginBottom: '20px' }}>
              Enter administrator password to manage links and applications.
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{
                  padding: '10px 14px',
                  borderRadius: '4px',
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: text,
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              {authError && (
                <div style={{ color: '#f44336', fontSize: '11px', textAlign: 'left' }}>
                  {authError}
                </div>
              )}
              <button
                type="submit"
                style={{
                  padding: '10px',
                  background: isDark ? '#ffffff' : '#000000',
                  color: isDark ? '#000000' : '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Log In
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <>
            {/* Nav Tabs */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 20px',
              borderBottom: `1px solid ${border}`,
              background: isDark ? '#202020' : '#fafafa',
              fontSize: '12px',
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('links')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    background: activeTab === 'links' ? (isDark ? '#383838' : '#e0e0e0') : 'transparent',
                    color: text,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  🔗 Links ({items.length})
                </button>
                <button
                  onClick={handleExportJson}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    background: activeTab === 'json' ? (isDark ? '#383838' : '#e0e0e0') : 'transparent',
                    color: text,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  📋 JSON Backup / Import
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    background: activeTab === 'password' ? (isDark ? '#383838' : '#e0e0e0') : 'transparent',
                    color: text,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  🔑 Change Password
                </button>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: subText,
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                }}
              >
                Log Out
              </button>
            </div>

            {/* Content Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {activeTab === 'links' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: subText }}>
                      Add, edit, reorder, or delete web apps. The Tetris grid auto-calculates layout dimensions.
                    </div>
                    <button
                      onClick={handleAddItem}
                      style={{
                        padding: '6px 12px',
                        background: '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      + Add Link
                    </button>
                  </div>

                  {/* Links List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {items.map((item, idx) => {
                      const currentColor = item.color || item.hoverColor || '#2196F3';
                      const isItemVideo = !!(item.isVideo || item.label === 'cv');
                      const isItemSolid = !!item.featured && !isItemVideo;
                      const currentMode = isItemVideo ? 'video' : (isItemSolid ? 'solid' : 'hover');

                      return (
                        <div
                          key={item.id || idx}
                          style={{
                            background: cardBg,
                            border: `1px solid ${border}`,
                            borderRadius: '6px',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            position: 'relative',
                          }}
                        >
                          {/* Row 1: Order, Label, Title, Subtitle, Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <button
                                onClick={() => handleMove(idx, -1)}
                                disabled={idx === 0}
                                style={{
                                  padding: '4px 6px',
                                  background: isDark ? '#333' : '#ddd',
                                  border: 'none',
                                  borderRadius: '3px',
                                  color: text,
                                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                  opacity: idx === 0 ? 0.3 : 1,
                                  fontSize: '10px',
                                }}
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => handleMove(idx, 1)}
                                disabled={idx === items.length - 1}
                                style={{
                                  padding: '4px 6px',
                                  background: isDark ? '#333' : '#ddd',
                                  border: 'none',
                                  borderRadius: '3px',
                                  color: text,
                                  cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer',
                                  opacity: idx === items.length - 1 ? 0.3 : 1,
                                  fontSize: '10px',
                                }}
                                title="Move Down"
                              >
                                ▼
                              </button>
                            </div>

                            <span style={{ fontSize: '11px', fontWeight: 'bold', minWidth: '22px', color: subText }}>
                              #{idx + 1}
                            </span>

                            {/* Color Preview Pill */}
                            <div 
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                backgroundColor: isItemVideo ? '#9C27B0' : currentColor,
                                border: '1px solid rgba(255,255,255,0.4)',
                                flexShrink: 0
                              }}
                              title={isItemVideo ? 'Video Animation' : `Color: ${currentColor}`}
                            />

                            <div style={{ flex: 1, minWidth: '120px' }}>
                              <label style={{ fontSize: '9px', color: subText, display: 'block', marginBottom: '2px' }}>
                                TETRIS LABEL
                              </label>
                              <input
                                type="text"
                                value={item.label || ''}
                                onChange={(e) => handleItemChange(idx, 'label', e.target.value.toLowerCase().replace(/\s+/g, ''))}
                                placeholder="e.g. portfolio"
                                style={{
                                  width: '100%',
                                  padding: '6px 8px',
                                  borderRadius: '4px',
                                  border: `1px solid ${inputBorder}`,
                                  background: inputBg,
                                  color: text,
                                  fontSize: '11px',
                                  fontFamily: 'inherit',
                                }}
                              />
                            </div>

                            <div style={{ flex: 1, minWidth: '120px' }}>
                              <label style={{ fontSize: '9px', color: subText, display: 'block', marginBottom: '2px' }}>
                                DISPLAY TITLE
                              </label>
                              <input
                                type="text"
                                value={item.title || ''}
                                onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                                placeholder="e.g. Portfolio"
                                style={{
                                  width: '100%',
                                  padding: '6px 8px',
                                  borderRadius: '4px',
                                  border: `1px solid ${inputBorder}`,
                                  background: inputBg,
                                  color: text,
                                  fontSize: '11px',
                                  fontFamily: 'inherit',
                                }}
                              />
                            </div>

                            <div style={{ flex: 1, minWidth: '100px' }}>
                              <label style={{ fontSize: '9px', color: subText, display: 'block', marginBottom: '2px' }}>
                                SUBTITLE / TAG
                              </label>
                              <input
                                type="text"
                                value={item.subtitle || ''}
                                onChange={(e) => handleItemChange(idx, 'subtitle', e.target.value)}
                                placeholder="e.g. Streaming"
                                style={{
                                  width: '100%',
                                  padding: '6px 8px',
                                  borderRadius: '4px',
                                  border: `1px solid ${inputBorder}`,
                                  background: inputBg,
                                  color: text,
                                  fontSize: '11px',
                                  fontFamily: 'inherit',
                                }}
                              />
                            </div>

                            <button
                              onClick={() => handleDeleteItem(idx)}
                              style={{
                                padding: '6px 10px',
                                background: '#ffebee',
                                color: '#c62828',
                                border: '1px solid #ffcdd2',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                alignSelf: 'flex-end',
                              }}
                              title="Delete Link"
                            >
                              🗑
                            </button>
                          </div>

                          {/* Row 2: Destination URL */}
                          <div>
                            <label style={{ fontSize: '9px', color: subText, display: 'block', marginBottom: '2px' }}>
                              DESTINATION URL
                            </label>
                            <input
                              type="text"
                              value={item.link || ''}
                              onChange={(e) => handleItemChange(idx, 'link', e.target.value)}
                              placeholder="https://example.com"
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                border: `1px solid ${inputBorder}`,
                                background: inputBg,
                                color: text,
                                fontSize: '11px',
                                fontFamily: 'inherit',
                              }}
                            />
                          </div>

                          {/* Row 3: Display Mode Selector & Color Palette */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            background: isDark ? '#1f1f1f' : '#eeeeee',
                            padding: '10px 12px',
                            borderRadius: '5px'
                          }}>
                            {/* Mode Selector Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 'bold', color: subText }}>
                                DISPLAY STYLE
                              </span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDisplayModeChange(idx, 'solid')}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    border: `1px solid ${currentMode === 'solid' ? currentColor : 'transparent'}`,
                                    background: currentMode === 'solid' ? (isDark ? '#333' : '#fff') : 'transparent',
                                    color: text,
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    fontWeight: currentMode === 'solid' ? 'bold' : 'normal',
                                  }}
                                >
                                  🟦 Always Colored (Solid)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDisplayModeChange(idx, 'hover')}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    border: `1px solid ${currentMode === 'hover' ? (isDark ? '#fff' : '#000') : 'transparent'}`,
                                    background: currentMode === 'hover' ? (isDark ? '#333' : '#fff') : 'transparent',
                                    color: text,
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    fontWeight: currentMode === 'hover' ? 'bold' : 'normal',
                                  }}
                                >
                                  ⬜ Color on Hover Only
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDisplayModeChange(idx, 'video')}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    border: `1px solid ${currentMode === 'video' ? '#9C27B0' : 'transparent'}`,
                                    background: currentMode === 'video' ? (isDark ? '#333' : '#fff') : 'transparent',
                                    color: text,
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    fontWeight: currentMode === 'video' ? 'bold' : 'normal',
                                  }}
                                >
                                  📹 Video Animation
                                </button>
                              </div>
                            </div>

                            {/* Color Swatches (When not video) */}
                            {!isItemVideo && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '9px', color: subText }}>COLOR:</span>
                                {PRESET_COLORS.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleColorSelect(idx, c)}
                                    style={{
                                      width: '22px',
                                      height: '22px',
                                      borderRadius: '4px',
                                      backgroundColor: c,
                                      border: currentColor.toLowerCase() === c.toLowerCase() ? '2px solid #fff' : '1px solid rgba(0,0,0,0.2)',
                                      boxShadow: currentColor.toLowerCase() === c.toLowerCase() ? '0 0 6px rgba(255,255,255,0.8)' : 'none',
                                      cursor: 'pointer',
                                      padding: 0,
                                    }}
                                    title={`Select ${c}`}
                                  />
                                ))}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                                  <input
                                    type="color"
                                    value={currentColor}
                                    onChange={(e) => handleColorSelect(idx, e.target.value)}
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      padding: 0,
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      background: 'none',
                                    }}
                                    title="Custom Color"
                                  />
                                  <span style={{ fontSize: '10px', color: subText, fontFamily: 'monospace' }}>
                                    {currentColor}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Row 4: Video Upload & Management */}
                          {isItemVideo && (
                            <div style={{
                              background: isDark ? '#171717' : '#e8f0fe',
                              border: `1px solid ${isDark ? '#333' : '#c2d7ff'}`,
                              padding: '12px',
                              borderRadius: '5px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: isDark ? '#64b5f6' : '#1976d2' }}>
                                  📹 VIDEO ANIMATION CONTROLS
                                </span>
                                {uploadingIdx === idx && (
                                  <span style={{ fontSize: '10px', color: '#FF9800', fontWeight: 'bold' }}>
                                    Processing video...
                                  </span>
                                )}
                                {uploadSuccessMsg[idx] && (
                                  <span style={{ fontSize: '10px', color: '#4CAF50', fontWeight: 'bold' }}>
                                    {uploadSuccessMsg[idx]}
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                  type="text"
                                  placeholder="Video URL or path (e.g. /cv-video.mp4)"
                                  value={item.videoUrl || (item.label === 'cv' ? '/cv-video.mp4' : '')}
                                  onChange={(e) => handleItemChange(idx, 'videoUrl', e.target.value)}
                                  style={{
                                    flex: 1,
                                    minWidth: '220px',
                                    padding: '7px 9px',
                                    borderRadius: '4px',
                                    border: `1px solid ${inputBorder}`,
                                    background: inputBg,
                                    color: text,
                                    fontSize: '11px',
                                    fontFamily: 'inherit',
                                  }}
                                />

                                <input
                                  type="file"
                                  accept="video/mp4,video/webm"
                                  ref={(el) => (fileInputRefs.current[idx] = el)}
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleVideoUpload(idx, e.target.files[0]);
                                    }
                                  }}
                                />

                                <button
                                  type="button"
                                  onClick={() => fileInputRefs.current[idx]?.click()}
                                  disabled={uploadingIdx === idx}
                                  style={{
                                    padding: '7px 14px',
                                    background: '#2196F3',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  📁 Upload Video File
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {activeTab === 'json' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '12px', color: subText }}>
                    Directly export or import the full JSON configuration of your links.
                  </div>
                  <textarea
                    rows={16}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: inputBg,
                      color: text,
                      border: `1px solid ${inputBorder}`,
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                      fontSize: '11px',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleImportJson}
                      style={{
                        padding: '8px 14px',
                        background: '#2196F3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Import & Apply JSON
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(jsonText);
                        alert('JSON copied to clipboard!');
                      }}
                      style={{
                        padding: '8px 14px',
                        background: isDark ? '#333' : '#ddd',
                        color: text,
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'password' && (
                <div style={{ maxWidth: '380px', margin: '20px auto', width: '100%' }}>
                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                      Update Admin Password
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: subText, display: 'block', marginBottom: '4px' }}>
                        CURRENT PASSWORD
                      </label>
                      <input
                        type="password"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '4px',
                          border: `1px solid ${inputBorder}`,
                          background: inputBg,
                          color: text,
                          fontSize: '12px',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: subText, display: 'block', marginBottom: '4px' }}>
                        NEW PASSWORD
                      </label>
                      <input
                        type="password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '4px',
                          border: `1px solid ${inputBorder}`,
                          background: inputBg,
                          color: text,
                          fontSize: '12px',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                    {pwMessage.text && (
                      <div style={{
                        fontSize: '11px',
                        color: pwMessage.isError ? '#f44336' : '#4CAF50',
                      }}>
                        {pwMessage.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      style={{
                        padding: '10px',
                        background: isDark ? '#ffffff' : '#000000',
                        color: isDark ? '#000000' : '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        marginTop: '8px',
                      }}
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {activeTab === 'links' && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 20px',
                borderTop: `1px solid ${border}`,
                background: isDark ? '#1a1a1a' : '#ffffff',
              }}>
                <div style={{ fontSize: '12px', color: saveStatus.includes('✓') ? '#4CAF50' : (saveStatus.includes('✗') ? '#f44336' : subText) }}>
                  {saveStatus}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={onClose}
                    style={{
                      padding: '8px 14px',
                      background: 'none',
                      border: `1px solid ${border}`,
                      borderRadius: '4px',
                      color: text,
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '8px 18px',
                      background: isDark ? '#ffffff' : '#000000',
                      color: isDark ? '#000000' : '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
