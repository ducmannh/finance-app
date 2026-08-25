import { Metadata } from "next";
import { getPendingTransactionsAction } from "@/actions/pending-transaction";
import { BankSyncManager } from "@/components/bank-sync/bank-sync-manager";

export const metadata: Metadata = {
  title: "Biến Động Số Dư Ngân Hàng | MyFinance",
  description: "Tự động nhận diện giao dịch ngân hàng và tạo hóa đơn 1-chạm.",
};

export default async function BankSyncPage() {
  const res = await getPendingTransactionsAction("PENDING");

  return (
    <BankSyncManager
      initialTransactions={res.transactions || []}
      initialPendingCount={res.pendingCount || 0}
    />
  );
}
