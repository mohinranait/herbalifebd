"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import AppSidebar from "../shared/AppSidebar";
import AdminFooter from "../shared/AdminFooter";

const AdminMainLayout = ({ children }: { children: ReactNode }) => {
  const { state, setOpen } = useSidebar();

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-x-hidden">
      <AppSidebar setOpen={setOpen} state={state} />

      <div
        id="content"
        className={cn(
          "flex-1 min-w-0 min-h-screen",
          "flex flex-col min-h-svh justify-between",
          "transition-all duration-200 ease-linear",
          "group-data-[scroll-locked=1]/body:h-full",
          "has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh"
        )}
      >
        <div className="flex-1 flex flex-col w-full min-w-0">
          {children}
        </div>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminMainLayout;
