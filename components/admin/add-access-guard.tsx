"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { request } from "@/lib/http";

type Session = {
  authenticated: boolean;
  username: string;
  roles: string[];
};

export function AdminAccessGuard({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState<string>();

  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    let active = true;

    setSession(undefined);
    setError(undefined);

    request<Session>("/api/v1/session")
      .then((current) => {
        if (!active) return;

        if (!current.authenticated) {
          router.replace(
            `/login?continue=${encodeURIComponent(path)}`,
          );
          return;
        }

        setSession(current);
      })
      .catch((reason) => {
        if (!active) return;

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

  if (error) {
    return (
      <main role="alert" className="p-10 text-red-200">
        {error}
      </main>
    );
  }

  if (!session) {
    return (
      <main role="status" className="p-10 text-slate-300">
        Checking your session…
      </main>
    );
  }

  if (!session.roles.includes("INFRASTRUCTURE_INTERNAL")) {
    return (
      <main className="p-10 text-slate-100">
        <h1 className="text-2xl">Access denied</h1>

        <p className="my-4">
          Your account is authenticated but is not an
          infrastructure operator.
        </p>

        <Link href="/" className="text-cyan-300">
          Return to account portal
        </Link>
      </main>
    );
  }

  return <>{children}</>;
}