import React from 'react';
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  ExternalLink,
  Palette,
  Film,
  Upload,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import { getServiceIconUrl, getIconSlug } from '../../utils/iconResolver';
import { PRESET_COLORS } from './adminTheme';
import VideoThumbnail from './VideoThumbnail';

export default function LinkItemCard({
  item,
  originalIdx,
  itemsLength,
  isExpanded,
  isDeleting,
  isColorPickerOpen,
  isDragTarget,
  onToggleExpand,
  onMove,
  onStartDelete,
  onConfirmDelete,
  onCancelDelete,
  onItemChange,
  onColorSelect,
  onDisplayModeChange,
  onVideoUpload,
  onOpenIconPicker,
  onToggleColorPicker,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  uploadingIdx,
  uploadSuccessMsg,
  colorPickerContainerRef,
  fileInputRef,
  isDark,
  tokens,
  isSplitView = false,
}) {
  const { cardBg, cardBorder, border, text, subText, badgeBg, inputBg, inputBorder } = tokens;
  const itemId = item.id || originalIdx;
  const currentColor = item.color || item.hoverColor || '#2196F3';
  const isItemVideo = !!(item.isVideo || item.label === 'cv');
  const isItemSolid = !!item.featured && !isItemVideo;
  const currentMode = isItemVideo ? 'video' : (isItemSolid ? 'solid' : 'hover');
  const itemIconUrl = getServiceIconUrl(item);
  const itemSlug = getIconSlug(item);

  return (
    <div
      onDragOver={(e) => onDragOver(e, originalIdx)}
      onDrop={(e) => onDrop(e, originalIdx)}
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
            onDragStart={(e) => onDragStart(e, originalIdx)}
            onDragEnd={onDragEnd}
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
                onMove(originalIdx, -1);
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
                onMove(originalIdx, 1);
              }}
              disabled={originalIdx === itemsLength - 1}
              style={{
                padding: '1px 3px',
                background: 'none',
                border: 'none',
                color: originalIdx === itemsLength - 1 ? (isDark ? '#444' : '#ccc') : text,
                cursor: originalIdx === itemsLength - 1 ? 'default' : 'pointer',
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

          {/* Mini Brand Icon Preview if mapped */}
          {itemIconUrl && (
            <div 
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '3px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
                padding: '1px'
              }}
              title={item.iconUrl ? 'Custom Icon URL' : `Universal Icon: ${itemSlug}.svg`}
            >
              <img 
                src={itemIconUrl} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}

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
            onClick={() => onToggleExpand(itemId)}
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
                whiteSpace: 'nowrap',
                maxWidth: isSplitView ? '70px' : '140px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
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
            maxWidth: isSplitView ? '85px' : '170px',
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
            onClick={() => onToggleExpand(itemId)}
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
                onClick={() => onConfirmDelete(originalIdx)}
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
                onClick={onCancelDelete}
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
              onClick={() => onStartDelete(itemId)}
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
                onChange={(e) => onItemChange(originalIdx, 'title', e.target.value)}
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
                onChange={(e) => onItemChange(originalIdx, 'subtitle', e.target.value)}
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
                onChange={(e) => onItemChange(originalIdx, 'label', e.target.value.toLowerCase().replace(/\s+/g, ''))}
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
                onChange={(e) => onItemChange(originalIdx, 'link', e.target.value)}
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

          {/* Row 2.5: Universal Homelab Icon Mapping & Custom Override */}
          <div style={{
            background: isDark ? '#1a1a1a' : '#f0f0f0',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Left: Icon Preview, Status & Pick Icon Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
              <div
                onClick={() => onOpenIconPicker(originalIdx)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '9px',
                  background: isDark ? '#121212' : '#ffffff',
                  border: `1px solid ${inputBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.06)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = inputBorder;
                }}
                title="Click to browse and pick from 3,500+ WalkxCode icons"
              >
                {itemIconUrl ? (
                  <img
                    src={itemIconUrl}
                    alt={item.title || item.label}
                    style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: subText }}>
                    {item.title ? item.title.slice(0, 2).toUpperCase() : (item.label || 'KV').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>UNIVERSAL ICON</span>
                  <span style={{
                    fontSize: '9px',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: itemIconUrl ? (isDark ? 'rgba(76, 175, 80, 0.2)' : '#e8f5e9') : badgeBg,
                    color: itemIconUrl ? '#4CAF50' : subText,
                    border: `1px solid ${border}`,
                    fontWeight: '600'
                  }}>
                    {item.iconUrl ? 'Custom Override' : (item.iconSlug ? `Picked: ${item.iconSlug}` : (itemSlug ? `Mapped: ${itemSlug}.svg` : 'Initials Fallback'))}
                  </span>
                </div>
                <div style={{ fontSize: '9px', color: subText, marginTop: '2px' }}>
                  {itemIconUrl ? 'WalkxCode vector SVG active' : 'Auto-resolves from slug or title, or pick below'}
                </div>
              </div>
            </div>

            {/* Center: Direct Pick Icon Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onOpenIconPicker(originalIdx)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  transition: 'all 0.15s ease',
                }}
                title="Open interactive icon picker with 3,500+ icons"
              >
                <Sparkles size={13} />
                <span>Pick Icon</span>
              </button>
            </div>

            {/* Right: Custom Icon URL input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 200px', maxWidth: '320px' }}>
              <input
                type="text"
                value={item.iconUrl || ''}
                onChange={(e) => onItemChange(originalIdx, 'iconUrl', e.target.value)}
                placeholder="Or paste custom URL..."
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: text,
                  fontSize: '10px',
                  fontFamily: 'inherit',
                }}
              />
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
                    onClick={() => onDisplayModeChange(originalIdx, 'solid')}
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
                    onClick={() => onDisplayModeChange(originalIdx, 'hover')}
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
                    onClick={() => onDisplayModeChange(originalIdx, 'video')}
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
                      onClick={() => onToggleColorPicker(originalIdx)}
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
                              onColorSelect(originalIdx, c);
                              onToggleColorPicker(null);
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
                            onChange={(e) => onColorSelect(originalIdx, e.target.value)}
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
                            onChange={(e) => onColorSelect(originalIdx, e.target.value)}
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
                      onChange={(e) => onItemChange(originalIdx, 'videoUrl', e.target.value)}
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
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          onVideoUpload(originalIdx, e.target.files[0]);
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef?.current?.click()}
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
}
