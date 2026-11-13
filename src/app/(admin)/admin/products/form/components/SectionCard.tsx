"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export default function SectionCard({
  icon,
  title,
  description,
  badge,
  action,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card
      className={cn(
        "rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all",
        className
      )}
    >
      <CardHeader
        className={cn(
          "p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50",
          collapsible && "cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        )}
        onClick={collapsible ? () => setOpen(!open) : undefined}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/70 dark:border-orange-800/60 flex items-center justify-center shrink-0 shadow-2xs">
              {icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {title}
                </CardTitle>
                {badge}
              </div>
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {action}
            {collapsible && (
              <span className="w-7 h-7 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center transition-colors">
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="p-4 sm:p-5 pt-4 space-y-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
