# 01 - Minimal Node.js HTTP Server

A bare-bones HTTP server using **only Node.js built-in modules** (no Express, no frameworks).

## How I Made This (step by step)

```bash
# 1. Create folder and init
mkdir 01-minimal-node
cd 01-minimal-node
npm init -y

# 2. Create the server file
# → index.js (see below)

# 3. Run it
npm start        # or: node index.js
npm run dev       # with --watch (auto-restart on save, Node 18+)
```

## What's Inside

| File          | Purpose                                  |
|---------------|------------------------------------------|
| `package.json`| Project config, scripts                  |
| `index.js`    | HTTP server with GET/POST routes         |

## Key Concepts Demonstrated

- **`http.createServer()`** — the foundation of every Node.js web server
- **Manual routing** — parsing `req.method` and `req.url`
- **Reading POST body** — using `req.on('data')` and `req.on('end')`
- **JSON responses** — `res.setHeader('Content-Type', 'application/json')`
- **CORS headers** — `Access-Control-Allow-Origin`

## Test It

```bash
# GET request
curl http://localhost:3000/
curl http://localhost:3000/api/items

# POST request
curl -X POST http://localhost:3000/api/items -H "Content-Type: application/json" -d "{\"name\": \"New Item\"}"
```

## Interview Talking Points

> "This shows I understand what Express abstracts away — I can build routing, 
> parse bodies, and handle HTTP methods with just the `http` module."
