"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { HomepageSetting, HeroBgPreset } from "@/lib/types";
import { UploadButton } from "@/lib/uploadthing";

const HERO_BG_OPTIONS: { id: HeroBgPreset; label: string; from: string; to: string }[] = [
  { id: "navy", label: "أزرق داكن (افتراضي)", from: "#14162E", to: "#1E2145" },
  { id: "indigo", label: "نيلي", from: "#1e1b4b", to: "#312e81" },
  { id: "purple", label: "بنفسجي", from: "#2e1065", to: "#4c1d95" },
  { id: "teal", label: "تركواز", from: "#134e4a", to: "#0f766e" },
  { id: "forest", label: "أخضر غامق", from: "#14532d", to: "#166534" },
  { id: "slate", label: "رمادي أزرق", from: "#0f172a", to: "#1e293b" },
];

export function HomepageSettingsForm({ initialSettings }: { initialSettings: HomepageSetting }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    logoUrl: initialSettings.logoUrl ?? "",
    teacherImageUrl: initialSettings.teacherImageUrl ?? "",
    heroTitle: initialSettings.heroTitle ?? "",
    heroSlogan: initialSettings.heroSlogan ?? "",
    platformName: initialSettings.platformName ?? "",
    pageTitle: initialSettings.pageTitle ?? "",
    whatsappUrl: initialSettings.whatsappUrl ?? "",
    facebookUrl: initialSettings.facebookUrl ?? "",
    heroBgPreset: (initialSettings.heroBgPreset as HeroBgPreset) || "navy",
    heroFloatImage1: initialSettings.heroFloatImage1 ?? "",
    heroFloatImage2: initialSettings.heroFloatImage2 ?? "",
    heroFloatImage3: initialSettings.heroFloatImage3 ?? "",
    footerTitle: initialSettings.footerTitle ?? "",
    footerTagline: initialSettings.footerTagline ?? "",
    footerCopyright: initialSettings.footerCopyright ?? "",
  });
  const [imageUploadError, setImageUploadError] = useState("");
  const [logoUploadError, setLogoUploadError] = useState("");

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl: form.logoUrl.trim() || null,
          teacherImageUrl: form.teacherImageUrl.trim() || null,
          heroTitle: form.heroTitle.trim() || null,
          heroSlogan: form.heroSlogan.trim() || null,
          platformName: form.platformName.trim() || null,
          pageTitle: form.pageTitle.trim() || null,
          whatsappUrl: form.whatsappUrl.trim() || null,
          facebookUrl: form.facebookUrl.trim() || null,
          heroBgPreset: form.heroBgPreset || null,
          heroFloatImage1: form.heroFloatImage1.trim() || null,
          heroFloatImage2: form.heroFloatImage2.trim() || null,
          heroFloatImage3: form.heroFloatImage3.trim() || null,
          footerTitle: form.footerTitle.trim() || null,
          footerTagline: form.footerTagline.trim() || null,
          footerCopyright: form.footerCopyright.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "فشل الحفظ");
      setSuccess("تم حفظ التغييرات");
      router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
      {error && (
        <div className="rounded-[var(--radius-btn)] bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-[var(--radius-btn)] bg-emerald-500/15 px-3 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {success}
        </div>
      )}

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">شعار الموقع (في الشريط العلوي)</h3>
        <p className="mb-3 text-sm text-[var(--color-muted)]">
          يظهر في أعلى يمين الصفحة بدلاً من اسم المنصة. يمكنك رفع صورة أو إدخال رابط. إن تركت فارغاً يظهر اسم المنصة كنص.
        </p>
        {form.logoUrl ? (
          <div className="mb-3">
            <img
              src={form.logoUrl}
              alt="شعار"
              className="h-10 w-auto max-h-12 rounded-[var(--radius-btn)] border border-[var(--color-border)] object-contain object-left"
            />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <UploadButton
            endpoint="courseImage"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.url ?? (res?.[0] as { serverData?: { url?: string } })?.serverData?.url;
              if (url) {
                setForm((prev) => ({ ...prev, logoUrl: url }));
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("isr:logo-updated", { detail: { logoUrl: url } }));
                }
                setLogoUploadError("");
              }
            }}
            onUploadError={(e) => setLogoUploadError(e.message)}
            content={{ button: "اختر شعاراً للرفع" }}
          />
        </div>
        {logoUploadError && <p className="mt-1 text-sm text-red-600">{logoUploadError}</p>}
        <input
          type="text"
          value={form.logoUrl}
          onChange={(e) => {
            const value = e.target.value;
            setForm((f) => ({ ...f, logoUrl: value }));
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("isr:logo-updated", { detail: { logoUrl: value || null } }));
            }
            setLogoUploadError("");
          }}
          placeholder="أو أدخل رابط الشعار"
          className="mt-2 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">صورة المدرس</h3>
        <p className="mb-3 text-sm text-[var(--color-muted)]">
          تظهر في الصفحة الرئيسية بجانب العنوان. يمكنك رفع صورة أو إدخال رابط صورة.
        </p>
        {form.teacherImageUrl ? (
          <div className="mb-3">
            <img
              src={form.teacherImageUrl}
              alt="معاينة"
              className="h-32 w-40 rounded-[var(--radius-btn)] border border-[var(--color-border)] object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <UploadButton
            endpoint="courseImage"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.url ?? (res?.[0] as { serverData?: { url?: string } })?.serverData?.url;
              if (url) {
                setForm((prev) => ({ ...prev, teacherImageUrl: url }));
                setImageUploadError("");
              }
            }}
            onUploadError={(e) => setImageUploadError(e.message)}
            content={{ button: "اختر صورة للرفع" }}
          />
        </div>
        {imageUploadError && <p className="mt-1 text-sm text-red-600">{imageUploadError}</p>}
        <input
          type="text"
          value={form.teacherImageUrl}
          onChange={(e) => { setForm((f) => ({ ...f, teacherImageUrl: e.target.value })); setImageUploadError(""); }}
          placeholder="/instructor.png أو رابط صورة"
          className="mt-2 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
        />

        <div className="mt-6">
          <h4 className="mb-2 text-sm font-semibold text-[var(--color-foreground)]">لون خلفية الهيرو (وراء صورة المدرس)</h4>
          <p className="mb-3 text-sm text-[var(--color-muted)]">
            اختر لون الخلفية التي تظهر في الصفحة الرئيسية خلف صورة المدرس والعنوان.
          </p>
          <div className="flex flex-wrap gap-3">
            {HERO_BG_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, heroBgPreset: opt.id }))}
                className={`flex flex-col items-center gap-1 rounded-[var(--radius-btn)] border-2 p-2 transition ${
                  form.heroBgPreset === opt.id
                    ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30"
                    : "border-[var(--color-border)] hover:border-[var(--color-muted)]"
                }`}
                title={opt.label}
              >
                <span
                  className="h-10 w-14 rounded border border-white/20"
                  style={{ background: `linear-gradient(180deg, ${opt.from} 0%, ${opt.to} 100%)` }}
                />
                <span className="text-xs font-medium text-[var(--color-foreground)]">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">الصور الصغيرة العائمة حول صورة المدرس</h3>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          تظهر هذه الصور بجانب صورة المدرس في الصفحة الرئيسية. يمكنك إدخال رابط لكل صورة أو ترك الحقل فارغاً لاستخدام الافتراضي.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">صورة عائمة ١ (يسار أعلى)</label>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {form.heroFloatImage1 ? (
                <img src={form.heroFloatImage1} alt="" className="h-10 w-10 rounded object-cover border border-[var(--color-border)]" />
              ) : null}
              <input
                type="text"
                value={form.heroFloatImage1}
                onChange={(e) => setForm((f) => ({ ...f, heroFloatImage1: e.target.value }))}
                placeholder="/images/ruler.png أو رابط"
                className="min-w-[180px] flex-1 rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
              />
              <UploadButton
                endpoint="courseImage"
                onClientUploadComplete={(res) => {
                  const url = res?.[0]?.url ?? (res?.[0] as { serverData?: { url?: string } })?.serverData?.url;
                  if (url) setForm((prev) => ({ ...prev, heroFloatImage1: url }));
                }}
                content={{ button: "إضافة صورة" }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">صورة عائمة ٢ (يمين أسفل)</label>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {form.heroFloatImage2 ? (
                <img src={form.heroFloatImage2} alt="" className="h-10 w-10 rounded object-cover border border-[var(--color-border)]" />
              ) : null}
              <input
                type="text"
                value={form.heroFloatImage2}
                onChange={(e) => setForm((f) => ({ ...f, heroFloatImage2: e.target.value }))}
                placeholder="/images/notebook.png أو رابط"
                className="min-w-[180px] flex-1 rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
              />
              <UploadButton
                endpoint="courseImage"
                onClientUploadComplete={(res) => {
                  const url = res?.[0]?.url ?? (res?.[0] as { serverData?: { url?: string } })?.serverData?.url;
                  if (url) setForm((prev) => ({ ...prev, heroFloatImage2: url }));
                }}
                content={{ button: "إضافة صورة" }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">صورة عائمة ٣ (أسفل يسار)</label>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {form.heroFloatImage3 ? (
                <img src={form.heroFloatImage3} alt="" className="h-10 w-10 rounded object-cover border border-[var(--color-border)]" />
              ) : null}
              <input
                type="text"
                value={form.heroFloatImage3}
                onChange={(e) => setForm((f) => ({ ...f, heroFloatImage3: e.target.value }))}
                placeholder="/images/pencil.png أو رابط"
                className="min-w-[180px] flex-1 rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
              />
              <UploadButton
                endpoint="courseImage"
                onClientUploadComplete={(res) => {
                  const url = res?.[0]?.url ?? (res?.[0] as { serverData?: { url?: string } })?.serverData?.url;
                  if (url) setForm((prev) => ({ ...prev, heroFloatImage3: url }));
                }}
                content={{ button: "إضافة صورة" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">نصوص الصفحة الرئيسية</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">اسم المنصة (أعلى اليمين في الموقع)</label>
            <input
              type="text"
              value={form.platformName}
              onChange={(e) => setForm((f) => ({ ...f, platformName: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
              placeholder="منصة أستاذ عصام محي"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">العنوان الرئيسي (في الهيرو)</label>
            <input
              type="text"
              value={form.heroTitle}
              onChange={(e) => setForm((f) => ({ ...f, heroTitle: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
              placeholder="أستاذ / عصام محي"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">الشعار (تحت العنوان)</label>
            <input
              type="text"
              value={form.heroSlogan}
              onChange={(e) => setForm((f) => ({ ...f, heroSlogan: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
              placeholder="ادرسها... يمكن تفهم المعلومة صح!"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">عنوان التبويب (المظهر في تاب المتصفح)</label>
            <input
              type="text"
              value={form.pageTitle}
              onChange={(e) => setForm((f) => ({ ...f, pageTitle: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
              placeholder="منصتي التعليمية | دورات وتعلم أونلاين"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">عنوان الفوتر (أسفل الموقع)</label>
            <input
              type="text"
              value={form.footerTitle}
              onChange={(e) => setForm((f) => ({ ...f, footerTitle: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
              placeholder="منصتي التعليمية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">وصف الفوتر (تحت العنوان)</label>
            <input
              type="text"
              value={form.footerTagline}
              onChange={(e) => setForm((f) => ({ ...f, footerTagline: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
              placeholder="تعلم بأسلوب حديث ومنهجية واضحة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">نص حقوق النشر (أسفل الصفحة)</label>
            <input
              type="text"
              value={form.footerCopyright}
              onChange={(e) => setForm((f) => ({ ...f, footerCopyright: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
              placeholder="منصتي التعليمية. جميع الحقوق محفوظة."
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">يُعرض كـ: © السنة الحالية ثم النص أعلاه.</p>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">روابط التواصل (الصفحة الرئيسية)</h3>
        <p className="mb-3 text-sm text-[var(--color-muted)]">
          رابط واحد لواتساب ورابط واحد لفيسبوك فقط (أزرار ثابتة أسفل يمين الصفحة). اترك الحقل فارغاً لإخفاء الزر من الصفحة.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">رابط واتساب</label>
            <input
              type="url"
              value={form.whatsappUrl}
              onChange={(e) => setForm((f) => ({ ...f, whatsappUrl: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
              placeholder="https://wa.me/966553612356"
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">فارغ = عدم عرض زر واتساب.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)]">رابط فيسبوك</label>
            <input
              type="url"
              value={form.facebookUrl}
              onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
              placeholder="https://www.facebook.com/..."
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">فارغ = عدم عرض زر فيسبوك.</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-[var(--radius-btn)] bg-[var(--color-primary)] px-6 py-2 font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </form>
  );
}
