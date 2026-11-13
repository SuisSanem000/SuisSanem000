# Changelog

All updates, actions, and structural changes performed in this repository are recorded here chronologically.

---

## [2026-11-13] — Added 10-Minute X.CO Pre-Interview Cheat Sheet

### Added
- **`resources/interview-preps/web-front-end/X.CO/00_10_MIN_CHEAT_SHEET.md`**: Consolidated all EXCO Game Studio intelligence, 30-second pitch, verified metrics/GitHub highlights, 10 rapid-fire Q&As (screening, Serhii technical, Jeremie CFO/ROI), and closing questions into a single 10-minute last-minute cheat sheet.

### Updated
- Updated `PROJECT_STATE.md` and `CHANGELOG.md` and pushed to `origin/main`.

---

## [2026-11-13] — Reinforce Auto-Commit/Push Rule & Sync X.CO File Formatting

### Updated
- **`resources/AI analysis/PROJECT_STATE.md`**: Reinforced Rule 4 (Automatic Commit & Push Rule) to explicitly require `git add -A`, `git commit`, `git push origin main`, clean trailing-newline formatting, and a final `git status` check confirming `nothing to commit, working tree clean` after every change.
- **`resources/interview-preps/web-front-end/X.CO/01_company_analysis.md`–`04_interview_qa_playbook.md`**: Committed and pushed trailing-newline working-tree diffs and relocation from `resources/interview/X.CO/` to `resources/interview-preps/web-front-end/X.CO/` (`2cd74884`), and updated `PROJECT_STATE.md` directory map accordingly.

---

## [2026-11-13] — EXCO Game Studio (X.CO) Screening Interview Prep Created

### Added
- **`resources/interview/X.CO/01_company_analysis.md`**: Studio & market intelligence on EXCO Game Studio (`exco.gg`), Tequity RGS, SOFTSWISS distribution, GAMEX mechanics, and CFO strategic angles for Jeremie.
- **`resources/interview/X.CO/02_role_breakdown.md`**: Front End Game Developer breakdown, Serhii/Jeremie screening focus, and honest gap analysis.
- **`resources/interview/X.CO/03_candidate_profile.md`**: Tailored 9+ year narrative and verified GitHub portfolio (`github.com/SuisSanem000`) mapped to HTML5 slot client and shared tooling needs.
- **`resources/interview/X.CO/04_interview_qa_playbook.md`**: 30-second pitch, 14 customized Q&As (screening, technical RGS/rendering/state, CFO ROI/velocity), and 5 targeted questions to ask Jeremie and Serhii.

### Updated
- Updated `PROJECT_STATE.md` and `CHANGELOG.md` reflecting current directory structure and completed interview preparation deliverables.

---

## [2026-11-13] — Policy Update: No Symlinks / Folder Shortcuts

### Added
- **No-Symlinks Policy:** Formalized Rule 5 in `PROJECT_STATE.md`: strictly prohibit creating symlinks, aliases, or folder shortcuts anywhere in the repository.

### Removed
- Removed all previously created folder symlinks from Git (`Simin Shojaee Professional Background`, `resources/ai-analysis`, `resources/simin-shoeibi-professional-background`).

---

## [2026-11-13] — Workflow Policy: Automatic Commit and Push Rule Added

### Added
- **Auto-Sync Policy:** Formalized Rule 4 in `PROJECT_STATE.md`: all future changes, tasks, or file modifications must be immediately committed and pushed to `origin/main`.

---

## [2026-11-13] — Workspace Organization & AI State Initialization

### Added
- **`resources/AI analysis/INITIAL_PROMPT.md`**: Stored the initial setup instructions and workspace rules verbatim for future session reference.
- **`resources/AI analysis/PROJECT_STATE.md`**: Initialized state document detailing project scope, workspace rules, directory layout, and active state.
- **`resources/AI analysis/CHANGELOG.md`**: Initialized chronological tracking of all actions in the repository.
- **`resources/interview/`**: Created dedicated, empty output directory reserved for upcoming tailored interview preparation materials.
- **`Simin Shojaee Professional Background/resources/`**: Dedicated subfolder created to store raw binary PDF assets.
- **`Simin Shojaee Professional Background/cv-simin-shoeibi-fullstack-web-developer.md`**: Complete, exact extraction and structured Markdown conversion of the candidate's CV.
- **`Simin Shojaee Professional Background/linkedin-profile.md`**: Complete, exact extraction and structured Markdown conversion of the candidate's LinkedIn profile.

### Changed
- Standardized candidate background folder name to `resources/Simin Shojaee Professional Background/` with root alias symlinks for seamless cross-referencing.
- Moved `cv-simin-shoeibi-fullstack-web-developer.pdf` and `linkedin Profile.pdf` into `Simin Shojaee Professional Background/resources/`.
- Renamed `resources/ai-analysis` to `resources/AI analysis/` with compatibility symlink.

### Completed
- Background file organization and full markdown parsing complete.
- AI state tracking initialized. Ready for upcoming interview preparation instructions.

