/**
 * Tests for EnterpriseTable component
 * Framework: Vitest + React Testing Library
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { EnterpriseTable, type Column } from "../src/components/EnterpriseTable";

// --- Test Data ---

interface TestUser {
  id: string;
  name: string;
  email: string;
  role: string;
  age: number;
}

const columns: Column<TestUser>[] = [
  { key: "name", header: "Name", sortable: true, filterable: true },
  { key: "email", header: "Email", sortable: true, filterable: true },
  { key: "role", header: "Role", sortable: true },
  {
    key: "age",
    header: "Age",
    sortable: true,
    render: (val) => `${val} yrs`,
  },
];

const testUsers: TestUser[] = [
  { id: "1", name: "Alice", email: "alice@test.com", role: "admin", age: 30 },
  { id: "2", name: "Bob", email: "bob@test.com", role: "user", age: 25 },
  { id: "3", name: "Charlie", email: "charlie@test.com", role: "admin", age: 35 },
  { id: "4", name: "Diana", email: "diana@test.com", role: "viewer", age: 28 },
  { id: "5", name: "Eve", email: "eve@test.com", role: "user", age: 22 },
];

// --- Render Tests ---

describe("EnterpriseTable", () => {
  it("should render all rows", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.getByText("Charlie")).toBeDefined();
  });

  it("should render column headers", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);

    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Email")).toBeDefined();
    expect(screen.getByText("Role")).toBeDefined();
    expect(screen.getByText("Age")).toBeDefined();
  });

  it("should render custom cell renderer", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);

    expect(screen.getByText("30 yrs")).toBeDefined();
    expect(screen.getByText("25 yrs")).toBeDefined();
  });

  it("should show empty message when no data", () => {
    render(
      <EnterpriseTable
        data={[]}
        columns={columns}
        emptyMessage="No users found"
      />
    );

    expect(screen.getByText("No users found")).toBeDefined();
  });

  it("should show loading skeleton", () => {
    render(
      <EnterpriseTable data={testUsers} columns={columns} loading={true} />
    );

    expect(screen.getByRole("status")).toBeDefined();
  });
});

// --- Sorting Tests ---

describe("Sorting", () => {
  it("should sort ascending on first click", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);

    fireEvent.click(screen.getByText("Name"));

    const rows = screen.getAllByRole("row");
    // First row is header, data rows start at index 1
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText("Alice")).toBeDefined();
  });

  it("should sort descending on second click", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);

    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader); // asc
    fireEvent.click(nameHeader); // desc

    const rows = screen.getAllByRole("row");
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText("Eve")).toBeDefined();
  });

  it("should show sort indicator", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);

    fireEvent.click(screen.getByText("Name"));

    expect(screen.getByText("↑")).toBeDefined();
  });
});

// --- Filtering Tests ---

describe("Filtering", () => {
  it("should filter data by text input", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);

    const nameFilter = screen.getByPlaceholderText("Filter Name...");
    fireEvent.change(nameFilter, { target: { value: "Ali" } });

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.queryByText("Bob")).toBeNull();
  });

  it("should be case-insensitive", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);

    const nameFilter = screen.getByPlaceholderText("Filter Name...");
    fireEvent.change(nameFilter, { target: { value: "alice" } });

    expect(screen.getByText("Alice")).toBeDefined();
  });

  it("should clear filter when input is empty", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);

    const nameFilter = screen.getByPlaceholderText("Filter Name...");
    fireEvent.change(nameFilter, { target: { value: "Ali" } });
    fireEvent.change(nameFilter, { target: { value: "" } });

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });
});

// --- Pagination Tests ---

describe("Pagination", () => {
  it("should paginate data", () => {
    render(
      <EnterpriseTable data={testUsers} columns={columns} pageSize={2} />
    );

    // Should show first 2 items
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.queryByText("Charlie")).toBeNull();
  });

  it("should navigate to next page", () => {
    render(
      <EnterpriseTable data={testUsers} columns={columns} pageSize={2} />
    );

    fireEvent.click(screen.getByLabelText("Next page"));

    expect(screen.queryByText("Alice")).toBeNull();
    expect(screen.getByText("Charlie")).toBeDefined();
  });

  it("should show page info", () => {
    render(
      <EnterpriseTable data={testUsers} columns={columns} pageSize={2} />
    );

    expect(screen.getByText(/Page 1 of 3/)).toBeDefined();
  });

  it("should disable prev button on first page", () => {
    render(
      <EnterpriseTable data={testUsers} columns={columns} pageSize={2} />
    );

    const prevBtn = screen.getByLabelText("Previous page");
    expect(prevBtn).toHaveProperty("disabled", true);
  });
});

// --- Selection Tests ---

describe("Selection", () => {
  it("should select individual rows", () => {
    const onSelect = vi.fn();
    render(
      <EnterpriseTable
        data={testUsers}
        columns={columns}
        selectable
        onSelectionChange={onSelect}
      />
    );

    const checkbox = screen.getByLabelText("Select row 1");
    fireEvent.click(checkbox);

    expect(onSelect).toHaveBeenCalled();
  });

  it("should select all rows on page", () => {
    render(
      <EnterpriseTable
        data={testUsers}
        columns={columns}
        selectable
        pageSize={3}
      />
    );

    const selectAll = screen.getByLabelText("Select all rows");
    fireEvent.click(selectAll);

    // All visible checkboxes should be checked
    const checkboxes = screen.getAllByRole("checkbox");
    // First checkbox is "select all", rest are row checkboxes
    checkboxes.slice(1).forEach((cb) => {
      expect(cb).toHaveProperty("checked", true);
    });
  });

  it("should call onRowClick", () => {
    const onClick = vi.fn();
    render(
      <EnterpriseTable
        data={testUsers}
        columns={columns}
        onRowClick={onClick}
      />
    );

    const rows = screen.getAllByRole("row");
    fireEvent.click(rows[1]); // first data row

    expect(onClick).toHaveBeenCalledWith(testUsers[0]);
  });
});

// --- Accessibility Tests ---

describe("Accessibility", () => {
  it("should have grid role", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);
    expect(screen.getByRole("grid")).toBeDefined();
  });

  it("should have aria-sort on sorted column", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);

    fireEvent.click(screen.getByText("Name"));

    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader?.getAttribute("aria-sort")).toBe("ascending");
  });

  it("should have aria-label on filter inputs", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);
    expect(screen.getByLabelText("Filter by Name")).toBeDefined();
  });

  it("should have pagination navigation role", () => {
    render(<EnterpriseTable data={testUsers} columns={columns} />);
    expect(screen.getByRole("navigation")).toBeDefined();
  });
});
