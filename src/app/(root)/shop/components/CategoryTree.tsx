"use client";

import { cn } from "@/lib/utils";
import { ICategory } from "@/redux/service/categories/type";
import { ChevronRight, Folder } from "lucide-react";
import { useState } from "react";

interface CategoryNodeProps {
  node: ICategory;
  all: ICategory[];
  activeCat: string;
  handleCatChange: (id: string) => void;
}

function isDescendantActive(id: string, all: ICategory[], activeCat: string): boolean {
  if (activeCat === id) return true;
  return all.filter((c) => c.parentId === id).some((c) => isDescendantActive(c.id, all, activeCat));
}

function CategoryNode({ node, all, activeCat, handleCatChange }: CategoryNodeProps) {
  const children = all.filter((c) => c.parentId === node.id);
  const hasKids = children.length > 0;
  const isActive = activeCat === node.id;
  const [open, setOpen] = useState(() => isDescendantActive(node.id, all, activeCat));

  return (
    <div>
      <div className="flex items-center gap-1">
        {/* Accordion toggle arrow */}
        <button
          type="button"
          onClick={() => hasKids && setOpen((p) => !p)}
          className={cn(
            "p-1 rounded-md transition-colors shrink-0",
            hasKids ? "hover:bg-slate-100 text-slate-400 cursor-pointer" : "opacity-0 pointer-events-none w-5"
          )}
        >
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-200",
              open && "rotate-90 text-slate-700"
            )}
          />
        </button>

        {/* Category button */}
        <button
          type="button"
          onClick={() => handleCatChange(isActive ? "" : node.id)}
          className={cn(
            "flex-1 flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer",
            isActive
              ? "bg-orange-50 text-orange-600 font-semibold border border-orange-200"
              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <span className="line-clamp-1">{node.name}</span>
          {node?.totalProducts !== undefined && (
            <span className={cn("text-[11px] ml-1 shrink-0", isActive ? "text-orange-500 font-bold" : "text-slate-400")}>
              ({node.totalProducts})
            </span>
          )}
        </button>
      </div>

      {/* Children Subcategories */}
      {hasKids && open && (
        <div className="ml-5 pl-2 border-l border-slate-200 mt-0.5 space-y-0.5">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              all={all}
              activeCat={activeCat}
              handleCatChange={handleCatChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({
  categories,
  activeCat,
  handleCatChange,
}: {
  categories: ICategory[];
  activeCat: string;
  handleCatChange: (id: string) => void;
}) {
  const roots = categories.filter((c) => c.parentId === null);

  return (
    <div>
      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
        <Folder className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          ক্যাটাগরি
        </span>
      </div>

      <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1">
        {/* All Products Item */}
        <div className="flex items-center gap-1">
          <span className="w-5 shrink-0" />
          <button
            type="button"
            onClick={() => handleCatChange("")}
            className={cn(
              "flex-1 text-left px-2.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer",
              !activeCat
                ? "bg-orange-50 text-orange-600 font-semibold border border-orange-200"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            সকল প্রডাক্ট
          </button>
        </div>

        {roots.map((root) => (
          <CategoryNode
            key={root.id}
            node={root}
            all={categories}
            activeCat={activeCat}
            handleCatChange={handleCatChange}
          />
        ))}
      </div>
    </div>
  );
}
