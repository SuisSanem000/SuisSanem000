# Part 1 — Step-by-Step: How to Show Your Laptop Setup (First 5 Minutes)

> **Goal:** When Luis says *"Fire up your laptop and show us your setup"*, do not just open an empty chat window. Walk them through these **4 steps** to prove you practice **Harness Engineering**—controlling AI with memory files, rules, skills, and independent verification.

---

## Step 1: Show Your Project Memory & Rules File (`ai-state.md` / `CLAUDE.md`)

- **What You Do on Screen:**
  - Open your IDE and click on your state/rules file (`ai-state.md` or `CLAUDE.md`).
- **Why Interviewers Love This:**
  - Amateur developers repeat context in every prompt. Senior engineers persist project context, architectural rules, and forbidden actions on disk so every new agent session starts with full memory.
- **What to Say:**
  - *"Before I ask an agent to write anything, I maintain a living state and rules file in the repository. It defines the architecture, folder boundaries, strict constraints, and test commands. Whenever I start a fresh session or compact the context window, the agent reads this file first so it never loses track of our engineering standards."*

---

## Step 2: Show Your Dual Agent Environment (Antigravity IDE + Claude Code via OpenRouter)

- **What You Do on Screen:**
  - Show your **Antigravity IDE** workspace (pointing out the agent panel and skills), and show your terminal/VS Code where **Claude Code** is connected through your **OpenRouter API token**.
- **Why Interviewers Love This:**
  - It shows you are not locked into one single vendor chat box; you route headless and terminal agents through OpenRouter for cost control, rate-limit visibility, and model selection (such as Claude Sonnet, Gemini Flash, or DeepSeek).
- **What to Say:**
  - *"I use two primary agent environments depending on the task. For interactive multi-file architecture and subagent delegation, I use Antigravity IDE. In parallel, I run Claude Code in the terminal and VS Code connected through my OpenRouter API token. Routing through OpenRouter lets me switch models depending on task complexity and track token usage across parallel sessions."*

---

## Step 3: Show How You Separate Rules, Skills, and Subagents

- **What You Do on Screen:**
  - Point to your skills directory (`SKILL.md` files) and explain how subagents keep your main context clean.
- **Why Interviewers Love This:**
  - Luis specifically asked about **agents, skills, and plugins**. Explaining *why* you don't dump everything into one giant prompt shows you understand context window degradation ("lost in the middle").
- **What to Say:**
  - *"I keep my main agent's context window as small and sharp as possible. Global rules stay tiny. For specialized tasks—like reverse-engineering a marketplace API or scaffolding a connector—I use on-demand Skills that only load into memory when triggered. And if I need to inspect a massive log or network capture, I delegate that to a read-only Research Subagent so the raw noise never pollutes my main coding agent's context."*

---

## Step 4: Show Your Independent Verification Loop (Terminal Tests + Copilot Diff Review)

- **What You Do on Screen:**
  - Show the terminal panel where the agent runs tests/linters automatically, and point to the Git source-control diff view where **GitHub Copilot Code Review** runs.
- **Why Interviewers Love This:**
  - It answers the #1 fear founders have about AI coding: *"How do you know the AI didn't write broken or insecure logic?"*
- **What to Say:**
  - *"I never trust an LLM's first output blindly. My setup forces the agent to run the test suite and static type checker in the terminal and fix its own errors before reporting back. Finally, before I commit, I open the Git diff and run GitHub Copilot Code Review as a second, independent model to catch blind spots like missing timeouts, race conditions, or unhandled nulls."*

