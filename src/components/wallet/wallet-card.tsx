"use client";

import { useState } from "react";
import { WalletData } from "@/actions/wallet";
import { EditWalletDialog } from "@/components/wallet/edit-wallet-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  CreditCard,
  PiggyBank,
  Coins,
  Landmark,
  Banknote,
  Vault,
  Settings2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

interface WalletCardProps {
  wallet: WalletData;
  onRefresh?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wallet,
  CreditCard,
  PiggyBank,
  Coins,
  Landmark,
  Banknote,
  Vault,
};

export function WalletCard({ wallet, onRefresh }: WalletCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const IconComponent = ICON_MAP[wallet.icon] || Wallet;

  const formattedBalance = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(wallet.balance || 0);

  return (
    <>
      <Card
        className="relative overflow-hidden border border-border/60 shadow-xl transition-all duration-300 hover:shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${wallet.color}15 0%, ${wallet.color}05 100%)`,
        }}
      >
        {/* Accent Top Border Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: wallet.color }}
        />

        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-3.5 rounded-2xl text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: wallet.color }}
              >
                <IconComponent className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Ví chính của bạn
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">{wallet.name}</h3>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="gap-2 font-medium border-border/80 hover:bg-background/80"
            >
              <Settings2 className="h-4 w-4" /> Cấu hình ví
            </Button>
          </div>

          {/* Balance Display */}
          <div className="p-6 rounded-2xl bg-card/80 border border-border/40 backdrop-blur-sm space-y-1 shadow-inner">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Số dư hiện tại (VND)
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
              {formattedBalance}
            </p>
          </div>
        </CardContent>
      </Card>

      <EditWalletDialog
        wallet={wallet}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}
