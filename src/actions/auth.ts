"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie, destroySessionCookie } from "@/lib/auth";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/schemas/auth";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action: Xử lý Đăng ký tài khoản
 */
export async function registerAction(data: RegisterInput): Promise<ActionResult> {
  // 1. Validate dữ liệu đầu vào
  const validation = registerSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Dữ liệu đăng ký không hợp lệ",
    };
  }

  const { name, email, password } = validation.data;

  try {
    // 2. Kiểm tra email tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email này đã được sử dụng. Vui lòng chọn Email khác.",
      };
    }

    // 3. Hash mật khẩu bằng bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Tạo User mới trong Database
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // 5. Tạo Session Token và lưu vào Cookie
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    await setSessionCookie(token);

    return { success: true };
  } catch (error) {
    console.error("Register Error:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại sau.",
    };
  }
}

/**
 * Server Action: Xử lý Đăng nhập
 */
export async function loginAction(data: LoginInput): Promise<ActionResult> {
  // 1. Validate dữ liệu đầu vào
  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Dữ liệu đăng nhập không hợp lệ",
    };
  }

  const { email, password } = validation.data;

  try {
    // 2. Tìm User trong Database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return {
        success: false,
        error: "Email hoặc mật khẩu không chính xác.",
      };
    }

    // 3. So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Email hoặc mật khẩu không chính xác.",
      };
    }

    // 4. Tạo Session Token và lưu vào Cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    await setSessionCookie(token);

    return { success: true };
  } catch (error) {
    console.error("Login Error:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.",
    };
  }
}

/**
 * Server Action: Xử lý Đăng xuất
 */
export async function logoutAction(): Promise<void> {
  await destroySessionCookie();
  redirect("/login");
}
