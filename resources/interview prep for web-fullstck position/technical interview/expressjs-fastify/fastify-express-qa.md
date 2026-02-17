# Fastify & Express - Interview Study Guide

## Fastify Concepts

### 1. Why Fastify?
- [ ] Understand Fastify is ~2x faster than Express
- [ ] Know schema-based validation is pre-compiled
- [ ] Understand async/await first design
- [ ] Know when to choose Fastify vs Express
- [ ] Understand benefits: performance, validation, modern patterns

### 2. Basic Fastify Setup
- [ ] Create Fastify instance with logger
- [ ] Define routes with schema validation
- [ ] Validate params, query, body with JSON Schema
- [ ] Define response schemas for serialization
- [ ] Handle different HTTP methods (GET, POST, PATCH, DELETE)

### 3. Fastify Plugins
- [ ] Understand plugin encapsulation
- [ ] Register plugins with prefix
- [ ] Create reusable route plugins
- [ ] Use decorators to extend functionality
- [ ] Understand plugin scope and isolation

### 4. Fastify Hooks
- [ ] Know hook lifecycle order
- [ ] Use onRequest for logging/timing
- [ ] Use preValidation for auth checks
- [ ] Use preHandler to modify request
- [ ] Use onSend to transform responses
- [ ] Use onResponse for cleanup/logging

### 5. Error Handling in Fastify
- [ ] Use setErrorHandler for custom error handling
- [ ] Handle validation errors specifically
- [ ] Throw errors with statusCode property
- [ ] Create custom error classes
- [ ] Return consistent error format

---

## Express Concepts

### 6. Express vs Fastify
- [ ] Compare performance differences
- [ ] Compare schema validation approaches
- [ ] Compare async handling patterns
- [ ] Understand ecosystem differences
- [ ] Know when to choose each framework

### 7. Express Middleware
- [ ] Understand middleware has req, res, next
- [ ] Know middleware executes in order
- [ ] Use built-in middleware (json, urlencoded)
- [ ] Create custom middleware functions
- [ ] Build error handling middleware (4 params)
- [ ] Apply middleware globally or per-route

---

## RESTful API Design

### 8. REST Principles
- [ ] Use proper HTTP methods for CRUD
- [ ] Design meaningful, resource-based URLs
- [ ] Return appropriate status codes (200, 201, 204, 404, 500)
- [ ] Implement pagination for large datasets
- [ ] Add filtering and sorting query params
- [ ] Version APIs properly (/api/v1, /api/v2)
- [ ] Return consistent response format

### 9. Pagination Strategies
- [ ] Implement offset-based pagination (page + limit)
- [ ] Implement cursor-based pagination (for scale)
- [ ] Return pagination metadata (total, pages, etc.)
- [ ] Handle edge cases (invalid page numbers)
- [ ] Optimize for 5 million products scenario

---

## Practice Tasks

### Build These
- [ ] Fastify server with schema validation
- [ ] Fastify plugin for product routes
- [ ] Custom Fastify hooks for auth
- [ ] Express middleware for logging
- [ ] Express error handler middleware
- [ ] Rate limiting middleware
- [ ] Pagination with metadata
- [ ] REST API with proper status codes
