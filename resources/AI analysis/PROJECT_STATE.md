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
2. **`resources/interview-preps/` (Role-Based Interview Prep & Output Folders):**
   - Organized by track (`ai-engineer/`, `web-backend/`, `web-front-end/`, `web-fullstck/`).
   - Company-specific preps created on user request (e.g., `resources/interview-preps/web-front-end/X.CO/`) live inside the matching track (note: `resources/interview/` was removed after `X.CO/` moved into `resources/interview-preps/web-front-end/X.CO/`).
   - Do **not** generate unprompted prep content; wait for explicit user instructions.
3. **`resources/Simin Shojaee Professional Background/` (Source of Truth):**
   - Contains source CV and LinkedIn documentation.
   - Original PDFs reside in `resources/Simin Shojaee Professional Background/resources/`.
   - Structured markdown extractions serve as the single source of truth for all role tailoring.
4. **Automatic Commit & Push Rule (MANDATORY EVERY TURN/CHANGE):**
   - Whenever **any** task, edit, or file modification is executed in this repository, **ALWAYS** end by staging all changes (`git add -A`), creating a clear atomic commit, and pushing (`git push origin main`) so local and remote repositories remain continuously in sync.
   - **Post-Push Verification:** Always run `git status` after pushing and explicitly confirm both `nothing to commit, working tree clean` and `Your branch is up to date with 'origin/main'` before replying. Also ensure Markdown files end with clean formatting (proper trailing newline) so IDE/editor save hooks do not immediately dirty the working tree.
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
    └── interview-preps/                            # Technical knowledge base & company preps
        ├── ai-engineer/
        ├── web-backend/
        ├── web-front-end/
        │   ├── X.CO/                               # EXCO Game Studio prep (Front End Game Developer)
        │   │   ├── 01_company_analysis.md
        │   │   ├── 02_role_breakdown.md
        │   │   ├── 03_candidate_profile.md
        │   │   └── 04_interview_qa_playbook.md
        │   └── resources/
        │       └── info-about-EXCO-Game-Studio.md
        └── web-fullstck/
```

---

## 4. Current State & Last Completed Task
- **Status:** Completed X.CO (EXCO Game Studio) screening interview preparation suite and reinforced strict post-task commit, push, and clean-tree verification workflow. Ready for follow-up or next-round prep.
- **Last Completed Task:** 
  - Committed trailing-newline formatting diffs and relocation of `X.CO/` to `resources/interview-preps/web-front-end/X.CO/`, reinforced Rule 4 in `PROJECT_STATE.md` (mandatory `git add -A` + `git commit` + `git push origin main` + final `git status` clean-tree check), updated directory structure in `PROJECT_STATE.md` and `CHANGELOG.md`, and pushed to `origin/main`.
  - Previously completed: Analyzed local EXCO briefing (`resources/interview-preps/web-front-end/resources/info-about-EXCO-Game-Studio.md`), candidate CV/LinkedIn markdowns, GitHub profile (`github.com/SuisSanem000`), and online intelligence on EXCO Game Studio, and generated `01_company_analysis.md` through `04_interview_qa_playbook.md` (now at `resources/interview-preps/web-front-end/X.CO/`).
