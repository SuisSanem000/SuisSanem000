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
3. **`Simin Shojaee Professional Background/` (Source of Truth):**
   - Contains source CV and LinkedIn documentation.
   - Original PDFs reside in `Simin Shojaee Professional Background/resources/`.
   - Structured markdown extractions serve as the single source of truth for all role tailoring.

---

## 3. Current Directory Structure

```text
SuisSanem000/
├── resources/
│   ├── AI analysis/                                # Agent state & logs
│   │   ├── INITIAL_PROMPT.md
│   │   ├── PROJECT_STATE.md
│   │   └── CHANGELOG.md
│   ├── interview/                                  # Output folder for upcoming prep
│   ├── Simin Shojaee Professional Background/      # Candidate profile & source of truth
│   │   ├── cv-simin-shoeibi-fullstack-web-developer.md
│   │   ├── linkedin-profile.md
│   │   └── resources/
│   │       ├── cv-simin-shoeibi-fullstack-web-developer.pdf
│   │       └── linkedin Profile.pdf
│   └── interview-preps/                            # Pre-existing technical knowledge base
│       ├── ai-engineer/
│       ├── web-backend/
│       ├── web-front-end/
│       └── web-fullstck/
└── Simin Shojaee Professional Background/          # Root symlink for path convenience
```

---

## 4. Current State & Last Completed Task
- **Status:** Setup phase complete; waiting for next prompt.
- **Last Completed Task:** 
  - Located, organized, and moved background PDF files into `Simin Shojaee Professional Background/resources/`.
  - Extracted full, exact contents of both PDFs into high-fidelity structured Markdown documents (`cv-simin-shoeibi-fullstack-web-developer.md` and `linkedin-profile.md`).
  - Created and initialized `resources/interview/`.
  - Created and populated `resources/AI analysis/` (`INITIAL_PROMPT.md`, `PROJECT_STATE.md`, and `CHANGELOG.md`).
