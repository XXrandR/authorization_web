"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@heroui/react";

type Identity = {
  id: string;
  username: string;
  email: string;
  active: boolean;
  blocked: boolean;
  roles: string[];
};
type Row = Record<string, unknown>;

export default function OperationsPage() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [invitations, setInvitations] = useState<Row[]>([]);
  const [sessions, setSessions] = useState<Row[]>([]);
  const [audit, setAudit] = useState<Row[]>([]);
  const [access, setAccess] = useState<Row[]>([]);
  const [error, setError] = useState<string>();

  async function load(path: string) {
    const r = await fetch(`/api/v1/infrastructure/${path}`, {
      credentials: "include",
    });
    if (r.status === 401) {
      window.location.assign(
        `/login?continue=${encodeURIComponent("/infrastructure/operations")}`,
      );
      return [];
    }
    if (!r.ok) throw new Error("Infrastructure access is required.");
    return r.json();
  }

  function refresh() {
    Promise.all([
      load("identities"),
      load("invitations"),
      load("sessions"),
      load("audit-events"),
      load("access-events"),
    ])
      .then(([a, b, c, d, e]) => {
        setIdentities(a);
        setInvitations(b);
        setSessions(c);
        setAudit(d);
        setAccess(e);
      })
      .catch((x) => setError(x.message));
  }

  useEffect(() => {
    queueMicrotask(refresh);
  }, []);

  async function mutate(path: string, method = "POST", body?: unknown) {
    const c = await fetch("/api/v1/security/csrf", { credentials: "include" });
    const t = await c.json();
    const r = await fetch(`/api/v1/infrastructure/${path}`, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json", [t.headerName]: t.token },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error("Operation failed");
    refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <Link href="/infrastructure/clients" className="text-sm text-cyan-300">
          ← OAuth clients
        </Link>
        <h1 className="mt-5 text-3xl font-semibold">
          Infrastructure operations
        </h1>
        <p className="mt-2 text-slate-400">
          Identity, invitation, authorization, audit, and access control.
          Actions are audited.
        </p>
        {error && <p className="mt-5 text-red-300">{error}</p>}
        <Section title="Identities">
          <table>
            <tbody>
              {identities.map((i) => (
                <tr key={i.id}>
                  <td>
                    {i.username}
                    <small>{i.email}</small>
                  </td>
                  <td>{i.roles.join(", ")}</td>
                  <td>{i.blocked ? "Blocked" : "Active"}</td>
                  <td>
                    <Button
                      onClick={() =>
                        mutate(`identities/${i.id}/block`, "POST", {
                          blocked: !i.blocked,
                        })
                      }
                    >
                      {i.blocked ? "Unblock" : "Block"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
        <Section title="Invitations">
          <Rows
            rows={invitations}
            action={(r) => (
              <Button onClick={() => mutate(`invitations/${r.id}/revoke`)}>
                Revoke
              </Button>
            )}
          />
        </Section>
        <Section title="Active authorizations">
          <Rows
            rows={sessions}
            action={(r) => (
              <Button onClick={() => mutate(`sessions/${r.id}`, "DELETE")}>
                Revoke
              </Button>
            )}
          />
        </Section>
        <Section title="Audit events">
          <Rows rows={audit} />
        </Section>
        <Section title="Access history">
          <Rows rows={access} />
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 overflow-auto rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Rows({
  rows,
  action,
}: {
  rows: Row[];
  action?: (row: Row) => React.ReactNode;
}) {
  return (
    <table className="w-full text-left text-sm">
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-slate-800">
            <td className="p-2 text-slate-300">
              {Object.entries(r)
                .slice(0, 5)
                .map(([k, v]) => (
                  <div key={k}>
                    <span className="text-slate-500">{k}: </span>
                    {String(v ?? "—")}
                  </div>
                ))}
            </td>
            {action && <td>{action(r)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
