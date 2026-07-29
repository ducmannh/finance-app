import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Đăng ký | My Finance App",
  description: "Trang đăng ký tài khoản mới cho hệ thống quản lý tài chính",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
