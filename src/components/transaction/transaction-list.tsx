"use client";

import { useState, useEffect } from "react";
import { TransactionData, deleteTransactionAction } from "@/actions/transaction";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
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
  BookOpen,
  Plane,
  Music,
  Zap,
  Coffee,
  Shirt,
  Pencil,
  Trash2,
  Receipt,
  Clock,
} from "lucide-react";

interface TransactionListProps {
  transactions: TransactionData[];
  onEdit: (transaction: TransactionData) => void;
  onRefresh: () => void;
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

const DAY_OF_WEEK_FULL = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const DAY_OF_WEEK_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function TransactionList({ transactions, onEdit, onRefresh }: TransactionListProps) {
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-2xl bg-card/40 space-y-3">
        <div className="p-4 rounded-full bg-muted text-muted-foreground">
          <Receipt className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Chưa có giao dịch nào</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Bấm nút "➕ Thêm giao dịch" ở trên để bắt đầu ghi nhận thu chi cá nhân!
          </p>
        </div>
      </div>
    );
  }

  // Helper lấy key ngày YYYY-MM-DD theo giờ địa phương
  const getLocalDateKey = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Nhóm giao dịch theo Ngày địa phương (YYYY-MM-DD)
  const groupedTransactions: Record<string, TransactionData[]> = {};

  transactions.forEach((t) => {
    const dateKey = getLocalDateKey(t.date);
    if (!dateKey) return;
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = [];
    }
    groupedTransactions[dateKey].push(t);
  });

  const formatDateHeader = (dateStr: string) => {
    if (!dateStr) return "";

    if (isMounted) {
      const todayStr = getLocalDateKey(new Date());

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateKey(yesterday);

      if (dateStr === todayStr) return "Hôm nay";
      if (dateStr === yesterdayStr) return "Hôm qua";
    }

    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;

    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = DAY_OF_WEEK_FULL[dateObj.getDay()] || "";

    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(month).padStart(2, "0");

    return `${dayOfWeek}, ${formattedDay}/${formattedMonth}/${year}`;
  };

  const formatFullDateTime = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";

    const weekday = DAY_OF_WEEK_SHORT[d.getDay()] || "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${weekday}, ${day}/${month}/${year} • ${hours}:${minutes}`;
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    setDeleting(true);
    try {
      const res = await deleteTransactionAction(transactionToDelete.id);
      if (!res.success) {
        toast.error(res.error || "Xóa giao dịch thất bại.");
      } else {
        toast.success(res.message || "Xóa giao dịch thành công!");
        setTransactionToDelete(null);
        onRefresh();
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xóa giao dịch.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([dateKey, items]) => {
        let dayIncome = 0;
        let dayExpense = 0;
        items.forEach((item) => {
          if (item.type === "INCOME") dayIncome += item.amount;
          else dayExpense += item.amount;
        });

        return (
          <div key={dateKey} className="space-y-2.5">
            {/* Header ngày (Thêm suppressHydrationWarning chống đụng độ thời gian máy chủ/khách) */}
            <div className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider">
              <span suppressHydrationWarning className="text-foreground/90 dark:text-slate-200">
                {formatDateHeader(dateKey)}
              </span>
              <div className="flex items-center gap-2.5 text-xs font-bold font-mono tracking-normal normal-case">
                {dayIncome > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    +{new Intl.NumberFormat("vi-VN").format(dayIncome)} ₫
                  </span>
                )}
                {dayExpense > 0 && (
                  <span className="text-rose-600 dark:text-rose-400">
                    -{new Intl.NumberFormat("vi-VN").format(dayExpense)} ₫
                  </span>
                )}
              </div>
            </div>

            {/* List giao dịch trong ngày */}
            <div className="divide-y divide-border/40 rounded-2xl bg-card border border-border/60 shadow-xs overflow-hidden">
              {items.map((t) => {
                const IconComp = ICON_MAP[t.category.icon] || Tag;
                const isIncome = t.type === "INCOME";

                return (
                  <div
                    key={t.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-2 sm:gap-4 hover:bg-muted/40 transition-colors group"
                  >
                    {/* Tra trái: Icon + Tên danh mục + Ghi chú */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="p-2.5 rounded-xl text-white shadow-xs shrink-0"
                        style={{ backgroundColor: t.category.color }}
                      >
                        <IconComp className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate">{t.category.name}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs">
                          <span suppressHydrationWarning className="inline-flex items-center gap-1 font-medium text-foreground/80 dark:text-slate-300 whitespace-nowrap">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                            {formatFullDateTime(t.date)}
                          </span>
                          {t.note && (
                            <>
                              <span className="text-muted-foreground/40 hidden sm:inline">•</span>
                              <span className="line-clamp-1 font-medium text-foreground/90 dark:text-slate-200">
                                {t.note}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vế phải: Số tiền + Nút hành động */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/30">
                      <span
                        className={`text-base font-extrabold font-mono ${
                          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(t.amount)}
                      </span>

                      {/* Action Buttons: Hiển thị trên mobile touch & desktop hover */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEdit(t)}
                          title="Sửa giao dịch"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setTransactionToDelete(t)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Xóa giao dịch"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        isOpen={!!transactionToDelete}
        title="Xóa giao dịch này?"
        description={`Bạn có chắc chắn muốn xóa giao dịch ${
          transactionToDelete?.type === "INCOME" ? "Thu nhập" : "Chi tiêu"
        } "${transactionToDelete?.category.name || ""}" (${
          transactionToDelete
            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(transactionToDelete.amount)
            : ""
        }) không? Số dư Ví chính sẽ được tự động hoàn trả.`}
        confirmText="Xóa giao dịch"
        cancelText="Hủy"
        variant="destructive"
        loading={deleting}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
