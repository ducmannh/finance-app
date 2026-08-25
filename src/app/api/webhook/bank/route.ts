import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Universal Bank Webhook Endpoint
 * Hỗ trợ SePay, Casso, và Generic Android Notification Forwarder
 * POST /api/webhook/bank?secret=wh_sec_...
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const secretQuery = url.searchParams.get("secret") || url.searchParams.get("token") || url.searchParams.get("key");
    const authHeader = req.headers.get("authorization");
    const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
    const xSecretKey = req.headers.get("x-secret-key") || req.headers.get("secure-token");

    const secret = secretQuery || bearerSecret || xSecretKey;

    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã xác thực Webhook Secret (?secret=... hoặc Header Authorization)." },
        { status: 401 }
      );
    }

    // Tìm user sở hữu webhookSecret này
    const user = await prisma.user.findFirst({
      where: { webhookSecret: secret },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Mã Webhook Secret không hợp lệ hoặc không tồn tại." },
        { status: 401 }
      );
    }

    // Đọc body payload
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Payload JSON không hợp lệ." }, { status: 400 });
    }

    // 1. Phân tích định dạng Casso
    if (Array.isArray(body.data) && body.data.length > 0) {
      const records = [];
      for (const item of body.data) {
        const rawAmount = Math.abs(Number(item.amount) || 0);
        const type = Number(item.amount) >= 0 ? "INCOME" : "EXPENSE";
        const content = item.description || item.corresponsiveName || "Biến động số dư Casso";
        const bankName = item.bankName || "Ngân hàng";
        const bankAccount = item.bank_sub_acc_id || item.accountNumber || null;
        const transactionCode = item.tid ? String(item.tid) : null;

        if (rawAmount > 0) {
          const created = await prisma.pendingTransaction.create({
            data: {
              userId: user.id,
              amount: rawAmount,
              type,
              bankName,
              bankAccount,
              transactionCode,
              content,
              status: "PENDING",
            },
          });
          records.push(created.id);
        }
      }
      return NextResponse.json({
        success: true,
        message: `Đã ghi nhận ${records.length} giao dịch từ Casso.`,
        createdIds: records,
      });
    }

    // 2. Phân tích định dạng SePay hoặc Generic
    let amount = 0;
    let type: "INCOME" | "EXPENSE" = "EXPENSE";
    let bankName = body.gateway || body.bankName || body.bank || "Ngân hàng";
    let bankAccount = body.accountNumber || body.bankAccount || body.subAccount || null;
    let content = body.content || body.description || body.message || body.body || "";
    let transactionCode = body.referenceCode || body.code || body.id || `TX${Date.now().toString().slice(-6)}`;

    // Xử lý loại giao dịch SePay (transferType: "in" / "out")
    if (body.transferType) {
      if (body.transferType.toLowerCase() === "in") {
        type = "INCOME";
        amount = Number(body.transferAmount || body.amountIn || body.amount) || 0;
      } else {
        type = "EXPENSE";
        amount = Number(body.transferAmount || body.amountOut || body.amount) || 0;
      }
    } else if (body.amountIn && Number(body.amountIn) > 0) {
      type = "INCOME";
      amount = Number(body.amountIn);
    } else if (body.amountOut && Number(body.amountOut) > 0) {
      type = "EXPENSE";
      amount = Number(body.amountOut);
    } else if (body.type) {
      const rawType = String(body.type).toUpperCase();
      type = rawType === "INCOME" || rawType === "IN" || rawType === "+" ? "INCOME" : "EXPENSE";
      amount = Math.abs(Number(body.amount) || 0);
    } else if (body.amount !== undefined) {
      const num = Number(body.amount);
      if (num < 0) {
        type = "EXPENSE";
        amount = Math.abs(num);
      } else {
        type = "INCOME";
        amount = num;
      }
    }

    // Nếu không có số tiền trực tiếp, thử trích xuất từ nội dung thông báo (SMS / Push Notification text)
    if (amount <= 0 && content) {
      // Regex trích xuất số tiền từ text dạng: "TK ... -50,000VND" hoặc "+1,200,000 đ" hoặc "tang 50.000VND"
      const match = content.match(/([+-]?\s*[\d\.,]+)\s*(?:VND|đ|d|dong)/i);
      if (match && match[1]) {
        const cleanNumber = match[1].replace(/[^\d]/g, "");
        amount = Number(cleanNumber) || 0;
        if (content.includes("-") || content.toLowerCase().includes("giam") || content.toLowerCase().includes("tru")) {
          type = "EXPENSE";
        } else if (content.includes("+") || content.toLowerCase().includes("tang") || content.toLowerCase().includes("cong")) {
          type = "INCOME";
        }
      }
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Không xác định được số tiền hợp lệ trong payload." },
        { status: 422 }
      );
    }

    // Lưu vào PendingTransaction
    const pendingTx = await prisma.pendingTransaction.create({
      data: {
        userId: user.id,
        amount,
        type,
        bankName,
        bankAccount,
        transactionCode: String(transactionCode),
        content: content || (type === "INCOME" ? "Nhận tiền ngân hàng" : "Chuyển tiền ngân hàng"),
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ghi nhận biến động số dư thành công.",
      pendingTransaction: {
        id: pendingTx.id,
        amount: pendingTx.amount,
        type: pendingTx.type,
        bankName: pendingTx.bankName,
        content: pendingTx.content,
      },
    });
  } catch (error) {
    console.error("Bank Webhook Error:", error);
    return NextResponse.json({ success: false, error: "Lỗi nội bộ máy chủ khi xử lý Webhook." }, { status: 500 });
  }
}
