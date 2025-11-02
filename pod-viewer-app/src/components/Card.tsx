import React from "react";
import { cn } from "./../utils/cn";

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition",
        className
      )}
    >
      {children}
    </div>
  );
};
