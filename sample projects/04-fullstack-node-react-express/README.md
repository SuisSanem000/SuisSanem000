# Full-Stack: Express + React

```
04-fullstack-node-react-express/
├── client/           # React (Vite)
│   ├── src/App.jsx   # Main component — fetches from API
│   ├── vite.config.js # Proxy /api → Express
│   └── package.json
├── server/           # Express API
│   ├── src/index.js  # API routes
│   └── package.json
└── package.json      # Root — runs both with concurrently
```

## Build from scratch
```bash
mkdir my-fullstack && cd my-fullstack
npm init -y && npm i -D concurrently

# Server
mkdir -p server/src && cd server
npm init -y && npm i express cors
# create src/index.js with express app on port 4000

# Client
cd .. && mkdir -p client/src && cd client
npm init -y && npm i react react-dom && npm i -D vite @vitejs/plugin-react
# create vite.config.js with proxy, index.html, src/main.jsx, src/App.jsx
```

## Run
```bash
npm run dev   # starts both client + server
```

## What is Vite?
**Vite** (pronounced "veet", French for "quick") is a modern and blazing-fast frontend build tool and development server. 

Key reasons it's used here instead of Create React App (CRA):
- **Instant Server Start:** It serves code via native ES modules, starting instantly regardless of app size.
- **Lightning Fast HMR:** Hot Module Replacement updates precisely what changed in the code without refreshing the page.
- **Built-in Proxy:** As shown in `vite.config.js`, it cleanly proxies `/api` calls to the Express server, solving CORS issues during local development.
- **Optimized Production Build:** Under the hood, it uses Rollup (a powerful bundler) to bundle the code for production.

