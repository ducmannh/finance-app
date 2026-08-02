"use client";

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
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand logo */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </div>
            <span>MyFinance</span>
          </Link>

          {/* Nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
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

        {/* User profile dropdown & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Mobile nav indicator */}
          <div className="flex items-center gap-1 md:hidden">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={link.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>

          {/* User Nav Dropdown: Profile & Logout combined */}
          <UserNavDropdown userName={userName} />
        </div>
      </div>
    </header>
  );
}
