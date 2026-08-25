"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  PendingTransactionData,
  getPendingTransactionsAction,
} from "@/actions/pending-transaction";
import { CategoryData, getCategoriesAction } from "@/actions/category";
import { QuickProcessModal } from "./quick-process-modal";
import {
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface PendingContextType {
  pendingTransactions: PendingTransactionData[];
  pendingCount: number;
  loading: boolean;
  refreshPending: () => Promise<void>;
  openQuickProcess: (tx: PendingTransactionData) => void;
  closeQuickProcess: () => void;
}

const PendingContext = createContext<PendingContextType | undefined>(undefined);

export function PendingTransactionsProvider({ children }: { children: React.ReactNode }) {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransactionData[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [activeQuickProcessTx, setActiveQuickProcessTx] = useState<PendingTransactionData | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<PendingTransactionData[]>([]);

  // Lưu trữ ID đã biết để phát hiện giao dịch mới
  const knownTxIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDoneRef = useRef(false);

  // Tải danh mục
  const loadCategories = useCallback(async () => {
    try {
      const res = await getCategoriesAction();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Tải danh sách giao dịch pending
  const refreshPending = useCallback(async () => {
    try {
      const res = await getPendingTransactionsAction("PENDING");
      if (res.success && res.transactions) {
        const currentList = res.transactions;
        setPendingTransactions(currentList);
        setPendingCount(res.pendingCount || currentList.length);

        // Kiểm tra xem có giao dịch mới chưa từng xuất hiện không
        if (initialFetchDoneRef.current) {
          const newItems = currentList.filter((item) => !knownTxIdsRef.current.has(item.id));
          if (newItems.length > 0) {
            // Thêm vào hàng đợi thông báo
            setNotificationQueue((prev) => [...prev, ...newItems]);
          }
        }

        // Cập nhật danh sách ID đã biết
        const newSet = new Set<string>();
        currentList.forEach((item) => newSet.add(item.id));
        knownTxIdsRef.current = newSet;
        initialFetchDoneRef.current = true;
      }
    } catch (e) {
      console.error("Polling Pending Transactions Error:", e);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    refreshPending();

    // Polling định kỳ mỗi 6 giây để bắt kịp biến động từ Webhook/Simulator
    const interval = setInterval(() => {
      refreshPending();
    }, 6000);

    return () => clearInterval(interval);
  }, [loadCategories, refreshPending]);

  const openQuickProcess = (tx: PendingTransactionData) => setActiveQuickProcessTx(tx);
  const closeQuickProcess = () => setActiveQuickProcessTx(null);

  const dismissNotification = (id: string) => {
    setNotificationQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleNotificationClick = (tx: PendingTransactionData) => {
    dismissNotification(tx.id);
    openQuickProcess(tx);
  };

  return (
    <PendingContext.Provider
      value={{
        pendingTransactions,
        pendingCount,
        loading,
        refreshPending,
        openQuickProcess,
        closeQuickProcess,
      }}
    >
      {children}

      {/* Floating Real-Time Notifications for Bank Transactions */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {notificationQueue.map((tx) => {
          const isExpense = tx.type === "EXPENSE";

          return (
            <div
              key={tx.id}
              onClick={() => handleNotificationClick(tx)}
              className="pointer-events-auto group cursor-pointer relative overflow-hidden rounded-2xl border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-right-8 fade-in-0"
            >
              {/* Top gradient highlight */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isExpense ? "bg-rose-500" : "bg-emerald-500"
                }`}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isExpense
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isExpense ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                      <Landmark className="h-3.5 w-3.5" />
                      <span>{tx.bankName || "Ngân hàng"}</span>
                      <span>•</span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                        <Sparkles className="h-3 w-3" /> Mới phát hiện
                      </span>
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span
                        className={`text-base font-extrabold tracking-tight ${
                          isExpense
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {isExpense ? "-" : "+"}
                        {tx.amount.toLocaleString("vi-VN")} đ
                      </span>
                    </div>

                    <p className="text-xs text-foreground/80 line-clamp-1 mt-0.5 font-medium">
                      {tx.content || (isExpense ? "Chuyển tiền ngân hàng" : "Nhận tiền ngân hàng")}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary group-hover:underline">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Nhấn vào đây để {isExpense ? "lưu hóa đơn" : "xác nhận thu nhập"}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(tx.id);
                  }}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick 1-Click Process Modal */}
      <QuickProcessModal
        pendingTx={activeQuickProcessTx}
        categories={categories}
        isOpen={!!activeQuickProcessTx}
        onClose={closeQuickProcess}
        onSuccess={() => {
          refreshPending();
          loadCategories();
        }}
        onRefreshCategories={loadCategories}
      />
    </PendingContext.Provider>
  );
}

export function usePendingTransactions() {
  const context = useContext(PendingContext);
  if (!context) {
    throw new Error("usePendingTransactions must be used within a PendingTransactionsProvider");
  }
  return context;
}
