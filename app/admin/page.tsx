import Link from "next/link";

export default function Dashboard() {
  return (
    <section>
      <h1 className="text-3xl font-semibold">Security administration</h1>
      <p className="mt-3 text-slate-400">
        Manage identities, permissions, clients, and access. Sensitive changes
        are audited.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          "clients",
          "identities",
          "roles",
          "invitations",
          "authorizations",
          "browser-sessions",
          "audit-events",
          "access-events",
        ].map((section) => (
          <Link
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-lg capitalize hover:border-cyan-500"
            key={section}
            href={`/admin/${section}`}
          >
            {section.replaceAll("-", " ")} →
          </Link>
        ))}
      </div>
    </section>
  );
}
