"use client";

import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardsProps {
  walletBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
}

export function StatCards({
  walletBalance,
  totalIncome,
  totalExpense,
  netSavings,
}: StatCardsProps) {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const isNetPositive = netSavings >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Số dư ví chính */}
      <Card className="border-border/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Số Dư Ví Chính
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold font-mono tracking-tight text-foreground">
              {formatVND(walletBalance)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Tài khoản khả dụng
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Tổng thu nhập */}
      <Card className="border-border/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-card to-emerald-500/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng Thu Nhập
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              +{formatVND(totalIncome)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Khoản đã ghi nhận vào
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Tổng chi tiêu */}
      <Card className="border-border/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-card to-rose-500/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng Chi Tiêu
            </span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold font-mono tracking-tight text-rose-600 dark:text-rose-400">
              -{formatVND(totalExpense)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Khoản đã chi tiêu bớt
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Dư ròng / Tiết kiệm */}
      <Card className="border-border/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-card to-indigo-500/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Thu Nhập Ròng
            </span>
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isNetPositive
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3
              className={`text-2xl font-extrabold font-mono tracking-tight ${
                isNetPositive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {isNetPositive ? "+" : ""}
              {formatVND(netSavings)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {isNetPositive ? "Thặng dư tài chính tích lũy" : "Thâm hụt chi tiêu trong kỳ"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
