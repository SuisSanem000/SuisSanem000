# Minimal Express API

## Build from scratch
```bash
mkdir my-api && cd my-api
npm init -y
npm install express
```

Then create `index.js`:
```js
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/items', (req, res) => res.json(items));
app.post('/api/items', (req, res) => { /* ... */ });
app.delete('/api/items/:id', (req, res) => { /* ... */ });

app.listen(3000);
```

## Run
```bash
node index.js
# Test: curl http://localhost:3000/api/items
```
