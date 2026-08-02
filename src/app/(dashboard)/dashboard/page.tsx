import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export const metadata: Metadata = {
  title: "Tổng Quan | My Finance App",
  description: "Báo cáo thống kê tài chính và phân tích thu chi cá nhân",
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <AnalyticsDashboard userName={session.name} />;
}
