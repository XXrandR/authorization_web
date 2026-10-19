import Link from "next/link";
import {
  ArrowUpRight,
  Fingerprint,
  ShieldCheck,
  KeyRound,
  MailPlus,
  AppWindow,
  ShieldEllipsis,
  MonitorSmartphone,
  ScrollText,
  Activity,
} from "lucide-react";

const modules = [
  {
    title: "Clients",
    description: "Applications and OAuth client configurations.",
    href: "/admin/clients",
    icon: AppWindow,
    code: "01",
  },
  {
    title: "Identities",
    description: "User accounts and identity management.",
    href: "/admin/identities",
    icon: Fingerprint,
    code: "02",
  },
  {
    title: "Roles",
    description: "Roles and access permission assignments.",
    href: "/admin/roles",
    icon: ShieldCheck,
    code: "03",
  },
  {
    title: "Invitations",
    description: "Manage invitations and account onboarding.",
    href: "/admin/invitations",
    icon: MailPlus,
    code: "04",
  },
  {
    title: "Authorizations",
    description: "OAuth grants and authorization records.",
    href: "/admin/authorizations",
    icon: KeyRound,
    code: "05",
  },
  {
    title: "Browser sessions",
    description: "Review active browser sessions.",
    href: "/admin/browser-sessions",
    icon: MonitorSmartphone,
    code: "06",
  },
  {
    title: "Audit events",
    description: "Inspect recorded administrative activity.",
    href: "/admin/audit-events",
    icon: ScrollText,
    code: "07",
  },
  {
    title: "Access events",
    description: "Review authentication and access activity.",
    href: "/admin/access-events",
    icon: Activity,
    code: "08",
  },
];

export default function Dashboard() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-10">
      {/* Page heading */}
      <header className="space-y-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-content-muted">
          <ShieldEllipsis className="size-4 text-brand" />
          <span>Administration</span>
          <span className="text-border-strong">/</span>
          <span>Overview</span>
        </div>

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Security administration
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-content-secondary">
              Manage identities, permissions, applications, and access.
              Administrative changes are audited.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-border bg-surface-raised px-3 py-2 text-xs text-content-secondary sm:self-auto">
            <span className="size-1.5 rounded-full bg-success" />
            <span>Control center</span>
          </div>
        </div>
      </header>

      {/* Overview strip */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-4">
        <div className="bg-surface-raised p-4 sm:p-5">
          <p className="text-xs text-content-muted">Modules</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {String(modules.length).padStart(2, "0")}
          </p>
        </div>

        <div className="bg-surface-raised p-4 sm:p-5">
          <p className="text-xs text-content-muted">Identity</p>
          <p className="mt-2 text-sm font-medium">Management</p>
        </div>

        <div className="bg-surface-raised p-4 sm:p-5">
          <p className="text-xs text-content-muted">Access</p>
          <p className="mt-2 text-sm font-medium">Governance</p>
        </div>

        <div className="bg-surface-raised p-4 sm:p-5">
          <p className="text-xs text-content-muted">Activity</p>
          <p className="mt-2 text-sm font-medium">Audit trail</p>
        </div>
      </div>

      {/* Modules */}
      <div>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold">Management modules</h2>
            <p className="mt-1 text-xs text-content-muted">
              Select a resource to manage its configuration and records.
            </p>
          </div>

          <span className="font-mono text-xs text-content-muted">
            01—08
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.href}
                href={module.href}
                className="
                  group relative flex min-h-48 flex-col
                  overflow-hidden rounded-card border border-border
                  bg-surface-raised p-5
                  transition-all duration-200
                  hover:-translate-y-0.5 hover:border-brand/50
                  hover:shadow-card
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-brand
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-background
                "
              >
                {/* Module header */}
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-muted text-content-secondary transition-colors duration-200 group-hover:border-brand/30 group-hover:bg-brand/10 group-hover:text-brand">
                    <Icon className="size-[18px]" strokeWidth={1.7} />
                  </div>

                  <span className="font-mono text-[10px] tracking-wider text-content-muted">
                    MOD.{module.code}
                  </span>
                </div>

                {/* Module information */}
                <div className="mt-6 flex-1">
                  <h3 className="text-sm font-semibold tracking-tight">
                    {module.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-content-secondary">
                    {module.description}
                  </p>
                </div>

                {/* Navigation indicator */}
                <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[11px] font-medium text-content-muted transition-colors group-hover:text-brand">
                    Open module
                  </span>

                  <ArrowUpRight
                    className="size-4 text-content-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                    strokeWidth={1.7}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}