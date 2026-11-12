"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { userLogout } from "@/redux/features/authSlice";
import { useLogoutMutation } from "@/redux/service/auth";
import { ChevronDown, ExternalLink, LogOut, Settings, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ProfileDropdown() {
  const router = useRouter();
  const [logoutUser] = useLogoutMutation();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    logoutUser();
    dispatch(userLogout());
    router.push("/user-auth");
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex items-center gap-2.5 h-10 px-2 rounded-xl border border-transparent hover:border-border/60 hover:bg-accent/60 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <div className="relative">
            <Avatar className="h-8 w-8 rounded-lg ring-1 ring-border shadow-xs">
              <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/10 text-primary font-bold text-xs uppercase">
                {user?.name?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>

          <div className="hidden lg:flex flex-col text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-foreground truncate max-w-28">
                {user?.name || "Administrator"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground capitalize">
              {user?.role || "Admin"}
            </span>
          </div>

          <ChevronDown className="size-3.5 text-muted-foreground/70 hidden sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60 rounded-xl p-1.5 shadow-xl border-border/60" align="end" sideOffset={8}>
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 rounded-lg ring-1 ring-border">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold uppercase text-sm">
                {user?.name?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold truncate text-foreground">
                  {user?.name || "Administrator"}
                </span>
                <span className="rounded bg-primary/10 px-1 py-0.2 text-[9px] font-bold text-primary uppercase">
                  {user?.role || "Admin"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground truncate">
                {user?.phone || user?.email || "Super Admin"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1 bg-border/50" />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs py-2">
            <Link href={`/admin/users/${user?._id}`} className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs py-2">
            <Link href="/admin/setting" className="flex items-center gap-2">
              <Settings className="size-4 text-muted-foreground" />
              <span>Store Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs py-2">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <ExternalLink className="size-4 text-muted-foreground" />
              <span>Live Website</span>
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
  );
}

export default ProfileDropdown;
