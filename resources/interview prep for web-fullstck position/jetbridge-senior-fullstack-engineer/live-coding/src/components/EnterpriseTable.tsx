/**
 * EnterpriseTable — Generic, sortable, filterable, paginated React table
 * Key patterns: generics in React, custom hooks, memoization, accessibility
 */

import React, {
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

// --- Types ---

export interface Column<T> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
  width?: string;
}

type SortDirection = "asc" | "desc" | null;

interface SortState<T> {
  column: keyof T | null;
  direction: SortDirection;
}

interface TableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  selectable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

// --- Custom Hooks ---

function useSort<T>() {
  const [sort, setSort] = useState<SortState<T>>({
    column: null,
    direction: null,
  });

  const toggleSort = useCallback((column: keyof T) => {
    setSort((prev) => {
      if (prev.column !== column) return { column, direction: "asc" };
      if (prev.direction === "asc") return { column, direction: "desc" };
      return { column: null, direction: null }; // third click clears
    });
  }, []);

  const sortData = useCallback(
    (data: T[]): T[] => {
      if (!sort.column || !sort.direction) return data;
      return [...data].sort((a, b) => {
        const aVal = a[sort.column!];
        const bVal = b[sort.column!];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.direction === "asc" ? cmp : -cmp;
      });
    },
    [sort]
  );

  return { sort, toggleSort, sortData };
}

function useFilter<T>(columns: Column<T>[]) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const updateFilter = useCallback((column: string, value: string) => {
    setFilters((prev) => {
      if (!value) {
        const { [column]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [column]: value };
    });
  }, []);

  const filterData = useCallback(
    (data: T[]): T[] => {
      const activeFilters = Object.entries(filters);
      if (activeFilters.length === 0) return data;

      return data.filter((row) =>
        activeFilters.every(([col, filterVal]) => {
          const value = row[col as keyof T];
          return String(value).toLowerCase().includes(filterVal.toLowerCase());
        })
      );
    },
    [filters]
  );

  return { filters, updateFilter, filterData };
}

function usePagination(totalItems: number, pageSize: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 if total pages shrinks (e.g., after filtering)
  const safePage = Math.min(currentPage, totalPages);

  const paginateData = useCallback(
    <T,>(data: T[]): T[] => {
      const start = (safePage - 1) * pageSize;
      return data.slice(start, start + pageSize);
    },
    [safePage, pageSize]
  );

  return {
    currentPage: safePage,
    totalPages,
    setCurrentPage,
    paginateData,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}

function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(ids);
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, toggleOne, toggleAll, clear };
}

// --- Main Component ---

export function EnterpriseTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 20,
  selectable = false,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  onSelectionChange,
}: TableProps<T>) {
  const { sort, toggleSort, sortData } = useSort<T>();
  const { filters, updateFilter, filterData } = useFilter<T>(columns);

  // Pipeline: filter → sort → paginate (order matters)
  const filtered = useMemo(() => filterData(data), [filterData, data]);
  const sorted = useMemo(() => sortData(filtered), [sortData, filtered]);

  const {
    currentPage,
    totalPages,
    setCurrentPage,
    paginateData,
    hasNext,
    hasPrev,
  } = usePagination(sorted.length, pageSize);

  const pageData = useMemo(() => paginateData(sorted), [paginateData, sorted]);
  const { selected, toggleOne, toggleAll } = useSelection();

  // Notify parent of selection changes
  React.useEffect(() => {
    onSelectionChange?.(selected);
  }, [selected, onSelectionChange]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="table-skeleton" role="status" aria-label="Loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-row" />
        ))}
      </div>
    );
  }

  // --- Empty State ---
  if (data.length === 0) {
    return (
      <div className="table-empty" role="status">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="enterprise-table-container">
      {/* Filter row */}
      <div className="table-filters" role="search">
        {columns
          .filter((col) => col.filterable)
          .map((col) => (
            <input
              key={col.key}
              type="text"
              placeholder={`Filter ${col.header}...`}
              value={filters[col.key] ?? ""}
              onChange={(e) => updateFilter(col.key, e.target.value)}
              aria-label={`Filter by ${col.header}`}
            />
          ))}
      </div>

      {/* Table */}
      <table role="grid" aria-rowcount={sorted.length}>
        <thead>
          <tr>
            {selectable && (
              <th scope="col">
                <input
                  type="checkbox"
                  checked={
                    pageData.length > 0 &&
                    pageData.every((row) => selected.has(row.id))
                  }
                  onChange={() => toggleAll(pageData.map((r) => r.id))}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{ width: col.width }}
                aria-sort={
                  sort.column === col.key
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {col.sortable ? (
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="sort-btn"
                  >
                    {col.header}
                    {sort.column === col.key && (
                      <span>{sort.direction === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`${selected.has(row.id) ? "selected" : ""} ${
                onRowClick ? "clickable" : ""
              }`}
              aria-selected={selectable ? selected.has(row.id) : undefined}
            >
              {selectable && (
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleOne(row.id);
                    }}
                    aria-label={`Select row ${row.id}`}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="table-pagination" role="navigation" aria-label="Pagination">
        <span>
          Page {currentPage} of {totalPages} ({sorted.length} results)
        </span>
        <div>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={!hasPrev}
            aria-label="First page"
          >
            ⟨⟨
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!hasPrev}
            aria-label="Previous page"
          >
            ⟨
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!hasNext}
            aria-label="Next page"
          >
            ⟩
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={!hasNext}
            aria-label="Last page"
          >
            ⟩⟩
          </button>
        </div>
      </div>
    </div>
  );
}
