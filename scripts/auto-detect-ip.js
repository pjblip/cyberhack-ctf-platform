/**
 * auto-detect-ip.js
 * Detects the best LAN IP for sharing with students.
 * Prefers the real Wi-Fi adapter, skips VMware/Docker/WSL virtual adapters.
 * Usage: node auto-detect-ip.js
 */

import { networkInterfaces } from 'os';

const VIRTUAL_ADAPTER_KEYWORDS = [
  'vmware', 'vmnet', 'vbox', 'hyper-v', 'wsl', 'docker',
  'loopback', 'pseudo', 'teredo', 'isatap', 'tap',
];

const PREFERRED_ADAPTER_KEYWORDS = [
  'wi-fi', 'wifi', 'wireless', 'wlan', 'wlp',
];

function isVirtual(name) {
  const lower = name.toLowerCase();
  return VIRTUAL_ADAPTER_KEYWORDS.some((kw) => lower.includes(kw));
}

function isPreferred(name) {
  const lower = name.toLowerCase();
  return PREFERRED_ADAPTER_KEYWORDS.some((kw) => lower.includes(kw));
}

function isLinkLocal(addr) {
  return addr.startsWith('169.254.');
}

function detectBestIP() {
  const ifaces = networkInterfaces();
  let preferred = null;
  let fallback = null;

  for (const [name, addrs] of Object.entries(ifaces)) {
    if (!addrs) continue;
    if (isVirtual(name)) continue;

    for (const iface of addrs) {
      if (iface.family !== 'IPv4') continue;
      if (iface.internal) continue;
      if (isLinkLocal(iface.address)) continue;

      if (isPreferred(name)) {
        preferred = { ip: iface.address, adapter: name };
        break;
      }

      if (!fallback) {
        fallback = { ip: iface.address, adapter: name };
      }
    }

    if (preferred) break;
  }

  return preferred || fallback || { ip: '127.0.0.1', adapter: 'loopback (no LAN found)' };
}

const result = detectBestIP();

console.log('');
console.log('===========================================');
console.log('  CyberHack CTF — Network IP Detector');
console.log('===========================================');
console.log(`  Adapter : ${result.adapter}`);
console.log(`  LAN IP  : ${result.ip}`);
console.log('');
console.log(`  Frontend : http://${result.ip}:3002`);
console.log(`  Backend  : http://${result.ip}:3001`);
console.log('');
console.log('  Share the Frontend URL with students!');
console.log('===========================================');
console.log('');
