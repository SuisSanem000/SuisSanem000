# DoIt - Internal Task Manager

A modern task management application built with a monorepo architecture using PNPM workspaces.

## Tech Stack

- **PNPM Workspaces** - Monorepo management
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Sass** - Styling
- **Axios** - HTTP client

## Purpose

DoIt is an internal task management system designed for team collaboration and productivity tracking. The project demonstrates modern monorepo architecture with shared packages and multiple applications working in a unified workspace.

## Main Features

- Task creation, assignment, and tracking
- Monorepo architecture with PNPM workspaces
- Shared component library across apps
- Client application with Vite for fast builds
- TypeScript for type-safe development
- React Router for navigation
- Axios for API communication
- Workspace package referencing without publishing

## Complex Features - Technical Details

### 1. PNPM Workspace Monorepo
Organizes multiple related packages in a single repository with shared dependencies and efficient storage.

**Technical Implementation:**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- Symbolic linking between workspace packages
- Single `node_modules` at root with package hoisting
- Workspace protocol: `"sparrow": "workspace:*"`
- Cross-package dependency management
- Consistent versioning across packages

### 2. Shared UI Component Library (Sparrow)
Custom reusable component library shared across workspace apps.

**Technical Implementation:**
- Package location: `packages/sparrow`
- Components exported as ES modules
- Referenced via workspace protocol in client app
- Hot module replacement during development
- Build once, use everywhere in monorepo

### 3. Filter-Based Task Execution
Run commands on specific packages using PNPM filters.

**Technical Implementation:**
```bash
pnpm --filter client dev
pnpm --filter react-app build
```

- Target specific packages without directory changes
- Run scripts on multiple matching packages
- Dependency-aware execution order

## System Design Approach

**Monorepo Architecture**
- Single repository for multiple related projects
- Apps folder for runnable applications
- Packages folder for shared libraries
- Centralized dependency management
- Workspace-level scripts for common operations

**Component Library Pattern**
- Shared UI components in `packages/sparrow`
- Apps consume via workspace protocol references
- Single source of truth for UI elements
- Version synchronization across consumers

**Client-Side SPA Architecture**
- React for component-based UI
- React Router for client-side routing
- Vite for fast builds and HMR
- Axios for HTTP requests to backend

## Algorithms & Data Structures

**Data Structures:**

- **Dependency Graph** - PNPM builds graph of package dependencies
  - Determines installation and build order
  - Detects circular dependencies

- **Symbol Link Tree** - File system structure
  - `node_modules` contains symlinks to workspace packages
  - Resolves to actual package locations

- **Task Array** - In-memory task list
  - Filtered, sorted, paginated for display

**Algorithms:**

- **Topological Sort** - For build order determination
  ```
  If package A depends on B, build B before A
  ```

- **Package Resolution**
  - Workspace protocol resolver checks `packages/*` first
  - Falls back to npm registry if not found

- **Hot Module Replacement (HMR)**
  - Vite watches file changes
  - Calculates minimal dependency update set
  - Updates browser without full reload
