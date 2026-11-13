// ============================================
// FRONT-END LEAD INTERVIEW — CODE EXAMPLES
// TypeScript / React / Next.js
// Focus: Performance, Scaling, Production Patterns
// ============================================

import React, {
  useState, useEffect, useCallback, useMemo, useRef,
  Suspense, lazy, createContext, useContext,
  type ReactNode, type FC
} from 'react';

// ============================================
// Q1: Debounce Hook — Avoid excessive API calls
// ============================================

// WHY: Typing "laptop" fires 6 keystrokes. Without debounce, 6 API calls.
// With debounce, only 1 call after user stops typing.

function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cleanup: cancel timer if value changes before delay
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

// Usage: Search with debounce
function SearchProducts() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); // wait 300ms after last keystroke
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
      />
      <ul>
        {results.map(p => <li key={p.id}>{p.name}</li>)}
      </ul>
    </div>
  );
}


// ============================================
// Q2: React.memo + useCallback — Prevent unnecessary re-renders
// ============================================

// SCENARIO: A list of 500 product cards. Parent re-renders on every filter change.
// Without optimization, all 500 cards re-render even if their props didn't change.

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

// React.memo: Only re-renders if props change (shallow comparison)
const ProductCard = React.memo(function ProductCard({ product, onAddToCart }: ProductCardProps) {
  console.log(`Rendering: ${product.name}`); // Should only log when this card's props change

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>Add to Cart</button>
    </div>
  );
});

function ProductGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('');

  // useCallback: Stable function reference — prevents ProductCard re-renders
  const handleAddToCart = useCallback((id: number) => {
    console.log('Adding to cart:', id);
    // addToCart(id);
  }, []); // empty deps = function never changes

  // useMemo: Only recompute filtered list when products or filter change
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [products, filter]);

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter..."
      />
      <div className="grid">
        {filteredProducts.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            onAddToCart={handleAddToCart} // stable reference
          />
        ))}
      </div>
    </div>
  );
}


// ============================================
// Q3: Intersection Observer Hook — Lazy loading & infinite scroll
// ============================================

// WHY: Loading 5000 images at once = slow. Load only when they enter the viewport.

function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => observer.disconnect(); // cleanup
  }, [options]);

  return [ref, isVisible];
}

// Usage: Infinite scroll
function InfiniteProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Sentinel element at the bottom of the list
  const [sentinelRef, isBottomVisible] = useIntersectionObserver({
    threshold: 0.1,
  });

  // Load more when sentinel becomes visible
  useEffect(() => {
    if (!isBottomVisible || loading || !hasMore) return;

    setLoading(true);
    fetch(`/api/products?page=${page}&limit=20`)
      .then(res => res.json())
      .then(data => {
        setProducts(prev => [...prev, ...data.items]);
        setHasMore(data.hasMore);
        setPage(prev => prev + 1);
      })
      .finally(() => setLoading(false));
  }, [isBottomVisible, loading, hasMore, page]);

  return (
    <div>
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAddToCart={() => {}} />
      ))}
      {/* Invisible sentinel triggers loading when scrolled into view */}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && <p>Loading more...</p>}
    </div>
  );
}


// ============================================
// Q4: Error Boundary — Graceful error handling in React
// ============================================

// WHY: An uncaught error in one component shouldn't crash the entire app.
// Error Boundaries catch errors during rendering and show fallback UI.

// NOTE: Error boundaries must be class components (React limitation)

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Class property for state (no constructor needed)
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log to monitoring service (Sentry, LogRocket, etc.)
    console.error('Error caught by boundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage: Wrap risky components
// <ErrorBoundary fallback={<p>Failed to load chart</p>}>
//   <AnalyticsChart />
// </ErrorBoundary>


// ============================================
// Q5: Code Splitting with Dynamic Imports — Reduce initial bundle
// ============================================

// WHY: Don't load a 200KB chart library if user never visits the analytics page.

// Next.js dynamic import (with SSR disabled for client-only components)
// import dynamic from 'next/dynamic';
// const HeavyChart = dynamic(() => import('../components/HeavyChart'), {
//   loading: () => <p>Loading chart...</p>,
//   ssr: false, // don't render on server (uses browser-only APIs)
// });

// React.lazy equivalent
const LazyChart = lazy(() => import('./HeavyChart'));

function AnalyticsPage() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <h1>Analytics</h1>
      <button onClick={() => setShowChart(true)}>Show Chart</button>

      {showChart && (
        {/* Suspense shows the 'fallback' while LazyChart is downloading */}
        <Suspense fallback={<div>Loading chart...</div>}>
          <LazyChart />
        </Suspense>
      )}
    </div>
  );
}


// ============================================
// Q6: Context Performance — Split contexts to avoid mass re-renders
// ============================================

// PROBLEM: One context with everything → every consumer re-renders on any change
// SOLUTION: Split into separate contexts by update frequency

// BAD: Single context for everything
// const AppContext = createContext({ user: null, theme: 'dark', notifications: [] });
// Changing notifications re-renders EVERY consumer, even those only reading theme

// GOOD: Separate contexts
interface User {
  id: number;
  name: string;
  role: string;
}

const AuthContext = createContext<{
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
} | null>(null);

const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
} | null>(null);

// Custom hooks for clean consumption
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Now changing the theme doesn't re-render components that only use auth


// ============================================
// Q7: Accessible Modal — Focus trap + keyboard navigation
// ============================================

// WHY: A modal that can't be closed with Escape or navigated with Tab
// is a wall for keyboard and screen reader users.

function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape]);
}

function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Close on Escape
  useEscapeKey(onClose);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Save current focus to restore later
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Move focus into modal
      modalRef.current?.focus();
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose} // close on backdrop click
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()} // prevent close when clicking inside
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}


// ============================================
// Q8: Custom Hook — useLocalStorage with SSR safety
// ============================================

// WHY: localStorage doesn't exist on the server (Next.js SSR).
// This hook handles hydration mismatch safely.

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Use initialValue during SSR, read from localStorage on client
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue; // SSR safety

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }

      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
}

// Usage:
// const [theme, setTheme] = useLocalStorage('theme', 'dark');
// const [cart, setCart] = useLocalStorage<Product[]>('cart', []);


// ============================================
// Q9: Responsive Hook — useMediaQuery
// ============================================

// WHY: Sometimes CSS media queries aren't enough.
// CSS Media Query: Condition block in your CSS file.
// Example: @media (max-width: 768px) { .sidebar { display: none; } }
// Limitation: The element is still in the DOM, just hidden. React still renders it.
// JS media queries let you NOT render the component at all (better performance).

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Usage:
function ResponsiveNav() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Render completely different component trees, not just different styles
  return isMobile ? <MobileNav /> : <DesktopNav />;
}


// ============================================
// Q10: Discriminated Union for async state — Type-safe loading/error/success
// ============================================

// WHY: Instead of 3 separate booleans (loading, error, data) that can be
// in impossible states, use a discriminated union that makes illegal states unrepresentable.

// BAD: allows impossible states like { loading: true, error: 'fail', data: [...] }
// interface BadState { loading: boolean; error: string | null; data: Product[] | null; }

// GOOD: exactly one state at a time
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function useAsync<T>(fetchFn: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;

    setState({ status: 'loading' });

    fetchFn()
      .then(data => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch(err => {
        if (!cancelled) setState({ status: 'error', error: err.message });
      });

    return () => { cancelled = true; };
  }, [fetchFn]);

  return state;
}

// Usage: TypeScript FORCES you to handle each case
function ProductPage() {
  const state = useAsync(() => fetch('/api/products').then(r => r.json()));

  switch (state.status) {
    case 'idle':
      return null;
    case 'loading':
      return <div>Loading...</div>;
    case 'error':
      return <div>Error: {state.error}</div>; // TS knows `error` exists here
    case 'success':
      return <div>{state.data.length} products</div>; // TS knows `data` exists here
  }
}


// ============================================
// Q11: Throttle vs Debounce — when to use which?
// ============================================

// Debounce: Wait until user STOPS doing something (search input)
// Throttle: Execute at most once per interval WHILE user is doing something (scroll, resize)

function useThrottle<T>(value: T, intervalMs: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now - lastUpdated.current >= intervalMs) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, intervalMs - (now - lastUpdated.current));

      return () => clearTimeout(timer);
    }
  }, [value, intervalMs]);

  return throttledValue;
}

// Real-world use cases:
// Debounce → search input, form validation, window resize handler
// Throttle → scroll position tracking, mousemove events, API rate limiting


// ============================================
// Placeholder types (not part of questions)
// ============================================
function MobileNav() { return <nav>Mobile</nav>; }
function DesktopNav() { return <nav>Desktop</nav>; }
declare function HeavyChart(): JSX.Element;
