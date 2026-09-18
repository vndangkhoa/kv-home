import React, { useState } from 'react';
import {
  Check,
  Type,
  Terminal
} from 'lucide-react';
import { renderAsciiBanner, ASCII_FONTS } from '../../utils/asciiBanner';

export default function TerminalTab({
  settings,
  onSaveSettings,
  onLivePreviewSettings,
  isDark,
  tokens,
  isSplitView = false,
}) {
  const { border, text, subText, cardBg, cardBorder, inputBg, inputBorder } = tokens;
  const initialTerminal = settings?.terminal || {};

  const [adminBannerText, setAdminBannerText] = useState(() => initialTerminal.bannerText || 'KV HOME');
  const [adminBannerFont, setAdminBannerFont] = useState(() => initialTerminal.bannerFont || 'ansi_shadow');
  const [adminBannerCustom, setAdminBannerCustom] = useState(() => initialTerminal.bannerCustom || '');
  const [adminBannerMode, setAdminBannerMode] = useState(() => (initialTerminal.bannerCustom && initialTerminal.bannerCustom.trim() ? 'custom' : 'text'));
  const [adminBannerGlow, setAdminBannerGlow] = useState(() => initialTerminal.bannerGlow !== false);
  const [adminTermTheme, setAdminTermTheme] = useState(() => initialTerminal.theme || 'white');
  const adminTermWidth = settings?.terminal?.width || 'boxed';
  const adminTermDensity = settings?.terminal?.density || 'normal';
  const adminTermFontSize = settings?.terminal?.fontSize || '12px';
  const [adminTermShowBanner, setAdminTermShowBanner] = useState(() => initialTerminal.showBanner !== false);
  const adminTermShowExec = settings?.terminal?.showExec !== false;
  const [adminTermCrt, setAdminTermCrt] = useState(() => !!initialTerminal.crtEffect);
  const [terminalSaving, setTerminalSaving] = useState(false);
  const [terminalSavedMsg, setTerminalSavedMsg] = useState('');

  const triggerTerminalLivePreview = (overrides = {}) => {
    if (!onLivePreviewSettings) return;
    onLivePreviewSettings({
      terminal: {
        ...(settings?.terminal || {}),
        theme: overrides.theme ?? adminTermTheme,
        width: overrides.width ?? adminTermWidth,
        density: overrides.density ?? adminTermDensity,
        fontSize: overrides.fontSize ?? adminTermFontSize,
        showBanner: overrides.showBanner ?? adminTermShowBanner,
        showExec: overrides.showExec ?? adminTermShowExec,
        crtEffect: overrides.crtEffect ?? adminTermCrt,
        bannerText: overrides.bannerText ?? adminBannerText,
        bannerFont: overrides.bannerFont ?? adminBannerFont,
        bannerCustom: overrides.bannerCustom ?? (adminBannerMode === 'custom' ? adminBannerCustom : ''),
        bannerGlow: overrides.bannerGlow ?? adminBannerGlow,
      }
    });
  };

  const handleSaveTerminal = async (e) => {
    if (e) e.preventDefault();
    setTerminalSaving(true);
    setTerminalSavedMsg('');

    const newTerminalConfig = {
      ...(settings?.terminal || {}),
      theme: adminTermTheme,
      width: adminTermWidth,
      density: adminTermDensity,
      fontSize: adminTermFontSize,
      showBanner: adminTermShowBanner,
      showExec: adminTermShowExec,
      crtEffect: adminTermCrt,
      bannerText: adminBannerText.trim() || 'KV HOME',
      bannerFont: adminBannerFont,
      bannerCustom: adminBannerMode === 'custom' ? adminBannerCustom : '',
      bannerGlow: adminBannerGlow,
    };

    if (onSaveSettings) {
      await onSaveSettings({
        terminal: newTerminalConfig,
      });
    }

    setTerminalSaving(false);
    setTerminalSavedMsg('Terminal banner and typography saved successfully!');
    setTimeout(() => setTerminalSavedMsg(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px' }}>
      {/* Header & Subtitle */}
      <div style={{ display: 'flex', flexDirection: isSplitView ? 'column' : 'row', alignItems: isSplitView ? 'flex-start' : 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            Terminal Layout & ASCII Banner
          </span>
          <span style={{ fontSize: '11px', color: subText }}>
            Customize your terminal's identity, live ASCII banner text ("KV HOME"), and high-fidelity font typography.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSaveTerminal}
          disabled={terminalSaving}
          style={{
            padding: '8px 16px',
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
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(0, 188, 212, 0.25)',
            width: isSplitView ? '100%' : 'auto',
          }}
        >
          <Check size={14} />
          <span>{terminalSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Save Status Banner */}
      {terminalSavedMsg && (
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
          <span>{terminalSavedMsg}</span>
        </div>
      )}

      {/* Live Terminal Preview Box */}
      <div style={{
        borderRadius: '8px',
        border: `1px solid ${border}`,
        background: isDark ? '#06090f' : '#f8fafc',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}>
        {/* Mock Terminal Title Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 12px',
          background: isDark ? '#0b111a' : '#e2e8f0',
          borderBottom: `1px solid ${border}`,
          fontSize: '11px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#27c93f' }} />
            <span style={{ marginLeft: '6px', fontFamily: 'monospace', fontWeight: '600', color: isDark ? '#00f0ff' : '#0284c7' }}>
              preview@kv-os:~ (live-banner)
            </span>
          </div>
          <span style={{
            fontSize: '9.5px',
            padding: '1px 6px',
            borderRadius: '3px',
            background: 'rgba(0, 188, 212, 0.15)',
            color: '#00BCD4',
            fontWeight: '700',
            fontFamily: 'monospace',
          }}>
            FONT: {adminBannerFont.toUpperCase()}
          </span>
        </div>

        {/* Banner Render Preview */}
        <div style={{
          padding: '16px 20px',
          background: adminTermTheme === 'white' ? '#ffffff' : (adminTermTheme === 'matrix' ? '#050a05' : (adminTermTheme === 'amber' ? '#0c0903' : (adminTermTheme === 'dracula' ? '#282a36' : (adminTermTheme === 'solarizedDark' ? '#002b36' : '#0a0e14')))),
          overflowX: 'auto',
        }}>
          <pre style={{
            margin: 0,
            fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
            fontSize: isSplitView ? '8.5px' : '10.5px',
            lineHeight: '1.2',
            fontWeight: 'bold',
            color: adminTermTheme === 'white' ? '#0284c7' : (adminTermTheme === 'matrix' ? '#00ff66' : (adminTermTheme === 'amber' ? '#ffb000' : (adminTermTheme === 'dracula' ? '#8be9fd' : (adminTermTheme === 'solarizedDark' ? '#2aa198' : '#00f0ff')))),
            textShadow: adminBannerGlow ? (adminTermTheme === 'matrix' ? '0 0 8px rgba(0,255,102,0.5)' : (adminTermTheme === 'amber' ? '0 0 8px rgba(255,176,0,0.5)' : '0 0 8px rgba(0,240,255,0.5)')) : 'none',
            letterSpacing: '0px',
          }}>
            {renderAsciiBanner(
              adminBannerMode === 'custom' ? adminBannerCustom : adminBannerText,
              adminBannerFont,
              adminBannerMode === 'custom' ? adminBannerCustom : ''
            )}
          </pre>
          <div style={{ marginTop: '10px', fontSize: '11px', fontFamily: 'monospace', color: isDark ? '#58a6ff' : '#64748b' }}>
            Initializing KV-OS Kernel v4.19-edge (x86_64)... Ready.
          </div>
        </div>
      </div>

      {/* Mode Selector: Dynamic ASCII vs Raw Custom Art */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px',
        borderRadius: '8px',
        background: isDark ? '#1a1a1a' : '#f0f0f0',
        width: 'fit-content',
        border: `1px solid ${border}`,
      }}>
        <button
          type="button"
          onClick={() => {
            setAdminBannerMode('text');
            triggerTerminalLivePreview({ bannerCustom: '' });
          }}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            background: adminBannerMode === 'text' ? '#00BCD4' : 'transparent',
            color: adminBannerMode === 'text' ? '#000' : text,
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Type size={13} />
          <span>Dynamic ASCII Generator</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAdminBannerMode('custom');
            triggerTerminalLivePreview({ bannerCustom: adminBannerCustom });
          }}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            background: adminBannerMode === 'custom' ? '#00BCD4' : 'transparent',
            color: adminBannerMode === 'custom' ? '#000' : text,
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Terminal size={13} />
          <span>Custom Raw ASCII Art</span>
        </button>
      </div>

      {/* Dynamic Generator Controls */}
      {adminBannerMode === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Banner Text Input */}
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            background: cardBg,
            border: `1px solid ${cardBorder}`,
          }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: text }}>
              Banner Text / Homelab Title
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={adminBannerText}
                onChange={(e) => {
                  const val = e.target.value;
                  setAdminBannerText(val);
                  triggerTerminalLivePreview({ bannerText: val, bannerCustom: '' });
                }}
                placeholder="e.g. KV HOME, HOMELAB, MY SERVER"
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: text,
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setAdminBannerText('KV HOME');
                  triggerTerminalLivePreview({ bannerText: 'KV HOME', bannerCustom: '' });
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${border}`,
                  background: isDark ? '#262626' : '#eee',
                  color: text,
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                title="Reset text to KV HOME"
              >
                Reset
              </button>
            </div>
            <span style={{ fontSize: '11px', color: subText, marginTop: '6px', display: 'block' }}>
              Supports any alphanumeric characters, symbols, and spaces. Generates instantaneously.
            </span>
          </div>

          {/* Font Style Picker Grid */}
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            background: cardBg,
            border: `1px solid ${cardBorder}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', display: 'block', color: text }}>
                  Choose Font Styling
                </span>
                <span style={{ fontSize: '11px', color: subText }}>
                  Select from 7 professionally tuned ASCII font typography styles:
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {ASCII_FONTS.map((font) => {
                const isSelected = adminBannerFont === font.id;
                const miniPreview = renderAsciiBanner('KV', font.id);

                return (
                  <div
                    key={font.id}
                    onClick={() => {
                      setAdminBannerFont(font.id);
                      triggerTerminalLivePreview({ bannerFont: font.id, bannerCustom: '' });
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1.5px solid ${isSelected ? '#00BCD4' : cardBorder}`,
                      background: isSelected ? (isDark ? 'rgba(0, 188, 212, 0.08)' : '#e0f7fa') : (isDark ? '#141414' : '#fff'),
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: isSelected ? '#00BCD4' : text }}>
                        {font.name}
                      </span>
                      {font.tag && (
                        <span style={{
                          fontSize: '9px',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          fontWeight: '600',
                          background: isSelected ? '#00BCD4' : (isDark ? '#262626' : '#e0e0e0'),
                          color: isSelected ? '#000' : subText,
                        }}>
                          {font.tag}
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '10.5px', color: subText, lineHeight: '1.3' }}>
                      {font.description}
                    </span>

                    {/* Mini ASCII Sample Box */}
                    <pre style={{
                      margin: 0,
                      padding: '6px 8px',
                      background: isDark ? '#000' : '#f1f5f9',
                      borderRadius: '4px',
                      fontSize: '8.5px',
                      lineHeight: '1.15',
                      fontFamily: 'monospace',
                      color: isSelected ? (isDark ? '#00f0ff' : '#0284c7') : subText,
                      overflow: 'hidden',
                      userSelect: 'none',
                    }}>
                      {miniPreview}
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Custom Raw ASCII Textarea */}
      {adminBannerMode === 'custom' && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: text }}>
            Paste Raw Multi-line ASCII Art
          </label>
          <textarea
            rows={8}
            value={adminBannerCustom}
            onChange={(e) => {
              const val = e.target.value;
              setAdminBannerCustom(val);
              triggerTerminalLivePreview({ bannerCustom: val });
            }}
            placeholder="Paste your ASCII art logo or banner here..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${inputBorder}`,
              background: inputBg,
              color: text,
              fontSize: '11px',
              fontFamily: 'monospace',
              lineHeight: '1.25',
              outline: 'none',
              whiteSpace: 'pre',
              overflowX: 'auto',
            }}
          />
          <span style={{ fontSize: '11px', color: subText }}>
            Tip: You can paste custom fastfetch/neofetch logos, ASCII avatars, or custom font output here.
          </span>
        </div>
      )}

      {/* General Terminal Appearance Settings */}
      <div style={{
        padding: '16px',
        borderRadius: '8px',
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: text }}>
          Terminal Options & Styling
        </span>

        {/* Glow and CRT Toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              const next = !adminBannerGlow;
              setAdminBannerGlow(next);
              triggerTerminalLivePreview({ bannerGlow: next });
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: `1px solid ${adminBannerGlow ? '#00BCD4' : inputBorder}`,
              background: adminBannerGlow ? (isDark ? 'rgba(0, 188, 212, 0.12)' : '#e0f7fa') : 'transparent',
              color: adminBannerGlow ? '#00BCD4' : text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: '600',
              fontFamily: 'inherit',
            }}
          >
            <span>Neon Glow Effect</span>
            <span style={{
              padding: '2px 6px',
              borderRadius: '3px',
              background: adminBannerGlow ? '#00BCD4' : (isDark ? '#333' : '#ddd'),
              color: adminBannerGlow ? '#000' : subText,
              fontSize: '10px',
            }}>
              {adminBannerGlow ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !adminTermShowBanner;
              setAdminTermShowBanner(next);
              triggerTerminalLivePreview({ showBanner: next });
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: `1px solid ${adminTermShowBanner ? '#00BCD4' : inputBorder}`,
              background: adminTermShowBanner ? (isDark ? 'rgba(0, 188, 212, 0.12)' : '#e0f7fa') : 'transparent',
              color: adminTermShowBanner ? '#00BCD4' : text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: '600',
              fontFamily: 'inherit',
            }}
          >
            <span>Display ASCII Banner</span>
            <span style={{
              padding: '2px 6px',
              borderRadius: '3px',
              background: adminTermShowBanner ? '#00BCD4' : (isDark ? '#333' : '#ddd'),
              color: adminTermShowBanner ? '#000' : subText,
              fontSize: '10px',
            }}>
              {adminTermShowBanner ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !adminTermCrt;
              setAdminTermCrt(next);
              triggerTerminalLivePreview({ crtEffect: next });
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: `1px solid ${adminTermCrt ? '#00BCD4' : inputBorder}`,
              background: adminTermCrt ? (isDark ? 'rgba(0, 188, 212, 0.12)' : '#e0f7fa') : 'transparent',
              color: adminTermCrt ? '#00BCD4' : text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: '600',
              fontFamily: 'inherit',
            }}
          >
            <span>Retro CRT Scanlines</span>
            <span style={{
              padding: '2px 6px',
              borderRadius: '3px',
              background: adminTermCrt ? '#00BCD4' : (isDark ? '#333' : '#ddd'),
              color: adminTermCrt ? '#000' : subText,
              fontSize: '10px',
            }}>
              {adminTermCrt ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Default Terminal Theme */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', color: text }}>
            Default Terminal Color Scheme
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { id: 'white', label: 'Clean White' },
              { id: 'cyberpunk', label: 'Cyberpunk Neon' },
              { id: 'matrix', label: 'Matrix CRT Green' },
              { id: 'amber', label: 'Amber Vintage' },
              { id: 'dracula', label: 'Dracula Purple' },
              { id: 'solarizedDark', label: 'Solarized Dark' },
            ].map((t) => {
              const isSelected = adminTermTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setAdminTermTheme(t.id);
                    triggerTerminalLivePreview({ theme: t.id });
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '5px',
                    border: `1px solid ${isSelected ? '#00BCD4' : inputBorder}`,
                    background: isSelected ? '#00BCD4' : (isDark ? '#262626' : '#fff'),
                    color: isSelected ? '#000' : text,
                    fontSize: '11px',
                    fontWeight: isSelected ? '600' : '400',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          type="button"
          onClick={handleSaveTerminal}
          disabled={terminalSaving}
          style={{
            padding: '10px 20px',
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
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0, 188, 212, 0.3)',
          }}
        >
          <Check size={14} />
          <span>{terminalSaving ? 'Saving Settings...' : 'Save Terminal & Banner Settings'}</span>
        </button>
      </div>
    </div>
  );
}
