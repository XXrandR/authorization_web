"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { ApiError, request } from "@/lib/http";
import { AdminEditor } from "./editor";
import { base, columns, labels, text } from "./types";
import type { Page, Row } from "./types";

type Action = {
  label: string;
  path: string;
  method?: string;
  body?: unknown;
};

const PAGE_SIZE = 8;

const primaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-control bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const secondaryButton =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-control border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-muted hover:text-content disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

const actionButton =
  "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-content-secondary transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-content disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

function describeResource(resource: string): string {
  switch (resource) {
    case "clients":
      return "Manage registered applications, OAuth configuration, and client access.";
    case "identities":
      return "Manage user identities, account status, and assigned roles.";
    case "roles":
      return "Manage authorization roles and the identities permitted to hold them.";
    case "invitations":
      return "Manage account invitations and their acceptance lifecycle.";
    case "authorizations":
      return "Inspect OAuth grants and tokens. Revocation behavior depends on token type and server configuration.";
    case "browser-sessions":
      return "Inspect interactive login sessions and expire sessions that should no longer be valid.";
    case "audit-events":
      return "Review recorded administrative and security-related changes.";
    case "access-events":
      return "Inspect recorded access activity and authentication-related events.";
    default:
      return "Search records and manage their lifecycle.";
  }
}

function actionDescription(action: Action): string {
  switch (action.label) {
    case "Delete":
      return "This permanently deletes the selected resource if the server permits it. This operation may be irreversible.";
    case "Revoke tokens":
      return "This requests revocation of the client's associated access. Existing self-contained access tokens may remain valid until expiry unless the server enforces revocation.";
    case "Revoke all access":
      return "This requests revocation of the identity's associated access. The exact effect depends on the authorization server and its token validation strategy.";
    case "Revoke":
      return "This revokes the selected authorization or invitation according to the server's implementation.";
    case "Expire session":
      return "This requests expiration of the selected browser session. The user may need to authenticate again.";
    case "Block":
      return "This blocks the identity. Confirm that your server applies this state to the authentication and authorization flows you intend to restrict.";
    case "Unblock":
      return "This removes the identity's blocked state. The account's other restrictions and permissions remain subject to server-side policy.";
    case "Resend":
      return "This requests another invitation message for the selected recipient.";
    default:
      return "This operation changes the selected resource. Verify the effect before proceeding.";
  }
}

function isDestructive(action: Action): boolean {
  return [
    "Delete",
    "Revoke",
    "Revoke tokens",
    "Revoke all access",
    "Expire session",
    "Block",
  ].includes(action.label);
}

function ActionButton({
  action,
  onClick,
}: {
  action: Action;
  onClick: () => void;
}) {
  const destructive = isDestructive(action);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        actionButton,
        destructive
          ? "border-error/20 text-error hover:border-error/40 hover:bg-error/5 hover:text-error"
          : "",
      ].join(" ")}
    >
      {action.label}
    </button>
  );
}

export function AdminResource({
  resource,
}: {
  resource: string;
}) {
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

  const load = useCallback(async (): Promise<Page> => {
    if (resource === "browser-sessions") {
      const records = await request<Row[]>(
        `${base}/browser-sessions`,
      );

      const filtered = records.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
      );

      return {
        items: filtered.slice(
          page * PAGE_SIZE,
          page * PAGE_SIZE + PAGE_SIZE,
        ),
        total: filtered.length,
        page,
        size: PAGE_SIZE,
      };
    }

    const endpoint =
      resource === "clients"
        ? "clients/page"
        : `records/${resource}`;

    return request<Page>(
      `${base}/${endpoint}?q=${encodeURIComponent(search)}&page=${page}&size=${PAGE_SIZE}`,
    );
  }, [resource, page, search]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await load();
      setData(result);
    } catch (reason) {
      handleError(reason);
    } finally {
      setLoading(false);
    }
  }, [load, handleError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!labels[resource]) {
    return (
      <section className="rounded-card border border-border bg-surface-raised p-8">
        <div className="flex size-10 items-center justify-center rounded-xl bg-surface-muted text-content-secondary">
          <ShieldCheck className="size-5" />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight">
          Unknown administration section
        </h1>

        <p className="mt-2 text-sm text-content-secondary">
          This resource is not registered in the administration console.
        </p>
      </section>
    );
  }

  const resourceColumns = columns[resource] ?? [];
  const editable = ["clients", "identities", "roles"].includes(resource);
  const creatable = editable || resource === "invitations";

  async function run() {
    if (!confirm || busy) return;

    const selectedAction = confirm;

    setBusy(true);
    setError(undefined);
    setStatus(undefined);

    try {
      await request(
        `${base}/${selectedAction.path}`,
        selectedAction.method ?? "POST",
        selectedAction.body,
      );

      setConfirm(undefined);
      setStatus(`${selectedAction.label} completed successfully.`);

      await refresh();
    } catch (reason) {
      handleError(reason);
    } finally {
      setBusy(false);
    }
  }

  function startSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearch(query.trim());
    setStatus(undefined);
    setError(undefined);
  }

  function resetSearch() {
    setQuery("");
    setSearch("");
    setPage(0);
    setStatus(undefined);
    setError(undefined);
  }

  const firstRecord =
    data && data.total > 0 ? page * PAGE_SIZE + 1 : 0;

  const lastRecord = data
    ? Math.min((page + 1) * PAGE_SIZE, data.total)
    : 0;

  return (
    <section className="min-w-0 space-y-6">
      {/* Page heading */}
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-xs text-content-muted">
            <span>Administration</span>
            <span aria-hidden="true">/</span>
            <span className="text-content-secondary">
              {labels[resource]}
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-content sm:text-4xl">
            {labels[resource]}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-content-secondary">
            {describeResource(resource)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading || busy}
            className={secondaryButton}
          >
            <RefreshCw
              className={[
                "size-4",
                loading ? "animate-spin" : "",
              ].join(" ")}
            />
            Refresh
          </button>

          {creatable && (
            <button
              type="button"
              onClick={() => setEditor(null)}
              className={primaryButton}
            >
              <Plus className="size-4" />
              Create{" "}
              {resource === "invitations"
                ? "invitation"
                : resource === "identities"
                  ? "identity"
                  : resource === "clients"
                    ? "client"
                    : resource === "roles"
                      ? "role"
                      : resource.slice(0, -1)}
            </button>
          )}
        </div>
      </header>

      {/* Resource summary */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-surface-raised p-4">
          <p className="text-xs font-medium text-content-muted">
            Total records
          </p>

          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold tracking-tight">
              {loading && !data
                ? "—"
                : (data?.total ?? 0).toLocaleString()}
            </p>

            <span className="mb-1 text-xs text-content-muted">
              {resource === "browser-sessions"
                ? "Interactive sessions"
                : "Matching this resource"}
            </span>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface-raised p-4">
          <p className="text-xs font-medium text-content-muted">
            Current view
          </p>

          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold tracking-tight">
              {data?.items.length ?? 0}
            </p>

            <span className="mb-1 text-xs text-content-muted">
              Records on this page
            </span>
          </div>
        </div>
      </div>

      {/* Search toolbar */}
      <form
        onSubmit={startSearch}
        className="flex flex-col gap-3 rounded-card border border-border bg-surface-raised p-3 sm:flex-row sm:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-content-muted"
          />

          <input
            aria-label="Search records"
            placeholder={`Search ${labels[resource].toLowerCase()}…`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-10 w-full rounded-control border border-transparent bg-surface-muted py-2 pl-10 pr-10 text-sm text-content outline-none transition-colors placeholder:text-content-muted focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/10"
          />

          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={resetSearch}
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-content-muted hover:bg-surface hover:text-content"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button type="submit" className={primaryButton}>
            <Search className="size-4" />
            Search
          </button>

          {search && (
            <button
              type="button"
              onClick={resetSearch}
              className={secondaryButton}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-card border border-error/20 bg-error/5 p-4"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-error" />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-content">
              Operation failed
            </p>

            <p className="mt-1 break-words text-sm leading-6 text-content-secondary">
              {error}
            </p>
          </div>

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError(undefined)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-content-muted hover:bg-surface-muted hover:text-content"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Success state */}
      {status && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-card border border-success/20 bg-success/5 p-4"
        >
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />

          <p className="flex-1 text-sm leading-6 text-content-secondary">
            {status}
          </p>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setStatus(undefined)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-content-muted hover:bg-surface-muted hover:text-content"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Data table */}
      <div className="overflow-hidden rounded-card border border-border bg-surface-raised">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-content">
              {labels[resource]} records
            </h2>

            <p className="mt-1 text-xs text-content-muted">
              {search
                ? `Filtered by "${search}"`
                : "Browse and manage registered records"}
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-content-secondary">
            <span
              className={[
                "size-1.5 rounded-full",
                loading ? "animate-pulse bg-warning" : "bg-success",
              ].join(" ")}
            />
            {loading ? "Updating" : "Loaded"}
          </span>
        </div>

        {loading && !data ? (
          <div
            role="status"
            className="flex min-h-64 flex-col items-center justify-center px-6 py-12"
          >
            <LoaderCircle className="size-6 animate-spin text-brand" />

            <p className="mt-4 text-sm font-medium text-content">
              Loading records
            </p>

            <p className="mt-1 text-xs text-content-muted">
              Retrieving {labels[resource].toLowerCase()}…
            </p>
          </div>
        ) : error && !data ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 py-12 text-center">
            <AlertTriangle className="size-6 text-error" />

            <p className="mt-4 text-sm font-medium text-content">
              Records could not be loaded
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-content-secondary">
              Resolve the request error above, then try refreshing the data.
            </p>

            <button
              type="button"
              onClick={() => void refresh()}
              className={`${secondaryButton} mt-4`}
            >
              <RefreshCw className="size-4" />
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/70">
                    {resourceColumns.map((column) => (
                      <th
                        key={column}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-content-muted sm:px-5"
                      >
                        {column.replaceAll("_", " ")}
                      </th>
                    ))}

                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-content-muted sm:px-5"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {data?.items.map((row, index) => {
                    const rowKey =
                      text(row, "id") ||
                      text(row, "clientId") ||
                      `${resource}-${index}`;

                    return (
                      <tr
                        key={rowKey}
                        className="group transition-colors hover:bg-surface-muted/60"
                      >
                        {resourceColumns.map((column) => {
                          const value = row[column];

                          const displayValue = Array.isArray(value)
                            ? value.join(", ")
                            : value == null || value === ""
                              ? "—"
                              : String(value);

                          return (
                            <td
                              key={column}
                              className="max-w-xs px-4 py-3.5 text-content-secondary sm:px-5"
                            >
                              <span
                                className="block break-words"
                                title={
                                  displayValue === "—"
                                    ? undefined
                                    : displayValue
                                }
                              >
                                {displayValue}
                              </span>
                            </td>
                          );
                        })}

                        <td className="px-4 py-3.5 sm:px-5">
                          <div className="flex min-w-max flex-wrap gap-1.5">
                            {editable && (
                              <button
                                type="button"
                                onClick={() => setEditor(row)}
                                className={actionButton}
                              >
                                Edit
                              </button>
                            )}

                            {actions(resource, row).map((action) => (
                              <ActionButton
                                key={action.label}
                                action={action}
                                onClick={() => {
                                  setError(undefined);
                                  setConfirm(action);
                                }}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!data?.items.length && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-muted text-content-muted">
                  <Search className="size-5" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-content">
                  {search ? "No matching records" : "No records yet"}
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-6 text-content-secondary">
                  {search
                    ? "Try another search term or clear your filters to see more results."
                    : `There are currently no ${labels[resource].toLowerCase()} to display.`}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={resetSearch}
                    className={`${secondaryButton} mt-4`}
                  >
                    Clear search
                  </button>
                )}

                {!search && creatable && (
                  <button
                    type="button"
                    onClick={() => setEditor(null)}
                    className={`${primaryButton} mt-4`}
                  >
                    <Plus className="size-4" />
                    Create first record
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {data && (
          <footer className="flex flex-col gap-4 border-t border-border bg-surface-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-content-secondary">
              {data.total === 0 ? (
                "No records to display"
              ) : (
                <>
                  <span className="font-medium text-content">
                    {firstRecord.toLocaleString()}–{lastRecord.toLocaleString()}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-content">
                    {data.total.toLocaleString()}
                  </span>{" "}
                  records
                </>
              )}
            </p>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-xs text-content-muted">
                Page {page + 1}
                {data.total > 0
                  ? ` of ${Math.ceil(data.total / PAGE_SIZE)}`
                  : ""}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 0 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  className={secondaryButton}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    !data ||
                    (page + 1) * PAGE_SIZE >= data.total ||
                    loading
                  }
                  onClick={() => setPage((current) => current + 1)}
                  className={secondaryButton}
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* Create / edit dialog */}
      {editor !== undefined && (
        <AdminEditor
          resource={resource}
          record={editor}
          onClose={() => setEditor(undefined)}
          onSaved={async () => {
            setStatus("Changes saved successfully.");
            await refresh();
          }}
        />
      )}

      {/* Action confirmation dialog */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) {
              setConfirm(undefined);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            aria-describedby="admin-confirm-description"
            className="my-auto w-full max-w-md overflow-hidden rounded-panel border border-border bg-surface shadow-2xl shadow-black/20"
          >
            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div
                  className={[
                    "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                    isDestructive(confirm)
                      ? "border-error/20 bg-error/5 text-error"
                      : "border-brand/20 bg-brand/10 text-brand",
                  ].join(" ")}
                >
                  {isDestructive(confirm) ? (
                    <AlertTriangle className="size-5" />
                  ) : (
                    <ShieldCheck className="size-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-content-muted">
                    Administrative action
                  </p>

                  <h2
                    id="admin-confirm-title"
                    className="mt-1.5 text-xl font-semibold tracking-tight text-content"
                  >
                    {confirm.label}?
                  </h2>
                </div>

                <button
                  type="button"
                  aria-label="Close confirmation"
                  disabled={busy}
                  onClick={() => setConfirm(undefined)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-muted hover:text-content disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p
                id="admin-confirm-description"
                className="mt-5 text-sm leading-6 text-content-secondary"
              >
                {actionDescription(confirm)}
              </p>

              <div className="mt-4 flex items-start gap-2.5 rounded-control border border-border bg-surface-muted p-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-content-muted" />

                <p className="text-xs leading-5 text-content-muted">
                  Administrative operations should be recorded by the
                  server's audit mechanism. This confirmation does not
                  replace server-side authorization.
                </p>
              </div>
            </div>

            <footer className="flex flex-col-reverse gap-2 border-t border-border bg-surface-muted/30 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirm(undefined)}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => void run()}
                className={[
                  "inline-flex min-h-10 items-center justify-center gap-2 rounded-control px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isDestructive(confirm)
                    ? "bg-error text-white hover:bg-error/90 focus-visible:ring-error"
                    : "bg-brand text-brand-foreground hover:bg-brand-hover focus-visible:ring-brand",
                ].join(" ")}
              >
                {busy ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    {confirm.label}
                    <ArrowUpRight className="size-4" />
                  </>
                )}
              </button>
            </footer>
          </section>
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
      {
        label: "Revoke tokens",
        path: `clients/${client}/revoke-access`,
      },
      {
        label: "Delete",
        path: `clients/${client}`,
        method: "DELETE",
      },
    ];
  }

  if (resource === "identities") {
    return [
      {
        label: row.blocked ? "Unblock" : "Block",
        path: `identities/${id}/block`,
        body: { blocked: !row.blocked },
      },
      {
        label: "Revoke all access",
        path: `identities/${id}/revoke-access`,
      },
      {
        label: "Delete",
        path: `identities/${id}`,
        method: "DELETE",
      },
    ];
  }

  if (resource === "roles" && row.system !== true) {
    return [
      {
        label: "Delete",
        path: `roles/${id}`,
        method: "DELETE",
      },
    ];
  }

  if (resource === "invitations" && !row.accepted_at) {
    return [
      {
        label: "Resend",
        path: `invitations/${id}/resend`,
      },
      {
        label: "Revoke",
        path: `invitations/${id}/revoke`,
      },
    ];
  }

  if (resource === "authorizations") {
    return [
      {
        label: "Revoke",
        path: `sessions/${id}`,
        method: "DELETE",
      },
    ];
  }

  if (resource === "browser-sessions") {
    return [
      {
        label: "Expire session",
        path: `browser-sessions/${id}`,
        method: "DELETE",
      },
    ];
  }

  return [];
}