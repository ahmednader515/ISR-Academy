import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCourseWithContent, getEnrollment, getAllowedLessonIdsForUserCourse } from "@/lib/db";
import { YouTubeOverlayPlayer } from "@/components/YouTubeOverlayPlayer";
import { CourseOutlineSidebar } from "@/components/CourseOutlineSidebar";
import { LessonHomeworkSection } from "./LessonHomeworkSection";

type Props = { params: Promise<{ slug: string; lessonSlug: string }> };

function decodeSegment(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function isLessonId(segment: string): boolean {
  return /^c[a-z0-9]{24}$/i.test(segment);
}

function courseHref(course: { slug?: string | null; id: string }): string {
  const segment = (course.slug && course.slug.trim()) ? encodeURIComponent(course.slug.trim()) : course.id;
  return `/courses/${segment}`;
}

function courseSeg(course: { slug?: string | null; id: string }): string {
  const s = (course.slug && course.slug.trim()) ? String(course.slug).trim() : "";
  const normalized = s ? s.replace(/-+$/, "").replace(/^-+/, "") : "";
  return normalized ? encodeURIComponent(normalized) : (course as { id: string }).id;
}

function lessonHref(course: { slug?: string | null; id: string }, lesson: { slug?: string | null; id: string }): string {
  const seg = courseSeg(course);
  const lessonSeg = (lesson.slug && lesson.slug.trim()) ? encodeURIComponent(lesson.slug.trim()) : lesson.id;
  return `/courses/${seg}/lessons/${lessonSeg}`;
}

function quizHref(course: { slug?: string | null; id: string }, quizId: string): string {
  return `/courses/${courseSeg(course)}/quizzes/${encodeURIComponent(quizId)}`;
}

type CourseItem =
  | { type: "lesson"; id: string; slug?: string | null; title: string; titleAr?: string | null }
  | { type: "quiz"; id: string; title: string; _count?: { questions?: number } };

export default async function LessonPage({ params }: Props) {
  const { slug: courseSegment, lessonSlug: lessonSegment } = await params;
  const courseDecoded = decodeSegment(courseSegment);
  const lessonDecoded = decodeSegment(lessonSegment);
  const session = await getServerSession(authOptions);

  const data = await getCourseWithContent(courseDecoded);
  if (!data?.course) notFound();

  const course = data.course as unknown as Record<string, unknown> & { id: string; lessons: Record<string, unknown>[]; quizzes?: Array<Record<string, unknown> & { _count?: { questions?: number } }> };
  course.lessons = data.lessons;
  course.quizzes = data.quizzes ?? [];

  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "ASSISTANT_ADMIN";
  let isEnrolled = false;
  let allowedLessonIds: string[] = [];
  if (session?.user?.id) {
    const en = await getEnrollment(session.user.id, course.id);
    isEnrolled = !!en;
    if (!isEnrolled && !isStaff) {
      allowedLessonIds = await getAllowedLessonIdsForUserCourse(session.user.id, course.id);
    }
  }
  const canAccessCourse = isStaff || isEnrolled || allowedLessonIds.length > 0;
  if (!canAccessCourse) notFound();

  const lesson = isLessonId(lessonDecoded)
    ? data.lessons.find((l: Record<string, unknown>) => l.id === lessonDecoded)
    : data.lessons.find((l: Record<string, unknown>) => l.slug === lessonDecoded);
  if (!lesson) notFound();

  // لو الوصول جزئي: لا نسمح بفتح إلا الحصص المحددة
  if (!isStaff && !isEnrolled && allowedLessonIds.length > 0) {
    const lid = String((lesson as Record<string, unknown>).id ?? "");
    if (!allowedLessonIds.includes(lid)) notFound();
  }

  const lessonObj = lesson as Record<string, unknown>;
  const videoUrl = (lessonObj.videoUrl ?? lessonObj.video_url) as string;
  const courseTitle = (course.titleAr ?? course.title) as string;
  const lessonTitle = (lessonObj.titleAr ?? lessonObj.title) as string;

  const lessonsAll = (course.lessons ?? []) as Array<Record<string, unknown> & { id: string; title?: string; titleAr?: string | null }>;
  const lessons = (!isStaff && !isEnrolled && allowedLessonIds.length > 0)
    ? lessonsAll.filter((l) => allowedLessonIds.includes(String(l.id)))
    : lessonsAll;
  const quizzesAll = (course.quizzes ?? []) as Array<Record<string, unknown> & { id: string; title?: string; _count?: { questions?: number } }>;
  const quizzes = (!isStaff && !isEnrolled && allowedLessonIds.length > 0) ? [] : quizzesAll;
  const items: CourseItem[] = [
    ...lessons.map((l) => ({ type: "lesson" as const, id: l.id, slug: (l as Record<string, unknown>).slug as string | null, title: String(l.title ?? ""), titleAr: l.titleAr })),
    ...quizzes.map((q) => ({ type: "quiz" as const, id: q.id, title: String(q.title ?? ""), _count: q._count })),
  ];
  const currentIndex = items.findIndex((i) => i.type === "lesson" && i.id === lessonObj.id);
  const prevItem = currentIndex > 0 ? items[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4">
        <Link href={courseHref(course)} className="text-sm font-medium text-[var(--color-primary)] hover:underline">
          ← العودة إلى {courseTitle}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
        {/* محتوى الحصة — دائماً العمود العريض */}
        <article className="min-w-0 lg:col-start-1 lg:row-start-1">
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{lessonTitle}</h1>

          {videoUrl && (
            <div className="mt-6 w-full min-w-0">
              <YouTubeOverlayPlayer videoUrl={videoUrl} title={lessonTitle} />
            </div>
          )}

          {(lessonObj.pdfUrl ?? lessonObj.pdf_url) ? (
            <div className="mt-6">
              <a
                href={String(lessonObj.pdfUrl ?? lessonObj.pdf_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
              >
                📄 تحميل / عرض ملف PDF
              </a>
            </div>
          ) : null}

          {lessonObj.content ? (
            <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 prose-custom text-[var(--color-foreground)]">
              {String(lessonObj.content).split("\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}

          {Boolean(lessonObj.acceptsHomework ?? lessonObj.accepts_homework) && (
            <LessonHomeworkSection lessonId={String(lessonObj.id)} />
          )}

          {/* أزرار السابق والتالي أسفل الحصة */}
          <nav className="mt-8 flex w-full items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
            {prevItem ? (
              <Link
                href={prevItem.type === "lesson" ? lessonHref(course, { id: prevItem.id, slug: prevItem.slug ?? undefined }) : quizHref(course, prevItem.id)}
                className="rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium transition hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-background)]"
              >
                ← {prevItem.type === "lesson" ? "الحصة السابقة" : "الاختبار السابق"}
              </Link>
            ) : (
              <span />
            )}
            {nextItem ? (
              <Link
                href={nextItem.type === "lesson" ? lessonHref(course, { id: nextItem.id, slug: nextItem.slug ?? undefined }) : quizHref(course, nextItem.id)}
                className="rounded-[var(--radius-btn)] bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)]"
              >
                {nextItem.type === "lesson" ? "الحصة التالية" : "الاختبار التالي"} →
              </Link>
            ) : null}
          </nav>
        </article>

        {/* قائمة الكورس — العمود الضيق على الجانب */}
        <aside className="order-first lg:col-start-2 lg:row-start-1 lg:order-none">
          <CourseOutlineSidebar
            course={course}
            lessons={lessons}
            quizzes={quizzes}
            currentLessonId={lessonObj.id as string}
            currentQuizId={null}
          />
        </aside>
      </div>
    </div>
  );
}
