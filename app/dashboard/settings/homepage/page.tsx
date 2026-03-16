import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { HomepageSettingsForm } from "./HomepageSettingsForm";
import { getHomepageSettings } from "@/lib/db";

export default async function DashboardHomepageSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const settings = await getHomepageSettings();

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-foreground)]">
        إعدادات الصفحة الرئيسية
      </h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        غيّر صورة المدرس والعنوان والشعار واسم المنصة الظاهر في أعلى الموقع وفي الصفحة الرئيسية.
      </p>
      <HomepageSettingsForm initialSettings={settings} />
    </div>
  );
}
