import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCoursesAll } from "@/lib/db";
import { CodesManage } from "./CodesManage";

export default async function DashboardCodesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT_ADMIN") redirect("/dashboard");

  const courses = await getCoursesAll();
  const courseOptions = courses.map((c) => ({
    id: c.id,
    title: (c as { title_ar?: string; title: string }).title_ar ?? (c as { title: string }).title,
  }));

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-foreground)]">
        إنشاء الأكواد
      </h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        إنشاء أكواد تفعيل مجانية لدورة معيّنة وتوزيعها على الطلاب. يمكنك نسخ كل الأكواد مرة واحدة، التمييز بين القديم والجديد، وحذف الأكواد نهائياً.
      </p>
      <CodesManage courseOptions={courseOptions} />
    </div>
  );
}
