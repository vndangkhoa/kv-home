import React from 'react';

/**
 * High-quality vector SVG logos for popular homelab services.
 */
export const SERVICE_ICONS = {
  portainer: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12.5 3.5c-.3 0-.6.2-.7.5l-1.3 3.5H7.5c-.3 0-.6.2-.7.5l-1.3 3.5H2c-.3 0-.5.2-.5.5v7.5c0 1.1.9 2 2 2h17c1.1 0 2-.9 2-2v-7.5c0-.3-.2-.5-.5-.5h-3.5l-1.3-3.5c-.1-.3-.4-.5-.7-.5h-3.5l-1.3-3.5c-.1-.3-.4-.5-.7-.5h-.7zm-1.8 5.5h2.6l.7 2h-4l.7-2zm-5 4h2.6l.7 2H5l.7-2zm10 0h2.6l.7 2H15l.7-2zm-5 0h2.6l.7 2h-4l.7-2zm-7.2 4h3.5v2H3.5v-2zm5.5 0h3.5v2H9v-2zm5.5 0h3.5v2h-3.5v-2zm5.5 0h1.5v2H20v-2z"/>
    </svg>
  ),

  jellyfin: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="url(#jellyfin-grad)" {...props}>
      <defs>
        <linearGradient id="jellyfin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A4DC" />
          <stop offset="100%" stopColor="#AA5CC3" />
        </linearGradient>
      </defs>
      <path d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12c0 2.2.75 4.2 2 5.85L12 7.7l7.5 10.15c1.25-1.65 2-3.65 2-5.85 0-5.25-4.25-9.5-9.5-9.5zm-5.7 16.5c1.6 1.55 3.75 2.5 6.1 2.5 1.95 0 3.75-.65 5.2-1.75l-5.6-7.55-5.7 6.8z"/>
    </svg>
  ),

  grafana: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z"/>
    </svg>
  ),

  homeassistant: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12 2.1L2 10.8V21c0 .55.45 1 1 1h6.5c.55 0 1-.45 1-1v-5.5c0-.28.22-.5.5-.5h2c.28 0 .5.22.5.5V21c0 .55.45 1 1 1H21c.55 0 1-.45 1-1V10.8L12 2.1zm0 2.7l7.5 6.5V20h-3.5v-4.5c0-.83-.67-1.5-1.5-1.5h-5c-.83 0-1.5.67-1.5 1.5V20H4.5V11.3L12 4.8z"/>
      <circle cx="12" cy="11.5" r="1.5" fill="currentColor"/>
    </svg>
  ),

  nextcloud: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12 6.5a5.5 5.5 0 0 0-5.46 4.82A4 4 0 0 0 3 15a4 4 0 0 0 4 4c.32 0 .63-.04.93-.11A5.5 5.5 0 0 0 12 21a5.5 5.5 0 0 0 4.07-2.11c.3.07.61.11.93.11a4 4 0 0 0 4-4 4 4 0 0 0-3.54-3.68A5.5 5.5 0 0 0 12 6.5zm0 2a3.5 3.5 0 0 1 3.46 3H15a4 4 0 0 0-3-1.35 4 4 0 0 0-3 1.35h-.46A3.5 3.5 0 0 1 12 8.5zm-5 4.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm10 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-5 1a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
    </svg>
  ),

  vaultwarden: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 3.99-2.58 7.74-6 8.8-3.42-1.06-6-4.81-6-8.8V6.43l6-2.25zm0 3.82a3 3 0 0 0-3 3c0 1.3.84 2.4 2 2.82V16a1 1 0 0 0 2 0v-2.18c1.16-.42 2-1.52 2-2.82a3 3 0 0 0-3-3zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
    </svg>
  ),

  kuma: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M7 11h2l2-4 3 8 2-4h2" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  ),

  adguard: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm-1 16l-4-4 1.41-1.41L11 15.17l6.59-6.59L19 10l-8 8z"/>
    </svg>
  ),

  immich: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  ),

  nginx: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12 2L2.5 7.5v9L12 22l9.5-5.5v-9L12 2zm6.5 13.3l-1.9 1.1L12 9.7v6.8H9.5V7.5h2l4.6 6.7V7.5h2.4v7.8z"/>
    </svg>
  ),

  audiobookshelf: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm12 16H6v-2h12v2zm0-4H6V4h3v6.5l2.5-1.5L14 10.5V4h4v12z"/>
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    </svg>
  ),

  qbittorrent: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5v-4h2.5L12 8l-3.5 4.5H11v4h2z"/>
      <path d="M7 17h10v1.5H7z"/>
    </svg>
  ),

  docker: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M13 10.5h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm6-3h2v2h-2zm-3 0h2v2h-2zm6 0h2v2h-2zm-9 0h2v2H7zm15.7 4.7c-.3-.2-1.3-.8-2.7-.4-.2-.5-.5-.9-.9-1.3l-.5.3c-.7.5-.9 1.4-.9 1.9-.9.5-2.1.3-2.7.1l-.2 1c1.5.5 3.3.4 4.5-.4.4.6 1.1 1.2 2 1.4.9.2 1.9 0 2.3-.3.2-.2.2-.4.1-.6-.2-.2-.6-.5-1-.7zM2 13.5c.3 3.6 3.1 6.5 6.7 6.5 5.5 0 9.8-3.4 11-8.5H1.9c0 .7.1 1.3.1 2z"/>
    </svg>
  ),

  plex: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12 2L3 12l9 10 9-10L12 2zm0 3.8l6.2 6.2-6.2 6.2L5.8 12 12 5.8z"/>
    </svg>
  ),

  proxmox: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2l7 3.9v7.8l-7 3.9-7-3.9V8.1l7-3.9z"/>
      <path d="M12 6.5L6.5 9.5v5l5.5 3 5.5-3v-5L12 6.5z"/>
    </svg>
  ),

  tailscale: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <circle cx="6" cy="6" r="2.5"/>
      <circle cx="12" cy="12" r="2.5"/>
      <circle cx="18" cy="18" r="2.5"/>
      <circle cx="18" cy="6" r="2.5" opacity="0.4"/>
      <circle cx="6" cy="18" r="2.5" opacity="0.4"/>
    </svg>
  ),

  wireguard: (props) => (
    <svg viewBox="0 0 24 24" width={props.size || 24} height={props.size || 24} fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V15c-2.21 0-4-1.79-4-4s1.79-4 4-4v-1.93c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93z"/>
    </svg>
  )
};

/**
 * Resolves a vector icon component for a given service link item.
 */
export function getServiceIcon(item) {
  if (!item) return null;
  const key = `${item.label || ''} ${item.title || ''} ${item.link || ''} ${item.subtitle || ''}`.toLowerCase();

  if (key.includes('portainer') || key.includes('docker stack')) return SERVICE_ICONS.portainer;
  if (key.includes('jellyfin')) return SERVICE_ICONS.jellyfin;
  if (key.includes('grafana')) return SERVICE_ICONS.grafana;
  if (key.includes('home assistant') || key.includes('hass') || key.includes('homeassistant')) return SERVICE_ICONS.homeassistant;
  if (key.includes('nextcloud')) return SERVICE_ICONS.nextcloud;
  if (key.includes('vaultwarden') || key.includes('bitwarden')) return SERVICE_ICONS.vaultwarden;
  if (key.includes('kuma') || key.includes('uptime')) return SERVICE_ICONS.kuma;
  if (key.includes('adguard')) return SERVICE_ICONS.adguard;
  if (key.includes('immich')) return SERVICE_ICONS.immich;
  if (key.includes('nginx') || key.includes('npm')) return SERVICE_ICONS.nginx;
  if (key.includes('audiobook')) return SERVICE_ICONS.audiobookshelf;
  if (key.includes('torrent') || key.includes('qbittorrent')) return SERVICE_ICONS.qbittorrent;
  if (key.includes('plex')) return SERVICE_ICONS.plex;
  if (key.includes('proxmox')) return SERVICE_ICONS.proxmox;
  if (key.includes('tailscale')) return SERVICE_ICONS.tailscale;
  if (key.includes('wireguard')) return SERVICE_ICONS.wireguard;
  if (key.includes('docker')) return SERVICE_ICONS.docker;

  return null;
}
