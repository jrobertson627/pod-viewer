import React, { useState } from "react";
import { cn } from "./../utils/cn";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface TableProps<T> {
  data: T[];
  columns: string[];
  onSort?: (column: string, direction: "asc" | "desc") => void;
  renderCell?: (column: string, value: any, row: T) => React.ReactNode;
}

export function Table<T extends Record<string, string | number | undefined>>({
  data,
  columns,
  onSort,
  renderCell,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  
  const handleSort = (column: string) => {
    let newDirection: "asc" | "desc" = "asc";
    if (sortColumn === column && sortDirection === "asc") {
      newDirection = "desc";
    }

    setSortColumn(column);
    setSortDirection(newDirection);

    if (onSort) onSort(column, newDirection);
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = (a[sortColumn] ?? "").toString();
      const bVal = (b[sortColumn] ?? "").toString();
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [data, sortColumn, sortDirection]);

  const toggleCollapse = (column: string) => {
    setCollapsedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(column)) newSet.delete(column);
      else newSet.add(column);
      return newSet;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map(
              (col) => {
                const isCollapsed = collapsedColumns.has(col);
              return (
                <th
                  key={col}
                  className={cn(
                    "px-3 py-2 text-left text-sm font-semibold select-none border-r border-gray-200 relative",
                    isCollapsed && "w-4 overflow-hidden text-gray-400"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      isCollapsed && "justify-center origin-center"
                    )}
                  >
                    <span
                      onClick={() => handleSort(col)}
                      className={cn(
                        "cursor-pointer transition-colors hover:text-blue-600",
                        isCollapsed ? "text-xs tracking-tighter text-gray-500" : "text-gray-700"
                      )}
                    >
                      {col}
                    </span>
                    {!isCollapsed && (
                      <ArrowUpDown
                        size={14}
                        className={cn(
                          "opacity-30 transition-transform",
                          sortColumn === col
                            ? sortDirection === "asc"
                              ? "rotate-180 text-blue-500 opacity-70"
                              : "opacity-70"
                            : ""
                        )}
                      />
                    )}
                    <button
                      onClick={() => toggleCollapse(col)}
                      className={cn(
                        "absolute -right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5",
                        "text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200",
                        isCollapsed && "text-blue-500 bg-blue-50"
                      )}
                      >
                      {isCollapsed ? (
                        <ChevronRight size={16} strokeWidth={2.5} />
                      ) : (
                        <ChevronLeft size={16} strokeWidth={2.5}/>
                      )}
                    </button>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td
                    key={col}
                    className={cn(
                      "px-3 py-2 text-sm text-gray-800 font-mono transition-all",
                      collapsedColumns.has(col)
                        ? "w-0 overflow-hidden text-transparent p-0"
                        : ""
                    )}
                  >
                    {renderCell ? renderCell(col, row[col], row) : row[col]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}