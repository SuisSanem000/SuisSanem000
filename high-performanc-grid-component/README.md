# High-Performance Grid Component

A reusable React component for rendering and interacting with large JSON and CSV datasets, supporting both grid and tree view modes. Built to stay performant at scale — the virtual scrolling engine renders only the rows in the viewport regardless of total dataset size.

## Tech Stack

React 18 · Sass · JavaScript

---

## What it Does

The component presents tabular or hierarchical data in two modes: a flat grid and a nested tree view with multi-column support. It handles datasets that would bring a naïve rendering approach to a crawl by virtualising the row list, and it provides a full set of interaction primitives — column resizing, multi-cell selection, drag-and-drop reordering, sticky headers, context menus, filter rows, and summary rows.

---

## Key Implementation Details

**Virtual scrolling.** The engine calculates the visible row range from scroll position and viewport height (`Math.floor(scrollTop / rowHeight)`), maintains a render buffer for scroll smoothness, and only mounts ~20–30 row components at a time regardless of how large the dataset is. Scroll handlers are throttled and row components are memoised with `useCallback` to prevent cascade re-renders.

**Column resizing.** Uses the browser's pointer capture API so that mouse events aren't lost when the cursor moves faster than the resize handle. Width is tracked as a delta from the drag start position: `newWidth = lastWidth + (currentX - startX)`, with a 10px minimum to prevent column collapse. Double-clicking a column header triggers auto-fit: it measures the pixel width of each visible cell's text using a `CanvasRenderingContext2D` and sets the column to the widest value found.

**Sticky headers with fixed columns.** The DOM is split into `.stickyCellContainer` (fixed columns) and `.normalCellContainer` (scrollable columns). Fixed columns use CSS `position: sticky` with z-index layering; horizontal scroll is synchronised between the two containers. Each container calculates its own widths independently.

**Multi-cell selection.** Selected cells are tracked as a rectangular range `[startRow, startCol, endRow, endCol]`. Containment checks run as `row >= startRow && row <= endRow && col >= startCol && col <= endCol` — O(1) per cell.

**Provider/render-props architecture.** `VirtualGridProvider` owns all grid state and logic. Parent components pass render functions for `Row`, `FilterRow`, and `SummaryRow`, which means the grid can be customised extensively without forking the virtualization core. The component hierarchy (`Grid → Rows → Cells`) is fully memoised at every level.
