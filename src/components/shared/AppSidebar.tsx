"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronsUpDown,
  ExternalLink,
  Leaf,
  LogOut,
  Settings,
  Store,
  User,
} from "lucide-react";
import { NavGroup } from "./NavGroup";
import { sidebarData } from "../constants/nav-bar";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { userLogout } from "@/redux/features/authSlice";
import { useLogoutMutation } from "@/redux/service/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type PropTypes = {
  setOpen: (open: boolean) => void;
  state: "expanded" | "collapsed";
};

const AppSidebar = ({ state }: PropTypes) => {
  const { isMobile, setOpenMobile } = useSidebar();
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [logoutUser] = useLogoutMutation();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    logoutUser();
    dispatch(userLogout());
    router.push("/user-auth");
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="h-screen p-0 border-r border-border bg-sidebar text-sidebar-foreground shadow-2xs select-none transition-all duration-200"
    >
      {/* Sidebar Header: Brand Logo & Title */}
      <SidebarHeader
        className={cn(
          "border-b border-border/80 h-16 flex items-center transition-all duration-200 bg-sidebar",
          isCollapsed ? "justify-center p-0" : "px-3"
        )}
      >
        <SidebarMenu className={isCollapsed ? "w-auto" : "w-full"}>
          <SidebarMenuItem className="flex justify-center">
            {isCollapsed ? (
              <SidebarMenuButton
                asChild
                tooltip="HerbalifeBD Admin"
                className="size-8 p-0 flex items-center justify-center rounded-lg hover:bg-accent"
              >
                <Link
                  href="/admin"
                  className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground shadow-xs"
                >
                  <Leaf className="size-4" />
                </Link>
              </SidebarMenuButton>
            ) : (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-accent/60 transition-colors group"
              >
                <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <Leaf className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base tracking-tight text-foreground">
                      Herbalife<span className="text-primary font-extrabold">BD</span>
                    </span>
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary uppercase border border-primary/20">
                      Admin
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">
                    Control Center
                  </span>
                </div>
              </Link>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Navigation Items */}
      <SidebarContent
        className={cn(
          "border-none gap-1 overflow-y-auto bg-sidebar",
          isCollapsed ? "p-1.5 flex flex-col items-center" : "px-2 py-2"
        )}
      >
        {sidebarData?.navGroups?.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      {/* Sidebar Footer: Quick View Store & User Profile */}
      <SidebarFooter
        className={cn(
          "border-t border-border/80 bg-sidebar transition-all duration-200",
          isCollapsed
            ? "p-1.5 pb-6 flex flex-col items-center justify-center gap-1"
            : "p-2.5 pb-4 gap-2"
        )}
      >
        {/* Quick View Live Store link */}
        {!isCollapsed && (
          <div className="px-1">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-accent/40 hover:bg-accent/80 border border-border/60 text-xs text-muted-foreground hover:text-foreground transition-all duration-150 group"
            >
              <div className="flex items-center gap-2">
                <Store className="size-3.5 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">Live Storefront</span>
              </div>
              <ExternalLink className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        )}

        {/* User Card & Dropdown */}
        <SidebarMenu className={isCollapsed ? "w-auto" : "w-full"}>
          <SidebarMenuItem className="flex justify-center">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size={isCollapsed ? "default" : "lg"}
                  tooltip={isCollapsed ? (user?.name || "Administrator") : undefined}
                  className={cn(
                    "rounded-xl transition-all duration-150 data-[state=open]:bg-accent cursor-pointer",
                    isCollapsed
                      ? "size-8 p-0 flex items-center justify-center hover:bg-accent"
                      : "h-auto p-2 border border-border/60 hover:border-border bg-accent/30 hover:bg-accent/70 text-foreground w-full"
                  )}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    <Avatar
                      className={cn(
                        "rounded-lg ring-1 ring-border shadow-2xs",
                        isCollapsed ? "size-7" : "size-8"
                      )}
                    >
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
                        {user?.name?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  {!isCollapsed && (
                    <>
                      <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                        <span className="truncate font-semibold text-foreground">
                          {user?.name || "Administrator"}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {user?.role || "Admin"} • {user?.phone || "Staff"}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground/70" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-60 rounded-xl p-1.5 shadow-xl border border-zinc-200 bg-white text-zinc-900 z-50"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-2 font-normal">
                  <div className="flex items-center gap-2.5 text-left text-sm">
                    <Avatar className="h-9 w-9 rounded-lg ring-1 ring-border">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold uppercase">
                        {user?.name?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 leading-tight min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold text-sm text-foreground">
                          {user?.name || "Admin"}
                        </span>
                        <span className="rounded bg-primary/10 px-1 py-0.2 text-[9px] font-bold text-primary uppercase">
                          {user?.role || "Admin"}
                        </span>
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.phone || "Super Administrator"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-border/50" />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs py-2">
                    <Link
                      href={`/admin/users/${user?.id}`}
                      onClick={() => setOpenMobile(false)}
                      className="flex items-center gap-2"
                    >
                      <User className="size-4 text-muted-foreground" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs py-2">
                    <Link
                      href="/admin/setting"
                      onClick={() => setOpenMobile(false)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="size-4 text-muted-foreground" />
                      <span>Store Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs py-2">
                    <Link
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="size-4 text-muted-foreground" />
                      <span>Visit Live Store</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1 bg-border/50" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer rounded-lg text-xs py-2 text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2 font-medium"
                >
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
