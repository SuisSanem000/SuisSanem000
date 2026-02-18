# Front-End Team Lead Interview — Q&A Study Guide

> Focused on what a **front-end team lead** would ask a fullstack TS/JS candidate.
> Heavy emphasis on **performance optimization**, **scaling**, and production-level front-end knowledge.

---

## 1. Performance Optimization

### Q: How do you measure front-end performance?

**Core Web Vitals** — the metrics Google uses for ranking and UX:

| Metric | What it measures | Good threshold |
|--------|-----------------|---------------|
| **LCP** (Largest Contentful Paint) | How fast the main content loads | < 2.5s |
| **INP** (Interaction to Next Paint) | How fast the page responds to clicks/taps | < 200ms |
| **CLS** (Cumulative Layout Shift) | Visual stability (things jumping around) | < 0.1 |
| **FCP** (First Contentful Paint) | Time to first visible content | < 1.8s |
| **TTFB** (Time to First Byte) | Server response time | < 800ms |

**Tools**: Lighthouse, Chrome DevTools Performance tab, `web-vitals` npm package, PageSpeed Insights.

> **Note on `web-vitals`**: This is a tiny library (1KB) by Google that measures metrics from **real users** (RUM). Lighthouse simulates performance (Lab data), but `web-vitals` captures what actual users experience in the wild.
> ```js
> import { onLCP, onINP, onCLS } from 'web-vitals';
> onLCP(console.log); // Logs LCP metric to console
> ```

---

### Q: How do you reduce bundle size in a React/Next.js app?

1. **Code splitting** — `React.lazy()` + `Suspense`, Next.js `dynamic()` imports
2. **Tree shaking** — use ES module imports (`import { x } from 'lib'` not `import lib`)
3. **Analyze the bundle** — `@next/bundle-analyzer` or `webpack-bundle-analyzer`
4. **Replace heavy libraries** — e.g. `date-fns` → native `Intl.DateTimeFormat`, `lodash/get` → optional chaining
5. **Dynamic imports** for heavy components (charts, editors, maps)
   > Just wrap it: `const Chart = dynamic(() => import('./Chart'), { ssr: false })`
6. **Image optimization** — Next.js `<Image>`, WebP/AVIF format, lazy loading
7. **Compression** — Gzip/Brotli at the CDN/server level

---

### Q: What causes unnecessary re-renders and how do you fix them?

**Causes:**
- Parent re-renders → children re-render
- New object/function references on every render (inline `{}` or `() =>` in JSX)
- Context value changes re-render all consumers

**Fixes:**
- `React.memo()` — skip re-render if props haven't changed
- `useCallback` — stable function references
- `useMemo` — memoize expensive computed values
- Split Context — separate frequently/rarely changing values
- `useRef` for values that don't need re-render (timers, previous values)

**Profiling:** React DevTools Profiler → "Why did this render?" → fix the top offenders first.

---

### Q: How do you optimize images for performance?

- Use Next.js `<Image>` component — automatic lazy loading, srcset, format conversion
- Pick the right format: **WebP** (broad support), **AVIF** (better compression, newer)
- Responsive `sizes` attribute so the browser downloads the right resolution
- **Blur placeholder** (`placeholder="blur"`) for perceived performance
- Serve from a **CDN** with caching headers
- Use `priority` for above-the-fold hero images (disables lazy loading)

---

### Q: What is virtualization and when do you use it?

Virtualization renders **only the visible items** in a long list, not all 10,000 items at once.

- Libraries: `react-window`, `react-virtuoso`, `@tanstack/react-virtual`
- Use when: rendering large tables, infinite feeds, dropdown lists with 1000+ options
- How: calculates which items are in the viewport, renders only those + a small buffer

---

## 2. Scaling Front-End Applications

### Q: How would you architect a large-scale React/Next.js application?

```
src/
├── app/                    # Next.js App Router (routing layer)
├── components/
│   ├── ui/                 # Generic reusable (Button, Modal, Input)
│   └── features/           # Feature-specific (ProductCard, CartDrawer)
├── hooks/                  # Custom hooks (useFetch, useDebounce)
├── lib/                    # Utilities, API client, helpers
├── services/               # API service functions (fetchProducts, createOrder)
├── stores/                 # State management (Zustand, Redux slices)
├── types/                  # Shared TypeScript interfaces
└── styles/                 # Global styles, CSS variables, themes
```

**Key principles:**
- Feature-based grouping over type-based for large codebases
- Co-locate related files (component + styles + tests + stories in same folder)
- Barrel exports (`index.ts`) for clean imports
- Strict TypeScript (`strict: true`) from day one

---

### Q: How do you manage state in a large application?

| Type | Tool | When |
|------|------|------|
| **Server state** | React Query / TanStack Query | Fetched data, caching, revalidation |
| **Global client state** | Zustand or Redux Toolkit | Auth, theme, shopping cart |
| **Local UI state** | `useState` / `useReducer` | Form inputs, toggles, modals |
| **URL state** | `useSearchParams`, router | Filters, pagination, tab selection |
| **Form state** | React Hook Form + Zod | Complex multi-step forms |

**Key rule:** "Server state is not client state." Don't store fetched data in Redux — use React Query.

---

### Q: How do you handle caching on the front end?

- **HTTP caching** — `Cache-Control`, `ETag`, `stale-while-revalidate` headers
- **React Query** — built-in stale-while-revalidate, background refetch, cache invalidation
- **Service Worker** — cache static assets, offline-first strategies (Workbox)
- **Next.js** — ISR (`revalidate`), `unstable_cache`, `fetch` with `next: { revalidate: 60 }`
- **Browser storage** — `localStorage` for preferences, `sessionStorage` for temp data

---

### Q: How do you handle API errors gracefully?

1. **Error Boundaries** — catch rendering errors, show fallback UI
2. **React Query `onError`** — handle fetch failures per query
3. **Toast notifications** — for non-critical errors (failed to save)
4. **Retry logic** — React Query retries 3x by default
5. **Fallback UI** — skeleton loaders → error state with retry button
6. **Global error handler** — catch unhandled rejections, report to Sentry/LogRocket

---

## 3. CSS & Layout

### Q: How do you approach responsive design?

- **Mobile-first** — start with mobile styles, use `min-width` media queries to scale up
- **CSS Grid + Flexbox** — Grid for 2D layouts, Flexbox for 1D alignment
- **`clamp()`** — responsive font sizes: `font-size: clamp(1rem, 2.5vw, 2rem)`
- **Container queries** — style based on parent width, not viewport
- **Avoid fixed widths** — use `max-width`, `%`, `fr` units
- **Test on real devices** — Chrome DevTools device mode misses real scroll/touch behavior

---

### Q: CSS-in-JS vs CSS Modules vs Utility CSS — what do you prefer and why?

| Approach | Pros | Cons |
|----------|------|------|
| **CSS Modules** | Scoped by default, zero runtime, SSR-safe | No dynamic styling |
| **Tailwind** | Fast prototyping, consistent tokens | Verbose JSX, learning curve |
| **CSS-in-JS** (styled-components) | Dynamic styles, co-located | Runtime cost, SSR complexity |
| **Vanilla CSS** + custom properties | No deps, full control | Not scoped, manual naming |

**Best answer:** "I'd choose based on team conventions and project needs. For a Next.js app, **CSS Modules** or **Tailwind** are the most common because they work well with SSR and have zero/minimal runtime."

---

### Q: How do you prevent layout shifts (CLS)?

- Always set `width` and `height` (or `aspect-ratio`) on images and videos
- Use `font-display: swap` with `size-adjust` for web fonts
- Reserve space for async content (skeletons instead of spinners)
- Avoid injecting content above existing content (banners, cookie bars → push from top)
- Use `contain: layout` on dynamic sections

---

## 4. TypeScript in Front-End

### Q: How does TypeScript improve front-end code quality?

- **Catch bugs at compile time** — typos, wrong prop types, missing cases
- **Self-documenting** — interfaces describe component contracts
- **Refactoring confidence** — rename a prop and TS shows every place to update
- **Better DX** — autocomplete, inline docs, go-to-definition

**Key patterns:**
- Use `interface` for component props (extensible)
- Use `type` for unions and intersections
- Discriminated unions for state machines (`{ status: 'loading' } | { status: 'success', data: T }`)
- `as const` for literal types
- Avoid `any` — use `unknown` + type narrowing instead

---

## 5. Accessibility (a11y)

### Q: What are the key accessibility concerns in a front-end app?

- **Semantic HTML** — use `<button>`, `<nav>`, `<main>`, `<article>` instead of `<div>` for everything
- **Keyboard navigation** — all interactive elements focusable and operable with Tab/Enter/Escape
- **ARIA labels** — `aria-label`, `aria-describedby`, `role` where semantics are missing
- **Color contrast** — WCAG AA minimum 4.5:1 for text, 3:1 for large text
- **Focus management** — trap focus in modals, return focus when modal closes
- **Screen reader testing** — NVDA (Windows), VoiceOver (Mac), or `axe-core` for automated checks
- **Skip links** — "Skip to main content" for keyboard users

---

## 6. Testing

### Q: How do you test front-end applications?

| Level | Tool | What to test |
|-------|------|-------------|
| **Unit** | Vitest / Jest | Utility functions, hooks, pure logic |
| **Component** | React Testing Library | Render + interaction (click, type, assert DOM) |
| **Integration** | RTL + MSW | Component + API (mock server responses) |
| **E2E** | Playwright / Cypress | Full user flows (login → dashboard → action) |
| **Visual** | Chromatic / Percy | Screenshot diffing for UI regressions |

**Testing philosophy:** Test behavior, not implementation. "Does the user see X after clicking Y?" not "Did setState get called?"

---

### Q: What is MSW and why use it?

**Mock Service Worker** — intercepts network requests at the service worker level.
- Tests run with real `fetch` calls, but responses are faked
- Same mocks work in browser (dev) and Node (tests)
- No need to mock `fetch` or axios — just declare handlers
- Test loading states, error states, edge cases easily

---

## 7. Security

### Q: What security concerns should a front-end developer be aware of?

- **XSS** — never use `dangerouslySetInnerHTML` with user input; sanitize with DOMPurify
- **CSRF** — use anti-CSRF tokens for mutations; `SameSite=Strict` cookies
- **Content Security Policy (CSP)** — restrict which scripts/styles can run
- **HTTPS everywhere** — especially for auth tokens and API calls
- **Dependency audits** — `npm audit`, Dependabot, Snyk
- **Auth tokens** — store in `httpOnly` cookies, NOT `localStorage`

---

## 8. Dev Tooling & Workflow

### Q: How do you ensure code quality in a team?

- **ESLint + Prettier** — consistent code style, catch common bugs
- **Husky + lint-staged** — pre-commit hooks to run lint/format on staged files
- **TypeScript strict mode** — catch type errors before PR
- **PR reviews** — require at least 1 approval
- **CI pipeline** — lint → type-check → test → build on every PR
- **Storybook** — component library documentation, visual QA
- **Conventional commits** — structured commit messages for changelogs

---

### Q: How do you approach a performance issue in production?

1. **Identify** — check metrics (Lighthouse, Core Web Vitals dashboard, APM tool)
2. **Profile** — Chrome DevTools Performance tab → find bottleneck (long task, layout thrash, large bundle)
3. **Prioritize** — fix what impacts the most users first (LCP > CLS > INP)
4. **Fix** — code-split, lazy-load, memoize, optimize images, defer non-critical JS
5. **Measure** — confirm improvement with before/after metrics
6. **Monitor** — set up alerts for regressions (e.g., LCP > 3s triggers alert)

---

## 9. Collaboration & Leadership Questions

### Q: How do you handle disagreements about technical decisions with teammates?

> "I focus on data over opinions. If there's a disagreement, I suggest we prototype both approaches or look at benchmarks. I default to the team's established patterns unless there's a measurable reason to change. If I'm the one proposing a change, I write a short RFC explaining the why, the tradeoffs, and the migration path."

---

### Q: How do you onboard new developers to a large codebase?

> "I make sure the README is up to date with setup instructions, project structure overview, and links to key modules. I pair with them on a small feature first so they learn the conventions organically. I also make sure we have Storybook or a component library so they can see existing patterns before writing new code."

---

### Q: How do you decide when to refactor vs. ship?

> "I weigh three things: (1) does the current code block us from shipping the feature? (2) would refactoring now save significant time in the next 2-3 features? (3) can we refactor incrementally? If the answer is 'no, yes, yes' — I refactor alongside the feature, not as a separate project."
