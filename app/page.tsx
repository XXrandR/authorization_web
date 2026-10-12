import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-[0.25em] text-cyan-300">
          Protector IDENTITY
        </p>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
          One secure identity for every Protector app.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-400">
          Manage your account and securely authorize web, mobile, and internal
          applications with OAuth 2.1.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-slate-600 px-4 py-2.5 font-semibold text-slate-100 transition hover:border-slate-400"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
