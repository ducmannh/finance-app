"use client";

import { useState } from "react";
import { TimeSeriesPoint } from "@/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  Info,
  Award,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface IncomeExpenseChartProps {
  timeSeries: TimeSeriesPoint[];
}

export function IncomeExpenseChart({ timeSeries }: IncomeExpenseChartProps) {
  // Tab chế độ xem: DONUT (Tỷ lệ), TREND (Đường biến động ròng), GAUGE (Sức khỏe tài chính)
  const [viewMode, setViewMode] = useState<"DONUT" | "TREND" | "GAUGE">("DONUT");
  const [activeSegment, setActiveSegment] = useState<"INCOME" | "EXPENSE" | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; cumulative: number; income: number; expense: number } | null>(null);

  // Tính tổng thu, chi, và biến động ròng
  const totalIncome = timeSeries.reduce((sum, p) => sum + p.income, 0);
  const totalExpense = timeSeries.reduce((sum, p) => sum + p.expense, 0);
  const totalCashflow = totalIncome + totalExpense;
  const netSavings = totalIncome - totalExpense;

  const incomePercent = totalCashflow > 0 ? (totalIncome / totalCashflow) * 100 : 0;
  const expensePercent = totalCashflow > 0 ? (totalExpense / totalCashflow) * 100 : 0;

  // Tỷ lệ tiết kiệm ròng so với tổng thu nhập (Savings Rate)
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getFullLabel = (label: string) => {
    if (/^T\d+$/.test(label)) {
      const monthNum = label.replace("T", "");
      return `Tháng ${monthNum}`;
    }
    return label;
  };

  // --- DONUT CALCULATIONS ---
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const incomeDash = (incomePercent / 100) * circumference;
  const expenseDash = (expensePercent / 100) * circumference;
  const expenseOffset = -incomeDash;

  // --- CUMULATIVE NET TREND CALCULATIONS ---
  let runningNet = 0;
  const cumulativeSeries = timeSeries.map((p) => {
    runningNet += p.income - p.expense;
    return {
      label: p.label,
      dateStr: p.dateStr,
      income: p.income,
      expense: p.expense,
      cumulative: runningNet,
    };
  });

  const chartHeight = 180;
  const chartWidth = 500;
  const paddingX = 25;
  const paddingY = 20;
  const pointsCount = cumulativeSeries.length;
  const stepX = pointsCount > 1 ? (chartWidth - paddingX * 2) / (pointsCount - 1) : 0;

  const maxCum = Math.max(...cumulativeSeries.map((p) => p.cumulative), 100_000);
  const minCum = Math.min(...cumulativeSeries.map((p) => p.cumulative), 0);
  const cumRange = Math.max(maxCum - minCum, 100_000);

  const getTrendCoords = (val: number, index: number) => {
    const x = paddingX + index * stepX;
    const y = chartHeight - paddingY - ((val - minCum) / cumRange) * (chartHeight - paddingY * 2);
    return { x, y };
  };

  const trendCoords = cumulativeSeries.map((p, i) => getTrendCoords(p.cumulative, i));
  let trendPath = "";
  if (trendCoords.length > 0) {
    trendPath = `M ${trendCoords[0].x} ${trendCoords[0].y}`;
    for (let i = 0; i < trendCoords.length - 1; i++) {
      const curr = trendCoords[i];
      const next = trendCoords[i + 1];
      const cp1X = curr.x + (next.x - curr.x) / 2;
      const cp1Y = curr.y;
      const cp2X = curr.x + (next.x - curr.x) / 2;
      const cp2Y = next.y;
      trendPath += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${next.x} ${next.y}`;
    }
  }

  const trendAreaPath =
    trendCoords.length > 0
      ? `${trendPath} L ${getTrendCoords(minCum, pointsCount - 1).x} ${chartHeight - paddingY} L ${getTrendCoords(minCum, 0).x} ${chartHeight - paddingY} Z`
      : "";

  // --- GAUGE CALCULATIONS ---
  // Clamp savings rate between -50% and 100% for gauge rotation
  const clampedRate = Math.max(-50, Math.min(100, savingsRate));
  // Gauge angle 0..180 degrees
  const gaugeAngle = ((clampedRate + 50) / 150) * 180;

  // Health Status Badge Info
  const getHealthStatus = () => {
    if (savingsRate >= 30) {
      return {
        title: "Tài Chính Xuất Sắc",
        desc: "Bạn đang giữ kỷ luật thu chi cực tốt, tỷ lệ tích lũy vượt trên 30% tổng thu nhập!",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10 border-emerald-500/30",
        icon: Award,
      };
    } else if (savingsRate >= 10) {
      return {
        title: "An Toàn & Ổn Định",
        desc: "Dòng tiền thu chi cân bằng, bạn đang giữ được khoản thặng dư tích lũy an toàn.",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10 border-blue-500/30",
        icon: CheckCircle2,
      };
    } else if (savingsRate >= 0) {
      return {
        title: "Cần Tối Ưu Chi Tiêu",
        desc: "Mức tích lũy còn khiêm tốn. Hãy xem xét cắt giảm bớt một số danh mục chi tiêu không cần thiết.",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10 border-amber-500/30",
        icon: Info,
      };
    } else {
      return {
        title: "Cảnh Báo Bội Chi",
        desc: "Chi tiêu đang vượt quá Thu nhập trong kỳ này! Cần kiểm soát ngay các khoản ngân sách.",
        color: "text-rose-500",
        bgColor: "bg-rose-500/10 border-rose-500/30",
        icon: AlertTriangle,
      };
    }
  };

  const healthStatus = getHealthStatus();
  const StatusIcon = healthStatus.icon;

  return (
    <Card className="border-border/60 shadow-sm flex flex-col h-full">
      {/* Header & Tabs Switcher */}
      <CardHeader className="pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {viewMode === "DONUT" && <PieChart className="h-5 w-5 text-primary" />}
            {viewMode === "TREND" && <Activity className="h-5 w-5 text-primary" />}
            {viewMode === "GAUGE" && <Gauge className="h-5 w-5 text-primary" />}
            {viewMode === "DONUT" && "Tỷ Lệ Dòng Tiền Thu - Chi"}
            {viewMode === "TREND" && "Xu Hướng Tích Lũy Số Dư Ròng"}
            {viewMode === "GAUGE" && "Đồng Hồ Sức Khỏe Tài Chính"}
          </CardTitle>
          <CardDescription className="text-xs">
            {viewMode === "DONUT" && "Tỷ lệ % giữa Tổng Thu nhập vs Chi tiêu"}
            {viewMode === "TREND" && "Đường cong biến động số dư thặng dư theo thời gian"}
            {viewMode === "GAUGE" && "Đánh giá mức độ an toàn thu chi & tỷ lệ tích lũy"}
          </CardDescription>
        </div>

        {/* 3-View Tabs Segmented Control */}
        <div className="flex items-center p-0.5 rounded-xl bg-muted border border-border/60 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("DONUT")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === "DONUT"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Xem dạng biểu đồ tròn tỷ lệ"
          >
            <PieChart className="h-3.5 w-3.5" /> Tròn
          </button>
          <button
            type="button"
            onClick={() => setViewMode("TREND")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === "TREND"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Xem đường cong tích lũy số dư ròng"
          >
            <Activity className="h-3.5 w-3.5" /> Đường
          </button>
          <button
            type="button"
            onClick={() => setViewMode("GAUGE")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === "GAUGE"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Xem đồng hồ sức khỏe tài chính"
          >
            <Gauge className="h-3.5 w-3.5" /> Đồng Hồ
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
        {totalCashflow === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2 my-auto">
            <div className="p-3 rounded-full bg-muted/60">
              <Activity className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium">Chưa có dữ liệu giao dịch trong khoảng thời gian này</p>
          </div>
        ) : viewMode === "DONUT" ? (
          /* --- TAB 1: DONUT RATIO CHART --- */
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 my-auto">
            <div className="relative flex items-center justify-center shrink-0">
              <svg width="190" height="190" className="transform -rotate-90">
                <circle
                  cx="95"
                  cy="95"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="20"
                  className="text-muted/30"
                />
                {incomePercent > 0 && (
                  <circle
                    cx="95"
                    cy="95"
                    r={radius}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth={activeSegment === "INCOME" ? "24" : "20"}
                    strokeDasharray={`${incomeDash} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer hover:opacity-90"
                    onMouseEnter={() => setActiveSegment("INCOME")}
                    onMouseLeave={() => setActiveSegment(null)}
                  />
                )}
                {expensePercent > 0 && (
                  <circle
                    cx="95"
                    cy="95"
                    r={radius}
                    fill="transparent"
                    stroke="#f43f5e"
                    strokeWidth={activeSegment === "EXPENSE" ? "24" : "20"}
                    strokeDasharray={`${expenseDash} ${circumference}`}
                    strokeDashoffset={expenseOffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer hover:opacity-90"
                    onMouseEnter={() => setActiveSegment("EXPENSE")}
                    onMouseLeave={() => setActiveSegment(null)}
                  />
                )}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold text-muted-foreground">Thặng Dư</span>
                <span
                  className={`text-base font-extrabold font-mono ${
                    netSavings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {netSavings >= 0 ? "+" : ""}
                  {new Intl.NumberFormat("vi-VN").format(netSavings)} ₫
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                  {savingsRate.toFixed(1)}% thu nhập
                </span>
              </div>
            </div>

            <div className="w-full space-y-3.5 flex-1">
              <div
                onMouseEnter={() => setActiveSegment("INCOME")}
                onMouseLeave={() => setActiveSegment(null)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeSegment === "INCOME"
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm scale-[1.02]"
                    : "bg-card border-border/60 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>Tổng Thu Nhập</span>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                    +{formatVND(totalIncome)} ({incomePercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${incomePercent}%` }}
                  />
                </div>
              </div>

              <div
                onMouseEnter={() => setActiveSegment("EXPENSE")}
                onMouseLeave={() => setActiveSegment(null)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeSegment === "EXPENSE"
                    ? "bg-rose-500/10 border-rose-500/40 shadow-sm scale-[1.02]"
                    : "bg-card border-border/60 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <TrendingDown className="h-4 w-4" />
                    <span>Tổng Chi Tiêu</span>
                  </div>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-extrabold">
                    -{formatVND(totalExpense)} ({expensePercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${expensePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === "TREND" ? (
          /* --- TAB 2: CUMULATIVE NET TREND CURVE --- */
          <div className="space-y-3">
            {hoveredPoint ? (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs animate-in fade-in-0">
                <span className="font-bold text-primary">Mốc: {getFullLabel(hoveredPoint.label)}</span>
                <span
                  className={`font-mono font-bold ${
                    hoveredPoint.cumulative >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  Tích lũy ròng: {hoveredPoint.cumulative >= 0 ? "+" : ""}
                  {formatVND(hoveredPoint.cumulative)}
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground/80 font-medium px-1 flex items-center gap-1">
                <Info className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                <span>Đường cong hiển thị sự tăng/giảm tích lũy số dư ròng theo thời gian</span>
              </div>
            )}

            <div className="w-full overflow-x-auto pt-2 scrollbar-none">
              <div className="min-w-[360px] space-y-2">
                <div className="relative h-44 w-full">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="netTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={netSavings >= 0 ? "#10b981" : "#f43f5e"} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={netSavings >= 0 ? "#10b981" : "#f43f5e"} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="0" y1={paddingY} x2={chartWidth} y2={paddingY} stroke="currentColor" strokeDasharray="3 3" className="text-border/30" />
                    <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="currentColor" strokeDasharray="3 3" className="text-border/30" />
                    <line x1="0" y1={chartHeight - paddingY} x2={chartWidth} y2={chartHeight - paddingY} stroke="currentColor" className="text-border/50" />

                    <path d={trendAreaPath} fill="url(#netTrendGradient)" />
                    <path
                      d={trendPath}
                      fill="none"
                      stroke={netSavings >= 0 ? "#10b981" : "#f43f5e"}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {cumulativeSeries.map((point, i) => {
                      const coords = getTrendCoords(point.cumulative, i);
                      const isHovered = hoveredPoint?.label === point.label;

                      return (
                        <g
                          key={point.dateStr || i}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(point)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        >
                          <circle
                            cx={coords.x}
                            cy={coords.y}
                            r={isHovered ? 6 : 4}
                            fill={netSavings >= 0 ? "#10b981" : "#f43f5e"}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="transition-all duration-200"
                          />
                          <rect
                            x={coords.x - stepX / 2}
                            y="0"
                            width={stepX || 30}
                            height={chartHeight}
                            fill="transparent"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="flex items-center justify-between px-1 text-[11px] font-bold text-muted-foreground pt-1">
                  {timeSeries.map((point, index) => (
                    <div key={point.dateStr || index} className="text-center whitespace-nowrap">
                      {point.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- TAB 3: FINANCIAL HEALTH RADIAL GAUGE --- */
          <div className="flex flex-col items-center justify-center space-y-4 my-auto">
            {/* Semi-Circle 180 Degree SVG Gauge Meter */}
            <div className="relative flex flex-col items-center justify-center pt-2">
              <svg width="220" height="120" className="overflow-visible">
                {/* Background Track Arc */}
                <path
                  d="M 20 110 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeLinecap="round"
                  className="text-muted/30"
                />
                {/* Colored Progress Arc */}
                <path
                  d="M 20 110 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke={savingsRate >= 30 ? "#10b981" : savingsRate >= 10 ? "#3b82f6" : savingsRate >= 0 ? "#f59e0b" : "#f43f5e"}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - (gaugeAngle / 180) * 282.7}
                  className="transition-all duration-700 ease-out"
                />

                {/* Meter Needle Indicator */}
                <g
                  style={{
                    transform: `rotate(${gaugeAngle - 90}deg)`,
                    transformOrigin: "110px 110px",
                    transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <line x1="110" y1="110" x2="110" y2="35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-foreground" />
                  <circle cx="110" cy="110" r="7" fill="currentColor" className="text-foreground" />
                </g>
              </svg>

              {/* Gauge Score Value */}
              <div className="mt-2 text-center">
                <span className="text-2xl font-extrabold font-mono tracking-tight text-foreground">
                  {savingsRate.toFixed(1)}%
                </span>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                  Tỷ Lệ Tích Lũy / Thu Nhập
                </p>
              </div>
            </div>

            {/* Dynamic Status Card */}
            <div className={`p-4 rounded-2xl border w-full flex items-start gap-3.5 ${healthStatus.bgColor} animate-in fade-in-0`}>
              <div className={`p-2 rounded-xl bg-background/80 shadow-xs shrink-0 ${healthStatus.color}`}>
                <StatusIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className={`text-sm font-bold ${healthStatus.color}`}>{healthStatus.title}</h4>
                <p className="text-xs text-foreground/80 font-medium leading-relaxed">
                  {healthStatus.desc}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
