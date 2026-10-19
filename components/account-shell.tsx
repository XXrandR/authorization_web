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
    <main className="flex min-h-screen flex-col bg-background px-5 py-6 text-foreground sm:px-8 sm:py-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Protector Identity home"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background transition-transform duration-200 group-hover:scale-105">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-4"
            >
              <path
                d="M12 3 19 6V11C19 15.5 16.1 19 12 21C7.9 19 5 15.5 5 11V6L12 3Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L11 14L15.5 9.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="text-sm font-semibold tracking-tight">
            Protector<span className="text-brand"> Identity</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 text-xs text-content-muted sm:flex">
          <span className="size-1.5 rounded-full bg-success" />
          Secure by design
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center py-12 sm:py-16">
        <section className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-px w-6 bg-brand" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-content-muted">
                Account security
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {title}
            </h1>

            <p className="mt-3 text-sm leading-6 text-content-secondary">
              {subtitle}
            </p>
          </div>

          {/* Form */}
          <div className="rounded-card border border-border bg-surface-raised p-6 shadow-card sm:p-8">
            {children}
          </div>

          {/* Security indicator */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-content-muted">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-3.5"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 10V7a4 4 0 0 1 8 0v3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Protected access. Private by design.
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-border pt-5 text-xs text-content-muted sm:flex-row">
        <span>© {new Date().getFullYear()} Protector Identity</span>

        <span className="tracking-wide">Identity. Access. Trust.</span>
      </footer>
    </main>
  );
}

// import Link from "next/link";
// import type { ReactNode } from "react";

// export function AccountShell({
//   title,
//   subtitle,
//   children,
// }: {
//   title: string;
//   subtitle: string;
//   children: ReactNode;
// }) {
//   return (
//     <main className="relative flex min-h-screen flex-col overflow-hidden bg-white px-5 py-8 text-black transition-colors duration-300 dark:bg-black dark:text-white sm:px-8 sm:py-12">
//       <div
//         aria-hidden="true"
//         className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-70"
//       />

//       <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between">
//         <Link
//           href="/"
//           className="group inline-flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
//         >
//           {/* Brand mark */}
//           <span className="flex size-9 items-center justify-center rounded-xl bg-black text-white transition-transform duration-200 group-hover:scale-105 dark:bg-white dark:text-black">
//             <svg
//               aria-hidden="true"
//               viewBox="0 0 24 24"
//               fill="none"
//               className="size-5"
//             >
//               <path
//                 d="M12 3 19 6V11C19 15.5 16.1 19 12 21C7.9 19 5 15.5 5 11V6L12 3Z"
//                 stroke="currentColor"
//                 strokeWidth="1.7"
//                 strokeLinejoin="round"
//               />
//               <path
//                 d="M9 12L11 14L15.5 9.5"
//                 stroke="currentColor"
//                 strokeWidth="1.7"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </span>

//           <span className="text-sm font-semibold tracking-tight">
//             Protector
//             <span className="text-violet-600 dark:text-violet-400">
//               {" "}Identity
//             </span>
//           </span>
//         </Link>

//         <div className="hidden items-center gap-2 text-xs text-neutral-500 sm:flex dark:text-neutral-400">
//           <span className="relative flex size-2">
//             <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-40" />
//             <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
//           </span>
//           Secure identity platform
//         </div>
//       </header>

//       {/* Main authentication content */}
//       <div className="relative z-10 flex flex-1 items-center justify-center py-12 sm:py-16">
//         <section className="w-full max-w-md">
//           {/* Eyebrow */}
//           <div className="mb-6 flex items-center gap-3">
//             <span className="h-px w-8 bg-violet-600 dark:bg-violet-400" />
//             <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
//               Account security
//             </span>
//           </div>

//           {/* Heading */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-semibold tracking-[-0.045em] text-black dark:text-white sm:text-4xl">
//               {title}
//             </h1>

//             <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-600 dark:text-neutral-400">
//               {subtitle}
//             </p>
//           </div>

//           {/* Form surface */}
//           <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.15)] sm:p-8 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-[0_8px_40px_-20px_rgba(255,255,255,0.08)]">
//             {children}
//           </div>

//           {/* Trust indicator */}
//           <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-500">
//             <svg
//               aria-hidden="true"
//               viewBox="0 0 24 24"
//               fill="none"
//               className="size-4"
//             >
//               <rect
//                 x="5"
//                 y="10"
//                 width="14"
//                 height="11"
//                 rx="2"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//               />
//               <path
//                 d="M8 10V7a4 4 0 1 1 8 0v3"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>

//             Your account deserves better than guesswork.
//           </div>
//         </section>
//       </div>

//       {/* Footer */}
//       <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-neutral-200 pt-5 text-xs text-neutral-500 sm:flex-row dark:border-neutral-800">
//         <span>
//           © {new Date().getFullYear()} Protector Identity
//         </span>

//         <span className="tracking-wide">
//           Identity. Access. Trust.
//         </span>
//       </footer>
//     </main>
//   );
// }

// export function AccountShell({
//   title,
//   subtitle,
//   children,
// }: {
//   title: string;
//   subtitle: string;
//   children: ReactNode;
// }) {
//   return (
//     <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1e3a8a_0%,#0f172a_40%,#020617_100%)] px-5 py-10 text-slate-100">
//       <div className="mx-auto flex w-full max-w-md flex-col gap-8">
//         <Link
//           href="/"
//           className="text-sm font-semibold tracking-[0.2em] text-cyan-300"
//         >
//           Protector IDENTITY
//         </Link>
//         <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
//           <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
//           <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
//           <div className="mt-7">{children}</div>
//         </section>
//       </div>
//     </main>
//   );
// }
