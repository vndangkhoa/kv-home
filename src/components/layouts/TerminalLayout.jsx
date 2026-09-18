import React, { useState, useMemo, useRef, useEffect } from 'react';
import { renderAsciiBanner, ASCII_FONTS } from '../../utils/asciiBanner';

const DEFAULT_ASCII_BANNER = `
  _  ____      __   _   _  ___  __  __ _____ 
 | |/ /\\ \\    / /  | | | |/ _ \\|  \\/  | ____|
 | ' /  \\ \\  / /   | |_| | | | | |\\/| |  _|  
 | . \\   \\ \\/ /    |  _  | |_| | |  | | |___ 
 |_|\\_\\   \\__/     |_| |_|\\___/|_|  |_|_____|
`;

const THEMES = {
  white: {
    id: 'white',
    name: 'Clean White',
    isDark: false,
    bg: '#ffffff',
    titleBar: '#f8fafc',
    border: '#e2e8f0',
    primary: '#0284c7',
    secondary: '#0369a1',
    text: '#334155',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    accent: '#0284c7',
    success: '#16a34a',
    tableHeaderBg: '#f0f9ff',
    tableBorder: '#e0f2fe',
    tableRowBorder: '#f1f5f9',
    selectedBg: '#e0f2fe',
    selectedText: '#0369a1',
    glow: 'none',
    bannerColor: '#0284c7',
    execBg: '#f0f9ff',
    execBorder: '#bae6fd',
    execText: '#0284c7',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    isDark: true,
    bg: '#0a0e14',
    titleBar: '#06090f',
    border: 'rgba(0, 240, 255, 0.3)',
    primary: '#00f0ff',
    secondary: '#ff007f',
    text: '#e6edf3',
    textPrimary: '#ffffff',
    textSecondary: '#a5d6ff',
    textMuted: '#58a6ff',
    accent: '#00f0ff',
    success: '#00ff88',
    tableHeaderBg: 'rgba(0, 240, 255, 0.1)',
    tableBorder: 'rgba(0, 240, 255, 0.25)',
    tableRowBorder: 'rgba(0, 240, 255, 0.08)',
    selectedBg: '#00f0ff',
    selectedText: '#06090f',
    glow: '0 0 10px rgba(0, 240, 255, 0.45)',
    bannerColor: '#00f0ff',
    execBg: 'rgba(0, 240, 255, 0.12)',
    execBorder: 'rgba(0, 240, 255, 0.4)',
    execText: '#00f0ff',
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix CRT',
    isDark: true,
    bg: '#050a05',
    titleBar: '#020502',
    border: 'rgba(0, 255, 102, 0.3)',
    primary: '#00ff66',
    secondary: '#00cc55',
    text: '#76e08c',
    textPrimary: '#50fa7b',
    textSecondary: '#40c060',
    textMuted: '#227733',
    accent: '#00ff66',
    success: '#00ff66',
    tableHeaderBg: 'rgba(0, 255, 102, 0.08)',
    tableBorder: 'rgba(0, 255, 102, 0.25)',
    tableRowBorder: 'rgba(0, 255, 102, 0.08)',
    selectedBg: '#00ff66',
    selectedText: '#020502',
    glow: '0 0 10px rgba(0, 255, 102, 0.45)',
    bannerColor: '#00ff66',
    execBg: 'rgba(0, 255, 102, 0.12)',
    execBorder: 'rgba(0, 255, 102, 0.4)',
    execText: '#00ff66',
  },
  amber: {
    id: 'amber',
    name: 'Amber CRT',
    isDark: true,
    bg: '#0c0903',
    titleBar: '#060401',
    border: 'rgba(255, 176, 0, 0.35)',
    primary: '#ffb000',
    secondary: '#ff8800',
    text: '#ffca66',
    textPrimary: '#ffe099',
    textSecondary: '#cca040',
    textMuted: '#8a6520',
    accent: '#ffb000',
    success: '#ffb000',
    tableHeaderBg: 'rgba(255, 176, 0, 0.1)',
    tableBorder: 'rgba(255, 176, 0, 0.25)',
    tableRowBorder: 'rgba(255, 176, 0, 0.08)',
    selectedBg: '#ffb000',
    selectedText: '#0c0903',
    glow: '0 0 10px rgba(255, 176, 0, 0.45)',
    bannerColor: '#ffb000',
    execBg: 'rgba(255, 176, 0, 0.12)',
    execBorder: 'rgba(255, 176, 0, 0.4)',
    execText: '#ffb000',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    isDark: true,
    bg: '#282a36',
    titleBar: '#1e1f29',
    border: 'rgba(189, 147, 249, 0.35)',
    primary: '#8be9fd',
    secondary: '#bd93f9',
    text: '#f8f8f2',
    textPrimary: '#ffffff',
    textSecondary: '#f1fa8c',
    textMuted: '#6272a4',
    accent: '#ff79c6',
    success: '#50fa7b',
    tableHeaderBg: 'rgba(189, 147, 249, 0.12)',
    tableBorder: 'rgba(189, 147, 249, 0.25)',
    tableRowBorder: 'rgba(255, 255, 255, 0.06)',
    selectedBg: '#bd93f9',
    selectedText: '#1e1f29',
    glow: 'none',
    bannerColor: '#bd93f9',
    execBg: 'rgba(189, 147, 249, 0.15)',
    execBorder: 'rgba(189, 147, 249, 0.4)',
    execText: '#8be9fd',
  },
  solarizedDark: {
    id: 'solarizedDark',
    name: 'Solarized Dark',
    isDark: true,
    bg: '#002b36',
    titleBar: '#073642',
    border: 'rgba(42, 161, 152, 0.35)',
    primary: '#2aa198',
    secondary: '#268bd2',
    text: '#93a1a1',
    textPrimary: '#fdf6e3',
    textSecondary: '#839496',
    textMuted: '#586e75',
    accent: '#b58900',
    success: '#859900',
    tableHeaderBg: 'rgba(42, 161, 152, 0.12)',
    tableBorder: 'rgba(42, 161, 152, 0.25)',
    tableRowBorder: 'rgba(42, 161, 152, 0.08)',
    selectedBg: '#2aa198',
    selectedText: '#002b36',
    glow: 'none',
    bannerColor: '#2aa198',
    execBg: 'rgba(42, 161, 152, 0.15)',
    execBorder: 'rgba(42, 161, 152, 0.4)',
    execText: '#2aa198',
  },
};

export default function TerminalLayout({
  links = [],
  isDark = true,
  settings = {},
  onSaveSettings = null,
  onSelectLayout = null,
  onOpenAdmin = null,
}) {
  const termConfig = settings.terminal || {};

  // Adjustable dimensions & sizing (derived from termConfig + local overrides)
  const [localOverrides, setLocalOverrides] = useState({});

  const widthMode = localOverrides.width ?? termConfig.width ?? 'boxed';
  const fontSize = localOverrides.fontSize ?? termConfig.fontSize ?? '12px';
  const density = localOverrides.density ?? termConfig.density ?? 'normal';
  const showBanner = localOverrides.showBanner ?? (termConfig.showBanner !== false);
  const showExec = localOverrides.showExec ?? (termConfig.showExec !== false);
  const showAdjustPanel = localOverrides.showAdjustPanel ?? false;

  const bannerText = localOverrides.bannerText ?? termConfig.bannerText ?? 'KV HOME';
  const bannerFont = localOverrides.bannerFont ?? termConfig.bannerFont ?? 'ansi_shadow';
  const bannerCustom = localOverrides.bannerCustom ?? termConfig.bannerCustom ?? '';
  const bannerGlow = localOverrides.bannerGlow ?? (termConfig.bannerGlow !== false);

  const userThemeKey = localOverrides.theme ?? termConfig.theme ?? null;
  const crtOverride = localOverrides.crtEffect ?? (termConfig.crtEffect !== undefined ? termConfig.crtEffect : null);

  const setWidthMode = (v) => setLocalOverrides(p => ({ ...p, width: v }));
  const setFontSize = (v) => setLocalOverrides(p => ({ ...p, fontSize: v }));
  const setDensity = (v) => setLocalOverrides(p => ({ ...p, density: v }));
  const setShowBanner = (v) => setLocalOverrides(p => ({ ...p, showBanner: v }));
  const setShowExec = (v) => setLocalOverrides(p => ({ ...p, showExec: v }));
  const setShowAdjustPanel = (v) => setLocalOverrides(p => ({ ...p, showAdjustPanel: typeof v === 'function' ? v(p.showAdjustPanel ?? false) : v }));
  const setBannerText = (v) => setLocalOverrides(p => ({ ...p, bannerText: v }));
  const setBannerFont = (v) => setLocalOverrides(p => ({ ...p, bannerFont: v }));
  const setBannerCustom = (v) => setLocalOverrides(p => ({ ...p, bannerCustom: v }));
  const setBannerGlow = (v) => setLocalOverrides(p => ({ ...p, bannerGlow: v }));
  const setUserThemeKey = (v) => setLocalOverrides(p => ({ ...p, theme: v }));
  const setCrtOverride = (v) => setLocalOverrides(p => ({ ...p, crtEffect: v }));

  const [inputVal, setInputVal] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState([
    { type: 'sys', text: 'Initializing KV-OS Kernel v4.19-edge (x86_64)...' },
    { type: 'sys', text: `Loaded ${links.length} network daemon endpoints. Ready.` },
    { type: 'hint', text: 'Type a query to filter services, or try: "help", "clear", "banner", "bannerfont"' }
  ]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [cmdHistIdx, setCmdHistIdx] = useState(-1);
  const [activeFilter, setActiveFilter] = useState('');

  const inputRef = useRef(null);
  const terminalEndRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Theme resolution: If in light mode, default to 'white' (never solarized light)
  const activeThemeKey = useMemo(() => {
    if (userThemeKey && THEMES[userThemeKey]) return userThemeKey;
    if (termConfig.theme && THEMES[termConfig.theme]) return termConfig.theme;
    return isDark ? 'cyberpunk' : 'white';
  }, [userThemeKey, termConfig.theme, isDark]);

  const activeTheme = THEMES[activeThemeKey] || (isDark ? THEMES.cyberpunk : THEMES.white);
  const crtEnabled = crtOverride !== null ? crtOverride : (activeTheme.isDark && isDark);

  // Persist settings to app state & localStorage/server
  const persistTerminalConfig = (updates) => {
    if (onSaveSettings) {
      onSaveSettings({
        terminal: {
          ...(settings.terminal || {}),
          width: widthMode,
          fontSize: fontSize,
          density: density,
          showBanner: showBanner,
          showExec: showExec,
          theme: activeThemeKey,
          crtEffect: crtEnabled,
          bannerText: bannerText,
          bannerFont: bannerFont,
          bannerCustom: bannerCustom,
          bannerGlow: bannerGlow,
          ...updates,
        }
      });
    }
  };

  // Render dynamic ASCII banner based on configured text and font
  const renderedBanner = useMemo(() => {
    return renderAsciiBanner(bannerText, bannerFont, bannerCustom);
  }, [bannerText, bannerFont, bannerCustom]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    const q = activeFilter.trim().toLowerCase();
    if (!q) return links;
    return links.filter((item) => (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.label && item.label.toLowerCase().includes(q)) ||
      (item.group && item.group.toLowerCase().includes(q)) ||
      (item.link && item.link.toLowerCase().includes(q))
    ));
  }, [links, activeFilter]);

  const safeSelectedIndex = Math.min(selectedIndex, Math.max(0, filteredLinks.length - 1));

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Launch a service
  const launchService = (item) => {
    if (!item) return;
    const name = item.title || item.label || 'Endpoint';
    setHistory((prev) => [
      ...prev,
      { type: 'cmd', text: `open ${name.toLowerCase()}` },
      { type: 'sys', text: `[EXEC] Launching ${name} -> ${item.link}` },
    ]);
    window.open(item.link, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Sizing helpers
  const toggleFullscreen = () => {
    const nextMode = widthMode === 'full' ? 'boxed' : 'full';
    setWidthMode(nextMode);
    persistTerminalConfig({ width: nextMode });
  };

  const cycleFontSize = () => {
    const order = ['11px', '12px', '14px'];
    const nextIdx = (order.indexOf(fontSize) + 1) % order.length;
    const nextSize = order[nextIdx];
    setFontSize(nextSize);
    persistTerminalConfig({ fontSize: nextSize });
  };

  const handleCommandSubmit = (e) => {
    e?.preventDefault();
    const rawCmd = inputVal.trim();

    if (!rawCmd) {
      if (filteredLinks[safeSelectedIndex]) {
        launchService(filteredLinks[safeSelectedIndex]);
      }
      return;
    }

    setCmdHistory((prev) => [...prev, rawCmd]);
    setCmdHistIdx(-1);

    const lower = rawCmd.toLowerCase();
    const newHistory = [...history, { type: 'cmd', text: `$ ${rawCmd}` }];

    // Quick number execution: e.g. "1" or "01"
    const parsedNum = parseInt(lower, 10);
    if (!isNaN(parsedNum) && String(parsedNum) === lower.replace(/^0+/, '')) {
      const idx = parsedNum - 1;
      if (idx >= 0 && idx < filteredLinks.length) {
        const item = filteredLinks[idx];
        launchService(item);
        setInputVal('');
        return;
      } else {
        newHistory.push({ type: 'err', text: `Index #${parsedNum} out of range (1-${filteredLinks.length})` });
        setHistory(newHistory);
        setInputVal('');
        return;
      }
    }

    if (lower === 'clear') {
      setHistory([]);
      setInputVal('');
      setActiveFilter('');
      return;
    }

    if (lower === 'help') {
      newHistory.push({
        type: 'sys',
        text: `KV-OS SHELL COMMANDS:
  help                    - Display this manual
  clear                   - Clear terminal buffer
  list                    - List all active endpoints
  status                  - Display system telemetry
  top / ps                - Display daemon processes
  neofetch                - Display system identity banner
  ping <service>          - Ping endpoint (e.g. "ping portainer")
  curl <service>          - Test HTTP response headers
  open <# | name>         - Launch service (e.g. "open 1" or "open jellyfin")
  layout <name>           - Switch layout engine (dock, bento, tetris, nouveau, kinetic)
  admin                   - Open full Admin Settings modal
  fullscreen / maximize   - Toggle full-width terminal mode
  adjust                  - Open/close interactive GUI adjustment toolbar

BANNER & TYPOGRAPHY:
  banner <text>           - Customize ASCII banner text (e.g. "banner MY HOMELAB")
  bannerfont <font>       - Switch font style (ansi_shadow, slant, standard, small_block, cyber, doom, mini)
  bannerfonts             - Showcase all available ASCII font styles
  banner on | off         - Toggle ASCII banner visibility
  banner glow             - Toggle neon text glow effect
  banner reset            - Reset banner to default "KV HOME" (ANSI Shadow)

CUSTOMIZATION & ADJUSTABILITY:
  theme <name>            - Switch theme (white, cyberpunk, matrix, amber, dracula, solarized)
  set width <mode>        - Set window width (boxed, wide, full)
  set font <11|12|14>     - Set font size / scale
  set exec <on|off>       - Toggle [↗ EXEC] action column
  crt                     - Toggle retro CRT scanline effect
  <query>                 - Filter services live by query string

WINDOW SHORTCUTS:
  [Green dot]             - Toggle Boxed / Full-Width Maximize
  [Yellow dot]            - Cycle Font Size / Density
  [Red dot]               - Clear screen & reset filter
  [ ⚙ ADJUST ]            - Toggle on-screen adjustments panel`
      });
      setActiveFilter('');
    } else if (lower.startsWith('layout ') || ['bento', 'dock', 'desktop', 'launcher', 'tetris', 'nouveau', 'kinetic'].includes(lower)) {
      const layoutMap = {
        bento: 'bento',
        dock: 'dock',
        desktop: 'dock',
        launcher: 'dock',
        terminal: 'terminal',
        tetris: 'tetris',
        nouveau: 'nouveau',
        kinetic: 'kinetic',
      };
      const target = lower.startsWith('layout ') ? lower.replace('layout ', '').trim() : lower;
      const targetId = layoutMap[target] || target;
      if (['bento', 'dock', 'terminal', 'tetris', 'nouveau', 'kinetic'].includes(targetId)) {
        newHistory.push({ type: 'sys', text: `Switching active layout engine to [${targetId.toUpperCase()}]...` });
        setHistory(newHistory);
        setInputVal('');
        if (onSelectLayout) {
          onSelectLayout(targetId);
        } else if (onSaveSettings) {
          onSaveSettings({ activeLayout: targetId });
        }
        return;
      } else {
        newHistory.push({ type: 'err', text: `Unknown layout "${target}". Choose: dock, bento, terminal, tetris, nouveau, kinetic` });
        setHistory(newHistory);
        setInputVal('');
        return;
      }
    } else if (lower === 'admin') {
      if (onOpenAdmin) {
        onOpenAdmin();
        newHistory.push({ type: 'sys', text: 'Opening Admin Settings Modal...' });
      } else {
        newHistory.push({ type: 'hint', text: 'Admin shortcut: Click the ⚙ Admin button in top header bar or press Ctrl+Shift+A' });
      }
    } else if (lower === 'adjust' || lower === 'config' || lower === 'settings') {
      setShowAdjustPanel((prev) => !prev);
      newHistory.push({ type: 'sys', text: `Adjustment toolbar toggled.` });
    } else if (lower === 'fullscreen' || lower === 'maximize') {
      toggleFullscreen();
      newHistory.push({ type: 'sys', text: `Window width mode set to: ${widthMode === 'full' ? 'boxed' : 'full'}` });
    } else if (lower.startsWith('set width ') || lower.startsWith('width ')) {
      const mode = (lower.replace('set width ', '').replace('width ', '')).trim();
      if (['boxed', 'wide', 'full'].includes(mode)) {
        setWidthMode(mode);
        persistTerminalConfig({ width: mode });
        newHistory.push({ type: 'sys', text: `Window width updated to "${mode}".` });
      } else {
        newHistory.push({ type: 'err', text: `Invalid width "${mode}". Choose: boxed, wide, full` });
      }
    } else if (lower.startsWith('set font ') || lower.startsWith('font ')) {
      const sz = (lower.replace('set font ', '').replace('font ', '')).trim();
      const mapped = sz.endsWith('px') ? sz : `${sz}px`;
      if (['11px', '12px', '13px', '14px', '16px'].includes(mapped)) {
        setFontSize(mapped);
        persistTerminalConfig({ fontSize: mapped });
        newHistory.push({ type: 'sys', text: `Terminal font size updated to "${mapped}".` });
      } else {
        newHistory.push({ type: 'err', text: `Invalid font size "${sz}". Choose: 11, 12, 14` });
      }
    } else if (lower === 'bannerfonts' || lower === 'fonts') {
      const demo = ASCII_FONTS.map(f => `=== [${f.name.toUpperCase()}] (${f.id}) ===\n${renderAsciiBanner('KV HOME', f.id)}`).join('\n\n');
      newHistory.push({
        type: 'raw',
        text: `--- ASCII BANNER FONT SHOWCASE ---\n\n${demo}\n\nSwitch font: "bannerfont <id>" | Set text: "banner <your text>"`
      });
    } else if (lower.startsWith('bannerfont ') || lower.startsWith('fontbanner ')) {
      const fontQuery = lower.replace(/^bannerfont\s+/, '').replace(/^fontbanner\s+/, '').trim();
      const matchedFont = ASCII_FONTS.find(f => f.id === fontQuery || f.name.toLowerCase().includes(fontQuery) || f.id.replace('_', '') === fontQuery.replace('_', ''));
      if (matchedFont) {
        setBannerFont(matchedFont.id);
        setBannerCustom('');
        persistTerminalConfig({ bannerFont: matchedFont.id, bannerCustom: '' });
        newHistory.push({ type: 'sys', text: `Banner font switched to "${matchedFont.name}".` });
      } else {
        newHistory.push({
          type: 'err',
          text: `Unknown font "${fontQuery}". Available: ${ASCII_FONTS.map(f => f.id).join(', ')}`
        });
      }
    } else if (lower.startsWith('set banner ') || lower.startsWith('banner ')) {
      const fullArg = rawCmd.replace(/^set banner\s+/i, '').replace(/^banner\s+/i, '').trim();
      const argLower = fullArg.toLowerCase();
      if (argLower === 'on' || argLower === 'show' || argLower === 'true' || argLower === '1') {
        setShowBanner(true);
        persistTerminalConfig({ showBanner: true });
        newHistory.push({ type: 'sys', text: 'ASCII Banner ENABLED.' });
      } else if (argLower === 'off' || argLower === 'hide' || argLower === 'false' || argLower === '0') {
        setShowBanner(false);
        persistTerminalConfig({ showBanner: false });
        newHistory.push({ type: 'sys', text: 'ASCII Banner DISABLED.' });
      } else if (argLower === 'glow') {
        const nextGlow = !bannerGlow;
        setBannerGlow(nextGlow);
        persistTerminalConfig({ bannerGlow: nextGlow });
        newHistory.push({ type: 'sys', text: `Banner Glow effect ${nextGlow ? 'ENABLED' : 'DISABLED'}.` });
      } else if (argLower.startsWith('font ') || argLower.startsWith('style ')) {
        const fontQuery = argLower.replace(/^font\s+/, '').replace(/^style\s+/, '').trim();
        const matchedFont = ASCII_FONTS.find(f => f.id === fontQuery || f.name.toLowerCase().includes(fontQuery) || f.id.replace('_', '') === fontQuery.replace('_', ''));
        if (matchedFont) {
          setBannerFont(matchedFont.id);
          setBannerCustom('');
          persistTerminalConfig({ bannerFont: matchedFont.id, bannerCustom: '' });
          newHistory.push({ type: 'sys', text: `Banner font switched to "${matchedFont.name}".` });
        } else {
          newHistory.push({
            type: 'err',
            text: `Unknown font "${fontQuery}". Available: ${ASCII_FONTS.map(f => f.id).join(', ')}`
          });
        }
      } else if (argLower === 'reset') {
        setBannerText('KV HOME');
        setBannerFont('ansi_shadow');
        setBannerCustom('');
        persistTerminalConfig({ bannerText: 'KV HOME', bannerFont: 'ansi_shadow', bannerCustom: '' });
        newHistory.push({ type: 'sys', text: 'Banner reset to default "KV HOME" (ANSI Shadow).' });
      } else if (argLower === 'fonts' || argLower === 'list') {
        const fontList = ASCII_FONTS.map(f => `  • ${f.id.padEnd(14)} - ${f.name} (${f.description})`).join('\n');
        newHistory.push({
          type: 'sys',
          text: `AVAILABLE ASCII FONTS:\n${fontList}\n\nUsage: "bannerfont <id>" or "banner <text>"`
        });
      } else {
        // Adjust banner text
        setBannerText(fullArg);
        setBannerCustom('');
        setShowBanner(true);
        persistTerminalConfig({ bannerText: fullArg, bannerCustom: '', showBanner: true });
        newHistory.push({ type: 'sys', text: `Banner text updated to "${fullArg}" (${bannerFont}).` });
      }
    } else if (lower.startsWith('set name ') || lower.startsWith('name ')) {
      const fullArg = rawCmd.replace(/^set name\s+/i, '').replace(/^name\s+/i, '').trim();
      setBannerText(fullArg);
      setBannerCustom('');
      setShowBanner(true);
      persistTerminalConfig({ bannerText: fullArg, bannerCustom: '', showBanner: true });
      newHistory.push({ type: 'sys', text: `Terminal name updated to "${fullArg}".` });
    } else if (lower.startsWith('set exec ') || lower.startsWith('exec ')) {
      const arg = (lower.replace('set exec ', '').replace('exec ', '')).trim();
      const val = arg === 'on' || arg === 'true' || arg === '1' || arg === 'show';
      setShowExec(val);
      persistTerminalConfig({ showExec: val });
      newHistory.push({ type: 'sys', text: `EXEC action column ${val ? 'ENABLED' : 'DISABLED'}.` });
    } else if (lower.startsWith('density ') || lower.startsWith('set density ')) {
      const arg = lower.replace(/^set density\s+/i, '').replace(/^density\s+/i, '').trim();
      if (['compact', 'normal', 'spacious'].includes(arg)) {
        setDensity(arg);
        persistTerminalConfig({ density: arg });
        newHistory.push({ type: 'sys', text: `Row density set to "${arg}".` });
      } else {
        newHistory.push({ type: 'err', text: 'Usage: density <compact|normal|spacious>' });
      }
    } else if (lower === 'list') {
      setActiveFilter('');
      newHistory.push({ type: 'sys', text: `Displaying all ${links.length} daemon endpoints.` });
    } else if (lower === 'status') {
      newHistory.push({
        type: 'sys',
        text: `--- SYSTEM TELEMETRY ---
HOST        : kv-home.local (KV-OS Edge v4.19)
TITLE       : ${settings.title || 'KV-PORT'}
THEME       : ${activeTheme.name}
WIDTH MODE  : ${widthMode}
FONT SIZE   : ${fontSize}
SERVICES    : ${links.length} online / 0 degraded
UPTIME      : 99.9% (14 days, 6 hours, 28 mins)
STATUS      : 200 DAEMONS HEALTHY`
      });
    } else if (lower === 'neofetch' || lower === 'fastfetch') {
      newHistory.push({
        type: 'raw',
        text: `         _  __     __     OS: KV-OS Kernel v4.19-edge (x86_64)
        | |/ /\\ \\ / /     Host: kv-home.local
        | ' /  \\ V /      Kernel: Linux 6.6.21-kv-edge
        | . \\   | |       Uptime: 99.9% (14d 6h 28m)
        |_|\\_\\  |_|       Daemons: ${links.length} active
                          Shell: kv-sh 2.4-tty
                          Theme: ${activeTheme.name}
                          Width: ${widthMode} | Font: ${fontSize}`
      });
    } else if (lower === 'crt') {
      const nextCrt = !crtEnabled;
      setCrtOverride(nextCrt);
      persistTerminalConfig({ crtEffect: nextCrt });
      newHistory.push({ type: 'sys', text: `CRT Scanline overlay ${nextCrt ? 'ENABLED' : 'DISABLED'}.` });
    } else if (lower.startsWith('theme ') || lower.startsWith('set theme ')) {
      const requested = (lower.replace('set theme ', '').replace('theme ', '')).trim();
      let matchedKey = null;
      if (['white', 'clean', 'cleanwhite', 'light'].includes(requested)) matchedKey = 'white';
      else if (['cyberpunk', 'neon'].includes(requested)) matchedKey = 'cyberpunk';
      else if (['matrix', 'green'].includes(requested)) matchedKey = 'matrix';
      else if (['amber', 'orange', 'gold'].includes(requested)) matchedKey = 'amber';
      else if (['dracula', 'purple'].includes(requested)) matchedKey = 'dracula';
      else if (['solarized', 'solarized-dark', 'solarizeddark'].includes(requested)) matchedKey = 'solarizedDark';

      if (matchedKey && THEMES[matchedKey]) {
        setUserThemeKey(matchedKey);
        persistTerminalConfig({ theme: matchedKey });
        newHistory.push({ type: 'sys', text: `Theme switched to "${THEMES[matchedKey].name}".` });
      } else {
        newHistory.push({
          type: 'err',
          text: `Unknown theme "${requested}". Available: white, cyberpunk, matrix, amber, dracula, solarized`
        });
      }
    } else if (lower.startsWith('open ')) {
      const target = lower.slice(5).trim();
      const parsed = parseInt(target, 10);
      let match = null;
      if (!isNaN(parsed)) {
        match = filteredLinks[parsed - 1];
      } else {
        match = links.find((l) => (l.title || l.label || '').toLowerCase().includes(target));
      }

      if (match) {
        launchService(match);
        setInputVal('');
        return;
      } else {
        newHistory.push({ type: 'err', text: `Service not found matching "${target}"` });
      }
    } else {
      setActiveFilter(rawCmd);
      newHistory.push({ type: 'sys', text: `Filter applied: "${rawCmd}" (${filteredLinks.length} matches)` });
    }

    setHistory(newHistory);
    setInputVal('');
    setTimeout(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputVal === '') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, filteredLinks.length - 1)));
      } else {
        if (cmdHistory.length > 0) {
          const nextIdx = cmdHistIdx === -1 ? cmdHistory.length - 1 : Math.max(0, cmdHistIdx - 1);
          setCmdHistIdx(nextIdx);
          setInputVal(cmdHistory[nextIdx]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (inputVal === '') {
        setSelectedIndex((prev) => (prev < filteredLinks.length - 1 ? prev + 1 : 0));
      } else {
        if (cmdHistory.length > 0 && cmdHistIdx !== -1) {
          const nextIdx = cmdHistIdx + 1;
          if (nextIdx >= cmdHistory.length) {
            setCmdHistIdx(-1);
            setInputVal('');
          } else {
            setCmdHistIdx(nextIdx);
            setInputVal(cmdHistory[nextIdx]);
          }
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal.toLowerCase().trim();
      const commands = ['help', 'clear', 'list', 'status', 'top', 'ps', 'neofetch', 'theme', 'crt', 'open', 'adjust', 'fullscreen', 'set'];
      const serviceNames = links.map((l) => (l.title || l.label || '').toLowerCase());

      const matchCmd = commands.find((c) => c.startsWith(current) && c !== current);
      if (matchCmd) {
        setInputVal(matchCmd + ' ');
        return;
      }

      if (current.startsWith('open ')) {
        const prefix = 'open ';
        const query = current.slice(prefix.length).trim();
        const matchSvc = serviceNames.find((s) => s.startsWith(query));
        if (matchSvc) {
          setInputVal(prefix + matchSvc);
          return;
        }
      }
    } else if (e.key === 'Escape') {
      setInputVal('');
      setActiveFilter('');
      setShowAdjustPanel(false);
    }
  };

  const getHistoryColor = (type) => {
    if (type === 'cmd') return activeTheme.primary;
    if (type === 'err') return '#ef4444';
    if (type === 'hint') return activeTheme.success;
    if (type === 'raw') return activeTheme.textSecondary;
    return activeTheme.textMuted;
  };

  // Dimensions
  const containerMaxWidth = widthMode === 'full' ? '100%' : (widthMode === 'wide' ? '1560px' : '1280px');
  const containerPadding = widthMode === 'full' ? '6px 8px' : '16px 20px';

  // Responsive column template
  const gridColumns = showExec
    ? '95px minmax(160px, 1.4fr) 100px minmax(180px, 2fr) 85px'
    : '95px minmax(160px, 1.4fr) 100px 1fr';

  // Dynamic hostname & window title based on banner text
  const hostSlug = useMemo(() => {
    const raw = (bannerText && bannerText.trim().length > 0) ? bannerText.trim() : (settings.title || 'kv-home');
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'kv-home';
  }, [bannerText, settings.title]);

  const windowTitle = `root@${hostSlug}: ~ (bash)`;
  const promptText = settings.terminal?.prompt || `root@${hostSlug}:~$`;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        maxWidth: containerMaxWidth,
        margin: '0 auto',
        padding: containerPadding,
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: "'IBM Plex Mono', 'SF Mono', 'Courier New', monospace",
        position: 'relative',
        transition: 'max-width 0.25s ease, padding 0.25s ease',
      }}
    >
      <style>{`
        @keyframes termBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .term-cursor {
          display: inline-block;
          animation: termBlink 1s step-end infinite;
        }
        .term-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .term-scroll::-webkit-scrollbar-track {
          background: ${activeTheme.isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)'};
        }
        .term-scroll::-webkit-scrollbar-thumb {
          background: ${activeTheme.border};
          border-radius: 3px;
        }
        .term-exec-btn:hover {
          filter: brightness(0.92);
          transform: translateY(-1px);
        }
      `}</style>

      {/* Terminal Window Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: widthMode === 'full' ? '0px' : '10px',
          background: activeTheme.bg,
          border: `1px solid ${activeTheme.border}`,
          boxShadow: activeTheme.glow !== 'none'
            ? `0 0 25px rgba(0, 0, 0, 0.7), ${activeTheme.glow}`
            : (activeTheme.isDark ? '0 12px 30px rgba(0, 0, 0, 0.25)' : '0 10px 28px rgba(0, 0, 0, 0.06)'),
          overflow: 'hidden',
          position: 'relative',
          resize: widthMode === 'full' ? 'none' : 'both',
          minWidth: '480px',
          minHeight: '360px',
          transition: 'background 0.2s ease, border-color 0.2s ease',
        }}
      >
        {/* Optional Retro CRT Scanlines Overlay */}
        {crtEnabled && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.22) 50%)',
              backgroundSize: '100% 3px',
              pointerEvents: 'none',
              zIndex: 10,
              opacity: 0.7,
            }}
          />
        )}

        {/* Authentic Terminal Title Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 14px',
            background: activeTheme.titleBar,
            borderBottom: `1px solid ${activeTheme.border}`,
            fontSize: '11px',
            color: activeTheme.textMuted,
            userSelect: 'none',
            flexShrink: 0,
            gap: '10px',
          }}
        >
          {/* Traffic Lights / Shell Prompt Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setHistory([]);
                setActiveFilter('');
                setInputVal('');
              }}
              style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f56', cursor: 'pointer' }}
              title="Clear terminal buffer & reset search filter"
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                cycleFontSize();
              }}
              style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e', cursor: 'pointer' }}
              title={`Cycle font size / density (Current: ${fontSize})`}
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#27c93f', cursor: 'pointer' }}
              title={`Toggle Fullscreen / Boxed (Current: ${widthMode})`}
            />
            <span style={{
              marginLeft: '6px',
              color: activeTheme.textPrimary,
              fontWeight: '600',
              letterSpacing: '0.4px',
            }}>
              {windowTitle}
            </span>
          </div>

          {/* Right Status Badges & Quick Adjust Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600',
              color: activeTheme.success,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeTheme.success }} />
              200 OK
            </span>
            <span style={{ color: activeTheme.textSecondary, fontWeight: '500' }}>
              UPTIME: 99.9%
            </span>

            {/* Quick Adjust Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAdjustPanel((prev) => !prev);
              }}
              style={{
                background: showAdjustPanel ? activeTheme.primary : activeTheme.tableHeaderBg,
                color: showAdjustPanel ? (activeTheme.isDark ? '#000' : '#fff') : activeTheme.primary,
                border: `1px solid ${activeTheme.border}`,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '700',
                fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
              title="Open Terminal Adjustments Panel"
            >
              <span>⚙</span>
              <span>ADJUST</span>
            </button>
          </div>
        </div>

        {/* Live Adjustment Drawer / Control Bar */}
        {showAdjustPanel && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '10px 14px',
              background: activeTheme.tableHeaderBg,
              borderBottom: `1px solid ${activeTheme.border}`,
              fontSize: '11px',
              color: activeTheme.text,
              zIndex: 15,
            }}
          >
            {/* Row 1: Banner Text & Font Styles */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: '700', color: activeTheme.primary, fontSize: '10px' }}>BANNER TEXT:</span>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => {
                  const val = e.target.value;
                  setBannerText(val);
                  setBannerCustom('');
                  persistTerminalConfig({ bannerText: val, bannerCustom: '' });
                }}
                placeholder="e.g. KV HOME"
                style={{
                  padding: '3px 8px',
                  borderRadius: '3px',
                  border: `1px solid ${activeTheme.border}`,
                  background: activeTheme.bg,
                  color: activeTheme.textPrimary,
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  minWidth: '120px',
                  maxWidth: '170px',
                }}
              />

              <span style={{ fontWeight: '700', color: activeTheme.primary, fontSize: '10px', marginLeft: '6px' }}>FONT:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {ASCII_FONTS.map((f) => {
                  const isCur = bannerFont === f.id && !bannerCustom;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        setBannerFont(f.id);
                        setBannerCustom('');
                        persistTerminalConfig({ bannerFont: f.id, bannerCustom: '' });
                      }}
                      style={{
                        background: isCur ? activeTheme.primary : 'transparent',
                        color: isCur ? (activeTheme.isDark ? '#000' : '#fff') : activeTheme.text,
                        border: `1px solid ${isCur ? activeTheme.primary : activeTheme.border}`,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontFamily: 'inherit',
                        fontWeight: isCur ? '700' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.1s ease',
                      }}
                      title={f.description}
                    >
                      {f.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  const nextGlow = !bannerGlow;
                  setBannerGlow(nextGlow);
                  persistTerminalConfig({ bannerGlow: nextGlow });
                }}
                style={{
                  background: bannerGlow ? activeTheme.execBg : 'transparent',
                  color: bannerGlow ? activeTheme.primary : activeTheme.textMuted,
                  border: `1px solid ${activeTheme.border}`,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
                title="Toggle Neon Glow on Banner"
              >
                Glow: {bannerGlow ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => {
                  const nextVal = !showBanner;
                  setShowBanner(nextVal);
                  persistTerminalConfig({ showBanner: nextVal });
                }}
                style={{
                  background: showBanner ? activeTheme.execBg : 'transparent',
                  color: showBanner ? activeTheme.primary : activeTheme.textMuted,
                  border: `1px solid ${activeTheme.border}`,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
                title="Toggle ASCII Banner"
              >
                Banner: {showBanner ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Row 2: Theme, Width, Font Size, and Admin Modal button */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: '700', color: activeTheme.primary, fontSize: '10px' }}>THEME:</span>
                {[
                  { id: 'white', label: 'White' },
                  { id: 'cyberpunk', label: 'Cyberpunk' },
                  { id: 'matrix', label: 'Matrix' },
                  { id: 'amber', label: 'Amber' },
                  { id: 'dracula', label: 'Dracula' },
                  { id: 'solarizedDark', label: 'Solarized' },
                ].map((t) => {
                  const isCur = activeThemeKey === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setUserThemeKey(t.id);
                        persistTerminalConfig({ theme: t.id });
                      }}
                      style={{
                        background: isCur ? activeTheme.primary : 'transparent',
                        color: isCur ? (activeTheme.isDark ? '#000' : '#fff') : activeTheme.text,
                        border: `1px solid ${isCur ? activeTheme.primary : activeTheme.border}`,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontFamily: 'inherit',
                        fontWeight: isCur ? '700' : '400',
                        cursor: 'pointer',
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}

                <span style={{ fontWeight: '700', color: activeTheme.primary, fontSize: '10px', marginLeft: '4px' }}>WIDTH:</span>
                {[
                  { id: 'boxed', label: 'Boxed' },
                  { id: 'wide', label: 'Wide' },
                  { id: 'full', label: 'Full' },
                ].map((w) => {
                  const isCur = widthMode === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        setWidthMode(w.id);
                        persistTerminalConfig({ width: w.id });
                      }}
                      style={{
                        background: isCur ? activeTheme.primary : 'transparent',
                        color: isCur ? (activeTheme.isDark ? '#000' : '#fff') : activeTheme.text,
                        border: `1px solid ${isCur ? activeTheme.primary : activeTheme.border}`,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontFamily: 'inherit',
                        fontWeight: isCur ? '700' : '400',
                        cursor: 'pointer',
                      }}
                    >
                      {w.label}
                    </button>
                  );
                })}

                <span style={{ fontWeight: '700', color: activeTheme.primary, fontSize: '10px', marginLeft: '4px' }}>FONT:</span>
                {['11px', '12px', '14px'].map((f) => {
                  const isCur = fontSize === f;
                  return (
                    <button
                      key={f}
                      onClick={() => {
                        setFontSize(f);
                        persistTerminalConfig({ fontSize: f });
                      }}
                      style={{
                        background: isCur ? activeTheme.primary : 'transparent',
                        color: isCur ? (activeTheme.isDark ? '#000' : '#fff') : activeTheme.text,
                        border: `1px solid ${isCur ? activeTheme.primary : activeTheme.border}`,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontFamily: 'inherit',
                        fontWeight: isCur ? '700' : '400',
                        cursor: 'pointer',
                      }}
                    >
                      {f}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    const nextVal = !showExec;
                    setShowExec(nextVal);
                    persistTerminalConfig({ showExec: nextVal });
                  }}
                  style={{
                    background: showExec ? activeTheme.execBg : 'transparent',
                    color: showExec ? activeTheme.primary : activeTheme.textMuted,
                    border: `1px solid ${activeTheme.border}`,
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                  title="Toggle EXEC Button Column"
                >
                  EXEC: {showExec ? 'ON' : 'OFF'}
                </button>
              </div>

              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  style={{
                    background: activeTheme.execBg,
                    color: activeTheme.primary,
                    border: `1px solid ${activeTheme.execBorder || activeTheme.border}`,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontFamily: 'inherit',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Open Full Admin Settings Modal"
                >
                  <span>⚙</span>
                  <span>MORE SETTINGS</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Terminal Console Area */}
        <div
          ref={tableContainerRef}
          className="term-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            color: activeTheme.text,
            fontSize: fontSize,
            lineHeight: '1.5',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* ASCII Banner */}
          {showBanner && (
            <pre
              style={{
                margin: 0,
                color: activeTheme.bannerColor || activeTheme.primary,
                fontSize: fontSize === '14px' ? '11px' : (fontSize === '11px' ? '9.5px' : '10.5px'),
                lineHeight: '1.15',
                fontWeight: 'bold',
                textShadow: (bannerGlow && activeTheme.glow !== 'none') ? activeTheme.glow : 'none',
                overflowX: 'auto',
                letterSpacing: '0px',
              }}
            >
              {renderedBanner}
            </pre>
          )}

          {/* Console Boot & Event History Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  color: getHistoryColor(h.type),
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: fontSize,
                }}
              >
                {h.text}
              </div>
            ))}
          </div>

          {/* Table Container */}
          <div style={{
            marginTop: '8px',
            border: `1px solid ${activeTheme.tableBorder}`,
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            {/* Table Column Headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: gridColumns,
                alignItems: 'center',
                padding: density === 'compact' ? '5px 10px' : (density === 'spacious' ? '9px 14px' : '7px 12px'),
                background: activeTheme.tableHeaderBg,
                color: activeTheme.primary,
                fontWeight: '700',
                fontSize: fontSize === '14px' ? '12px' : '11px',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                borderBottom: `1px solid ${activeTheme.tableBorder}`,
              }}
            >
              <span>STATUS</span>
              <span>SERVICE</span>
              <span>GROUP</span>
              <span>ENDPOINT</span>
              {showExec && <span style={{ textAlign: 'right' }}>RUN</span>}
            </div>

            {/* Table Rows */}
            <div>
              {filteredLinks.length === 0 ? (
                <div style={{ padding: '16px', color: activeTheme.textMuted, textAlign: 'center', fontStyle: 'italic' }}>
                  No daemon endpoints match query "{activeFilter}". Type "clear" or "list" to reset.
                </div>
              ) : (
                filteredLinks.map((item, idx) => {
                  const isSelected = safeSelectedIndex === idx;

                  return (
                    <div
                      key={item.id || item.label || idx}
                      onClick={() => {
                        setSelectedIndex(idx);
                        launchService(item);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: gridColumns,
                        alignItems: 'center',
                        padding: density === 'compact' ? '5px 10px' : (density === 'spacious' ? '10px 14px' : '7px 12px'),
                        borderBottom: `1px solid ${activeTheme.tableRowBorder}`,
                        background: isSelected ? activeTheme.selectedBg : 'transparent',
                        color: isSelected ? activeTheme.selectedText : activeTheme.text,
                        cursor: 'pointer',
                        transition: 'background 0.08s ease',
                        userSelect: 'none',
                      }}
                    >
                      {/* Status Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: activeTheme.success,
                          boxShadow: activeTheme.isDark ? `0 0 6px ${activeTheme.success}` : 'none',
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '700',
                          color: isSelected ? activeTheme.selectedText : activeTheme.success,
                          letterSpacing: '0.4px',
                        }}>
                          ONLINE
                        </span>
                      </div>

                      {/* Service Name & Subtitle Stacked */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden', paddingRight: '8px' }}>
                        <span style={{
                          fontWeight: '700',
                          color: isSelected ? activeTheme.selectedText : activeTheme.textPrimary,
                          fontSize: fontSize === '14px' ? '13px' : '12px',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}>
                          {item.title || item.label}
                        </span>
                        {item.subtitle && (
                          <span style={{
                            fontSize: '10px',
                            color: isSelected ? activeTheme.selectedText : activeTheme.textSecondary,
                            opacity: isSelected ? 0.9 : 0.8,
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}>
                            {item.subtitle}
                          </span>
                        )}
                      </div>

                      {/* Daemon Group Badge */}
                      <div>
                        <span style={{
                          fontSize: '10px',
                          color: isSelected ? activeTheme.selectedText : activeTheme.secondary,
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                        }}>
                          [{item.group ? item.group.toUpperCase() : 'TOOLS'}]
                        </span>
                      </div>

                      {/* Endpoint URL */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                        paddingRight: '8px',
                      }}>
                        <span style={{
                          fontSize: fontSize === '14px' ? '12px' : '11px',
                          color: isSelected ? activeTheme.selectedText : activeTheme.textSecondary,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.link}
                        </span>
                      </div>

                      {/* RUN / EXEC Button */}
                      {showExec && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="term-exec-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              launchService(item);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '3px',
                              border: `1px solid ${activeTheme.execBorder || activeTheme.border}`,
                              background: isSelected ? activeTheme.titleBar : (activeTheme.execBg || 'transparent'),
                              color: isSelected ? activeTheme.primary : (activeTheme.execText || activeTheme.primary),
                              fontSize: '10px',
                              fontWeight: '700',
                              fontFamily: 'inherit',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            }}
                            title={`Execute ${item.title || item.label}`}
                          >
                            <span>↗</span>
                            <span>EXEC</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div ref={terminalEndRef} />
        </div>

        {/* Command Prompt Form */}
        <form
          onSubmit={handleCommandSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 16px',
            background: activeTheme.titleBar,
            borderTop: `1px solid ${activeTheme.border}`,
            position: 'relative',
            flexShrink: 0,
            gap: '8px',
          }}
        >
          {/* Shell Prompt Prefix */}
          <span style={{
            color: activeTheme.primary,
            fontWeight: '700',
            fontSize: fontSize,
            letterSpacing: '0.4px',
            userSelect: 'none',
            flexShrink: 0,
          }}>
            {promptText}
          </span>

          {/* Genuine Terminal Input Field */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type command or search filter (e.g. docker, help, clear)..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: activeTheme.textPrimary,
                fontSize: fontSize,
                fontFamily: 'inherit',
                fontWeight: '500',
                padding: 0,
              }}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          {/* Enter Button Badge */}
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              fontWeight: '600',
              color: activeTheme.primary,
              background: activeTheme.tableHeaderBg,
              padding: '3px 8px',
              borderRadius: '3px',
              border: `1px solid ${activeTheme.tableBorder}`,
              cursor: 'pointer',
              userSelect: 'none',
            }}
            title="Submit command or launch selected endpoint"
          >
            <span>↵</span>
            <span>Enter</span>
          </button>
        </form>
      </div>
    </div>
  );
}
