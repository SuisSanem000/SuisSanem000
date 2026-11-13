# Debugging & Performance Troubleshooting — Top 10 Interview Questions

> Questions a **front-end team lead or CTO** would ask about how you find and fix issues in production web apps.

---

## Q1: Walk me through how you'd debug a performance issue reported by users ("the page is slow")

> **What they want to hear:** A structured approach, not guessing.

**My approach:**

1. **Reproduce** — Get the URL, device type, network conditions. Can I see it locally?
2. **Measure** — Run Lighthouse / Chrome DevTools Performance tab. Check Core Web Vitals (LCP, INP, CLS).
3. **Identify the bottleneck** — Is it:
   - **Network?** (large bundle, uncompressed assets, slow API) → check Network tab waterfall
   - **Rendering?** (layout thrashing, too many re-renders) → check Performance tab flame chart
   - **JavaScript?** (long tasks blocking main thread) → look for yellow bars > 50ms
4. **Fix the top offender first** — e.g., code-split a 400KB chart library, add lazy loading to images
5. **Measure again** — confirm improvement with before/after numbers
6. **Monitor** — set up alerts (e.g., LCP > 3s triggers a notification)

---

## Q2: How do you use Chrome DevTools to debug a slow page?

**Key tabs I use:**

| Tab | What I look for |
|-----|----------------|
| **Performance** | Record page load → find long tasks (red bars), layout shifts, expensive renders |
| **Network** | Waterfall view → large files, slow APIs, render-blocking resources |
| **Lighthouse** | Overall score + specific recommendations (unused JS, unoptimized images) |
| **Memory** | Heap snapshots → find memory leaks (detached DOM nodes, growing arrays) |
| **Console** | Errors, warnings, custom `console.time()` measurements |
| **Elements** | Layout debugging, forced reflows (purple highlights in Performance) |

**Practical example:**
- I open Performance tab, hit Record, reload the page, stop recording
- I look at the flame chart for the longest task
- If it's a React render, I check React DevTools Profiler → "Why did this render?"
- If it's a network request, I check the Network tab for slow API calls

---

## Q3: How do you find and fix memory leaks in a React application?

**Common causes:**
- Forgotten `useEffect` cleanup (event listeners, timers, subscriptions)
- Closures holding references to large objects
- Detached DOM nodes (React portals not cleaned up)
- Growing state arrays that never get trimmed

**How I find them:**
1. Open DevTools → **Memory** tab
2. Take a **heap snapshot** before the action
3. Do the action (navigate away and back, open/close a modal 10 times)
4. Take another **heap snapshot**
5. Compare — look for objects that keep growing (select "Comparison" view)
6. Look for **Detached HTMLDivElement** entries — these are leaked DOM nodes

**How I fix them:**
```typescript
useEffect(() => {
  const handler = () => console.log('resize');
  window.addEventListener('resize', handler);

  // THIS cleanup prevents the leak
  return () => window.removeEventListener('resize', handler);
}, []);
```

---

## Q4: A user reports a bug that you can't reproduce locally. What do you do?

1. **Gather context:** browser, OS, device, screen size, steps to reproduce, screenshots/video
2. **Check error monitoring:** Sentry / LogRocket / Datadog — look for the error with stack trace
3. **Check different environments:** Is it staging-only? Production-only? CDN cache issue?
4. **Check browser differences:** Safari vs Chrome, mobile vs desktop
5. **Try to match conditions:** throttle network (DevTools → Slow 3G), use same viewport size, disable extensions
6. **Use feature flags or session replay:** LogRocket or FullStory lets you literally watch the user's session
7. **Add targeted logging:** if I still can't reproduce, deploy a small logging change to capture more data around the failing area

**Key insight to mention:** "Not reproducible locally" usually means it's environment-specific — different data, different auth state, CDN caching, or browser-specific behavior.

---

## Q5: How do you monitor front-end performance in production?

**Tools and what they measure:**

| Tool | Purpose |
|------|---------|
| **Web Vitals (RUM)** | Real user metrics — LCP, INP, CLS from actual visitors |
| **Sentry** | Error tracking with stack traces, breadcrumbs, session replay |
| **Lighthouse CI** | Run Lighthouse on every PR to catch regressions before deploy |
| **`@next/bundle-analyzer`** | Visualize bundle size — catch accidental large imports |
| **Custom dashboards** | Track API response times, error rates, conversion metrics |

**What I set alerts on:**
- LCP > 3 seconds
- Error rate > 1%
- Bundle size increases > 10KB on a PR
- API p95 response time > 2 seconds

---

## Q6: How do you debug a React component that re-renders too many times?

**Step-by-step:**

1. Open **React DevTools → Profiler**
2. Check "Record why each component rendered"
3. Interact with the page → stop recording
4. Look at the flame chart — the widest bars are the most expensive renders
5. Click a component → it tells you WHY it re-rendered:
   - "Props changed" → which prop? Is it a new object/function reference every time?
   - "Parent rendered" → does this component need to re-render when parent does?
   - "Context changed" → is the context too broad?

**Common fixes:**
- `React.memo()` — skip re-render if props haven't changed
- `useCallback` — stabilize function props
- `useMemo` — stabilize object/array props
- Split contexts — separate frequently-changing values from stable ones
- Move state down — keep state in the lowest component that needs it

---

## Q7: A page loads fine locally but is slow in production. What could cause this?

**Network / infrastructure:**
- CDN not configured → users far from server get high latency
- No compression (Gzip/Brotli) → large transfer sizes
- No HTTP caching headers → browser re-downloads everything

**Data:**
- Production database has 1M rows, local has 100 → queries are slow
- No pagination or cursor-based fetching → loading everything at once

**Bundle:**
- Source maps enabled in production → larger downloads
- No code splitting → one massive JS bundle
- Dev dependencies accidentally included in production build

**Third-party scripts:**
- Analytics, chat widgets, ad scripts blocking the main thread
- No `async` or `defer` on third-party `<script>` tags

**How I investigate:**
- Compare Network waterfall: local vs production
- Check `next build` output for bundle sizes
- Profile both environments with Lighthouse and compare scores

---

## Q8: How do you debug API-related issues on the front end?

**My checklist:**

1. **Network tab** — check request/response: status code, headers, payload, timing
2. **Console** — any CORS errors? Auth errors? JSON parse failures?
3. **Check the request** — is the URL correct? Are query params right? Is the body formatted correctly?
4. **Check the response** — is the API returning what the frontend expects? (shape mismatch?)
5. **Check timing** — is the API slow? Is it a timeout? Check the `Time` column in Network tab
6. **Reproduce with curl/Postman** — isolate whether it's a frontend or backend issue
7. **Check error handling** — does the frontend handle 4xx/5xx gracefully or crash silently?

**Common gotchas:**
- **CORS:** API doesn't include `Access-Control-Allow-Origin` → browser blocks the response
- **Race conditions:** user clicks fast, responses arrive out of order → use `AbortController`
- **Stale cache:** React Query or browser cache serving old data → check cache invalidation
- **Auth token expired:** 401 response but no redirect to login → check token refresh logic

---

## Q9: How do you approach a bug in code you didn't write?

> **What they want to hear:** You're methodical, not afraid of unfamiliar code, and you don't blame the previous developer.

1. **Understand the symptom first** — What does the user see? What should they see?
2. **Read the error** — Stack trace, line numbers, error message. Start there.
3. **Trace the data flow** — Follow the data from source (API/store) → through components → to the screen
4. **Use `console.log` strategically** — at boundaries: before API call, after response, before render
5. **git blame / git log** — understand WHY the code was written this way. Was it intentional?
6. **Check tests** — are there tests? Do they pass? Do they cover this case?
7. **Make the smallest fix** — don't refactor the whole file. Fix the bug, add a test, move on.

**What I'd say in the interview:**
> "I treat someone else's code the same as my own from last month — I probably don't remember why I wrote it that way either. I start with the symptoms, trace the data, and make the smallest targeted fix with a test to prevent regression."

---

## Q10: How do you handle a production outage or critical bug?

> **What they want to hear:** You stay calm, communicate, and follow a process.

**My process:**

1. **Assess severity** — How many users affected? Is it blocking revenue? Is there a workaround?
2. **Communicate immediately** — Notify the team on Slack/Teams. "I'm investigating X, Y users affected, ETA unknown."
3. **Check recent deployments** — Was something deployed in the last hour? → Consider rolling back first
4. **Look at monitoring** — Error logs (Sentry), metrics (Datadog), APM — find the root cause
5. **Quick fix vs rollback** — If the fix is obvious and small, hotfix. If not, rollback to the last working version
6. **Fix, test, deploy** — Apply the fix, verify in staging, deploy to production
7. **Post-mortem** — Document: what happened, root cause, how it was fixed, what we'll do to prevent it (no blame, just improvements)

**Key things to emphasize:**
- **Rollback is not failure** — it's the fastest way to stop user impact
- **Communication > heroics** — keeping the team informed matters more than fixing it alone
- **Prevent recurrence** — add a test, add monitoring, add a guardrail so it can't happen again
