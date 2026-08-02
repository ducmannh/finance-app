import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTransactionsAction } from "@/actions/transaction";
import { getCategoriesAction } from "@/actions/category";
import { TransactionManager } from "@/components/transaction/transaction-manager";
import { ArrowLeftRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Giao dịch Thu / Chi | My Finance App",
  description: "Quản lý ghi nhận thu nhập và chi tiêu cá nhân",
};

export default async function TransactionsPage() {
  const [transResult, catResult] = await Promise.all([
    getTransactionsAction(),
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
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ArrowLeftRight className="h-8 w-8 text-primary" /> Quản Lý Giao Dịch Thu / Chi
        </h1>
        <p className="text-muted-foreground mt-1">
          Ghi nhận các khoản Thu nhập và Chi tiêu cá nhân, tự động cập nhật số dư Ví chính.
        </p>
      </div>

      <TransactionManager
        initialTransactions={transactions}
        initialCategories={categories}
        initialTotalIncome={totalIncome}
        initialTotalExpense={totalExpense}
      />
    </div>
  );
}
