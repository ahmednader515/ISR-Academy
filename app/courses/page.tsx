import { unstable_noStore } from "next/cache";
import { getCoursesPublished } from "@/lib/db";
import { CourseCard } from "@/components/CourseCard";

/** عدم تخزين الصفحة مؤقتاً — الكورسات الجديدة والمحذوفة تظهر فوراً */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "الدورات | منصتي التعليمية",
  description: "تصفح جميع الدورات المتاحة والبدء في التعلم",
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function CoursesPage({ searchParams }: Props) {
  unstable_noStore();
  const { category: categorySlug } = await searchParams;
  let courses: Awaited<ReturnType<typeof getCoursesPublished>> = [];
  try {
    courses = await getCoursesPublished(true);
  } catch {
    // DB not connected
  }

  const filtered =
    categorySlug?.trim()
      ? courses.filter((c) => (c as { category?: { slug?: string } }).category?.slug === categorySlug.trim())
      : courses;

  const categoryName =
    categorySlug && filtered.length > 0
      ? ((filtered[0] as { category?: { nameAr?: string; name?: string } }).category?.nameAr ??
         (filtered[0] as { category?: { name?: string } }).category?.name)
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
          {categoryName ? `دورات قسم ${categoryName}` : "جميع الدورات"}
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          {categoryName
            ? `دورات القسم المحدد فقط`
            : "اختر الدورة المناسبة وابدأ التعلم خطوة بخطوة"}
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 p-12 text-center">
          <p className="text-[var(--color-muted)]">
            {categorySlug?.trim()
              ? "لا توجد دورات في هذا القسم حالياً."
              : "لا توجد دورات منشورة حالياً. تأكد من إعداد قاعدة البيانات وتشغيل البذرة (seed)."}
          </p>
        </div>
      )}
    </div>
  );
}
