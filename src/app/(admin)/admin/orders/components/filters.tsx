"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";

type Props = {
  setParams: Dispatch<SetStateAction<string>>;
  selectedStatus?: string;
  setSelectedStatus?: (val: string) => void;
};

const Filters = ({ setParams, selectedStatus = "all", setSelectedStatus }: Props) => {
  const [search, setSearch] = useState("");
  const [methods, setMethods] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch.trim()) {
      params.append("search", debouncedSearch.trim());
    }

    if (selectedStatus && selectedStatus !== "all") {
      params.append("status", selectedStatus);
    }

    if (methods && methods !== "all") {
      params.append("method", methods);
    }

    if (paymentStatus && paymentStatus !== "all") {
      params.append("paymentStatus", paymentStatus);
    }

    if (date) {
      params.append("date", format(date, "yyyy-MM-dd"));
    }

    setParams(params.toString());
  }, [selectedStatus, methods, paymentStatus, debouncedSearch, date, setParams]);

  const hasActiveFilters = Boolean(
    search || (selectedStatus && selectedStatus !== "all") || (methods && methods !== "all") || (paymentStatus && paymentStatus !== "all") || date
  );

  const handleResetFilters = () => {
    setSearch("");
    if (setSelectedStatus) {
      setSelectedStatus("all");
    }
    setMethods("all");
    setPaymentStatus("all");
    setDate(undefined);
  };

  return (
    <div className="bg-card border rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* SEARCH INPUT */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by invoice, customer, phone, tracking..."
            value={search}
            className="pl-9 pr-9 h-10 text-xs sm:text-sm bg-background"
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* FILTER DROPDOWNS & PICKER */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* PAYMENT METHOD */}
          <Select value={methods} onValueChange={setMethods}>
            <SelectTrigger className="w-[130px] h-10 text-xs bg-background">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="COD">Cash on Delivery</SelectItem>
                <SelectItem value="BKASH">bKash</SelectItem>
                <SelectItem value="NAGAD">Nagad</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* PAYMENT STATUS */}
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger className="w-[180px] h-10 text-xs bg-background">
              <SelectValue placeholder="Pay Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Pay Status: All</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* DATE PICKER */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-10 text-xs justify-start font-normal bg-background ${
                  !date ? "text-muted-foreground" : "text-foreground font-medium"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                {date ? format(date, "dd MMM yyyy") : "Order Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
              {date && (
                <div className="p-2 border-t flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setDate(undefined)}
                  >
                    Clear Date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* RESET BUTTON */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-10 text-xs text-muted-foreground hover:text-foreground gap-1 px-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;
