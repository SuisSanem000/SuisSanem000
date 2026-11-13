# React & Next.js - Interview Study Guide

## React Core Concepts

### 1. React Hooks
- [ ] Understand useState for state management
- [ ] Master useEffect for side effects and cleanup
- [ ] Use useCallback for stable function references
- [ ] Use useMemo for expensive calculations
- [ ] Use useRef for DOM access and mutable values
- [ ] Know when each hook is appropriate

### 2. useEffect Cleanup
- [ ] Understand why cleanup prevents memory leaks
- [ ] Handle race conditions with cancelled flag
- [ ] Clean up event listeners properly
- [ ] Clear timers and intervals
- [ ] Close WebSocket connections
- [ ] Abort fetch requests on unmount

### 3. Custom Hooks
- [ ] Extract reusable logic into custom hooks
- [ ] Build useFetch hook for data fetching
- [ ] Create useDebounce hook for search inputs
- [ ] Implement useLocalStorage for persistence
- [ ] Build useToggle, usePrevious hooks
- [ ] Maintain proper dependency arrays

### 4. Performance Optimization
- [ ] Use React.memo to prevent unnecessary re-renders
- [ ] Use useMemo for expensive filtering/calculations
- [ ] Use useCallback for stable function references in props
- [ ] Implement code splitting with React.lazy and Suspense
- [ ] Use virtualization for long lists (react-window)
- [ ] Avoid inline functions/objects in JSX

---

## Next.js Concepts

### 5. SSR vs SSG vs ISR
- [ ] Understand SSG: pre-render at build time (best for static content)
- [ ] Understand SSR: render on each request (best for dynamic data)
- [ ] Understand ISR: SSG with revalidation (best for large datasets)
- [ ] Know when to use each for 5M SKUs
- [ ] Implement getStaticProps, getServerSideProps correctly
- [ ] Use revalidate for ISR strategy

### 6. Dynamic Routing
- [ ] Create dynamic routes with [id].js syntax
- [ ] Implement getStaticPaths for SSG dynamic routes
- [ ] Use fallback: 'blocking' for on-demand generation
- [ ] Handle catch-all routes with [...slug].js
- [ ] Use optional catch-all with [[...slug]].js
- [ ] Access route parameters from params

### 7. API Routes
- [ ] Create API endpoints in pages/api/ directory
- [ ] Handle different HTTP methods (GET, POST, PATCH, DELETE)
- [ ] Access request query and body
- [ ] Return proper status codes
- [ ] Implement error handling in API routes

### 8. Middleware
- [ ] Use middleware for auth checks
- [ ] Redirect unauthenticated users
- [ ] Add custom headers to responses
- [ ] Implement rewrites and redirects
- [ ] Configure middleware matcher for specific paths

---

## Common Mistakes

### Pitfalls to Avoid
- [ ] Missing dependencies in useEffect array
- [ ] Creating functions inside JSX (performance)
- [ ] Using array index as key (breaks reordering)
- [ ] Not cleaning up effects (memory leaks)
- [ ] Premature optimization with useMemo/useCallback
- [ ] Choosing wrong rendering strategy (SSR vs SSG)

---

## Practice Tasks

### Build These
- [ ] Custom useToggle hook
- [ ] Custom usePrevious hook  
- [ ] useFetch with loading/error states
- [ ] useDebounce for search
- [ ] Product page with SSG + ISR
- [ ] Auth middleware for Next.js
- [ ] API route with proper error handling

---

## 10. Next.js vs React for an Automanagement Dashboard

### The Question
"Would you choose Next.js or plain React for building an internal automanagement dashboard? Why?"

### Short Answer
**Next.js** is the better choice for a production dashboard because it provides SSR/SSG out of the box, built-in API routes, middleware for auth, and file-based routing — all of which accelerate development and improve security.

### Detailed Comparison

| Feature | React (CRA/Vite) | Next.js |
|---------|------------------|---------|
| Rendering | Client-side only (CSR) | SSR + SSG + ISR + CSR |
| Routing | Need react-router | Built-in file-based routing |
| API Backend | Separate server needed | Built-in API routes |
| Auth Middleware | Custom setup | Built-in middleware |
| SEO | Poor (CSR) | Excellent (SSR/SSG) |
| Initial Load | Slower (full JS bundle) | Faster (server-rendered HTML) |
| Data Fetching | useEffect + loading states | getServerSideProps (server) |
| Deployment | Static hosting | Vercel, Node.js server, Docker |

### When Plain React is Enough
- **Internal-only tool** with no SEO needs
- **Simple SPA** with few routes
- **Already have a separate API** and just need a frontend
- **Team is more familiar** with traditional React SPA patterns

### When Next.js is Better (Dashboard Case ✅)
- **Server-side data fetching**: Load supplier data, order stats on server → faster first paint
- **API routes**: Build dashboard API endpoints alongside the frontend
- **Middleware**: Protect dashboard routes with auth middleware (no client-side checks)
- **ISR for reports**: Generate periodic reports with ISR (revalidate every 5 min)
- **Multi-page dashboard**: File-based routing = instant routing for `/dashboard/orders`, `/dashboard/products`, `/dashboard/suppliers`

### Example: Dashboard Architecture with Next.js

```
dashboard/
├── middleware.ts              # Auth protection for all /dashboard routes
├── app/
│   ├── layout.tsx             # Dashboard layout with sidebar
│   ├── page.tsx               # Main overview (SSR → real-time stats)
│   ├── orders/
│   │   └── page.tsx           # Orders page (SSR → live order data)
│   ├── products/
│   │   └── page.tsx           # Products page (ISR → 5M SKUs, revalidate 5min)
│   ├── suppliers/
│   │   └── page.tsx           # Suppliers page (SSR → real-time supplier status)
│   └── reports/
│       └── page.tsx           # Reports page (SSG → generated at build)
├── api/
│   ├── orders/route.ts        # Orders API
│   ├── products/route.ts      # Products API
│   └── suppliers/route.ts     # Suppliers API
```

### Rendering Strategy per Dashboard Page

| Page | Strategy | Why |
|------|----------|-----|
| Overview (stats) | SSR | Real-time data, changes frequently |
| Product catalog | ISR (revalidate: 300) | 5M SKUs, acceptable 5-min delay |
| Orders | SSR | Must be real-time |
| Reports | SSG | Static once generated |
| Settings | CSR | User-specific, no SEO needed |

### Key Code Pattern: Dashboard with SSR

```typescript
// app/dashboard/page.tsx — Server Component (default in Next.js 13+)
export default async function DashboardPage() {
  // Data fetched on server — no loading spinner needed
  const stats = await fetchDashboardStats();
  const recentOrders = await fetchRecentOrders();
  
  return (
    <div>
      <StatsGrid stats={stats} />
      <RecentOrdersTable orders={recentOrders} />
      <RealTimeChart /> {/* Client component for WebSocket updates */}
    </div>
  );
}

// RealTimeChart.tsx — Client Component (for interactivity)
'use client';
export function RealTimeChart() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/live');
    ws.onmessage = (event) => setData(JSON.parse(event.data));
    return () => ws.close();
  }, []);
  
  return <Chart data={data} />;
}
```

### Interview Answer Template
> "For an automanagement dashboard, I'd choose **Next.js** because:
> 1. **SSR for real-time data** — Dashboard stats load server-side, no loading spinners
> 2. **Middleware for auth** — Protect all dashboard routes at the edge
> 3. **API routes** — Build the dashboard API alongside the frontend
> 4. **ISR for large datasets** — Product catalog with 5M SKUs can use ISR with periodic revalidation
> 5. **File-based routing** — Scales naturally as we add more dashboard pages
> 
> If it were a simple internal tool with 2-3 pages and no SEO needs, plain React with Vite would be simpler."
