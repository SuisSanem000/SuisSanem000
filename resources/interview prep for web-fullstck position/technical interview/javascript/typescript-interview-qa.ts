// ============================================
// TYPESCRIPT INTERVIEW QUESTIONS & ANSWERS
// ============================================

// ============================================
// Q1: What's the difference between interface and type in TypeScript?
// ============================================

// Answer:
// - Interface: best for object shapes, can be extended, supports declaration merging
// - Type: more flexible, can represent unions/intersections/primitives

// Interface - objects, extensible
interface Product {
  id: number;
  name: string;
  price: number;
}

interface Product {
  stock: number; // Declaration merging - adds to Product
}

interface ElectronicProduct extends Product {
  warranty: number;
}

// Type - flexible, unions, intersections
type ID = number | string; // Union - can't do with interface

type User = {
  id: ID;
  name: string;
};

type Admin = User & { // Intersection
  role: 'admin';
  permissions: string[];
};

//When to use what:
// - Use interface for public APIs, object shapes
// - Use type for unions, intersections, utility types


// ============================================
// Q2: Explain generics and why they're better than 'any'
// ============================================

// Answer: Generics provide type safety while being reusable
// 'any' loses all type information

// BAD - using 'any'
function getFirstAny(arr: any[]): any {
  return arr[0];
}

const num = getFirstAny([1, 2, 3]); // Type is 'any'
num.toUpperCase(); // No error, but will fail at runtime!

// GOOD - using generics
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const num2 = getFirst([1, 2, 3]); // Type is 'number'
// num2.toUpperCase(); // Compile error! ✓

const str = getFirst(['a', 'b', 'c']); // Type is 'string'
str.toUpperCase(); // Works! ✓

// Generic with constraints
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// Only works with objects that have 'id' property
const products = [
  { id: 1, name: 'Laptop' },
  { id: 2, name: 'Mouse' }
];
const product = findById(products, 1); // Typed as { id: number; name: string }


// ============================================
// Q3: What are utility types? Give practical examples
// ============================================

// Answer: Built-in types that transform other types

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
}

// Partial - make all fields optional (for updates)
type ProductUpdate = Partial<Product>;

function updateProduct(id: number, updates: ProductUpdate): Product {
  const existing = getProduct(id);
  return { ...existing, ...updates };
}

updateProduct(1, { price: 999 }); // Only updating price ✓

// Pick - select specific fields
type ProductSummary = Pick<Product, 'id' | 'name' | 'price'>;

function getProductList(): ProductSummary[] {
  // Only return essential fields for list view
  return [
    { id: 1, name: 'Laptop', price: 1000 }
  ];
}

// Omit - exclude specific fields
type CreateProductDTO = Omit<Product, 'id'>;

function createProduct(data: CreateProductDTO): Product {
  return {
    id: Date.now(),
    ...data
  };
}

// Record - create map/dictionary
type ProductsById = Record<number, Product>;

const productCache: ProductsById = {
  1: { id: 1, name: 'Laptop', price: 1000, stock: 5, description: '' },
  2: { id: 2, name: 'Mouse', price: 20, stock: 100, description: '' }
};

// ReturnType - get function's return type
function getProduct(id: number) {
  return { id, name: 'Product', price: 100 };
}

type ProductType = ReturnType<typeof getProduct>;
// Result: { id: number; name: string; price: number }


// ============================================
// Q4: How do type guards work in TypeScript?
// ============================================

// Answer: Type guards narrow down types at runtime

// 1. Discriminated unions (best practice)
type SuccessResponse = {
  status: 'success';
  data: string;
};

type ErrorResponse = {
  status: 'error';
  message: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: ApiResponse) {
  if (response.status === 'success') {
    console.log(response.data); // TypeScript knows: SuccessResponse
  } else {
    console.log(response.message); // TypeScript knows: ErrorResponse
  }
}

// 2. typeof guard
function formatValue(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase(); // string methods available
  } else {
    return value.toFixed(2); // number methods available
  }
}

// 3. instanceof guard
class NetworkError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

function handleError(error: Error) {
  if (error instanceof NetworkError) {
    console.log('Network error:', error.statusCode);
  } else {
    console.log('Generic error:', error.message);
  }
}

// 4. Custom type guard function
interface Cat {
  meow: () => void;
}

interface Dog {
  bark: () => void;
}

function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined;
}

function makeSound(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // TypeScript knows it's Cat
  } else {
    animal.bark(); // TypeScript knows it's Dog
  }
}


// ============================================
// Q5: Explain strict mode and why it's important
// ============================================

// Answer: Strict mode enables all strict type-checking options
// It catches more errors at compile time

/*
tsconfig.json:
{
  "strict": true,  // Enables all of the following:
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "alwaysStrict": true
}
*/

// 1. noImplicitAny - can't use implicit 'any'
function calculateBad(price, tax) { // Error: implicit any
  return price * tax;
}

function calculateGood(price: number, tax: number): number {
  return price * tax;
}

// 2. strictNullChecks - null/undefined aren't assignable to other types
function findProduct(id: number): Product | null {
  return null;
}

const product = findProduct(1);
// product.name; // Error: Object is possibly 'null'

if (product !== null) {
  console.log(product.name); // ✓ Safe after null check
}

// 3. strictPropertyInitialization - class properties must be initialized
class ProductService {
  // private db: Database; // Error: not initialized
  
  private db!: Database; // ! = definite assignment assertion
  
  constructor() {
    this.initialize();
  }
  
  private initialize() {
    this.db = new Database();
  }
}


// ============================================
// Q6: How would you type a function that accepts any number of arguments?
// ============================================

// Answer: Use rest parameters with generic type

// Generic sum function
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3); // 6
sum(1, 2, 3, 4, 5); // 15

// Generic merge function
function merge<T extends object>(...objects: T[]): T {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T);
}

const result = merge({ a: 1 }, { b: 2 }, { c: 3 });


// ============================================
// Q7: Explain mapped types and give an example
// ============================================

// Answer: Mapped types transform properties of existing types

interface Product {
  id: number;
  name: string;
  price: number;
}

// Make all properties optional
type Partial<T> = {
  [K in keyof T]?: T[K];
};

type PartialProduct = Partial<Product>;
// Result: { id?: number; name?: string; price?: number; }

// Make all properties readonly
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type ReadonlyProduct = Readonly<Product>;
const p: ReadonlyProduct = { id: 1, name: 'Laptop', price: 1000 };
// p.price = 999; // Error: Cannot assign to 'price'

// Make all properties nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type NullableProduct = Nullable<Product>;
// Result: { id: number | null; name: string | null; price: number | null; }

// Advanced: Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type ProductWithOptionalPrice = PartialBy<Product, 'price'>;
// Result: { id: number; name: string; price?: number; }


// ============================================
// Q8: How do you handle async operations with proper typing?
// ============================================

// Answer: Use Promise<T> and async/await with proper error handling

interface Product {
  id: number;
  name: string;
  price: number;
}

interface ApiError {
  message: string;
  code: string;
}

// Typed async function
async function fetchProduct(id: number): Promise<Product> {
  const response = await fetch(`/api/products/${id}`);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const product: Product = await response.json();
  return product;
}

// Union return type for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchProductSafe(id: number): Promise<Result<Product, ApiError>> {
  try {
    const response = await fetch(`/api/products/${id}`);
    
    if (!response.ok) {
      const error: ApiError = await response.json();
      return { success: false, error };
    }
    
    const product: Product = await response.json();
    return { success: true, data: product };
  } catch (error) {
    return {
      success: false,
      error: { message: 'Network error', code: 'NETWORK_ERROR' }
    };
  }
}

// Usage
async function loadProduct() {
  const result = await fetchProductSafe(1);
  
  if (result.success) {
    console.log(result.data.name); // Type: Product
  } else {
    console.error(result.error.message); // Type: ApiError
  }
}


// ============================================
// Q9: What are conditional types? Give a practical example
// ============================================

// Answer: Types that depend on a condition (like ternary operator)

// Basic conditional type
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false

// Practical example: Extract non-nullable types
type NonNullable<T> = T extends null | undefined ? never : T;

type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

// Extract array element type
type ElementType<T> = T extends (infer U)[] ? U : T;

type StringArray = string[];
type StringType = ElementType<StringArray>; // string

type NumberType = ElementType<number>; // number (not an array)

// Practical: Extract Promise value type
type Awaited<T> = T extends Promise<infer U> ? U : T;

type PromiseNumber = Promise<number>;
type NumberValue = Awaited<PromiseNumber>; // number

async function getData(): Promise<string> {
  return 'data';
}

type DataType = Awaited<ReturnType<typeof getData>>; // string


// ============================================
// Q10: How would you type a React component props with TypeScript?
// ============================================

// Answer: Use interface or type with proper prop types

import React from 'react';

// Basic props
interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  onAddToCart: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, onAddToCart }) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>${price}</p>
      <button onClick={() => onAddToCart(id)}>Add to Cart</button>
    </div>
  );
};

// Props with children
interface ContainerProps {
  title: string;
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ title, children }) => {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
};

// Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
<List<Product>
  items={products}
  renderItem={(product) => <span>{product.name}</span>}
/>

// Event handlers
interface FormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
