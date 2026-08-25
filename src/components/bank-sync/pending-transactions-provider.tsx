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
  BellRing,
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

// Hàm phát chuông thông báo nhẹ nhàng khi có biến động
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now); // Note E5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, now + 0.12); // Note B5
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch {
    // Bỏ qua lỗi audio autoplay nếu trình duyệt chặn
  }
}

export function PendingTransactionsProvider({ children }: { children: React.ReactNode }) {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransactionData[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);

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

        if (!initialFetchDoneRef.current) {
          // Lần đầu tải: Nếu có sẵn giao dịch chờ duyệt, hiển thị thông báo nổi cho giao dịch mới nhất
          if (currentList.length > 0) {
            setNotificationQueue(currentList.slice(0, 2));
          }
        } else {
          // Các lần polling tiếp theo: Kiểm tra xem có giao dịch mới chưa từng xuất hiện không
          const newItems = currentList.filter((item) => !knownTxIdsRef.current.has(item.id));
          if (newItems.length > 0) {
            playNotificationChime();
            setNotificationQueue((prev) => [...newItems, ...prev]);
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

    // Polling định kỳ mỗi 3 giây để bắt kịp biến động số dư tức thì từ SePay
    const interval = setInterval(() => {
      refreshPending();
    }, 3000);

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

      {/* Floating Top Real-Time Notifications (Trượt từ trên xuống) */}
      <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 max-w-lg w-full px-3.5 pointer-events-none">
        {notificationQueue.map((tx) => {
          const isExpense = tx.type === "EXPENSE";

          return (
            <div
              key={tx.id}
              onClick={() => handleNotificationClick(tx)}
              className="pointer-events-auto group cursor-pointer relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-background/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary w-full animate-in slide-in-from-top-8 fade-in-0 ring-4 ring-primary/10"
            >
              {/* Highlight bar top */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isExpense ? "bg-rose-500" : "bg-emerald-500"
                }`}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-2xl shrink-0 ${
                      isExpense
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isExpense ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <BellRing className="h-3 w-3 animate-bounce" /> Biến Động Mới
                      </span>

                      <span className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
                        {tx.bankName || "Ngân hàng"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span
                        className={`text-lg font-black tracking-tight ${
                          isExpense
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {isExpense ? "-" : "+"}
                        {tx.amount.toLocaleString("vi-VN")} đ
                      </span>
                    </div>

                    <p className="text-xs text-foreground/80 line-clamp-1 font-medium">
                      {tx.content || (isExpense ? "Chuyển tiền ngân hàng" : "Nhận tiền ngân hàng")}
                    </p>

                    <div className="pt-1 flex items-center gap-1 text-xs font-extrabold text-primary group-hover:underline">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Bấm vào đây để {isExpense ? "tạo hóa đơn" : "xác nhận thu nhập"} 1-chạm</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(tx.id);
                  }}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all shrink-0"
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

