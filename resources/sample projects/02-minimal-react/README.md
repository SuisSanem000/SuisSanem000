# 02 - Minimal React App (Vite)

A minimal React application scaffolded with **Vite** — the modern, fast build tool.

## How I Made This (step by step)

```bash
# 1. Scaffold with Vite
npx create-vite@latest 02-minimal-react --template react

# 2. Install dependencies
cd 02-minimal-react
npm install

# 3. Run the dev server
npm run dev       # → http://localhost:5173
```

## What's Inside

| File/Folder       | Purpose                                    |
|-------------------|--------------------------------------------|
| `src/App.jsx`     | Main React component                       |
| `src/main.jsx`    | Entry point — renders `<App />` into DOM   |
| `index.html`      | Single HTML page (Vite entry)              |
| `vite.config.js`  | Vite configuration                         |
| `package.json`    | Dependencies & scripts                     |

## Key Commands

```bash
npm run dev       # Start dev server (hot reload)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

## Key Concepts Demonstrated

- **Vite** — faster than CRA (Create React App), uses native ES modules
- **JSX** — JavaScript XML syntax for React components
- **Component structure** — functional components with hooks
- **Hot Module Replacement (HMR)** — instant updates without full reload

## Interview Talking Points

> "I use Vite over CRA because it's significantly faster — it uses ESBuild 
> for dev and Rollup for production. CRA is deprecated since 2023."

> "The entry point is `main.jsx` which calls `ReactDOM.createRoot()` — 
> this is the React 18+ concurrent rendering API."
