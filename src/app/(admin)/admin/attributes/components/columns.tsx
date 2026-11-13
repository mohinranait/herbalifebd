"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Sliders, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GetDateFormate from "@/components/shared/GetDateFormate";
import CellAction from "./CellAction";
import { IAttribute } from "@/redux/service/attributes/type";

interface TableColumnsProps {
  type?: "active" | "deleted";
}

const tableColumns = ({ type = "active" }: TableColumnsProps) => {
  const columns: ColumnDef<IAttribute>[] = [
    {
      accessorKey: "name",
      header: "Attribute Name",
      cell: ({ row }) => {
        const attr = row.original;
        const displayName = attr.displayName || attr.name;

        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-10 h-10 rounded-md bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>

            <div className="space-y-0.5 min-w-0 max-w-[220px]">
              <span className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                {displayName}
              </span>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                slug: {attr.name}
              </p>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "values",
      header: "Options / Values",
      cell: ({ row }) => {
        const values = row.original.values || [];
        const maxVisible = 6;
        const visibleValues = values.slice(0, maxVisible);
        const remainingCount = values.length - maxVisible;

        if (values.length === 0) {
          return <span className="text-[11px] text-slate-400 italic">No values defined</span>;
        }

        return (
          <div className="flex flex-wrap items-center gap-1.5 max-w-[340px]">
            {visibleValues.map((val, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs"
              >
                {val}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                +{remainingCount} more
              </span>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "totalOptions",
      header: "Total Options",
      cell: ({ row }) => {
        const count = row.original.values?.length || 0;
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <ListFilter className="w-3.5 h-3.5 text-slate-400" />
            <span>{count}</span>
          </div>
        );
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isActive = Boolean(row.original.status);

        return (
          <Badge
            variant="outline"
            className={`rounded text-[11px] font-semibold ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {isActive ? "Active" : "Draft (Inactive)"}
          </Badge>
        );
      },
    },

    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        return (
          <div className="text-xs text-slate-500">
            <GetDateFormate date={row.original.createdAt} />
          </div>
        );
      },
    },

    {
      id: "actions",
      header: () => <div className="text-right pr-2">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => <CellAction data={row.original} type={type} />,
    },
  ];

  return columns;
};

export default tableColumns;
