# AGENTS.md — Multi-Agent Hierarchy & Subagent Routing

> **Harness Engineering Principle:** Distinct agent roles, bounded context windows, and zero file write collisions.

---

## 1. Agent Roles & Boundaries

| Agent Role | Execution Context | Permissions | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Supervisor / Architect** | Root workspace | Read / Write | Task decomposition, schema contract definitions, sequential merge pipeline. |
| **Builder Agent** | Isolated worktree (`.worktrees/agent-XX`) | Read / Write | Generates implementation strictly within assigned module file. |
| **Test Fixture Agent** | Isolated worktree (`.worktrees/agent-XX`) | Read / Write | Generates offline test fixtures, mocks, and edge-case assertions. |
| **Research Subagent** | Main workspace (ephemeral) | **Read-Only** | Scans large files (.har dumps, 10K-line logs) and returns a concise 15-line summary. |

---

## 2. The Golden Rule of Parallel Sessions
- **Zero File Overlap:** Two agents must **never** edit the same file simultaneously.
- **Shared Files:** Central shared files (e.g., barrel exports `src/utils/index.ts`) are generated deterministically by the Supervisor after all worker branches merge.
- **Git Safety:** Parallel worktrees validate with `tsc --noEmit` in parallel, but funnel through a FIFO sequential mutex queue when rebasing or merging onto `main` to prevent `.git/index.lock` collisions.

