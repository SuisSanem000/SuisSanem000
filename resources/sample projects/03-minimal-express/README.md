# 03 - Minimal Express REST API

A clean Express.js REST API with **full CRUD operations** and proper error handling.

## How I Made This (step by step)

```bash
# 1. Create folder and init
mkdir 03-minimal-express
cd 03-minimal-express
npm init -y

# 2. Install Express
npm install express

# 3. Create the server file
# → index.js (see below)

# 4. Run it
npm start         # or: node index.js
npm run dev       # with --watch (auto-restart, Node 18+)
```

## What's Inside

| File          | Purpose                                     |
|---------------|---------------------------------------------|
| `package.json`| Project config, Express dependency          |
| `index.js`    | Express server with CRUD routes             |

## API Endpoints

| Method | Endpoint          | Description       |
|--------|-------------------|--------------------|
| GET    | `/`               | Health check       |
| GET    | `/api/items`      | Get all items      |
| GET    | `/api/items/:id`  | Get single item    |
| POST   | `/api/items`      | Create new item    |
| PUT    | `/api/items/:id`  | Update item        |
| DELETE | `/api/items/:id`  | Delete item        |

## Key Concepts Demonstrated

- **`express()`** — creates the app instance
- **Middleware** — `express.json()` for body parsing
- **Route params** — `req.params.id`
- **Status codes** — 200, 201, 204, 400, 404, 500
- **Error handling** — 404 catch-all + global error handler
- **RESTful design** — proper HTTP methods for CRUD

## Test It

```bash
# GET
curl http://localhost:3000/api/items

# POST
curl -X POST http://localhost:3000/api/items -H "Content-Type: application/json" -d "{\"name\": \"New Item\"}"

# PUT
curl -X PUT http://localhost:3000/api/items/1 -H "Content-Type: application/json" -d "{\"name\": \"Updated\", \"done\": true}"

# DELETE
curl -X DELETE http://localhost:3000/api/items/1
```

## Interview Talking Points

> "Express gives us `app.get()`, `app.post()` etc. which is much cleaner 
> than manually parsing `req.url` and `req.method` in raw Node.js."

> "I always add a global error handler `(err, req, res, next)` — 
> the 4 parameters tell Express it's an error handler, not regular middleware."
