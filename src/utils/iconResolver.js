// src/utils/iconResolver.js
// Resolves official SVG icons for homelab services with automatic fallback via WalkxCode dashboard-icons CDN

export const ICON_MAP = {
  // Container & Cluster Management
  portainer: 'portainer',
  dockge: 'dockge',
  docker: 'docker',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  k3s: 'k3s',
  rancher: 'rancher',
  dozzle: 'dozzle',
  cockpit: 'cockpit',

  // Media Streaming & Management
  jellyfin: 'jellyfin',
  plex: 'plex',
  emby: 'emby',
  kodi: 'kodi',
  stremio: 'stremio',
  tautulli: 'tautulli',
  audiobookshelf: 'audiobookshelf',
  audiobooks: 'audiobookshelf',
  navidrome: 'navidrome',
  airsonic: 'airsonic',
  subsonic: 'subsonic',
  youtube: 'youtube',
  tubearchivist: 'tubearchivist',
  invidious: 'invidious',
  piped: 'piped',
  metube: 'metube',

  // *Arr Stack & Downloaders
  qbittorrent: 'qbittorrent',
  transmission: 'transmission',
  deluge: 'deluge',
  rutorrent: 'rutorrent',
  aria2: 'aria2',
  sabnzbd: 'sabnzbd',
  nzbget: 'nzbget',
  radarr: 'radarr',
  sonarr: 'sonarr',
  lidarr: 'lidarr',
  readarr: 'readarr',
  bazarr: 'bazarr',
  prowlarr: 'prowlarr',
  overseerr: 'overseerr',
  jellyseerr: 'jellyseerr',
  jackett: 'jackett',
  flaresolverr: 'flaresolverr',

  // Smart Home & IoT
  homeassistant: 'home-assistant',
  hass: 'home-assistant',
  'home assistant': 'home-assistant',
  esphome: 'esphome',
  zigbee2mqtt: 'zigbee2mqtt',
  z2m: 'zigbee2mqtt',
  nodered: 'node-red',
  'node-red': 'node-red',
  mosquitto: 'mosquitto',
  mqtt: 'mosquitto',
  wled: 'wled',
  scrypted: 'scrypted',
  frigate: 'frigate',
  octoprint: 'octoprint',
  klipper: 'klipper',
  mainsail: 'mainsail',
  fluidd: 'fluidd',
  bambulab: 'bambulab',

  // Networking, DNS & Firewalls
  pihole: 'pi-hole',
  'pi-hole': 'pi-hole',
  adguard: 'adguard-home',
  adguardhome: 'adguard-home',
  'adguard home': 'adguard-home',
  agh: 'adguard-home',
  technitium: 'technitium',
  pfsense: 'pfsense',
  opnsense: 'opnsense',
  openwrt: 'openwrt',
  mikrotik: 'mikrotik',
  ubiquiti: 'ubiquiti',
  unifi: 'ubiquiti',
  omada: 'tp-link',
  cloudflare: 'cloudflare',
  cloudflared: 'cloudflare',

  // Reverse Proxies & Gateways
  nginx: 'nginx-proxy-manager',
  'nginx proxy': 'nginx-proxy-manager',
  'nginx proxy manager': 'nginx-proxy-manager',
  npm: 'nginx-proxy-manager',
  traefik: 'traefik',
  caddy: 'caddy',
  haproxy: 'haproxy',

  // VPN & Remote Access
  tailscale: 'tailscale',
  wireguard: 'wireguard',
  zerotier: 'zerotier',
  openvpn: 'openvpn',
  headscale: 'headscale',
  twingate: 'twingate',
  rustdesk: 'rustdesk',
  meshcentral: 'meshcentral',
  guacamole: 'apache-guacamole',

  // Security, Identity & Password Management
  vaultwarden: 'vaultwarden',
  bitwarden: 'bitwarden',
  keepassxc: 'keepassxc',
  keepass: 'keepassxc',
  passbolt: 'passbolt',
  authentik: 'authentik',
  authelia: 'authelia',
  keycloak: 'keycloak',

  // Storage, OS & Virtualization
  truenas: 'truenas',
  freenas: 'truenas',
  unraid: 'unraid',
  proxmox: 'proxmox',
  pve: 'proxmox',
  synology: 'synology',
  dsm: 'synology',
  qnap: 'qnap',
  vmware: 'vmware',
  esxi: 'vmware',
  openmediavault: 'openmediavault',
  omv: 'openmediavault',

  // Cloud, Photos & Files
  nextcloud: 'nextcloud',
  owncloud: 'owncloud',
  seafile: 'seafile',
  filebrowser: 'filebrowser',
  syncthing: 'syncthing',
  immich: 'immich',
  photoprism: 'photoprism',
  piwigo: 'piwigo',
  duplicati: 'duplicati',
  kopia: 'kopia',
  restic: 'restic',

  // Documents, Books & Productivity
  paperless: 'paperless-ngx',
  'paperless-ngx': 'paperless-ngx',
  stirling: 'stirling-pdf',
  'stirling-pdf': 'stirling-pdf',
  'it-tools': 'it-tools',
  ittools: 'it-tools',
  calibre: 'calibre-web',
  'calibre-web': 'calibre-web',
  kavita: 'kavita',
  komga: 'komga',
  mealie: 'mealie',
  tandoor: 'tandoor',
  grocy: 'grocy',
  actual: 'actual-budget',
  'actual-budget': 'actual-budget',
  firefly: 'firefly-iii',
  'firefly-iii': 'firefly-iii',
  freshrss: 'freshrss',
  obsidian: 'obsidian',
  wikijs: 'wikijs',
  bookstack: 'bookstack',

  // Monitoring, Metrics & Status
  uptimekuma: 'uptime-kuma',
  kuma: 'uptime-kuma',
  'uptime kuma': 'uptime-kuma',
  'uptime-kuma': 'uptime-kuma',
  grafana: 'grafana',
  prometheus: 'prometheus',
  netdata: 'netdata',
  zabbix: 'zabbix',
  scrutiny: 'scrutiny',
  glances: 'glances',
  speedtest: 'speedtest',
  librespeed: 'librespeed',

  // Development, Git & Automation
  vscode: 'visual-studio-code',
  'code-server': 'visual-studio-code',
  github: 'github',
  gitlab: 'gitlab',
  gitea: 'gitea',
  forgejo: 'forgejo',
  jenkins: 'jenkins',
  n8n: 'n8n',

  // AI & LLM Tools
  ollama: 'ollama',
  openwebui: 'open-webui',
  'open-webui': 'open-webui',
  chatgpt: 'openai',
  openai: 'openai',

  // Homelab Dashboards
  homepage: 'homepage',
  dashy: 'dashy',
  homarr: 'homarr',
  heimdall: 'heimdall',
  flame: 'flame',
  glance: 'glance',
};

export const CDN_BASE = 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg';

/**
 * Returns the resolved WalkxCode slug for a service item, 'custom' for explicit URLs, or null if unmapped.
 * @param {Object} item Link object { label, title, iconUrl, logoUrl, link }
 * @returns {string|null}
 */
export function getIconSlug(item) {
  if (!item) return null;
  if (item.iconUrl && typeof item.iconUrl === 'string') return 'custom';
  if (item.logoUrl && typeof item.logoUrl === 'string') return 'custom';
  if (item.iconSlug && typeof item.iconSlug === 'string') return item.iconSlug.trim().toLowerCase();

  const labelKey = (item.label || '').toLowerCase().trim();
  if (ICON_MAP[labelKey]) return ICON_MAP[labelKey];

  const titleKey = (item.title || '').toLowerCase().trim();
  if (ICON_MAP[titleKey]) return ICON_MAP[titleKey];

  // Fuzzy match in label or title
  for (const [key, slug] of Object.entries(ICON_MAP)) {
    if (labelKey.includes(key) || titleKey.includes(key)) {
      return slug;
    }
  }

  // Domain matching from URL
  if (item.link) {
    try {
      const hostname = new URL(item.link).hostname.toLowerCase();
      for (const [key, slug] of Object.entries(ICON_MAP)) {
        if (hostname.includes(key)) {
          return slug;
        }
      }
    } catch {
      // ignore invalid URLs
    }
  }

  // Clean slug fallback if label looks like a single slug identifier (alphanumeric + dashes)
  if (labelKey && /^[a-z0-9-]+$/.test(labelKey) && labelKey.length >= 3) {
    return labelKey;
  }

  return null;
}

/**
 * Returns the CDN URL or custom URL for a service's official SVG icon, or null if unmapped.
 * @param {Object} item Link object { label, title, iconUrl, logoUrl, link }
 * @returns {string|null}
 */
export function getServiceIconUrl(item) {
  if (!item) return null;

  // 1. Explicit user-provided icon/logo URL
  if (item.iconUrl && typeof item.iconUrl === 'string') return item.iconUrl;
  if (item.logoUrl && typeof item.logoUrl === 'string') return item.logoUrl;

  // 2. Resolve via slug mapping
  const slug = getIconSlug(item);
  if (slug && slug !== 'custom') {
    return `${CDN_BASE}/${slug}.svg`;
  }

  return null;
}
