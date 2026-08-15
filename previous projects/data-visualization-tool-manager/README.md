# Data Visualization Tool Manager

The client-side manager layer for a commercial desktop data visualization application (JSON, CSV, and XML viewer). This module is responsible for coordinating all application state — file lifecycle, multi-view management, SQL query execution, find/filter refiners, task tracking, settings, licensing, and auto-updates — via an event-driven architecture built around a typed `EventTarget` subclass.

## Tech Stack

TypeScript · IndexedDB (`idb`) · Custom Event System · LocalStorage · GUID-based identity

---

## Architecture

The core of this module is `TManager`, a class that extends the browser's native `EventTarget`. Rather than using a third-party state management library, the manager communicates with the rest of the application through a typed event map interface:

```typescript
export interface IManagerEventMap {
    'startupScreen':     CustomEvent<IStartupScreen>;
    'updateLicense':     CustomEvent<ILicense>;
    'updateView':        CustomEvent<IViewUpdate>;
    'updateViewSync':    CustomEvent<IViewUpdate>;
    'updateViews':       CustomEvent<IViewUpdates>;
    'updateStatus':      CustomEvent<IStatusUpdate>;
    'updateContent':     CustomEvent<IContentUpdate>;
    'updateSettings':    CustomEvent<ISettings>;
    'updateSettingsSync': CustomEvent<ISettings>;
    'error':             CustomEvent<IError>;
    'openURLResult':     CustomEvent<IOpenURLResult>;
    'message':           CustomEvent<IMessage>;
}
```

The `addEventListener` and `removeEventListener` overloads are typed to this map, so callers get full IDE autocomplete and compile-time safety when subscribing to events. The sync/async variants (`updateView` vs `updateViewSync`) handle cases where the UI needs to reflect state immediately vs. on the next tick.

All public methods are wrapped in `errorCatch` / `errorCatchAsync` helpers that capture the calling function name and report structured errors through the event system rather than throwing, keeping failure handling consistent across the entire surface area.

---

## Key Features

**Multi-file, multi-view state.** Each open file maintains a list of independent views. Each view tracks its own column configuration, row count, filter mode, SQL editor state, active refiners, and find results. The state hierarchy (`IFile[] → IView[] → IRefiner[]`) is persisted to IndexedDB via the `idb` library, with view cloning support for duplicating complex configurations.

**SQL query execution and refiners.** Views can operate in two filter modes: a UI-driven refiner mode and a direct SQL editor mode. Refiners support both Find and Filter types with highlight colour coding, inverse matching, and column scoping. The editor tracks syntax error state and reports it back to the UI through the event system.

**Task pipeline with progress tracking.** Long-running operations (file load, query, find, filter, export, download) are modelled as tasks with an explicit state machine: `Started → InProgress → Finished / Canceled / Error`. Progress is reported incrementally using dynamically generated step sequences based on row count, so the UI shows realistic progress rather than a binary start/done.

**License enforcement.** File size limits are checked against the active license tier at load time. Oversized files trigger upgrade prompts with generated banner text; offline activation is supported via a separate code-based flow. License state is tracked as `Active` or `Expire` and reflected in the settings surface.

**URL-based file loading with authentication.** Files can be loaded from remote URLs with Basic or Bearer auth. Credentials are stored per-URL or per-domain and managed through a dedicated `IURLCredential` interface. URL validation returns typed `EURLValidationResult` codes covering the full range of HTTP status codes plus custom network error cases.

**Auto-update pipeline.** The manager tracks an update lifecycle (`NoUpdate → CheckingForUpdate → UpdateAvailableButNotDownloaded → Downloading → DownloadedReadyToInstall`) with download progress, latest version tracking, and release notes stored as a startup screen payload for display on next launch.

---

## Notable Implementation Details

The `errorCatch` / `errorCatchAsync` wrappers are applied to every public method, so errors are never silently swallowed. Each captures the calling function name as a string so the error log includes call context without relying on stack trace parsing.

The `TRange` type alias (`[number, number, number, number]`) encodes a rectangular cell selection as `[startRow, startCol, endRow, endCol]`, used consistently across find results, export scope, and content update events — keeping the coordinate system uniform across the entire module.
