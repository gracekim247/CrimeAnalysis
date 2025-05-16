const path = require('path');
const http      = require('http');
const fs        = require('fs');
const httpProxy = require('http-proxy');

const API_TARGET = 'http://localhost:8080';
const PUBLIC_DIR = path.join(__dirname, 'public');

const proxy = httpProxy.createProxyServer({ target: API_TARGET, changeOrigin: true });

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(502, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Proxy error', details: err.message }));
});

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) {
      return proxy.web(req, res);
    } else {
      let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          return res.end('Not Found');
        }
        let ext = path.extname(filePath).slice(1);
        res.writeHead(200, { 'Content-Type': { html:'text/html',js:'text/javascript',css:'text/css'}[ext] || 'text/plain' });
        res.end(data);
      });
    }
});
  
server.listen(3000, () => {
    console.log('Proxy + static file server listening on http://localhost:3000');
});