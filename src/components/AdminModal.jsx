import React, { useState, useEffect, useRef } from 'react';

const PRESET_COLORS = [
  '#00BCD4', '#FF9800', '#2196F3', '#FF5722', 
  '#9C27B0', '#4CAF50', '#FFC107', '#E91E63', 
  '#673AB7', '#795548', '#607D8B', '#3F51B5',
  '#009688', '#E65100', '#1E88E5', '#8E24AA',
  '#E91E63', '#00E676', '#FFD600', '#FF1744'
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
    
    // When changing hoverColor, sync color too so featured & hover colors both match
    if (field === 'hoverColor') {
      updated[index].color = value;
    }
    
    // When toggling featured on, ensure color is set
    if (field === 'featured' && value && !updated[index].color) {
      updated[index].color = updated[index].hoverColor || '#2196F3';
    }

    setItems(updated);
  };

  const handleColorSelect = (index, colorHex) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      hoverColor: colorHex,
      color: colorHex
    };
    setItems(updated);
  };

  const handleVideoUpload = async (index, file) => {
    if (!file) return;
    setUploadingIdx(index);

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
          handleItemChange(index, 'videoUrl', result.url);
          handleItemChange(index, 'isVideo', true);
          setUploadingIdx(null);
          return;
        }
      } catch (err) {
        console.warn('Server upload failed, using local blob URL');
      }

      // Fallback: use object URL / base64 directly
      handleItemChange(index, 'videoUrl', base64Data);
      handleItemChange(index, 'isVideo', true);
      setUploadingIdx(null);
    };

    reader.readAsDataURL(file);
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
      featured: false,
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
      await onSaveLinks(items);
      setSaveStatus('✓ Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
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
        setPwMessage({ text: '✓ Password updated successfully!', isError: false });
        setCurrentPw('');
        setNewPw('');
        return;
      }
    } catch (err) {
      // fallback local
    }

    const savedPw = localStorage.getItem('kv_admin_pw') || 'thieugia';
    if (currentPw === savedPw) {
      localStorage.setItem('kv_admin_pw', newPw);
      setPwMessage({ text: '✓ Password updated successfully (local)!', isError: false });
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
        maxWidth: '850px',
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
                      Add, edit, reorder, or delete web apps. The Tetris grid auto-calculates placement.
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
                      const currentColor = item.hoverColor || item.color || '#2196F3';
                      const isItemVideo = !!(item.isVideo || item.label === 'cv');

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
                          {/* Row 1: Order, Label, Title, Actions */}
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
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: isItemVideo ? '#9C27B0' : currentColor,
                                border: '2px solid rgba(255,255,255,0.3)',
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

                          {/* Row 3: Color Palette & Special Modes */}
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                            background: isDark ? '#1f1f1f' : '#eeeeee',
                            padding: '10px 12px',
                            borderRadius: '5px'
                          }}>
                            {/* Color Selector */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '9px', fontWeight: '600', color: subText }}>
                                BLOCK COLOR PALETTE
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                {PRESET_COLORS.slice(0, 10).map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleColorSelect(idx, c)}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      backgroundColor: c,
                                      border: currentColor.toLowerCase() === c.toLowerCase() ? '2px solid #fff' : '1px solid rgba(0,0,0,0.2)',
                                      boxShadow: currentColor.toLowerCase() === c.toLowerCase() ? '0 0 4px #fff' : 'none',
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
                            </div>

                            {/* Toggles */}
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={!!item.featured}
                                  onChange={(e) => handleItemChange(idx, 'featured', e.target.checked)}
                                />
                                <span title="Solid color continuously instead of dim resting state">
                                  Solid Color (Featured)
                                </span>
                              </label>

                              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={isItemVideo}
                                  onChange={(e) => handleItemChange(idx, 'isVideo', e.target.checked)}
                                />
                                <span title="Render background video animation inside block">
                                  📹 Video Block
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Row 4: Video Upload / URL (When Video is Enabled) */}
                          {isItemVideo && (
                            <div style={{
                              background: isDark ? '#171717' : '#e8f0fe',
                              border: `1px solid ${isDark ? '#333' : '#c2d7ff'}`,
                              padding: '10px 12px',
                              borderRadius: '5px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: isDark ? '#64b5f6' : '#1976d2' }}>
                                  📹 VIDEO ANIMATION SETTINGS
                                </span>
                                {uploadingIdx === idx && (
                                  <span style={{ fontSize: '10px', color: '#FF9800' }}>
                                    Uploading video...
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
                                    minWidth: '200px',
                                    padding: '6px 8px',
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
                                    padding: '6px 12px',
                                    background: '#2196F3',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  📁 Upload MP4 / WebM
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
