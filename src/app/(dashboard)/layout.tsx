import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col overflow-hidden selection:bg-primary/20">
      {/* Background Decorative Glowing Ambient Orbs & Patterns */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Orb 1: Top-Left Vivid Indigo/Violet Glow */}
        <div className="absolute -top-32 -left-32 h-110 w-110 rounded-full bg-indigo-500/25 dark:bg-indigo-500/35 blur-[70px] animate-pulse-glow" />

        {/* Orb 2: Top-Right Vivid Emerald/Teal Glow */}
        <div className="absolute top-16 -right-32 h-110 w-110 rounded-full bg-emerald-500/25 dark:bg-emerald-500/35 blur-[70px] animate-float-delayed" />

        {/* Orb 3: Center-Bottom Vivid Purple Glow */}
        <div className="absolute bottom-10 -left-32 h-120 w-120 rounded-full bg-purple-500/25 dark:bg-purple-500/35 blur-[80px] animate-float" />

        {/* Crisp Line & Dot Grid Pattern Layer */}
        <div className="absolute inset-0 bg-dot-grid opacity-80 dark:opacity-60" />
      </div>

      <Navbar userName={session.name} />
      <main className="relative z-10 flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
