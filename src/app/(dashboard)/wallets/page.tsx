import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWalletAction } from "@/actions/wallet";
import { WalletCard } from "@/components/wallet/wallet-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Ví cá nhân | My Finance App",
  description: "Quản lý số dư Ví cá nhân chính",
};

export default async function WalletsPage() {
  const result = await getWalletAction();

  if (!result.success || !result.wallet) {
    redirect("/login");
  }

  const { wallet } = result;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border/40 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Wallet className="h-8 w-8 text-primary" /> Quản Lý Ví Cá Nhân
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi và điều chỉnh số dư tài chính cá nhân của bạn (Đơn vị tính: <strong>VND</strong>).
        </p>
      </div>

      {/* Main Wallet Card */}
      <WalletCard wallet={wallet} />

      {/* Info / Note Card */}
      <Card className="border-border/60 bg-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-base">
            <Info className="h-5 w-5" /> Hướng dẫn quản lý số dư
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <p>
            • Tất cả các giao dịch Thu nhập và Chi tiêu sau này của bạn sẽ trực tiếp cộng hoặc trừ số dư vào <strong>{wallet.name}</strong> này.
          </p>
          <p>
            • Bạn có thể nhấn vào nút <strong>"Cấu hình ví"</strong> ở trên để cập nhật số dư ban đầu thực tế, đổi tên ví hoặc màu sắc đại diện bất cứ lúc nào.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
