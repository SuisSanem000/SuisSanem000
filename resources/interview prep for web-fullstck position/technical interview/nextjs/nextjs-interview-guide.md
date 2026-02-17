# Next.js Interview Preparation Guide

> **Target Level:** Beginner | **Focus:** Core concepts for technical interviews

---

## What is Next.js?

Next.js is a **React framework** built by Vercel that provides structure, features, and optimizations for production-ready web applications. Think of it as React with superpowers—it handles routing, rendering strategies, and optimizations out of the box.

### Why Companies Use Next.js

- **Full-stack capabilities** in a single framework
- **Built-in performance optimizations** (code splitting, image optimization)
- **SEO-friendly** through server-side rendering
- **Developer experience** with fast refresh and intuitive file-based routing

---

## Core Concepts You Must Know

### 1. File-Based Routing

Next.js uses the **file system** as its router. Instead of configuring routes manually, you create files and folders.

**App Router (Next.js 13+):**
- Files inside `app/` directory become routes
- `page.tsx` files define route content
- `layout.tsx` files wrap pages with shared UI
- Folders create URL segments: `app/blog/[slug]/page.tsx` → `/blog/my-post`

**Key terms to mention:**
- **Dynamic Routes:** Using brackets `[id]` for variable URL segments
- **Route Groups:** Using parentheses `(group)` to organize without affecting URL
- **Parallel Routes:** Rendering multiple pages in the same layout simultaneously
- **Intercepting Routes:** Modal-like navigation patterns

---

### 2. Rendering Strategies (Critical Interview Topic)

This is where Next.js truly shines. Know the differences between these:

#### Server-Side Rendering (SSR)
- HTML is generated **on each request**
- Great for personalized or frequently changing content
- Function: `getServerSideProps()` (Pages Router) or just making components async (App Router)
- **When to use:** User dashboards, shopping carts, real-time data

#### Static Site Generation (SSG)
- HTML is generated **at build time**
- Fastest option—pages are cached on CDN
- Function: `getStaticProps()` (Pages Router)
- **When to use:** Blog posts, marketing pages, documentation

#### Incremental Static Regeneration (ISR)
- Combines SSG with the ability to **update static pages after deployment**
- You set a revalidation interval (e.g., every 60 seconds)
- **When to use:** E-commerce products, news articles

#### Client-Side Rendering (CSR)
- Traditional React approach—JavaScript runs in browser
- **When to use:** Interactive dashboards after initial load, user-specific widgets

**Interview Tip:** Be ready to explain *when* you'd choose each strategy and the trade-offs.

---

### 3. Server Components vs Client Components

**Server Components (default in App Router):**
- Run on the server only
- Cannot use hooks like `useState` or `useEffect`
- Can directly access databases, file systems, environment variables
- Reduce JavaScript sent to browser

**Client Components:**
- Start with `"use client"` directive
- Run in the browser
- Can use React hooks and browser APIs
- Needed for interactivity (click handlers, forms, animations)

**Key insight:** Server Components can import Client Components, but not vice versa.

---

### 4. Data Fetching

**App Router Approach:**
- Use native `fetch()` in Server Components
- Next.js extends `fetch` with caching and revalidation options
- `cache: 'no-store'` for fresh data every request
- `next: { revalidate: 60 }` for ISR behavior

**Important Patterns:**
- **Loading UI:** Create `loading.tsx` for automatic loading states
- **Error Handling:** Create `error.tsx` for error boundaries
- **Streaming:** Progressive rendering with Suspense

---

### 5. API Routes

Next.js can serve as a **backend** through API routes.

**App Router:**
- Create `route.ts` files in `app/api/` directory
- Export functions named after HTTP methods: `GET`, `POST`, `PUT`, `DELETE`
- Access request data through `Request` object
- Return using `NextResponse`

**Common Uses:**
- Form handling
- Database operations
- Third-party API proxying (hiding API keys)
- Webhooks

---

### 6. Middleware

Middleware runs **before a request is completed**. It sits between the user and your routes.

**Location:** `middleware.ts` at project root

**Use Cases:**
- Authentication checks
- Redirects based on user location
- A/B testing
- Logging and analytics
- Header modifications

**Key function:** `NextResponse.next()`, `NextResponse.redirect()`, `NextResponse.rewrite()`

---

### 7. Image and Font Optimization

**next/image Component:**
- Automatic lazy loading
- Responsive sizing
- Modern format conversion (WebP, AVIF)
- Prevents layout shift with required dimensions

**next/font:**
- Zero layout shift for fonts
- Self-hosted Google Fonts
- Automatic subsetting

---

### 8. Metadata and SEO

**App Router Metadata:**
- Export `metadata` object from `page.tsx` or `layout.tsx`
- Dynamic metadata via `generateMetadata()` function
- Handles title, description, Open Graph, Twitter cards

---

## Key Functions and Exports to Know

| Function/Export | Purpose |
|-----------------|---------|
| `page.tsx` | Defines route UI |
| `layout.tsx` | Shared wrapper for routes |
| `loading.tsx` | Loading UI (Suspense) |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 page |
| `route.ts` | API endpoint |
| `middleware.ts` | Request interceptor |
| `generateStaticParams()` | Pre-render dynamic routes at build |
| `generateMetadata()` | Dynamic page metadata |
| `useRouter()` | Client-side navigation hook |
| `useSearchParams()` | Access URL query parameters |
| `usePathname()` | Get current URL path |
| `redirect()` | Server-side redirect |
| `notFound()` | Trigger 404 |

---

## Common Interview Questions

### Conceptual Questions

1. **"What's the difference between SSR and SSG?"**
   - SSR generates HTML per request; SSG generates at build time
   - SSG is faster but less dynamic; SSR is slower but always fresh

2. **"When would you use getServerSideProps vs getStaticProps?"**
   - Use `getServerSideProps` when you need request-time data (cookies, user-specific)
   - Use `getStaticProps` when content doesn't change based on the request

3. **"Explain Server Components."**
   - They run only on the server, reducing client-side JavaScript
   - They can directly access backend resources
   - They cannot use browser APIs or React hooks

4. **"How does Next.js handle routing?"**
   - File-based routing—folders and files in `app/` become URLs
   - Dynamic routes use brackets: `[id]`
   - Layouts and templates provide shared structure

5. **"What is ISR?"**
   - Incremental Static Regeneration lets you update static pages without rebuilding
   - Combines speed of static with freshness of dynamic

### Practical Scenarios

1. **"How would you protect a route in Next.js?"**
   - Use middleware to check authentication before requests complete
   - Redirect unauthenticated users to login

2. **"How do you share state between pages?"**
   - React Context (client-side)
   - URL search parameters
   - Server-side sessions or cookies
   - Layout components for persistent UI

3. **"How do you optimize images?"**
   - Use `next/image` component
   - It handles lazy loading, responsive sizes, and format optimization automatically

---

## Red Flags to Avoid in Interviews

❌ Don't confuse Pages Router with App Router—clarify which you're discussing

❌ Don't say "SSR is always better"—explain trade-offs

❌ Don't forget that Server Components can't use `useState`

❌ Don't mix up `route.ts` (API) and `page.tsx` (UI)

---

## Your Learning Narrative

When asked about your Next.js experience, you might say:

> "I've been learning Next.js and am particularly excited about the App Router's approach to Server Components. I understand the core rendering strategies—SSG for static content, SSR for dynamic pages, and ISR for the best of both worlds. I've built projects using file-based routing and API routes, and I'm comfortable with concepts like middleware for authentication and the optimization features like next/image."

---

## Next Steps After This Guide

1. Build a small project with App Router (blog or portfolio)
2. Implement at least one API route
3. Practice explaining SSR vs SSG out loud
4. Understand the fetch caching behavior
