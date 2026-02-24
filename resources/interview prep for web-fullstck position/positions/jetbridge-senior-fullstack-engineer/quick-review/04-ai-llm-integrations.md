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

// Basic completion
async function summarizeText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful assistant that summarizes text." },
      { role: "user", content: `Summarize this:\n\n${text}` },
    ],
    temperature: 0.3,     // lower = more deterministic
    max_tokens: 500,      // limit output length
  });

  return response.choices[0].message.content ?? "";
}
```

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

```
User Question → Search your data (vector DB) → Get relevant docs → 
Send docs + question to LLM → LLM answers using YOUR data
```

```typescript
// Simplified RAG flow
async function askWithContext(question: string): Promise<string> {
  // 1. Create embedding for the question
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });

  // 2. Search vector DB for similar documents
  const relevantDocs = await vectorDb.search(
    embedding.data[0].embedding,
    { topK: 5 }
  );

  // 3. Build prompt with context
  const context = relevantDocs.map(d => d.text).join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: `Answer based on this context:\n\n${context}` },
      { role: "user", content: question },
    ],
  });

  return response.choices[0].message.content ?? "";
}
```

**Vector DBs:** Pinecone, Weaviate, pgvector (PostgreSQL extension), Supabase

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

### Prompt engineering tips

1. **Be specific** — "Extract names as a JSON array" not "find the names"
2. **Few-shot examples** — include 2-3 example input/output pairs
3. **System message** — define role, format, constraints
4. **Chain of thought** — "Think step by step before answering"

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
