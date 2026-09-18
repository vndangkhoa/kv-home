import React, { useState, useRef } from 'react';
import {
  Check,
  Upload,
  Image as ImageIcon,
  Terminal
} from 'lucide-react';

export default function BrandingTab({
  settings,
  onSaveSettings,
  onLivePreviewSettings,
  token,
  isDark,
  tokens,
  setActiveTab,
  adminBannerText,
  adminBannerFont,
  isSplitView = false,
}) {
  const { border, text, subText, inputBg, inputBorder } = tokens;

  const [customTitle, setCustomTitle] = useState(null);
  const [customTagline, setCustomTagline] = useState(null);
  const [customLogoUrl, setCustomLogoUrl] = useState(null);
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandSavedMsg, setBrandSavedMsg] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadMsg, setLogoUploadMsg] = useState('');
  const brandImageInputRef = useRef(null);

  const brandTitle = customTitle !== null ? customTitle : (settings?.title || '');
  const brandTagline = customTagline !== null ? customTagline : (settings?.tagline || '');
  const brandLogoUrl = customLogoUrl !== null ? customLogoUrl : (settings?.logoUrl || '');

  const handleBrandTitleChange = (val) => {
    setCustomTitle(val);
    if (onLivePreviewSettings) {
      onLivePreviewSettings({ title: val, tagline: brandTagline, logoUrl: brandLogoUrl });
    }
  };

  const handleBrandTaglineChange = (val) => {
    setCustomTagline(val);
    if (onLivePreviewSettings) {
      onLivePreviewSettings({ title: brandTitle, tagline: val, logoUrl: brandLogoUrl });
    }
  };

  const handleBrandLogoChange = (val) => {
    setCustomLogoUrl(val);
    if (onLivePreviewSettings) {
      onLivePreviewSettings({ title: brandTitle, tagline: brandTagline, logoUrl: val });
    }
  };

  const handleRemoveLogo = () => {
    setCustomLogoUrl('');
    setLogoUploadMsg('');
    if (onLivePreviewSettings) {
      onLivePreviewSettings({ title: brandTitle, tagline: brandTagline, logoUrl: '' });
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    setLogoUploadMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        let resolvedUrl = base64Data;

        // Try server upload if authenticated
        if (token) {
          try {
            const res = await fetch('/api/upload-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ filename: file.name, base64Data })
            });
            if (res.ok) {
              const data = await res.json();
              if (data.url) {
                resolvedUrl = data.url;
              }
            }
          } catch (uploadErr) {
            console.warn('Server upload failed, fallback to local Data URL:', uploadErr);
          }
        }

        setCustomLogoUrl(resolvedUrl);
        setLogoUploadMsg('Logo injected! (Active as Logo, Favicon & Icon)');
        if (onLivePreviewSettings) {
          onLivePreviewSettings({ logoUrl: resolvedUrl, title: brandTitle, tagline: brandTagline });
        }
        setLogoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setLogoUploadMsg('Upload failed: ' + err.message);
      setLogoUploading(false);
    }
  };

  const handleSaveBranding = async (e) => {
    if (e) e.preventDefault();
    setBrandSaving(true);
    setBrandSavedMsg('');
    if (onSaveSettings) {
      await onSaveSettings({
        title: brandTitle,
        tagline: brandTagline,
        logoUrl: brandLogoUrl
      });
    }
    setBrandSaving(false);
    setBrandSavedMsg('Branding & favicon saved successfully!');
    setTimeout(() => setBrandSavedMsg(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
      <div>
        <span style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Branding, Title & Unified Logo
        </span>
        <span style={{ fontSize: '11px', color: subText }}>
          Customize your site identity. Changes appear live immediately across the header, footer, and browser tab.
        </span>
      </div>

      {brandSavedMsg && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(76, 175, 80, 0.15)',
          border: '1px solid #4CAF50',
          borderRadius: '6px',
          color: '#4CAF50',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={15} />
          <span>{brandSavedMsg}</span>
        </div>
      )}

      {/* Title & Tagline Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '5px', color: text }}>
            Site Title / Brand Name
          </label>
          <input
            type="text"
            value={brandTitle}
            onChange={(e) => handleBrandTitleChange(e.target.value)}
            placeholder="e.g. Khoa.vo or MyDashboard"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${inputBorder}`,
              background: inputBg,
              color: text,
              fontSize: '12px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '5px', color: text }}>
            Tagline / Subtitle
          </label>
          <input
            type="text"
            value={brandTagline}
            onChange={(e) => handleBrandTaglineChange(e.target.value)}
            placeholder="e.g. where design meets intelligence"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${inputBorder}`,
              background: inputBg,
              color: text,
              fontSize: '12px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Unified 1-Photo Logo & Favicon Section */}
      <div style={{
        padding: '16px',
        borderRadius: '8px',
        background: isDark ? '#1a1a1a' : '#f5f5f5',
        border: `1px solid ${border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '600', display: 'block' }}>
              Unified Brand Photo (Logo & Favicon)
            </span>
            <span style={{ fontSize: '11px', color: subText }}>
              1 single image automatically sets your Top Header Logo, Browser Favicon, and Mobile Web App Icon.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: isSplitView ? 'flex-start' : 'center', gap: '16px', flexDirection: isSplitView ? 'column' : 'row', flexWrap: 'wrap' }}>
          {/* Photo Preview */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '8px',
            background: isDark ? '#111' : '#fff',
            border: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {brandLogoUrl ? (
              <img
                src={brandLogoUrl}
                alt="Logo preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ImageIcon size={28} color={subText} />
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="file"
                ref={brandImageInputRef}
                onChange={handleLogoUpload}
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => brandImageInputRef.current?.click()}
                disabled={logoUploading}
                style={{
                  padding: '7px 12px',
                  borderRadius: '5px',
                  border: `1px solid ${border}`,
                  background: isDark ? '#262626' : '#fff',
                  color: text,
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Upload size={13} />
                <span>{logoUploading ? 'Uploading...' : 'Upload Photo'}</span>
              </button>

              {brandLogoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '5px',
                    border: 'none',
                    background: 'transparent',
                    color: '#e53935',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Remove Photo
                </button>
              )}
            </div>

            {/* Or URL input */}
            <input
              type="text"
              value={brandLogoUrl}
              onChange={(e) => handleBrandLogoChange(e.target.value)}
              placeholder="Or paste an image URL (/favicon.png or https://...)"
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '4px',
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: text,
                fontSize: '11px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />

            {logoUploadMsg && (
              <span style={{ fontSize: '10px', color: '#4CAF50' }}>{logoUploadMsg}</span>
            )}
          </div>
        </div>

        {/* Mock Header Live Preview Banner */}
        <div style={{
          marginTop: '8px',
          padding: '10px 14px',
          borderRadius: '6px',
          background: isDark ? '#111' : '#fff',
          border: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '10px', color: subText, textTransform: 'uppercase', marginRight: '6px' }}>
            Header Preview:
          </span>
          {brandLogoUrl && (
            <img
              src={brandLogoUrl}
              alt="preview"
              style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }}
            />
          )}
          <span style={{ fontSize: '13px', fontWeight: '500', color: text }}>
            {brandTitle || 'Khoa.vo'}
          </span>
          {brandTagline && (
            <span style={{ fontSize: '10px', color: subText }}>
              {brandTagline}
            </span>
          )}
        </div>
      </div>

      {/* Quick Shortcut to Terminal Banner Settings */}
      <div style={{
        padding: '14px 16px',
        borderRadius: '8px',
        background: isDark ? '#1e1e1e' : '#f0f9ff',
        border: `1px solid ${isDark ? '#333' : '#bae6fd'}`,
        display: 'flex',
        alignItems: isSplitView ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexDirection: isSplitView ? 'column' : 'row',
      }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '600', display: 'block', color: text }}>
            Terminal Layout ASCII Banner
          </span>
          <span style={{ fontSize: '11px', color: subText }}>
            Current banner: "{adminBannerText || 'KV HOME'}" ({adminBannerFont || 'ansi_shadow'})
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('terminal')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#00BCD4',
            color: '#000',
            border: 'none',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            width: isSplitView ? '100%' : 'auto',
          }}
        >
          <Terminal size={13} />
          <span>Customize Banner & Fonts</span>
        </button>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          type="button"
          onClick={handleSaveBranding}
          disabled={brandSaving}
          style={{
            padding: '9px 18px',
            borderRadius: '6px',
            border: 'none',
            background: '#00BCD4',
            color: '#000',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Check size={14} />
          <span>{brandSaving ? 'Saving...' : 'Save Branding'}</span>
        </button>
      </div>
    </div>
  );
}
