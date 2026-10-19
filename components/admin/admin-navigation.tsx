"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AppWindow,
  Fingerprint,
  KeyRound,
  MailPlus,
  MonitorSmartphone,
  ScrollText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const navigation: {
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { label: "Clients", href: "/admin/clients", icon: AppWindow },
  { label: "Identities", href: "/admin/identities", icon: Fingerprint },
  { label: "Roles", href: "/admin/roles", icon: ShieldCheck },
  { label: "Invitations", href: "/admin/invitations", icon: MailPlus },
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
  { label: "Audit events", href: "/admin/audit-events", icon: ScrollText },
  { label: "Access events", href: "/admin/access-events", icon: Activity },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration" className="lg:sticky lg:top-24">
      <div className="mb-4 flex items-center justify-between px-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-content-muted">
          Workspace
        </p>

        <span className="font-mono text-[10px] text-content-muted">
          {String(navigation.length).padStart(2, "0")}
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {navigation.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "group inline-flex shrink-0 items-center gap-3 rounded-control border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:w-full",
                active
                  ? "border-brand/20 bg-brand/10 font-medium text-brand"
                  : "border-transparent text-content-secondary hover:bg-surface-muted hover:text-content",
              ].join(" ")}
            >
              <Icon
                className={[
                  "size-[17px] shrink-0 transition-colors",
                  active
                    ? "text-brand"
                    : "text-content-muted group-hover:text-brand",
                ].join(" ")}
                strokeWidth={1.7}
              />

              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 hidden border-t border-border pt-5 lg:block">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-control px-3 py-2 text-xs text-content-muted transition-colors hover:text-content"
        >
          <span aria-hidden="true">←</span>
          Account portal
        </Link>
      </div>
    </nav>
  );
}