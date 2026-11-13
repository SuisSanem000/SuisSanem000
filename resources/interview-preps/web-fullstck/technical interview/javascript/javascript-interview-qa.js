// ============================================
// JAVASCRIPT INTERVIEW QUESTIONS & ANSWERS
// ============================================

// ============================================
// Q1: Explain the JavaScript event loop. What's the difference between microtasks and macrotasks?
// ============================================

// Answer: The event loop processes code in this order:
// 1. Execute synchronous code (call stack)
// 2. Process all microtasks (Promises, queueMicrotask)
// 3. Process one macrotask (setTimeout, setInterval)
// 4. Repeat

console.log('Start'); // 1. Sync

setTimeout(() => {
  console.log('setTimeout'); // 4. Macrotask
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 1'); // 2. Microtask
}).then(() => {
  console.log('Promise 2'); // 3. Microtask
});

console.log('End'); // 1. Sync

// Output: Start, End, Promise 1, Promise 2, setTimeout


// ============================================
// Q2: What are closures? Give a practical example.
// ============================================

// Answer: A closure is when a function retains access to variables from its outer scope even after the outer function has returned.

function makeAdder(x) {
  return function(y) {
    return x + y; // 'x' is from outer scope
  };
}

const add5 = makeAdder(5);
console.log(add5(3)); // 8
console.log(add5(10)); // 15

// Practical use: Data privacy
function createBankAccount(initialBalance) {
  let balance = initialBalance; // Private variable
  
  return {
    deposit: (amount) => balance += amount,
    withdraw: (amount) => {
      if (amount <= balance) {
        balance -= amount;
        return amount;
      }
      return 0;
    },
    getBalance: () => balance
  };
}

const account = createBankAccount(1000);
account.deposit(500);
console.log(account.getBalance()); // 1500


// ============================================
// Q3: How do you properly handle errors in async/await code?
// ============================================

// Answer: Always use try/catch, check response status, handle rejections

async function fetchProductSafe(id) {
  try {
    const response = await fetch(`/api/products/${id}`);
    
    // Check if request was successful
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const product = await response.json();
    return product;
  } catch (error) {
    console.error('Failed to fetch product:', error.message);
    // Option 1: Re-throw
    throw error;
    // Option 2: Return default value
    // return null;
  }
}

// Handle at call site
async function loadProduct(id) {
  try {
    const product = await fetchProductSafe(id);
    console.log('Product loaded:', product);
  } catch (error) {
    console.error('Could not load product:', error);
  }
}


// ============================================
// Q4: Explain 'this' binding in JavaScript. When does context get lost?
// ============================================

// Answer: 'this' is determined by HOW a function is called:
// 1. Implicit binding: obj.method() → this = obj
// 2. Explicit binding: func.call(obj) → this = obj
// 3. new binding: new Func() → this = new instance
// 4. Arrow functions: lexical this (from surrounding scope)

const product = {
  name: 'Laptop',
  price: 1000,
  getInfo: function() {
    return `${this.name} costs $${this.price}`;
  }
};

// Context is preserved
console.log(product.getInfo()); // "Laptop costs $1000"

// Context is LOST when function is extracted
const getInfo = product.getInfo;
console.log(getInfo()); // "undefined costs $undefined"

// Fix 1: Use bind
const boundGetInfo = product.getInfo.bind(product);
console.log(boundGetInfo()); // "Laptop costs $1000"

// Fix 2: Use call/apply
console.log(getInfo.call(product)); // "Laptop costs $1000"

// Fix 3: Arrow function (preserves lexical this)
const product2 = {
  name: 'Phone',
  price: 800,
  getInfo: () => {
    // 'this' refers to outer scope, NOT product2
    console.log(this); // global object or undefined in strict mode
  }
};


// ============================================
// Q5: What are Promises and how do they work?
// ============================================

// Answer: Promises represent async operations with 3 states:
// - pending: initial state
// - fulfilled: operation completed successfully
// - rejected: operation failed

// Creating a Promise
function delay(ms, value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (ms >= 0) {
        resolve(value);
      } else {
        reject(new Error('Delay cannot be negative'));
      }
    }, ms);
  });
}

// Chaining Promises
delay(100, 'first')
  .then(result => {
    console.log(result); // 'first'
    return delay(100, 'second');
  })
  .then(result => {
    console.log(result); // 'second'
  })
  .catch(error => {
    console.error('Error:', error.message);
  })
  .finally(() => {
    console.log('Cleanup always runs');
  });


// ============================================
// Q6: Implement debounce from scratch
// ============================================

// Answer: Debounce delays execution until after delay ms have passed since the last call

function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    // Clear previous timeout
    clearTimeout(timeoutId);
    
    // Set new timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage: Search only after user stops typing for 300ms
const searchProducts = debounce((query) => {
  console.log('Searching for:', query);
  // API call here
}, 300);

searchProducts('lap'); // Won't execute
searchProducts('lapt'); // Won't execute
searchProducts('laptop'); // Executes after 300ms


// ============================================
// Q7: Implement Promise.all from scratch
// ============================================

// Answer: Promise.all waits for all promises to resolve or fails fast

function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      return resolve([]);
    }
    
    const results = [];
    let completed = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise) // Handle non-promise values
        .then(value => {
          results[index] = value;
          completed++;
          
          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject); // Fail fast on first error
    });
  });
}

// Test
promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results); // [1, 2, 3]
});


// ============================================
// Q8: What's the difference between map, filter, and reduce?
// ============================================

// Answer:
// - map: Transform each element, returns new array of same length
// - filter: Select elements that pass test, returns subset
// - reduce: Combine all elements into single value

const products = [
  { name: 'Laptop', price: 1000 },
  { name: 'Mouse', price: 20 },
  { name: 'Keyboard', price: 50 }
];

// map - transform
const names = products.map(p => p.name);
console.log(names); // ['Laptop', 'Mouse', 'Keyboard']

// filter - select
const expensive = products.filter(p => p.price > 50);
console.log(expensive); // [{ name: 'Laptop', price: 1000 }]

// reduce - aggregate
const total = products.reduce((sum, p) => sum + p.price, 0);
console.log(total); // 1070


// ============================================
// Q9: How would you deep clone an object?
// ============================================

// Answer: Recursively clone all nested properties

function deepClone(obj) {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // Handle Array
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  // Handle Object
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

// Test
const original = {
  name: 'Product',
  details: {
    price: 100,
    tags: ['new', 'sale']
  }
};

const clone = deepClone(original);
clone.details.price = 200;
console.log(original.details.price); // 100 (unchanged)
console.log(clone.details.price); // 200


// ============================================
// Q10: Explain the difference between var, let, and const
// ============================================

// Answer:
// - var: function-scoped, hoisted, can be redeclared
// - let: block-scoped, not hoisted (TDZ), cannot be redeclared
// - const: block-scoped, not hoisted (TDZ), cannot be reassigned

// var - function scoped
function testVar() {
  if (true) {
    var x = 1;
  }
  console.log(x); // 1 (accessible outside block)
}

// let - block scoped
function testLet() {
  if (true) {
    let y = 2;
  }
  // console.log(y); // ReferenceError: y is not defined
}

// const - cannot reassign
const PI = 3.14;
// PI = 3.15; // TypeError: Assignment to constant variable

// But can mutate objects
const user = { name: 'Simin' };
user.name = 'John'; // OK
// user = {}; // TypeError


// ============================================
// Q11: What is hoisting in JavaScript?
// ============================================

// Answer: Hoisting is JavaScript's default behavior of moving declarations
// to the top of their scope during compilation phase (before execution).
// Only DECLARATIONS are hoisted, NOT initializations.

// 1. var declarations are hoisted and initialized as undefined
console.log(a); // undefined (hoisted, initialized as undefined)
var a = 10;
console.log(a); // 10

// Equivalent to:
// var a;         // declaration hoisted
// console.log(a); // undefined
// a = 10;         // initialization stays here

// 2. let and const are hoisted but NOT initialized → Temporal Dead Zone (TDZ)
// console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 20;

// console.log(c); // ReferenceError: Cannot access 'c' before initialization
const c = 30;

// 3. Function declarations are FULLY hoisted (name + body)
sayHello(); // "Hello!" — works because function is fully hoisted
function sayHello() {
  console.log('Hello!');
}

// 4. Function expressions are NOT fully hoisted
// greet(); // TypeError: greet is not a function (var) or ReferenceError (let/const)
var greet = function() {
  console.log('Hi!');
};

// 5. Arrow functions behave like function expressions (NOT hoisted)
// greetArrow(); // TypeError or ReferenceError
var greetArrow = () => console.log('Hey!');

// Interview Tip: Hoisting is why we prefer let/const over var
// TDZ catches bugs early by preventing access before declaration


// ============================================
// Q12: What's the difference between arrow functions and normal functions?
// ============================================

// Answer: 5 key differences:

// 1. `this` binding
// Regular: dynamic `this` (depends on how it's called)
// Arrow: lexical `this` (inherits from enclosing scope)

const obj = {
  name: 'Product',
  
  regular: function() {
    console.log(this.name); // 'Product' — `this` is obj
  },
  
  arrow: () => {
    console.log(this.name); // undefined — `this` is outer scope (module/global)
  },
  
  // Where arrows are useful: nested callbacks
  delayedLog: function() {
    setTimeout(() => {
      console.log(this.name); // 'Product' — arrow inherits `this` from delayedLog
    }, 100);
    
    // Compare with regular function:
    setTimeout(function() {
      console.log(this.name); // undefined — `this` is lost
    }, 100);
  }
};

// 2. `arguments` object
function regularFunc() {
  console.log(arguments); // [1, 2, 3] — has arguments object
}
regularFunc(1, 2, 3);

const arrowFunc = () => {
  // console.log(arguments); // ReferenceError — arrow has NO arguments object
};
// Use rest params instead: const arrowFunc = (...args) => console.log(args);

// 3. Cannot use `new` with arrow functions
function Person(name) { this.name = name; }
const p = new Person('John'); // ✅ works

const PersonArrow = (name) => { this.name = name; };
// const p2 = new PersonArrow('John'); // ❌ TypeError: not a constructor

// 4. No `prototype` property
console.log(Person.prototype); // {} — regular functions have prototype
console.log(PersonArrow.prototype); // undefined — arrows don't

// 5. Cannot be used as generators
function* genRegular() { yield 1; } // ✅ works
// const genArrow = *() => { yield 1; }; // ❌ SyntaxError

// When to use each:
// Arrow: callbacks, array methods (.map, .filter), short functions
// Regular: object methods, constructors, when you need `this` or `arguments`


// ============================================
// Q13: What is queueMicrotask() and how does it work?
// ============================================

// Answer: queueMicrotask() schedules a function to run as a microtask.
// Microtasks run after the current task completes but before macrotasks (setTimeout, etc.)

// Priority order: Sync code → Microtasks → Macrotasks

console.log('1 - Sync');

setTimeout(() => {
  console.log('2 - Macrotask (setTimeout)');
}, 0);

queueMicrotask(() => {
  console.log('3 - Microtask (queueMicrotask)');
});

Promise.resolve().then(() => {
  console.log('4 - Microtask (Promise)');
});

console.log('5 - Sync');

// Output: 1, 5, 3, 4, 2
// Both queueMicrotask and Promise.then are microtasks
// Microtasks drain completely before any macrotask runs

// Practical use cases:
// 1. Ensure cleanup runs before the next rendering/task
queueMicrotask(() => {
  // This runs after current sync code but before any setTimeout/rendering
  cleanupState();
});

// 2. Batching updates
let pending = false;
function scheduleUpdate() {
  if (!pending) {
    pending = true;
    queueMicrotask(() => {
      flushUpdates();
      pending = false;
    });
  }
}

// 3. Difference from Promise.resolve().then()
// queueMicrotask is slightly more lightweight — no Promise object created
// Both run at the same priority (microtask queue)
// queueMicrotask is the "raw" way to schedule a microtask


// ============================================
// Q14: What's the difference between setTimeout, setInterval, and setTimeout(0)?
// ============================================

// Answer:

// 1. setTimeout(fn, delay) — Execute fn ONCE after delay ms
setTimeout(() => {
  console.log('Runs once after 1000ms');
}, 1000);

// 2. setInterval(fn, delay) — Execute fn REPEATEDLY every delay ms
const intervalId = setInterval(() => {
  console.log('Runs every 1000ms');
}, 1000);
// Must clear to stop: clearInterval(intervalId);

// 3. setTimeout(fn, 0) — Execute fn after current call stack clears
// Does NOT run immediately! It goes to the macrotask queue.
console.log('A');
setTimeout(() => {
  console.log('B'); // Runs AFTER 'C' — it's a macrotask
}, 0);
console.log('C');
// Output: A, C, B

// Key differences:

// setTimeout vs setInterval:
// - setTimeout: fires once, need to call again for repetition
// - setInterval: fires repeatedly until cleared
// - setInterval can cause "drift" if callback takes longer than interval

// Recursive setTimeout vs setInterval:
// setInterval runs every N ms regardless of execution time
setInterval(() => {
  doHeavyWork(); // Takes 200ms
  // Next call happens at N ms from START, not from END
}, 1000);

// Recursive setTimeout guarantees gap between executions
function repeatWithGap() {
  doHeavyWork(); // Takes 200ms
  setTimeout(repeatWithGap, 1000); // Waits 1000ms AFTER completion
}

// setTimeout(0) use cases:
// 1. Defer execution to after current stack (break up long tasks)
function processLargeArray(items) {
  const chunk = items.splice(0, 100);
  processChunk(chunk);
  
  if (items.length > 0) {
    setTimeout(() => processLargeArray(items), 0); // Yield to event loop
  }
}

// 2. Allow DOM to update before next operation
button.textContent = 'Processing...';
setTimeout(() => {
  heavyComputation(); // DOM updates before this runs
  button.textContent = 'Done!';
}, 0);

// Note: Minimum delay is ~4ms in browsers (per HTML spec)
// In Node.js, setTimeout(fn, 0) is equivalent to setTimeout(fn, 1)
