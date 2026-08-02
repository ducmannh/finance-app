"use client";

import { useState } from "react";
import { CategoryBreakdownItem } from "@/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart as PieChartIcon, Tag, Utensils, Car, ShoppingBag, Gamepad2, Home, HeartPulse, Briefcase, Gift, TrendingUp, Coins, Coffee, BookOpen, Plane, Music, Zap, Shirt } from "lucide-react";

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
  Home,
  HeartPulse,
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

      <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2 my-auto">
            <div className="p-3 rounded-full bg-muted/60">
              <PieChartIcon className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium">Chưa có dữ liệu {isExpense ? "chi tiêu" : "thu nhập"} trong kỳ này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* CSS Conic Donut Chart Container */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <div
                className="relative w-44 h-44 rounded-full flex items-center justify-center shadow-md p-1.5 transition-all duration-300"
                style={conicGradientStyle}
              >
                {/* Lỗ rỗng trung tâm Donut */}
                <div className="w-32 h-32 rounded-full bg-card shadow-inner flex flex-col items-center justify-center text-center p-2 z-10">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Tổng {isExpense ? "Chi" : "Thu"}
                  </span>
                  <span className="text-sm font-extrabold font-mono text-foreground mt-0.5 max-w-[110px] truncate">
                    {formatVND(currentTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Danh sách Chú thích (Legend) */}
            <div className="md:col-span-7 space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {currentItems.map((item) => {
                const IconComp = ICON_MAP[item.icon] || Tag;

                return (
                  <div key={item.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="p-1.5 rounded-lg text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: item.color }}
                        >
                          <IconComp className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-foreground truncate">{item.categoryName}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">({item.transactionCount} lượt)</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono font-bold shrink-0">
                        <span className="text-muted-foreground text-[11px]">{item.percentage}%</span>
                        <span className="text-foreground">{formatVND(item.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
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
