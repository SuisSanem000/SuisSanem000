# Project State

## 1. Project Overview
This repository manages Simin Shoeibi's (Shojaee) professional profile, technical portfolio, career background, and tailored interview preparation materials across full-stack engineering, backend systems, and AI engineering roles.

---

## 2. Workspace Rules
1. **`resources/AI analysis/` (Exclusive AI State Workspace):**
   - Strictly reserved for internal agent state, logs, and prompt references.
   - Do **not** place technical or interview prep materials here.
   - Maintain and update after every task:
     - `PROJECT_STATE.md`: Living overview, active rules, directory status, and last completed task.
     - `CHANGELOG.md`: Chronological log of actions, file creations, and updates performed.
     - `INITIAL_PROMPT.md`: Reference copy of the guiding framework and rules.
2. **`resources/interview/` (Exclusive Output Folder):**
   - Reserved exclusively for upcoming tailored interview preparation materials.
   - Do **not** generate unprompted content here; wait for explicit instructions from the user before generating new materials.
3. **`resources/Simin Shojaee Professional Background/` (Source of Truth):**
   - Contains source CV and LinkedIn documentation.
   - Original PDFs reside in `resources/Simin Shojaee Professional Background/resources/`.
   - Structured markdown extractions serve as the single source of truth for all role tailoring.
4. **Automatic Commit & Push Rule:**
   - Whenever any task or file modification is executed in this repository, immediately stage all changes, create a clear atomic commit, and push (`git push origin main`) so local and remote repositories remain continuously in sync.
5. **No Folder Shortcuts / No Symlinks Rule (CRITICAL):**
   - **NEVER** create symlinks, aliases, or folder shortcuts (`ln -s`, etc.) inside any directory in this repository. Always work strictly with real directories and exact paths; never create convenience/compatibility symlinks.

---

## 3. Current Directory Structure

```text
SuisSanem000/
└── resources/
    ├── AI analysis/                                # Agent state & logs
    │   ├── INITIAL_PROMPT.md
    │   ├── PROJECT_STATE.md
    │   └── CHANGELOG.md
    ├── Simin Shojaee Professional Background/      # Candidate profile & source of truth
    │   ├── cv-simin-shoeibi-fullstack-web-developer.md
    │   ├── linkedin-profile.md
    │   └── resources/
    │       ├── cv-simin-shoeibi-fullstack-web-developer.pdf
    │       └── linkedin Profile.pdf
    └── interview-preps/                            # Pre-existing technical knowledge base
        ├── ai-engineer/
        ├── web-backend/
        ├── web-front-end/
        └── web-fullstck/
```
*(Note: `resources/interview/` is reserved for upcoming tailored interview preparation outputs upon user request.)*

---

## 4. Current State & Last Completed Task
- **Status:** Setup phase complete; waiting for next prompt.
- **Last Completed Task:** 
  - Removed all previously created folder symlinks (`Simin Shojaee Professional Background`, `resources/ai-analysis`, `resources/simin-shoeibi-professional-background`) from the repository and Git history index.
  - Recorded the strict **No Folder Shortcuts / No Symlinks** rule in `PROJECT_STATE.md` and `CHANGELOG.md`.
  - Committed and pushed changes to `origin/main`.
