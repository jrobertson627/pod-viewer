import React from "react";
import { cn } from "./../utils/cn";

interface DropdownProps {
  label?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
  variant?: "primary" | "secondary";
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onChange,
  className,
  variant = "primary",
}) => {

const selectClasses = cn(
    "border rounded px-3 py-2 text-sm focus:outline-none transition",
    variant === "primary"
      ? "bg-white border-blue-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-800"
      : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 focus:ring-1 focus:ring-gray-400",
    className
  );

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-600 mb-1">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClasses}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};