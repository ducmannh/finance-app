"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserNavDropdown } from "@/components/layout/user-nav-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Wallet, LayoutDashboard, ArrowLeftRight, FolderKanban } from "lucide-react";

interface NavbarProps {
  userName?: string;
}

export function Navbar({ userName }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/dashboard",
      label: "Tổng quan",
      icon: LayoutDashboard,
    },
    {
      href: "/transactions",
      label: "Giao dịch",
      icon: ArrowLeftRight,
    },
    {
      href: "/categories",
      label: "Danh mục",
      icon: FolderKanban,
    },
    {
      href: "/wallets",
      label: "Ví cá nhân",
      icon: Wallet,
    },
  ];

  return (
    <>
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-extrabold">
                MyFinance
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Utilities (Theme Toggle & User Avatar) */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <UserNavDropdown userName={userName} />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (App-like feel for Mobile < 768px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border/50 md:hidden pb-safe px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-4 items-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all ${
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? "bg-primary/15" : "bg-transparent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="mt-0.5">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
