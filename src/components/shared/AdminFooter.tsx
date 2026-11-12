"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck, Heart } from "lucide-react";

export const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-border/80 bg-white/95 backdrop-blur-sm transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 sm:px-6 text-xs text-muted-foreground">
        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="font-medium text-foreground">HerbalifeBD Admin</span>
          <span className="text-muted-foreground/40">•</span>
          <span>© {currentYear} All rights reserved.</span>
          <span className="hidden md:inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
            v2.4.0
          </span>
        </div>

        {/* Center: System Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>Systems Operational</span>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-primary transition-colors font-medium"
          >
            <span>Live Store</span>
            <ExternalLink className="size-3" />
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link
            href="/admin/setting"
            className="hover:text-primary transition-colors"
          >
            Settings
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link
            href="/admin/configure"
            className="hover:text-primary transition-colors"
          >
            Config
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
