"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="outline"
        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-sm transition-all active:scale-95 cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span>Đăng xuất</span>
      </Button>
    </form>
  );
}
