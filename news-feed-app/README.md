# News Feed App

A full-stack tech news aggregation platform I built solo, end-to-end. It crawls a curated list of developer-focused sources, enriches every article with AI-generated metadata using OpenAI, and serves a personalised feed via a React client. The project is structured as a PNPM monorepo with four distinct apps, each with a clear responsibility.

---

## What it Does

The platform continuously crawls RSS feeds and site-specific scrapers for sources like Hacker News, Lobsters, the MongoDB developer blog, Splunk, Apache Cassandra, SQLite news, and CockroachDB. Each article is stored in PostgreSQL, then passed through an OpenAI pipeline that produces a clean title, a bullet-point summary, an industry category, an article type, and a 0–100 viral potential score. The client presents the enriched feed with category filters and per-article read tracking persisted in IndexedDB.

Separately, I built a standalone AI experimentation sub-app (`EyeAI`) to benchmark OpenAI against Google Cloud Vertex AI for the same classification task — comparing output quality, latency, and cost across multiple rounds of real article data.

---

## Monorepo Structure

The `eye-server/` directory is a PNPM workspace containing four apps:

**`EyeServer`** — The production server. Handles crawling, PostgreSQL persistence, the OpenAI enrichment pipeline, static JSON generation, and image caching.

**`EyeAI`** — A standalone experimentation app. Used to run batches of articles through both OpenAI and Vertex AI, capture responses in JSON files, and compare results. Includes tiktoken-based token counting and per-call cost calculation in dollars.

**`EyeCustomCrawlers`** — An earlier crawler prototype using SQLite as the backing store. Contains the site-specific scraping helpers before they were consolidated into `EyeServer`.

**`EyeTest`** — A minimal Vite client for testing the server's API responses during development.

---

## Architecture

### Crawling

The main crawler (`crawler.ts`) orchestrates two categories of sources. RSS-based sources go through a generic `feedparser` pipeline that fetches the feed, extracts articles, fetches the full page HTML via Axios, and passes it to Cheerio for content extraction. Sources without RSS — Hacker News, Lobsters — have dedicated crawl helpers that implement site-specific scraping logic. Every crawl session is keyed with a UUID so logs and articles can be traced back to a specific run.

Custom crawlers for individual blogs (MongoDB, Splunk, Cassandra, SQLite, CockroachDB) are isolated modules that handle pagination, image extraction, and DOM parsing specific to each site's structure.

### OpenAI Enrichment Pipeline

The pipeline is split into two operations that can be run independently:

**Article enrichment** — Given a title and body text, the prompt asks OpenAI to produce a new concise title (max 70 chars), a bullet-point summary (500–750 characters, 2–4 points), an industry index from a predefined list, a content type index from a predefined list, and a viral tendency score from 0–100. Industry and type indices reference JSON config files (`industries.json`, `types.json`) so the categories can be updated without changing prompt logic.

**Relativity scoring** — A second prompt scores each article's relevance to a set of target job titles (`jobTitles.json`) on a −100 to +100 scale, with a brief reason string. This was used to filter out off-topic content from the feed.

Both prompts use an **informing call pattern**: before processing a batch, a context-priming prompt is sent once to establish the category definitions in the model's session memory. Individual article prompts then reference those categories by index, which keeps per-article prompts short and reduces token costs.

```typescript
// Construct the informing call — sent once per batch session
let prompt = `InformingCallForCategorization: remember the following "Industries", 
"Job Titles," and "Types" with their respective descriptions...
Industries: ${industryNames}
Types: ${typeNames}
Job Titles: ${jobTitlesNames}`;
```

### Response Parsing and Robustness

LLM responses in practice don't always arrive as clean JSON. The `extractAndParseJSON` helper handles both direct JSON objects and responses wrapped in markdown code fences (` ```json ... ``` `). Before parsing, it strips embedded newlines inside JSON string values using a regex that targets only content within quotes — preventing `JSON.parse` from choking on multi-line summary text.

```typescript
cleanedString = cleanedString.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
    return match.replace(/(?:\r\n|\r|\n)/g, ' ');
});
```

Response validation checks that all required fields (`newTitle`, `summary`, `industry`, `type`, `viralTendency`) are present before the result is written to the database.

### Token Cost Tracking

The `EyeAI` app uses `@dqbd/tiktoken` to count tokens on both the input and output of every API call, then calculates per-call cost in dollars against a model pricing config. This made it practical to compare API cost across different models and prompt strategies during the Vertex AI / OpenAI benchmarking work.

### Static Generation

Rather than serving database queries at read time, `EyeServer` includes static generator scripts that materialise the full article dataset as pre-built JSON files, and download + cache article images locally. These files are served directly, keeping the client fast without a live DB query on every load.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Package management | PNPM Workspaces |
| Primary database | PostgreSQL |
| Prototype/crawl DB | SQLite |
| AI enrichment | OpenAI Chat Completions API |
| AI experimentation | Google Cloud Vertex AI (`@google-cloud/vertexai`) |
| Token counting | `@dqbd/tiktoken` |
| HTTP | Axios |
| RSS parsing | `feedparser` |
| HTML parsing | Cheerio |
| Build/dev | Vite |

---

## What I Learned

Designing the AI pipeline forced me to think carefully about the boundary between prompt engineering and application logic. Putting category definitions in JSON config files — rather than hard-coding them into prompts — was the right call: it made the categories easy to update and kept the prompt construction code generic. The two-stage approach (informing call + per-article call) reduced per-article token usage significantly compared to repeating full category definitions in every prompt.

The biggest practical challenge was JSON parsing reliability. The response validation and cleaning code went through several iterations before it handled the full range of real API responses without silent failures. Wrapping the parser in a function that logs both the raw content and the error on failure made debugging that much faster.
