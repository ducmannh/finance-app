import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, ShieldCheck, Mail, User as UserIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | My Finance App",
  description: "Trang tổng quan hệ thống quản lý tài chính",
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" /> Trang Quản Lý Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Bạn đã đăng nhập thành công vào hệ thống.
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Profile Card */}
        <Card className="border-border/60 shadow-lg">
          <CardHeader className="bg-muted/40 rounded-t-xl border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Thông tin Tài khoản</CardTitle>
                <CardDescription>Chi tiết phiên làm việc đang hoạt động của bạn</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/50">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Họ và tên</p>
                  <p className="text-base font-semibold text-foreground">{session.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Địa chỉ Email</p>
                  <p className="text-base font-semibold text-foreground">{session.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
