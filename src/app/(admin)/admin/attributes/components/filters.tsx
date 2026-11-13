"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  setParams: Dispatch<SetStateAction<string>>;
}

const Filters: React.FC<Props> = ({ setParams }) => {
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch.trim()) {
      params.append("search", debouncedSearch.trim());
    }

    if (status !== "all") {
      params.append("status", status);
    }

    setParams(params.toString());
  }, [status, debouncedSearch, setParams]);

  const handleReset = () => {
    setStatus("all");
    setSearch("");
  };

  const hasFilters = search.trim() !== "" || status !== "all";

  return (
    <div className="p-3 sm:p-4 bg-white border border-slate-200/90 rounded-lg shadow-xs flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder="Search attributes by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 text-xs rounded-md border-slate-200 bg-slate-50/50 focus:bg-white"
        />
      </div>

      {/* Status Filter */}
      <div className="w-36">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 text-xs rounded-md border-slate-200 bg-slate-50/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Draft / Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          onClick={handleReset}
          type="button"
          variant="outline"
          size="sm"
          className="h-9 text-xs font-medium text-slate-600 hover:text-red-600 rounded-md border-slate-200 gap-1.5 ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </Button>
      )}
    </div>
  );
};

export default Filters;
