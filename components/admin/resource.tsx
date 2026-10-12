"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, request } from "@/lib/http";
import { AdminEditor } from "./editor";
import { base, columns, labels, text } from "./types";
import type { Page, Row } from "./types";

type Action = { label: string; path: string; method?: string; body?: unknown };

export function AdminResource({ resource }: { resource: string }) {
  const router = useRouter();
  const [data, setData] = useState<Page>();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<Row | null>();
  const [confirm, setConfirm] = useState<Action>();
  const [busy, setBusy] = useState(false);
  const handleError = useCallback(
    (reason: unknown) => {
      if (reason instanceof ApiError && reason.status === 401) {
        router.replace(
          `/login?continue=${encodeURIComponent(`/admin/${resource}`)}`,
        );
        return;
      }
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to complete the operation.",
      );
    },
    [router, resource],
  );
  const load = useCallback(async () => {
    try {
      if (resource === "browser-sessions") {
        const records = await request<Row[]>(`${base}/browser-sessions`);
        const filtered = records.filter((row) =>
          JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
        );
        return {
          items: filtered.slice(page * 20, page * 20 + 20),
          total: filtered.length,
          page,
          size: 20,
        };
      } else {
        const endpoint =
          resource === "clients" ? "clients/page" : `records/${resource}`;
        return await request<Page>(
          `${base}/${endpoint}?q=${encodeURIComponent(search)}&page=${page}&size=20`,
        );
      }
    } catch (reason) {
      throw reason;
    }
  }, [resource, page, search]);
  const refresh = useCallback(
    () =>
      load()
        .then(setData)
        .catch(handleError)
        .finally(() => setLoading(false)),
    [load, handleError],
  );
  useEffect(() => {
    void refresh();
  }, [refresh]);
  if (!labels[resource]) return <p>Unknown administration section.</p>;
  const editable = ["clients", "identities", "roles"].includes(resource);
  const creatable = editable || resource === "invitations";
  async function run() {
    if (!confirm) return;
    setBusy(true);
    setError(undefined);
    try {
      await request(
        `${base}/${confirm.path}`,
        confirm.method ?? "POST",
        confirm.body,
      );
      setStatus(`${confirm.label} completed.`);
      setConfirm(undefined);
      await refresh();
    } catch (reason) {
      handleError(reason);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">{labels[resource]}</h1>
        {creatable && (
          <button
            className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
            onClick={() => setEditor(null)}
          >
            Create{" "}
            {resource === "invitations" ? "invitation" : resource.slice(0, -1)}
          </button>
        )}
      </div>
      <p className="mt-3 text-sm text-slate-400">
        {resource === "authorizations"
          ? "OAuth grants and tokens—not browser sessions. Revocation prevents refresh/introspection; offline JWTs remain valid until expiry."
          : resource === "browser-sessions"
            ? "Interactive login sessions on this API instance. Revoked sessions receive 401 on their next request."
            : "Search records and manage their lifecycle. Administrative changes are audited."}
      </p>
      <form
        className="my-6 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(query);
          setPage(0);
        }}
      >
        <input
          aria-label="Search records"
          placeholder="Search…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 rounded-lg border border-slate-700 bg-slate-900 p-2"
        />
        <button className="rounded-lg bg-slate-800 px-4">Search</button>
        <button
          type="button"
          className="rounded-lg bg-slate-800 px-4"
          onClick={() => void refresh()}
        >
          Refresh
        </button>
      </form>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-800 bg-red-950 p-3 text-red-200"
        >
          {error}
        </p>
      )}
      {status && (
        <p role="status" className="mb-4 text-cyan-300">
          {status}
        </p>
      )}
      {loading ? (
        <p role="status">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900">
              <tr>
                {columns[resource].map((column) => (
                  <th key={column} className="p-3 capitalize">
                    {column.replaceAll("_", " ")}
                  </th>
                ))}
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((row, index) => (
                <tr
                  key={text(row, "id") || text(row, "clientId") || index}
                  className="border-t border-slate-800"
                >
                  {columns[resource].map((column) => (
                    <td
                      key={column}
                      className="max-w-xs break-words p-3 text-slate-300"
                    >
                      {Array.isArray(row[column])
                        ? (row[column] as string[]).join(", ")
                        : row[column] == null
                          ? "—"
                          : String(row[column])}
                    </td>
                  ))}
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {editable && (
                        <button
                          className="text-cyan-300"
                          onClick={() => setEditor(row)}
                        >
                          Edit
                        </button>
                      )}
                      {actions(resource, row).map((action) => (
                        <button
                          className="text-amber-300"
                          key={action.label}
                          onClick={() => setConfirm(action)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.items.length && (
            <p className="p-5 text-slate-400">No matching records.</p>
          )}
        </div>
      )}
      {data && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span>
            {data.total} records · Page {page + 1}
          </span>
          <div className="flex gap-4">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="disabled:opacity-30"
            >
              Previous
            </button>
            <button
              disabled={(page + 1) * 20 >= data.total}
              onClick={() => setPage(page + 1)}
              className="disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {editor !== undefined && (
        <AdminEditor
          resource={resource}
          record={editor}
          onClose={() => setEditor(undefined)}
          onSaved={async () => {
            setStatus("Changes saved.");
            await refresh();
          }}
        />
      )}
      {confirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={confirm.label}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-xl">{confirm.label}?</h2>
            <p className="my-5 text-sm text-slate-400">
              This changes access immediately and is audited. Deletion cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button disabled={busy} onClick={() => setConfirm(undefined)}>
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={() => void run()}
                className="rounded bg-amber-400 px-4 py-2 text-slate-950"
              >
                {busy ? "Working…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function actions(resource: string, row: Row): Action[] {
  const id = encodeURIComponent(text(row, "id"));
  if (resource === "clients") {
    const client = encodeURIComponent(text(row, "clientId"));
    return [
      { label: "Revoke tokens", path: `clients/${client}/revoke-access` },
      { label: "Delete", path: `clients/${client}`, method: "DELETE" },
    ];
  }
  if (resource === "identities")
    return [
      {
        label: row.blocked ? "Unblock" : "Block",
        path: `identities/${id}/block`,
        body: { blocked: !row.blocked },
      },
      { label: "Revoke all access", path: `identities/${id}/revoke-access` },
      { label: "Delete", path: `identities/${id}`, method: "DELETE" },
    ];
  if (resource === "roles" && !row.system)
    return [{ label: "Delete", path: `roles/${id}`, method: "DELETE" }];
  if (resource === "invitations" && !row.accepted_at)
    return [
      { label: "Resend", path: `invitations/${id}/resend` },
      { label: "Revoke", path: `invitations/${id}/revoke` },
    ];
  if (resource === "authorizations")
    return [{ label: "Revoke", path: `sessions/${id}`, method: "DELETE" }];
  if (resource === "browser-sessions")
    return [
      {
        label: "Expire session",
        path: `browser-sessions/${id}`,
        method: "DELETE",
      },
    ];
  return [];
}
