// test-simple-server.js
// Bare-minimum Node.js server to test if Windows networking works at all.
// If http://<LAN-IP>:9999 loads from another device but Vite doesn't work,
// then the issue is Vite-specific. If this ALSO fails, it's Windows networking.
// Usage: node test-simple-server.js

import { createServer } from 'http';
import { networkInterfaces } from 'os';

const PORT = 9999;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head><title>Network Test OK</title></head>
    <body style="font-family:sans-serif;text-align:center;padding:40px;background:#0a0a0a;color:#00ff00;">
      <h1>✅ Network is Working!</h1>
      <p>If you can see this from another device, basic Windows networking is fine.</p>
      <p>The issue is specific to Vite or the backend, not the network stack.</p>
      <p style="color:#888;">Requested: ${req.url} | Time: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  const nets = networkInterfaces();
  console.log('\n=== Simple Network Test Server ===');
  console.log(`Listening on port ${PORT} (all interfaces)\n`);
  console.log('Test URLs:');
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://127.0.0.1:${PORT}`);
  for (const [name, addrs] of Object.entries(nets)) {
    if (!addrs) continue;
    for (const iface of addrs) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`  http://${iface.address}:${PORT}  ← share this with students`);
      }
    }
  }
  console.log('\nIf a LAN URL above works from another device → networking is fine');
  console.log('If it FAILS → Windows networking / router AP isolation issue');
  console.log('\nPress Ctrl+C to stop.\n');
});
