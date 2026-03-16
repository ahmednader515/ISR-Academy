import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getUsersByRole, getEnrollmentsWithCourseByUserId, getCoursesPublished } from "@/lib/db";
import { StudentsList } from "./StudentsList";
import { StaffAccountsSection } from "./StaffAccountsSection";

export default async function StudentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT_ADMIN") {
    redirect("/dashboard");
  }

  const isAdmin = session.user.role === "ADMIN";
  const isAssistant = session.user.role === "ASSISTANT_ADMIN";

  const [rows, coursesList] = await Promise.all([
    getUsersByRole("STUDENT"),
    getCoursesPublished(true),
  ]);

  let admins: Awaited<ReturnType<typeof getUsersByRole>> = [];
  let assistantAdmins: Awaited<ReturnType<typeof getUsersByRole>> = [];
  if (isAdmin) {
    [admins, assistantAdmins] = await Promise.all([
      getUsersByRole("ADMIN"),
      getUsersByRole("ASSISTANT_ADMIN"),
    ]);
  }

  const enrollmentsByUser = await Promise.all(rows.map((s) => getEnrollmentsWithCourseByUserId(s.id)));

  const students = rows.map((s, i) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    role: s.role,
    balance: Number(s.balance),
    student_number: s.student_number ?? null,
    guardian_number: s.guardian_number ?? null,
    _count: { enrollments: enrollmentsByUser[i].length },
    enrollments: enrollmentsByUser[i].map((e) => ({
      id: e.id,
      courseId: e.course_id,
      course: { id: e.course.id, title: e.course.title, titleAr: e.course.titleAr, slug: e.course.slug },
    })),
  }));

  const coursesPlain = coursesList.map((c) => {
    const row = c as unknown as Record<string, unknown>;
    return {
      id: String(row.id ?? ""),
      title: String(row.title ?? ""),
      titleAr: (row.titleAr != null ? String(row.titleAr) : null) as string | null,
      slug: String(row.slug ?? ""),
    };
  });

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-[var(--color-foreground)]">
        {isAdmin ? "الطلاب والحسابات" : "قائمة الطلاب"}
      </h2>
      {isAdmin && (
        <StaffAccountsSection
          admins={admins.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }))}
          assistantAdmins={assistantAdmins.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }))}
        />
      )}
      <div className={isAdmin ? "mt-8" : ""}>
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">
          قائمة الطلاب
        </h3>
        <StudentsList
          students={students}
          courses={coursesPlain}
          isAdmin={isAdmin}
          canAddBalance={isAdmin || isAssistant}
          canManageEnrollments={isAdmin}
          canEditFullProfile={isAdmin}
        />
      </div>
    </div>
  );
}
