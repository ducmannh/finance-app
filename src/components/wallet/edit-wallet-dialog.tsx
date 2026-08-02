"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateWalletSchema, UpdateWalletInput } from "@/schemas/wallet";
import { updateWalletAction, WalletData } from "@/actions/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  Wallet,
  CreditCard,
  PiggyBank,
  Coins,
  Landmark,
  Banknote,
  Vault,
  Loader2,
  X,
} from "lucide-react";

interface EditWalletDialogProps {
  wallet: WalletData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_ICONS = [
  { id: "Wallet", label: "Ví tiền", Icon: Wallet },
  { id: "CreditCard", label: "Thẻ ngân hàng", Icon: CreditCard },
  { id: "PiggyBank", label: "Tiết kiệm", Icon: PiggyBank },
  { id: "Coins", label: "Tiền xu", Icon: Coins },
  { id: "Landmark", label: "Ngân hàng", Icon: Landmark },
  { id: "Banknote", label: "Tiền mặt", Icon: Banknote },
  { id: "Vault", label: "Két sắt", Icon: Vault },
];

const PRESET_COLORS = [
  { value: "#10B981", label: "Xanh lục" },
  { value: "#3B82F6", label: "Xanh dương" },
  { value: "#8B5CF6", label: "Tím" },
  { value: "#F59E0B", label: "Vàng cam" },
  { value: "#EF4444", label: "Đỏ" },
  { value: "#EC4899", label: "Hồng" },
  { value: "#06B6D4", label: "Xanh ngọc" },
];

export function EditWalletDialog({
  wallet,
  isOpen,
  onClose,
  onSuccess,
}: EditWalletDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateWalletInput>({
    resolver: zodResolver(updateWalletSchema),
    defaultValues: {
      name: wallet.name || "Ví chính",
      balance: wallet.balance ?? 0,
      color: wallet.color || "#10B981",
      icon: wallet.icon || "Wallet",
    },
  });

  const selectedColor = watch("color");
  const selectedIcon = watch("icon");
  const currentBalance = watch("balance");

  if (!isOpen) return null;

  const onSubmit = async (data: UpdateWalletInput) => {
    setLoading(true);

    try {
      const res = await updateWalletAction(data);
      if (!res.success) {
        toast.error(res.error || "Cập nhật ví thất bại.");
      } else {
        toast.success(res.message || "Cập nhật thông tin Ví thành công!");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-0">
      <div className="bg-card text-card-foreground border border-border/60 shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden p-6 space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Cấu hình Ví chính</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Thay đổi tên ví, số dư ban đầu và giao diện nhận diện
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Tên ví */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tên ví
            </Label>
            <Input
              id="name"
              placeholder="Ví chính"
              {...register("name")}
              disabled={loading}
              className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Số dư (VND) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="balance" className="text-sm font-medium">
                Số dư hiện tại (VND)
              </Label>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                  Number(currentBalance) || 0
                )}
              </span>
            </div>
            <Input
              id="balance"
              type="number"
              step="1000"
              placeholder="0"
              {...register("balance")}
              disabled={loading}
              className={errors.balance ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.balance && (
              <p className="text-xs text-destructive font-medium">{errors.balance.message}</p>
            )}
          </div>

          {/* Chọn Biểu tượng */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Biểu tượng nhận diện</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((item) => {
                const IconComponent = item.Icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue("icon", item.id)}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 scale-105"
                        : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                    title={item.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chọn Màu sắc */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Màu sắc chủ đạo</Label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map((c) => {
                const isSelected = selectedColor === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setValue("color", c.value)}
                    className={`h-8 w-8 rounded-full transition-all flex items-center justify-center ${
                      isSelected ? "ring-4 ring-offset-2 ring-offset-background ring-primary scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="font-semibold">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                "Lưu thông tin ví"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
