import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  getUsersByRole,
  getEnrollmentsWithCourseByUserId,
  getAllQuizAttemptsForAdmin,
  getTotalPlatformEarnings,
} from "@/lib/db";
import StatisticsContent from "./StatisticsContent";

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT_ADMIN") {
    redirect("/dashboard");
  }

  const [students, attempts, totalEarnings] = await Promise.all([
    getUsersByRole("STUDENT"),
    getAllQuizAttemptsForAdmin().catch(() => []),
    getTotalPlatformEarnings(),
  ]);

  const enrollmentsByUser = await Promise.all(
    students.map((s) => getEnrollmentsWithCourseByUserId(s.id))
  );

  const totalEnrollments = enrollmentsByUser.reduce((sum, e) => sum + e.length, 0);

  const attemptsSerialized = attempts.map((a) => ({
    userId: a.userId,
    quizId: a.quizId,
    userName: a.userName,
    userEmail: a.userEmail,
    courseTitle: a.courseTitle,
    quizTitle: a.quizTitle,
    score: a.score,
    totalQuestions: a.totalQuestions,
    createdAt: typeof a.createdAt === "string" ? a.createdAt : a.createdAt.toISOString(),
  }));

  const studentsWithDetails = students.map((s, i) => {
    const enrollments = enrollmentsByUser[i] ?? [];
    const userAttempts = attempts.filter((a) => a.userId === s.id);
    return {
      student: { id: s.id, name: s.name, email: s.email },
      enrollments: enrollments.map((e) => ({
        course: { title: e.course.title, titleAr: e.course.titleAr ?? null },
      })),
      userAttempts: userAttempts.map((a) => ({
        userId: a.userId,
        quizId: a.quizId,
        userName: a.userName,
        userEmail: a.userEmail,
        courseTitle: a.courseTitle,
        quizTitle: a.quizTitle,
        score: a.score,
        totalQuestions: a.totalQuestions,
        createdAt: typeof a.createdAt === "string" ? a.createdAt : a.createdAt.toISOString(),
      })),
    };
  });

  return (
    <StatisticsContent
      studentsCount={students.length}
      totalEnrollments={totalEnrollments}
      attemptsCount={attempts.length}
      totalEarnings={totalEarnings}
      attempts={attemptsSerialized}
      studentsWithDetails={studentsWithDetails}
    />
  );
}
