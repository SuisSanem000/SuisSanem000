// ============================================
// JAVASCRIPT CORE CONCEPTS - MAIN TOPICS
// ============================================

// ============================================
// 1. EVENT LOOP
// ============================================
// The event loop is JavaScript's mechanism for handling asynchronous operations
// Order: Call Stack → Microtask Queue (Promises) → Macrotask Queue (setTimeout, setInterval)

console.log('1 - Synchronous');

setTimeout(() => {
  console.log('2 - Macrotask (setTimeout)');
}, 0);

Promise.resolve().then(() => {
  console.log('3 - Microtask (Promise)');
});

console.log('4 - Synchronous');

// Output order: 1, 4, 3, 2
// Explanation: Sync code runs first, then microtasks (Promises), then macrotasks (setTimeout)


// ============================================
// 2. CLOSURES
// ============================================
// A closure is when a function retains access to variables from its outer scope
// even after the outer function has returned

function createCounter() {
  let count = 0; // Private variable
  
  return {
    increment: function() {
      count++;
      return count;
    },
    decrement: function() {
      count--;
      return count;
    },
    getCount: function() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2
// 'count' is private and only accessible through the returned methods


// ============================================
// 3. ASYNC/AWAIT AND ERROR HANDLING
// ============================================
// Proper async error handling prevents silent failures

// BAD - No error handling
async function fetchDataBad(url) {
  const response = await fetch(url);
  return response.json();
  // If fetch fails, error is unhandled!
}

// GOOD - Proper error handling
async function fetchDataGood(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error.message);
    throw error; // Re-throw or return default value
  }
}

// Global error handlers (Node.js-specific — not available in browser JS)
// Browser equivalent: window.addEventListener('unhandledrejection', ...)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});


// ============================================
// 4. THIS BINDING
// ============================================
// 'this' is determined by HOW a function is called, not WHERE it's defined

const user = {
  name: 'Simin',
  greet: function() {
    return `Hello, ${this.name}`;
  },
  greetArrow: () => {
    return `Hello, ${this.name}`; // Arrow function - lexical 'this'
  }
};

console.log(user.greet()); // "Hello, Simin" - implicit binding

const greet = user.greet;
console.log(greet()); // "Hello, undefined" - lost context

// Fix 1: bind
const boundGreet = user.greet.bind(user);
console.log(boundGreet()); // "Hello, Simin"

// Fix 2: call/apply
console.log(user.greet.call(user)); // "Hello, Simin"

// Arrow functions always use lexical 'this'
const obj = {
  name: 'Test',
  regular: function() { return this.name; },
  arrow: () => this.name // 'this' from outer scope
};


// ============================================
// 5. PROMISES
// ============================================
// Promises represent eventual completion or failure of async operations
// States: pending, fulfilled, rejected

// Creating a Promise
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, name: 'User' + id });
      } else {
        reject(new Error('Invalid ID'));
      }
    }, 100);
  });
}

// Using Promises
fetchUser(1)
  .then(user => {
    console.log('User:', user);
    return fetchUser(2); // Chain another promise
  })
  .then(user2 => {
    console.log('User 2:', user2);
  })
  .catch(error => {
    console.error('Error:', error.message);
  })
  .finally(() => {
    console.log('Cleanup');
  });

// Promise.all - wait for all
Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)])
  .then(users => {
    console.log('All users:', users);
  })
  .catch(error => {
    console.error('One failed:', error);
  });

// Promise.race - first to complete
Promise.race([fetchUser(1), fetchUser(2)])
  .then(winner => {
    console.log('First to complete:', winner);
  });

// Promise.allSettled - wait for all, don't fail fast
Promise.allSettled([fetchUser(1), fetchUser(-1)])
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Promise ${index} succeeded:`, result.value);
      } else {
        console.log(`Promise ${index} failed:`, result.reason);
      }
    });
  });


// ============================================
// 6. PROTOTYPAL INHERITANCE
// ============================================
// JavaScript uses prototypes for inheritance, not classical classes

// Constructor function (old way)
function Product(name, price) {
  this.name = name;
  this.price = price;
}

Product.prototype.display = function() {
  return `${this.name}: $${this.price}`;
};

const laptop = new Product('Laptop', 1000);
console.log(laptop.display()); // "Laptop: $1000"
console.log(laptop.__proto__ === Product.prototype); // true

// ES6 Class syntax (syntactic sugar over prototypes)
class ProductES6 {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
  
  display() {
    return `${this.name}: $${this.price}`;
  }
  
  static compare(p1, p2) {
    return p1.price - p2.price;
  }
}

// Inheritance
class ElectronicProduct extends ProductES6 {
  constructor(name, price, warranty) {
    super(name, price); // Call parent constructor
    this.warranty = warranty;
  }
  
  display() {
    return `${super.display()} (${this.warranty} year warranty)`;
  }
}

const phone = new ElectronicProduct('Phone', 800, 2);
console.log(phone.display()); // "Phone: $800 (2 year warranty)"


// ============================================
// 7. COMMON PATTERNS & UTILITIES
// ============================================

// Debounce - delay execution until after delay ms
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const search = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

// Throttle - execute at most once per delay ms
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

// Deep clone
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

// Flatten array
function flatten(arr) {
  return arr.reduce((acc, item) => {
    return acc.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

console.log(flatten([1, [2, [3, 4], 5]])); // [1, 2, 3, 4, 5]


// ============================================
// 8. ES5 vs ES6 (ECMAScript 2015) — PROS AND CONS
// ============================================
// ES6 (also called ES2015) introduced major features that modernized JavaScript.
// Understanding the differences is important for interviews and legacy code.

// --------- FEATURE COMPARISON ---------

// 1. Variable declarations
// ES5: only var (function-scoped, hoisted)
var name = 'ES5';

// ES6: let and const (block-scoped, TDZ)
let mutableValue = 'can change';
const immutableRef = 'cannot reassign';

// 2. Arrow functions (ES6)
// ES5:
var multiply = function(a, b) { return a * b; };

// ES6:
const multiplyES6 = (a, b) => a * b;
// Shorter syntax + lexical `this` binding

// 3. Template literals (ES6)
// ES5:
var greeting = 'Hello, ' + name + '! You are ' + age + ' years old.';

// ES6:
const greetingES6 = `Hello, ${name}! You are ${age} years old.`;

// 4. Destructuring (ES6)
// ES5:
var obj = { x: 1, y: 2 };
var x = obj.x;
var y = obj.y;

// ES6:
const { x: x2, y: y2 } = { x: 1, y: 2 };
const [first, second] = [10, 20];

// 5. Default parameters (ES6)
// ES5:
function greetES5(name) {
  name = name || 'World';
  return 'Hello, ' + name;
}

// ES6:
const greetES6 = (name = 'World') => `Hello, ${name}`;

// 6. Spread and Rest operators (ES6)
// ES5:
var arr1 = [1, 2, 3];
var arr2 = arr1.concat([4, 5]);

// ES6:
const arr3 = [...arr1, 4, 5]; // spread
const sumAll = (...nums) => nums.reduce((a, b) => a + b, 0); // rest

// 7. Classes (ES6 — syntactic sugar over prototypes)
// ES5:
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return this.name + ' makes a sound';
};

// ES6:
class AnimalES6 {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}

// 8. Modules (ES6)
// ES5 (CommonJS): require() / module.exports
// ES6 (ESM): import / export — enables tree-shaking

// 9. Promises (ES6)
// ES5: Callbacks only (callback hell)
// ES6: Promise, then/catch/finally
// ES2017: async/await (built on Promises)

// 10. for...of loop (ES6)
// ES5: for...in (iterates keys, works on objects)
// ES6: for...of (iterates values, works on arrays/strings/iterables)
const items = ['a', 'b', 'c'];
for (const item of items) { /* item = 'a', 'b', 'c' */ }

// 11. Map, Set, WeakMap, WeakSet (ES6)
// ES5: Only objects and arrays for collections
// ES6: Proper collection types
const map = new Map();
map.set('key', 'value');
const set = new Set([1, 2, 2, 3]); // {1, 2, 3}

// 12. Symbol (ES6)
// Unique, immutable primitive for object property keys
const uniqueKey = Symbol('description');

// --------- PROS AND CONS ---------

// ES5 PROS:
// ✅ Full browser support (even IE11)
// ✅ No build tools needed (runs as-is)
// ✅ Simple — less features to learn
// ✅ Large existing codebase / documentation

// ES5 CONS:
// ❌ Verbose syntax (no destructuring, template literals)
// ❌ `var` scoping issues lead to bugs
// ❌ Callback-based async = callback hell
// ❌ No native module system (in browser)
// ❌ Prototype-based OOP is confusing

// ES6+ PROS:
// ✅ Cleaner, more readable syntax
// ✅ Block scoping with let/const prevents bugs
// ✅ Promises and async/await for async code
// ✅ Native modules with tree-shaking
// ✅ Destructuring, spread, rest for elegant code
// ✅ Classes for familiar OOP patterns

// ES6+ CONS:
// ❌ Requires transpilation (Babel) for old browsers
// ❌ Build tooling adds complexity
// ❌ More features = more to learn
// ❌ Some features can be misused (e.g., overusing classes)

// Interview tip: Modern projects always use ES6+
// Transpilers like Babel convert ES6 to ES5 for compatibility
// TypeScript is a superset of ES6+ with type system added
