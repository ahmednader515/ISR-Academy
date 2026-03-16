import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getCourseForEdit } from "@/lib/db";
import { EditCourseForm } from "./EditCourseForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditCoursePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const data = await getCourseForEdit(id);

  if (!data?.course) notFound();

  const c = data.course as Record<string, unknown>;
  const initialData = {
    id: String(c.id ?? ""),
    title: String(c.title ?? ""),
    description: String(c.description ?? ""),
    shortDesc: String(c.shortDesc ?? c.short_desc ?? ""),
    imageUrl: String(c.imageUrl ?? c.image_url ?? ""),
    price: String(Number(c.price ?? 0)),
    isPublished: Boolean(c.isPublished ?? c.is_published ?? true),
    maxQuizAttempts: typeof c.maxQuizAttempts === "number" ? c.maxQuizAttempts : typeof c.max_quiz_attempts === "number" ? c.max_quiz_attempts : null,
    categoryId: (c.categoryId ?? c.category_id ?? "") as string,
    lessons: data.lessons.map((l) => {
      const row = l as Record<string, unknown>;
      return {
        title: String(row.title ?? ""),
        videoUrl: String(row.videoUrl ?? row.video_url ?? ""),
        content: String(row.content ?? ""),
        pdfUrl: String(row.pdfUrl ?? row.pdf_url ?? ""),
        acceptsHomework: Boolean(row.acceptsHomework ?? row.accepts_homework ?? false),
      };
    }),
    quizzes: data.quizzes.map((q) => {
      const row = q as Record<string, unknown>;
      const questions = (row.questions ?? []) as Array<Record<string, unknown>>;
      return {
        title: String(row.title ?? ""),
        questions: questions.map((qt) => ({
          type: (qt.type === "ESSAY" || qt.type === "TRUE_FALSE" ? qt.type : "MULTIPLE_CHOICE") as "MULTIPLE_CHOICE" | "ESSAY" | "TRUE_FALSE",
          questionText: String(qt.questionText ?? qt.question_text ?? ""),
          options: ((qt.options ?? []) as Array<Record<string, unknown>>).map((o) => ({
            text: String(o.text ?? ""),
            isCorrect: Boolean(o.isCorrect ?? o.is_correct),
          })),
        })),
      };
    }),
  };

  return (
    <div>
      <Link
        href="/dashboard/courses"
        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        ← العودة إلى إدارة الكورسات
      </Link>
      <h2 className="mt-4 text-xl font-bold text-[var(--color-foreground)]">
        تعديل الدورة
      </h2>
      <EditCourseForm courseId={id} initialData={initialData} />
    </div>
  );
}
