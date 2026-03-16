import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCourseForEdit } from "@/lib/db";

/** جلب اختبارات دورة — للأدمن/مساعد الأدمن (عناوين فقط للاختيار في نطاق الكود) */
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
    const data = await getCourseForEdit(id.trim());
    if (!data?.course) {
      return NextResponse.json({ error: "الدورة غير موجودة" }, { status: 404 });
    }
    const quizzes = (data.quizzes ?? []).map((q) => ({
      id: String(q.id ?? ""),
      title: String(q.title ?? ""),
    }));
    return NextResponse.json(quizzes);
  } catch (e) {
    console.error("dashboard course quizzes:", e);
    return NextResponse.json({ error: "فشل جلب الاختبارات" }, { status: 500 });
  }
}

