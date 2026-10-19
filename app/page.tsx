"use client"

import Link from "next/link";
import {
  ArrowRight,
  Fingerprint,
  ShieldCheck,
  Layers3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { setFips } from "crypto";

const features = [
  {
    icon: Fingerprint,
    title: "One identity",
    description:
      "A unified identity across your web, mobile, and internal applications.",
  },
  {
    icon: ShieldCheck,
    title: "Secure access",
    description:
      "Centralized authentication and controlled authorization flows.",
  },
  {
    icon: Layers3,
    title: "Built to integrate",
    description:
      "A shared identity infrastructure for your entire application ecosystem.",
  },
];

export default function Home() {
  const [year,setYear] = useState<number>();

  useEffect(()=> {
    setYear(new Date().getFullYear())
  },[]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Subtle top accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent"
      />

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link
          href="/"
          aria-label="Protector Identity home"
          className="group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background transition-transform duration-200 group-hover:scale-105">
            <ShieldCheck className="size-[19px]" strokeWidth={1.7} />
          </span>

          <span className="text-sm font-semibold tracking-tight">
            Protector<span className="text-brand"> Identity</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-control px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:text-content"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-1 items-center justify-center px-5 py-20 sm:px-8 sm:py-28">
        {/* Geometric background detail */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-[min(85vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border opacity-60"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-[min(65vw,540px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border opacity-50"
        />

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          {/* Eyebrow */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface-raised px-3.5 py-2">
            <Fingerprint className="size-4 text-brand" />

            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-content-secondary">
              Unified identity infrastructure
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            One identity.
            <br />
            <span className="text-brand">Every application.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-content-secondary sm:text-lg sm:leading-8">
            One secure identity for every Protector app. Centralize
            authentication, manage access, and connect your web, mobile,
            and internal applications through a shared identity platform.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/login"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-brand transition-all duration-200 hover:bg-brand-hover active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Sign in to your account

              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-control border border-border-strong bg-surface-raised px-6 py-3 text-sm font-semibold text-content transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Create an account
            </Link>
          </div>

          {/* Protocol indicator */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-content-muted">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success" />
              Centralized identity
            </span>

            <span aria-hidden="true" className="hidden text-border-strong sm:inline">
              /
            </span>

            <span>OAuth 2.1</span>

            <span aria-hidden="true" className="hidden text-border-strong sm:inline">
              /
            </span>

            <span>Web & mobile</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="grid gap-3 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className="group rounded-card border border-border bg-surface-raised p-6 transition-colors duration-200 hover:border-brand/40 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-muted text-content-secondary transition-colors group-hover:border-brand/30 group-hover:bg-brand/10 group-hover:text-brand">
                  <Icon className="size-[19px]" strokeWidth={1.7} />
                </span>

                <span className="font-mono text-[10px] tracking-wider text-content-muted">
                  0{index + 1}
                </span>
              </div>

              <h2 className="mt-6 text-base font-semibold tracking-tight">
                {title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-content-secondary">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-content-muted sm:flex-row sm:px-8">
          <span>
            © {year} Protector Identity
          </span>

          <span className="tracking-wide">
            Identity. Access. Trust.
          </span>
        </div>
      </footer>
    </main>
  );
}

// import Link from "next/link";

// export default function Home() {
//   return (
//     <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
//       <section className="max-w-2xl text-center">
//         <p className="text-sm font-semibold tracking-[0.25em] text-cyan-300">
//           Protector IDENTITY
//         </p>
//         <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
//           One secure identity for every Protector app.
//         </h1>
//         <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-400">
//           Manage your account and securely authorize web, mobile, and internal
//           applications with OAuth 2.1.
//         </p>
//         <div className="mt-10 flex justify-center gap-3">
//           <Link
//             href="/login"
//             className="rounded-lg bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300"
//           >
//             Sign in
//           </Link>
//           <Link
//             href="/register"
//             className="rounded-lg border border-slate-600 px-4 py-2.5 font-semibold text-slate-100 transition hover:border-slate-400"
//           >
//             Create account
//           </Link>
//         </div>
//       </section>
//     </main>
//   );
// }
