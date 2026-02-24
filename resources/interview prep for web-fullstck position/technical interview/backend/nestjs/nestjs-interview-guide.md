# NestJS Interview Preparation Guide

> **Target Level:** Beginner | **Focus:** Core concepts for technical interviews

---

## What is NestJS?

NestJS is a **progressive Node.js framework** for building efficient, scalable server-side applications. It uses TypeScript by default and is heavily inspired by Angular's architecture.

### Why Companies Use NestJS

- **Enterprise-grade structure** with clear patterns
- **TypeScript-first** with excellent type safety
- **Modular architecture** that scales with the application
- **Built-in support** for microservices, GraphQL, WebSockets
- **Decorator-based** syntax that's clean and readable

---

## Core Architecture Concepts

NestJS follows the **MVC pattern** with additional layers. Understanding this architecture is crucial.

### The Big Picture

```
Request → Controller → Service → Repository → Database
                ↓
            Response
```

Every NestJS application is built from these core building blocks:

---

### 1. Modules

Modules are the **organizational unit** of NestJS. Every application has at least one module (AppModule).

**Purpose:**
- Group related functionality together
- Define boundaries between features
- Control what's exposed to other modules

**Key decorators:**
- `@Module()` - Defines a module
- Properties: `imports`, `controllers`, `providers`, `exports`

**Real-world analogy:** Modules are like departments in a company—each handles specific responsibilities and communicates through defined interfaces.

---

### 2. Controllers

Controllers handle **incoming requests** and return **responses**. They're the entry point for HTTP traffic.

**Responsibilities:**
- Define routes and HTTP methods
- Extract data from requests (params, body, query)
- Delegate business logic to services
- Return responses to clients

**Key decorators:**
- `@Controller('path')` - Defines a controller with base route
- `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()` - HTTP methods
- `@Param()`, `@Body()`, `@Query()` - Extract request data
- `@Res()`, `@Req()` - Access raw request/response objects

**Important:** Controllers should be thin—they orchestrate but don't contain business logic.

---

### 3. Providers (Services)

Providers contain **business logic**. The most common provider is a Service.

**Responsibilities:**
- Encapsulate complex business operations
- Interact with databases
- Call external APIs
- Be injected into controllers or other providers

**Key decorator:**
- `@Injectable()` - Marks a class as a provider for dependency injection

**Types of providers:**
- **Services** - Business logic
- **Repositories** - Database access
- **Factories** - Create instances
- **Helpers** - Utility functions

---

### 4. Dependency Injection (DI)

DI is **fundamental** to NestJS. Don't skip this concept.

**How it works:**
1. You declare what a class needs in its constructor
2. NestJS creates and provides those dependencies automatically
3. This promotes loose coupling and testability

**The flow:**
1. Mark class with `@Injectable()`
2. Register in a module's `providers` array
3. Inject via constructor in other classes

**Why it matters:**
- Makes testing easy (mock dependencies)
- Promotes modular, maintainable code
- Handles lifecycle management

---

### 5. Middleware

Middleware functions execute **before route handlers**. They're inspired by Express middleware.

**Use cases:**
- Logging
- Parsing request bodies
- Authentication checks
- CORS handling

**Key points:**
- Can modify request/response objects
- Can end the request-response cycle
- Must call `next()` to continue

---

### 6. Guards

Guards determine if a request should be **handled** or **rejected**.

**Primary use:** Authentication and Authorization

**Key decorator:**
- `@UseGuards()` - Apply guard to controller or route

**How they work:**
- Implement `CanActivate` interface
- Return `true` to allow, `false` to deny
- Have access to execution context (request, handler metadata)

**Interview insight:** Guards run after middleware, before interceptors.

---

### 7. Interceptors

Interceptors add **extra logic** before and after method execution.

**Use cases:**
- Transform responses (add wrapper object)
- Add caching logic
- Logging with timing
- Exception mapping
- Data masking

**Key feature:** Can access both the request and response, modify either.

---

### 8. Pipes

Pipes **transform** or **validate** input data before it reaches the handler.

**Built-in pipes:**
- `ValidationPipe` - Validate DTOs using class-validator
- `ParseIntPipe` - Convert string to integer
- `ParseUUIDPipe` - Validate UUID format
- `DefaultValuePipe` - Provide default values

**Key decorator:**
- `@UsePipes()` - Apply pipe to controller or route

**Validation flow:**
1. Request comes in with data
2. Pipe transforms/validates the data
3. If valid, handler receives clean data
4. If invalid, exception is thrown

---

### 9. Exception Filters

Exception filters handle **errors** and convert them to appropriate HTTP responses.

**Built-in exceptions:**
- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `NotFoundException` (404)
- `InternalServerErrorException` (500)

**Custom filters:** Catch specific exceptions and format responses consistently.

---

### 10. DTOs (Data Transfer Objects)

DTOs define the **shape of data** being transferred.

**Purpose:**
- Type safety for request/response bodies
- Input validation with decorators
- Documentation for API contracts

**Common validation decorators:**
- `@IsString()`, `@IsNumber()`, `@IsEmail()`
- `@IsNotEmpty()`, `@IsOptional()`
- `@MinLength()`, `@MaxLength()`
- `@ValidateNested()` for nested objects

---

## Request Lifecycle (Know This!)

Understanding the order is crucial:

1. **Middleware** → Global, then module-specific
2. **Guards** → Global, controller, route-level
3. **Interceptors (before)** → Global, controller, route-level
4. **Pipes** → Global, controller, route-level, parameter-level
5. **Route Handler** → Your controller method
6. **Interceptors (after)** → Route, controller, global
7. **Exception Filters** → Route, controller, global (if error)

---

## Key Functions and Decorators to Know

| Decorator/Function | Purpose |
|-------------------|---------|
| `@Module()` | Define a module |
| `@Controller()` | Define a controller |
| `@Injectable()` | Mark as DI provider |
| `@Get()`, `@Post()`, etc. | HTTP method handlers |
| `@Param()` | Extract route parameters |
| `@Body()` | Extract request body |
| `@Query()` | Extract query parameters |
| `@Headers()` | Extract headers |
| `@UseGuards()` | Apply guards |
| `@UsePipes()` | Apply pipes |
| `@UseInterceptors()` | Apply interceptors |
| `@UseFilters()` | Apply exception filters |
| `@Inject()` | Manual dependency injection |

---

## Integration with Other Technologies

### Fastify (Mentioned in Job Post)

NestJS uses Express by default but can use **Fastify** for better performance.

**Key differences:**
- Fastify is ~2x faster than Express
- Different request/response objects
- Plugin-based architecture

**How to switch:** Change the adapter in `main.ts`

### Databases

NestJS works with:
- **TypeORM** - Popular ORM, decorator-based
- **Prisma** - Modern ORM, type-safe
- **Mongoose** - MongoDB ODM
- **Sequelize** - Another SQL ORM

### Testing

Built-in testing utilities:
- `@nestjs/testing` module
- `Test.createTestingModule()` for unit tests
- Ability to mock providers easily

---

## Common Interview Questions

### Conceptual Questions

1. **"What is a Module in NestJS?"**
   - A class decorated with @Module() that organizes the application
   - Contains controllers, providers, and imports
   - Encapsulates related functionality

2. **"Explain Dependency Injection."**
   - A design pattern where dependencies are provided rather than created
   - NestJS handles creating and injecting instances
   - Makes code testable and loosely coupled

3. **"What's the difference between Middleware and Guards?"**
   - Middleware runs first, has access to req/res, general purpose
   - Guards run after middleware, return boolean, used for authorization

4. **"How do Pipes work?"**
   - Transform input data before handler receives it
   - Validate data and throw exceptions if invalid
   - Can be applied globally, to controller, or to specific parameters

5. **"What is the request lifecycle in NestJS?"**
   - Middleware → Guards → Interceptors (before) → Pipes → Handler → Interceptors (after) → Exception Filters

### Practical Scenarios

1. **"How would you implement authentication?"**
   - Create an AuthGuard that checks JWT tokens
   - Apply globally or to specific routes with @UseGuards()
   - Use Passport.js integration for strategies

2. **"How do you validate incoming data?"**
   - Create DTOs with class-validator decorators
   - Use ValidationPipe globally or per-route
   - NestJS automatically validates and returns 400 on failure

3. **"How do you structure a large application?"**
   - Feature modules for each domain (Users, Products, Orders)
   - Shared module for common utilities
   - Core module for singletons (config, database)

---

## NestJS vs Express Comparison

| Aspect | NestJS | Express |
|--------|--------|---------|
| Structure | Opinionated, modular | Minimal, flexible |
| TypeScript | First-class support | Optional |
| DI | Built-in | Manual |
| Testing | Built-in utilities | Set up yourself |
| Learning curve | Steeper | Gentler |
| Enterprise readiness | High | Depends on setup |

---

## Red Flags to Avoid in Interviews

❌ Don't confuse Pipes with Middleware—they have different purposes

❌ Don't put business logic in Controllers—that belongs in Services

❌ Don't forget the `@Injectable()` decorator on providers

❌ Don't skip explaining DI—it's core to NestJS

❌ Don't say "NestJS is like Express"—it's built on top of it but is much more structured

---

## Your Learning Narrative

When asked about your NestJS experience, you might say:

> "I've been learning NestJS and really appreciate its structured approach to backend development. I understand the core architecture—modules for organization, controllers for routing, and services for business logic. The dependency injection pattern makes sense to me, especially for testing. I've worked with Guards for authentication, Pipes for validation, and understand how the request lifecycle flows through these components."

---

## Next Steps After This Guide

1. Build a simple REST API with CRUD operations
2. Implement JWT authentication with Guards
3. Create DTOs with validation
4. Practice explaining the module structure
5. Try switching from Express to Fastify adapter
