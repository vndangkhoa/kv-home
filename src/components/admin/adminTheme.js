export const PRESET_COLORS = [
  '#00BCD4', '#FF9800', '#2196F3', '#FF5722', 
  '#9C27B0', '#4CAF50', '#FFC107', '#E91E63', 
  '#673AB7', '#795548', '#607D8B', '#3F51B5',
  '#009688', '#E65100', '#1E88E5', '#8E24AA',
  '#00E676', '#FFD600', '#FF1744', '#00B0FF'
];

export function getAdminThemeTokens(isDark) {
  return {
    bg: isDark ? '#141414' : '#ffffff',
    cardBg: isDark ? '#1c1c1c' : '#fcfcfc',
    cardBorder: isDark ? '#2a2a2a' : '#e5e5e5',
    text: isDark ? '#ededed' : '#111111',
    subText: isDark ? '#888888' : '#666666',
    border: isDark ? '#2e2e2e' : '#e0e0e0',
    inputBg: isDark ? '#101010' : '#ffffff',
    inputBorder: isDark ? '#333333' : '#d1d1d1',
    badgeBg: isDark ? '#242424' : '#f0f0f0',
  };
}
