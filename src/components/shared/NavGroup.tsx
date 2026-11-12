"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SidebarNavGroup, SidebarNavItem } from "../constants/nav-bar";
import { cn } from "@/lib/utils";

export function NavGroup({ title, items }: SidebarNavGroup) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup className={cn("py-1", isCollapsed && "px-0")}>
      {!isCollapsed && (
        <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 px-3 py-1.5 select-none">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className={cn("gap-1", isCollapsed && "items-center")}>
        {items.map((item) => {
          const key = `${item.title}-${item.url || ""}`;

          if (!item.items) {
            return (
              <SidebarMenuLink key={key} item={item} pathname={pathname} />
            );
          }

          if (isCollapsed) {
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                pathname={pathname}
              />
            );
          }

          return (
            <SidebarMenuCollapsible key={key} item={item} pathname={pathname} />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="ml-auto rounded-full px-1.5 py-0 text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
    {children}
  </Badge>
);

const SidebarMenuLink = ({
  item,
  pathname,
}: {
  item: SidebarNavItem;
  pathname: string;
}) => {
  const { setOpenMobile, state } = useSidebar();
  const isActive = checkIsActive(pathname, item);
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenuItem className={isCollapsed ? "flex justify-center" : ""}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          "cursor-pointer rounded-lg text-sm font-medium transition-all duration-150",
          isCollapsed
            ? "size-8 p-0 flex items-center justify-center"
            : "h-9 px-3",
          isActive
            ? "bg-primary text-primary-foreground font-semibold shadow-xs shadow-primary/25 hover:bg-primary/95 hover:text-primary-foreground"
            : "text-foreground/80 hover:bg-accent/80 hover:text-foreground"
        )}
      >
        <Link
          href={item?.url || "#"}
          onClick={() => setOpenMobile(false)}
          className={isCollapsed ? "flex items-center justify-center size-full" : "flex items-center gap-2"}
        >
          {item.icon && <item.icon className="size-4 shrink-0" />}
          {!isCollapsed && <span className="truncate">{item.title}</span>}
          {!isCollapsed && item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsible = ({
  item,
  pathname,
}: {
  item: SidebarNavItem;
  pathname: string;
}) => {
  const { setOpenMobile } = useSidebar();
  const isChildActive = !!item.items?.some((sub) => checkIsActive(pathname, sub));

  return (
    <Collapsible
      asChild
      defaultOpen={true}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={cn(
              "cursor-pointer rounded-lg text-sm font-medium transition-all duration-150 h-9 px-3",
              isChildActive
                ? "text-foreground font-semibold bg-accent/50"
                : "text-foreground/80 hover:bg-accent/70 hover:text-foreground"
            )}
          >
            {item.icon && <item.icon className="size-4 shrink-0" />}
            <span className="truncate">{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground/60" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub className="border-l border-border/80 ml-4 pl-2 my-1 space-y-0.5">
            {item.items?.map((subItem) => {
              const isSubActive = checkIsActive(pathname, subItem);

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubActive}
                    className={cn(
                      "cursor-pointer rounded-md text-[13px] h-8 px-2.5 transition-all duration-150",
                      isSubActive
                        ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    <Link
                      href={subItem.url || "#"}
                      onClick={() => setOpenMobile(false)}
                      className="flex items-center gap-2"
                    >
                      {subItem.icon ? (
                        <subItem.icon className="size-3.5 shrink-0 opacity-70" />
                      ) : (
                        <span
                          className={cn(
                            "size-1.5 rounded-full shrink-0 transition-colors",
                            isSubActive ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                        />
                      )}
                      <span className="truncate">{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const SidebarMenuCollapsedDropdown = ({
  item,
  pathname,
}: {
  item: SidebarNavItem;
  pathname: string;
}) => {
  const isChildActive = !!item.items?.some((sub) => checkIsActive(pathname, sub));

  return (
    <SidebarMenuItem className="flex justify-center">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isChildActive}
            className={cn(
              "cursor-pointer rounded-lg transition-all duration-150 size-8 p-0 flex items-center justify-center",
              isChildActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {item.icon && <item.icon className="size-4 shrink-0" />}
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={8}
          className="min-w-48 p-1.5 shadow-xl border border-zinc-200 bg-white text-zinc-900 rounded-xl z-50"
        >
          <DropdownMenuLabel className="text-xs font-semibold px-2 py-1.5 text-zinc-900">
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1 bg-zinc-100" />
          {item.items?.map((sub) => {
            const isSubActive = checkIsActive(pathname, sub);
            return (
              <DropdownMenuItem
                key={`${sub.title}-${sub.url}`}
                asChild
                className="cursor-pointer"
              >
                <Link
                  href={sub.url || "#"}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                    isSubActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  )}
                >
                  {sub.icon ? (
                    <sub.icon className="size-3.5 shrink-0" />
                  ) : (
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        isSubActive ? "bg-primary" : "bg-zinc-300"
                      )}
                    />
                  )}
                  <span className="truncate">{sub.title}</span>
                  {sub.badge && (
                    <span className="ml-auto text-[10px] font-semibold text-primary">{sub.badge}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

function checkIsActive(
  pathname: string,
  item: SidebarNavItem,
  mainNav = false
) {
  return (
    pathname === item.url ||
    pathname.split("?")[0] === item.url ||
    !!item?.items?.some((i) => i.url === pathname) ||
    (mainNav &&
      pathname.split("/")[1] !== "" &&
      pathname.split("/")[1] === item?.url?.split("/")[1])
  );
}
