const http = require('http');

const PORT = 3000;

// In-memory data store
const items = [
  { id: 1, name: 'Item One' },
  { id: 2, name: 'Item Two' },
];

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Simple router
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Hello from pure Node.js!' }));
  } else if (req.method === 'GET' && req.url === '/api/items') {
    res.writeHead(200);
    res.end(JSON.stringify(items));
  } else if (req.method === 'POST' && req.url === '/api/items') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const newItem = JSON.parse(body);
      newItem.id = items.length + 1;
      items.push(newItem);
      res.writeHead(201);
      res.end(JSON.stringify(newItem));
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Node.js server running at http://localhost:${PORT}`);
});
