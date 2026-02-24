# 04 - Full-Stack: Express + React (Good Folder Structure)

A **production-ready folder structure** for a full-stack JavaScript project with an Express backend and React frontend.

## Folder Structure

```
04-fullstack-node-react-express/
├── client/                     # 🖥️  React Frontend (Vite)
│   ├── src/
│   │   ├── App.jsx             # Main component with CRUD logic
│   │   ├── App.css             # Styles
│   │   └── main.jsx            # React entry point
│   ├── index.html              # HTML entry (Vite)
│   ├── vite.config.js          # Vite config + API proxy
│   └── package.json
│
├── server/                     # 🔧 Express Backend
│   ├── src/
│   │   ├── index.js            # Server entry + middleware setup
│   │   ├── routes/
│   │   │   └── items.js        # Items CRUD router
│   │   └── middleware/
│   │       └── errorHandler.js # Error handling middleware
│   └── package.json
│
├── package.json                # 🏠 Root — runs both with concurrently
└── README.md
```

## How I Made This (step by step)

```bash
# 1. Create root
mkdir 04-fullstack-node-react-express
cd 04-fullstack-node-react-express
npm init -y

# 2. Install concurrently at root
npm install -D concurrently

# 3. Create server
mkdir -p server/src/routes server/src/middleware
cd server && npm init -y
npm install express cors
# → Create src/index.js, src/routes/items.js, src/middleware/errorHandler.js

# 4. Create client
cd ../client
npm init -y
npm install react react-dom
npm install -D vite @vitejs/plugin-react
# → Create index.html, vite.config.js, src/main.jsx, src/App.jsx, src/App.css

# 5. Add root scripts in root package.json:
#    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\""

# 6. Run everything
cd ..
npm run dev
```

## Key Commands

```bash
npm run dev           # Start BOTH client + server
npm run dev:server    # Server only (port 4000)
npm run dev:client    # Client only (port 5173)
npm run build         # Build React for production
npm start             # Run server serving built client
```

## Key Architecture Decisions

| Decision                  | Why                                                    |
|---------------------------|--------------------------------------------------------|
| Separate `client/server/` | Clear separation of concerns                           |
| Root `package.json`       | Single `npm run dev` starts everything                |
| `concurrently`            | Runs both processes in one terminal                    |
| Vite proxy                | `/api` requests forward to Express (no CORS needed)   |
| Modular routes            | `express.Router()` keeps routes organized              |
| Middleware folder          | Error handling separated from business logic           |

## How the Proxy Works

```
Browser → localhost:5173/api/items → Vite Proxy → localhost:4000/api/items → Express
```

In `vite.config.js`:
```js
proxy: {
  '/api': {
    target: 'http://localhost:4000',
    changeOrigin: true,
  },
}
```

> In production, you'd serve the built React app from Express or use Nginx.

## Interview Talking Points

> "I separate client and server into their own directories with their own `package.json` 
> files. This way they can have independent dependencies and be deployed separately."

> "I use Vite's proxy in development so the frontend can call `/api/items` without 
> worrying about CORS. In production, Nginx or Express serves the built React files."

> "The root `package.json` uses `concurrently` so one `npm run dev` starts everything — 
> this is the monorepo approach without the complexity of Lerna or Turborepo."

---

## What is Vite?
**Vite** (pronounced "veet", French for "quick") is a modern and blazing-fast frontend build tool and development server. 

Key reasons it's increasingly standard over older tools like Create React App (CRA):
1. **Instant Server Start:** It serves source code over native ES modules (`<script type="module">`). The dev server starts instantly, no matter how huge your codebase is.
2. **Lightning Fast Updates (HMR):** When you save a file, Hot Module Replacement (HMR) uses essentially instant updates rather than rebuilding your entire bundle.
3. **Easy Full-Stack Integration:** Features like the built-in API proxy (configured in `vite.config.js`) make it perfect for seamlessly connecting to an Express backend.
4. **Optimized Build:** For `npm run build`, it bundles your app using Rollup to produce highly optimized static HTML/CSS/JS files for production.

