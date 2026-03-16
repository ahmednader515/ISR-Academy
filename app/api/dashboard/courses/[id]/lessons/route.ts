import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLessonsByCourseId } from "@/lib/db";

/** جلب حصص دورة — للأدمن/مساعد الأدمن */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "ASSISTANT_ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "معرّف الدورة مطلوب" }, { status: 400 });
  }

  try {
    const lessons = await getLessonsByCourseId(id.trim());
    const payload = lessons.map((l) => {
      const r = l as unknown as Record<string, unknown>;
      return {
        id: String(r.id ?? ""),
        title: String(r.title ?? ""),
        titleAr: (r.titleAr ?? r.title_ar ?? null) as string | null,
        order: Number(r.order ?? 0),
      };
    });
    return NextResponse.json(payload);
  } catch (e) {
    console.error("dashboard course lessons:", e);
    return NextResponse.json({ error: "فشل جلب الحصص" }, { status: 500 });
  }
}

