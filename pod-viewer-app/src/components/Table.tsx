import React, { useState } from "react";
import { cn } from "./../utils/cn";
import { ArrowUpDown } from "lucide-react";

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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                onClick={() => handleSort(col)}
              >
                <div className="flex items-center gap-1">
                  {col}
                  <ArrowUpDown
                    size={14}
                    className={cn(
                      "opacity-30 transition-transform",
                      sortColumn === col
                        ? sortDirection === "asc"
                          ? "rotate-180 opacity-70"
                          : "opacity-70"
                        : ""
                    )}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-500"
              >
                No data available.
              </td>
            </tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr
                key={idx}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-sm text-gray-800 font-mono">
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
