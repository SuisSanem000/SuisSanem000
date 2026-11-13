// ============================================================
// NESTJS ESSENTIALS - QUICK INTERVIEW REFERENCE
// ============================================================

// ----- 1. MODULE -----
import { Module } from "@nestjs/common";

@Module({
  imports: [],       // Other modules
  controllers: [],   // Request handlers
  providers: [],     // Services (business logic)
  exports: [],       // Share with other modules
})
export class UsersModule {}

// ----- 2. CONTROLLER -----
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from "@nestjs/common";

@Controller("users")  // Base route: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}  // DI

  @Get()                                    // GET /users
  findAll() { return this.usersService.findAll(); }

  @Get(":id")                               // GET /users/123
  findOne(@Param("id") id: string) { return this.usersService.findOne(+id); }

  @Post()                                   // POST /users
  create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }

  @Put(":id")                               // PUT /users/123
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) { 
    return this.usersService.update(+id, dto); 
  }

  @Delete(":id")                            // DELETE /users/123
  remove(@Param("id") id: string) { return this.usersService.remove(+id); }
}

// ----- 3. SERVICE (Provider) -----
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()  // Enables dependency injection
export class UsersService {
  private users = [];

  findAll() { return this.users; }
  
  findOne(id: number) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  create(dto: CreateUserDto) { /* save to db */ }
  update(id: number, dto: UpdateUserDto) { /* update in db */ }
  remove(id: number) { /* delete from db */ }
}

// ----- 4. DTO (Data Transfer Object) -----
import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString() @IsNotEmpty() @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString() @MinLength(8)
  password: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
}

// ----- 5. GUARD (Authentication) -----
import { Injectable, CanActivate, ExecutionContext, UseGuards } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(" ")[1];
    return !!token;  // true = allow, false = deny
  }
}

// Apply to controller or route
@Controller("protected")
@UseGuards(AuthGuard)
export class ProtectedController {}

// ----- 6. PIPE (Validation/Transformation) -----
import { ParseIntPipe, ValidationPipe, UsePipes } from "@nestjs/common";

@Get(":id")
findOne(@Param("id", ParseIntPipe) id: number) {  // Auto converts string → number
  return this.service.findOne(id);
}

// Global validation (in main.ts)
// app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

// ----- 7. INTERCEPTOR -----
import { NestInterceptor, CallHandler, UseInterceptors } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({ data, timestamp: new Date().toISOString() }))
    );
  }
}

@UseInterceptors(TransformInterceptor)
export class DataController {}

// ----- 8. MIDDLEWARE -----
import { NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.path}`);
    next();  // Must call next()
  }
}

// ----- 9. EXCEPTION FILTER -----
import { ExceptionFilter, Catch, HttpException, ArgumentsHost } from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    response.status(status).json({ statusCode: status, message: exception.message });
  }
}

// Built-in exceptions: BadRequestException, UnauthorizedException, 
// ForbiddenException, NotFoundException, InternalServerErrorException

// ----- 10. MAIN BOOTSTRAP (main.ts) -----
import { NestFactory } from "@nestjs/core";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();

// ============================================================
// REQUEST LIFECYCLE ORDER:
// 1. Middleware → 2. Guards → 3. Interceptors (before) → 
// 4. Pipes → 5. Handler → 6. Interceptors (after) → 7. Exception Filters
// ============================================================

// ============================================================
// KEY DECORATORS:
// @Module(), @Controller(), @Injectable()
// @Get(), @Post(), @Put(), @Delete(), @Patch()
// @Param(), @Body(), @Query(), @Headers()
// @UseGuards(), @UsePipes(), @UseInterceptors(), @UseFilters()
// ============================================================
