"use client";

import { useState } from "react";
import { CategoryBreakdownItem } from "@/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart as PieChartIcon, Tag, Utensils, Car, ShoppingBag, Gamepad2, Home, HeartPulse, Heart, Briefcase, Gift, TrendingUp, Coins, Coffee, BookOpen, Plane, Music, Zap, Shirt } from "lucide-react";
import { Badminton } from "@/components/icons/badminton";

interface CategoryPieChartProps {
  categoryExpenses: CategoryBreakdownItem[];
  categoryIncomes: CategoryBreakdownItem[];
  totalExpense: number;
  totalIncome: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Badminton,
  Home,
  HeartPulse,
  Heart,
  Tag,
  Briefcase,
  Gift,
  TrendingUp,
  Coins,
  Coffee,
  BookOpen,
  Plane,
  Music,
  Zap,
  Shirt,
};

export function CategoryPieChart({
  categoryExpenses,
  categoryIncomes,
  totalExpense,
  totalIncome,
}: CategoryPieChartProps) {
  const [activeType, setActiveType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  const isExpense = activeType === "EXPENSE";
  const currentItems = isExpense ? categoryExpenses : categoryIncomes;
  const currentTotal = isExpense ? totalExpense : totalIncome;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Tạo dải màu CSS conic-gradient mượt mà không bị vệt sọc SVG
  let cumulative = 0;
  const gradientStops = currentItems.map((item) => {
    const start = cumulative;
    cumulative += item.percentage;
    return `${item.color} ${start}% ${cumulative}%`;
  });

  if (cumulative < 100 && currentItems.length > 0) {
    gradientStops.push(`${currentItems[currentItems.length - 1].color} ${cumulative}% 100%`);
  }

  const conicGradientStyle = {
    background:
      currentItems.length > 0
        ? `conic-gradient(${gradientStops.join(", ")})`
        : "var(--border)",
  };

  return (
    <Card className="border-border/60 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" /> Cơ Cấu Theo Danh Mục
          </CardTitle>
          <CardDescription className="text-xs">
            Tỷ trọng phân bổ {isExpense ? "chi tiêu" : "thu nhập"} của bạn
          </CardDescription>
        </div>

        {/* Switch Thu nhập / Chi tiêu */}
        <div className="flex items-center p-1 rounded-xl bg-muted border border-border/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveType("EXPENSE")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              isExpense
                ? "bg-card text-rose-600 dark:text-rose-400 shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Chi tiêu
          </button>
          <button
            type="button"
            onClick={() => setActiveType("INCOME")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              !isExpense
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Thu nhập
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-3 my-auto">
            <div className="p-4 rounded-full bg-muted/60">
              <PieChartIcon className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-semibold">Chưa có dữ liệu {isExpense ? "chi tiêu" : "thu nhập"} trong kỳ này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* CSS Conic Donut Chart Container - To và Nổi Bật */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-4">
              <div
                className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center shadow-lg p-2.5 transition-all duration-300"
                style={conicGradientStyle}
              >
                {/* Lỗ rỗng trung tâm Donut */}
                <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-card shadow-inner flex flex-col items-center justify-center text-center p-3 z-10 border border-border/40">
                  <span className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Tổng {isExpense ? "Chi Tiêu" : "Thu Nhập"}
                  </span>
                  <span className="text-base sm:text-xl font-black font-mono text-foreground mt-1 max-w-37.5 truncate">
                    {formatVND(currentTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Danh sách Chú thích (Legend & Breakdown) */}
            <div className="lg:col-span-7 space-y-3.5 max-h-90 overflow-y-auto pr-1.5 scrollbar-thin">
              {currentItems.map((item) => {
                const IconComp = ICON_MAP[item.icon] || Tag;

                return (
                  <div key={item.categoryId} className="space-y-1.5 p-2 rounded-xl hover:bg-muted/40 transition-colors">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className="p-2 rounded-xl text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: item.color }}
                        >
                          <IconComp className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-foreground truncate">{item.categoryName}</span>
                        <span className="text-[11px] font-medium text-muted-foreground">({item.transactionCount} giao dịch)</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-mono font-bold shrink-0">
                        <span className="text-muted-foreground text-xs sm:text-sm font-semibold">{item.percentage}%</span>
                        <span className="text-foreground text-xs sm:text-sm">{formatVND(item.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Progress Bar To Rõ Hơn */}
                    <div className="w-full h-2 rounded-full bg-muted/80 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
