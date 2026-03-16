import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getLiveStreamById, getCoursesAll } from "@/lib/db";
import { LiveStreamForm } from "../../LiveStreamForm";

type Props = { params: Promise<{ id: string }> };

function toDateTimeLocal(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export default async function EditLiveStreamPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const [stream, courses] = await Promise.all([getLiveStreamById(id), getCoursesAll()]);
  if (!stream) notFound();

  const s = stream as unknown as Record<string, unknown>;
  const initialData = {
    id: String(s.id),
    courseId: String(s.course_id ?? ""),
    title: String(s.title ?? ""),
    titleAr: String(s.title_ar ?? s.titleAr ?? ""),
    provider: (s.provider === "google_meet" ? "google_meet" : "zoom") as "zoom" | "google_meet",
    meetingUrl: String(s.meeting_url ?? ""),
    meetingId: String(s.meeting_id ?? s.meetingId ?? ""),
    meetingPassword: String(s.meeting_password ?? s.meetingPassword ?? ""),
    scheduledAt: toDateTimeLocal((s.scheduled_at ?? s.scheduledAt) as Date | string),
    description: String(s.description ?? ""),
    order: Number(s.order ?? 0),
  };

  const courseOptions = courses.map((c) => ({
    id: c.id,
    title: (c as { title_ar?: string; title: string }).title_ar ?? c.title,
  }));

  return (
    <div>
      <Link
        href="/dashboard/live-streams"
        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        ← العودة إلى البثوث المباشرة
      </Link>
      <h2 className="mt-4 text-xl font-bold text-[var(--color-foreground)]">
        تعديل البث المباشر
      </h2>
      <LiveStreamForm courseOptions={courseOptions} initialData={initialData} />
    </div>
  );
}
