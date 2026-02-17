// ============================================
// REACT & NEXT.JS INTERVIEW QUESTIONS & ANSWERS
// ============================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ============================================
// Q1: When would you use useCallback vs useMemo?
// ============================================

// Answer:
// - useCallback: Memoize FUNCTIONS to prevent recreation
// - useMemo: Memoize COMPUTED VALUES from expensive operations

function ProductList({ onProductClick }: { onProductClick: (id: number) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterPrice, setFilterPrice] = useState(100);
  
  // useCallback - memoize function
  const handleClick = useCallback((id: number) => {
    console.log('Clicked product:', id);
    onProductClick(id);
  }, [onProductClick]); // Function only recreated if onProductClick changes
  
  // useMemo - memoize calculated value
  const expensiveProducts = useMemo(() => {
    console.log('Filtering expensive products...');
    return products.filter(p => p.price > filterPrice);
  }, [products, filterPrice]); // Only recalculate when these change
  
  return (
    <div>
      {expensiveProducts.map(p => (
        <button key={p.id} onClick={() => handleClick(p.id)}>
          {p.name}
        </button>
      ))}
    </div>
  );
}


// ============================================
// Q2: How do you prevent memory leaks with useEffect?
// ============================================

// Answer: Always return cleanup function to cancel async operations,
// remove event listeners, clear timers

function ProductDetails({ productId }: { productId: number }) {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    // Flag to prevent setting state after unmount
    let cancelled = false;
    
    async function fetchProduct() {
      const data = await fetch(`/api/products/${productId}`);
      const json = await data.json();
      
      // Only update if component still mounted
      if (!cancelled) {
        setProduct(json);
      }
    }
    
    fetchProduct();
    
    // Cleanup: prevent memory leak
    return () => {
      cancelled = true;
    };
  }, [productId]);
  
  return <div>{product?.name}</div>;
}

// Event listener cleanup
function ResizeDetector() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    
    window.addEventListener('resize', handleResize);
    
    // CRITICAL: Remove listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div>Width: {width}</div>;
}

// Timer cleanup
function AutoRefresh() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);
    
    // CRITICAL: Clear interval on cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  return <div>Auto-refreshing...</div>;
}


// ============================================
// Q3: Explain the difference between SSR, SSG, and ISR in Next.js
// ============================================

// Answer:
// SSR: Server-Side Rendering - render on each request (dynamic data)
// SSG: Static Site Generation - render at build time (static content)
// ISR: Incremental Static Regeneration - SSG + revalidation (best of both)

// SSG - Build time generation
export async function getStaticProps() {
  const products = await fetchProducts();
  
  return {
    props: { products }
    // No revalidate = never regenerates after build
  };
}

// ISR - SSG with revalidation (RECOMMENDED for 5M products)
export async function getStaticProps() {
  const products = await fetchProducts();
  
  return {
    props: { products },
    revalidate: 60 // Regenerate every 60 seconds if requested
  };
}

// SSR - On every request
export async function getServerSideProps({ params }) {
  const product = await fetchProduct(params.id);
  
  return {
    props: { product }
    // Fetches fresh data on EVERY request
  };
}

// When to use:
// - SSG: Blog posts, marketing pages, product catalog with ISR
// - ISR: Product pages (5M SKUs), price data with periodic updates
// - SSR: User dashboard, search results, real-time data


// ============================================
// Q4: How would you optimize a React component that re-renders too often?
// ============================================

// Answer: Use React.memo, useCallback, useMemo, and proper key usage

// PROBLEM: Parent re-renders cause all children to re-render
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  console.log('Rendering ProductCard:', product.name);
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={() => onAddToCart(product.id)}>Add to Cart</button>
    </div>
  );
}

// SOLUTION 1: React.memo
const OptimizedProductCard = React.memo(ProductCard);
// Now only re-renders if props actually change

// SOLUTION 2: useCallback for function props
function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  
  // BAD: Creates new function on every render
  const handleAddToCart = (id: number) => {
    console.log('Add to cart:', id);
  };
  
  // GOOD: Memoized function
  const handleAddToCartOptimized = useCallback((id: number) => {
    console.log('Add to cart:', id);
  }, []); // Function never changes
  
  return (
    <div>
      {products.map(p => (
        <OptimizedProductCard 
          key={p.id} 
          product={p}
          onAddToCart={handleAddToCartOptimized}
        />
      ))}
    </div>
  );
}

// SOLUTION 3: useMemo for expensive calculations
function FilteredList({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]); // Only recalculate when these change
  
  return <div>{filteredProducts.map(p => <div key={p.id}>{p.name}</div>)}</div>;
}


// ============================================
// Q5: What are the rules of hooks and why do they matter?
// ============================================

// Answer:
// 1. Only call hooks at the top level (not in loops, conditions, or nested functions)
// 2. Only call hooks from React functions (components or custom hooks)

// BAD - Conditional hook
function BadComponent({ condition }: { condition: boolean }) {
  if (condition) {
    const [state, setState] = useState(0); // ERROR: Hook in condition!
  }
}

// GOOD - Condition inside hook
function GoodComponent({ condition }: { condition: boolean }) {
  const [state, setState] = useState(condition ? 0 : 10);
}

// BAD - Hook in loop
function BadList({ items }: { items: string[] }) {
  items.forEach(item => {
    const [state, setState] = useState(item); // ERROR: Hook in loop!
  });
}

// GOOD - State for entire array
function GoodList({ items }: { items: string[] }) {
  const [states, setStates] = useState(items);
}

// Why? React relies on hook call order to track state
// If order changes between renders, React loses track of which state is which


// ============================================
// Q6: How do you handle race conditions in useEffect?
// ============================================

// Answer: Use a cancellation flag or AbortController

// PROBLEM: User switches products quickly
// Request 1 (product A) starts
// Request 2 (product B) starts
// Request 2 finishes first ✓
// Request 1 finishes later and overwrites with old data ✗

// SOLUTION 1: Cancellation flag
function ProductPage({ productId }: { productId: number }) {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    async function fetchProduct() {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      
      // Only update if this effect hasn't been cancelled
      if (!cancelled) {
        setProduct(data);
      }
    }
    
    fetchProduct();
    
    return () => {
      cancelled = true; // Cancel when productId changes or unmounts
    };
  }, [productId]);
  
  return <div>{product?.name}</div>;
}

// SOLUTION 2: AbortController
function ProductPageWithAbort({ productId }: { productId: number }) {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    const abortController = new AbortController();
    
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          signal: abortController.signal
        });
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request cancelled');
        }
      }
    }
    
    fetchProduct();
    
    return () => {
      abortController.abort(); // Cancel HTTP request
    };
  }, [productId]);
  
  return <div>{product?.name}</div>;
}


// ============================================
// Q7: Implement a custom useFetch hook
// ============================================

// Answer: Reusable hook for data fetching with loading/error states

function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const json = await response.json();
        
        if (!cancelled) {
          setData(json);
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
function ProductDetails({ id }: { id: number }) {
  const { data: product, loading, error } = useFetch<Product>(
    `/api/products/${id}`
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Not found</div>;
  
  return <div>{product.name}</div>;
}


// ============================================
// Q8: How would you implement pagination for 5 million products?
// ============================================

// Answer: Use ISR with cursor-based pagination, not offset

// BAD - Offset pagination (slow for large datasets)
// /products?page=100000&limit=20 → Skips 2M records!

// GOOD - Cursor-based pagination
interface Product {
  id: number;
  name: string;
  price: number;
}

interface PageProps {
  products: Product[];
  nextCursor: number | null;
}

export async function getStaticProps({ params }: { params: { cursor?: string } }) {
  const cursor = params.cursor ? parseInt(params.cursor) : 0;
  const limit = 20;
  
  // Fetch 20 products after cursor
  const products = await db.products
    .where('id', '>', cursor)
    .limit(limit)
    .orderBy('id')
    .getAll();
  
  const nextCursor = products.length === limit 
    ? products[products.length - 1].id 
    : null;
  
  return {
    props: {
      products,
      nextCursor
    },
    revalidate: 300 // ISR: Regenerate every 5 minutes
  };
}

export default function ProductsPage({ products, nextCursor }: PageProps) {
  const router = useRouter();
  
  const loadMore = () => {
    if (nextCursor) {
      router.push(`/products/${nextCursor}`);
    }
  };
  
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
      {nextCursor && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}


// ============================================
// Q9: How do you handle authentication in Next.js?
// ============================================

// Answer: Use middleware to protect routes

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  // Check if accessing protected route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Verify token
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};


// ============================================
// Q10: What's the difference between getStaticPaths with fallback true, false, and 'blocking'?
// ============================================

// Answer:
// - fallback: false → Only pre-rendered paths exist, others 404
// - fallback: true → Show fallback UI while generating new page client-side
// - fallback: 'blocking' → Wait for generation server-side (no fallback UI)

// fallback: false
export async function getStaticPaths() {
  const products = await fetchAllProducts(); // All 5M products?!
  
  return {
    paths: products.map(p => ({ params: { id: p.id.toString() } })),
    fallback: false // Only these paths exist, others 404
  };
}

// fallback: 'blocking' (RECOMMENDED for large catalogs)
export async function getStaticPaths() {
  const popularProducts = await fetchPopularProducts(); // Top 1000
  
  return {
    paths: popularProducts.map(p => ({ params: { id: p.id.toString() } })),
    fallback: 'blocking' // Generate other pages on-demand
  };
}

// When user visits /products/999999 (not pre-rendered):
// 1. Next.js generates page server-side
// 2. User waits (no fallback UI)
// 3. Page is cached for future requests

// Use 'blocking' for SEO-critical pages (product pages)
