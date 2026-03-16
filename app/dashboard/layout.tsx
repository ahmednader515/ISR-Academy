import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";
  const isAssistant = session.user.role === "ASSISTANT_ADMIN";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          لوحة التحكم
        </h1>
        <nav className="flex flex-wrap items-center gap-2">
          <DashboardNav isAdmin={isAdmin} isAssistant={isAssistant} />
        </nav>
      </div>
      {children}
    </div>
  );
}
