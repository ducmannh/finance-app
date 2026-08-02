import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCategoriesAction } from "@/actions/category";
import { CategoryManager } from "@/components/category/category-manager";
import { FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "Danh mục Thu / Chi | My Finance App",
  description: "Quản lý danh mục phân loại thu nhập và chi tiêu cá nhân",
};

export default async function CategoriesPage() {
  const result = await getCategoriesAction();

  if (!result.success || !result.categories) {
    if (result.error?.includes("đăng nhập")) {
      redirect("/login");
    }
  }

  const categories = result.categories || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FolderKanban className="h-8 w-8 text-primary" /> Quản Lý Danh Mục Thu / Chi
        </h1>
        <p className="text-muted-foreground mt-1">
          Tùy chỉnh và phân loại các mục Thu nhập & Chi tiêu cá nhân theo nhu cầu của bạn.
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
