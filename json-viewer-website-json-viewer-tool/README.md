# JSON Viewer Website

The marketing, authentication, and licensing platform for a commercial desktop JSON Viewer product. Built and maintained from early in my career (2020) through ongoing feature additions. Handles the full user lifecycle, multi-seat license management, billing, and a technical blog.

## Tech Stack

React · Next.js · JavaScript · Axios

---

## What it Does

The site is the commercial front-end for a paid desktop application. It covers everything a SaaS product needs on the web side: user registration with email verification, login with device-aware sessions, password reset, account deletion, a billing portal for subscription changes, invoice requests, and a licence file download system per device. There is also a technical blog with 12+ articles and programmatic JSON-LD schema generation for SEO.

---

## Key Implementation Details

**Centralised API layer.** All backend communication is in a single `api.js` module that exports named functions for every operation. Each function serialises its arguments to `FormData` (the backend's required format) using a shared `JSONToFormData` helper, strips null/undefined values, and attaches the access token from localStorage automatically. This keeps the auth concern in one place and makes individual API functions concise.

**Multi-seat license management.** Users can allocate, revoke, and download license files on a per-device basis. The device ID is passed at login and tracked against each seat. The API surface for this is: `apiRequestSeat`, `apiRevokeSeat`, `apiDownloadSeat`, and `apiLicenseUpgrade`. License files are downloaded as binary blobs (`responseType: "blob"`) and handed off to the browser for saving.

**Programmatic JSON-LD schema generation.** Blog articles generate structured data at build time. `generateArticleSchema` parses the markdown content for embedded images using a regex, constructs an Article schema with full ImageObject entries (including `license`, `creditText`, `author`, `creator`, and `acquireLicensePage`), and writes the result as a JSON file to `public/schema/`. The `getSchema` helper then injects this into the page's `<head>` as a `<script type="application/ld+json">` tag — server-side only, via a `typeof window === "undefined"` guard, so it doesn't attempt a filesystem read in the browser.

**Anonymous analytics.** A persistent anonymous UID is generated once per browser using `crypto.randomUUID()` and stored in localStorage. All event log calls attach this UID alongside event metadata, enabling usage correlation without requiring a logged-in user.
