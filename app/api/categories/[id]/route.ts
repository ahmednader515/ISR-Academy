import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteCategory } from "@/lib/db";

/** حذف قسم — للأدمن ومساعد الأدمن. الدورات المرتبطة به تصبح بدون قسم */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT_ADMIN")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "معرّف القسم مطلوب" }, { status: 400 });
  }

  try {
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("API categories [id] DELETE:", e);
    return NextResponse.json({ error: "فشل حذف القسم" }, { status: 500 });
  }
}
