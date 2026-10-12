import Link from "next/link";
import type { ReactNode } from "react";

export function AccountShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1e3a8a_0%,#0f172a_40%,#020617_100%)] px-5 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.2em] text-cyan-300"
        >
          Protector IDENTITY
        </Link>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </section>
      </div>
    </main>
  );
}
