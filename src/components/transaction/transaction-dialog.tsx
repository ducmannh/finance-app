"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionSchema, CreateTransactionInput } from "@/schemas/transaction";
import { createTransactionAction, updateTransactionAction, TransactionData } from "@/actions/transaction";
import { CategoryData } from "@/actions/category";
import { CategoryDialog } from "@/components/category/category-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  DollarSign,
  FileText,
  Plus,
  Loader2,
  X,
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
  CalendarDays,
} from "lucide-react";

interface TransactionDialogProps {
  transaction?: TransactionData | null;
  categories: CategoryData[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onRefreshCategories?: () => void;
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

export function TransactionDialog({
  transaction,
  categories,
  isOpen,
  onClose,
  onSuccess,
  onRefreshCategories,
}: TransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      categoryId: "",
      date: new Date(),
      note: "",
    },
  });

  const selectedType = watch("type");
  const currentAmount = watch("amount");
  const selectedCategory = watch("categoryId");
  const currentDate = watch("date");

  useEffect(() => {
    if (transaction) {
      setValue("type", transaction.type);
      setValue("amount", transaction.amount);
      setValue("categoryId", transaction.categoryId);
      setValue("date", new Date(transaction.date));
      setValue("note", transaction.note || "");
    } else {
      reset({
        type: "EXPENSE",
        amount: 0,
        categoryId: "",
        date: new Date(),
        note: "",
      });
    }
  }, [transaction, isOpen, reset, setValue]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const onSubmit = async (data: CreateTransactionInput) => {
    setLoading(true);

    try {
      let res;
      if (transaction) {
        res = await updateTransactionAction({
          id: transaction.id,
          ...data,
        });
      } else {
        res = await createTransactionAction(data);
      }

      if (!res.success) {
        toast.error(res.error || "Thao tác thất bại.");
      } else {
        toast.success(res.message || "Ghi nhận giao dịch thành công!");
        onSuccess();
        onClose();
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 pb-20 sm:p-4 animate-in fade-in-0">
        <div className="bg-card text-card-foreground border border-border/60 shadow-2xl rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95">
          {/* Header Cố định trên cùng */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/40 shrink-0">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {transaction ? "Chỉnh sửa giao dịch" : "Thêm giao dịch mới"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form bọc toàn bộ với Body cuộn và Footer cố định */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
            {/* Body cuộn độc lập */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4.5">
              {/* Loại Giao Dịch: Chi tiêu / Thu nhập */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Loại giao dịch</Label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/60">
                  <button
                    type="button"
                    onClick={() => setValue("type", "EXPENSE")}
                    className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedType === "EXPENSE"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🔴 Chi tiêu (Expense)
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("type", "INCOME")}
                    className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedType === "INCOME"
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🟢 Thu nhập (Income)
                  </button>
                </div>
              </div>

              {/* Số tiền (VND) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-muted-foreground" /> Số tiền (VND)
                  </Label>
                  <span
                    className={`text-base font-extrabold font-mono ${
                      selectedType === "INCOME" ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {selectedType === "INCOME" ? "+" : "-"}
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      Number(currentAmount) || 0
                    )}
                  </span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  step="1000"
                  placeholder="VD: 50000"
                  {...register("amount")}
                  disabled={loading}
                  className={`text-lg font-semibold h-10 ${
                    errors.amount ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
                {errors.amount && (
                  <p className="text-xs text-destructive font-medium">{errors.amount.message}</p>
                )}
              </div>

              {/* Danh mục Thu / Chi */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chọn danh mục</Label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryDialogOpen(true)}
                    className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tạo danh mục mới
                  </button>
                </div>

                {filteredCategories.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground">
                    Chưa có danh mục nào. Hãy bấm "+ Tạo danh mục mới" ở trên!
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-border/50 rounded-xl">
                    {filteredCategories.map((c) => {
                      const IconComp = ICON_MAP[c.icon] || Tag;
                      const isSelected = selectedCategory === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setValue("categoryId", c.id)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all text-xs font-medium cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/20 scale-102"
                              : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div
                            className="p-1.5 rounded-lg text-white"
                            style={{ backgroundColor: c.color }}
                          >
                            <IconComp className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate max-w-full text-[11px]">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.categoryId && (
                  <p className="text-xs text-destructive font-medium">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Ngày thực hiện (Sử dụng Custom DatePicker) */}
              <div className="space-y-1.5">
                <Label htmlFor="transactionDate" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" /> Ngày thực hiện
                </Label>
                <DatePicker
                  id="transactionDate"
                  value={currentDate}
                  onChange={(newDate) => setValue("date", newDate)}
                  placeholder="dd/mm/yyyy (VD: 15/08/2026)"
                  position="top"
                />
              </div>

              {/* Ghi chú */}
              <div className="space-y-1.5">
                <Label htmlFor="note" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Ghi chú (Không bắt buộc)
                </Label>
                <Input
                  id="note"
                  placeholder="VD: Ăn sáng phở bò, Tiền điện tháng 8..."
                  {...register("note")}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Footer Cố định dưới cùng (Nút Hủy và Lưu LUÔN HIỂN THỊ) */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border/40 bg-card shrink-0">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="cursor-pointer">
                Hủy
              </Button>
              <Button type="submit" disabled={loading} className="font-bold cursor-pointer">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                  </>
                ) : (
                  "Lưu giao dịch"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Dialog cho phép thêm danh mục nhanh */}
      <CategoryDialog
        defaultType={selectedType}
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        onSuccess={async () => {
          if (onRefreshCategories) {
            await onRefreshCategories();
          }
        }}
      />
    </>
  );
}
