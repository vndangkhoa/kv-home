import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import { saveVideoToIndexedDB, getVideoFromIndexedDB } from '../utils/videoStorage';
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  ExternalLink,
  Palette,
  Film,
  Key,
  FileJson,
  Link2,
  LogOut,
  X,
  Check,
  Search,
  AlertTriangle,
  Upload,
  ArrowUp,
  ArrowDown,
  Sliders,
  Sparkles,
  Shield,
  ShieldCheck,
  Copy,
  QrCode
} from 'lucide-react';

const PRESET_COLORS = [
  '#00BCD4', '#FF9800', '#2196F3', '#FF5722', 
  '#9C27B0', '#4CAF50', '#FFC107', '#E91E63', 
  '#673AB7', '#795548', '#607D8B', '#3F51B5',
  '#009688', '#E65100', '#1E88E5', '#8E24AA',
  '#00E676', '#FFD600', '#FF1744', '#00B0FF'
];

/**
 * Thumbnail video preview supporting both remote/local URLs and IndexedDB blob keys
 */
function VideoThumbnail({ url, isDark }) {
  const [blobSrc, setBlobSrc] = useState(null);

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    if (url && url.startsWith('idb://')) {
      getVideoFromIndexedDB(url).then((blobUrl) => {
        if (active && blobUrl) {
          objectUrl = blobUrl;
          setBlobSrc(blobUrl);
        }
      });
    }

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  const resolvedSrc = url && url.startsWith('idb://') ? blobSrc : url;

  if (!resolvedSrc) {
    return (
      <div style={{
        width: '100px',
        height: '60px',
        background: isDark ? '#1d1d1d' : '#f0f0f0',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: isDark ? '#666' : '#999',
        border: `1px dashed ${isDark ? '#333' : '#ccc'}`,
        flexShrink: 0
      }}>
        No Preview
      </div>
    );
  }

  return (
    <video
      src={resolvedSrc}
      autoPlay
      loop
      muted
      playsInline
      style={{
        width: '100px',
        height: '60px',
        borderRadius: '4px',
        objectFit: 'cover',
        border: `1px solid ${isDark ? '#444' : '#ccc'}`,
        backgroundColor: '#000',
        flexShrink: 0
      }}
    />
  );
}

export default function AdminModal({ 
  isOpen, 
  onClose, 
  links, 
  onSaveLinks, 
  isDark,
  gridInfo 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(() => (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kv_admin_token') || '' : ''));
  const [password, setPassword] = useState('');
  const [loginStep, setLoginStep] = useState('password'); // 'password' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [items, setItems] = useState(() => JSON.parse(JSON.stringify(links || [])));
  const [activeTab, setActiveTab] = useState('links'); // 'links' | 'security' | 'json'
  const [saveStatus, setSaveStatus] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState({});
  
  // UX State: Accordion, Search, Drag-and-drop, Color picker popover, Safety
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [colorPickerOpenIdx, setColorPickerOpenIdx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Initial snapshot to track dirty state
  const [initialSnapshot, setInitialSnapshot] = useState(() => JSON.stringify(links || []));

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMessage, setPwMessage] = useState({ text: '', isError: false });

  // 2FA Management State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState(null); // { secret, qrUri, qrDataUrl }
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [twoFactorMsg, setTwoFactorMsg] = useState({ text: '', isError: false });
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showDisable2FAConfirm, setShowDisable2FAConfirm] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState('');

  const fileInputRefs = useRef({});
  const colorPickerContainerRef = useRef(null);

  const [prevLinks, setPrevLinks] = useState(links);
  if (links !== prevLinks) {
    setPrevLinks(links);
    if (links && links.length > 0) {
      const cloned = JSON.parse(JSON.stringify(links));
      setItems(cloned);
      setInitialSnapshot(JSON.stringify(cloned));
    }
  }

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
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
      setTwoFactorSetupData(null);
      setTwoFactorMsg({ text: '', isError: false });
      setShowDisable2FAConfirm(false);
      // Validate existing session token against server
      const existingToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kv_admin_token') : null;
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
              sessionStorage.removeItem('kv_admin_token');
            }
          })
          .catch(() => {
            setIsAuthenticated(false);
          });
      } else {
        setIsAuthenticated(false);
        // Fetch public 2FA status
        fetch('/api/auth/status')
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) setTwoFactorEnabled(!!data.twoFactorEnabled);
          })
          .catch(() => {});
      }
    }
  }

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

  // Unsaved changes check
  const hasUnsavedChanges = useMemo(() => {
    if (!initialSnapshot) return false;
    return JSON.stringify(items) !== initialSnapshot;
  }, [items, initialSnapshot]);

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
        sessionStorage.setItem('kv_admin_token', data.token);
        setTwoFactorEnabled(!!data.twoFactorEnabled);
        setPassword('');
        setOtpCode('');
        setLoginStep('password');
      }
    } catch {
      setAuthError('Connection error: Failed to communicate with server.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken('');
    sessionStorage.removeItem('kv_admin_token');
    setPassword('');
    setOtpCode('');
    setLoginStep('password');
    setTwoFactorSetupData(null);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-generate title if empty
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
          const authToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kv_admin_token') : token;
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
    setItems(updated);
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
    setItems(updated);
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
    setItems([...items, newItem]);
    // Expand the newly created item
    setExpandedIds((prev) => new Set([...prev, nextId]));
  };

  const handleDeleteItem = (index) => {
    if (items.length <= 1) {
      alert('You must keep at least 1 link.');
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage({ text: '', isError: false });

    if (!newPw || newPw.length < 4) {
      setPwMessage({ text: 'New password must be at least 4 characters', isError: true });
      return;
    }

    const authToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kv_admin_token') : token;
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || ''}`,
        },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        if (data.error && data.error.includes('Current password')) {
          setPwMessage({ text: data.error, isError: true });
        } else {
          handleLogout();
          alert('Session expired. Please log in again.');
        }
        return;
      }

      if (res.ok) {
        setPwMessage({ text: '✓ Password updated securely on server!', isError: false });
        setCurrentPw('');
        setNewPw('');
      } else {
        setPwMessage({ text: data.error || 'Failed to update password', isError: true });
      }
    } catch {
      setPwMessage({ text: 'Failed to communicate with server.', isError: true });
    }
  };

  const handleStart2FASetup = async () => {
    setTwoFactorMsg({ text: '', isError: false });
    const authToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kv_admin_token') : token;
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        headers: { 'Authorization': `Bearer ${authToken || ''}` },
      });
      if (res.status === 401) {
        handleLogout();
        alert('Session expired. Please log in again.');
        return;
      }
      const data = await res.json();
      if (data.secret && data.qrUri) {
        const qrDataUrl = await QRCode.toDataURL(data.qrUri, {
          width: 180,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });
        setTwoFactorSetupData({ secret: data.secret, qrUri: data.qrUri, qrDataUrl });
        setVerifyOtpInput('');
        setCopiedSecret(false);
      } else {
        setTwoFactorMsg({ text: data.error || 'Failed to initialize 2FA setup.', isError: true });
      }
    } catch (e) {
      setTwoFactorMsg({ text: 'Error generating 2FA QR code: ' + e.message, isError: true });
    }
  };

  const handleConfirm2FA = async (e) => {
    e.preventDefault();
    setTwoFactorMsg({ text: '', isError: false });
    if (!verifyOtpInput || verifyOtpInput.trim().length !== 6) {
      setTwoFactorMsg({ text: 'Please enter the 6-digit code from your authenticator app.', isError: true });
      return;
    }

    const authToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kv_admin_token') : token;
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || ''}`,
        },
        body: JSON.stringify({
          secret: twoFactorSetupData.secret,
          otp: verifyOtpInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTwoFactorEnabled(true);
        setTwoFactorSetupData(null);
        setVerifyOtpInput('');
        setTwoFactorMsg({ text: '✓ Two-Factor Authentication (2FA) is now active!', isError: false });
      } else {
        setTwoFactorMsg({ text: data.error || 'Failed to verify code.', isError: true });
      }
    } catch (e) {
      setTwoFactorMsg({ text: 'Network error: ' + e.message, isError: true });
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorMsg({ text: '', isError: false });

    const authToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kv_admin_token') : token;
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || ''}`,
        },
        body: JSON.stringify({ password: disable2FAPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTwoFactorEnabled(false);
        setShowDisable2FAConfirm(false);
        setDisable2FAPassword('');
        setTwoFactorMsg({ text: '✓ Two-Factor Authentication has been disabled.', isError: false });
      } else {
        setTwoFactorMsg({ text: data.error || 'Failed to disable 2FA. Incorrect password.', isError: true });
      }
    } catch (e) {
      setTwoFactorMsg({ text: 'Network error: ' + e.message, isError: true });
    }
  };

  const handleCopySecret = (textToCopy) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 3000);
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
  const bg = isDark ? '#141414' : '#ffffff';
  const cardBg = isDark ? '#1c1c1c' : '#fcfcfc';
  const cardBorder = isDark ? '#2a2a2a' : '#e5e5e5';
  const text = isDark ? '#ededed' : '#111111';
  const subText = isDark ? '#888888' : '#666666';
  const border = isDark ? '#2e2e2e' : '#e0e0e0';
  const inputBg = isDark ? '#101010' : '#ffffff';
  const inputBorder = isDark ? '#333333' : '#d1d1d1';
  const badgeBg = isDark ? '#242424' : '#f0f0f0';

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        fontFamily: 'var(--font-mono, monospace)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSafeClose();
      }}
    >
      <div 
        style={{
          background: bg,
          color: text,
          border: `1px solid ${border}`,
          borderRadius: '10px',
          width: '100%',
          maxWidth: '890px',
          maxHeight: '92vh',
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
                  onClick={() => {
                    setShowUnsavedWarning(false);
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
          padding: '14px 20px',
          borderBottom: `1px solid ${border}`,
          background: isDark ? '#181818' : '#f9f9f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: isDark ? '#262626' : '#ebebeb',
              color: text
            }}>
              <Sliders size={16} />
            </div>
            <div>
              <span style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '-0.3px', display: 'block' }}>
                Admin Management
              </span>
            </div>
            {isAuthenticated && gridInfo && (
              <span style={{
                fontSize: '11px',
                padding: '3px 8px',
                background: badgeBg,
                borderRadius: '4px',
                color: subText,
                border: `1px solid ${border}`
              }}>
                {items.length} Links · {gridInfo.cols}×{gridInfo.rows} Grid ({gridInfo.cols * gridInfo.rows} Cells)
              </span>
            )}
          </div>
          <button
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
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* Login Form with 2-Step 2FA Support */
          <div style={{ padding: '48px 24px', maxWidth: '380px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
            {loginStep === 'password' ? (
              <>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  background: isDark ? '#262626' : '#eeeeee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: text
                }}>
                  <Key size={20} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Administrator Authentication
                </div>
                <div style={{ fontSize: '12px', color: subText, marginBottom: '24px', lineHeight: '1.4' }}>
                  Enter password to access portal controls and settings.
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
                      borderRadius: '6px',
                      border: `1px solid ${inputBorder}`,
                      background: inputBg,
                      color: text,
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                  {authError && (
                    <div style={{ color: '#f44336', fontSize: '11px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> {authError}
                    </div>
                  )}
                  <button
                    type="submit"
                    style={{
                      padding: '10px',
                      background: isDark ? '#ffffff' : '#000000',
                      color: isDark ? '#000000' : '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Log In
                  </button>
                </form>
              </>
            ) : (
              <>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  background: isDark ? '#1a3320' : '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: '#4CAF50'
                }}>
                  <ShieldCheck size={22} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Two-Factor Authentication
                </div>
                <div style={{ fontSize: '12px', color: subText, marginBottom: '20px', lineHeight: '1.4' }}>
                  Enter the 6-digit code from your authenticator app (Google Authenticator, 1Password, Authy).
                </div>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    style={{
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: `1px solid ${inputBorder}`,
                      background: inputBg,
                      color: text,
                      fontSize: '22px',
                      fontFamily: 'inherit',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      outline: 'none',
                      fontWeight: '600'
                    }}
                  />
                  {authError && (
                    <div style={{ color: '#f44336', fontSize: '11px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> {authError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={otpCode.length !== 6}
                    style={{
                      padding: '10px',
                      background: otpCode.length === 6 ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#333' : '#ddd'),
                      color: otpCode.length === 6 ? (isDark ? '#000000' : '#ffffff') : subText,
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: otpCode.length === 6 ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit',
                    }}
                  >
                    Verify Code & Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('password');
                      setOtpCode('');
                      setAuthError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: subText,
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Back to Password
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          /* Authenticated Dashboard */
          <>
            {/* Nav Tabs */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 20px',
              borderBottom: `1px solid ${border}`,
              background: isDark ? '#191919' : '#fafafa',
              fontSize: '12px',
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setActiveTab('links')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '5px',
                    border: 'none',
                    background: activeTab === 'links' ? (isDark ? '#2e2e2e' : '#eaeaea') : 'transparent',
                    color: activeTab === 'links' ? text : subText,
                    fontWeight: activeTab === 'links' ? '600' : 'normal',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Link2 size={14} /> Links ({items.length})
                </button>
                <button
                  onClick={handleExportJson}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '5px',
                    border: 'none',
                    background: activeTab === 'json' ? (isDark ? '#2e2e2e' : '#eaeaea') : 'transparent',
                    color: activeTab === 'json' ? text : subText,
                    fontWeight: activeTab === 'json' ? '600' : 'normal',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileJson size={14} /> JSON Backup / Import
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '5px',
                    border: 'none',
                    background: activeTab === 'security' ? (isDark ? '#2e2e2e' : '#eaeaea') : 'transparent',
                    color: activeTab === 'security' ? text : subText,
                    fontWeight: activeTab === 'security' ? '600' : 'normal',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Shield size={14} /> Security & 2FA
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <LogOut size={13} /> Log Out
              </button>
            </div>

            {/* Content Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {activeTab === 'links' && (
                <>
                  {/* Toolbar: Search, Expand All, Add Link */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    {/* Search bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      borderRadius: '6px',
                      padding: '5px 10px',
                      flex: '1 1 240px',
                      maxWidth: '340px'
                    }}>
                      <Search size={14} color={subText} style={{ marginRight: '6px', flexShrink: 0 }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter links by title, tag, slug..."
                        style={{
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          color: text,
                          fontSize: '11px',
                          fontFamily: 'inherit',
                          width: '100%'
                        }}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: subText,
                            cursor: 'pointer',
                            padding: '0 2px'
                          }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={expandedIds.size > 0 ? handleCollapseAll : handleExpandAll}
                        style={{
                          padding: '6px 10px',
                          background: badgeBg,
                          color: text,
                          border: `1px solid ${border}`,
                          borderRadius: '5px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {expandedIds.size > 0 ? (
                          <>
                            <ChevronUp size={13} /> Collapse All
                          </>
                        ) : (
                          <>
                            <ChevronDown size={13} /> Expand All
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleAddItem}
                        style={{
                          padding: '6px 12px',
                          background: isDark ? '#ffffff' : '#000000',
                          color: isDark ? '#000000' : '#ffffff',
                          border: 'none',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Plus size={14} /> Add Link
                      </button>
                    </div>
                  </div>

                  {searchQuery && (
                    <div style={{ fontSize: '11px', color: subText }}>
                      Showing {filteredItemsWithIdx.length} of {items.length} links for "{searchQuery}"
                    </div>
                  )}

                  {/* Links Accordion List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredItemsWithIdx.map(({ item, originalIdx }) => {
                      const itemId = item.id || originalIdx;
                      const isExpanded = expandedIds.has(itemId);
                      const currentColor = item.color || item.hoverColor || '#2196F3';
                      const isItemVideo = !!(item.isVideo || item.label === 'cv');
                      const isItemSolid = !!item.featured && !isItemVideo;
                      const currentMode = isItemVideo ? 'video' : (isItemSolid ? 'solid' : 'hover');
                      const isDeleting = deletingId === itemId;
                      const isColorPickerOpen = colorPickerOpenIdx === originalIdx;
                      const isDragTarget = dragOverIdx === originalIdx && draggedIdx !== originalIdx;

                      return (
                        <div
                          key={itemId}
                          onDragOver={(e) => handleDragOver(e, originalIdx)}
                          onDrop={(e) => handleDrop(e, originalIdx)}
                          style={{
                            background: cardBg,
                            border: `1px solid ${isDragTarget ? '#2196F3' : cardBorder}`,
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isDragTarget ? '0 0 0 2px rgba(33, 150, 243, 0.4)' : 'none',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                            overflow: 'visible',
                            position: 'relative'
                          }}
                        >
                          {/* Collapsed Summary Header Row */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            gap: '10px',
                            userSelect: 'none',
                          }}>
                            {/* Left: Drag Handle, Arrows, Order #, Swatch Dot, Title & Tag */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                              {/* Drag Handle */}
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, originalIdx)}
                                onDragEnd={handleDragEnd}
                                style={{
                                  cursor: 'grab',
                                  color: subText,
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '2px',
                                }}
                                title="Drag to reorder"
                              >
                                <GripVertical size={14} />
                              </div>

                              {/* Up / Down Reorder Buttons */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMove(originalIdx, -1);
                                  }}
                                  disabled={originalIdx === 0}
                                  style={{
                                    padding: '1px 3px',
                                    background: 'none',
                                    border: 'none',
                                    color: originalIdx === 0 ? (isDark ? '#444' : '#ccc') : text,
                                    cursor: originalIdx === 0 ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    lineHeight: 1
                                  }}
                                  title="Move Up"
                                >
                                  <ArrowUp size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMove(originalIdx, 1);
                                  }}
                                  disabled={originalIdx === items.length - 1}
                                  style={{
                                    padding: '1px 3px',
                                    background: 'none',
                                    border: 'none',
                                    color: originalIdx === items.length - 1 ? (isDark ? '#444' : '#ccc') : text,
                                    cursor: originalIdx === items.length - 1 ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    lineHeight: 1
                                  }}
                                  title="Move Down"
                                >
                                  <ArrowDown size={11} />
                                </button>
                              </div>

                              {/* Index */}
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 'bold',
                                color: subText,
                                minWidth: '24px'
                              }}>
                                #{String(originalIdx + 1).padStart(2, '0')}
                              </span>

                              {/* Mode / Color Swatch Dot */}
                              <div 
                                style={{
                                  width: '14px',
                                  height: '14px',
                                  borderRadius: '3px',
                                  backgroundColor: isItemVideo ? '#9C27B0' : currentColor,
                                  border: isItemSolid ? '1px solid rgba(255,255,255,0.7)' : (isDark ? '1px solid #444' : '1px solid #bbb'),
                                  opacity: isItemSolid || isItemVideo ? 1 : 0.6,
                                  flexShrink: 0
                                }}
                                title={isItemVideo ? 'Video' : (isItemSolid ? `Solid Color: ${currentColor}` : `Hover Color: ${currentColor}`)}
                              />

                              {/* Title, Tag, and Slug */}
                              <div 
                                onClick={() => handleToggleExpand(itemId)}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '8px', 
                                  cursor: 'pointer',
                                  minWidth: 0,
                                  overflow: 'hidden'
                                }}
                              >
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: text,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {item.title || item.label || 'Untitled'}
                                </span>

                                {item.subtitle && (
                                  <span style={{
                                    fontSize: '10px',
                                    padding: '1px 6px',
                                    borderRadius: '3px',
                                    background: badgeBg,
                                    color: subText,
                                    border: `1px solid ${border}`,
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {item.subtitle}
                                  </span>
                                )}

                                <span style={{
                                  fontSize: '10px',
                                  color: isDark ? '#555' : '#aaa',
                                  whiteSpace: 'nowrap'
                                }}>
                                  /{item.label}
                                </span>
                              </div>
                            </div>

                            {/* Right: URL Snippet, Mode Pill, Quick Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              {/* Truncated URL */}
                              <span style={{
                                fontSize: '10px',
                                color: subText,
                                maxWidth: '170px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {item.link ? item.link.replace(/^https?:\/\//, '') : ''}
                              </span>

                              {/* Display Mode Badge */}
                              <span style={{
                                fontSize: '10px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                background: isItemVideo 
                                  ? (isDark ? 'rgba(156, 39, 176, 0.2)' : '#f3e5f5')
                                  : (isItemSolid ? (isDark ? 'rgba(33, 150, 243, 0.2)' : '#e3f2fd') : badgeBg),
                                color: isItemVideo 
                                  ? (isDark ? '#ce93d8' : '#7b1fa2')
                                  : (isItemSolid ? (isDark ? '#90caf9' : '#1976d2') : subText),
                                border: `1px solid ${border}`,
                                fontWeight: '500'
                              }}>
                                {isItemVideo ? 'Video' : (isItemSolid ? 'Solid' : 'Hover')}
                              </span>

                              {/* Test Link Button */}
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    padding: '5px',
                                    color: subText,
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    textDecoration: 'none'
                                  }}
                                  title={`Open ${item.link} in new tab`}
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}

                              {/* Toggle Edit Expand Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleExpand(itemId)}
                                style={{
                                  padding: '5px 8px',
                                  background: 'none',
                                  border: `1px solid ${border}`,
                                  borderRadius: '4px',
                                  color: text,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '10px'
                                }}
                                title={isExpanded ? 'Collapse' : 'Edit details'}
                              >
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>

                              {/* Delete Button with 2-step confirmation */}
                              {isDeleting ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(originalIdx)}
                                    style={{
                                      padding: '4px 8px',
                                      background: '#d32f2f',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      cursor: 'pointer',
                                      fontWeight: '600'
                                    }}
                                  >
                                    Confirm?
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingId(null)}
                                    style={{
                                      padding: '4px 6px',
                                      background: 'transparent',
                                      color: subText,
                                      border: `1px solid ${border}`,
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(itemId)}
                                  style={{
                                    padding: '5px',
                                    background: 'none',
                                    border: 'none',
                                    color: isDark ? '#777' : '#999',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  title="Delete link"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Edit Form */}
                          {isExpanded && (
                            <div style={{
                              padding: '14px',
                              borderTop: `1px solid ${border}`,
                              background: isDark ? '#161616' : '#f7f7f7',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              {/* Row 1: Title, Subtitle, Tetris Slug */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                <div>
                                  <label style={{ fontSize: '9px', fontWeight: '600', color: subText, display: 'block', marginBottom: '3px' }}>
                                    DISPLAY TITLE
                                  </label>
                                  <input
                                    type="text"
                                    value={item.title || ''}
                                    onChange={(e) => handleItemChange(originalIdx, 'title', e.target.value)}
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

                                <div>
                                  <label style={{ fontSize: '9px', fontWeight: '600', color: subText, display: 'block', marginBottom: '3px' }}>
                                    SUBTITLE / TAG
                                  </label>
                                  <input
                                    type="text"
                                    value={item.subtitle || ''}
                                    onChange={(e) => handleItemChange(originalIdx, 'subtitle', e.target.value)}
                                    placeholder="e.g. Tools, Streaming"
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

                                <div>
                                  <label style={{ fontSize: '9px', fontWeight: '600', color: subText, display: 'block', marginBottom: '3px' }}>
                                    TETRIS SLUG (INTERNAL KEY)
                                  </label>
                                  <input
                                    type="text"
                                    value={item.label || ''}
                                    onChange={(e) => handleItemChange(originalIdx, 'label', e.target.value.toLowerCase().replace(/\s+/g, ''))}
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
                              </div>

                              {/* Row 2: Destination URL with direct test link */}
                              <div>
                                <label style={{ fontSize: '9px', fontWeight: '600', color: subText, display: 'block', marginBottom: '3px' }}>
                                  DESTINATION URL
                                </label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <input
                                    type="text"
                                    value={item.link || ''}
                                    onChange={(e) => handleItemChange(originalIdx, 'link', e.target.value)}
                                    placeholder="https://example.com"
                                    style={{
                                      flex: 1,
                                      padding: '6px 8px',
                                      borderRadius: '4px',
                                      border: `1px solid ${inputBorder}`,
                                      background: inputBg,
                                      color: text,
                                      fontSize: '11px',
                                      fontFamily: 'inherit',
                                    }}
                                  />
                                  {item.link && (
                                    <a
                                      href={item.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        padding: '6px 10px',
                                        background: badgeBg,
                                        border: `1px solid ${border}`,
                                        borderRadius: '4px',
                                        color: text,
                                        fontSize: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        textDecoration: 'none'
                                      }}
                                    >
                                      Test <ExternalLink size={11} />
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Row 3: Display Style Segmented Control & Compact Color Picker */}
                              <div style={{
                                background: isDark ? '#202020' : '#ececec',
                                padding: '10px',
                                borderRadius: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: '8px'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: subText }}>
                                      DISPLAY STYLE:
                                    </span>
                                    <div style={{
                                      display: 'inline-flex',
                                      background: inputBg,
                                      borderRadius: '5px',
                                      padding: '2px',
                                      border: `1px solid ${inputBorder}`
                                    }}>
                                      <button
                                        type="button"
                                        onClick={() => handleDisplayModeChange(originalIdx, 'solid')}
                                        style={{
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          border: 'none',
                                          background: currentMode === 'solid' ? (isDark ? '#333' : '#e0e0e0') : 'transparent',
                                          color: text,
                                          fontSize: '10px',
                                          fontWeight: currentMode === 'solid' ? '600' : 'normal',
                                          cursor: 'pointer',
                                          fontFamily: 'inherit'
                                        }}
                                      >
                                        Solid Color
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDisplayModeChange(originalIdx, 'hover')}
                                        style={{
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          border: 'none',
                                          background: currentMode === 'hover' ? (isDark ? '#333' : '#e0e0e0') : 'transparent',
                                          color: text,
                                          fontSize: '10px',
                                          fontWeight: currentMode === 'hover' ? '600' : 'normal',
                                          cursor: 'pointer',
                                          fontFamily: 'inherit'
                                        }}
                                      >
                                        Color on Hover
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDisplayModeChange(originalIdx, 'video')}
                                        style={{
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          border: 'none',
                                          background: currentMode === 'video' ? (isDark ? '#333' : '#e0e0e0') : 'transparent',
                                          color: text,
                                          fontSize: '10px',
                                          fontWeight: currentMode === 'video' ? '600' : 'normal',
                                          cursor: 'pointer',
                                          fontFamily: 'inherit'
                                        }}
                                      >
                                        Video Animation
                                      </button>
                                    </div>
                                  </div>

                                  {/* Color Picker Swatch Button with Popover */}
                                  {!isItemVideo && (
                                    <div style={{ position: 'relative' }} ref={isColorPickerOpen ? colorPickerContainerRef : null}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: subText }}>
                                          COLOR:
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setColorPickerOpenIdx(isColorPickerOpen ? null : originalIdx)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 8px',
                                            background: inputBg,
                                            border: `1px solid ${inputBorder}`,
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: text,
                                            fontSize: '10px',
                                            fontFamily: 'inherit'
                                          }}
                                        >
                                          <span style={{
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '3px',
                                            backgroundColor: currentColor,
                                            border: '1px solid rgba(0,0,0,0.2)'
                                          }} />
                                          <span>{currentColor.toUpperCase()}</span>
                                          <Palette size={12} color={subText} />
                                        </button>
                                      </div>

                                      {/* Floating Color Palette Popover */}
                                      {isColorPickerOpen && (
                                        <div style={{
                                          position: 'absolute',
                                          top: 'calc(100% + 6px)',
                                          right: 0,
                                          background: isDark ? '#1e1e1e' : '#ffffff',
                                          border: `1px solid ${border}`,
                                          borderRadius: '8px',
                                          padding: '12px',
                                          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                                          zIndex: 200,
                                          width: '260px',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '10px'
                                        }}>
                                          <div style={{ fontSize: '10px', fontWeight: 'bold', color: subText }}>
                                            PRESET PALETTE
                                          </div>
                                          <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(10, 1fr)',
                                            gap: '4px'
                                          }}>
                                            {PRESET_COLORS.map((c) => (
                                              <button
                                                key={c}
                                                type="button"
                                                onClick={() => {
                                                  handleColorSelect(originalIdx, c);
                                                  setColorPickerOpenIdx(null);
                                                }}
                                                style={{
                                                  width: '20px',
                                                  height: '20px',
                                                  borderRadius: '3px',
                                                  backgroundColor: c,
                                                  border: currentColor.toLowerCase() === c.toLowerCase() ? '2px solid #fff' : '1px solid rgba(0,0,0,0.2)',
                                                  boxShadow: currentColor.toLowerCase() === c.toLowerCase() ? '0 0 4px rgba(0,0,0,0.5)' : 'none',
                                                  cursor: 'pointer',
                                                  padding: 0
                                                }}
                                                title={c}
                                              />
                                            ))}
                                          </div>

                                          <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingTop: '8px',
                                            borderTop: `1px solid ${border}`
                                          }}>
                                            <span style={{ fontSize: '10px', color: subText }}>Custom Hex:</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              <input
                                                type="color"
                                                value={currentColor}
                                                onChange={(e) => handleColorSelect(originalIdx, e.target.value)}
                                                style={{
                                                  width: '24px',
                                                  height: '24px',
                                                  padding: 0,
                                                  border: 'none',
                                                  borderRadius: '4px',
                                                  cursor: 'pointer',
                                                  background: 'none'
                                                }}
                                              />
                                              <input
                                                type="text"
                                                value={currentColor}
                                                onChange={(e) => handleColorSelect(originalIdx, e.target.value)}
                                                style={{
                                                  width: '70px',
                                                  padding: '3px 6px',
                                                  fontSize: '10px',
                                                  fontFamily: 'monospace',
                                                  borderRadius: '3px',
                                                  border: `1px solid ${inputBorder}`,
                                                  background: inputBg,
                                                  color: text
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Row 4: Video Animation Controls & Live Preview (When Video Mode is active) */}
                              {isItemVideo && (
                                <div style={{
                                  background: isDark ? '#1a1820' : '#f6f0fa',
                                  border: `1px solid ${isDark ? '#3d2b4c' : '#e1bee7'}`,
                                  padding: '12px',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '10px'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: '#9C27B0' }}>
                                      <Film size={14} /> Video Animation Settings
                                    </div>
                                    {uploadingIdx === originalIdx && (
                                      <span style={{ fontSize: '10px', color: '#FF9800', fontWeight: 'bold' }}>
                                        Processing video...
                                      </span>
                                    )}
                                    {uploadSuccessMsg[originalIdx] && (
                                      <span style={{ fontSize: '10px', color: '#4CAF50', fontWeight: 'bold' }}>
                                        {uploadSuccessMsg[originalIdx]}
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    {/* Video Live Preview */}
                                    <VideoThumbnail
                                      url={item.videoUrl || (item.label === 'cv' ? '/cv-video.mp4' : '')}
                                      isDark={isDark}
                                    />

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <input
                                          type="text"
                                          placeholder="Video URL or path (e.g. /cv-video.mp4)"
                                          value={item.videoUrl || (item.label === 'cv' ? '/cv-video.mp4' : '')}
                                          onChange={(e) => handleItemChange(originalIdx, 'videoUrl', e.target.value)}
                                          style={{
                                            flex: 1,
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
                                          ref={(el) => (fileInputRefs.current[originalIdx] = el)}
                                          style={{ display: 'none' }}
                                          onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                              handleVideoUpload(originalIdx, e.target.files[0]);
                                            }
                                          }}
                                        />

                                        <button
                                          type="button"
                                          onClick={() => fileInputRefs.current[originalIdx]?.click()}
                                          disabled={uploadingIdx === originalIdx}
                                          style={{
                                            padding: '6px 12px',
                                            background: '#9C27B0',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          <Upload size={12} /> Upload Video
                                        </button>
                                      </div>
                                      <span style={{ fontSize: '10px', color: subText }}>
                                        Supports MP4/WebM videos. Videos are cached locally in IndexedDB and synchronized with server storage.
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
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
                    Export your full link array configuration or paste a JSON array to overwrite and batch-update links.
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
                      borderRadius: '6px',
                      fontFamily: 'inherit',
                      fontSize: '11px',
                      lineHeight: '1.4'
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
                        borderRadius: '5px',
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
                        background: isDark ? '#2e2e2e' : '#e0e0e0',
                        color: text,
                        border: 'none',
                        borderRadius: '5px',
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

              {activeTab === 'security' && (
                <div style={{ maxWidth: '520px', margin: '8px auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Card 1: Two-Factor Authentication */}
                  <div style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: twoFactorEnabled ? (isDark ? '#1b3320' : '#e8f5e9') : (isDark ? '#262626' : '#f0f0f0'),
                          color: twoFactorEnabled ? '#4CAF50' : text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {twoFactorEnabled ? <ShieldCheck size={18} /> : <Shield size={18} />}
                        </div>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>
                            Two-Factor Authentication (TOTP)
                          </span>
                          <span style={{ fontSize: '11px', color: subText }}>
                            RFC 6238 Time-based One-Time Passwords
                          </span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: twoFactorEnabled ? (isDark ? '#14331e' : '#e8f5e9') : (isDark ? '#332714' : '#fff8e1'),
                        color: twoFactorEnabled ? '#4CAF50' : '#ff9800',
                        border: `1px solid ${twoFactorEnabled ? (isDark ? '#1e4d2b' : '#c8e6c9') : (isDark ? '#4d3a1e' : '#ffe082')}`
                      }}>
                        {twoFactorEnabled ? <Check size={11} /> : null}
                        {twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: subText, margin: 0, lineHeight: '1.5' }}>
                      Protect your admin portal from unauthorized access. When active, every login requires a 6-digit code generated by your authenticator app (Google Authenticator, Apple Keychain, 1Password, or Authy).
                    </p>

                    {twoFactorMsg.text && (
                      <div style={{
                        fontSize: '11px',
                        color: twoFactorMsg.isError ? '#f44336' : '#4CAF50',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        background: twoFactorMsg.isError ? (isDark ? '#331616' : '#ffebee') : (isDark ? '#16331a' : '#e8f5e9'),
                        border: `1px solid ${twoFactorMsg.isError ? (isDark ? '#4d1e1e' : '#ffcdd2') : (isDark ? '#1e4d26' : '#c8e6c9')}`
                      }}>
                        {twoFactorMsg.text}
                      </div>
                    )}

                    {/* State A: 2FA Disabled & Setup Not Started */}
                    {!twoFactorEnabled && !twoFactorSetupData && (
                      <div>
                        <button
                          type="button"
                          onClick={handleStart2FASetup}
                          style={{
                            padding: '9px 16px',
                            background: isDark ? '#ffffff' : '#000000',
                            color: isDark ? '#000000' : '#ffffff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <QrCode size={14} /> Setup Two-Factor Authentication
                        </button>
                      </div>
                    )}

                    {/* State B: 2FA Setup Flow (QR Code & Secret) */}
                    {twoFactorSetupData && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        padding: '14px',
                        borderRadius: '6px',
                        background: isDark ? '#141414' : '#f9f9f9',
                        border: `1px solid ${border}`
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: '600' }}>
                          Step 1: Scan QR Code with Authenticator App
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            padding: '10px',
                            background: '#ffffff',
                            borderRadius: '8px',
                            display: 'inline-block',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <img
                              src={twoFactorSetupData.qrDataUrl}
                              alt="2FA QR Code"
                              style={{ width: '160px', height: '160px', display: 'block' }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', color: subText, textAlign: 'center' }}>
                            Open Google Authenticator, 1Password, or your camera to scan
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>
                          Step 2: Or Enter Key Manually
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: inputBg,
                          border: `1px solid ${inputBorder}`,
                          borderRadius: '5px',
                          gap: '8px'
                        }}>
                          <code style={{ fontSize: '11px', letterSpacing: '1px', wordBreak: 'break-all' }}>
                            {twoFactorSetupData.secret}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopySecret(twoFactorSetupData.secret)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedSecret ? '#4CAF50' : text,
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontFamily: 'inherit',
                              flexShrink: 0
                            }}
                            title="Copy secret key"
                          >
                            {copiedSecret ? <Check size={13} /> : <Copy size={13} />}
                            {copiedSecret ? 'Copied' : 'Copy'}
                          </button>
                        </div>

                        <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>
                          Step 3: Verify & Activate
                        </div>

                        <form onSubmit={handleConfirm2FA} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="Enter 6-digit code (e.g. 123456)"
                            value={verifyOtpInput}
                            onChange={(e) => setVerifyOtpInput(e.target.value.replace(/\D/g, ''))}
                            autoFocus
                            style={{
                              padding: '10px 12px',
                              borderRadius: '5px',
                              border: `1px solid ${inputBorder}`,
                              background: inputBg,
                              color: text,
                              fontSize: '14px',
                              fontFamily: 'inherit',
                              textAlign: 'center',
                              letterSpacing: '4px',
                              outline: 'none'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setTwoFactorSetupData(null);
                                setVerifyOtpInput('');
                                setTwoFactorMsg({ text: '', isError: false });
                              }}
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
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={verifyOtpInput.length !== 6}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '5px',
                                border: 'none',
                                background: verifyOtpInput.length === 6 ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#333' : '#ddd'),
                                color: verifyOtpInput.length === 6 ? (isDark ? '#000000' : '#ffffff') : subText,
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: verifyOtpInput.length === 6 ? 'pointer' : 'not-allowed',
                                fontFamily: 'inherit'
                              }}
                            >
                              Activate 2FA
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* State C: 2FA Active */}
                    {twoFactorEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {!showDisable2FAConfirm ? (
                          <div>
                            <button
                              type="button"
                              onClick={() => setShowDisable2FAConfirm(true)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '5px',
                                border: `1px solid ${border}`,
                                background: 'transparent',
                                color: '#f44336',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                              }}
                            >
                              Disable 2FA
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleDisable2FA} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            padding: '12px',
                            background: isDark ? '#141414' : '#f9f9f9',
                            borderRadius: '6px',
                            border: `1px solid ${border}`
                          }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#f44336' }}>
                              Confirm 2FA Deactivation
                            </span>
                            <span style={{ fontSize: '11px', color: subText }}>
                              Enter your current admin password to deactivate Two-Factor Authentication.
                            </span>
                            <input
                              type="password"
                              placeholder="Current Password"
                              value={disable2FAPassword}
                              onChange={(e) => setDisable2FAPassword(e.target.value)}
                              required
                              autoFocus
                              style={{
                                padding: '8px 12px',
                                borderRadius: '5px',
                                border: `1px solid ${inputBorder}`,
                                background: inputBg,
                                color: text,
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                outline: 'none'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowDisable2FAConfirm(false);
                                  setDisable2FAPassword('');
                                }}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  border: `1px solid ${border}`,
                                  background: 'transparent',
                                  color: text,
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  fontFamily: 'inherit'
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: '#d32f2f',
                                  color: '#ffffff',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  fontFamily: 'inherit'
                                }}
                              >
                                Confirm Disable
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card 2: Update Password */}
                  <div style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: isDark ? '#262626' : '#f0f0f0',
                        color: text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Key size={18} />
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>
                          Update Admin Password
                        </span>
                        <span style={{ fontSize: '11px', color: subText }}>
                          Protected with cryptographic salted scrypt hashing
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                            borderRadius: '5px',
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
                          NEW PASSWORD (MIN. 4 CHARACTERS)
                        </label>
                        <input
                          type="password"
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '5px',
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
                          padding: '8px 10px',
                          borderRadius: '4px',
                          background: pwMessage.isError ? (isDark ? '#331616' : '#ffebee') : (isDark ? '#16331a' : '#e8f5e9'),
                          border: `1px solid ${pwMessage.isError ? (isDark ? '#4d1e1e' : '#ffcdd2') : (isDark ? '#1e4d26' : '#c8e6c9')}`
                        }}>
                          {pwMessage.text}
                        </div>
                      )}
                      <div>
                        <button
                          type="submit"
                          style={{
                            padding: '9px 16px',
                            background: isDark ? '#ffffff' : '#000000',
                            color: isDark ? '#000000' : '#ffffff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            marginTop: '4px'
                          }}
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
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
          </>
        )}
      </div>
    </div>
  );
}
