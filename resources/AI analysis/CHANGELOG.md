# Changelog

All updates, actions, and structural changes performed in this repository are recorded here chronologically.

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

