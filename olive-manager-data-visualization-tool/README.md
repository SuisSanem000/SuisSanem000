# Olive Manager - Data Visualization Tool Client Manager

A sophisticated TypeScript client manager for CSV and JSON data analytics and visualization, featuring advanced file management, query execution, and licensing systems.

## Tech Stack

- **TypeScript** - Pure TypeScript implementation with advanced type system
- **Custom Event System** - Event-driven architecture with typed events
- **Local Storage API** - Client-side data persistence
- **Complex State Management** - Multi-file, multi-view state orchestration

## Purpose

Olive Manager serves as the core client-side management layer for a data analytics and visualization tool. It orchestrates file operations, data processing, query execution, user settings, and licensing for CSV/JSON datasets. The architecture demonstrates advanced TypeScript patterns and event-driven design.

## Main Features

- Multi-file CSV/JSON management with concurrent operations
- SQL-like query execution engine with progress tracking
- Asynchronous task orchestration system
- Multi-tier licensing with file size restrictions
- View management with refiners and filters
- Find/replace across datasets
- Export functionality with format conversion
- Settings persistence and synchronization
- URL-based file loading with authentication
- Offline license activation support

## Complex Features - Technical Details

### 1. Event-Driven Architecture with Typed Custom Events
Implements a sophisticated publish-subscribe system using custom typed events extending `EventTarget`.

**Technical Implementation:**
```typescript
export interface IManagerEventMap {
    'updateView': CustomEvent<IViewUpdate>;
    'updateStatus': CustomEvent<IStatusUpdate>;
    'updateContent': CustomEvent<IContentUpdate>;
    // ... more typed events
}
```
- Type-safe event dispatching and subscription
- Dual dispatch pattern: async (`updateView`) and sync (`updateViewSync`)
- UI synchronization without tight coupling
- Event payload interfaces ensure compile-time safety

### 2. Asynchronous Task Pipeline with Progress Tracking
Multi-phase task orchestration with real-time progress updates and cancellation support.

**Technical Implementation:**
- Task state machine: `Started → InProgress → Finished/Canceled`
- Progress simulation with dynamic step generation based on file size
- Partial task updates using selective object spreading
- Interval-based progress polling with cleanup
- Memory-efficient: only updates changed fields in task array

**Algorithm:**
```typescript
// Dynamic progress step generation
progressSteps = generateDynamicProgressSteps(rowCount, stepCount)
for each step:
    await delay(step.timeTaken)
    generateData(step.rowsToGenerate)
    updateTask({ progress: step.progress })
    dispatchEvent('updateStatus', partialUpdate)
```

### 3. Multi-View State Management with Refiners
Complex state tree managing multiple files, each with multiple views, each with multiple refiners.

**Technical Implementation:**
- Hierarchy: `Files[] → Views[] → Refiners[] + Editors`
- Each view maintains independent: columns, filters, row counts, SQL editors
- Refiner cloning for view duplication
- Local storage persistence with selective serialization
- Current file/view pointers for O(1) access

**State Structure:**
```typescript
files: IFile[] {
  views: IView[] {
    refiners: IRefiner[]
    editor: { refiner?, state, query }
    columns: IColumn[]
  }
}
```

### 4. License-Based Feature Gating
Dynamic feature restriction based on license tier and file size.

**Technical Implementation:**
- Size limits array: `[5MB, 50MB, 500MB, Unlimited]`
- Binary search to determine required license level
- Runtime feature enablement/disablement
- Banner generation for upgrade prompts
- Redaction for oversized files on lower tiers

## System Design Approach

**Event-Driven Manager Pattern**
- Central `TManager` class extends `EventTarget`
- Emits typed events for all state changes
- UI components subscribe to specific event types
- Decouples business logic from presentation layer
- Single source of truth for application state

**State Machine Pattern**
- Tasks follow explicit state transitions
- File operations tracked through lifecycle states
- Editor states (editing, executing query, idle)
- License states (trial, active, expired, offline)

**Repository Pattern with Local Storage**
- `loadFromLocalStorage` / `saveToLocalStorage` abstraction
- Automatic persistence on state changes
- Files, settings, recent files tracked separately
- GUID-based file identification for uniqueness

**Error Boundary Pattern**
- `errorCatch` and `errorCatchAsync` wrappers
- Every public method wrapped for error handling
- Consistent error reporting via event system
- Function name tracking for debugging

## Algorithms & Data Structures

**Data Structures:**

- **Nested Object Hierarchy** - File → View → Refiner tree structure
- **Hash Map (Object)** - Settings and configuration with key-based lookup
- **Array of Tasks** - Task queue with findIndex for O(n) updates
- **2D Array** - Product data storage `products[row][column]`
- **GUID Map** - File and refiner identification using generated UUIDs
- **Stack (Implicit)** - Undo/redo for editor operations
- **Queue** - Async task processing pipeline

**Algorithms:**

- **Binary Search** - License level determination from file size
  ```typescript
  for (let i = 0; i < SIZE_LIMITS.length; i++)
      if (fileSize > SIZE_LIMITS[i]) levelBelow = i
      else break
  ```

- **Incremental Array Update** - Efficient partial task updates
  ```typescript
  updateOrAddItemWithKey(tasks, { key, ...updates }, 'key')
  ```

- **Range Intersection** - Find results within row/column ranges
  ```typescript
  isInSelectedSquare([row, col], selectedRange)
  ```

- **Progressive Data Generation** - Chunk-based data population
  - Calculate chunks based on file size
  - Generate data in batches to prevent blocking
  - Update UI incrementally

- **Delta Calculation** - For progress tracking
  ```typescript
  totalTimeTaken += step.timeTaken
  progress = (currentRow / totalRows) * 100
  ```

- **Text Trimming Algorithm** - Middle ellipsis for long paths
  ```typescript
  trimStringMiddle(text, maxLength) 
  // "very-long-filename.txt" → "very-lon...ame.txt"
  ```

- **Deep Clone with Refiners** - Recursive cloning of view structures
  - Clones columns, refiners, editor state
  - Generates new GUIDs for cloned items
  - Preserves relationships in cloned structure
