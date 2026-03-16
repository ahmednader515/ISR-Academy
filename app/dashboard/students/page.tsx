import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getUsersByRole, getEnrollmentsWithCourseByUserId, getCoursesPublished, getResearcherProfileByUserId } from "@/lib/db";
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

  const [enrollmentsByUser, profileResults] = await Promise.all([
    Promise.all(rows.map((s) => getEnrollmentsWithCourseByUserId(s.id))),
    Promise.all(
      rows.map((s) =>
        getResearcherProfileByUserId(s.id).catch(() => null)
      )
    ),
  ]);
  const profiles = profileResults;

  const toDateString = (v: unknown): string | null => {
    if (v == null) return null;
    if (typeof v === "string") return v;
    if (v instanceof Date) return v.toISOString().split("T")[0];
    return String(v);
  };

  const toStr = (v: unknown): string | null => (v == null ? null : typeof v === "string" ? v : String(v));

  type SerializableProfile = {
    nameAr: string | null;
    nameEn: string | null;
    nationality: string | null;
    dateOfBirth: string | null;
    nationalId: string | null;
    academicDegree: string | null;
    whatsappPhone: string | null;
    otherPhone: string | null;
    professionalDegree: string | null;
    department: string | null;
    researchTitle: string | null;
    specialization: string | null;
    thesisSupervisor: string | null;
    currentJobTitle: string | null;
    employer: string | null;
    formSignedAt: string | null;
  };

  const students = rows.map((s, i) => {
    const profile = profiles[i];
    const p = profile as Record<string, unknown> | null;
    const serializableProfile: SerializableProfile | null = p
      ? {
          nameAr: toStr(p.nameAr ?? p.name_ar),
          nameEn: toStr(p.nameEn ?? p.name_en),
          nationality: toStr(p.nationality),
          dateOfBirth: toDateString(p.dateOfBirth ?? p.date_of_birth),
          nationalId: toStr(p.nationalId ?? p.national_id),
          academicDegree: toStr(p.academicDegree ?? p.academic_degree),
          whatsappPhone: toStr(p.whatsappPhone ?? p.whatsapp_phone),
          otherPhone: toStr(p.otherPhone ?? p.other_phone),
          professionalDegree: toStr(p.professionalDegree ?? p.professional_degree),
          department: toStr(p.department),
          researchTitle: toStr(p.researchTitle ?? p.research_title),
          specialization: toStr(p.specialization),
          thesisSupervisor: toStr(p.thesisSupervisor ?? p.thesis_supervisor),
          currentJobTitle: toStr(p.currentJobTitle ?? p.current_job_title),
          employer: toStr(p.employer),
          formSignedAt: toDateString(p.formSignedAt ?? p.form_signed_at),
        }
      : null;
    return {
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
      profile: serializableProfile,
    };
  });

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
