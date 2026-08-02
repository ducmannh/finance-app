"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAnalyticsSummaryAction,
  AnalyticsSummary,
  PeriodFilter,
} from "@/actions/analytics";
import { getTransactionsAction, TransactionData } from "@/actions/transaction";
import { StatCards } from "@/components/dashboard/stat-cards";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { RecentTransactionsWidget } from "@/components/dashboard/recent-transactions-widget";
import { MonthPicker } from "@/components/ui/month-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { LayoutDashboard, RefreshCw, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  userName: string;
}

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "THIS_MONTH", label: "Tháng này" },
  { value: "LAST_MONTH", label: "Tháng trước" },
  { value: "THIS_YEAR", label: "Năm nay" },
  { value: "SPECIFIC_MONTH", label: "Theo tháng" },
  { value: "CUSTOM_RANGE", label: "Khoảng ngày" },
  { value: "ALL", label: "Tất cả" },
];

// Helper định dạng Date -> YYYY-MM-DD theo giờ địa phương (tránh dùng toISOString bị lệch múi giờ nhảy ngày)
const formatDateToYYYYMMDD = (d: Date) => {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper chuyển YYYY-MM-DD -> Date theo giờ địa phương
const parseYYYYMMDDToDate = (str: string) => {
  if (!str) return new Date();
  const parts = str.split("-").map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
};

export function AnalyticsDashboard({ userName }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<PeriodFilter>("THIS_MONTH");

  // State cho chọn Tháng cụ thể (Định dạng YYYY-MM)
  const todayObj = new Date();
  const todayStr = formatDateToYYYYMMDD(todayObj);
  const currentMonthStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // State cho khoảng thời gian bất kỳ (StartDate & EndDate)
  const [startDateStr, setStartDateStr] = useState<string>(
    formatDateToYYYYMMDD(new Date(todayObj.getFullYear(), todayObj.getMonth(), 1))
  );
  const [endDateStr, setEndDateStr] = useState<string>(todayStr);

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, transactionsRes] = await Promise.all([
        getAnalyticsSummaryAction({
          period,
          selectedMonth,
          startDate: startDateStr,
          endDate: endDateStr,
        }),
        getTransactionsAction(),
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }

      if (transactionsRes.success && transactionsRes.transactions) {
        setRecentTransactions(transactionsRes.transactions);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [period, selectedMonth, startDateStr, endDateStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col gap-4 border-b border-border/40 pb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <LayoutDashboard className="h-8 w-8 text-primary" /> Tổng Quan Tài Chính
            </h1>
            <p className="text-muted-foreground mt-1">
              Chào mừng trở lại, <span className="font-semibold text-foreground">{userName}</span>! Dưới đây là báo cáo thống kê thu chi của bạn.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-xl shrink-0")}
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <Link
              href="/transactions"
              className={cn(buttonVariants({ variant: "default" }), "rounded-xl flex items-center gap-2 text-xs font-bold shrink-0")}
            >
              <Plus className="h-4 w-4" /> Thêm giao dịch
            </Link>
          </div>
        </div>

        {/* Thanh Bộ Lọc Thời Gian Nâng Cao */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Preset Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-card border border-border/60 shadow-2xs overflow-x-auto">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  period === opt.value
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Custom Month Picker */}
          {period === "SPECIFIC_MONTH" && (
            <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-right-2">
              <MonthPicker
                value={selectedMonth}
                onChange={(newMonth) => setSelectedMonth(newMonth)}
              />
            </div>
          )}

          {/* Custom Date Range Picker */}
          {period === "CUSTOM_RANGE" && (
            <div className="flex items-center gap-3 bg-card p-1.5 rounded-2xl border border-border/60 shadow-2xs flex-wrap animate-in fade-in-0 slide-in-from-right-2">
              <div className="flex items-center gap-2 text-xs font-semibold pl-2">
                <Filter className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Từ:</span>
                <div className="w-44">
                  <DatePicker
                    value={parseYYYYMMDDToDate(startDateStr)}
                    onChange={(d) => setStartDateStr(formatDateToYYYYMMDD(d))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold pl-1">
                <span className="text-muted-foreground">Đến:</span>
                <div className="w-44">
                  <DatePicker
                    value={parseYYYYMMDDToDate(endDateStr)}
                    onChange={(d) => setEndDateStr(formatDateToYYYYMMDD(d))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. Summary Stat Cards */}
      <StatCards
        walletBalance={analytics?.walletBalance ?? 0}
        totalIncome={analytics?.totalIncome ?? 0}
        totalExpense={analytics?.totalExpense ?? 0}
        netSavings={analytics?.netSavings ?? 0}
      />

      {/* 2. Charts Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Biểu đồ Cơ cấu Chi tiêu (Donut Chart) */}
        <div className="lg:col-span-6 flex flex-col">
          <CategoryPieChart
            categoryExpenses={analytics?.categoryExpenses ?? []}
            categoryIncomes={analytics?.categoryIncomes ?? []}
            totalExpense={analytics?.totalExpense ?? 0}
            totalIncome={analytics?.totalIncome ?? 0}
          />
        </div>

        {/* Biểu đồ Biến động Thu - Chi (Bar Chart) */}
        <div className="lg:col-span-6 flex flex-col">
          <IncomeExpenseChart timeSeries={analytics?.timeSeries ?? []} />
        </div>
      </div>

      {/* 3. Recent Transactions Widget */}
      <RecentTransactionsWidget transactions={recentTransactions} />
    </div>
  );
}
