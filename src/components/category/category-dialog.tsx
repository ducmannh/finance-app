"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategorySchema, CreateCategoryInput, UpdateCategoryInput } from "@/schemas/category";
import { createCategoryAction, updateCategoryAction, CategoryData } from "@/actions/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
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
  Loader2,
  X,
} from "lucide-react";

interface CategoryDialogProps {
  category?: CategoryData | null;
  defaultType?: "INCOME" | "EXPENSE";
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_ICONS = [
  { id: "Utensils", label: "Ăn uống", Icon: Utensils },
  { id: "Car", label: "Đi lại", Icon: Car },
  { id: "ShoppingBag", label: "Mua sắm", Icon: ShoppingBag },
  { id: "Gamepad2", label: "Giải trí", Icon: Gamepad2 },
  { id: "Home", label: "Nhà cửa", Icon: Home },
  { id: "HeartPulse", label: "Sức khỏe", Icon: HeartPulse },
  { id: "Tag", label: "Nhãn", Icon: Tag },
  { id: "Briefcase", label: "Công việc / Lương", Icon: Briefcase },
  { id: "Gift", label: "Quà / Thưởng", Icon: Gift },
  { id: "TrendingUp", label: "Đầu tư", Icon: TrendingUp },
  { id: "Coins", label: "Tiền xu", Icon: Coins },
  { id: "Coffee", label: "Cà phê", Icon: Coffee },
  { id: "BookOpen", label: "Học tập", Icon: BookOpen },
  { id: "Plane", label: "Du lịch", Icon: Plane },
  { id: "Music", label: "Âm nhạc", Icon: Music },
  { id: "Zap", label: "Hóa đơn", Icon: Zap },
  { id: "Shirt", label: "Trang phục", Icon: Shirt },
];

const PRESET_COLORS = [
  "#EF4444", // Đỏ
  "#F59E0B", // Vàng cam
  "#EC4899", // Hồng
  "#8B5CF6", // Tím
  "#3B82F6", // Xanh dương
  "#10B981", // Xanh lục
  "#06B6D4", // Xanh ngọc
  "#6B7280", // Xám
];

export function CategoryDialog({
  category,
  defaultType = "EXPENSE",
  isOpen,
  onClose,
  onSuccess,
}: CategoryDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      type: defaultType,
      color: "#EF4444",
      icon: "Tag",
    },
  });

  const selectedType = watch("type");
  const selectedColor = watch("color");
  const selectedIcon = watch("icon");

  useEffect(() => {
    if (category) {
      setValue("name", category.name);
      setValue("type", category.type);
      setValue("color", category.color);
      setValue("icon", category.icon);
    } else {
      reset({
        name: "",
        type: defaultType,
        color: defaultType === "INCOME" ? "#10B981" : "#EF4444",
        icon: defaultType === "INCOME" ? "Briefcase" : "Utensils",
      });
    }
  }, [category, defaultType, isOpen, reset, setValue]);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateCategoryInput) => {
    setLoading(true);

    try {
      let res;
      if (category) {
        res = await updateCategoryAction({ id: category.id, ...data });
      } else {
        res = await createCategoryAction(data);
      }

      if (!res.success) {
        toast.error(res.error || "Xử lý danh mục thất bại.");
      } else {
        toast.success(res.message || "Lưu danh mục thành công!");
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
      <div className="bg-card text-card-foreground border border-border/60 shadow-2xl rounded-2xl max-w-md w-full overflow-hidden p-6 space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h2 className="text-xl font-bold tracking-tight">
            {category ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Loại danh mục: Thu nhập / Chi tiêu */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Loại danh mục</Label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/60">
              <button
                type="button"
                onClick={() => {
                  setValue("type", "EXPENSE");
                  if (!category) setValue("color", "#EF4444");
                }}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedType === "EXPENSE"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Chi tiêu (Expense)
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue("type", "INCOME");
                  if (!category) setValue("color", "#10B981");
                }}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedType === "INCOME"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Thu nhập (Income)
              </button>
            </div>
          </div>

          {/* Tên danh mục */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tên danh mục
            </Label>
            <Input
              id="name"
              placeholder="VD: Ăn sáng, Tiền điện, Cà phê..."
              {...register("name")}
              disabled={loading}
              className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Chọn Biểu tượng */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Biểu tượng</Label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-border/50 rounded-xl">
              {PRESET_ICONS.map((item) => {
                const IconComp = item.Icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue("icon", item.id)}
                    className={`p-2.5 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 scale-105"
                        : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                    title={item.label}
                  >
                    <IconComp className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chọn Màu sắc */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Màu sắc nhận diện</Label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map((c) => {
                const isSelected = selectedColor === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue("color", c)}
                    className={`h-7 w-7 rounded-full transition-all ${
                      isSelected ? "ring-4 ring-offset-2 ring-offset-background ring-primary scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                );
              })}
            </div>
          </div>

          {/* Actions */}
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
                "Lưu danh mục"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
