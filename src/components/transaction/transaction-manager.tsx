"use client";

import { useState } from "react";
import { TransactionData, getTransactionsAction } from "@/actions/transaction";
import { CategoryData, getCategoriesAction } from "@/actions/category";
import { TransactionFilter } from "@/components/transaction/transaction-filter";
import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionDialog } from "@/components/transaction/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";

interface TransactionManagerProps {
  initialTransactions: TransactionData[];
  initialCategories: CategoryData[];
  initialTotalIncome: number;
  initialTotalExpense: number;
}

export function TransactionManager({
  initialTransactions,
  initialCategories,
  initialTotalIncome,
  initialTotalExpense,
}: TransactionManagerProps) {
  const [transactions, setTransactions] = useState<TransactionData[]>(initialTransactions);
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [totalIncome, setTotalIncome] = useState<number>(initialTotalIncome);
  const [totalExpense, setTotalExpense] = useState<number>(initialTotalExpense);

  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null);

  const fetchCategories = async () => {
    const res = await getCategoriesAction();
    if (res.success && res.categories) {
      setCategories(res.categories);
    }
  };

  const fetchTransactions = async () => {
    const res = await getTransactionsAction({
      type: typeFilter,
      categoryId: categoryFilter,
      searchQuery,
      startDate,
      endDate,
    });
    if (res.success && res.transactions) {
      setTransactions(res.transactions);
      setTotalIncome(res.totalIncome || 0);
      setTotalExpense(res.totalExpense || 0);
    }
  };

  const handleTypeChange = async (type: "ALL" | "INCOME" | "EXPENSE") => {
    setTypeFilter(type);
    const res = await getTransactionsAction({
      type,
      categoryId: categoryFilter,
      searchQuery,
      startDate,
      endDate,
    });
    if (res.success && res.transactions) {
      setTransactions(res.transactions);
      setTotalIncome(res.totalIncome || 0);
      setTotalExpense(res.totalExpense || 0);
    }
  };

  const handleCategoryChange = async (catId: string) => {
    setCategoryFilter(catId);
    const res = await getTransactionsAction({
      type: typeFilter,
      categoryId: catId,
      searchQuery,
      startDate,
      endDate,
    });
    if (res.success && res.transactions) {
      setTransactions(res.transactions);
      setTotalIncome(res.totalIncome || 0);
      setTotalExpense(res.totalExpense || 0);
    }
  };

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    const res = await getTransactionsAction({
      type: typeFilter,
      categoryId: categoryFilter,
      searchQuery: query,
      startDate,
      endDate,
    });
    if (res.success && res.transactions) {
      setTransactions(res.transactions);
      setTotalIncome(res.totalIncome || 0);
      setTotalExpense(res.totalExpense || 0);
    }
  };

  const handleDateRangeChange = async (sDate?: string, eDate?: string) => {
    setStartDate(sDate);
    setEndDate(eDate);
    const res = await getTransactionsAction({
      type: typeFilter,
      categoryId: categoryFilter,
      searchQuery,
      startDate: sDate,
      endDate: eDate,
    });
    if (res.success && res.transactions) {
      setTransactions(res.transactions);
      setTotalIncome(res.totalIncome || 0);
      setTotalExpense(res.totalExpense || 0);
    }
  };

  const handleCreate = () => {
    setSelectedTransaction(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (transaction: TransactionData) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tổng Thu */}
        <Card className="border-border/60 bg-emerald-500/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Tổng thu nhập
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                +{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                  totalIncome
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Tổng Chi */}
        <Card className="border-border/60 bg-rose-500/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Tổng chi tiêu
              </p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-1">
                -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                  totalExpense
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Chênh lệch */}
        <Card className="border-border/60 bg-primary/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                Biến động ròng
              </p>
              <p
                className={`text-2xl font-extrabold font-mono mt-1 ${
                  totalIncome - totalExpense >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {totalIncome - totalExpense >= 0 ? "+" : ""}
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                  totalIncome - totalExpense
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <ArrowUpDown className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <TransactionFilter
            categories={categories}
            typeFilter={typeFilter}
            onTypeChange={handleTypeChange}
            categoryFilter={categoryFilter}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
        <Button onClick={handleCreate} size="lg" className="gap-2 font-bold shrink-0">
          <Plus className="h-5 w-5" /> Thêm giao dịch
        </Button>
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        onEdit={handleEdit}
        onRefresh={fetchTransactions}
      />

      <TransactionDialog
        transaction={selectedTransaction}
        categories={categories}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchTransactions}
        onRefreshCategories={fetchCategories}
      />
    </div>
  );
}
