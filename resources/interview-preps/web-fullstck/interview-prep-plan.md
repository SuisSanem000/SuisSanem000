# Technical Interview Preparation Roadmap
## Full-Stack Engineer (TypeScript / Node.js / React)

---

## 📁 Study Materials Structure

```
technical interview/
├── javascript/                        ← JS core + TypeScript type system
│   ├── javascript-interview-qa.js         Closures, this, promises, debounce, deep clone
│   ├── javascript-main-concepts.js        Event loop, async, prototypes, patterns
│   ├── typescript-essentials.ts           Primitives, generics, utility types, guards
│   ├── typescript-interview-qa.ts         Interface vs type, generics, mapped types
│   └── typescript-main-concepts.ts        Full TS type system walkthrough
│
├── backend/                           ← Node.js runtime + frameworks + architecture
│   ├── backend.md                         HTTP, REST, caching, scaling, security
│   ├── nodejs-essentials.js               Event emitter, streams, workers, clustering
│   ├── nodejs-interview-qa.js             11 Node.js Q&A (event loop, streams, errors)
│   ├── nodejs-main-concepts.js            Event-driven arch, modules, best practices
│   ├── expressjs-fastify/                 Express/Fastify comparison, routing, plugins
│   │   ├── fastify-essentials.ts
│   │   ├── fastify-express-qa.md
│   │   └── fastify-main-concepts.ts
│   └── nestjs/                            DI, modules, controllers, guards, pipes
│       ├── nestjs-essentials.ts
│       ├── nestjs-examples.ts
│       └── nestjs-interview-guide.md
│
├── frontend/                          ← React + Next.js
│   ├── front-end-lead-interview-qa.md     Performance, scaling, CSS, a11y, testing
│   ├── front-end-lead-interview-code.tsx  Debounce, memo, intersection observer, context
│   ├── nextjs/                            SSR/SSG, routing, data fetching
│   │   ├── nextjs-essentials.ts
│   │   ├── nextjs-examples.ts
│   │   └── nextjs-interview-guide.md
│   └── react-nextjs/                      Hooks, custom hooks, state management
│       ├── react-essentials.tsx
│       ├── react-nextjs-interview-qa.tsx
│       ├── react-nextjs-main-concepts.tsx
│       └── react-nextjs-qa.md
│
├── databases/                         ← SQL, NoSQL, optimization
│   └── databases-qa.md
│
├── docker/                            ← Containerization
│   ├── docker-commands.sh
│   └── docker-qa.md
│
├── testing/                           ← Jest, testing patterns
│   └── testing-qa.md
│
└── README.md
```

---

## Key Topics Overview

| **Topic** | **Folder** | **Key Files** |
|-----------|-----------|--------------|
| JavaScript Core | `javascript/` | `javascript-main-concepts.js`, `javascript-interview-qa.js` |
| TypeScript | `javascript/` | `typescript-main-concepts.ts`, `typescript-interview-qa.ts` |
| Node.js | `backend/` | `nodejs-main-concepts.js`, `nodejs-interview-qa.js` |
| Express/Fastify | `backend/expressjs-fastify/` | `fastify-express-qa.md`, `fastify-essentials.ts` |
| NestJS | `backend/nestjs/` | `nestjs-interview-guide.md`, `nestjs-essentials.ts` |
| React Hooks | `frontend/react-nextjs/` | `react-essentials.tsx`, `react-nextjs-qa.md` |
| Next.js SSR/SSG | `frontend/nextjs/` | `nextjs-interview-guide.md`, `nextjs-essentials.ts` |
| Frontend Performance | `frontend/` | `front-end-lead-interview-qa.md`, `front-end-lead-interview-code.tsx` |
| Databases | `databases/` | `databases-qa.md` |
| Docker | `docker/` | `docker-qa.md`, `docker-commands.sh` |
| Testing | `testing/` | `testing-qa.md` |
| Backend Architecture | `backend/` | `backend.md` |

---

## Study Roadmap

### **Hours 1-2: JavaScript & TypeScript Core**
- [ ] Review event loop mechanics (call stack, microtasks, macrotasks)
- [ ] Practice explaining closures, scope, `this` binding
- [ ] Master async/await error handling patterns
- [ ] Review TypeScript type system (interfaces, types, generics)
- [ ] Practice with utility types (Partial, Pick, Omit, Record)
- [ ] Understand type guards and discriminated unions
- [ ] Review files in `javascript/` folder

### **Hours 3-4: Node.js & Backend**
- [ ] Review Node.js event-driven architecture
- [ ] Practice async patterns, streams, and error handling
- [ ] Understand clustering, worker threads, memory management
- [ ] Review Express/Fastify differences
- [ ] Understand NestJS DI, modules, guards, pipes
- [ ] Review files in `backend/` folder

### **Hours 5-6: React & Next.js**
- [ ] Review all React hooks (useState, useEffect, useCallback, useMemo, useRef)
- [ ] Practice building custom hooks
- [ ] Understand performance optimization (memo, lazy, code splitting)
- [ ] Learn SSR vs SSG differences in Next.js
- [ ] Review files in `frontend/` folder

### **Hours 7-8: Databases, Docker, Testing & Architecture**
- [ ] Review SQL and NoSQL schema design
- [ ] Practice query optimization (N+1 problem, indexes)
- [ ] Review Docker basics, Dockerfile, commands
- [ ] Understand testing patterns (unit, integration, E2E)
- [ ] Review `backend.md` for architecture, caching, scaling patterns
- [ ] Practice problem-solving approach (clarify → think aloud → code → optimize)

---

## Critical Success Factors

### Problem-Solving Approach
1. **Clarify** requirements and constraints
2. **Discuss** multiple approaches and trade-offs
3. **Write** clean, readable code
4. **Consider** edge cases and scalability

### Communication
- Think aloud during coding
- Explain complex concepts simply
- Ask good clarifying questions
- Admit what you don't know, show willingness to learn

---

## Pre-Interview Checklist

- [ ] Internet connection stable
- [ ] Camera and microphone working
- [ ] VS Code open with TypeScript/Node.js ready
- [ ] Terminal ready, git configured
- [ ] Review JavaScript event loop
- [ ] Review TypeScript generics
- [ ] Practice explaining one technical concept aloud

**Good luck! 🚀**
