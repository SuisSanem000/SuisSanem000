// ============================================
// TYPESCRIPT ESSENTIALS - INTERVIEW CHEATSHEET
// ============================================

// --- 1. PRIMITIVES & COMMON TYPES ---
let price: number = 100;
let tags: string[] = ['sale', 'new'];
let role: [number, string] = [1, 'Admin']; // Tuple
enum Status { Pending = 'PENDING', Active = 'ACTIVE' }

// unknown (safer than any)
let input: unknown = getDescription();
if (typeof input === 'string') console.log(input.toUpperCase());

// never (unreachable)
function error(msg: string): never { throw new Error(msg); }

// --- 2. INTERFACES VS TYPES ---
// Interface: Extensible, good for objects
interface User { id: number; name: string; }
interface Admin extends User { permissions: string[]; }

// Type: Unions, Primitives, Intersections
type ID = string | number;
type Coordinates = [x: number, y: number];
type AdminUser = User & { role: 'admin' };

// --- 3. GENERICS (Reusability) ---
function identity<T>(arg: T): T { return arg; }
const num = identity<number>(42);

interface ApiResponse<T> { data: T; status: number; }
const res: ApiResponse<User> = { data: { id: 1, name: 'A' }, status: 200 };

// Constraints
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

// --- 4. UTILITY TYPES (Must Know) ---
interface Product { id: number; name: string; price: number; }

type PartialProduct = Partial<Product>;       // All optional
type PickProduct = Pick<Product, 'name'>;     // Only name
type OmitProduct = Omit<Product, 'price'>;    // All except price
type ReadonlyProduct = Readonly<Product>;     // Immutable
type RecordProduct = Record<string, Product>; // Map object

// ReturnType & Parameters (for functions)
function create(name: string): Product { return { id: 1, name, price: 0 }; }
type ProductReturn = ReturnType<typeof create>;
type ProductParams = Parameters<typeof create>; // [string]

// --- 5. TYPE GUARDS (Narrowing) ---
// typeof
function pad(val: string | number) {
  if (typeof val === 'number') return " ".repeat(val);
  return val;
}

// instanceof
class Dog { bark() {} }
function interact(pet: Dog | string) {
  if (pet instanceof Dog) pet.bark();
}

// Discriminated Unions (Best Practice)
type Success = { status: 'success'; data: string };
type Fail = { status: 'error'; error: Error };
type Result = Success | Fail;

function handle(r: Result) {
  if (r.status === 'success') console.log(r.data);
  else console.log(r.error);
}

// User-Defined Guard
function isDog(pet: any): pet is Dog {
  return (pet as Dog).bark !== undefined;
}

// --- 6. ADVANCED TYPES ---
// Mapped Types
type Optional<T> = { [K in keyof T]?: T[K] };

// Conditional Types
type IsString<T> = T extends string ? true : false;
