import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserProfileAction } from "@/actions/profile";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, KeyRound, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | My Finance App",
  description: "Quản lý thông tin cá nhân và đổi mật khẩu tài khoản",
};

export default async function ProfilePage() {
  const result = await getUserProfileAction();

  if (!result.success || !result.user) {
    redirect("/login");
  }

  const { user } = result;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="h-8 w-8 text-primary" /> Quản Lý Hồ Sơ Cá Nhân
        </h1>
        <p className="text-muted-foreground mt-1">
          Cập nhật thông tin cá nhân và đổi mật khẩu cho tài khoản của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form 1: Cập nhật thông tin cá nhân */}
        <Card className="border-border/60 shadow-md">
          <CardHeader className="bg-muted/30 rounded-t-xl border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
                <CardDescription>Thay đổi Họ tên, Tên đăng nhập và Email</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ProfileForm initialUser={user} />
          </CardContent>
        </Card>

        {/* Form 2: Đổi mật khẩu */}
        <Card className="border-border/60 shadow-md">
          <CardHeader className="bg-muted/30 rounded-t-xl border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Đổi mật khẩu</CardTitle>
                <CardDescription>Cập nhật mật khẩu bảo mật mới cho tài khoản</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
