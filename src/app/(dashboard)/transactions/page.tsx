import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTransactionsAction } from "@/actions/transaction";
import { getCategoriesAction } from "@/actions/category";
import { TransactionManager } from "@/components/transaction/transaction-manager";
import { ArrowLeftRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Giao dịch Thu / Chi | My Finance App",
  description: "Quản lý ghi nhận thu nhập và chi tiêu cá nhân",
};

export default async function TransactionsPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const endDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const [transResult, catResult] = await Promise.all([
    getTransactionsAction({ startDate, endDate }),
    getCategoriesAction(),
  ]);

  if (!transResult.success || !transResult.transactions) {
    if (transResult.error?.includes("đăng nhập")) {
      redirect("/login");
    }
  }

  const transactions = transResult.transactions || [];
  const categories = catResult.categories || [];
  const totalIncome = transResult.totalIncome || 0;
  const totalExpense = transResult.totalExpense || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
          <ArrowLeftRight className="h-7 w-7 text-primary shrink-0" /> Quản Lý Giao Dịch Thu / Chi
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Ghi nhận các khoản Thu nhập và Chi tiêu cá nhân, tự động cập nhật số dư Ví chính theo từng tháng.
        </p>
      </div>

      <TransactionManager
        initialTransactions={transactions}
        initialCategories={categories}
        initialTotalIncome={totalIncome}
        initialTotalExpense={totalExpense}
        initialYear={currentYear}
        initialMonth={currentMonth}
      />
    </div>
  );
}
