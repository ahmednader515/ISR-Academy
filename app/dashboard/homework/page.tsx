import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { HomeworkSubmissionsList } from "./HomeworkSubmissionsList";

export default async function DashboardHomeworkPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT_ADMIN") redirect("/dashboard");

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-foreground)]">
        استلام واجبات الطلاب
      </h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        عرض تسليمات الواجبات من الطلاب حسب الدورة واسم الطالب. يمكنك البحث باسم الطالب لتصفية النتائج.
      </p>
      <HomeworkSubmissionsList />
    </div>
  );
}
