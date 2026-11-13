"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required,
  error,
  hint,
  action,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </Label>
          {hint && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger type="button" tabIndex={-1}>
                  <Info size={13} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs p-2">
                  <p>{hint}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {action}
      </div>

      {children}

      {error && (
        <p className="text-[11px] font-medium text-rose-500 mt-1 leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}
