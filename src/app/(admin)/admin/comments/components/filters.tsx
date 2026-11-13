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
  const [isApproved, setIsApproved] = useState<string>("all");
  const [rating, setRating] = useState<string>("all");
  const [isFeature, setIsFeature] = useState<string>("all");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch.trim()) {
      params.append("search", debouncedSearch.trim());
    }

    if (isApproved !== "all") {
      params.append("isApproved", isApproved);
    }

    if (rating !== "all") {
      params.append("rating", rating);
    }

    if (isFeature !== "all") {
      params.append("isFeature", isFeature);
    }

    setParams(params.toString());
  }, [isApproved, rating, isFeature, debouncedSearch, setParams]);

  const handleReset = () => {
    setIsApproved("all");
    setRating("all");
    setIsFeature("all");
    setSearch("");
  };

  const hasFilters =
    search.trim() !== "" ||
    isApproved !== "all" ||
    rating !== "all" ||
    isFeature !== "all";

  return (
    <div className="p-3 sm:p-4 bg-white border border-slate-200/90 rounded-lg shadow-xs flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder="Search by review text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 text-xs rounded-md border-slate-200 bg-slate-50/50 focus:bg-white"
        />
      </div>

      {/* Approval Filter */}
      <div className="w-36">
        <Select value={isApproved} onValueChange={setIsApproved}>
          <SelectTrigger className="h-9 text-xs rounded-md border-slate-200 bg-slate-50/50">
            <SelectValue placeholder="Approval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="true">Approved</SelectItem>
            <SelectItem value="false">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div className="w-36">
        <Select value={rating} onValueChange={setRating}>
          <SelectTrigger className="h-9 text-xs rounded-md border-slate-200 bg-slate-50/50">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars (★★★★★)</SelectItem>
            <SelectItem value="4">4 Stars (★★★★)</SelectItem>
            <SelectItem value="3">3 Stars (★★★)</SelectItem>
            <SelectItem value="2">2 Stars (★★)</SelectItem>
            <SelectItem value="1">1 Star (★)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Filter */}
      <div className="w-32">
        <Select value={isFeature} onValueChange={setIsFeature}>
          <SelectTrigger className="h-9 text-xs rounded-md border-slate-200 bg-slate-50/50">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Featured</SelectItem>
            <SelectItem value="false">Standard</SelectItem>
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
