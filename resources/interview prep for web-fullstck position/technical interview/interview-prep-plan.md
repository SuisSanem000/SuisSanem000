# Technical Interview Preparation Roadmap
## Full-Stack Engineer (JavaScript/TypeScript) - Partao
**Interview Date:** February 9, 2026  
**Interview Length:** 45 minutes - Technical JS/Node focus  
**Total Prep Time:** 10 hours maximum

---

## Key Topics Overview

| **Topic/Category** | **Subtopics/Skills** | **Practice Focus** | **Interview Format** |
|-------------------|---------------------|-------------------|---------------------|
| **JavaScript Core** | • Event loop, call stack, async/await<br>• Closures, scoping, prototypes<br>• `this` binding, error handling<br>• Promises, async patterns | • Explain event loop verbally<br>• Debug async code issues<br>• Solve closure-based problems | Live coding, technical discussion |
| **TypeScript** | • Type system, interfaces, generics<br>• Utility types (Partial, Pick, Omit)<br>• Type guards, strict mode<br>• `tsconfig.json` configuration | • Write typed functions<br>• Refactor JS to TS<br>• Use generics properly | Live coding, code review |
| **React** | • Hooks (useState, useEffect, etc.)<br>• Custom hooks<br>• Performance optimization<br>• Component design | • Build reusable hooks<br>• Optimize components<br>• Handle side effects | Live coding |
| **Next.js** | • SSR vs SSG<br>• Dynamic routing<br>• Performance optimization<br>• Production patterns | • Explain SSR/SSG trade-offs<br>• Handle large datasets (5M SKUs) | Architectural discussion |
| **Node.js** | • Event-driven architecture<br>• Async patterns<br>• Streams<br>• Error handling | • Handle async errors<br>• Optimize for performance<br>• Build scalable services | Live coding, discussion |
| **NestJS** | • Modules, controllers, services<br>• Dependency injection<br>• Guards, pipes, middleware<br>• Validation | • Structure modular apps<br>• Implement DI pattern<br>• Use guards and pipes | Code review, discussion |
| **Fastify** | • Performance vs Express<br>• Routing, plugins<br>• Schema validation | • Compare with Express<br>• Understand speed benefits | Technical discussion |
| **RESTful APIs** | • HTTP methods, status codes<br>• Pagination strategies<br>• API design patterns | • Design scalable APIs<br>• Handle 5M products<br>• Implement pagination | System design |
| **Databases** | • SQL & NoSQL design<br>• Query optimization<br>• Schema design<br>• Indexing | • Optimize queries<br>• Design schemas<br>• Fix N+1 problems | Whiteboard, discussion |
| **Testing** | • Unit testing<br>• Integration tests<br>• Testing patterns | • Write testable code<br>• Mock dependencies | Code review |
| **Architecture** | • Modular design<br>• Breaking monoliths<br>• Scalability patterns<br>• Trade-off analysis | • Design modular systems<br>• Explain architectural decisions | Whiteboard, system design |
| **Problem-Solving** | • Algorithm design<br>• Optimization<br>• Scalability in solutions | • Supplier allocation logic<br>• Competitor monitoring<br>• Efficient solutions | Live coding, whiteboard |

---

## 10-Hour Preparation Roadmap

### **Hours 1-2: JavaScript Core Mastery**
*CTO will spend half the interview on JavaScript/Node.js background knowledge*

- [ ] Review event loop mechanics (call stack, microtasks, macrotasks)
- [ ] Practice explaining closures and scope
- [ ] Master async/await error handling patterns
- [ ] Understand `this` binding in different contexts
- [ ] Practice ES6+ features (destructuring, spread, arrow functions)
- [ ] Review and practice code examples in `typescript-nodejs-nestjs/` folder

### **Hours 3-4: TypeScript & Node.js**

- [ ] Review TypeScript type system (interfaces, types, generics)
- [ ] Practice with utility types (Partial, Pick, Omit, Record)
- [ ] Understand type guards and discriminated unions
- [ ] Learn `tsconfig.json` strict mode settings
- [ ] Review Node.js event-driven architecture
- [ ] Practice async patterns and error handling
- [ ] Understand when to use streams
- [ ] Review and practice code examples in `typescript-nodejs-nestjs/` folder

### **Hours 5-6: React & Next.js**

- [ ] Review all React hooks (useState, useEffect, useCallback, useMemo, useRef)
- [ ] Practice building custom hooks
- [ ] Understand performance optimization techniques
- [ ] Learn SSR vs SSG differences in Next.js
- [ ] Understand how to handle large datasets (5M SKUs) with Next.js
- [ ] Review dynamic routing and data fetching methods
- [ ] Review and practice code examples in `react-nextjs/` folder

### **Hours 7-8: NestJS, Fastify & APIs**

- [ ] Understand NestJS dependency injection
- [ ] Learn modules, controllers, services structure
- [ ] Practice guards, pipes, and middleware differences
- [ ] Understand Fastify vs Express performance differences
- [ ] Review RESTful API design principles
- [ ] Practice pagination strategies for large datasets
- [ ] Learn proper HTTP status codes and methods
- [ ] Review and practice code examples in `expressjs-fastify/` and `typescript-nodejs-nestjs/` folders

### **Hours 9-10: Databases, Architecture & Final Review**

- [ ] Review SQL and NoSQL schema design
- [ ] Practice query optimization (N+1 problem, indexes)
- [ ] Design database schema for marketplace (5M products)
- [ ] Understand modular architecture design
- [ ] Practice explaining how to break monolith into services
- [ ] Review supplier allocation algorithm approach
- [ ] Practice problem-solving approach (clarify → think aloud → code → optimize)
- [ ] Mock interview: Practice explaining concepts verbally
- [ ] Review QueryLaw project talking points (95% accuracy, architecture decisions)
- [ ] Prepare questions for interviewer

---

## Interview Day Checklist

### **Morning of Feb 9 (1 hour before interview)**

- [ ] Quick review of JavaScript event loop
- [ ] Review TypeScript generics
- [ ] Review NestJS dependency injection
- [ ] Practice explaining one technical concept aloud
- [ ] Review QueryLaw project 30-second pitch
- [ ] Test technical setup (internet, camera, screen share, VS Code ready)

### **During Interview - Remember:**

- [ ] **Ask clarifying questions** - Don't assume requirements
- [ ] **Think aloud** - Show your problem-solving process
- [ ] **Discuss trade-offs** - Show senior-level thinking
- [ ] **Write clean code** - Good variable names, readable structure
- [ ] **Be honest about gaps** - Show willingness to learn
- [ ] **Connect to experience** - Reference QueryLaw when relevant

---

## Critical Success Factors

### **1. Problem-Solving Approach**
When given a problem:
1. Clarify requirements and constraints
2. Discuss multiple approaches
3. Explain trade-offs between options
4. Write clean, readable code
5. Consider edge cases and scalability

### **2. Scalability Mindset**
Always consider:
- How does this work with 5 million products?
- What happens under high traffic?
- Where should we add caching?
- What database indexes are needed?

### **3. Communication**
- Speak clearly and confidently
- Explain complex concepts simply
- Think aloud during coding
- Ask good questions
- Admit what you don't know

### **4. Key Interview Questions to Prepare**

**JavaScript/Node.js (50% of interview):**
- "Explain the JavaScript event loop"
- "What are closures and when do you use them?"
- "How do you handle errors in async/await code?"
- "Explain `this` binding in JavaScript"
- "What are Promises and how do they work?"

**TypeScript:**
- "Why use TypeScript over JavaScript?"
- "Explain generics and when to use them"
- "What's the difference between interface and type?"
- "What are utility types?"

**React/Next.js:**
- "How do React hooks work?"
- "When to use SSR vs SSG in Next.js?"
- "How would you handle 5 million products with Next.js?"
- "Explain useEffect cleanup"

**Node.js/NestJS:**
- "Explain NestJS dependency injection"
- "Difference between guards, middleware, and interceptors?"
- "How do you structure a scalable Node.js application?"
- "When would you use streams?"

**Architecture:**
- "How would you break a monolith into microservices?"
- "Design a supplier allocation algorithm"
- "How would you optimize queries for 5M products?"
- "Explain trade-offs in your architectural decisions"

---

## Pre-Interview Setup

**Technical:**
- [ ] Internet connection stable
- [ ] Camera and microphone working
- [ ] Screen share tested
- [ ] VS Code open with Node.js/TypeScript ready
- [ ] Terminal ready

**Knowledge:**
- [ ] JavaScript core concepts clear
- [ ] TypeScript features reviewed
- [ ] React hooks fresh in mind
- [ ] NestJS architecture understood
- [ ] QueryLaw project pitch ready (30 seconds)

---

**Focus Areas for 45-Minute Interview:**
1. **JavaScript fundamentals** (15-20 minutes) - Event loop, async, closures
2. **TypeScript & Node.js** (10-15 minutes) - Types, generics, NestJS patterns
3. **Problem-solving** (10-15 minutes) - Live coding or architectural discussion

**Good luck! Be confident, think aloud, and show how you approach problems systematically. 🚀**
