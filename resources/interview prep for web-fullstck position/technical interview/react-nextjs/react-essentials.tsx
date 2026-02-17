// ============================================
// REACT HOOKS & PATTERNS - INTERVIEW CHEATSHEET
// ============================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from 'react';

// --- 1. STATE & EFFECTS ---
function Counter() {
  const [count, setCount] = useState(0);

  // Effect: Sync mechanisms (Data fetch, DOM access, subscriptions)
  useEffect(() => {
    document.title = `Count: ${count}`;
    
    // Cleanup function (runs before next effect or unmount)
    return () => { document.title = 'React App'; };
  }, [count]); // Dependency array: run only when 'count' changes

  // Functional update (safe for stale closures)
  const safeIncrement = () => setCount(prev => prev + 1);

  return <button onClick={safeIncrement}>{count}</button>;
}

// --- 2. MEMOIZATION (Performance) ---
const ExpensiveList = React.memo(({ items, onItemClick }: any) => {
  console.log("Renders only if props change");
  return <div>{items.length}</div>;
});

function Parent({ data }) {
  // useMemo: Cache expensive calculation result
  const sortedData = useMemo(() => {
    return data.sort((a, b) => a.id - b.id);
  }, [data]);

  // useCallback: Stable function reference across renders
  // Essential when passing functions to memoized children
  const handleClick = useCallback((id) => {
    console.log(id);
  }, []); 

  return <ExpensiveList items={sortedData} onItemClick={handleClick} />;
}

// --- 3. REFS (Mutable State / DOM) ---
function TextInput() {
  const inputRef = useRef(null); // DOM access
  const renderCount = useRef(0); // Mutable value, NO re-render

  useEffect(() => {
    inputRef.current.focus();
    renderCount.current++;
  });

  return <input ref={inputRef} />;
}

// --- 4. CUSTOM HOOK (Logic Reuse) ---
function useFetch(url: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true; // Fix race conditions
    setLoading(true);
    
    fetch(url)
      .then(res => res.json())
      .then(data => { if (active) setData(data); })
      .finally(() => { if (active) setLoading(false); });
      
    return () => { active = false; };
  }, [url]);

  return { data, loading };
}

// --- 5. CONTEXT (Prop Drilling) ---
const ThemeContext = React.createContext('light');

function AppProvider({ children }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
