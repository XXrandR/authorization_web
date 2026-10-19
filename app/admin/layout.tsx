import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AppWindow,
  ArrowLeft,
  Fingerprint,
  KeyRound,
  MailPlus,
  MonitorSmartphone,
  ScrollText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import {
  getAdminSession,
  type AdminSession,
} from "@/lib/admin-session";

import AdminLogoutButton from "@/components/admin-logout-button";
import AdminNavigation from "@/components/admin/admin-navigation";

const navigation: {
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Clients",
    href: "/admin/clients",
    icon: AppWindow,
  },
  {
    label: "Identities",
    href: "/admin/identities",
    icon: Fingerprint,
  },
  {
    label: "Roles",
    href: "/admin/roles",
    icon: ShieldCheck,
  },
  {
    label: "Invitations",
    href: "/admin/invitations",
    icon: MailPlus,
  },
  {
    label: "Authorizations",
    href: "/admin/authorizations",
    icon: KeyRound,
  },
  {
    label: "Browser sessions",
    href: "/admin/browser-sessions",
    icon: MonitorSmartphone,
  },
  {
    label: "Audit events",
    href: "/admin/audit-events",
    icon: ScrollText,
  },
  {
    label: "Access events",
    href: "/admin/access-events",
    icon: Activity,
  },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AuthorizedAdminLayout>
        {children}
      </AuthorizedAdminLayout>
    </Suspense>
  );
}

function AdminLoading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground"
    >
      <div className="flex items-center gap-3">
        <span className="size-5 animate-spin rounded-full border-2 border-border border-t-brand" />
        <span className="text-sm text-content-secondary">
          Verifying administrative access…
        </span>
      </div>
    </main>
  );
}

async function AuthorizedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login?continue=%2Fadmin");
  }

  if (!session.roles.includes("INFRASTRUCTURE_INTERNAL")) {
    return <AccessDenied />;
  }

  return (
    <AdminShell session={session}>
      {children}
    </AdminShell>
  );
}

function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground">
      <section className="w-full max-w-md rounded-panel border border-border bg-surface-raised p-8 shadow-card sm:p-10">
        <div className="flex size-12 items-center justify-center rounded-xl border border-error/20 bg-error/5 text-error">
          <ShieldCheck className="size-6" strokeWidth={1.7} />
        </div>

        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-content-muted">
          Protector Identity
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Access denied
        </h1>

        <p className="mt-3 text-sm leading-6 text-content-secondary">
          Your account is authenticated, but it does not have the
          permissions required to access the infrastructure console.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="size-4" />
          Return to account portal
        </Link>
      </section>
    </main>
  );
}

function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-screen-2xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href="/admin"
            aria-label="Protector Identity administration home"
            className="group inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background transition-transform duration-200 group-hover:scale-105">
              <ShieldCheck
                className="size-[19px]"
                strokeWidth={1.7}
              />
            </span>

            <span className="text-sm font-semibold tracking-tight">
              Protector
              <span className="text-brand"> Identity</span>
            </span>

            <span className="hidden h-5 w-px bg-border sm:block" />

            <span className="hidden text-xs font-medium text-content-secondary sm:block">
              Administration
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-sm font-medium">
                {session.username}
              </p>
              <p className="mt-0.5 text-[11px] text-content-muted">
                Infrastructure operator
              </p>
            </div>

            <span
              aria-hidden="true"
              className="hidden size-8 items-center justify-center rounded-full border border-border bg-surface-muted text-xs font-semibold text-content-secondary sm:flex"
            >
              {session.username.slice(0, 1).toUpperCase()}
            </span>

            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-screen-2xl gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <aside className="min-w-0">
            <AdminNavigation />
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}