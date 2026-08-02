"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export type PeriodFilter =
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_YEAR"
  | "ALL"
  | "SPECIFIC_MONTH"
  | "CUSTOM_RANGE";

export interface AnalyticsFilterParams {
  period: PeriodFilter;
  selectedMonth?: string; // Định dạng "YYYY-MM" (VD: "2026-08")
  startDate?: string;     // Định dạng "YYYY-MM-DD"
  endDate?: string;       // Định dạng "YYYY-MM-DD"
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  type: "INCOME" | "EXPENSE";
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface TimeSeriesPoint {
  label: string;
  dateStr: string;
  income: number;
  expense: number;
}

export interface AnalyticsSummary {
  period: PeriodFilter;
  selectedMonth?: string;
  startDate?: string;
  endDate?: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  walletBalance: number;
  totalTransactionsCount: number;
  categoryExpenses: CategoryBreakdownItem[];
  categoryIncomes: CategoryBreakdownItem[];
  timeSeries: TimeSeriesPoint[];
}

export async function getAnalyticsSummaryAction(
  params: AnalyticsFilterParams = { period: "THIS_MONTH" }
): Promise<{
  success: boolean;
  data?: AnalyticsSummary;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại." };
    }

    if (!prisma.transaction || !prisma.wallet) {
      return { success: false, error: "Cơ sở dữ liệu chưa được đồng bộ." };
    }

    // 1. Lấy thông tin Ví chính để biết số dư hiện tại
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
      select: { balance: true },
    });

    const walletBalance = wallet?.balance ?? 0;

    // 2. Xác định khoảng thời gian lọc (StartDate, EndDate)
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    const { period, selectedMonth, startDate: customStart, endDate: customEnd } = params;

    if (period === "THIS_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === "LAST_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (period === "THIS_YEAR") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (period === "SPECIFIC_MONTH" && selectedMonth) {
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      if (!isNaN(year) && !isNaN(month)) {
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
      }
    } else if (period === "CUSTOM_RANGE") {
      if (customStart) {
        startDate = new Date(customStart + "T00:00:00");
      }
      if (customEnd) {
        endDate = new Date(customEnd + "T23:59:59.999");
      }
    }

    const whereCondition: any = {
      userId: session.userId,
    };

    if (startDate || endDate) {
      whereCondition.date = {};
      if (startDate) whereCondition.date.gte = startDate;
      if (endDate) whereCondition.date.lte = endDate;
    }

    // 3. Lấy tất cả giao dịch thuộc khoảng thời gian
    const transactions = await prisma.transaction.findMany({
      where: whereCondition,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    const expenseCategoryMap: Record<string, CategoryBreakdownItem> = {};
    const incomeCategoryMap: Record<string, CategoryBreakdownItem> = {};

    transactions.forEach((t) => {
      const isIncome = t.type === "INCOME";
      if (isIncome) {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }

      const targetMap = isIncome ? incomeCategoryMap : expenseCategoryMap;
      const catId = t.categoryId;

      if (!targetMap[catId]) {
        targetMap[catId] = {
          categoryId: catId,
          categoryName: t.category.name,
          icon: t.category.icon,
          color: t.category.color,
          type: t.type,
          totalAmount: 0,
          percentage: 0,
          transactionCount: 0,
        };
      }

      targetMap[catId].totalAmount += t.amount;
      targetMap[catId].transactionCount += 1;
    });

    // Tính phần trăm cho danh mục
    const categoryExpenses = Object.values(expenseCategoryMap)
      .map((item) => ({
        ...item,
        percentage: totalExpense > 0 ? Number(((item.totalAmount / totalExpense) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    const categoryIncomes = Object.values(incomeCategoryMap)
      .map((item) => ({
        ...item,
        percentage: totalIncome > 0 ? Number(((item.totalAmount / totalIncome) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // 4. Tạo dữ liệu chuỗi thời gian (TimeSeries) cho biểu đồ
    const timeSeriesMap: Record<string, { income: number; expense: number; label: string }> = {};

    if (period === "THIS_YEAR") {
      for (let m = 0; m < 12; m++) {
        const monthKey = `${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`;
        const label = `T${m + 1}`;
        timeSeriesMap[monthKey] = { income: 0, expense: 0, label };
      }

      transactions.forEach((t) => {
        const d = new Date(t.date);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (timeSeriesMap[monthKey]) {
          if (t.type === "INCOME") timeSeriesMap[monthKey].income += t.amount;
          else timeSeriesMap[monthKey].expense += t.amount;
        }
      });
    } else if (period === "SPECIFIC_MONTH" && startDate && endDate) {
      const daysInMonth = endDate.getDate();
      const [yStr, mStr] = (selectedMonth || "").split("-");
      for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = `${yStr}-${mStr}-${String(day).padStart(2, "0")}`;
        const label = `${String(day).padStart(2, "0")}/${mStr}`;
        timeSeriesMap[dayKey] = { income: 0, expense: 0, label };
      }

      const getLocalDateKey = (d: Date) => {
        const year = d.getFullYear();
        const month = `${d.getMonth() + 1}`.padStart(2, "0");
        const day = `${d.getDate()}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      transactions.forEach((t) => {
        const d = new Date(t.date);
        const dayKey = getLocalDateKey(d);
        if (timeSeriesMap[dayKey]) {
          if (t.type === "INCOME") timeSeriesMap[dayKey].income += t.amount;
          else timeSeriesMap[dayKey].expense += t.amount;
        }
      });
    } else {
      // Nhóm theo ngày
      const getLocalDateKey = (d: Date) => {
        const year = d.getFullYear();
        const month = `${d.getMonth() + 1}`.padStart(2, "0");
        const day = `${d.getDate()}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      transactions.forEach((t) => {
        const d = new Date(t.date);
        const dateKey = getLocalDateKey(d);
        const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

        if (!timeSeriesMap[dateKey]) {
          timeSeriesMap[dateKey] = { income: 0, expense: 0, label };
        }

        if (t.type === "INCOME") timeSeriesMap[dateKey].income += t.amount;
        else timeSeriesMap[dateKey].expense += t.amount;
      });
    }

    const timeSeries: TimeSeriesPoint[] = Object.entries(timeSeriesMap).map(([dateStr, val]) => ({
      dateStr,
      label: val.label,
      income: val.income,
      expense: val.expense,
    }));

    return {
      success: true,
      data: {
        period,
        selectedMonth,
        startDate: customStart,
        endDate: customEnd,
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        walletBalance,
        totalTransactionsCount: transactions.length,
        categoryExpenses,
        categoryIncomes,
        timeSeries,
      },
    };
  } catch (error) {
    console.error("Get Analytics Summary Error:", error);
    return { success: false, error: "Lỗi hệ thống khi lấy báo cáo thống kê." };
  }
}
