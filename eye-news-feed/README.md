# Eye - News Feed Application

A full-stack news feed application with a modern client-server architecture and custom UI library integration.

## Tech Stack

- **TypeScript** - Primary language
- **Vite** - Build tool and dev server
- **React** - Frontend framework
- **Sass** - Advanced styling
- **Axios** - HTTP client
- **Custom Workspace Packages** - Internal libraries (recactus-lib, sparrow, tiny)

## Purpose

Eye is a personalized news aggregation and consumption platform designed to deliver curated content to users. The application demonstrates a clean separation between client and server, with custom reusable UI libraries managed as workspace packages.

## Main Features

- News aggregation from multiple sources
- Offline-first architecture with IndexedDB storage
- Filter/category management with localStorage persistence
- Read/unread tracking per article
- Client-server architecture with RESTful APIs
- Custom UI component library (recactus-lib, sparrow)
- Responsive layout with glassmorphism design
- Background data synchronization
- Accordion-based content organization
- Worker-based background processing

## Complex Features - Technical Details

### 1. IndexedDB-Based Offline Storage
Implements a full offline-first architecture using browser IndexedDB for persistent data storage.

**Technical Implementation:**
```typescript
class Database {
    initializeDB(): Promise<void> {
        const dbOpenRequest = window.indexedDB.open("states", 1);
        dbOpenRequest.onupgradeneeded = () => {
            db.createObjectStore("news", {keyPath: "key"});
        }
    }
}
```

- Promise-based async database operations
- Transaction management with commit/rollback
- Object stores for news articles and UI state (accordions)
- Key-based retrieval for O(1) article lookups
- Persistent read/unread state across sessions

### 2. Custom UI Library Integration
Workspace-based custom component libraries shared between client and potentially other apps.

**Technical Implementation:**
- `recactus-lib`: Core UI components with state management
- `sparrow`: Lightweight utility library
- `tiny`: Micro-helpers and utilities
- Workspace protocol: `"recactus-lib": "workspace:^"`
- Shared components across monorepo without npm publishing

### 3. Read State Tracking System
Per-article read tracking with persistent storage and efficient lookups.

**Technical Implementation:**
```typescript
isNewsRead(key: string): Promise<boolean> {
    const request = objectStore.get(key);
    return request.result.isRead;
}
```

- GUID-based article identification
- Asynchronous read state queries
- Batch updates for multiple articles
- Integration with accordion collapse state

## System Design Approach

**Offline-First Architecture**
- IndexedDB as primary data store
- localStorage for lightweight preferences
- Background sync when online
- Graceful degradation without connection

**Client-Server Separation**
- Dedicated `eye-client` (Vite + TypeScript)
- Dedicated `eye-server` (Node.js backend)
- RESTful API contracts between layers
- Independent deployment and scaling

**Workspace Monorepo Pattern**
- PNPM workspaces for package management
- Shared library packages (`recactus-lib`, `sparrow`, `tiny`)
- Version synchronization across packages
- Efficient dependency management

**Repository Pattern**
- `Database` class abstracts IndexedDB operations
- Encapsulates all storage logic
- Promise-based async interface
- Single responsibility: data persistence

## Algorithms & Data Structures

**Data Structures:**

- **IndexedDB Object Store** - Key-value storage for news articles
  - Schema: `{key: string, title, content, isRead, timestamp, ...}`
  - Indexed by unique key for fast retrieval

- **Hash Map (JavaScript Object)** - Filter checked states
  - Structure: `{[filterName]: boolean}`
  - Serialized to localStorage as JSON

- **Array of News Objects** - In-memory news list
  - Cached from IndexedDB for rendering
  - Filtered based on user preferences

- **Promise Chain** - Async operation sequencing
  - Database initialization → Load data → Render

**Algorithms:**

- **Async Transaction Management**
  ```typescript
  transaction = db.transaction("news", "readwrite")
  for (article of articles) objectStore.put(article)
  transaction.commit()
  ```
  - Batches multiple writes into single transaction
  - Ensures atomicity (all or nothing)

- **Filter Application**
  ```typescript
  filteredNews = allNews.filter(article => 
      filterStates[article.category] === true
  )
  ```
  - O(n) linear filtering on article array
  - Hash map lookup for O(1) filter check

- **State Persistence**
  - Serialize: `JSON.stringify(filterState)` → localStorage
  - Deserialize: `JSON.parse(localStorage.getItem())` → Object

- **Incremental Loading**
  - Load articles in batches from IndexedDB
  - Render visible articles first (viewport priority)
  - Lazy load off-screen content
