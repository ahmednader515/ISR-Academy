"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import type { UserRole } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";

function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status !== "authenticated" || !session?.user) return null;

  const roleLabel: Record<UserRole, string> = {
    ADMIN: "أدمن",
    ASSISTANT_ADMIN: "مساعد الأدمن",
    STUDENT: "طالب",
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-border)]/50"
      >
        <span className="max-w-[120px] truncate">{session.user.name}</span>
        <span className="text-[var(--color-muted)]">▼</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-48 rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-hover)]">
          <div className="border-b border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted)]">
            {roleLabel[session.user.role]}
          </div>
          <Link
            href="/dashboard"
            className="block px-3 py-2 text-sm hover:bg-[var(--color-border)]/50"
            onClick={() => setOpen(false)}
          >
            لوحة التحكم
          </Link>
          <Link
            href="/dashboard/profile"
            className="block px-3 py-2 text-sm hover:bg-[var(--color-border)]/50"
            onClick={() => setOpen(false)}
          >
            تعديل بيانات الحساب
          </Link>
          {(session.user.role === "ADMIN" || session.user.role === "ASSISTANT_ADMIN") && (
            <Link
              href="/dashboard/courses/new"
              className="block px-3 py-2 text-sm hover:bg-[var(--color-border)]/50"
              onClick={() => setOpen(false)}
            >
              إنشاء دورة
            </Link>
          )}
          <button
            type="button"
            className="w-full px-3 py-2 text-start text-sm text-red-600 hover:bg-[var(--color-border)]/50 dark:text-red-400"
            onClick={async () => {
              setOpen(false);
              try {
                await fetch("/api/auth/clear-session", { method: "POST", credentials: "include" });
              } catch {
                /* تجاهل خطأ الشبكة */
              }
              signOut({ callbackUrl: "/" });
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

export function Header({ platformName, logoUrl }: { platformName?: string | null; logoUrl?: string | null }) {
  const { data: session, status } = useSession();
  const displayName = platformName?.trim() || "منصة أستاذ عصام محي";
  const [overrideLogo, setOverrideLogo] = useState<string | null>(null);

  useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent<{ logoUrl: string | null }>).detail;
      setOverrideLogo(detail.logoUrl);
    }
    window.addEventListener("isr:logo-updated", handle as EventListener);
    return () => window.removeEventListener("isr:logo-updated", handle as EventListener);
  }, []);

  const effectiveLogo = (overrideLogo ?? logoUrl)?.trim() || null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/80">
      <div className="mx-auto flex h-14 min-h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 max-w-[96px] flex-shrink-0 items-center gap-2 transition hover:opacity-90 sm:max-w-[220px]"
          title={displayName}
        >
          {effectiveLogo ? (
            <img
              src={effectiveLogo}
              alt={displayName}
              className="h-8 w-auto max-h-10 object-contain object-left sm:h-10 sm:max-h-12"
            />
          ) : (
            <span className="truncate text-base font-bold text-[var(--color-foreground)] sm:text-xl">
              {displayName}
            </span>
          )}
        </Link>
        <nav className="flex flex-shrink-0 flex-nowrap items-center gap-1.5 sm:gap-6">
          <ThemeToggle />
          <Link
            href="/"
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
          >
            الرئيسية
          </Link>
          <Link
            href="/courses"
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
          >
            الدورات
          </Link>
          {status === "loading" ? (
            <span className="text-sm text-[var(--color-muted)]">...</span>
          ) : session ? (
            <UserMenu />
          ) : (
            <span className="flex flex-nowrap items-center gap-2">
              <Link
                href="/login"
                className="whitespace-nowrap rounded-[var(--radius-btn)] border border-[var(--color-border)] px-2.5 py-2 text-xs font-medium text-[var(--color-foreground)] transition hover:bg-[var(--color-border)]/50 active:opacity-90 min-[400px]:px-4 min-[400px]:text-sm"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-[var(--radius-btn)] bg-[var(--color-primary)] px-2.5 py-2 text-xs font-medium text-white transition hover:bg-[var(--color-primary-hover)] active:opacity-90 min-[400px]:px-4 min-[400px]:text-sm"
              >
                إنشاء حساب
              </Link>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
