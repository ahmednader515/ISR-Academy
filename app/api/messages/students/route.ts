import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsersByRole } from "@/lib/db";

/** قائمة الطلبة (للأدمن/مساعد لاختيار طالب للتواصل) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  const role = session.user.role as string;
  if (role !== "ADMIN" && role !== "ASSISTANT_ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const students = await getUsersByRole("STUDENT");
  return NextResponse.json(students.map((u) => ({ id: u.id, name: u.name, email: u.email })));
}
