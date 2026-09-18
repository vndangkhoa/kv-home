import React from 'react';
import {
  LayoutGrid,
  Palette,
  Check,
  Boxes,
  AppWindow,
  Terminal,
  Feather,
  Zap,
  Activity
} from 'lucide-react';
import { LAYOUTS } from '../../data/layouts';
import { THEMES } from '../../data/themes';

export default function ThemesTab({
  activeLayout,
  onSelectLayout,
  currentTheme,
  onSelectTheme,
  settings,
  onSaveSettings,
  onLivePreviewSettings,
  themeSubTab,
  setThemeSubTab,
  isDark,
  tokens,
  isSplitView = false,
}) {
  const { border, text, subText, badgeBg } = tokens;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Sub-navigation Switcher: Layouts vs Color Palettes */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px',
        borderRadius: '10px',
        background: isDark ? '#141414' : '#f0f0f0',
        border: `1px solid ${border}`,
        width: isSplitView ? '100%' : 'fit-content',
      }}>
        <button
          type="button"
          onClick={() => setThemeSubTab('layouts')}
          style={{
            flex: isSplitView ? 1 : 'initial',
            justifyContent: 'center',
            padding: '7px 14px',
            borderRadius: '7px',
            fontSize: '12px',
            fontWeight: themeSubTab === 'layouts' ? '700' : '500',
            background: themeSubTab === 'layouts' ? (isDark ? '#222' : '#fff') : 'transparent',
            color: themeSubTab === 'layouts' ? '#00BCD4' : subText,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: themeSubTab === 'layouts' ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <LayoutGrid size={14} />
          <span>Layout Engines ({Object.keys(LAYOUTS).length})</span>
        </button>
        <button
          type="button"
          onClick={() => setThemeSubTab('palettes')}
          style={{
            flex: isSplitView ? 1 : 'initial',
            justifyContent: 'center',
            padding: '7px 14px',
            borderRadius: '7px',
            fontSize: '12px',
            fontWeight: themeSubTab === 'palettes' ? '700' : '500',
            background: themeSubTab === 'palettes' ? (isDark ? '#222' : '#fff') : 'transparent',
            color: themeSubTab === 'palettes' ? '#00BCD4' : subText,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: themeSubTab === 'palettes' ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Palette size={14} />
          <span>Color Palettes ({Object.keys(THEMES).length})</span>
        </button>
      </div>

      {themeSubTab === 'layouts' && (
        <>
          {/* Dashboard Layout Engine Switcher */}
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: isDark ? '#161616' : '#f5f5f5',
            border: `1px solid ${border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', color: text }}>
                  <LayoutGrid size={15} color="#00BCD4" /> Dashboard Layout Architecture
                </span>
                <span style={{ fontSize: '11px', color: subText }}>
                  Switch between completely distinct UI paradigms in real-time. Changes apply instantly! Use <kbd style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '9.5px', padding: '1px 4px', borderRadius: '3px', background: isDark ? '#262626' : '#e5e5e5' }}>Alt+1</kbd> .. <kbd style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '9.5px', padding: '1px 4px', borderRadius: '3px', background: isDark ? '#262626' : '#e5e5e5' }}>Alt+6</kbd> anywhere.
                </span>
              </div>
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#00BCD422',
                color: '#00BCD4',
                fontWeight: '600'
              }}>
                {Object.keys(LAYOUTS).length} Engines
              </span>
            </div>

            {/* Visual Grid: 1-Column in Split View to avoid clipping, 2-Column in Modal */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isSplitView ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              gap: '10px',
            }}>
              {Object.values(LAYOUTS).map((layout) => {
                const isCurrentLayout = (activeLayout || 'tetris') === layout.id;
                const HOTKEY_MAP = {
                  dock: 'Alt+1',
                  bento: 'Alt+2',
                  terminal: 'Alt+3',
                  tetris: 'Alt+4',
                  nouveau: 'Alt+5',
                  kinetic: 'Alt+6',
                };
                const hotkey = HOTKEY_MAP[layout.id];
                let LayoutIcon = Boxes;
                if (layout.id === 'bento') LayoutIcon = LayoutGrid;
                else if (layout.id === 'dock') LayoutIcon = Activity;
                else if (layout.id === 'terminal') LayoutIcon = Terminal;
                else if (layout.id === 'nouveau') LayoutIcon = Feather;
                else if (layout.id === 'kinetic') LayoutIcon = Zap;

                return (
                  <div
                    key={layout.id}
                    onClick={() => {
                      if (onSelectLayout) onSelectLayout(layout.id);
                      if (onLivePreviewSettings) onLivePreviewSettings({ activeLayout: layout.id });
                    }}
                    style={{
                      padding: isSplitView ? '10px 12px' : '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: `2px solid ${isCurrentLayout ? '#00BCD4' : border}`,
                      background: isCurrentLayout ? (isDark ? 'rgba(0, 188, 212, 0.14)' : '#e0f7fa') : (isDark ? '#202020' : '#ffffff'),
                      boxShadow: isCurrentLayout ? '0 0 16px rgba(0, 188, 212, 0.28)' : 'none',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: isSplitView ? 'row' : 'column',
                      alignItems: isSplitView ? 'center' : 'stretch',
                      gap: isSplitView ? '12px' : '8px',
                      position: 'relative',
                    }}
                  >
                    {/* Mini Wireframe Schematic */}
                    <div style={{
                      width: isSplitView ? '68px' : '100%',
                      height: isSplitView ? '44px' : '38px',
                      borderRadius: '5px',
                      background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      pointerEvents: 'none',
                      flexShrink: 0,
                    }}>
                      {layout.id === 'bento' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3px', width: '100%', height: '100%' }}>
                          <div style={{ background: isCurrentLayout ? '#00BCD444' : (isDark ? '#ffffff18' : '#00000014'), borderRadius: '3px' }} />
                          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '3px' }}>
                            <div style={{ background: isDark ? '#ffffff12' : '#0000000c', borderRadius: '3px' }} />
                            <div style={{ background: isDark ? '#ffffff12' : '#0000000c', borderRadius: '3px' }} />
                          </div>
                        </div>
                      )}
                      {layout.id === 'dock' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', height: '100%', justifyContent: 'center' }}>
                          <div style={{ display: 'flex', gap: '2px', width: '100%' }}>
                            <div style={{ flex: 1, height: '12px', borderRadius: '2px', background: isCurrentLayout ? '#10b98155' : '#ffffff18' }} />
                            <div style={{ flex: 1, height: '12px', borderRadius: '2px', background: isCurrentLayout ? '#06b6d455' : '#ffffff18' }} />
                            <div style={{ flex: 1, height: '12px', borderRadius: '2px', background: isCurrentLayout ? '#a855f755' : '#ffffff18' }} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1.5px', height: '14px', alignItems: 'center' }}>
                            {[1, 0.6, 0.9, 0.4, 1, 0.3, 0.8, 1, 0.5, 0.9, 0.2, 0.7].map((v, i) => (
                              <div key={i} style={{ width: '100%', height: '3.5px', borderRadius: '1px', background: isCurrentLayout ? `rgba(16, 185, 129, ${v})` : `rgba(255, 255, 255, ${v * 0.4})` }} />
                            ))}
                          </div>
                        </div>
                      )}
                      {layout.id === 'terminal' && (
                        <div style={{ width: '100%', height: '100%', background: '#090d16', borderRadius: '4px', padding: '3px 6px', fontFamily: 'monospace', fontSize: '8px', color: '#10b981', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div>$ sys ready</div>
                          <div style={{ color: '#64748b', fontSize: '7.5px' }}>● 12 active</div>
                        </div>
                      )}
                      {layout.id === 'tetris' && (
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                          <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }} />
                          <div style={{ width: '6px', height: '20px', background: '#06b6d4', borderRadius: '2px' }} />
                          <div style={{ width: '12px', height: '12px', background: '#a855f7', borderRadius: '2px' }} />
                          <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }} />
                        </div>
                      )}
                      {layout.id === 'nouveau' && (
                        <div style={{ fontFamily: 'serif', fontSize: '9.5px', fontStyle: 'italic', color: '#d4af37' }}>
                          ~ Folio Salon ~
                        </div>
                      )}
                      {layout.id === 'kinetic' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 4px', color: '#fff', fontSize: '10px', fontWeight: '900', fontStyle: 'italic' }}>
                          <span>01 // BOLD</span>
                          <span style={{ fontSize: '9px', color: '#eab308' }}>⚡</span>
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: isSplitView ? 1 : 'initial',
                      minWidth: 0,
                      gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: isSplitView ? 'column' : 'row',
                        alignItems: isSplitView ? 'flex-start' : 'center',
                        gap: isSplitView ? '2px' : '6px',
                        minWidth: 0,
                        flex: 1,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '5px',
                            background: isCurrentLayout ? '#00BCD4' : (isDark ? '#333' : '#e5e5e5'),
                            color: isCurrentLayout ? '#000' : (isDark ? '#fff' : '#000'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <LayoutIcon size={12} />
                          </div>
                          <span style={{ fontWeight: '600', fontSize: '11.5px', color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {layout.name}
                          </span>
                        </div>
                        {isSplitView && layout.subtitle && (
                          <span style={{ fontSize: '9.5px', color: subText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            {layout.subtitle}
                          </span>
                        )}
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: isSplitView ? 'column' : 'row',
                        alignItems: isSplitView ? 'flex-end' : 'center',
                        gap: '4px',
                        flexShrink: 0,
                      }}>
                        {hotkey && (
                          <kbd style={{
                            fontSize: '8.5px',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                            color: subText,
                            border: `1px solid ${border}`,
                            fontFamily: 'monospace',
                            fontWeight: '600',
                          }}>
                            {hotkey}
                          </kbd>
                        )}
                        {isCurrentLayout ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '9px',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: '#00BCD4',
                            color: '#000',
                            fontWeight: '700'
                          }}>
                            <Check size={10} /> Active
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '8.5px',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            background: badgeBg,
                            color: subText,
                          }}>
                            {layout.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Header Quick Switcher Visibility Option */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
              border: `1px solid ${border}`,
              marginTop: '4px',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: text }}>
                  Show Layout Switcher in Main Header
                </span>
                <span style={{ fontSize: '11px', color: subText }}>
                  Display layout switcher buttons on the top bar (currently hidden; layout is switched here in Settings).
                </span>
              </div>
              <input
                type="checkbox"
                checked={!!(settings && settings.showLayoutSwitcherInHeader)}
                onChange={(e) => {
                  const updated = { showLayoutSwitcherInHeader: e.target.checked };
                  if (onSaveSettings) onSaveSettings(updated);
                  if (onLivePreviewSettings) onLivePreviewSettings(updated);
                }}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#00BCD4' }}
              />
            </div>
          </div>

          {((activeLayout || 'tetris') === 'terminal') && (
            <div style={{
              background: isDark ? 'rgba(0, 188, 212, 0.05)' : '#f0f9ff',
              border: `1px solid ${isDark ? 'rgba(0, 188, 212, 0.2)' : '#bae6fd'}`,
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: text, display: 'block' }}>
                    Hacker Terminal Options & Customization
                  </span>
                  <span style={{ fontSize: '11px', color: subText }}>
                    Customize window dimensions, themes, font density, and action buttons.
                  </span>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#00BCD4',
                  color: '#000',
                }}>
                  ACTIVE LAYOUT
                </span>
              </div>

              {/* Theme selection buttons */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: text, display: 'block', marginBottom: '6px' }}>
                  Terminal Theme
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { id: 'white', name: 'Clean White (Default Light)' },
                    { id: 'cyberpunk', name: 'Cyberpunk Neon' },
                    { id: 'matrix', name: 'Matrix CRT' },
                    { id: 'amber', name: 'Amber CRT' },
                    { id: 'dracula', name: 'Dracula' },
                    { id: 'solarizedDark', name: 'Solarized Dark' },
                  ].map((t) => {
                    const isCur = (settings?.terminal?.theme || (isDark ? 'cyberpunk' : 'white')) === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          const updated = { ...(settings?.terminal || {}), theme: t.id };
                          if (onSaveSettings) onSaveSettings({ terminal: updated });
                          if (onLivePreviewSettings) onLivePreviewSettings({ terminal: updated });
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: isCur ? '700' : '400',
                          border: `1px solid ${isCur ? '#00BCD4' : border}`,
                          background: isCur ? (isDark ? 'rgba(0, 188, 212, 0.2)' : '#e0f2fe') : (isDark ? '#222' : '#fff'),
                          color: isCur ? (isDark ? '#00BCD4' : '#0284c7') : text,
                          cursor: 'pointer',
                        }}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Width & Font Size */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: text, display: 'block', marginBottom: '6px' }}>
                    Window Width Mode
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'boxed', label: 'Boxed (1280px)' },
                      { id: 'wide', label: 'Wide (1560px)' },
                      { id: 'full', label: 'Full Width (100%)' },
                    ].map((w) => {
                      const isCur = (settings?.terminal?.width || 'boxed') === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            const updated = { ...(settings?.terminal || {}), width: w.id };
                            if (onSaveSettings) onSaveSettings({ terminal: updated });
                            if (onLivePreviewSettings) onLivePreviewSettings({ terminal: updated });
                          }}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            borderRadius: '5px',
                            fontSize: '10px',
                            fontWeight: isCur ? '700' : '400',
                            border: `1px solid ${isCur ? '#00BCD4' : border}`,
                            background: isCur ? (isDark ? 'rgba(0, 188, 212, 0.2)' : '#e0f2fe') : (isDark ? '#222' : '#fff'),
                            color: isCur ? (isDark ? '#00BCD4' : '#0284c7') : text,
                            cursor: 'pointer',
                          }}
                        >
                          {w.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: text, display: 'block', marginBottom: '6px' }}>
                    Font Size & Density
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: '11px', label: '11px (Compact)' },
                      { id: '12px', label: '12px (Standard)' },
                      { id: '14px', label: '14px (Spacious)' },
                    ].map((f) => {
                      const isCur = (settings?.terminal?.fontSize || '12px') === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            const updated = { ...(settings?.terminal || {}), fontSize: f.id };
                            if (onSaveSettings) onSaveSettings({ terminal: updated });
                            if (onLivePreviewSettings) onLivePreviewSettings({ terminal: updated });
                          }}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            borderRadius: '5px',
                            fontSize: '10px',
                            fontWeight: isCur ? '700' : '400',
                            border: `1px solid ${isCur ? '#00BCD4' : border}`,
                            background: isCur ? (isDark ? 'rgba(0, 188, 212, 0.2)' : '#e0f2fe') : (isDark ? '#222' : '#fff'),
                            color: isCur ? (isDark ? '#00BCD4' : '#0284c7') : text,
                            cursor: 'pointer',
                          }}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Banner Name / Text Input */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: text }}>
                    Terminal Banner Name / Header Text
                  </label>
                  <span style={{ fontSize: '10px', color: subText }}>
                    Changes "KV HOME" to any custom title
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={settings?.terminal?.bannerText !== undefined ? settings.terminal.bannerText : 'KV HOME'}
                    onChange={(e) => {
                      const updated = { ...(settings?.terminal || {}), bannerText: e.target.value };
                      if (onSaveSettings) onSaveSettings({ terminal: updated });
                      if (onLivePreviewSettings) onLivePreviewSettings({ terminal: updated });
                    }}
                    placeholder="e.g. KV HOME, HOMELAB, MY SERVER"
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: `1px solid ${border}`,
                      background: isDark ? '#181818' : '#ffffff',
                      color: text,
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      fontWeight: '600',
                      outline: 'none',
                    }}
                  />
                  {(settings?.terminal?.bannerText && settings.terminal.bannerText !== 'KV HOME') && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...(settings?.terminal || {}), bannerText: 'KV HOME' };
                        if (onSaveSettings) onSaveSettings({ terminal: updated });
                        if (onLivePreviewSettings) onLivePreviewSettings({ terminal: updated });
                      }}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${border}`,
                        background: isDark ? '#252525' : '#f1f5f9',
                        color: subText,
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                      title="Reset back to KV HOME"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* ASCII Banner Font Style */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: text, display: 'block', marginBottom: '6px' }}>
                  ASCII Banner Font Style
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { id: 'ansi_shadow', name: 'ANSI Shadow (3D)' },
                    { id: 'slant', name: 'Cyber Slant' },
                    { id: 'standard', name: 'FIGlet Standard' },
                    { id: 'small_block', name: 'Compact Blocks' },
                    { id: 'cyber', name: 'Cyber Double' },
                    { id: 'doom', name: 'Doom Outline' },
                    { id: 'mini', name: 'Mini ASCII' },
                  ].map((f) => {
                    const isCur = (settings?.terminal?.bannerFont || 'ansi_shadow') === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          const updated = { ...(settings?.terminal || {}), bannerFont: f.id };
                          if (onSaveSettings) onSaveSettings({ terminal: updated });
                          if (onLivePreviewSettings) onLivePreviewSettings({ terminal: updated });
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '5px',
                          fontSize: '10px',
                          fontWeight: isCur ? '700' : '400',
                          border: `1px solid ${isCur ? '#00BCD4' : border}`,
                          background: isCur ? (isDark ? 'rgba(0, 188, 212, 0.2)' : '#e0f2fe') : (isDark ? '#222' : '#fff'),
                          color: isCur ? (isDark ? '#00BCD4' : '#0284c7') : text,
                          cursor: 'pointer',
                        }}
                      >
                        {f.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', color: text }}>
                  <input
                    type="checkbox"
                    checked={settings?.terminal?.showBanner !== false}
                    onChange={(e) => {
                      const updated = { ...(settings?.terminal || {}), showBanner: e.target.checked };
                      if (onSaveSettings) onSaveSettings({ terminal: updated });
                      if (onLivePreviewSettings) onLivePreviewSettings({ terminal: updated });
                    }}
                  />
                  <span>Show ASCII Banner</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', color: text }}>
                  <input
                    type="checkbox"
                    checked={settings?.terminal?.showExec !== false}
                    onChange={(e) => {
                      const updated = { ...(settings?.terminal || {}), showExec: e.target.checked };
                      if (onSaveSettings) onSaveSettings({ terminal: updated });
                      if (onLivePreviewSettings) onLivePreviewSettings({ terminal: updated });
                    }}
                  />
                  <span>Show [↗ EXEC] Action Column</span>
                </label>
              </div>
            </div>
          )}
        </>
      )}

      {themeSubTab === 'palettes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Color Themes & Visual Styles
            </span>
            <span style={{ fontSize: '11px', color: subText }}>
              Select a theme preset to customize lighting effects, glass finishes, and palettes.
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isSplitView ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}>
            {Object.values(THEMES).map((t) => {
              const isSelected = (currentTheme?.id || 'classic') === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTheme && onSelectTheme(t.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: `2px solid ${isSelected ? '#00BCD4' : border}`,
                    background: isSelected ? (isDark ? 'rgba(0, 188, 212, 0.12)' : '#e0f7fa') : (isDark ? '#191919' : '#fcfcfc'),
                    boxShadow: isSelected ? '0 0 14px rgba(0, 188, 212, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', fontSize: '13px', color: text }}>
                      {t.name}
                    </span>
                    {isSelected ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#00BCD4',
                        color: '#000',
                        fontWeight: '600'
                      }}>
                        <Check size={12} /> Active
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: badgeBg,
                        color: subText,
                        textTransform: 'uppercase'
                      }}>
                        {t.style}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '11px', color: subText, lineHeight: '1.4', margin: 0, flex: 1 }}>
                    {t.description}
                  </p>

                  {/* Color Palette Swatches */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                    {t.swatchColors?.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          background: c,
                          boxShadow: t.style === 'neon' ? `0 0 4px ${c}` : 'none',
                          border: `1px solid ${border}`
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
