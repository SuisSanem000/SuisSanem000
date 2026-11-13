# Testing - Interview Study Guide

## Unit Testing

### 1. Jest Basics
- [ ] Understand test structure: describe, it/test, expect
- [ ] Write assertions with matchers (toBe, toEqual, etc.)
- [ ] Use beforeEach/afterEach for setup/teardown
- [ ] Run tests in watch mode
- [ ] Generate coverage reports

### 2. Mocking
- [ ] Mock functions with jest.fn()
- [ ] Mock modules with jest.mock()
- [ ] Create mock implementations
- [ ] Verify function calls with expect().toHaveBeenCalled()
- [ ] Mock external dependencies (database, APIs)

### 3. Testing React Components
- [ ] Use React Testing Library (not Enzyme)
- [ ] Query elements by role, label, text
- [ ] Simulate user events (click, type, etc.)
- [ ] Test async behavior with waitFor
- [ ] Test hooks with renderHook

### 4. Testing NestJS Services
- [ ] Create test module with providers
- [ ] Mock repository/database dependencies
- [ ] Test service methods in isolation
- [ ] Verify interactions with mocks
- [ ] Test error handling

---

## Integration Testing

### 5. API Testing
- [ ] Test API endpoints with supertest
- [ ] Verify response status codes
- [ ] Verify response bodies
- [ ] Test authentication flows
- [ ] Test error responses

### 6. Database Testing
- [ ] Use in-memory database for tests
- [ ] Seed test data before tests
- [ ] Clean up data after tests
- [ ] Test database queries directly
- [ ] Verify data persistence

---

## Testing Best Practices

### 7. Test Quality
- [ ] Follow AAA pattern: Arrange, Act, Assert
- [ ] Write descriptive test names
- [ ] Test one thing per test
- [ ] Keep tests independent
- [ ] Avoid testing implementation details

### 8. Coverage
- [ ] Aim for meaningful coverage, not 100%
- [ ] Test critical business logic thoroughly
- [ ] Test error paths and edge cases
- [ ] Don't test framework code
- [ ] Focus on user-facing behavior

---

## Practice Tasks

### Complete These
- [ ] Write unit tests for TypeScript service
- [ ] Test React component with user events
- [ ] Mock API calls in tests
- [ ] Write integration test for API endpoint
- [ ] Test NestJS controller with mocked service
- [ ] Achieve 80%+ coverage on business logic

---

# Detailed Explanations

## 1. Jest Basics

### Test Structure

```typescript
// describe: Groups related tests together
describe('UserService', () => {
    // beforeEach: Runs before each test in this describe block
    beforeEach(() => {
        // Setup code - reset mocks, initialize data
        jest.clearAllMocks();
    });

    // afterEach: Runs after each test
    afterEach(() => {
        // Cleanup code
    });

    // it/test: Individual test case
    it('should create a new user', async () => {
        // Test code here
    });

    // You can nest describe blocks
    describe('when user already exists', () => {
        it('should throw an error', async () => {
            // Test specific scenario
        });
    });
});
```

### Common Matchers

```typescript
// Equality
expect(value).toBe(5);              // Strict equality (===)
expect(object).toEqual({ a: 1 });   // Deep equality
expect(value).toBeNull();           // null check
expect(value).toBeDefined();        // not undefined
expect(value).toBeTruthy();         // truthy value
expect(value).toBeFalsy();          // falsy value

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(10);
expect(0.1 + 0.2).toBeCloseTo(0.3); // Floating point

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays & Iterables
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(array).toEqual(expect.arrayContaining([1, 2]));

// Objects
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', 'value');
expect(object).toMatchObject({ partial: true });

// Exceptions
expect(() => throwingFunction()).toThrow();
expect(() => throwingFunction()).toThrow('error message');
expect(() => throwingFunction()).toThrow(CustomError);

// Async
await expect(asyncFunction()).resolves.toBe(value);
await expect(asyncFunction()).rejects.toThrow(Error);
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode (re-runs on file changes)
npm test -- --watch

# Run specific test file
npm test -- UserService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create"

# Generate coverage report
npm test -- --coverage
```

### Coverage Report

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.71 |    75.00 |   90.00 |   85.71 |
 src/               |   85.71 |    75.00 |   90.00 |   85.71 |
  UserService.ts    |   90.00 |    80.00 |  100.00 |   90.00 |
  OrderService.ts   |   80.00 |    70.00 |   80.00 |   80.00 |
--------------------|---------|----------|---------|---------|
```

---

## 2. Mocking

### Mock Functions with jest.fn()

```typescript
// Create a mock function
const mockCallback = jest.fn();

// Call it
mockCallback('arg1', 'arg2');
mockCallback('arg3');

// Verify calls
expect(mockCallback).toHaveBeenCalled();
expect(mockCallback).toHaveBeenCalledTimes(2);
expect(mockCallback).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockCallback).toHaveBeenLastCalledWith('arg3');

// Mock return values
const mockFn = jest.fn()
    .mockReturnValue('default')
    .mockReturnValueOnce('first call')
    .mockReturnValueOnce('second call');

console.log(mockFn()); // 'first call'
console.log(mockFn()); // 'second call'
console.log(mockFn()); // 'default'

// Mock implementation
const mockFn = jest.fn((x) => x + 1);
expect(mockFn(1)).toBe(2);

// Async mock
const mockAsync = jest.fn().mockResolvedValue({ data: 'result' });
const mockAsyncReject = jest.fn().mockRejectedValue(new Error('Failed'));
```

### Mock Modules with jest.mock()

```typescript
// Mock entire module
jest.mock('./database');

// Import becomes mock
import { query } from './database';
const mockQuery = query as jest.Mock;

// Setup return value
mockQuery.mockResolvedValue([{ id: 1, name: 'Test' }]);

// In test
it('should fetch users from database', async () => {
    const users = await userService.getAllUsers();
    
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users');
    expect(users).toHaveLength(1);
});
```

### Mock External Dependencies

```typescript
// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiService', () => {
    it('should fetch data from API', async () => {
        const mockData = { id: 1, name: 'Product' };
        mockedAxios.get.mockResolvedValue({ data: mockData });

        const result = await apiService.getProduct(1);

        expect(mockedAxios.get).toHaveBeenCalledWith('/products/1');
        expect(result).toEqual(mockData);
    });

    it('should handle API errors', async () => {
        mockedAxios.get.mockRejectedValue(new Error('Network error'));

        await expect(apiService.getProduct(1)).rejects.toThrow('Network error');
    });
});
```

---

## 3. Testing React Components

### Setup with React Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
    it('should render login form', () => {
        render(<LoginForm />);

        // Query by role (preferred)
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
        
        // Query by label
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        
        // Query by placeholder
        expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
        
        // Query by text
        expect(screen.getByText('Login to your account')).toBeInTheDocument();
    });
});
```

### Query Priority (Best Practices)

| Priority | Query | Use Case |
|----------|-------|----------|
| 1 | getByRole | Accessible elements (buttons, inputs) |
| 2 | getByLabelText | Form fields with labels |
| 3 | getByPlaceholderText | Inputs with placeholder |
| 4 | getByText | Non-interactive elements |
| 5 | getByTestId | Last resort, use `data-testid` |

### Simulating User Events

```typescript
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
    it('should submit form with user credentials', async () => {
        const handleSubmit = jest.fn();
        const user = userEvent.setup();
        
        render(<LoginForm onSubmit={handleSubmit} />);

        // Type in input fields
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');

        // Click submit button
        await user.click(screen.getByRole('button', { name: /submit/i }));

        // Verify submission
        expect(handleSubmit).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123'
        });
    });

    it('should show validation error for invalid email', async () => {
        const user = userEvent.setup();
        render(<LoginForm />);

        await user.type(screen.getByLabelText(/email/i), 'invalid-email');
        await user.click(screen.getByRole('button', { name: /submit/i }));

        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
});
```

### Testing Async Behavior

```typescript
import { render, screen, waitFor } from '@testing-library/react';

describe('UserProfile', () => {
    it('should load and display user data', async () => {
        // Mock API call
        jest.spyOn(api, 'getUser').mockResolvedValue({ 
            name: 'John Doe', 
            email: 'john@example.com' 
        });

        render(<UserProfile userId="123" />);

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Or use findBy which waits automatically
        expect(await screen.findByText('john@example.com')).toBeInTheDocument();
    });

    it('should show error state', async () => {
        jest.spyOn(api, 'getUser').mockRejectedValue(new Error('Not found'));

        render(<UserProfile userId="999" />);

        expect(await screen.findByText(/error loading user/i)).toBeInTheDocument();
    });
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
    it('should initialize with default value', () => {
        const { result } = renderHook(() => useCounter());
        
        expect(result.current.count).toBe(0);
    });

    it('should increment counter', () => {
        const { result } = renderHook(() => useCounter(5));

        act(() => {
            result.current.increment();
        });

        expect(result.current.count).toBe(6);
    });

    it('should reset counter', () => {
        const { result } = renderHook(() => useCounter(10));

        act(() => {
            result.current.increment();
            result.current.reset();
        });

        expect(result.current.count).toBe(10);
    });
});
```

---

## 4. Testing NestJS Services

### Test Module Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

describe('UserService', () => {
    let service: UserService;
    let repository: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        const mockRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        repository = module.get(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
```

### Testing Service Methods

```typescript
describe('UserService', () => {
    // ... setup from above

    describe('findAll', () => {
        it('should return array of users', async () => {
            const users = [
                { id: 1, name: 'Alice', email: 'alice@test.com' },
                { id: 2, name: 'Bob', email: 'bob@test.com' },
            ];
            repository.find.mockResolvedValue(users);

            const result = await service.findAll();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual(users);
            expect(result).toHaveLength(2);
        });
    });

    describe('findOne', () => {
        it('should return user by id', async () => {
            const user = { id: 1, name: 'Alice', email: 'alice@test.com' };
            repository.findOne.mockResolvedValue(user);

            const result = await service.findOne(1);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(user);
        });

        it('should throw NotFoundException when user not found', async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create and return new user', async () => {
            const createDto = { name: 'New User', email: 'new@test.com' };
            const savedUser = { id: 1, ...createDto };
            
            repository.create.mockReturnValue(savedUser);
            repository.save.mockResolvedValue(savedUser);

            const result = await service.create(createDto);

            expect(repository.create).toHaveBeenCalledWith(createDto);
            expect(repository.save).toHaveBeenCalledWith(savedUser);
            expect(result).toEqual(savedUser);
        });
    });
});
```

### Testing Error Handling

```typescript
describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
        repository.find.mockRejectedValue(new Error('Database connection failed'));

        await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should validate email format', async () => {
        const invalidDto = { name: 'Test', email: 'invalid-email' };

        await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
});
```

---

## 5. API Testing with Supertest

### Basic Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    // Tests go here
});
```

### Testing CRUD Endpoints

```typescript
describe('GET /users', () => {
    it('should return list of users', () => {
        return request(app.getHttpServer())
            .get('/users')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
            });
    });
});

describe('GET /users/:id', () => {
    it('should return user by id', () => {
        return request(app.getHttpServer())
            .get('/users/1')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('id', 1);
                expect(res.body).toHaveProperty('email');
            });
    });

    it('should return 404 for non-existent user', () => {
        return request(app.getHttpServer())
            .get('/users/99999')
            .expect(404);
    });
});

describe('POST /users', () => {
    it('should create a new user', () => {
        return request(app.getHttpServer())
            .post('/users')
            .send({ name: 'Test User', email: 'test@example.com' })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.name).toBe('Test User');
            });
    });

    it('should return 400 for invalid data', () => {
        return request(app.getHttpServer())
            .post('/users')
            .send({ name: '' })  // Missing required fields
            .expect(400);
    });
});

describe('PUT /users/:id', () => {
    it('should update user', () => {
        return request(app.getHttpServer())
            .put('/users/1')
            .send({ name: 'Updated Name' })
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe('Updated Name');
            });
    });
});

describe('DELETE /users/:id', () => {
    it('should delete user', () => {
        return request(app.getHttpServer())
            .delete('/users/1')
            .expect(200);
    });
});
```

### Testing Authentication

```typescript
describe('Authentication', () => {
    let authToken: string;

    beforeAll(async () => {
        // Login and get token
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'admin@test.com', password: 'password123' });
        
        authToken = response.body.accessToken;
    });

    it('should access protected route with valid token', () => {
        return request(app.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
    });

    it('should reject request without token', () => {
        return request(app.getHttpServer())
            .get('/users/profile')
            .expect(401);
    });

    it('should reject request with invalid token', () => {
        return request(app.getHttpServer())
            .get('/users/profile')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);
    });
});
```

---

## 6. Database Testing

### In-Memory Database Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';

describe('UserService with Database', () => {
    let service: UserService;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [User],
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([User]),
            ],
            providers: [UserService],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    afterAll(async () => {
        await module.close();
    });

    // Tests with real database operations
});
```

### Seeding Test Data

```typescript
describe('UserService with seeded data', () => {
    let repository: Repository<User>;

    beforeEach(async () => {
        // Seed test data before each test
        await repository.save([
            { name: 'Alice', email: 'alice@test.com' },
            { name: 'Bob', email: 'bob@test.com' },
            { name: 'Charlie', email: 'charlie@test.com' },
        ]);
    });

    afterEach(async () => {
        // Clean up after each test
        await repository.clear();
    });

    it('should find all seeded users', async () => {
        const users = await service.findAll();
        expect(users).toHaveLength(3);
    });

    it('should find user by email', async () => {
        const user = await service.findByEmail('alice@test.com');
        expect(user.name).toBe('Alice');
    });
});
```

### Testing Database Queries

```typescript
describe('Complex queries', () => {
    it('should filter users by criteria', async () => {
        await repository.save([
            { name: 'Admin User', email: 'admin@test.com', role: 'admin' },
            { name: 'Regular User', email: 'user@test.com', role: 'user' },
        ]);

        const admins = await service.findByRole('admin');

        expect(admins).toHaveLength(1);
        expect(admins[0].name).toBe('Admin User');
    });

    it('should paginate results', async () => {
        // Seed 25 users
        for (let i = 0; i < 25; i++) {
            await repository.save({ name: `User ${i}`, email: `user${i}@test.com` });
        }

        const page1 = await service.findPaginated({ page: 1, limit: 10 });
        const page2 = await service.findPaginated({ page: 2, limit: 10 });

        expect(page1.data).toHaveLength(10);
        expect(page2.data).toHaveLength(10);
        expect(page1.total).toBe(25);
    });
});
```

---

## 7. Test Quality Best Practices

### AAA Pattern

```typescript
it('should calculate order total with discount', () => {
    // Arrange: Setup test data and dependencies
    const order = new Order();
    order.items = [
        { product: 'Widget', price: 100, quantity: 2 },
        { product: 'Gadget', price: 50, quantity: 1 },
    ];
    const discount = new PercentageDiscount(10);

    // Act: Execute the code under test
    const total = order.calculateTotal(discount);

    // Assert: Verify the result
    expect(total).toBe(225); // (200 + 50) - 10%
});
```

### Descriptive Test Names

```typescript
// ❌ Bad: Vague name
it('should work', () => { ... });

// ❌ Bad: Too technical
it('returns null when input is undefined', () => { ... });

// ✅ Good: Describes behavior
it('should return null when user is not found', () => { ... });

// ✅ Good: Describes scenario and outcome
it('should throw ValidationError when email format is invalid', () => { ... });

// ✅ Good: Uses context
describe('when user is authenticated', () => {
    it('should display personalized greeting', () => { ... });
});

describe('when user is not authenticated', () => {
    it('should redirect to login page', () => { ... });
});
```

### One Assertion Per Test

```typescript
// ❌ Bad: Multiple unrelated assertions
it('should handle user operations', () => {
    expect(service.create(dto)).toBeDefined();
    expect(service.findAll()).toHaveLength(1);
    expect(service.delete(1)).toBe(true);
});

// ✅ Good: Focused tests
it('should create user', () => {
    const user = service.create(dto);
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
});

it('should find all users', () => {
    const users = service.findAll();
    expect(users).toHaveLength(1);
});
```

### Avoid Testing Implementation Details

```typescript
// ❌ Bad: Testing internal state
it('should set isLoading to true', () => {
    component.fetchData();
    expect(component.isLoading).toBe(true);
});

// ✅ Good: Testing observable behavior
it('should show loading spinner while fetching data', async () => {
    render(<DataComponent />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
});
```

---

## 8. Coverage Guidelines

### Meaningful Coverage Over 100%

| Coverage Type | What It Means | Priority |
|---------------|---------------|----------|
| Statement | Each line executed | Medium |
| Branch | Each if/else path taken | High |
| Function | Each function called | Medium |
| Line | Similar to statement | Low |

### What to Focus On

```typescript
// ✅ HIGH PRIORITY: Business logic
describe('OrderPricing', () => {
    it('should apply bulk discount for orders over 100 items');
    it('should apply loyalty discount for returning customers');
    it('should calculate tax based on shipping address');
});

// ✅ HIGH PRIORITY: Error handling
describe('PaymentService', () => {
    it('should handle payment gateway timeout');
    it('should retry failed transactions');
    it('should log and alert on repeated failures');
});

// ⚠️ MEDIUM PRIORITY: Edge cases
describe('InputValidation', () => {
    it('should handle empty string');
    it('should handle null input');
    it('should handle maximum length');
});

// ❌ LOW PRIORITY: Framework/library code
// Don't test React's useState, NestJS decorators, etc.
```

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
        // Higher threshold for critical code
        './src/services/payment/**/*.ts': {
            branches: 95,
            functions: 95,
            lines: 95,
        },
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.module.ts',     // Exclude modules
        '!src/**/*.dto.ts',        // Exclude DTOs
        '!src/**/*.entity.ts',     // Exclude entities
        '!src/main.ts',            // Exclude entry point
    ],
};
```

### Coverage Report Interpretation

```
Test Suites: 12 passed, 12 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        4.5 s

Coverage Summary:
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines   
--------------------|---------|----------|---------|---------|-------------------
services/           |   92.50 |    85.00 |   95.00 |   92.50 |                   
  UserService.ts    |  100.00 |   100.00 |  100.00 |  100.00 |                   
  OrderService.ts   |   85.00 |    70.00 |   90.00 |   85.00 | 45-48, 72-75     
--------------------|---------|----------|---------|---------|-------------------
```

**Key**: Focus on `Uncovered Lines` to identify gaps in important code paths.
