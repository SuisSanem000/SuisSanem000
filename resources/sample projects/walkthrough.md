# Sample Projects — Walkthrough

## What Was Created

4 ready-to-run sample projects in `sample projects/`:

| # | Project | Tech | Port | Command |
|---|---------|------|------|---------|
| 1 | `01-minimal-node` | Pure Node.js `http` | 3000 | `npm start` |
| 2 | `02-minimal-react` | React + Vite | 5173 | `npm run dev` |
| 3 | `03-minimal-express` | Express.js | 3000 | `npm start` |
| 4 | `04-fullstack-node-react-express` | Express + React + Vite | 4000 + 5173 | `npm run dev` |

## Quick Reference — How to Make Each From Scratch

### Node.js (30 seconds)
```bash
mkdir my-node-app && cd my-node-app
npm init -y
# create index.js with http.createServer()
node index.js
```

### React (30 seconds)
```bash
npx create-vite@latest my-react-app --template react
cd my-react-app && npm install && npm run dev
```

### Express (30 seconds)
```bash
mkdir my-express-app && cd my-express-app
npm init -y && npm install express
# create index.js with express()
node index.js
```

### Full-Stack (2 minutes)
```bash
mkdir my-fullstack && cd my-fullstack
npm init -y && npm install -D concurrently
mkdir -p server/src/routes server/src/middleware client/src
# create server with express+cors, client with vite+react
# add proxy in vite.config.js, concurrently in root scripts
npm run dev
```

## Verification Results

All projects start successfully:
- ✅ `01-minimal-node` → `🚀 Node.js server running at http://localhost:3000`
- ✅ `02-minimal-react` → Vite dev server at `http://localhost:5173`
- ✅ `03-minimal-express` → `🚀 Express server running at http://localhost:3000`
- ✅ `04-fullstack` server → `🚀 Server running at http://localhost:4000`
