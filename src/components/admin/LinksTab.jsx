import React, { useRef } from 'react';
import {
  Search,
  X,
  ChevronUp,
  ChevronDown,
  Plus,
  Radar
} from 'lucide-react';
import LinkItemCard from './LinkItemCard';

export default function LinksTab({
  items,
  filteredItemsWithIdx,
  searchQuery,
  setSearchQuery,
  expandedIds,
  handleToggleExpand,
  handleExpandAll,
  handleCollapseAll,
  handleAddItem,
  onOpenDiscovery,
  handleDeleteItem,
  handleMove,
  handleItemChange,
  handleColorSelect,
  handleDisplayModeChange,
  handleVideoUpload,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  draggedIdx,
  dragOverIdx,
  colorPickerOpenIdx,
  setColorPickerOpenIdx,
  colorPickerContainerRef,
  deletingId,
  setDeletingId,
  uploadingIdx,
  uploadSuccessMsg,
  setIconPickerItemIdx,
  isDark,
  tokens,
  isSplitView = false,
}) {
  const { border, text, subText, badgeBg, inputBg, inputBorder } = tokens;
  const fileInputRefs = useRef({});

  return (
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

          {onOpenDiscovery && (
            <button
              type="button"
              onClick={onOpenDiscovery}
              title="Auto-Discover & Scan Host Ports"
              style={{
                padding: '6px 12px',
                background: '#00BCD422',
                color: '#00BCD4',
                border: '1px solid #00BCD455',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <Radar size={13} /> Auto-Discover
            </button>
          )}

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
          const isDeleting = deletingId === itemId;
          const isColorPickerOpen = colorPickerOpenIdx === originalIdx;
          const isDragTarget = dragOverIdx === originalIdx && draggedIdx !== originalIdx;

          return (
            <LinkItemCard
              key={itemId}
              item={item}
              originalIdx={originalIdx}
              itemsLength={items.length}
              isExpanded={isExpanded}
              isDeleting={isDeleting}
              isColorPickerOpen={isColorPickerOpen}
              isDragTarget={isDragTarget}
              onToggleExpand={handleToggleExpand}
              onMove={handleMove}
              onStartDelete={(id) => setDeletingId(id)}
              onConfirmDelete={handleDeleteItem}
              onCancelDelete={() => setDeletingId(null)}
              onItemChange={handleItemChange}
              onColorSelect={handleColorSelect}
              onDisplayModeChange={handleDisplayModeChange}
              onVideoUpload={handleVideoUpload}
              onOpenIconPicker={(idx) => setIconPickerItemIdx(idx)}
              onToggleColorPicker={(idx) => setColorPickerOpenIdx(idx)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              uploadingIdx={uploadingIdx}
              uploadSuccessMsg={uploadSuccessMsg}
              colorPickerContainerRef={colorPickerContainerRef}
              fileInputRef={{
                get current() {
                  return fileInputRefs.current[originalIdx];
                },
                set current(el) {
                  fileInputRefs.current[originalIdx] = el;
                }
              }}
              isDark={isDark}
              tokens={tokens}
              isSplitView={isSplitView}
            />
          );
        })}
      </div>
    </>
  );
}
