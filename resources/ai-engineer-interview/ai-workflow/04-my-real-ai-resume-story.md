# My Real AI Story, Daily Workflow & Tool Stack

> **Honest Positioning:** Built high-reliability application-level systems with strict schema checks, real web-crawling infrastructure, and developer tooling.

---

## 1. My Real Experience: What I Did (and Did NOT Do)

- **What I do NOT claim:** No custom GPU model training or low-level ML weight optimization.
- **QueryLaw (AI Legal Platform — 95%+ Reliability via Schema Gates):**
  - Problem: Legal outputs cannot afford hallucinations or invalid formats.
  - Solution: Built a strict validation harness around the LLM using **structured prompts**, **JSON Schema / AJV validation**, and an automated repair retry loop if output violated the schema.
  - *Relevance to AI Engineering:* The exact same architecture validates AI-generated structured data, guarantees deterministic outputs, and catches API schema breakages.
- **Parsaiane (News Crawler for 150+ Sites — 60K+ Daily Users):**
  - Scraped and normalized 150+ news sites, handled messy HTML/JSON, and integrated OpenAI APIs for automated summarization.
- **Dadroit JSON Generator (VS Code Extension — 630K+ Installs):**
  - Built and shipped in 3 days. Proves speed of execution and deep understanding of developer tools and extensions.

---

## 2. My 5-Step Daily AI Workflow ("Harness Engineering")

Instead of "chatting with AI", I use **Harness Engineering**—surrounding the AI with architectural rules, schemas, tests, and diff reviews:

1. **Context & Rules:** Set up living context files (`CLAUDE.md`, `AGENTS.md`) defining system requirements, folder boundaries, and test commands.
2. **Plan Mode First:** Use `/plan` in Antigravity or `Shift + Tab` in Claude Code to investigate codebase in read-only mode and approve a step-by-step plan before editing files.
3. **Data Contracts First:** Define strict data schemas (JSON Schema, data models) and custom error classes before writing logic.
4. **Autonomous Terminal Loop:** Agent runs test suites and linters in the terminal and self-corrects errors directly from stack traces.
5. **Diff Review & Git Commit:** Run **GitHub Copilot Code Review** on the Git diff in VS Code, verify the code myself, and make a clean atomic commit.

---

## 3. My Tool Stack: Antigravity IDE, Claude Code (OpenRouter) & Copilot

- **Antigravity IDE (Workbench):**
  - Primary IDE for multi-file development, inline targeted edits (`Cmd + I`), and on-demand **Skills (`SKILL.md`)** that load playbooks progressively without filling the context window.
  - Uses read-only **Research Subagents** for heavy tasks (reading large JSON logs or traffic dumps) to keep the main coding context clean.
- **Claude Code via OpenRouter Token (Terminal & VS Code):**
  - Run Claude Code CLI (`claude`) connected via OpenRouter API token (`ANTHROPIC_BASE_URL` & `ANTHROPIC_AUTH_TOKEN`).
  - Active project: **API Schema Drift & Response Monitor** with `CLAUDE.md`, Plan Mode, and custom commands.
  - Gives unified billing, model flexibility (Claude 3.7/3.5 Sonnet, Gemini, DeepSeek), and scriptable terminal workflows.
- **GitHub Copilot Code Review (Independent Second Check):**
  - An independent model reviews the Git diff in VS Code and on GitHub PRs to catch missing timeouts, unhandled null values, or security flaws before human review.
