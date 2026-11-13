"use client";

import React from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Award, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GetDateFormate from "@/components/shared/GetDateFormate";
import CellAction from "./CellAction";
import { IBrand } from "@/redux/service/brand/type";

interface TableColumnsProps {
  type?: "active" | "deleted";
}

const tableColumns = ({ type = "active" }: TableColumnsProps) => {
  const columns: ColumnDef<IBrand>[] = [
    {
      accessorKey: "name",
      header: "Brand Details",
      cell: ({ row }) => {
        const brand = row.original;
        const logo = brand.logo;

        return (
          <div className="flex items-center gap-3 py-1">
            <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center">
              {logo ? (
                <Image
                  src={logo}
                  alt={brand.name || "Brand Logo"}
                  fill
                  className="object-cover"
                />
              ) : (
                <Award className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div className="space-y-0.5 min-w-0 max-w-[240px]">
              <span className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                {brand.name}
              </span>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                @{brand.slug}
              </p>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.original.description;
        return (
          <div className="max-w-[280px]">
            {desc ? (
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {desc}
              </p>
            ) : (
              <span className="text-[11px] text-slate-400 italic">No description</span>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority ?? 0;
        return (
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>{priority}</span>
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
      header: "Created Date",
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
