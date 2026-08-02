"use client";

import Link from "next/link";
import { TransactionData } from "@/actions/transaction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Receipt, Clock, Tag, Utensils, Car, ShoppingBag, Gamepad2, Home, HeartPulse, Briefcase, Gift, TrendingUp, Coins, Coffee, BookOpen, Plane, Music, Zap, Shirt } from "lucide-react";

interface RecentTransactionsWidgetProps {
  transactions: TransactionData[];
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

export function RecentTransactionsWidget({ transactions }: RecentTransactionsWidgetProps) {
  const recentItems = transactions.slice(0, 5);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatFullDateTime = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";

    const dateStr = d.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${dateStr} • ${timeStr}`;
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Giao Dịch Gần Đây
          </CardTitle>
          <CardDescription className="text-xs">
            5 biến động số dư thu chi mới nhất của bạn
          </CardDescription>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border/40">
        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2">
            <Receipt className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-sm font-medium">Chưa có giao dịch nào được tạo</p>
          </div>
        ) : (
          recentItems.map((t) => {
            const IconComp = ICON_MAP[t.category.icon] || Tag;
            const isIncome = t.type === "INCOME";

            return (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
              >
                {/* Vế trái: Icon + Category Name + Date + Note */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="p-2.5 rounded-xl text-white shadow-xs shrink-0"
                    style={{ backgroundColor: t.category.color }}
                  >
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.category.name}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs">
                      <span className="inline-flex items-center gap-1 font-medium text-foreground/80 dark:text-slate-300">
                        <Clock className="h-3 w-3 shrink-0 text-primary" />
                        {formatFullDateTime(t.date)}
                      </span>
                      {t.note && (
                        <>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="line-clamp-1 font-medium text-foreground/90 dark:text-slate-200">
                            {t.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vế phải: Amount */}
                <div className="shrink-0 font-extrabold font-mono text-sm">
                  <span
                    className={
                      isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }
                  >
                    {isIncome ? "+" : "-"}
                    {formatVND(t.amount)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
