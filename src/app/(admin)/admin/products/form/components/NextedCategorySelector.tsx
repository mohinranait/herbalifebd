"use client";

import React, { useState, useMemo } from "react";
import { ChevronRight, Folder, FolderOpen, Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ICategory } from "@/redux/service/categories/type";

type InternalCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: InternalCategory[];
  level?: number;
  path?: string[];
  thumbnail?: string;
  banner?: string;
  status?: boolean;
  description?: string;
};

type Props = {
  categories: ICategory[];
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
};

export default function NestedCategorySelector({
  categories,
  value,
  onChange,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [hoveredLevel1, setHoveredLevel1] = useState<string | null>(null);
  const [hoveredLevel2, setHoveredLevel2] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Build tree
  const internalCategories = useMemo((): InternalCategory[] => {
    const map = new Map<string, InternalCategory>();
    const roots: InternalCategory[] = [];

    categories.forEach((cat) => {
      const node: InternalCategory = {
        ...cat,
        parentId: cat.parentId ?? null,
        children: [],
      };
      map.set(cat.id, node);
    });

    categories.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (!cat.parentId) {
        roots.push(node);
      } else {
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children!.push(node);
        }
      }
    });

    return roots;
  }, [categories]);

  // Find selected category path
  const selectedPath = useMemo(() => {
    if (!value) return [];

    const findPath = (
      nodes: InternalCategory[],
      targetId: string,
      path: InternalCategory[] = []
    ): InternalCategory[] => {
      for (const node of nodes) {
        if (node.id === targetId) return [...path, node];
        if (node.children?.length) {
          const result = findPath(node.children, targetId, [...path, node]);
          if (result.length > path.length) return result;
        }
      }
      return [];
    };

    return findPath(internalCategories, value);
  }, [value, internalCategories]);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (value && selectedPath.length > 0) {
      setHoveredLevel1(selectedPath[0]?.id || null);
      setHoveredLevel2(selectedPath[1]?.id || null);
    } else {
      setHoveredLevel1(null);
      setHoveredLevel2(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSearchQuery("");
  };

  const handleSelect = (id: string) => {
    onChange(id);
    handleClose();
  };

  // Filtered categories when search query is entered
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  const level1 = internalCategories;

  const level2 = useMemo(() => {
    if (!hoveredLevel1) return [];
    const parent = internalCategories.find((c) => c.id === hoveredLevel1);
    return parent?.children || [];
  }, [hoveredLevel1, internalCategories]);

  const level3 = useMemo(() => {
    if (!hoveredLevel2) return [];
    const findNode = (nodes: InternalCategory[]): InternalCategory | null => {
      for (const node of nodes) {
        if (node.id === hoveredLevel2) return node;
        if (node.children?.length) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    const parentNode = findNode(internalCategories);
    return parentNode?.children || [];
  }, [hoveredLevel2, internalCategories]);

  return (
    <div className="relative">
      {/* Trigger Box */}
      <div
        onClick={handleOpen}
        className={`border rounded-md px-3 py-2 cursor-pointer transition-all flex items-center justify-between min-h-[38px] bg-white dark:bg-slate-900 ${
          error
            ? "border-rose-400"
            : open
            ? "border-orange-500 ring-1 ring-orange-500/20"
            : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
        }`}
      >
        {selectedPath.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <Folder className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            {selectedPath.map((cat, index) => (
              <span key={cat.id} className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                <span>{cat.name}</span>
                {index < selectedPath.length - 1 && (
                  <ChevronRight size={12} className="text-slate-400" />
                )}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">Select product category...</span>
        )}

        <ChevronRight
          size={16}
          className={`text-slate-400 transition-transform ${open ? "rotate-90 text-orange-500" : ""}`}
        />
      </div>

      {error && <p className="text-[11px] font-medium text-rose-500 mt-1">{error}</p>}

      {/* Popover Selection Panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden">
          {/* Header search bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search any category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs rounded-md border-slate-200 dark:border-slate-800"
                autoFocus
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 px-2 text-xs text-slate-500 hover:text-slate-900"
            >
              <X size={14} />
            </Button>
          </div>

          {/* If Search Active */}
          {filteredCategories ? (
            <ScrollArea className="h-72 p-2">
              {filteredCategories.length > 0 ? (
                <div className="space-y-1">
                  {filteredCategories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleSelect(cat.id)}
                      className={`px-3 py-2 rounded-md cursor-pointer text-xs font-medium flex items-center justify-between hover:bg-orange-50 dark:hover:bg-orange-950/30 ${
                        value === cat.id
                          ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="w-3.5 h-3.5 text-orange-500" />
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">/{cat.slug}</span>
                      </div>
                      {value === cat.id && <Check size={14} className="text-orange-500" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No categories found matching your query
                </div>
              )}
            </ScrollArea>
          ) : (
            /* 3-Column Cascading Tree */
            <div className="flex h-80 divide-x divide-slate-100 dark:divide-slate-800">
              {/* Column 1: Root */}
              <div className="w-1/3 flex flex-col">
                <div className="p-2.5 font-bold border-b text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 dark:bg-slate-900/40">
                  1. Root Categories
                </div>
                <ScrollArea className="flex-1 p-1.5">
                  <div className="space-y-0.5">
                    {level1.map((cat) => (
                      <div
                        key={cat.id}
                        onMouseEnter={() => {
                          setHoveredLevel1(cat.id);
                          setHoveredLevel2(null);
                        }}
                        onClick={() => handleSelect(cat.id)}
                        className={`px-3 py-2 flex items-center justify-between rounded-md cursor-pointer text-xs transition-colors ${
                          hoveredLevel1 === cat.id
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                        } ${value === cat.id ? "text-orange-600 font-bold bg-orange-50/70" : ""}`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {cat.children?.length ? (
                          <ChevronRight size={13} className="text-slate-400 shrink-0" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Column 2: Subcategories */}
              <div className="w-1/3 flex flex-col bg-slate-50/50 dark:bg-slate-900/30">
                <div className="p-2.5 font-bold border-b text-[11px] uppercase tracking-wider text-slate-500">
                  2. Subcategories
                </div>
                <ScrollArea className="flex-1 p-1.5">
                  <div className="space-y-0.5">
                    {level2.length > 0 ? (
                      level2.map((cat) => (
                        <div
                          key={cat.id}
                          onMouseEnter={() => setHoveredLevel2(cat.id)}
                          onClick={() => handleSelect(cat.id)}
                          className={`px-3 py-2 flex items-center justify-between rounded-md cursor-pointer text-xs transition-colors ${
                            hoveredLevel2 === cat.id
                              ? "bg-white dark:bg-slate-800 text-slate-900 font-semibold shadow-2xs"
                              : "text-slate-700 dark:text-slate-300 hover:bg-white/60"
                          } ${value === cat.id ? "text-orange-600 font-bold bg-orange-50/70" : ""}`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {cat.children?.length ? (
                            <ChevronRight size={13} className="text-slate-400 shrink-0" />
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No subcategories available
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Column 3: Level 3 */}
              <div className="w-1/3 flex flex-col bg-slate-50/80 dark:bg-slate-900/50">
                <div className="p-2.5 font-bold border-b text-[11px] uppercase tracking-wider text-slate-500">
                  3. Sub-branches (Level 3)
                </div>
                <ScrollArea className="flex-1 p-1.5">
                  <div className="space-y-0.5">
                    {level3.length > 0 ? (
                      level3.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => handleSelect(cat.id)}
                          className={`px-3 py-2 rounded-md cursor-pointer text-xs transition-colors ${
                            value === cat.id
                              ? "bg-orange-500 text-white font-bold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No sub-branches available
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Footer bar */}
          <div className="p-2.5 px-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              Clicking any category level will immediately assign it to the product
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="h-7 text-xs rounded-md"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
