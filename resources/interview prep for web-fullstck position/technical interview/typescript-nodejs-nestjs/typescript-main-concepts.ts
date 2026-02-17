// ============================================
// TYPESCRIPT CORE CONCEPTS - MAIN TOPICS
// ============================================

// ============================================
// 1. TYPE SYSTEM BASICS
// ============================================

// Primitive types
let productName: string = 'Laptop';
let price: number = 1000;
let inStock: boolean = true;
let createdAt: Date = new Date();

// Arrays
let tags: string[] = ['electronics', 'computers'];
let prices: Array<number> = [100, 200, 300];

// Tuples - fixed length and types
let product: [number, string, number] = [1, 'Laptop', 1000];
let employee: [number, string, boolean, number] = [1, 'Steve', true, 50000]; // Tuple with 4 items

// Enums
enum Status {
  Pending = 'PENDING',
  Approved = 'APPROVED',
  Rejected = 'REJECTED'
}
let orderStatus: Status = Status.Pending;

// Any (avoid when possible)
let anything: any = 'can be anything';
anything = 123;
anything = {};

// Unknown (safer than any)
let userInput: unknown = getUserInput();
if (typeof userInput === 'string') {
  console.log(userInput.toUpperCase()); // Type narrowing required
}

// Never (functions that never return)
function throwError(message: string): never {
  throw new Error(message);
}


// ============================================
// 2. INTERFACES VS TYPES
// ============================================

// Interface - best for object shapes, extensible
interface Product {
  id: number;
  name: string;
  price: number;
  stock?: number; // Optional property
  readonly sku: string; // Read-only property
}

// Interface can be extended
interface ElectronicProduct extends Product {
  warranty: number;
  brand: string;
}

// Interface can be merged (declaration merging)
interface Product {
  description: string; // Added to Product interface
}

// Type - more flexible, can represent any type
type ID = number | string; // Union

type User = {
  id: ID;
  name: string;
  email: string;
};

// Type can use intersection
type Admin = User & {
  permissions: string[];
  role: 'admin';
};

// Type for primitives, unions, tuples
type Status = 'active' | 'inactive' | 'pending';
type Coordinates = [number, number];
type StringOrNumber = string | number;


// ============================================
// 3. GENERICS
// ============================================

// Generic function
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity<string>('hello');

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

interface ProductData {
  id: number;
  name: string;
}

const response: ApiResponse<ProductData> = {
  data: { id: 1, name: 'Laptop' },
  status: 200
};

// Generic class
class DataStore<T> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  get(index: number): T | undefined {
    return this.items[index];
  }
  
  getAll(): T[] {
    return [...this.items];
  }
}

const productStore = new DataStore<Product>();
productStore.add({ id: 1, name: 'Laptop', price: 1000, sku: 'LAP001' });

// Generic constraints
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// Multiple type parameters
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}


// ============================================
// 4. UTILITY TYPES
// ============================================

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
}

// Partial - all properties optional
type ProductUpdate = Partial<Product>;
const update: ProductUpdate = { price: 999 }; // Only some fields

// Required - all properties required
type RequiredProduct = Required<Partial<Product>>;

// Pick - select specific properties
type ProductSummary = Pick<Product, 'id' | 'name' | 'price'>;
const summary: ProductSummary = { id: 1, name: 'Laptop', price: 1000 };

// Omit - exclude specific properties
type ProductWithoutStock = Omit<Product, 'stock'>;

// Record - create object type with keys and values
type ProductMap = Record<number, Product>;
const products: ProductMap = {
  1: { id: 1, name: 'Laptop', price: 1000, stock: 5, description: '' },
  2: { id: 2, name: 'Mouse', price: 20, stock: 100, description: '' }
};

// ReturnType - get return type of function
function getProduct() {
  return { id: 1, name: 'Laptop', price: 1000 };
}
type ProductType = ReturnType<typeof getProduct>;

// Parameters - get parameters type
function createProduct(name: string, price: number): void {}
type CreateProductParams = Parameters<typeof createProduct>; // [string, number]

// Readonly - make all properties readonly
type ReadonlyProduct = Readonly<Product>;
const product: ReadonlyProduct = { id: 1, name: 'Laptop', price: 1000, stock: 5, description: '' };
// product.price = 999; // Error: Cannot assign to 'price'

// NonNullable - exclude null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string


// ============================================
// 5. TYPE GUARDS AND NARROWING
// ============================================

// Discriminated unions
type Success = { status: 'success'; data: string };
type Error = { status: 'error'; message: string };
type Loading = { status: 'loading' };
type Result = Success | Error | Loading;

function handleResult(result: Result) {
  if (result.status === 'success') {
    console.log(result.data); // TypeScript knows this is Success
  } else if (result.status === 'error') {
    console.log(result.message); // TypeScript knows this is Error
  } else {
    console.log('Loading...'); // TypeScript knows this is Loading
  }
}

// typeof guard
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // TypeScript knows value is string
  } else {
    return value.toFixed(2); // TypeScript knows value is number
  }
}

// instanceof guard
class Dog {
  bark() { console.log('Woof!'); }
}

class Cat {
  meow() { console.log('Meow!'); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// Custom type guard
interface Fish {
  swim: () => void;
}

interface Bird {
  fly: () => void;
}

function isFish(animal: Fish | Bird): animal is Fish {
  return (animal as Fish).swim !== undefined;
}

function move(animal: Fish | Bird) {
  if (isFish(animal)) {
    animal.swim(); // TypeScript knows animal is Fish
  } else {
    animal.fly(); // TypeScript knows animal is Bird
  }
}

// in operator
type ShapeCircle = { kind: 'circle'; radius: number };
type ShapeSquare = { kind: 'square'; side: number };
type Shape = ShapeCircle | ShapeSquare;

function getArea(shape: Shape): number {
  if ('radius' in shape) {
    return Math.PI * shape.radius ** 2;
  } else {
    return shape.side ** 2;
  }
}


// ============================================
// 6. ADVANCED TYPES
// ============================================

// Mapped types
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type ReadOnly<T> = {
  readonly [K in keyof T]: T[K];
};

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

// Conditional types
type IsString<T> = T extends string ? true : false;
type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false

type NonNullableCustom<T> = T extends null | undefined ? never : T;

// Template literal types
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// Result: 'onClick' | 'onFocus' | 'onBlur'

type PropNames = 'name' | 'age' | 'email';
type PropGetters = `get${Capitalize<PropNames>}`;
// Result: 'getName' | 'getAge' | 'getEmail'


// ============================================
// 7. FUNCTION TYPES
// ============================================

// Function type
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;

// Optional and default parameters
function createProduct(
  name: string,
  price: number,
  stock?: number, // Optional
  category: string = 'General' // Default
): Product {
  return {
    id: Date.now(),
    name,
    price,
    stock: stock ?? 0,
    sku: `SKU-${Date.now()}`,
    description: category
  };
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

// Function overloads
function getValue(value: string): string;
function getValue(value: number): number;
function getValue(value: string | number): string | number {
  return value;
}


// // ============================================
// // 8. TSCONFIG.JSON IMPORTANT SETTINGS
// // ============================================

// /*
// {
//   "compilerOptions": {
//     // Target and module
//     "target": "ES2020",
//     "module": "commonjs",
//     "lib": ["ES2020"],
    
//     // Output
//     "outDir": "./dist",
//     "rootDir": "./src",
    
//     // Strict mode (IMPORTANT!)
//     "strict": true, // enables all strict checks
//     "noImplicitAny": true,
//     "strictNullChecks": true,
//     "strictFunctionTypes": true,
//     "strictBindCallApply": true,
//     "strictPropertyInitialization": true,
//     "noImplicitThis": true,
//     "alwaysStrict": true,
    
//     // Additional checks
//     "noUnusedLocals": true,
//     "noUnusedParameters": true,
//     "noImplicitReturns": true,
//     "noFallthroughCasesInSwitch": true,
    
//     // Module resolution
//     "moduleResolution": "node",
//     "esModuleInterop": true,
//     "resolveJsonModule": true,
    
//     // Decorators (for NestJS)
//     "experimentalDecorators": true,
//     "emitDecoratorMetadata": true,
    
//     // Source maps
//     "sourceMap": true,
    
//     // Path aliases
//     "baseUrl": "./",
//     "paths": {
//       "@models/*": ["src/models/*"],
//       "@services/*": ["src/services/*"]
//     }
//   },
//   "include": ["src/**/*"],
//   "exclude": ["node_modules", "dist"]
// }
// */


// ============================================
// 9. COMMON PATTERNS
// ============================================

// Builder pattern with TypeScript
class ProductBuilder {
  private product: Partial<Product> = {};
  
  setId(id: number): this {
    this.product.id = id;
    return this;
  }
  
  setName(name: string): this {
    this.product.name = name;
    return this;
  }
  
  setPrice(price: number): this {
    this.product.price = price;
    return this;
  }
  
  build(): Product {
    if (!this.product.id || !this.product.name || !this.product.price) {
      throw new Error('Missing required fields');
    }
    return this.product as Product;
  }
}

const product = new ProductBuilder()
  .setId(1)
  .setName('Laptop')
  .setPrice(1000)
  .build();

// Singleton pattern
class Database {
  private static instance: Database;
  
  private constructor() {}
  
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2); // true
