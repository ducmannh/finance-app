"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";

import { registerSchema, RegisterInput } from "@/schemas/auth";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await registerAction(data);
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setServerError(result.error || "Đăng ký tài khoản thất bại");
      }
    } catch (err) {
      console.error(err);
      setServerError("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all rounded-3xl overflow-hidden">
      <CardHeader className="space-y-1.5 text-center bg-slate-900/40 border-b border-white/5 pb-6 pt-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Đăng ký tài khoản
        </CardTitle>
        <CardDescription className="text-slate-400">
          Tạo tài khoản mới để bắt đầu quản lý tài chính của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {serverError && (
          <div className="mb-4 rounded-xl bg-rose-500/15 p-3 text-sm font-medium text-rose-400 border border-rose-500/20 animate-in fade-in-50">
            {serverError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 font-medium">Họ và tên</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Nguyễn Văn A"
                        type="text"
                        className="pl-10 h-11 bg-slate-950/60 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500/50 rounded-xl"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-400" />
                </FormItem>
              )}
            />

            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 font-medium">Tên đăng nhập</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AtSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="nguyenvana"
                        type="text"
                        className="pl-10 h-11 bg-slate-950/60 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500/50 rounded-xl"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-400" />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 font-medium">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="ten@example.com"
                        type="email"
                        className="pl-10 h-11 bg-slate-950/60 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500/50 rounded-xl"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-400" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 font-medium">Mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-11 bg-slate-950/60 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500/50 rounded-xl"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-400" />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 font-medium">Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="••••••••"
                        type={showConfirmPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-11 bg-slate-950/60 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500/50 rounded-xl"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-400" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 border-0 rounded-xl transition-all active:scale-[0.99]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                "Đăng ký"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/5 pt-4 pb-6">
        <p className="text-sm text-slate-400">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-all"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
