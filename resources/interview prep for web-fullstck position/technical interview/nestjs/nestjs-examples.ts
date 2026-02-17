// ============================================================
// NESTJS TYPESCRIPT EXAMPLES FOR INTERVIEW PREPARATION
// ============================================================
// This file demonstrates key NestJS patterns and syntax.
// Read through the comments to understand each concept.
// ============================================================

// ============================================================
// SECTION 1: MODULE DEFINITION
// ============================================================
// Modules organize the application into cohesive blocks.
// Every NestJS app has at least one module: AppModule.

import { Module } from "@nestjs/common";

// Controllers handle incoming requests
// Providers contain business logic (services)
// Imports bring in other modules
// Exports make providers available to other modules

@Module({
  imports: [], // Other modules this module depends on
  controllers: [], // Request handlers for this module
  providers: [], // Services, repositories, factories
  exports: [], // Providers available to importing modules
})
export class UsersModule {}

// Root application module typically looks like this:
@Module({
  imports: [
    // Feature modules
    // UsersModule,
    // ProductsModule,
    // Database modules
    // TypeOrmModule.forRoot(config),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// ============================================================
// SECTION 2: CONTROLLER BASICS
// ============================================================
// Controllers handle HTTP requests and return responses.
// They should be thin - delegate logic to services.

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";

// @Controller decorator defines the base route path
@Controller("users") // All routes will be prefixed with /users
export class UsersController {
  // @Get() handles GET requests
  // Route: GET /users
  @Get()
  findAll() {
    return { message: "Get all users" };
  }

  // @Get(':id') handles GET with route parameter
  // Route: GET /users/123
  @Get(":id")
  findOne(@Param("id") id: string) {
    // @Param extracts route parameters
    return { message: `Get user ${id}` };
  }

  // @Post() handles POST requests
  // Route: POST /users
  @Post()
  @HttpCode(HttpStatus.CREATED) // Customize response status code
  create(@Body() createUserDto: CreateUserDto) {
    // @Body extracts request body
    return { message: "User created", data: createUserDto };
  }

  // @Put(':id') handles PUT requests
  // Route: PUT /users/123
  @Put(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return { message: `User ${id} updated`, data: updateUserDto };
  }

  // @Delete(':id') handles DELETE requests
  // Route: DELETE /users/123
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  remove(@Param("id") id: string) {
    return; // No content returned
  }

  // Query parameters example
  // Route: GET /users/search?name=john&age=25
  @Get("search")
  search(@Query("name") name: string, @Query("age") age: string) {
    return { searching: { name, age } };
  }
}

// ============================================================
// SECTION 3: DTOs (Data Transfer Objects)
// ============================================================
// DTOs define the shape of data for type safety and validation.
// Use with class-validator decorators for automatic validation.

import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// Create DTO - defines required data for creating a user
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional() // Not required
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;
}

// Update DTO - all fields optional for partial updates
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  age?: number;
}

// Nested DTO example
export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  country: string;
}

export class UserWithAddressDto {
  @IsString()
  name: string;

  @ValidateNested() // Validate nested object
  @Type(() => AddressDto) // Required for nested validation
  address: AddressDto;
}

// ============================================================
// SECTION 4: SERVICES (PROVIDERS)
// ============================================================
// Services contain business logic and are injectable.
// They're marked with @Injectable() decorator.

import { Injectable, NotFoundException } from "@nestjs/common";

// Interface for type safety
interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable() // Marks this class as a provider for DI
export class UsersService {
  // In real app, this would be a database connection
  private users: User[] = [
    { id: 1, name: "John", email: "john@example.com" },
    { id: 2, name: "Jane", email: "jane@example.com" },
  ];

  // Find all users
  findAll(): User[] {
    return this.users;
  }

  // Find one user by ID
  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      // Built-in exception - returns 404
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Create new user
  create(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: this.users.length + 1,
      name: createUserDto.name,
      email: createUserDto.email,
    };
    this.users.push(newUser);
    return newUser;
  }

  // Update existing user
  update(id: number, updateUserDto: UpdateUserDto): User {
    const user = this.findOne(id); // Throws if not found
    Object.assign(user, updateUserDto);
    return user;
  }

  // Delete user
  remove(id: number): void {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users.splice(index, 1);
  }
}

// ============================================================
// SECTION 5: DEPENDENCY INJECTION
// ============================================================
// NestJS uses constructor injection to provide dependencies.

@Controller("users")
export class UsersControllerWithDI {
  // Inject UsersService via constructor
  // NestJS handles creating and providing the instance
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    // Use the injected service
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(parseInt(id, 10));
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

// ============================================================
// SECTION 6: GUARDS (Authentication/Authorization)
// ============================================================
// Guards determine if a request should be handled.
// Primary use: protecting routes based on conditions.

import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

// Basic guard that checks for authorization header
@Injectable()
export class AuthGuard implements CanActivate {
  // canActivate must return boolean or Promise<boolean>
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check for auth header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false; // Deny access
    }

    // Validate token (simplified example)
    const token = authHeader.split(" ")[1];
    return this.validateToken(token);
  }

  private validateToken(token: string): boolean {
    // In real app: verify JWT, check database, etc.
    return token === "valid-token";
  }
}

// Using guards on controllers
import { UseGuards } from "@nestjs/common";

@Controller("protected")
@UseGuards(AuthGuard) // Apply to all routes in this controller
export class ProtectedController {
  @Get()
  getProtectedData() {
    return { message: "This is protected" };
  }

  // Or apply to specific routes only
  @Get("admin")
  // @UseGuards(AdminGuard)
  getAdminData() {
    return { message: "Admin only" };
  }
}

// ============================================================
// SECTION 7: PIPES (Validation & Transformation)
// ============================================================
// Pipes transform/validate input data before handler receives it.

import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  ParseIntPipe,
  ValidationPipe,
} from "@nestjs/common";
import { UsePipes } from "@nestjs/common";

// Using built-in ParseIntPipe
@Controller("items")
export class ItemsController {
  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number // Automatically converts string to number
  ) {
    // id is guaranteed to be a number here
    return { id };
  }
}

// Custom pipe example
@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      throw new BadRequestException("Value must be a positive integer");
    }
    return num;
  }
}

// Using ValidationPipe globally (usually in main.ts)
// app.useGlobalPipes(new ValidationPipe({
//   whitelist: true,        // Strip properties not in DTO
//   forbidNonWhitelisted: true,  // Throw error for extra properties
//   transform: true,        // Auto-transform types
// }));

// ============================================================
// SECTION 8: INTERCEPTORS
// ============================================================
// Interceptors add logic before/after method execution.
// Great for response transformation, logging, caching.

import {
  NestInterceptor,
  CallHandler,
  UseInterceptors,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

// Response transformation interceptor
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, { data: T; timestamp: string }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<{ data: T; timestamp: string }> {
    // next.handle() calls the route handler
    return next.handle().pipe(
      map((data) => ({
        data,
        timestamp: new Date().toISOString(),
      }))
    );
  }
}

// Logging interceptor - logs before and after
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    console.log(`[${method}] ${url} - Request started`);
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        console.log(`[${method}] ${url} - ${Date.now() - now}ms`);
      })
    );
  }
}

// Using interceptors
@Controller("data")
@UseInterceptors(LoggingInterceptor)
export class DataController {
  @Get()
  @UseInterceptors(TransformInterceptor)
  getData() {
    return { name: "example" };
    // Response will be: { data: { name: "example" }, timestamp: "..." }
  }
}

// ============================================================
// SECTION 9: MIDDLEWARE
// ============================================================
// Middleware runs before route handlers.
// Has access to request, response, and next function.

import { NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next(); // Must call next() to continue
  }
}

// Apply middleware in module
import { MiddlewareConsumer, NestModule } from "@nestjs/common";

@Module({
  controllers: [],
  providers: [],
})
export class AppModuleWithMiddleware implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes("*"); // Apply to all routes

    // Or apply to specific routes
    // .forRoutes({ path: 'users', method: RequestMethod.GET })
    // .forRoutes(UsersController)
  }
}

// ============================================================
// SECTION 10: EXCEPTION FILTERS
// ============================================================
// Handle exceptions and format error responses.

import {
  ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

// Catch all HTTP exceptions
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as any).message,
    });
  }
}

// Using built-in exceptions
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";

function exampleExceptions() {
  // 400 Bad Request
  throw new BadRequestException("Invalid input data");

  // 401 Unauthorized
  throw new UnauthorizedException("Invalid credentials");

  // 403 Forbidden
  throw new ForbiddenException("Access denied");

  // 404 Not Found
  throw new NotFoundException("Resource not found");

  // 500 Internal Server Error
  throw new InternalServerErrorException("Something went wrong");
}

// ============================================================
// SECTION 11: CUSTOM DECORATORS
// ============================================================
// Create reusable decorators for common patterns.

import { createParamDecorator } from "@nestjs/common";

// Extract current user from request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Assumes user is attached by auth guard
  }
);

// Usage in controller
@Controller("profile")
export class ProfileController {
  @Get()
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}

// ============================================================
// SECTION 12: MAIN BOOTSTRAP FILE (main.ts)
// ============================================================
// Entry point that creates and configures the application.

import { NestFactory } from "@nestjs/core";

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix("api/v1");

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Error on unknown properties
      transform: true, // Transform payloads to DTO instances
    })
  );

  // Global filters
  // app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  // app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS
  app.enableCors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  });

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

bootstrap();

// ============================================================
// SECTION 13: USING WITH FASTIFY (Instead of Express)
// ============================================================
// NestJS can use Fastify for better performance.

import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

async function bootstrapWithFastify() {
  // Create app with Fastify adapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // Configuration is similar to Express
  app.setGlobalPrefix("api");

  // Fastify uses different request/response objects
  await app.listen(3000, "0.0.0.0");
}

// ============================================================
// SECTION 14: TESTING BASICS
// ============================================================
// NestJS provides testing utilities for unit and e2e tests.

import { Test, TestingModule } from "@nestjs/testing";

// Unit test example for a service
describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    // Get the service instance
    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return all users", () => {
    const users = service.findAll();
    expect(Array.isArray(users)).toBe(true);
  });

  it("should throw NotFoundException for invalid id", () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
  });
});

// Controller test with mocked service
describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockReturnValue([]),
            findOne: jest.fn().mockReturnValue({ id: 1, name: "Test" }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it("should return all users", () => {
    expect(controller.findAll()).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });
});

// ============================================================
// SECTION 15: REQUEST LIFECYCLE SUMMARY
// ============================================================
/*

The order in which NestJS processes a request:

1. MIDDLEWARE
   - Runs first, has access to req/res
   - Can modify request or end response early
   - Must call next() to continue

2. GUARDS
   - Run after middleware
   - Return true/false to allow/deny access
   - Great for authentication/authorization

3. INTERCEPTORS (Before)
   - Can transform the request
   - Can add pre-processing logic

4. PIPES
   - Transform/validate input data
   - Run for each decorated parameter
   - Throw exceptions for invalid data

5. ROUTE HANDLER
   - Your controller method executes

6. INTERCEPTORS (After)
   - Can transform the response
   - Can add post-processing logic

7. EXCEPTION FILTERS
   - Catch and handle any thrown exceptions
   - Format error responses

*/

// ============================================================
// SUMMARY OF KEY DECORATORS
// ============================================================
/*

MODULE DECORATORS:
- @Module() - Define a module
- @Global() - Make module globally available

CONTROLLER DECORATORS:
- @Controller('path') - Define a controller
- @Get(), @Post(), @Put(), @Delete(), @Patch() - HTTP methods
- @HttpCode() - Set response status code

PARAMETER DECORATORS:
- @Param() - Route parameters
- @Body() - Request body
- @Query() - Query parameters
- @Headers() - Request headers
- @Req(), @Res() - Raw request/response

PROVIDER DECORATORS:
- @Injectable() - Mark class as injectable
- @Inject() - Manual injection

GUARD/INTERCEPTOR/PIPE DECORATORS:
- @UseGuards() - Apply guards
- @UseInterceptors() - Apply interceptors
- @UsePipes() - Apply pipes
- @UseFilters() - Apply exception filters

VALIDATION DECORATORS (class-validator):
- @IsString(), @IsNumber(), @IsEmail()
- @IsNotEmpty(), @IsOptional()
- @MinLength(), @MaxLength()
- @Min(), @Max()
- @ValidateNested(), @Type()

*/
