// ============================================
// ALGORITHMIC PATTERNS - INTERVIEW CHEATSHEET
// ============================================

// --- 1. DEBOUNCE (Throttling API calls) ---
// Delays execution until 'delay' ms have passed since last call
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
// const search = debounce((q) => fetchResults(q), 500);

// --- 2. DEEP CLONE (Copying objects) ---
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj) as any;
  if (Array.isArray(obj)) return obj.map(deepClone) as any;

  const copy = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepClone(obj[key]);
    }
  }
  return copy;
}

// --- 3. FLATTEN ARRAY ---
function flatten(arr: any[]): any[] {
  return arr.reduce((acc, val) => 
    Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), 
  []);
}
// [1, [2, [3]]] -> [1, 2, 3]

// --- 4. PROMISE.ALL IMPLEMENTATION ---
function myPromiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    let completed = 0;
    
    if (promises.length === 0) resolve([]);

    promises.forEach((p, index) => {
      Promise.resolve(p).then(val => {
        results[index] = val; // Maintain order
        completed++;
        if (completed === promises.length) resolve(results);
      }).catch(reject); // Fail fast
    });
  });
}

// --- 5. LRU CACHE (Map preserves insertion order) ---
class LRUCache<K, V> {
  constructor(private capacity: number, private cache = new Map<K, V>()) {}

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    // Refresh item: remove and re-add to end
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: K, val: V) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, val);
    
    if (this.cache.size > this.capacity) {
      // Delete first item (LRU)
      const first = this.cache.keys().next().value;
      this.cache.delete(first);
    }
  }
}
