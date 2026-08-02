"use client";

import { useState } from "react";
import { TimeSeriesPoint } from "@/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Info } from "lucide-react";

interface IncomeExpenseChartProps {
  timeSeries: TimeSeriesPoint[];
}

export function IncomeExpenseChart({ timeSeries }: IncomeExpenseChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

  const formatFullVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Helper hiển thị tên nhãn đầy đủ khi rê chuột (T1 -> Tháng 1, T10 -> Tháng 10...)
  const getFullLabel = (label: string) => {
    if (/^T\d+$/.test(label)) {
      const monthNum = label.replace("T", "");
      return `Tháng ${monthNum}`;
    }
    return label;
  };

  // Thêm 25% headroom để các cột cao nhất không bị dính sát viền trên
  const maxRawVal = Math.max(
    ...timeSeries.map((p) => Math.max(p.income, p.expense)),
    100_000
  );
  const maxVal = maxRawVal * 1.25;

  const hasData = timeSeries.some((p) => p.income > 0 || p.expense > 0);

  return (
    <Card className="border-border/60 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Biến Động Thu - Chi
          </CardTitle>
          <CardDescription className="text-xs">
            So sánh dòng tiền Thu nhập vs Chi tiêu theo chu kỳ
          </CardDescription>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-foreground">Thu nhập</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-rose-500 inline-block" />
            <span className="text-foreground">Chi tiêu</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-3">
        {/* Banner hiển thị thông số khi di chuột (Hover Info Banner) */}
        {hoveredPoint ? (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs animate-in fade-in-0 slide-in-from-top-1">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>Thời gian: {getFullLabel(hoveredPoint.label)}</span>
            </div>
            <div className="flex items-center gap-3 font-mono font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                Thu: +{formatFullVND(hoveredPoint.income)}
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                Chi: -{formatFullVND(hoveredPoint.expense)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground/80 font-medium px-1 flex items-center gap-1">
            <Info className="h-3 w-3 text-muted-foreground/60 shrink-0" />
            <span>Rê chuột vào cột bất kỳ để xem chi tiết biến động thu chi</span>
          </div>
        )}

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2 my-auto">
            <div className="p-3 rounded-full bg-muted/60">
              <BarChart3 className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium">Chưa có giao dịch phát sinh trong khoảng thời gian này</p>
          </div>
        ) : (
          /* Toàn bộ vùng Đồ thị + Nhãn X gom chung 1 Container duy nhất */
          <div className="w-full overflow-x-auto pt-2 scrollbar-none">
            <div className="min-w-[340px] space-y-2.5">
              {/* Vùng Cột & Gridlines */}
              <div className="relative h-48 w-full">
                {/* Background Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                  <div className="border-b border-dashed border-border/30 w-full" />
                  <div className="border-b border-dashed border-border/30 w-full" />
                  <div className="border-b border-dashed border-border/30 w-full" />
                </div>

                {/* Chart Bars */}
                <div className="h-full w-full flex items-end gap-1.5 pt-4 pb-1 px-1 border-b border-border/50 relative z-10">
                  {timeSeries.map((point, index) => {
                    const incomeHeight = (point.income / maxVal) * 100;
                    const expenseHeight = (point.expense / maxVal) * 100;
                    const isHovered = hoveredPoint?.dateStr === point.dateStr;

                    return (
                      <div
                        key={point.dateStr || index}
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="flex-1 min-w-[20px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
                      >
                        {/* Tooltip nhỏ trên đỉnh cột khi Hover */}
                        {isHovered && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-none animate-in fade-in-0 zoom-in-95">
                            <div className="bg-popover text-popover-foreground text-[10px] rounded-lg px-2 py-0.5 shadow-lg border border-border font-mono font-bold whitespace-nowrap">
                              {getFullLabel(point.label)}
                            </div>
                          </div>
                        )}

                        {/* Bars Container */}
                        <div className="w-full flex items-end justify-center gap-1 h-full">
                          {/* Income Bar Track */}
                          <div className="w-1/2 max-w-[12px] h-full flex items-end rounded-t-md bg-muted/20">
                            <div
                              className="w-full bg-emerald-500 hover:bg-emerald-400 rounded-t-md transition-all duration-300 relative group-hover:brightness-120"
                              style={{ height: `${Math.max(incomeHeight, point.income > 0 ? 3 : 0)}%` }}
                            />
                          </div>
                          {/* Expense Bar Track */}
                          <div className="w-1/2 max-w-[12px] h-full flex items-end rounded-t-md bg-muted/20">
                            <div
                              className="w-full bg-rose-500 hover:bg-rose-400 rounded-t-md transition-all duration-300 relative group-hover:brightness-120"
                              style={{ height: `${Math.max(expenseHeight, point.expense > 0 ? 3 : 0)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-Axis Labels (Nằm ngay bên dưới các cột, hoàn toàn không có thanh cuộn chen ngang) */}
              <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-muted-foreground">
                {timeSeries.map((point, index) => (
                  <div key={point.dateStr || index} className="flex-1 text-center whitespace-nowrap">
                    {point.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
