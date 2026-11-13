# Next.js — Quick Review

> ⏱ ~15 min read | Focus: App Router, SSR/SSG, API routes, caching

---

## App Router vs Pages Router

| Feature | App Router (v13+) ✅ | Pages Router (legacy) |
|---------|---------------------|----------------------|
| File convention | `app/page.tsx` | `pages/index.tsx` |
| Layouts | Nested `layout.tsx` | `_app.tsx` only |
| Server Components | Default | Not supported |
| Data fetching | `async` component + `fetch` | `getServerSideProps` / `getStaticProps` |
| Loading UI | `loading.tsx` | Manual |
| Error handling | `error.tsx` | `_error.tsx` |

**JetBridge uses App Router** — focus on this.

---

## Server Components vs Client Components

```
Server Component (default)     Client Component ("use client")
├── Runs on server only        ├── Runs on client (also SSR'd)
├── Can use async/await        ├── Can use hooks (useState, useEffect)
├── Can access DB directly     ├── Can use event handlers (onClick)
├── Zero JS sent to client     ├── JS bundle sent to client
└── Cannot use hooks           └── Cannot use async in component body
```

**Rule:** Keep components **server** by default. Add `"use client"` only when you need interactivity.

```tsx
// Server Component (default) — no directive needed
async function UserList() {
  const users = await db.users.findMany(); // direct DB access!
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// Client Component — needs "use client"
"use client";
import { useState } from "react";
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

---

## Data Fetching (App Router)

```tsx
// 1. Server Component — fetch in component (recommended)
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  }).then(r => r.json());

  return <h1>{product.name}</h1>;
}

// 2. Static generation (build time)
export async function generateStaticParams() {
  const products = await fetch("https://api.example.com/products").then(r => r.json());
  return products.map((p: Product) => ({ id: p.id }));
}
```

### Caching behavior

| `fetch` option | Behavior |
|---------------|----------|
| `{ cache: "force-cache" }` | Static (SSG) — cached forever |
| `{ cache: "no-store" }` | Dynamic (SSR) — fresh every request |
| `{ next: { revalidate: 60 } }` | ISR — revalidate after 60s |

---

## Route Handlers (API Routes)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.users.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

---

## Middleware

```typescript
// middleware.ts (root level — runs on EVERY request)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Auth check
  const token = request.cookies.get("token");
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

---

## Key File Conventions

```
app/
├── layout.tsx        ← root layout (wraps ALL pages, persistent)
├── page.tsx          ← home page /
├── loading.tsx       ← loading UI (Suspense boundary)
├── error.tsx         ← error boundary (must be "use client")
├── not-found.tsx     ← 404 page
├── users/
│   ├── page.tsx      ← /users
│   ├── [id]/
│   │   └── page.tsx  ← /users/:id (dynamic route)
│   └── loading.tsx   ← loading for /users/*
└── api/
    └── users/
        └── route.ts  ← API: /api/users
```

---

## Performance Tips

1. **Use Server Components** — reduces client JS bundle
2. **`next/image`** — automatic optimization, lazy loading, responsive sizes
3. **`next/link`** — prefetches linked pages on hover
4. **`dynamic(() => import(...))`** — code-split heavy components
5. **Streaming** — `loading.tsx` + Suspense for progressive rendering
6. **`revalidatePath()` / `revalidateTag()`** — on-demand cache invalidation after mutations
