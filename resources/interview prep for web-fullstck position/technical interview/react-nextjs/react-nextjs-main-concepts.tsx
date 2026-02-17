// ============================================
// REACT & NEXT.JS - MAIN CONCEPTS
// ============================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ============================================
// 1. REACT HOOKS - useState
// ============================================

// Basic state management
function ProductCounter() {
  const [count, setCount] = useState(0);
  
  // Functional update - when new state depends on previous
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

// Complex state
interface Product {
  id: number;
  name: string;
  price: number;
}

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add product
  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };
  
  // Update product
  const updateProduct = (id: number, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };
  
  // Delete product
  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };
  
  return <div>{/* UI */}</div>;
}


// ============================================
// 2. useEffect - Side Effects and Cleanup
// ============================================

function ProductDetails({ productId }: { productId: number }) {
  const [product, setProduct] = useState<Product | null>(null);
  
  useEffect(() => {
    let cancelled = false; // Flag to prevent race conditions
    
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        
        // Only update if not cancelled
        if (!cancelled) {
          setProduct(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch product:', error);
        }
      }
    }
    
    fetchProduct();
    
    // Cleanup function - prevents memory leaks
    return () => {
      cancelled = true;
    };
  }, [productId]); // Re-run when productId changes
  
  return product ? <div>{product.name}</div> : <div>Loading...</div>;
}

// useEffect with event listeners
function WindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size
    
    // IMPORTANT: Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty deps = run once on mount
  
  return <div>{size.width} x {size.height}</div>;
}

// useEffect with timer
function AutoRefresh() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData().then(setData);
    }, 5000); // Refresh every 5 seconds
    
    // IMPORTANT: Clear interval on cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  return <div>{/* Display data */}</div>;
}


// ============================================
// 3. useCallback - Stable Function References
// ============================================

function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  
  // Without useCallback, handleSearch is recreated on every render
  // This causes child components to re-render unnecessarily
  const handleSearch = useCallback(async (searchQuery: string) => {
    const response = await fetch(`/api/products/search?q=${searchQuery}`);
    const data = await response.json();
    setResults(data);
  }, []); // No dependencies, function never changes
  
  // With dependency
  const handleSearchWithFilter = useCallback(async (searchQuery: string) => {
    const response = await fetch(`/api/products/search?q=${searchQuery}&filter=${query}`);
    const data = await response.json();
    setResults(data);
  }, [query]); // Recreate when query changes
  
  return (
    <div>
      <SearchInput onSearch={handleSearch} />
      {results.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}


// ============================================
// 4. useMemo - Expensive Calculations
// ============================================

function ProductList({ products }: { products: Product[] }) {
  const [filterPrice, setFilterPrice] = useState(100);
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  
  // Without useMemo, this filtering runs on EVERY render
  // even when unrelated state changes
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...'); // Expensive operation
    return products
      .filter(p => p.price >= filterPrice)
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return a.price - b.price;
      });
  }, [products, filterPrice, sortBy]); // Only recompute when these change
  
  // Calculate total
  const total = useMemo(() => {
    return filteredProducts.reduce((sum, p) => sum + p.price, 0);
  }, [filteredProducts]);
  
  return (
    <div>
      <p>Total: ${total}</p>
      {filteredProducts.map(p => (
        <div key={p.id}>{p.name} - ${p.price}</div>
      ))}
    </div>
  );
}


// ============================================
// 5. useRef - DOM Access and Mutable Values
// ============================================

function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const focusInput = () => {
    inputRef.current?.focus(); // Access DOM element
  };
  
  useEffect(() => {
    focusInput(); // Focus on mount
  }, []);
  
  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}

// useRef for mutable values (doesn't trigger re-render)
function RequestTracker() {
  const requestCount = useRef(0);
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    requestCount.current += 1; // Mutate without re-rendering
    console.log('Request count:', requestCount.current);
    
    const response = await fetch('/api/data');
    setData(await response.json());
  };
  
  return <button onClick={fetchData}>Fetch Data ({requestCount.current})</button>;
}


// ============================================
// 6. CUSTOM HOOKS
// ============================================

// Custom hook: useFetch
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [url]);
  
  return { data, loading, error };
}

// Usage
function ProductPage({ id }: { id: number }) {
  const { data: product, loading, error } = useFetch<Product>(`/api/products/${id}`);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{product?.name}</div>;
}

// Custom hook: useDebounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage
function SearchWithDebounce() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery) {
      // Make API call with debounced query
      searchProducts(debouncedQuery);
    }
  }, [debouncedQuery]); // Only fires 300ms after user stops typing
  
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}


// ============================================
// 7. REACT PERFORMANCE OPTIMIZATION
// ============================================

// React.memo - prevent unnecessary re-renders
const ProductCard = React.memo(({ product }: { product: Product }) => {
  console.log('Rendering ProductCard:', product.name);
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
});

// Code splitting with React.lazy
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </React.Suspense>
  );
}


// ============================================
// 8. NEXT.JS - SSG (Static Site Generation)
// ============================================

// pages/products/[id].tsx

// Generate static pages at build time
export async function getStaticPaths() {
  // Fetch all product IDs
  const products = await fetchAllProducts();
  
  const paths = products.map(product => ({
    params: { id: product.id.toString() }
  }));
  
  return {
    paths,
    fallback: 'blocking' // Generate missing pages on-demand
  };
}

// Generate props at build time
export async function getStaticProps({ params }: { params: { id: string } }) {
  const product = await fetchProduct(parseInt(params.id));
  
  return {
    props: {
      product
    },
    revalidate: 60 // ISR: Regenerate page every 60 seconds
  };
}

// Component
export default function ProductPage({ product }: { product: Product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
    </div>
  );
}


// ============================================
// 9. NEXT.JS - SSR (Server-Side Rendering)
// ============================================

// pages/products/search.tsx

// Fetch data on every request
export async function getServerSideProps({ query }: { query: { q: string } }) {
  const products = await searchProducts(query.q);
  
  return {
    props: {
      products,
      query: query.q
    }
  };
}

export default function SearchPage({
  products,
  query
}: {
  products: Product[];
  query: string;
}) {
  return (
    <div>
      <h1>Search results for: {query}</h1>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}


// ============================================
// 10. NEXT.JS - API Routes
// ============================================

// pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    const product = await db.products.findById(Number(id));
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(200).json(product);
  }
  
  if (req.method === 'PATCH') {
    const product = await db.products.update(Number(id), req.body);
    return res.status(200).json(product);
  }
  
  if (req.method === 'DELETE') {
    await db.products.delete(Number(id));
    return res.status(204).end();
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}


// ============================================
// 11. NEXT.JS - Middleware
// ============================================

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('auth-token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Add custom header
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'value');
  
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'] // Apply to specific paths
};
