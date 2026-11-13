"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hidePageInfo?: boolean;
  showWhenSinglePage?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  hidePageInfo = false,
  showWhenSinglePage = true,
}: Props) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const currentPage = Math.min(Math.max(1, page || 1), safeTotalPages);

  if (totalPages <= 0) return null;
  if (safeTotalPages <= 1 && !showWhenSinglePage) return null;

  // Create page numbers with ellipsis support
  const getPages = (): (number | string)[] => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", safeTotalPages];
    }

    if (currentPage >= safeTotalPages - 2) {
      return [
        1,
        "...",
        safeTotalPages - 3,
        safeTotalPages - 2,
        safeTotalPages - 1,
        safeTotalPages,
      ];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", safeTotalPages];
  };

  return (
    <div className="flex items-center justify-between px-4 py-2">
      {/* LEFT INFO */}
      {!hidePageInfo && (
        <p className="text-sm text-muted-foreground">
          Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
          <span className="font-semibold text-foreground">{safeTotalPages}</span>
        </p>
      )}

      {/* MIDDLE / RIGHT CONTROLS */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs font-medium"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </Button>

        {/* Page Numbers */}
        {getPages().map((p, idx) =>
          typeof p === "number" ? (
            <Button
              key={p}
              size="sm"
              variant={currentPage === p ? "default" : "outline"}
              onClick={() => onPageChange(p)}
              className="w-9 h-9 p-0 text-xs font-semibold"
            >
              {p}
            </Button>
          ) : (
            <span
              key={`dots-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-xs text-muted-foreground select-none"
            >
              ...
            </span>
          )
        )}

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs font-medium"
          disabled={currentPage >= safeTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
