"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PendingTransactionData,
  getPendingTransactionsAction,
  deletePendingTransactionAction,
  ignorePendingTransactionAction,
  getWebhookSettingsAction,
  regenerateWebhookSecretAction,
} from "@/actions/pending-transaction";
import { usePendingTransactions } from "@/components/bank-sync/pending-transactions-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Layers,
  Inbox,
  Filter,
  Loader2,
} from "lucide-react";

interface BankSyncManagerProps {
  initialTransactions: PendingTransactionData[];
  initialPendingCount: number;
}

// Hàm rút gọn và làm sạch thông tin chuyển tiền từ SMS/Ngân hàng
export function cleanBankContent(raw?: string | null): string {
  if (!raw) return "";
  let text = raw.trim();

  // Xóa tiền tố mã ngân hàng kỹ thuật (VD: "MBVCB.15748749833.785913.", "VCB.12345.")
  text = text.replace(/^[A-Z0-9_]+\.\d+\.\d+\.?\s*/i, "");
  text = text.replace(/^[A-Z0-9_]+\.\d+\.?\s*/i, "");

  // Xóa phần đuôi mã giao dịch kỹ thuật (VD: "- Ma GD ACSP/ or78", "Trace 123456", "Ref FT24...")
  text = text.replace(/[-–]?\s*Ma GD.*$/i, "");
  text = text.replace(/[-–]?\s*Trace\s*\d+.*$/i, "");
  text = text.replace(/[-–]?\s*Ref\s*[A-Z0-9]+.*$/i, "");

  // Trích xuất nội dung chính nếu có cú pháp "CT tu ... toi ... tai ..."
  const ctMatch = text.match(/^(.*?)(?:\.|\s)+CT tu \d+.*$/i);
  if (ctMatch && ctMatch[1].trim().length >= 2) {
    text = ctMatch[1].trim();
  }

  // Trích xuất nội dung nếu có "ND: ..." hoặc "Noi dung: ..."
  const ndMatch = text.match(/(?:ND|Noi dung|Noidung)\s*:\s*(.+)$/i);
  if (ndMatch && ndMatch[1].trim().length >= 2) {
    text = ndMatch[1].trim();
  }

  return text.trim() || raw;
}

export function BankSyncManager({
  initialTransactions,
  initialPendingCount,
}: BankSyncManagerProps) {
  const [activeTab, setActiveTab] = useState<"INBOX" | "SETTINGS">("INBOX");
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "IGNORED" | "ALL">("PENDING");
  const [transactions, setTransactions] = useState<PendingTransactionData[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PendingTransactionData | null>(null);

  // Webhook settings state
  const [webhookSecret, setWebhookSecret] = useState<string>("");
  const [showSecret, setShowSecret] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const { pendingCount, openQuickProcess, refreshPending } = usePendingTransactions();
  const router = useRouter();

  const currentPendingCount = pendingCount !== undefined ? pendingCount : initialPendingCount;

  const fetchTransactions = async (status = statusFilter, showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getPendingTransactionsAction(status);
      if (res.success && res.transactions) {
        setTransactions(res.transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadWebhookSettings = async () => {
    try {
      const res = await getWebhookSettingsAction();
      if (res.success && res.webhookSecret) {
        setWebhookSecret(res.webhookSecret);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadWebhookSettings();
  }, []);

  // Tự động cập nhật lại danh sách ngay khi có biến động mới hoặc khi duyệt/bỏ qua giao dịch
  useEffect(() => {
    fetchTransactions(statusFilter, false);
  }, [pendingCount, statusFilter]);

  // Tự động polling nền định kỳ 3 giây để cập nhật dữ liệu tự động mà không cần bấm Làm mới
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTransactions(statusFilter, false);
    }, 3000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleStatusFilterChange = (status: "PENDING" | "APPROVED" | "IGNORED" | "ALL") => {
    setStatusFilter(status);
    fetchTransactions(status, true);
  };

  const handleIgnore = async (id: string) => {
    try {
      const res = await ignorePendingTransactionAction(id);
      if (res.success) {
        toast.info("Đã bỏ qua giao dịch này.");
        fetchTransactions();
        refreshPending();
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi bỏ qua.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeletingId(itemToDelete.id);
    try {
      const res = await deletePendingTransactionAction(itemToDelete.id);
      if (res.success) {
        toast.success(res.message || "Đã xóa bản ghi.");
        fetchTransactions();
        refreshPending();
      } else {
        toast.error(res.error || "Xóa thất bại.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi xóa.");
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  };

  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);

  const handleRegenerateSecret = async () => {
    setRegenerating(true);
    try {
      const res = await regenerateWebhookSecretAction();
      if (res.success && res.data) {
        setWebhookSecret(res.data.webhookSecret);
        toast.success(res.message || "Đã tạo mới Secret Token!");
        setIsRegenerateConfirmOpen(false);
      } else {
        toast.error(res.error || "Lỗi khi tạo lại Secret Token.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi tạo lại Secret.");
    } finally {
      setRegenerating(false);
    }
  };

  const [customDomain, setCustomDomain] = useState<string>("");
  const [isEditingDomain, setIsEditingDomain] = useState(false);

  const defaultOrigin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" && window.location.origin && !window.location.origin.includes("localhost")
      ? window.location.origin
      : "https://financeapp.manh.pics");
  const activeOrigin = customDomain.trim() ? customDomain.trim().replace(/\/+$/, "") : defaultOrigin;
  const fullWebhookUrl = `${activeOrigin}/api/webhook/bank?secret=${webhookSecret}`;

  const copyToClipboard = (text: string, isUrl: boolean) => {
    navigator.clipboard.writeText(text);
    if (isUrl) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2500);
    }
    toast.success("Đã sao chép vào bộ nhớ tạm!");
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2 sm:gap-2.5">
          <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-primary/10 text-primary shrink-0">
            <Landmark className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          Biến Động Số Dư Ngân Hàng
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Tự động nhận diện giao dịch Vietcombank, MBBank, Techcombank, ACB... và tạo hóa đơn 1-chạm.
        </p>
      </div>

      {/* Main Tab Navigation - Lưới 2 cột trên điện thoại */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("INBOX")}
          className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "INBOX"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Inbox className="h-4 w-4 shrink-0" />
          <span>Hộp Thư</span>
          {currentPendingCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold ${
                activeTab === "INBOX" ? "bg-white text-primary" : "bg-rose-500 text-white animate-pulse"
              }`}
            >
              {currentPendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SETTINGS")}
          className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "SETTINGS"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Cài Đặt Kết Nối</span>
        </button>
      </div>

      {/* TAB 1: HỘP THƯ BIẾN ĐỘNG (INBOX) */}
      {activeTab === "INBOX" && (
        <div className="space-y-3.5 sm:space-y-4">
          {/* Sub Filters - Cuộn ngang mượt mà trên mobile */}
          <div className="flex items-center justify-between gap-2 bg-card p-2 sm:p-3 rounded-2xl border border-border/60 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              {[
                { id: "PENDING", label: "Chờ Duyệt", icon: Clock },
                { id: "APPROVED", label: "Đã Tạo Hóa Đơn", icon: CheckCircle2 },
                { id: "IGNORED", label: "Đã Bỏ Qua", icon: Ban },
                { id: "ALL", label: "Tất Cả", icon: Layers },
              ].map((f) => {
                const Icon = f.icon;
                const isSelected = statusFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleStatusFilterChange(f.id as any)}
                    className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {f.label}
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchTransactions()}
              disabled={loading}
              className="text-[11px] sm:text-xs font-semibold rounded-xl h-8 px-2.5 shrink-0"
            >
              <RefreshCw className={`h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          </div>

          {/* List of Pending Transactions */}
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Đang tải danh sách biến động...</p>
            </div>
          ) : transactions.length === 0 ? (
            <Card className="rounded-2xl border-dashed p-8 sm:p-12 text-center">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/60 text-muted-foreground inline-block mb-3">
                <Inbox className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">Chưa có giao dịch biến động nào</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                {statusFilter === "PENDING"
                  ? "Tất cả biến động số dư đã được xử lý xong. Khi tài khoản ngân hàng của bạn phát sinh giao dịch mới, thông báo sẽ tự động xuất hiện tại đây."
                  : "Chưa có dữ liệu cho bộ lọc này."}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("SETTINGS")}
                className="rounded-xl text-xs font-bold"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Xem hướng dẫn kết nối ngân hàng
              </Button>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {transactions.map((tx) => {
                const isExpense = tx.type === "EXPENSE";
                const isPending = tx.status === "PENDING";
                const isApproved = tx.status === "APPROVED";
                const isIgnored = tx.status === "IGNORED";

                return (
                  <div
                    key={tx.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isPending
                        ? "bg-card border-primary/30 shadow-xs hover:border-primary/60"
                        : "bg-card/60 border-border/40 opacity-80"
                    }`}
                  >
                    {/* Left: Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`p-2 sm:p-2.5 rounded-xl shrink-0 mt-0.5 ${
                          isExpense
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {isExpense ? <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" /> : <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span
                            className={`text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              isExpense
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isExpense ? "Chuyển Đi" : "Nhận Tiền"}
                          </span>

                          <span className="text-[11px] sm:text-xs font-bold text-foreground flex items-center gap-1">
                            <Landmark className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{tx.bankName || "Ngân hàng"}</span>
                          </span>

                          {tx.transactionCode && (
                            <span className="hidden sm:inline-block text-[11px] font-mono text-muted-foreground truncate max-w-30">
                              #{tx.transactionCode}
                            </span>
                          )}

                          <span className="text-[11px] sm:text-xs text-muted-foreground shrink-0">
                            • {new Date(tx.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}{" "}
                            {new Date(tx.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                          </span>
                        </div>

                        {/* Rút gọn nội dung thông báo thông minh */}
                        <p
                          className="text-xs sm:text-sm font-semibold text-foreground/90 line-clamp-1 leading-snug break-all sm:break-normal"
                          title={tx.content || ""}
                        >
                          {cleanBankContent(tx.content) || (isExpense ? "Chuyển tiền ngân hàng" : "Nhận tiền ngân hàng")}
                        </p>

                        <div className="flex items-center gap-2 pt-0.5">
                          {isPending && (
                            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Chờ duyệt
                            </span>
                          )}
                          {isApproved && (
                            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Đã tạo hóa đơn
                            </span>
                          )}
                          {isIgnored && (
                            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                              Đã bỏ qua
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right / Bottom: Amount & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 shrink-0">
                      <div className="text-left sm:text-right">
                        <div
                          className={`text-base sm:text-lg font-black tracking-tight ${
                            isExpense
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {isExpense ? "-" : "+"}
                          {tx.amount.toLocaleString("vi-VN")} đ
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isPending && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => openQuickProcess(tx)}
                              className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer ${
                                isExpense
                                  ? "bg-rose-500 hover:bg-rose-600"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              {isExpense ? "Tạo Hóa Đơn" : "Xác Nhận Thu"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleIgnore(tx.id)}
                              className="h-8 sm:h-9 w-8 sm:w-9 p-0 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                              title="Bỏ qua"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setItemToDelete(tx)}
                          className="h-8 sm:h-9 w-8 sm:w-9 p-0 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CÀI ĐẶT WEBHOOK & HƯỚNG DẪN KẾT NỐI (SETTINGS) */}
      {activeTab === "SETTINGS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột 1: Thông tin Webhook URL & Secret */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="rounded-2xl border-border/80 p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Webhook Của Bạn</h3>
                  <p className="text-xs text-muted-foreground">Đường dẫn nhận biến động số dư</p>
                </div>
              </div>

              {/* Webhook URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Webhook URL Đầy Đủ
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEditingDomain(!isEditingDomain)}
                    className="text-[11px] text-primary font-semibold hover:underline"
                  >
                    {isEditingDomain ? "Đóng tùy chỉnh" : "Tùy chỉnh Domain / Ngrok"}
                  </button>
                </div>

                {isEditingDomain && (
                  <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60 space-y-1.5 animate-in fade-in-0">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Tên miền gốc (Base URL / Ngrok URL):
                    </label>
                    <Input
                      placeholder="VD: https://financeapp.manh.pics hoặc https://xxx.ngrok-free.app"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      💡 Mặc định hệ thống đã đặt domain chính thức của bạn là <strong>https://financeapp.manh.pics</strong>.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1.5 min-w-0">
                  <Input
                    readOnly
                    value={fullWebhookUrl}
                    className="font-mono text-xs bg-muted/60 min-w-0 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyToClipboard(fullWebhookUrl, true)}
                    className="shrink-0 rounded-xl"
                  >
                    {copiedUrl ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Dán URL này vào mục Webhook của <strong>SePay</strong>. Khi mở website trên server thật, URL sẽ tự động điền đúng tên miền của bạn.
                </p>
              </div>

              {/* Secret Token */}
              <div className="space-y-1.5 pt-2 border-t border-border/40 min-w-0">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Mã Secret Token Riêng
                </label>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Input
                    readOnly
                    type={showSecret ? "text" : "password"}
                    value={webhookSecret || "Đang tải..."}
                    className="font-mono text-xs bg-muted/60 min-w-0 flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecret(!showSecret)}
                    className="shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyToClipboard(webhookSecret, false)}
                    className="shrink-0 rounded-xl"
                  >
                    {copiedSecret ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={regenerating}
                  onClick={() => setIsRegenerateConfirmOpen(true)}
                  className="w-full text-xs font-bold rounded-xl mt-2 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${regenerating ? "animate-spin" : ""}`} />
                  Làm mới mã Secret Token
                </Button>
              </div>
            </Card>
          </div>

          {/* Cột 2 & 3: Hướng dẫn chi tiết A - Z kết nối SePay & Ngân Hàng */}
          <div className="lg:col-span-2 space-y-4">
            {/* SePay Detailed Guide Card */}
            <Card className="rounded-2xl border-border/80 p-5 sm:p-6 space-y-5 shadow-sm">
              <div className="flex items-start justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Landmark className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      Hướng Dẫn Kết Nối SePay Với Ngân Hàng & Phần Mềm
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hỗ trợ hơn 20+ ngân hàng: Vietcombank, MBBank, Techcombank, ACB, TPBank, VPBank, BIDV...
                    </p>
                  </div>
                </div>
                <a
                  href="https://sepay.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
                >
                  Mở sepay.vn <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Step by step */}
              <div className="space-y-3 text-xs min-w-0">
                {/* Bước 1 */}
                <div className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-muted/40 border border-border/50 min-w-0">
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-extrabold text-[11px] sm:text-xs">
                    1
                  </span>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">Đăng ký tài khoản SePay (Miễn Phí)</h4>
                    <p className="text-muted-foreground leading-relaxed wrap-break-word">
                      Truy cập{" "}
                      <a href="https://sepay.vn" target="_blank" className="font-bold text-primary underline">
                        sepay.vn
                      </a>{" "}
                      và đăng ký một tài khoản miễn phí (hỗ trợ đăng nhập nhanh bằng Google).
                    </p>
                  </div>
                </div>

                {/* Bước 2 */}
                <div className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-muted/40 border border-border/50 min-w-0">
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-extrabold text-[11px] sm:text-xs">
                    2
                  </span>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">Thêm Tài Khoản Ngân Hàng Trên SePay</h4>
                    <p className="text-muted-foreground leading-relaxed wrap-break-word">
                      Vào menu <strong>Tài khoản ngân hàng</strong> → Bấm <strong>Thêm tài khoản ngân hàng</strong> để liên kết (nếu bạn đã thêm tài khoản từ trước đó thì có thể bỏ qua bước này).
                    </p>
                  </div>
                </div>

                {/* Bước 3 */}
                <div className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-muted/40 border border-border/50 min-w-0">
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-extrabold text-[11px] sm:text-xs">
                    3
                  </span>
                  <div className="space-y-2 min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">Cấu Hình Webhook Trên SePay Để Bắn Về MyFinance</h4>
                    <p className="text-muted-foreground leading-relaxed wrap-break-word">
                      Trên giao diện SePay, vào mục <strong>Tích hợp Webhook</strong> → Bấm <strong>Thêm Webhook</strong> và điền:
                    </p>
                    <div className="p-2.5 sm:p-3 rounded-lg bg-card border border-border/80 space-y-1.5 text-[11px] font-medium min-w-0">
                      <p className="wrap-break-word">
                        • <strong>URL Webhook:</strong> Dán <strong>Webhook URL Đầy Đủ</strong> (đã sao chép ở ô bên cạnh/ở trên).
                      </p>
                      <p className="wrap-break-word">
                        • <strong>Tài khoản áp dụng:</strong> Chọn tài khoản ngân hàng của bạn (hoặc <em>Tất cả tài khoản</em>).
                      </p>
                      <p className="wrap-break-word">
                        • <strong>Sự kiện (Events):</strong> Chọn <strong>Tất cả giao dịch</strong> (để bắt cả tiền vào và tiền ra).
                      </p>
                      <p className="wrap-break-word">
                        • <strong>Kiểu dữ liệu:</strong> Chọn <strong>JSON</strong>.
                      </p>
                      <p className="wrap-break-word">
                        • <strong>Trạng thái:</strong> Bật <strong>Kích hoạt (Active)</strong>.
                      </p>
                    </div>
                    <p className="text-muted-foreground wrap-break-word">Sau đó bấm <strong>Lưu Webhook</strong> là hoàn tất kết nối!</p>
                  </div>
                </div>

                {/* Bước 4 */}
                <div className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 min-w-0">
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-extrabold text-[11px] sm:text-xs">
                    4
                  </span>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">Kiểm Tra Hoạt Động & Test Thật</h4>
                    <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed text-[11px] wrap-break-word">
                      Bạn có thể bấm nút <strong>"Gửi test"</strong> ngay trên danh sách Webhook của SePay để kiểm tra phản hồi thành công (Mã 200), hoặc thực hiện 1 giao dịch chuyển tiền thật nhỏ để trải nghiệm thông báo nổi tự động điền form trên MyFinance!
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Dialog xác nhận làm mới Secret Token */}
      <ConfirmDialog
        isOpen={isRegenerateConfirmOpen}
        onClose={() => setIsRegenerateConfirmOpen(false)}
        onConfirm={handleRegenerateSecret}
        title="Làm Mới Mã Secret Token?"
        description="Khi làm mới mã Secret Token, đường dẫn Webhook cũ sẽ bị vô hiệu hóa ngay lập tức. Bạn cần cập nhật lại Webhook URL mới trên SePay để tiếp tục nhận biến động số dư."
        confirmText="Làm mới Secret Token"
        variant="destructive"
        loading={regenerating}
      />

      {/* Dialog xác nhận xóa */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa Biến Động Số Dư?"
        description="Bạn có chắc chắn muốn xóa bản ghi biến động này khỏi danh sách? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận xóa"
        variant="destructive"
        loading={!!deletingId}
      />
    </div>
  );
}
