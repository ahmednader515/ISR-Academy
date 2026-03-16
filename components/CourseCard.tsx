import Link from "next/link";

type Course = {
  id: string;
  title: string;
  titleAr?: string | null;
  slug?: string | null;
  shortDesc?: string | null;
  duration?: string | null;
  level?: string | null;
  imageUrl?: string | null;
  price?: number | { toNumber?: () => number } | string;
  category?: { name: string; nameAr?: string | null } | null;
};

export function CourseCard({ course }: { course: Course }) {
  const displayTitle = course.titleAr ?? course.title;
  const categoryName = course.category?.nameAr ?? course.category?.name;
  const slugOrId = (course.slug && course.slug.trim()) ? encodeURIComponent(course.slug.trim()) : course.id;
  const href = slugOrId ? `/courses/${slugOrId}` : "/courses";

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-hover)] hover:border-[var(--color-primary)]/30"
    >
      <div className="aspect-video w-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary-light)]/30 flex items-center justify-center">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl opacity-50">📚</span>
        )}
      </div>
      <div className="p-5">
        {categoryName && (
          <span className="text-xs font-medium text-[var(--color-primary)]">
            {categoryName}
          </span>
        )}
        <h3 className="mt-1 text-lg font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
          {displayTitle}
        </h3>
        {course.shortDesc && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
            {course.shortDesc}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {Number(course.price ?? 0) > 0 && (
            <span className="rounded-full bg-[var(--color-primary-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
              {Number(course.price).toFixed(2)} ج.م
            </span>
          )}
          {course.duration && (
            <span className="rounded-full bg-[var(--color-primary-light)] px-2.5 py-0.5 text-xs text-[var(--color-primary)]">
              ⏱ {course.duration}
            </span>
          )}
          {course.level && (
            <span className="rounded-full bg-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-muted)]">
              {course.level === "beginner" && "مبتدئ"}
              {course.level === "intermediate" && "متوسط"}
              {course.level === "advanced" && "متقدم"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
