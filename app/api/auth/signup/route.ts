import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getUserByEmail, createUser, createResearcherProfile } from "@/lib/db";
import { z } from "zod";

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

const signupSchema = z
  .object({
    email: z.string().email("بريد إلكتروني غير صالح"),
    password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
    name: z.string().min(2, "الاسم حرفين على الأقل"),
    student_number: z.string().min(1, "رقم الهاتف مطلوب"),
    guardian_number: z.string().optional(),
    name_ar: z.string().optional(),
    name_en: z.string().optional(),
    nationality: z.string().optional(),
    date_of_birth: z.string().optional(),
    national_id: z.string().optional(),
    academic_degree: z.string().optional(),
    whatsapp_phone: z.string().optional(),
    other_phone: z.string().optional(),
    professional_degree: z.string().optional(),
    department: z.string().optional(),
    research_title: z.string().optional(),
    specialization: z.string().optional(),
    thesis_supervisor: z.string().optional(),
    current_job_title: z.string().optional(),
    employer: z.string().optional(),
    form_signed_at: z.string().optional(),
  })
  .refine(
    (data) => digitsOnly(data.student_number).length === 11,
    { message: "رقم الهاتف يجب أن يكون 11 رقماً", path: ["student_number"] }
  );

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
        { status: 400 }
      );
    }
    const {
      email,
      password,
      name,
      student_number,
      guardian_number,
      name_ar,
      name_en,
      nationality,
      date_of_birth,
      national_id,
      academic_degree,
      whatsapp_phone,
      other_phone,
      professional_degree,
      department,
      research_title,
      specialization,
      thesis_supervisor,
      current_job_title,
      employer,
      form_signed_at,
    } = parsed.data;

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم مسبقاً" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);
    const user = await createUser({
      email,
      password_hash: passwordHash,
      name: name_ar?.trim() || name.trim(),
      role: "STUDENT",
      student_number: student_number.trim(),
      guardian_number: guardian_number?.trim() || null,
    });

    try {
      await createResearcherProfile(user.id, {
      name_ar: name_ar?.trim() || null,
      name_en: name_en?.trim() || null,
      nationality: nationality?.trim() || null,
      date_of_birth: date_of_birth?.trim() || null,
      national_id: national_id?.trim() || null,
      academic_degree: academic_degree?.trim() || null,
      whatsapp_phone: whatsapp_phone?.trim() || null,
      other_phone: other_phone?.trim() || null,
      professional_degree: professional_degree?.trim() || null,
      department: department?.trim() || null,
      research_title: research_title?.trim() || null,
      specialization: specialization?.trim() || null,
      thesis_supervisor: thesis_supervisor?.trim() || null,
      current_job_title: current_job_title?.trim() || null,
      employer: employer?.trim() || null,
      form_signed_at: form_signed_at?.trim() || null,
      });
    } catch (profileErr) {
      console.warn("ResearcherProfile save failed (table may not exist yet):", profileErr);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Signup error:", e);
    const message = e instanceof Error ? e.message : String(e);
    const isVercel = !!process.env.VERCEL;
    let userMessage = "حدث خطأ أثناء إنشاء الحساب.";
    if (message.includes("DATABASE_URL") || message.includes("Environment variable not found")) {
      userMessage = isVercel
        ? "قاعدة البيانات غير مضبوطة على السيرفر. في Vercel: Settings → Environment Variables → أضف DATABASE_URL (رابط Neon أو Supabase) ثم أعد النشر. للتحقق: افتح /api/health"
        : "لم يتم ضبط قاعدة البيانات. أنشئ ملف .env وأضف DATABASE_URL ثم نفّذ: npm run db:push";
    } else if (message.includes("does not exist") || message.includes("Unknown table") || message.includes("relation") || message.includes("P1001") || message.includes("P2021") || message.includes("Can't reach")) {
      userMessage = isVercel
        ? "الاتصال بقاعدة البيانات فشل. تأكد أن DATABASE_URL على Vercel يشير إلى قاعدة سحابية (Neon/Supabase) وليس localhost، ثم أعد النشر. للتحقق: افتح /api/health"
        : "جدول المستخدمين غير موجود أو قاعدة البيانات غير متصلة. افتح لوحة Neon → SQL Editor، انسخ محتوى ملف scripts/init-neon-database.sql ونفّذه مرة واحدة لإنشاء الجداول.";
    } else if (process.env.NODE_ENV === "development" && message) {
      userMessage = message;
    }
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
