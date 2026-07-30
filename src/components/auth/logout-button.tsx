"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await logoutAction();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-sm transition-all active:scale-95 disabled:opacity-70"
      disabled={isLoading}
      onClick={handleLogout}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang đăng xuất...</span>
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </>
      )}
    </Button>
  );
}
