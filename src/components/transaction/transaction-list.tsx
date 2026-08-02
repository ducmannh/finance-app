"use client";

import { useState } from "react";
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

export function TransactionList({ transactions, onEdit, onRefresh }: TransactionListProps) {
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionData | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Nhóm giao dịch theo Ngày (YYYY-MM-DD)
  const groupedTransactions: Record<string, TransactionData[]> = {};

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const dateKey = d.toISOString().split("T")[0];
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = [];
    }
    groupedTransactions[dateKey].push(t);
  });

  const formatDateHeader = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (dateStr === todayStr) return "Hôm nay";
    if (dateStr === yesterdayStr) return "Hôm qua";

    return dateObj.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
        // Tính tổng trong ngày
        let dayIncome = 0;
        let dayExpense = 0;
        items.forEach((item) => {
          if (item.type === "INCOME") dayIncome += item.amount;
          else dayExpense += item.amount;
        });

        return (
          <div key={dateKey} className="space-y-3">
            {/* Header ngày */}
            <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider">
              <span className="text-foreground/90 dark:text-slate-200">{formatDateHeader(dateKey)}</span>
              <div className="flex items-center gap-3 text-sm font-bold font-mono tracking-normal normal-case">
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
            <div className="divide-y divide-border/40 rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
              {items.map((t) => {
                const IconComp = ICON_MAP[t.category.icon] || Tag;
                const isIncome = t.type === "INCOME";

                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors group"
                  >
                    {/* Tra trái: Icon + Tên danh mục + Ghi chú */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className="p-2.5 rounded-xl text-white shadow-sm shrink-0"
                        style={{ backgroundColor: t.category.color }}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{t.category.name}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs">
                          <span className="inline-flex items-center gap-1 font-medium text-foreground/80 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
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

                    {/* Vế phải: Số tiền + Nút hành động */}
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-base font-extrabold font-mono ${
                          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(t.amount)}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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
