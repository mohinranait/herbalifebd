"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "../../app/(root)/components/login-form";
import RegisterForm from "@/app/(root)/components/register-form";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { setLoginModalOpen, setLoginModalTab } from "@/redux/features/uiSlice";
import { cn } from "@/lib/utils";
import { LogIn, UserPlus } from "lucide-react";

const LoginModal = () => {
  const { isOpen, tabValue } = useAppSelector((state) => state.ui.loginModal);
  const dispatch = useAppDispatch();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => dispatch(setLoginModalOpen({ isOpen: open }))}
    >
      <DialogContent className="p-6 sm:p-8 max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl">
        {/* Login vs Register Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl mb-6 gap-1.5">
          <button
            type="button"
            onClick={() => dispatch(setLoginModalTab({ tabValue: "login" }))}
            className={cn(
              "h-11 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none",
              tabValue === "login"
                ? "bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            )}
          >
            <LogIn className="w-4 h-4" />
            <span>লগইন</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch(setLoginModalTab({ tabValue: "register" }))}
            className={cn(
              "h-11 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none",
              tabValue === "register"
                ? "bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            )}
          >
            <UserPlus className="w-4 h-4" />
            <span>রেজিস্ট্রেশন</span>
          </button>
        </div>

        {/* Active Form */}
        <div className="w-full">
          {tabValue === "login" ? (
            <LoginForm
              onSwitchToRegister={() =>
                dispatch(setLoginModalTab({ tabValue: "register" }))
              }
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() =>
                dispatch(setLoginModalTab({ tabValue: "login" }))
              }
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
