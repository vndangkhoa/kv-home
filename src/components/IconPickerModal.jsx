import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Check, Sparkles, Sliders, ExternalLink } from 'lucide-react';
import {
  ICON_CATEGORIES,
  CATEGORY_SLUGS,
  ALL_ICON_SLUGS,
  formatIconTitle,
} from '../data/homelabIcons';
import { CDN_BASE } from '../utils/iconResolver';

const PAGE_SIZE = 72;

export default function IconPickerModal({
  isOpen,
  onClose,
  onSelectIcon,
  onClearIcon,
  currentSlug,
  isDark = true,
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('popular');
  const [prevFilter, setPrevFilter] = useState({ search: '', activeCategory: 'popular' });
  const [page, setPage] = useState(1);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSearch('');
      setActiveCategory('popular');
      setPage(1);
    }
  }

  if (prevFilter.search !== search || prevFilter.activeCategory !== activeCategory) {
    setPrevFilter({ search, activeCategory });
    setPage(1);
  }

  const visibleCount = page * PAGE_SIZE;
  const searchInputRef = useRef(null);

  // Autofocus search on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute filtered icon list
  const filteredSlugs = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/\s+/g, '-');

    if (q) {
      // Search across ALL 3,500+ icons
      return ALL_ICON_SLUGS.filter((slug) => {
        if (slug.includes(q)) return true;
        const title = formatIconTitle(slug).toLowerCase();
        return title.includes(q.replace(/-/g, ' '));
      });
    }

    // Category filtering
    if (activeCategory === 'all') {
      return ALL_ICON_SLUGS;
    }

    if (CATEGORY_SLUGS[activeCategory]) {
      return CATEGORY_SLUGS[activeCategory];
    }

    return CATEGORY_SLUGS.popular || [];
  }, [search, activeCategory]);


  const displayedSlugs = useMemo(() => {
    return filteredSlugs.slice(0, visibleCount);
  }, [filteredSlugs, visibleCount]);

  const hasMore = visibleCount < filteredSlugs.length;

  if (!isOpen) return null;

  const bg = isDark ? '#141417' : '#ffffff';
  const headerBg = isDark ? '#1c1d22' : '#f8fafc';
  const border = isDark ? '#272832' : '#e2e8f0';
  const text = isDark ? '#f1f5f9' : '#0f172a';
  const subText = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? '#1a1b21' : '#f8fafc';
  const cardBorder = isDark ? '#262833' : '#e2e8f0';
  const inputBg = isDark ? '#121318' : '#ffffff';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '88vh',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: headerBg,
            borderBottom: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: text }}>
                Universal Homelab Icon Picker
              </div>
              <div style={{ fontSize: '11px', color: subText }}>
                Pick from 3,500+ official WalkxCode dashboard vector SVGs
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: `1px solid ${border}`,
                borderRadius: '8px',
                padding: '6px 10px',
                color: subText,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
              }}
              title="Close (Esc)"
            >
              <X size={14} />
              <span>Esc</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div
          style={{
            padding: '14px 20px 10px 20px',
            borderBottom: `1px solid ${border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: inputBg,
              border: `1px solid ${border}`,
              borderRadius: '10px',
              padding: '8px 14px',
              gap: '10px',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            <Search size={16} color={subText} />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 3,500+ icons (e.g. jellyfin, plex, home assistant, qbittorrent, pihole, immich)..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: text,
                fontSize: '13px',
                fontFamily: 'inherit',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: subText,
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={14} />
              </button>
            )}
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                color: subText,
                fontWeight: '600',
              }}
            >
              {filteredSlugs.length} matches
            </span>
          </div>

          {/* Category Filter Pills */}
          {!search && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '4px',
                scrollbarWidth: 'none',
              }}
            >
              {ICON_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: '20px',
                      border: `1px solid ${isActive ? '#3b82f6' : border}`,
                      background: isActive
                        ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe')
                        : 'transparent',
                      color: isActive ? '#3b82f6' : subText,
                      fontSize: '11px',
                      fontWeight: isActive ? '600' : '500',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable Icon Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))',
            gap: '10px',
            alignContent: 'start',
          }}
        >
          {displayedSlugs.map((slug) => {
            const isSelected = currentSlug === slug;
            const title = formatIconTitle(slug);
            const iconUrl = `${CDN_BASE}/${slug}.svg`;

            return (
              <button
                key={slug}
                onClick={() => {
                  onSelectIcon(slug);
                  onClose();
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px 10px 8px',
                  borderRadius: '12px',
                  background: isSelected
                    ? (isDark ? 'rgba(59, 130, 246, 0.16)' : '#eff6ff')
                    : cardBg,
                  border: `1px solid ${
                    isSelected ? '#3b82f6' : cardBorder
                  }`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected
                    ? '0 0 0 2px rgba(59,130,246,0.3)'
                    : 'none',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isSelected ? '#3b82f6' : cardBorder;
                  e.currentTarget.style.boxShadow = isSelected ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none';
                }}
                title={`${title} (${slug})`}
              >
                {/* Check Badge if Selected */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}

                {/* SVG Icon Box */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    padding: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                >
                  <img
                    src={iconUrl}
                    alt={slug}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                {/* Formatted Title */}
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: text,
                    lineHeight: '1.25',
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {title}
                </div>

                {/* Kebab Slug Badge */}
                <div
                  style={{
                    fontSize: '9px',
                    color: subText,
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '2px',
                    fontFamily: 'monospace',
                  }}
                >
                  {slug}
                </div>
              </button>
            );
          })}

          {displayedSlugs.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '40px 20px',
                textAlign: 'center',
                color: subText,
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '600', color: text }}>
                No icons found matching "{search}"
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                Try searching a different keyword or paste a custom URL directly in the link settings.
              </div>
            </div>
          )}
        </div>

        {/* Load More Button if results exceed visibleCount */}
        {hasMore && (
          <div
            style={{
              padding: '10px 20px',
              borderTop: `1px solid ${border}`,
              background: headerBg,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => setPage((prev) => prev + 1)}
              style={{
                padding: '7px 18px',
                borderRadius: '8px',
                background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                border: `1px solid ${border}`,
                color: text,
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Load More Icons ({filteredSlugs.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: headerBg,
            borderTop: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onClearIcon && (
              <button
                type="button"
                onClick={() => {
                  onClearIcon();
                  onClose();
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${border}`,
                  background: 'transparent',
                  color: subText,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Reset to Initials
              </button>
            )}

            <a
              href="https://dashboard-icons.walkx.dev/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                color: '#3b82f6',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              WalkxCode Docs <ExternalLink size={12} />
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              background: isDark ? '#ffffff' : '#000000',
              color: isDark ? '#000000' : '#ffffff',
              border: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
