import React from "react";
import Link from "next/link";
import { Wallet, TrendingUp, ShieldCheck, PieChart, ArrowUpRight, Sparkles, CreditCard } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-950 text-slate-100 p-4 md:p-8 bg-dot-grid">
      {/* Dynamic Glowing Ambient Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-125 w-125 rounded-full bg-emerald-500/20 blur-[120px] animate-pulse-glow" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-125 w-125 rounded-full bg-indigo-600/25 blur-[120px] animate-pulse-glow" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-150 w-150 rounded-full bg-cyan-500/10 blur-[150px]" />

      {/* Background Floating Decorative Badges (Visible on lg screens) */}
      {/* Badge 1: Top-Left */}
      <div className="hidden lg:flex pointer-events-none absolute top-24 left-16 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-2xl animate-float">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
            Tăng trưởng <ArrowUpRight className="h-3 w-3" />
          </div>
          <p className="text-sm font-semibold text-white">+24.8% thu nhập tháng này</p>
        </div>
      </div>

      {/* Badge 2: Bottom-Left */}
      <div className="hidden lg:flex pointer-events-none absolute bottom-24 left-24 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-2xl animate-float-delayed">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Bảo mật tài chính</p>
          <p className="text-sm font-semibold text-white">Mã hóa chuẩn ngân hàng 256-bit</p>
        </div>
      </div>

      {/* Badge 3: Top-Right */}
      <div className="hidden lg:flex pointer-events-none absolute top-28 right-20 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-2xl animate-float-delayed">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
          <PieChart className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Phân tích chi tiêu</p>
          <p className="text-sm font-semibold text-white">Báo cáo thời gian thực</p>
        </div>
      </div>

      {/* Badge 4: Bottom-Right */}
      <div className="hidden lg:flex pointer-events-none absolute bottom-28 right-20 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-2xl animate-float">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Quản lý dòng tiền</p>
          <p className="text-sm font-semibold text-white">Đồng bộ ví & tài khoản</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        {/* Brand Header */}
        <Link href="/" className="group flex items-center gap-3 transition-transform hover:scale-105">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
              <Wallet className="h-6 w-6 text-emerald-400 transition-transform group-hover:rotate-6" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-cyan-300 to-indigo-300">
              MyFinance
            </span>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-400" /> Quản Lý Tài Chính Thông Minh
            </span>
          </div>
        </Link>

        {/* Auth Card Content */}
        <div className="w-full">
          {children}
        </div>

        {/* Footer Credit */}
        <p className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} MyFinance. An toàn • Bảo mật • Minh bạch.
        </p>
      </div>
    </div>
  );
}

