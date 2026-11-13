# AI & LLM Integrations — Quick Review

> ⏱ ~15 min read | Focus: practical patterns JetBridge uses for AI-powered features

---

## What JetBridge Expects You to Know

JetBridge builds SaaS platforms with AI features. You don't need to be an ML engineer — you need to know how to **integrate LLMs into production TypeScript apps**.

---

## 1. Calling LLM APIs (OpenAI / Anthropic)

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Basic completion (OpenAI)
async function summarizeText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful assistant that summarizes text." },
      { role: "user", content: `Summarize this:\n\n${text}` },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  return response.choices[0].message.content ?? "";
}
```

### Grok (xAI) and Groq
Both xAI (Grok) and Groq (the fast inference engine) use the **exact same SDK structure** as OpenAI! You just change the base URL, API key, and model name.

```typescript
// xAI (Grok) using OpenAI SDK
const xai = new OpenAI({ 
  apiKey: process.env.XAI_API_KEY, 
  baseURL: "https://api.x.ai/v1" 
});

async function askGrok() {
  const response = await xai.chat.completions.create({
    model: "grok-beta", // or grok-2
    messages: [{ role: "user", content: "What is the meaning of life?" }],
  });
  return response.choices[0].message.content;
}

// Groq (fast inference) using OpenAI SDK
const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1" 
});
// Call groq.chat.completions.create({ model: "llama3-8b-8192", ... })
```

### Claude (Anthropic)
Claude has its own SDK because it handles the `system` message differently (it's a top-level parameter, not part of the `messages` array).

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function askClaude(text: string) {
  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1000,
    temperature: 0,
    system: "You are a helpful assistant.", // <-- System prompt goes here
    messages: [
      { role: "user", content: text }
    ],
  });
  
  // Claude's response structure is slightly different
  return msg.content[0].type === "text" ? msg.content[0].text : "";
}
```

### Securely Storing API Keys (`process.env`)
You **must never hardcode** API keys directly in source code, or else attackers can scrape them from GitHub. Always store them securely in environment variables.

1. **Local Development (Node.js/Express/Fastify):** 
   Create a `.env` file in the root of your project:
   ```env
   # .env
   OPENAI_API_KEY=sk-proj-xyz123...
   ANTHROPIC_API_KEY=sk-ant-xyz123...
   ```
   
   Make sure to add `.env` to your `.gitignore` file immediately!
   
   Then load it at the top of your app using the `dotenv` package (Next.js does this automatically):
   ```typescript
   // index.ts or server.ts
   import "dotenv/config"; // This reads the .env file and populates process.env
   import { OpenAI } from "openai";

   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); 
   ```

2. **Production:**
   - Instead of a `.env` file, manually copy the key into your hosting dashboard (e.g. AWS, Vercel, Render) under "Environment Variables". 
   - The cloud provider securely injects it into `process.env` when your server spins up.

### Key parameters to know

| Parameter | What it does | Typical value |
|-----------|-------------|---------------|
| `model` | Which LLM to use | `gpt-4o`, `gpt-4o-mini`, `claude-3-sonnet` |
| `temperature` | Randomness (0 = deterministic, 1 = creative) | 0–0.3 for tasks, 0.7–1 for creative |
| `max_tokens` | Output length limit | 500–4000 |
| `system` message | Sets behavior/persona | Always use for consistent output |
| `top_p` | Alternative to temperature (nucleus sampling) | Usually leave at 1 |

---

## 2. Structured Output (JSON from LLMs)

LLMs return strings. For production, you need **structured, validated JSON**.

```typescript
import { z } from "zod";

// Define expected structure
const analysisSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(1),
  keyTopics: z.array(z.string()),
  summary: z.string(),
});

type Analysis = z.infer<typeof analysisSchema>;

async function analyzeReview(review: string): Promise<Analysis> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Analyze the review and respond with JSON only:
        { "sentiment": "positive|negative|neutral", "confidence": 0-1, "keyTopics": [...], "summary": "..." }`,
      },
      { role: "user", content: review },
    ],
    response_format: { type: "json_object" }, // forces JSON output
    temperature: 0,
  });

  const raw = JSON.parse(response.choices[0].message.content ?? "{}");
  return analysisSchema.parse(raw); // validate with Zod
}
```

---

## 3. Streaming Responses

For long outputs, stream tokens to the client in real-time (like ChatGPT UI).

```typescript
// Backend — stream from OpenAI
async function streamCompletion(prompt: string, res: Response) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }
  res.write("data: [DONE]\n\n");
  res.end();
}

// Frontend — consume SSE stream
async function readStream(url: string, onChunk: (text: string) => void) {
  const response = await fetch(url);
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    onChunk(text);
  }
}
```

---

## 4. RAG (Retrieval-Augmented Generation)

> "Give the LLM context from your own data before asking it a question"

### The Problem RAG Solves
LLMs only know what they were trained on (public internet data up to a cutoff date). They don't know anything about **your** company's internal documents, knowledge base, or private data. If you ask GPT-4 "What is our company's refund policy?", it will either hallucinate (make something up) or say "I don't know."

**RAG fixes this** by searching your own data first, then feeding the relevant pieces to the LLM as context before it answers.

### How RAG Works (Step by Step)

```text
1. User asks: "What is our refund policy?"
2. Your app converts the question into an EMBEDDING (a vector of numbers)
3. Your app searches a VECTOR DATABASE for documents with similar embeddings
4. The top 5 most relevant documents are retrieved
5. Your app sends the question + those documents to the LLM
6. The LLM answers based on YOUR data, not its training data
```

### What is an Embedding?

An embedding is just a list of numbers (a vector) that represents the **meaning** of text. Similar meanings = similar numbers.

```typescript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Convert text into a vector of 1536 numbers
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",  // OpenAI's embedding model
  input: "What is our refund policy?",
});

const vector = response.data[0].embedding;
// vector = [0.0023, -0.0091, 0.0152, ... 1536 numbers total]
// These numbers capture the MEANING of the text
// "refund policy" and "return items" would have very similar vectors
// "refund policy" and "pizza recipe" would have very different vectors
```

### Setting Up pgvector (PostgreSQL)

pgvector is a **PostgreSQL extension** that lets you store and search embeddings directly in your existing Postgres database. No separate vector database needed!

```sql
-- Step 1: Enable the pgvector extension (run once)
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create a table to store your documents + their embeddings
CREATE TABLE documents (
  id          SERIAL PRIMARY KEY,
  content     TEXT NOT NULL,               -- The actual text (e.g. a paragraph from your docs)
  metadata    JSONB DEFAULT '{}',          -- Optional: source file, category, date, etc.
  embedding   vector(1536)                 -- The embedding vector (1536 dimensions for OpenAI)
);

-- Step 3: Create an index for fast similarity search
-- (Without this, every search scans ALL rows — very slow on large datasets)
CREATE INDEX ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);  -- 100 clusters, good for up to ~1M rows
```

### Full RAG Implementation with pgvector

```typescript
import OpenAI from "openai";
import { Pool } from "pg";  // PostgreSQL client

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// ============================================================
// STEP 1: INGEST — Store your documents with embeddings
// (Run this once, or whenever you add new documents)
// ============================================================
async function ingestDocument(text: string, metadata: Record<string, any> = {}) {
  // 1a. Convert text to embedding vector
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  const vector = embeddingResponse.data[0].embedding; // number[] with 1536 values

  // 1b. Store text + vector in PostgreSQL
  await db.query(
    `INSERT INTO documents (content, metadata, embedding) VALUES ($1, $2, $3)`,
    [text, JSON.stringify(metadata), JSON.stringify(vector)]
  );
}

// Example: ingest your company docs
await ingestDocument("Our refund policy allows returns within 30 days.", { source: "faq.md" });
await ingestDocument("Shipping takes 3-5 business days.", { source: "faq.md" });
await ingestDocument("Contact support@company.com for help.", { source: "contact.md" });

// ============================================================
// STEP 2: SEARCH — Find documents similar to a question
// ============================================================
async function searchDocuments(question: string, topK = 5) {
  // 2a. Convert the question to an embedding
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });
  const questionVector = embeddingResponse.data[0].embedding;

  // 2b. Search pgvector for the most similar documents
  //     "<=>" is pgvector's COSINE DISTANCE operator (lower = more similar)
  const result = await db.query(
    `SELECT content, metadata, 1 - (embedding <=> $1::vector) AS similarity
     FROM documents
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [JSON.stringify(questionVector), topK]
  );

  return result.rows;
  // Returns: [{ content: "Our refund policy...", similarity: 0.92 }, ...]
}

// ============================================================
// STEP 3: ASK — Send question + relevant docs to the LLM
// ============================================================
async function askWithRAG(question: string): Promise<string> {
  // 3a. Search for relevant documents
  const relevantDocs = await searchDocuments(question, 5);

  // 3b. Build the context string from search results
  const context = relevantDocs
    .map((doc, i) => `[Doc ${i + 1}] (similarity: ${doc.similarity.toFixed(2)})\n${doc.content}`)
    .join("\n\n");

  // 3c. Send question + context to the LLM
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant. Answer the user's question based ONLY on the 
following context. If the context doesn't contain the answer, say "I don't have 
information about that."

Context:
${context}`,
      },
      { role: "user", content: question },
    ],
    temperature: 0, // deterministic — we want factual answers from our data
  });

  return response.choices[0].message.content ?? "";
}

// Usage:
const answer = await askWithRAG("How long do I have to return an item?");
// → "According to our refund policy, you can return items within 30 days."
```

### Chunking (Splitting Large Documents)

You can't embed an entire 50-page PDF as one embedding — it's too large and the meaning gets diluted. You need to **chunk** it into smaller pieces first.

```typescript
// Split a large document into overlapping chunks
function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim()) chunks.push(chunk);
  }

  return chunks;
}

// Ingest a large document by chunking it first
async function ingestLargeDocument(fullText: string, source: string) {
  const chunks = chunkText(fullText);
  for (const chunk of chunks) {
    await ingestDocument(chunk, { source });
  }
}
```

### pgvector Distance Operators

| Operator | Measures | Use when |
|----------|---------|----------|
| `<=>` | Cosine distance | **Most common** — best for text similarity |
| `<->` | L2 (Euclidean) distance | When magnitude matters |
| `<#>` | Inner product (negative) | Pre-normalized vectors |

**Vector DBs:** pgvector (PostgreSQL extension — **recommended if you already use Postgres**), Pinecone, Weaviate, Supabase (uses pgvector under the hood)

---

## 5. Production Patterns

### Retry with exponential backoff

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 429 || error?.status >= 500) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error; // non-retryable error
    }
  }
  throw new Error("Max retries reached");
}
```

### Token management

- **Count tokens before sending** — avoid hitting limits
- **Chunk large documents** — split into ~2000 token chunks with overlap
- **Cost tracking** — log `usage.total_tokens` from every response

```typescript
// Simple text chunking (split by paragraphs, keep under token limit)
function chunkText(text: string, maxChars = 4000): string[] {
  const paragraphs = text.split("\n\n");
  const chunks: string[] = [];
  let current = "";
  for (const para of paragraphs) {
    if ((current + para).length > maxChars) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += "\n\n" + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// Cost tracking
const response = await openai.chat.completions.create({ ... });
console.log(`Tokens used: ${response.usage?.total_tokens}, cost: $${(response.usage?.total_tokens ?? 0) * 0.0000025}`);
```

### Prompt engineering tips

1. **Be specific** — "Extract names as a JSON array" not "find the names"
2. **Few-shot examples** — include 2-3 example input/output pairs
3. **System message** — define role, format, constraints
4. **Chain of thought** — "Think step by step before answering"

```typescript
// Few-shot prompting example
const messages = [
  { role: "system", content: "Classify the sentiment as positive, negative, or neutral." },
  { role: "user", content: "I love this product!" },
  { role: "assistant", content: "positive" },      // example 1
  { role: "user", content: "Terrible experience." },
  { role: "assistant", content: "negative" },       // example 2
  { role: "user", content: actualReviewText },       // real input
];
```

---

## 6. Common AI Features in SaaS (what JetBridge builds)

| Feature | How it works |
|---------|-------------|
| **Document analysis** | Upload → chunk text → LLM extracts structured data |
| **Chatbot / copilot** | RAG + conversation history + system prompt |
| **Auto-categorization** | LLM classifies items into predefined categories |
| **Summarization** | Send text → get summary (with length/style control) |
| **Code generation** | Structured prompts → LLM generates code → validate |
| **Search** | Embed query → vector search → rank results |

---

## Key Terms to Know

- **Token** — ~4 characters. GPT-4o: 128K context window, $2.50/1M input tokens
- **Embedding** — vector representation of text for similarity search
- **RAG** — Retrieval-Augmented Generation (search → inject context → generate)
- **Fine-tuning** — training a model on your data (expensive, rarely needed)
- **Prompt engineering** — crafting inputs to get better outputs (cheap, usually enough)
- **Hallucination** — LLM confidently generating false information
- **Context window** — max input + output tokens (GPT-4o: 128K)
