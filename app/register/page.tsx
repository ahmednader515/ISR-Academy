"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ACADEMIC_DEGREES = [
  { value: "", label: "— اختر —" },
  { value: "دبلوم متوسط", label: "دبلوم متوسط" },
  { value: "فوق متوسط", label: "فوق متوسط" },
  { value: "بكالوريوس", label: "بكالوريوس" },
  { value: "ماجستير", label: "ماجستير" },
  { value: "دكتوراة", label: "دكتوراة" },
];

const PROFESSIONAL_DEGREES = [
  { value: "", label: "— اختر —" },
  { value: "دبلوم مهني", label: "دبلوم مهني" },
  { value: "ماجستير مهني", label: "ماجستير مهني" },
  { value: "دكتوراة مهنية", label: "دكتوراة مهنية" },
  { value: "بكالوريوس مهني", label: "بكالوريوس مهني" },
];

const inputClass =
  "mt-1 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]";
const labelClass = "block text-sm font-medium text-[var(--color-foreground)]";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentNumber, setStudentNumber] = useState("");

  const [nationality, setNationality] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [academicDegree, setAcademicDegree] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [professionalDegree, setProfessionalDegree] = useState("");
  const [department, setDepartment] = useState("");
  const [researchTitle, setResearchTitle] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [thesisSupervisor, setThesisSupervisor] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [formSignedAt, setFormSignedAt] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name: nameAr.trim() || name.trim() || nameEn.trim(),
        student_number: studentNumber.trim(),
        name_ar: nameAr.trim() || undefined,
        name_en: nameEn.trim() || undefined,
        nationality: nationality.trim() || undefined,
        date_of_birth: dateOfBirth || undefined,
        national_id: nationalId.trim() || undefined,
        academic_degree: academicDegree || undefined,
        whatsapp_phone: whatsappPhone.trim() || undefined,
        other_phone: otherPhone.trim() || undefined,
        professional_degree: professionalDegree || undefined,
        department: department.trim() || undefined,
        research_title: researchTitle.trim() || undefined,
        specialization: specialization.trim() || undefined,
        thesis_supervisor: thesisSupervisor.trim() || undefined,
        current_job_title: currentJobTitle.trim() || undefined,
        employer: employer.trim() || undefined,
        form_signed_at: formSignedAt || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "فشل إنشاء الحساب");
      return;
    }
    router.push("/login?message=تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول");
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-8rem)] max-w-2xl px-4 py-8">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          إنشاء حساب — بيانات الباحث
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          سجّل كطالب مع بياناتك الأكاديمية والمهنية
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {error && (
            <div className="rounded-[var(--radius-btn)] bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              البيانات الشخصية
            </h2>
            <div>
              <label htmlFor="name_ar" className={labelClass}>
                الاسم رباعي باللغة العربية
              </label>
              <input
                id="name_ar"
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className={inputClass}
                placeholder="الاسم رباعي بالعربية"
              />
            </div>
            <div>
              <label htmlFor="name_en" className={labelClass}>
                الاسم رباعي باللغة الإنجليزية
              </label>
              <input
                id="name_en"
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className={inputClass}
                placeholder="Full name in English"
              />
            </div>
            <div>
              <label htmlFor="nationality" className={labelClass}>
                الجنسية
              </label>
              <input
                id="nationality"
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className={inputClass}
                placeholder="الجنسية"
              />
            </div>
            <div>
              <label htmlFor="date_of_birth" className={labelClass}>
                تاريخ الميلاد
              </label>
              <DatePicker
                id="date_of_birth"
                selected={dateOfBirth ? new Date(dateOfBirth) : null}
                onChange={(d: Date | null) =>
                  setDateOfBirth(d ? d.toISOString().split("T")[0] : "")
                }
                minDate={new Date(1920, 0, 1)}
                maxDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="اختر التاريخ"
                className={inputClass}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
            <div>
              <label htmlFor="national_id" className={labelClass}>
                الرقم القومي
              </label>
              <input
                id="national_id"
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className={inputClass}
                placeholder="الرقم القومي"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              الدرجة العلمية والهواتف
            </h2>
            <div>
              <label htmlFor="academic_degree" className={labelClass}>
                الدرجة العلمية الحاصل عليها
              </label>
              <select
                id="academic_degree"
                value={academicDegree}
                onChange={(e) => setAcademicDegree(e.target.value)}
                className={inputClass}
              >
                {ACADEMIC_DEGREES.map((o) => (
                  <option key={o.value || "empty"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="whatsapp_phone" className={labelClass}>
                رقم التليفون المسجل عليه الواتساب
              </label>
              <input
                id="whatsapp_phone"
                type="tel"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className={inputClass}
                placeholder="رقم الواتساب"
              />
            </div>
            <div>
              <label htmlFor="other_phone" className={labelClass}>
                رقم تليفون آخر
              </label>
              <input
                id="other_phone"
                type="tel"
                value={otherPhone}
                onChange={(e) => setOtherPhone(e.target.value)}
                className={inputClass}
                placeholder="رقم تليفون آخر"
              />
            </div>
            <div>
              <label htmlFor="professional_degree" className={labelClass}>
                الدرجة المهنية المسجل عليها
              </label>
              <select
                id="professional_degree"
                value={professionalDegree}
                onChange={(e) => setProfessionalDegree(e.target.value)}
                className={inputClass}
              >
                {PROFESSIONAL_DEGREES.map((o) => (
                  <option key={o.value || "empty"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              البحث والتخصص
            </h2>
            <div>
              <label htmlFor="department" className={labelClass}>
                القسم المسجل عليه الباحث
              </label>
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClass}
                placeholder="القسم"
              />
            </div>
            <div>
              <label htmlFor="research_title" className={labelClass}>
                عنوان البحث
              </label>
              <input
                id="research_title"
                type="text"
                value={researchTitle}
                onChange={(e) => setResearchTitle(e.target.value)}
                className={inputClass}
                placeholder="عنوان البحث"
              />
            </div>
            <div>
              <label htmlFor="specialization" className={labelClass}>
                الشعبة / التخصص المسجل عليه الباحث
              </label>
              <input
                id="specialization"
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className={inputClass}
                placeholder="الشعبة / التخصص"
              />
            </div>
            <div>
              <label htmlFor="thesis_supervisor" className={labelClass}>
                اسم المشرف على الرسالة
              </label>
              <input
                id="thesis_supervisor"
                type="text"
                value={thesisSupervisor}
                onChange={(e) => setThesisSupervisor(e.target.value)}
                className={inputClass}
                placeholder="اسم المشرف"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              العمل والإيميل وتاريخ التحرير
            </h2>
            <div>
              <label htmlFor="current_job_title" className={labelClass}>
                الوظيفة الحالية
              </label>
              <input
                id="current_job_title"
                type="text"
                value={currentJobTitle}
                onChange={(e) => setCurrentJobTitle(e.target.value)}
                className={inputClass}
                placeholder="الوظيفة الحالية"
              />
            </div>
            <div>
              <label htmlFor="employer" className={labelClass}>
                جهة العمل
              </label>
              <input
                id="employer"
                type="text"
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
                className={inputClass}
                placeholder="جهة العمل"
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                الإيميل
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label htmlFor="form_signed_at" className={labelClass}>
                تحرير في يوم
              </label>
              <DatePicker
                id="form_signed_at"
                selected={formSignedAt ? new Date(formSignedAt) : null}
                onChange={(d: Date | null) =>
                  setFormSignedAt(d ? d.toISOString().split("T")[0] : "")
                }
                minDate={new Date(2000, 0, 1)}
                maxDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="اختر التاريخ"
                className={inputClass}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
          </section>

          <section className="space-y-4 border-t border-[var(--color-border)] pt-4">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              بيانات تسجيل الدخول (مطلوبة)
            </h2>
            <div>
              <label htmlFor="name" className={labelClass}>
                الاسم (للعرض وتسجيل الدخول)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className={inputClass}
                placeholder="أحمد محمد أو الاسم الرباعي"
              />
            </div>
            <div>
              <label htmlFor="student_number" className={labelClass}>
                رقم الهاتف (للتسجيل والدخول)
              </label>
              <input
                id="student_number"
                type="tel"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                required
                className={`${inputClass} text-right`}
                placeholder="رقم الهاتف"
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                placeholder="6 أحرف على الأقل"
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[var(--radius-btn)] bg-[var(--color-primary)] py-2.5 font-medium text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          لديك حساب؟{" "}
          <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

