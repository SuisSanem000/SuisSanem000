# Live Coding Interview Cheat Sheet

Quick reference for everything in these sample projects. Skim before your interview.

---

## 1. Scaffold Commands (memorize these)

```bash
# Node.js (zero deps)
mkdir app && cd app && npm init -y

# React
npx create-vite@latest my-app --template react
cd my-app && npm install && npm run dev

# Express
mkdir app && cd app && npm init -y && npm install express

# Full-stack
mkdir app && cd app && npm init -y && npm i -D concurrently
mkdir -p server/src client/src
# install express+cors in server, react+vite in client
```

---

## 2. Pure Node.js Server (no Express)

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello!' }));
});

server.listen(3000, () => console.log('Running on :3000'));
```

**Key points:**
- `http` is a built-in module — zero dependencies
- `req.method` and `req.url` for manual routing
- `req.on('data')` + `req.on('end')` to read POST body
- This is what Express abstracts away

---

## 3. Express API

```js
const express = require('express');
const app = express();

app.use(express.json());  // middleware to parse JSON body

let items = [{ id: 1, name: 'Item One' }];
let nextId = 2;

app.get('/api/items', (req, res) => res.json(items));

app.post('/api/items', (req, res) => {
  const item = { id: nextId++, name: req.body.name };
  items.push(item);
  res.status(201).json(item);
});

app.delete('/api/items/:id', (req, res) => {
  items = items.filter(i => i.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.listen(3000);
```

**Key points:**
- `express.json()` — parses `Content-Type: application/json`
- `req.params.id` — route parameters (`:id`)
- `req.body` — parsed JSON body
- `req.query` — query string params (`?key=value`)
- Status codes: `200` ok, `201` created, `204` no content, `400` bad request, `404` not found

---

## 4. React Essentials

```jsx
import { useState, useEffect } from 'react';

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');

  // Fetch on mount (empty dependency array = runs once)
  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(setItems);
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    setItems([...items, await res.json()]);
    setName('');
  };

  return (
    <div>
      <form onSubmit={addItem}>
        <input value={name} onChange={e => setName(e.target.value)} />
        <button>Add</button>
      </form>
      <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
    </div>
  );
}
```

**Key points:**
- `useState` — state management: `const [val, setVal] = useState(initial)`
- `useEffect(() => {}, [])` — empty `[]` = runs once on mount
- `key={i.id}` — always give list items a unique key
- `e.preventDefault()` — prevent form page reload
- Controlled inputs: `value={name}` + `onChange`
- Spread to update state immutably: `[...items, newItem]`

---

## 5. Connecting React + Express (Full-Stack)

### Vite proxy (dev only)
```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:4000' }
  }
});
```
- Frontend calls `/api/items` → Vite forwards to `localhost:4000`
- No CORS issues in dev
- In production: serve React build from Express or use Nginx

### CORS (if no proxy)
```js
const cors = require('cors');
app.use(cors());  // allows all origins
```

### Folder structure
```
root/
├── client/         # React (Vite) — port 5173
├── server/         # Express API — port 4000
└── package.json    # concurrently runs both
```

---

## 6. Common Patterns They Might Ask

### Error handling middleware (Express)
```js
// Must have exactly 4 params — that's how Express knows it's an error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

### Express Router (modular routes)
```js
// routes/items.js
const router = express.Router();
router.get('/', (req, res) => res.json(items));
module.exports = router;

// index.js
app.use('/api/items', require('./routes/items'));
```

### Custom hook (React)
```jsx
function useItems() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(setItems);
  }, []);
  return { items, setItems };
}
```

### Async/Await with try/catch
```js
try {
  const res = await fetch('/api/items');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
} catch (err) {
  console.error('Failed:', err.message);
}
```

---

## 7. Quick Tips

| Topic | Remember |
|-------|----------|
| `npm init -y` | `-y` skips all prompts |
| `node --watch` | Auto-restart on save (Node 18+), no nodemon needed |
| `npx` | Runs package without installing globally |
| Vite vs CRA | Vite is faster, uses ESBuild. CRA is deprecated since 2023 |
| `ReactDOM.createRoot()` | React 18+ API (not `ReactDOM.render()`) |
| `express.json()` | Must add this to read `req.body` |
| `parseInt(req.params.id)` | Params are always strings — parse to number |
| `res.status(201).json(x)` | Chain status + response |
| `concurrently` | Run multiple npm scripts in one terminal |
| ES Modules vs CommonJS | `import/export` (ESM) vs `require/module.exports` (CJS) |
