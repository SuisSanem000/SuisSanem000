# Simin Shoeibi — Engineering Portfolio

Backend Engineer and AI Integration Specialist with 6+ years across full-stack web development, LLM systems, and developer tooling. This document consolidates all projects and technical write-ups in one place.

---

## Skills at a Glance

**Languages:** TypeScript, JavaScript (ES2022+), SQL

**Backend:** Node.js, NestJS, Express.js, Meteor.js, TypeScript, REST APIs, GraphQL, WebSockets, Socket.IO, PNPM monorepos

**Frontend:** React 18, Next.js, Vite, Sass, Redux, IndexedDB, Web Workers, VSCode Extension API

**Databases:** PostgreSQL, Redis, MongoDB, SQLite, IndexedDB (`idb`)  ·  Prisma, TypeORM, Sequelize, Mongoose

**AI / LLM:** Anthropic Claude (`@anthropic-ai/sdk`), OpenAI GPT-4o, Google Cloud Vertex AI  ·  Prompt engineering, structured JSON output (assistant prefill), multimodal document processing (PDF/DOCX/image), two-phase decision orchestration, AJV validation pipelines, tiktoken cost tracking

**Developer Tooling:** VSCode Extension API, Webpack, npm/PNPM package publishing

**Architecture Patterns:** Event-driven design (`EventTarget` with typed event maps), Singleton services, Repository pattern, Provider/render-props, batch processing pipelines with concurrency control, offline-first (IndexedDB), magic-number file type detection, SOCKS proxy injection

**Engineering Practices:** Strict TypeScript, AJV schema validation, `errorCatch`/`errorCatchAsync` wrappers, virtual DOM rendering, pointer capture API, Cheerio HTML parsing, RSS feed parsing

---

## Projects

---

## 1 · TreeScribe — LLM Integration

> **Role:** Solo designer and implementer of the entire AI layer
> **Stack:** Anthropic Claude · `@anthropic-ai/sdk` · mammoth.js · AJV · Meteor.js · MongoDB · TypeScript

TreeScribe is a legal document automation platform built for law firms and compliance-heavy organizations. It models legal documents as decision trees: each document is composed of properties, topics, and definitions, each containing a branching graph of widgets (choice, blank, list) that users navigate to produce a final rendered document. The platform supports multi-party documents, conditional logic, organization-level templates, and real-time collaborative review.

My contribution was entirely on the AI/LLM layer — designing and building the integration that lets the system read uploaded source documents (contracts, PDFs, policies) and use them to automatically answer decision-tree widgets using Claude.

### What the LLM Layer Does

A user uploads a source document, tells TreeScribe which legal template they need, and the AI reads the source, traverses the decision tree, and fills in every widget it has enough information for. Widgets it can't answer are left blank for manual handling. Every AI answer is stamped with the prompt, response, token usage, and decision phase.

There are two separate pipelines:

**SourceManager** — for interpreting uploaded documents (PDFs, Word docs, images) and extracting structured information from them.

**AI Decision Maker** — for traversing a live document's decision tree and filling in widgets using those extracted sources.

### SourceManager — Document Ingestion Pipeline

`imports/api/SourceManager/`

The first challenge was that Claude doesn't natively accept `.docx` files. I solved this with a pre-processing step using `mammoth.js` that converts Word documents to HTML in-memory before passing them to the LLM:

```typescript
export async function convertDocToHtmlInMemory(fileBuffer: Buffer): Promise<string> {
    const result = await mammoth.convertToHtml({ buffer: fileBuffer }, getMammothOptions(true));
    return result.value;
}
```

In-memory rather than writing to a temp file — no filesystem cleanup, no race conditions under concurrent uploads. Images are stripped: base64-encoded images would bloat the context window with no value for document analysis. PDFs and images skip conversion entirely and go directly to Claude's multimodal API using `document` and `image` content types.

**File type detection via magic numbers** — rather than trusting the browser-provided MIME type (which can be wrong or spoofed for `.docx` uploads arriving as `application/octet-stream`):

```typescript
function getMediaType(buffer: Buffer): { mediaType: string; isPdf: boolean } {
    if (buffer.toString("ascii", 0, 4) === "%PDF")
        return { mediaType: "application/pdf", isPdf: true };
    if (buffer.toString("hex", 0, 4).toUpperCase().startsWith("FFD8FF"))
        return { mediaType: "image/jpeg", isPdf: false };
    if (buffer.toString("hex", 0, 4).toUpperCase().startsWith("89504E47"))
        return { mediaType: "image/png", isPdf: false };
    // GIF, WebP...
}
```

**Anthropic LLM Adapter** (`anthropic-llm-adapter.ts`) — a standalone adapter around `@anthropic-ai/sdk` with:

- **Singleton config with eager validation** — environment variables read once at class instantiation; missing required variables fail loudly at startup, not mid-request.
- **SOCKS proxy support** — routes all Anthropic API calls through a SOCKS proxy by injecting a custom `fetch` implementation via `socks-proxy-agent`, for restricted deployment environments.
- **Response strategy pattern** — Claude can return multiple text blocks; a `ResponseStrategy` enum handles this explicitly (`FIRST_TEXT_BLOCK` vs `EXTRACT_ALL_CONTENT`).
- **Typed response** — all responses return `{ answer, model, inputTokens, outputTokens, timeTaken }` for billing and observability.

Three Meteor server methods expose the pipeline: `SourceManager.processFile` (main entry point, routes by file type), `SourceManager.convertDocToHtml` (conversion only, for previews), `SourceManager.interpretText` (processes already-available text without a file upload).

### LLM.service.ts — Decision-Making LLM Wrapper

`imports/api/Tools/LLM.service.ts`

A singleton service oriented around decision-making workflows. The key technique is **assistant prefill for reliable JSON output**:

```typescript
if (jsonResponse) {
    messages.push({
        role: "assistant",
        content: [{ type: "text", text: "{" }]
    });
}
```

By seeding the assistant's turn with `{`, Claude completes a JSON object rather than wrapping the answer in prose or markdown. The opening brace is prepended to the response text before parsing. More reliable than prompt-only JSON instructions for structured decision output.

Three calling patterns: `call()` (full messages array), `callWithTextInput()` (simple string prompt), `callWithFileInput()` (URL-based file access — PDFs/images via URL, DOCX by downloading and converting in-memory).

### AI Decision Maker — Widget Tree Orchestration

`imports/api/AI/meteor/server/aiAnswering/aiDecisionMaker.ts`

Orchestrates batch AI answering for a document. Initialised per-request with a document ID and collection type, loads everything from MongoDB, then runs:

1. Traverse the widget tree (using the `traverse` library), collect all unanswered widget paths
2. Split into chunks of `BATCH_SIZE` (5)
3. Build structured prompt from document context, source content, and org/user-level custom instructions
4. Call Claude via `LLMService`
5. Parse and validate the JSON response
6. Apply valid answers into the tree via `AnswerWidgetProcess`
7. Run observers (recompute dependent widgets)
8. Repeat until complete or stopped

Chunks in the same pass are processed in parallel, tracked via `runningChunksCount`.

**Two-phase decision strategy:**

- **Instruction phase** — asks Claude to answer based on the uploaded source document. Authoritative, grounded in actual content.
- **Suggestion phase** — fallback for widgets that returned `false` or errored. Best-effort fill from context alone.

Answers are tagged with their phase so users can distinguish document-derived answers from inference.

**Multi-layer response validation** (`aiAnswerResponseParse.js`):

1. JSON parse — with fallback to XML parser for responses that drift out of JSON format
2. AJV schema validation — validates overall response structure
3. Per-widget type validation — checks answers are appropriate for their widget type (string for blanks, array for lists, choices within `optionsOrder`)
4. Input validation — runs the widget's own validation rules (regex patterns, etc.)
5. Compulsory option handling — list widgets can have mandatory options always appended

Failures go into `aiErrors` / `falseResults` rather than being silently dropped.

**Full audit logging** — every session creates an `AiLog` with status tracking (`PROCESSING → DONE / DONE_WITH_ERRORS / STOPPED / ERROR`). Each batch appends a chunk record with prompt, response, model name, and token usage. Decision-level results stored in `DecisionLog`.

### AI Testing Framework

`imports/api/Tools/ToolsTest.service.ts`

Three test types for validating LLM behaviour on real documents without manual intervention:

- **`SourceToolTest`** — uploads a file with a given prompt, validates specific fields in the JSON response
- **`DecisionToolTest`** — generates a full document from a template, runs `AiDecisionMaker` on specific widgets, checks answers match expected values
- **`StepToolTest`** — validates programmatic document generation end-to-end

All support `runQuantity` for multi-run consistency measurement. Results stored in MongoDB, viewable in an internal testing UI.

### Key Design Decisions

**Two adapters, not one.** The `SourceManager` adapter is oriented around document ingestion with performance metrics and proxy support. The `LLMService` is oriented around decision-making with JSON prefill. They solve different problems and were built at different times.

**In-memory DOCX conversion.** No temp files, no cleanup, no disk I/O. The buffer goes from the HTTP request straight through mammoth and into the Claude API call.

**Magic number file detection.** Browsers lie about MIME types. The real format check has to be on the bytes.

**JSON prefill for structured output.** Seeding the assistant turn with `{` forces Claude into JSON completion mode without needing to strip markdown fences from the output.

**Two-phase AI decisions.** Separating "what does the document say?" from "what would make sense?" keeps authoritative answers distinct from inferred ones — critical for legal documents where provenance matters.

**Parallel batch processing.** Widgets are processed in chunks of 5 concurrently. Smaller batches reduce context window issues and make partial success easier to handle; parallelism keeps total processing time reasonable for large documents.

---

## 2 · News Feed App — AI-Powered News Aggregation

> **Role:** Built solo, end-to-end
> **Stack:** TypeScript · Node.js · PostgreSQL · SQLite · OpenAI API · Google Vertex AI · PNPM Workspaces · Vite · Axios

A full-stack tech news aggregation platform. The server crawls RSS feeds and custom scrapers for Hacker News, Lobsters, MongoDB, Splunk, Apache Cassandra, SQLite, and CockroachDB, stores articles in PostgreSQL, and runs them through an OpenAI enrichment pipeline. A separate sub-app benchmarked OpenAI against Google Vertex AI for the same classification task.

### Monorepo Structure

PNPM workspace with four apps:

- **`EyeServer`** — production server: crawling, PostgreSQL, OpenAI enrichment, static JSON generation, image caching
- **`EyeAI`** — standalone AI experimentation: batches of articles through OpenAI and Vertex AI, JSON result capture, tiktoken-based cost calculation per call
- **`EyeCustomCrawlers`** — earlier SQLite-backed crawler prototype
- **`EyeTest`** — Vite development client

### OpenAI Enrichment Pipeline

Two independently runnable operations:

**Article enrichment** — prompt asks OpenAI to produce a concise title (≤70 chars), a 2–4 bullet-point summary (500–750 chars), an industry index, a content type index, and a viral tendency score 0–100. Industry and type indices reference JSON config files (`industries.json`, `types.json`) so categories update without touching prompt logic.

**Relativity scoring** — scores each article's relevance to target job titles (`jobTitles.json`) on a −100 to +100 scale with a reason string.

Both use an **informing call pattern**: a context-priming prompt is sent once per batch session to establish category definitions in the model's session, keeping per-article prompts short and reducing token costs.

```typescript
let prompt = `InformingCallForCategorization: remember the following "Industries", 
"Job Titles," and "Types" with their respective descriptions...
Industries: ${industryNames}
Types: ${typeNames}
Job Titles: ${jobTitlesNames}`;
```

### Response Parsing Robustness

LLM responses don't always arrive as clean JSON. The parser handles both direct JSON objects and responses wrapped in markdown code fences. Before parsing, it strips embedded newlines inside JSON string values using a regex targeting only content within quotes:

```typescript
cleanedString = cleanedString.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
    return match.replace(/(?:\r\n|\r|\n)/g, ' ');
});
```

### Token Cost Tracking

`EyeAI` uses `@dqbd/tiktoken` to count tokens on both input and output of every API call, then calculates per-call cost in dollars against a model pricing config — making it practical to compare cost across models and prompt strategies during the OpenAI / Vertex AI benchmarking work.

### Static Generation

Pre-built JSON files materialise the article dataset at generation time rather than serving live DB queries. Article images are downloaded and cached locally. The client serves static files directly.

---

## 3 · Data Visualization Tool Manager

> **Stack:** TypeScript · IndexedDB (`idb`) · Custom Typed Event System

The client-side manager layer for a commercial desktop data visualization application (JSON/CSV/XML viewer). The `TManager` class extends the browser's native `EventTarget` with a fully typed custom event map:

```typescript
export interface IManagerEventMap {
    'startupScreen':      CustomEvent<IStartupScreen>;
    'updateLicense':      CustomEvent<ILicense>;
    'updateView':         CustomEvent<IViewUpdate>;
    'updateViewSync':     CustomEvent<IViewUpdate>;
    'updateStatus':       CustomEvent<IStatusUpdate>;
    'updateContent':      CustomEvent<IContentUpdate>;
    'updateSettings':     CustomEvent<ISettings>;
    'error':              CustomEvent<IError>;
    'openURLResult':      CustomEvent<IOpenURLResult>;
    'message':            CustomEvent<IMessage>;
}
```

`addEventListener` and `removeEventListener` overloads are typed to this map — callers get full IDE autocomplete and compile-time safety on event subscriptions. Sync/async variants (`updateView` vs `updateViewSync`) handle cases where the UI needs immediate vs. next-tick state reflection.

**Key features:**

- **Multi-file, multi-view state** — each file maintains independent views, each view its own column config, row count, filter mode, SQL editor state, active refiners, and find results. Persisted to IndexedDB via the `idb` library, with view cloning support.
- **SQL query execution and refiners** — two filter modes: UI-driven refiner mode and direct SQL editor mode. Refiners support Find and Filter types with highlight colour coding, inverse matching, and column scoping.
- **Task pipeline** — long operations (file load, query, find, filter, export, download) are modelled as tasks with an explicit state machine: `Started → InProgress → Finished / Canceled / Error`. Progress reported incrementally using dynamically generated step sequences based on row count.
- **License enforcement** — file size limits checked against active license tier at load time; offline activation supported via a separate code-based flow.
- **URL-based file loading with auth** — Basic or Bearer auth, credentials stored per-URL or per-domain via `IURLCredential`.
- **Auto-update pipeline** — full download lifecycle (`NoUpdate → CheckingForUpdate → Downloading → DownloadedReadyToInstall`) with release notes as a startup screen payload.

All public methods are wrapped in `errorCatch` / `errorCatchAsync` helpers that capture the calling function name so errors are never silently swallowed and the error log always includes call context.

---

## 4 · High-Performance Grid Component

> **Stack:** React 18 · Sass · JavaScript

A reusable React grid/tree component that stays performant at scale. Renders large JSON and CSV datasets in both grid and tree view modes without degrading as dataset size grows.

**Virtual scrolling** — calculates the visible row range from scroll position and viewport height (`Math.floor(scrollTop / rowHeight)`), maintains a render buffer, mounts ~20–30 row components regardless of total rows. Scroll handlers throttled, row components memoised with `useCallback`.

**Column resizing** — uses the browser's pointer capture API so mouse events aren't lost during fast drags. Width tracked as a delta: `newWidth = lastWidth + (currentX - startX)`, minimum 10px. Double-click auto-fit measures cell text pixel widths using `CanvasRenderingContext2D` and sets the column to the widest found.

**Sticky headers with fixed columns** — DOM split into `.stickyCellContainer` (fixed) and `.normalCellContainer` (scrollable). Fixed columns use CSS `position: sticky` with z-index layering; horizontal scroll synchronised between containers.

**Multi-cell selection** — selected cells tracked as `[startRow, startCol, endRow, endCol]`. Containment check is O(1) per cell.

**Provider/render-props architecture** — `VirtualGridProvider` owns all state and logic. Parent components pass render functions for `Row`, `FilterRow`, and `SummaryRow`, enabling customisation without forking the virtualisation core. Full component hierarchy memoised at every level.

---

## 5 · JSON Generator — VSCode Extension & npm Package

> **Stack:** TypeScript · VSCode Extension API · Webpack · npm

A VSCode extension and companion npm package for generating nested sample JSON data from custom templates. Published to the VSCode Marketplace and npm registry. 520K+ installs.

Developers write a template using a `{{pattern}}` syntax; the generator recursively walks the structure, matching placeholders against a registry of generator functions (UUIDs, names, numbers with ranges, arrays with configurable lengths, nested objects). The template stays within valid JSON so editors provide syntax highlighting out of the box.

**Monorepo:**
- `json-generator-vscode-extension/` — registers a command in the command palette, reads the active editor's template, writes generated output to a new document pane. Bundled with Webpack and distributed as a VSIX via `vsce`.
- `generator-packages/npm/` — exposes the same generation logic as a programmatic API and CLI.

---

## 6 · JSON Viewer Website

> **Stack:** React · Next.js · JavaScript · Axios

The marketing, authentication, and licensing platform for a commercial desktop JSON Viewer product. Handles the full commercial web surface: user registration with email verification, login with device-aware sessions, password reset, account deletion, multi-seat license management with per-device allocation, billing portal integration, invoice requests, and a technical blog.

**Multi-seat license management** — `apiRequestSeat`, `apiRevokeSeat`, `apiDownloadSeat`, `apiLicenseUpgrade`. Device ID tracked per seat; license files downloaded as binary blobs (`responseType: "blob"`).

**Centralised API layer** — a single `api.js` module exports named functions for every operation. Each serialises arguments to `FormData` via a shared `JSONToFormData` helper (stripping nulls/undefineds), attaches the access token from localStorage automatically.

**Programmatic JSON-LD schema generation** — `generateArticleSchema` parses markdown content for embedded images using a regex, constructs a full Article schema with `ImageObject` entries (including `license`, `creditText`, `author`, `acquireLicensePage`), and writes a JSON file to `public/schema/`. The `getSchema` helper injects this into the page's `<head>` as a `<script type="application/ld+json">` tag — server-side only, guarded by `typeof window === "undefined"`.

**Anonymous analytics** — a persistent anonymous UID generated once via `crypto.randomUUID()` and stored in localStorage. All event log calls attach this UID for usage correlation without requiring a logged-in user.

---

*All projects written in TypeScript (except the JSON Viewer website which is JavaScript/JSX). Monorepos managed with PNPM workspaces. Source code available in this repository.*
