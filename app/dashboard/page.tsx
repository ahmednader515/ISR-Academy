import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getUserById, getAccessibleCoursesForUser, countUsersByRole, countCourses, getAllQuizAttemptsForAdmin, getTotalPlatformEarnings } from "@/lib/db";
import { MyCoursesSection } from "./MyCoursesSection";
import { ActivateCodeSection } from "./ActivateCodeSection";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";
  const isAssistant = session.user.role === "ASSISTANT_ADMIN";
  const isStudent = session.user.role === "STUDENT";

  if (isStudent) {
    const user = await getUserById(session.user.id);
    const enrolledCourses = user ? await getAccessibleCoursesForUser(session.user.id) : [];
    const balance = user ? Number(user.balance) : 0;

    return (
      <div className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              مرحباً، {session.user.name}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-[var(--color-muted)]">رصيدك الحالي:</span>
                <span className="text-2xl font-bold text-[var(--color-primary)]">
                  {Number(balance).toFixed(2)} ج.م
                </span>
              </div>
              <Link
                href="/dashboard/add-balance"
                className="rounded-[var(--radius-btn)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)]"
              >
                إضافة رصيد
              </Link>
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">
              الكورسات المتاحة
            </h2>
            <p className="mb-4 text-sm text-[var(--color-muted)]">
              تصفح جميع الدورات وسجّل في ما يناسبك
            </p>
            <Link
              href="/courses"
              className="inline-flex rounded-[var(--radius-btn)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              عرض الكورسات
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <ActivateCodeSection />
          <Link
            href="/dashboard/messages"
            className="flex flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] text-center transition hover:border-[var(--color-primary)]/30"
          >
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">الرسائل الواردة</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              عرض الرسائل والمحادثات من الإدارة أو المدرس
            </p>
            <span className="mt-4 inline-flex w-fit rounded-[var(--radius-btn)] bg-[var(--color-primary)] px-5 py-2.5 text-base font-medium text-white transition hover:bg-[var(--color-primary-hover)]">
              فتح الرسائل
            </span>
          </Link>
        </div>

        <MyCoursesSection courses={enrolledCourses} />
      </div>
    );
  }

  // أدمن أو مساعد أدمن
  const [studentsCount, coursesCount, quizAttempts, totalEarnings] = await Promise.all([
    countUsersByRole("STUDENT"),
    countCourses(),
    getAllQuizAttemptsForAdmin().catch(() => []),
    getTotalPlatformEarnings(),
  ]);

  return (
    <div className="space-y-8">
      {/* قسم: كورسات المنصة */}
      {(isAdmin || isAssistant) && (
        <>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">كورسات المنصة</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {isAdmin && (
                <Link
                  href="/dashboard/courses"
                  className="flex min-h-[200px] flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center transition hover:border-[var(--color-primary)]/30"
                >
                  <h3 className="font-semibold text-[var(--color-foreground)]">إدارة الكورسات</h3>
                  <p className="mt-1 text-3xl font-bold text-[var(--color-primary)]">{coursesCount}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">تعديل أو حذف الدورات · إنشاء دورة جديدة</p>
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/dashboard/courses/new"
                  className="flex min-h-[200px] flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center transition hover:border-[var(--color-primary)]/30"
                >
                  <h3 className="font-semibold text-[var(--color-foreground)]">إنشاء كورس</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">إضافة دورة جديدة بالمحتوى والحصص والاختبارات</p>
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/dashboard/live-streams"
                  className="flex min-h-[200px] flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center transition hover:border-[var(--color-primary)]/30"
                >
                  <h3 className="font-semibold text-[var(--color-foreground)]">البثوث المباشرة</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">إضافة بث عبر Zoom أو Google Meet وربطه بكورس على المنصة</p>
                </Link>
              )}
              <Link
                href="/dashboard/codes"
                className="flex min-h-[200px] flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center transition hover:border-[var(--color-primary)]/30"
              >
                <h3 className="font-semibold text-[var(--color-foreground)]">إنشاء الأكواد</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">إنشاء أكواد تفعيل مجانية لدورة وتوزيعها على الطلاب</p>
              </Link>
            </div>
          </div>
          <hr className="border-[var(--color-border)]" />
        </>
      )}

      {/* قسم: إدارة الطلاب */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">إدارة الطلاب</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/students"
            className="flex min-h-[200px] flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center transition hover:border-[var(--color-primary)]/30"
          >
            <h3 className="font-semibold text-[var(--color-foreground)]">{isAdmin ? "الطلاب والحسابات" : "الطلاب"}</h3>
            <p className="mt-1 text-3xl font-bold text-[var(--color-primary)]">{studentsCount}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">إدارة الطلاب، تعديل الحسابات، إضافة الأرصدة</p>
          </Link>
          <Link
            href="/dashboard/statistics"
            className="flex min-h-[200px] flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center transition hover:border-[var(--color-primary)]/30"
          >
            <h3 className="font-semibold text-[var(--color-foreground)]">إحصائيات الطلاب</h3>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="text-2xl font-bold text-[var(--color-primary)]">{totalEarnings.toFixed(2)}</span>
              <span className="text-sm text-[var(--color-muted)]">ج.م أرباح</span>
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">عرض التفاصيل والدرجات وإجمالي الأرباح</p>
          </Link>
          {(isAdmin || isAssistant) && (
            <>
              <Link
                href="/dashboard/homework"
                className="flex min-h-[200px] flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center transition hover:border-[var(--color-primary)]/30"
              >
                <h3 className="font-semibold text-[var(--color-foreground)]">استلام واجبات الطلاب</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">عرض تسليمات الواجبات والبحث باسم الطالب</p>
              </Link>
              <Link
                href="/dashboard/messages"
                className="flex min-h-[200px] flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center transition hover:border-[var(--color-primary)]/30"
              >
                <h3 className="font-semibold text-[var(--color-foreground)]">تواصل خاص مع الطلبة</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">محادثة مع طالب، إرسال رسائل أو صور أو ملفات</p>
              </Link>
            </>
          )}
        </div>
      </div>

      {(isAdmin || isAssistant) && (
        <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            يمكنك إضافة رصيد لحسابات الطلاب وتعديل أسمائهم وكلمات المرور من صفحة{" "}
            <Link href="/dashboard/students" className="font-medium underline">
              الطلاب
            </Link>
            .
          </p>
        </div>
      )}

      {/* قسم: تعديل تصميم المنصة */}
      {isAdmin && (
        <>
          <hr className="border-[var(--color-border)]" />
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">تعديل تصميم المنصة</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <Link
                href="/dashboard/settings/homepage"
                className="flex min-h-[200px] flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center transition hover:border-[var(--color-primary)]/30"
              >
                <h3 className="font-semibold text-[var(--color-foreground)]">إعدادات الصفحة الرئيسية</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">صورة المدرس واسم المنصة والعنوان والشعار</p>
              </Link>
              <Link
                href="/dashboard/reviews"
                className="flex min-h-[200px] flex-col justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center transition hover:border-[var(--color-primary)]/30"
              >
                <h3 className="font-semibold text-[var(--color-foreground)]">تعليقات الطلاب</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">إدارة تعليقات الطلاب المعروضة في الصفحة الرئيسية (إضافة / تعديل / حذف)</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
