"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { request } from "@/lib/http";

type Session = { authenticated: boolean; username: string; roles: string[] };
const navigation = [
  "clients",
  "identities",
  "roles",
  "invitations",
  "authorizations",
  "browser-sessions",
  "audit-events",
  "access-events",
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState<string>();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    let active = true;
    request<Session>("/api/v1/session")
      .then((current) => {
        if (!active) return;
        if (!current.authenticated) {
          router.replace(`/login?continue=${encodeURIComponent(path)}`);
          return;
        }
        setSession(current);
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to verify session.",
          );
      });
    return () => {
      active = false;
    };
  }, [path, router]);
  if (error)
    return (
      <main role="alert" className="p-10 text-red-200">
        {error}
      </main>
    );
  if (!session)
    return (
      <main role="status" className="p-10 text-slate-300">
        Checking your session…
      </main>
    );
  if (!session.roles.includes("INFRASTRUCTURE_INTERNAL"))
    return (
      <main className="p-10 text-slate-100">
        <h1 className="text-2xl">Access denied</h1>
        <p className="my-4">
          Your account is authenticated but is not an infrastructure operator.
        </p>
        <Link href="/" className="text-cyan-300">
          Return to account portal
        </Link>
      </main>
    );
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-5">
        <Link
          href="/admin"
          className="font-semibold tracking-widest text-cyan-300"
        >
          Protector / ADMIN
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span>{session.username}</span>
          <button
            onClick={async () => {
              try {
                await request("/api/auth/logout", "POST");
                router.replace("/login");
              } catch (reason) {
                setError(
                  reason instanceof Error ? reason.message : "Logout failed",
                );
              }
            }}
            className="text-cyan-300"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-screen-2xl gap-6 p-5 lg:grid-cols-[210px_1fr]">
        <nav
          aria-label="Administration"
          className="flex flex-wrap gap-2 lg:flex-col"
        >
          {navigation.map((item) => (
            <Link
              key={item}
              href={`/admin/${item}`}
              aria-current={path === `/admin/${item}` ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm capitalize ${path === `/admin/${item}` ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}
            >
              {item.replaceAll("-", " ")}
            </Link>
          ))}
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
