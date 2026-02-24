# Minimal Node.js Server

**Zero dependencies.** Pure Node.js HTTP server.

## Build from scratch
```bash
mkdir my-app && cd my-app
npm init -y
```

Then create `index.js`:
```js
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello!' }));
});
server.listen(3000, () => console.log('Running on :3000'));
```

## Run
```bash
node index.js
```
