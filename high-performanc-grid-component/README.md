# High-Performance Grid Component

A highly performant React component for visualizing and interacting with large JSON and CSV datasets in both tree and grid views.

## Tech Stack

- **React 18** - UI library
- **Sass** - Advanced styling
- **Create React App** - Development tooling
- **JavaScript** - Core implementation

## Purpose

This project provides a reusable, high-performance data grid component optimized for rendering and navigating large datasets. It's designed to handle JSON and CSV data efficiently, offering dual visualization modes (tree and grid) for maximum flexibility.

## Main Features

- Virtual scrolling for rendering only visible rows
- Dynamic column resizing with mouse drag and auto-fit
- Fixed columns and rows for sticky headers
- Row selection and multi-cell selection
- Custom cell rendering with React components
- Filter rows and summary rows support
- Context menu support for cells
- Tree view with multi-column support
- Drag-and-drop column reordering
- Alternating row shading for readability

## Complex Features - Technical Details

### 1. Virtual Scrolling Engine
Implements a custom virtualization system that renders only visible rows in viewport, dynamically calculating which rows to display based on scroll position. Uses `useCallback` memoization to prevent unnecessary re-renders of row components.

**Technical Implementation:**
- Calculates visible row range from scroll offset and viewport height
- Maintains a render buffer for smooth scrolling
- Updates DOM elements on scroll with throttled event handling
- Memory-efficient: renders ~20-30 rows instead of thousands

### 2. Dynamic Column Resizing
Real-time column width adjustment using pointer capture API and delta calculations.

**Technical Implementation:**
- Pointer capture prevents losing mouse events during fast drags  
- Delta-based calculation: `newWidth = lastWidth + (currentX - startX)`
- Double-click auto-fit: iterates visible rows to find max text width
- Minimum width constraint (10px) prevents column collapse

### 3. Sticky Headers with Fixed Columns
Separate rendering containers for fixed vs scrollable columns, synchronized scroll positions.

**Technical Implementation:**
- Split DOM structure: `.stickyCellContainer` + `.normalCellContainer`
- CSS `position: sticky` for headers with z-index layering
- Horizontal scroll synchronization between containers
- Independent width calculations per container

## System Design Approach

**Provider Pattern with Render Props**
- `VirtualGridProvider` component manages all grid state and logic
- Parent components pass render functions for `Row`, `FilterRow`, `SummaryRow`
- Enables customization without modifying core grid logic
- Separation of concerns: provider handles virtualization, parent handles data

**Component Composition Architecture**
- Hierarchical structure: `Grid → Rows → Cells`
- Each level memoized with `React.memo` and `useCallback`
- Props drilling minimized through specialized render props
- Event handlers passed down through provider props

**Hook-Based State Management**
- `useState` for reactive data and UI state
- `useRef` for DOM references and imperative API
- `useEffect` for synchronization (scroll, resize, data changes)
- `useCallback` for optimized event handlers

## Algorithms & Data Structures

**Data Structures:**
- **2D Array** - Primary data storage for grid cells `records[row][column]`
- **Hash Map** - Column size storage for O(1) lookup `columnSizes[colIndex]`
- **Set-like Structure** - Selected cell tracking for quick containment checks
- **Array of Objects** - Row data with named fields for filtering

**Algorithms:**
- **Binary Range Calculation** - Determines visible row range: `Math.floor(scrollTop / rowHeight)`
- **Text Width Measurement** - Uses canvas context to calculate text width for auto-fit
- **Viewport Intersection** - Calculates which cells are in visible scroll area
- **Selection Square Algorithm** - Checks if `[row, col]` falls within selected range bounds
- **Delta Accumulation** - For smooth column resizing during drag operations
