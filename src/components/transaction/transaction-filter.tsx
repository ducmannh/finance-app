"use client";

import { useState, useRef, useEffect } from "react";
import { CategoryData } from "@/actions/category";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronDown,
  X,
  SlidersHorizontal,
  Tag,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Home,
  HeartPulse,
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
  Check,
} from "lucide-react";

interface TransactionFilterProps {
  categories: CategoryData[];
  typeFilter: "ALL" | "INCOME" | "EXPENSE";
  onTypeChange: (type: "ALL" | "INCOME" | "EXPENSE") => void;
  categoryFilter: string;
  onCategoryChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
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

export function TransactionFilter({
  categories,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: TransactionFilterProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng custom dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lọc danh mục hiển thị theo loại thu/chi đang chọn (nếu khác ALL)
  const availableCategories =
    typeFilter === "ALL" ? categories : categories.filter((c) => c.type === typeFilter);

  const selectedCategoryObj = categories.find((c) => c.id === categoryFilter);

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-card/95 border border-border/60 shadow-sm backdrop-blur">
      {/* 1. Ô tìm kiếm ghi chú nâng cao */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo ghi chú, số tiền..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 bg-muted/40 border-border/60 rounded-xl focus-visible:ring-primary/20 text-sm font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 2. Nhóm bộ lọc: Segmented Pill Switcher (Loại) & Custom Dropdown (Danh mục) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type Filter Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/40">
          <button
            type="button"
            onClick={() => onTypeChange("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              typeFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Tất cả
          </button>
          <button
            type="button"
            onClick={() => onTypeChange("EXPENSE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              typeFilter === "EXPENSE"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-300" /> Chi tiêu
          </button>
          <button
            type="button"
            onClick={() => onTypeChange("INCOME")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              typeFilter === "INCOME"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-300" /> Thu nhập
          </button>
        </div>

        {/* Custom Category Select Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center justify-between gap-2.5 h-9 px-3.5 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted/80 text-xs font-semibold transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px]"
          >
            <div className="flex items-center gap-2 truncate">
              {selectedCategoryObj ? (
                <>
                  <div
                    className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-[10px] text-white shrink-0"
                    style={{ backgroundColor: selectedCategoryObj.color }}
                  >
                    ●
                  </div>
                  <span className="truncate">{selectedCategoryObj.name}</span>
                </>
              ) : (
                <>
                  <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>Tất cả danh mục</span>
                </>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                isCategoryOpen ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>

          {/* Custom Category Menu */}
          {isCategoryOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/60 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md p-1.5 z-50 animate-in fade-in-0 zoom-in-95 max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onCategoryChange("ALL");
                  setIsCategoryOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  categoryFilter === "ALL"
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Tất cả danh mục</span>
                </div>
                {categoryFilter === "ALL" && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>

              <div className="border-t border-border/40 my-1" />

              {availableCategories.map((c) => {
                const IconComp = ICON_MAP[c.icon] || Tag;
                const isSelected = categoryFilter === c.id;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onCategoryChange(c.id);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="p-1 rounded-md text-white shrink-0"
                        style={{ backgroundColor: c.color }}
                      >
                        <IconComp className="h-3 w-3" />
                      </div>
                      <span className="truncate">{c.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
