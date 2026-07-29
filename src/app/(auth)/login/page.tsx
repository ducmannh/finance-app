import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập | My Finance App",
  description: "Trang đăng nhập hệ thống quản lý tài chính",
};

export default function LoginPage() {
  return <LoginForm />;
}
