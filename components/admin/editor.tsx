"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";

import { request } from "@/lib/http";
import { Field } from "@/components/account-form";
import { base, text } from "./types";
import type { Row } from "./types";

const split = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const controlClass =
  "mt-2 block w-full rounded-control border border-border bg-surface px-3.5 py-3 text-sm text-content outline-none transition-colors placeholder:text-content-muted focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-50";

const checkboxClass =
  "size-4 shrink-0 rounded border-border accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-control border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-muted hover:text-content disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-control bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="border-b border-border pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-content-muted">
      {children}
    </h3>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-control border border-border bg-surface-muted/50 p-3.5 transition-colors hover:border-border-strong has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className={`${checkboxClass} mt-0.5`}
      />

      <span className="min-w-0">
        <span className="block text-sm font-medium text-content">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-xs leading-5 text-content-secondary">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export function AdminEditor({
  resource,
  record,
  onClose,
  onSaved,
}: {
  resource: string;
  record: Row | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [username, setUsername] = useState(
    record ? text(record, "username") : "",
  );
  const [email, setEmail] = useState(
    record ? text(record, "email") : "",
  );
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState(
    record ? text(record, "name") : "",
  );
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>(
    record && typeof record.roles === "string"
      ? split(record.roles)
      : ["USER"],
  );
  const [rolesLoading, setRolesLoading] = useState(false);

  const [active, setActive] = useState(
    record ? Boolean(record.active) : true,
  );

  const [clientId, setClientId] = useState(
    record ? text(record, "clientId") : "",
  );
  const [clientName, setClientName] = useState(
    record ? text(record, "clientName") : "",
  );
  const [clientType, setClientType] = useState(
    record?.machine
      ? "machine"
      : record?.publicClient || !record
        ? "public"
        : "confidential",
  );
  const [uris, setUris] = useState(
    record && Array.isArray(record.redirectUris)
      ? record.redirectUris.join("\n")
      : "",
  );
  const [scopes, setScopes] = useState(
    record && Array.isArray(record.scopes)
      ? record.scopes.join(", ")
      : "openid, profile, api.read",
  );
  const [enabled, setEnabled] = useState(
    record ? Boolean(record.enabled) : true,
  );

  const [secret, setSecret] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const title = `${record ? "Edit" : "Create"} ${resource.replaceAll("-", " ")}`;

  useEffect(() => {
    if (resource !== "identities" && resource !== "invitations") {
      return;
    }

    let cancelled = false;

    async function loadRoles() {
      setRolesLoading(true);

      try {
        const result = await request<string[]>(`${base}/roles`);

        if (!cancelled) {
          setAvailableRoles(result);
        }
      } catch (reason) {
        if (!cancelled) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load roles",
          );
        }
      } finally {
        if (!cancelled) {
          setRolesLoading(false);
        }
      }
    }

    void loadRoles();

    return () => {
      cancelled = true;
    };
  }, [resource]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onClose]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setError(undefined);

    try {
      if (resource === "clients") {
        const spec = {
          clientId,
          clientName,
          publicClient: clientType === "public",
          machine: clientType === "machine",
          redirectUris: split(uris),
          scopes: split(scopes),
          enabled,
        };

        const result = await request<
          { clientSecret?: string } | undefined
        >(
          `${base}/clients${
            record ? `/${encodeURIComponent(clientId)}` : ""
          }`,
          "POST",
          spec,
        );

        if (result?.clientSecret) {
          setSecret(result.clientSecret);
          setCopied(false);
          await onSaved();
          return;
        }
      } else if (resource === "identities") {
        if (record) {
          await request(
            `${base}/identities/${record.id}`,
            "POST",
            {
              username,
              email,
              active,
              roles,
            },
          );
        } else {
          await request(`${base}/identities`, "POST", {
            username,
            email,
            password,
            roles,
          });
        }
      } else if (resource === "roles") {
        await request(
          `${base}/roles${record ? `/${record.id}` : ""}`,
          "POST",
          {
            name: roleName,
          },
        );
      } else if (resource === "invitations") {
        await request(`${base}/invitations`, "POST", {
          email,
          roles,
        });
      }

      await onSaved();
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save changes",
      );
    } finally {
      setBusy(false);
    }
  }

  async function rotate() {
    if (busy) return;

    const confirmed = window.confirm(
      "Rotate this confidential client secret? Existing integrations must switch to the new secret.",
    );

    if (!confirmed) return;

    setBusy(true);
    setError(undefined);

    try {
      const credential = await request<{ clientSecret: string }>(
        `${base}/clients/${encodeURIComponent(clientId)}/secret-rotations`,
        "POST",
      );

      setSecret(credential.clientSecret);
      setCopied(false);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to rotate secret",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copySecret() {
    if (!secret) return;

    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      setError(
        "Unable to copy the secret. Copy it manually from the field above.",
      );
    }
  }

  function toggleRole(role: string, checked: boolean) {
    setRoles((current) =>
      checked
        ? current.includes(role)
          ? current
          : [...current, role]
        : current.filter((item) => item !== role),
    );
  }

  const isClient = resource === "clients";
  const isIdentity = resource === "identities";
  const isRole = resource === "roles";
  const isInvitation = resource === "invitations";
  const hasRoleAssignment = isIdentity || isInvitation;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-editor-title"
        className="relative my-auto flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-panel border border-border bg-surface shadow-2xl shadow-black/10"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-7">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand">
              {secret ? (
                <KeyRound className="size-5" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-content-muted">
                Protector Identity / Administration
              </p>

              <h2
                id="admin-editor-title"
                className="mt-1.5 text-xl font-semibold tracking-tight text-content"
              >
                {secret ? "Client credential" : title}
              </h2>

              <p className="mt-1 text-xs text-content-secondary">
                {secret
                  ? "Store this credential securely before closing."
                  : record
                    ? "Update the selected resource."
                    : "Configure a new resource."}
              </p>
            </div>
          </div>

          {!secret && (
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close editor"
              className="flex size-9 shrink-0 items-center justify-center rounded-control text-content-muted transition-colors hover:bg-surface-muted hover:text-content disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="size-4" />
            </button>
          )}
        </header>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {secret ? (
            <div className="space-y-5">
              <div className="rounded-card border border-warning/20 bg-warning/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />

                  <div>
                    <p className="text-sm font-semibold text-content">
                      Save this secret now
                    </p>

                    <p className="mt-1 text-sm leading-6 text-content-secondary">
                      This credential may not be displayed again. Store it
                      in your secret manager and never commit it to source
                      control or expose it in client-side application code.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="generated-client-secret"
                  className="text-xs font-medium text-content-secondary"
                >
                  Generated client secret
                </label>

                <textarea
                  id="generated-client-secret"
                  readOnly
                  rows={4}
                  value={secret}
                  onFocus={(event) => event.currentTarget.select()}
                  className={`${controlClass} resize-y break-all font-mono text-xs leading-6`}
                />

                <button
                  type="button"
                  onClick={() => void copySecret()}
                  className={`${secondaryButtonClass} mt-3 w-full`}
                >
                  {copied ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}

                  {copied ? "Copied to clipboard" : "Copy secret"}
                </button>
              </div>

              <p className="text-xs leading-5 text-content-muted">
                Clipboard contents may remain available to other
                applications. Clear the clipboard if required by your
                organization's credential-handling policy.
              </p>
            </div>
          ) : (
            <form
              id="admin-editor-form"
              onSubmit={save}
              className="space-y-6"
            >
              {isClient && (
                <section className="space-y-4">
                  <SectionHeading>Client identity</SectionHeading>

                  <Field
                    label="Client ID"
                    required
                    pattern="[A-Za-z0-9._-]{3,100}"
                    maxLength={100}
                    autoComplete="off"
                    value={clientId}
                    disabled={Boolean(record) || busy}
                    onChange={(event) =>
                      setClientId(event.target.value)
                    }
                  />

                  <Field
                    label="Display name"
                    required
                    maxLength={255}
                    value={clientName}
                    disabled={busy}
                    onChange={(event) =>
                      setClientName(event.target.value)
                    }
                  />

                  <div>
                    <label
                      htmlFor="client-type"
                      className="block text-sm font-medium text-content"
                    >
                      Client type
                    </label>

                    <select
                      id="client-type"
                      disabled={Boolean(record) || busy}
                      value={clientType}
                      onChange={(event) => {
                        const value = event.target.value;

                        setClientType(value);

                        if (value === "machine") {
                          setUris("");
                          setScopes("api.read");
                        }
                      }}
                      className={controlClass}
                    >
                      <option value="public">
                        Public web/mobile (PKCE)
                      </option>

                      <option value="confidential">
                        Confidential web / BFF
                      </option>

                      <option value="machine">
                        Machine-to-machine
                      </option>
                    </select>

                    <p className="mt-2 text-xs leading-5 text-content-muted">
                      {clientType === "public"
                        ? "For native and browser-based public clients. Use Authorization Code with PKCE."
                        : clientType === "confidential"
                          ? "For server-side applications that can securely protect client credentials."
                          : "For service-to-service communication using the client credentials flow."}
                    </p>
                  </div>
                </section>
              )}

              {isClient && (
                <section className="space-y-4">
                  <SectionHeading>Redirects and permissions</SectionHeading>

                  {clientType !== "machine" && (
                    <div>
                      <label
                        htmlFor="client-redirect-uris"
                        className="block text-sm font-medium text-content"
                      >
                        Exact redirect URIs
                        <span className="ml-1 text-content-muted">
                          (one per line)
                        </span>
                      </label>

                      <textarea
                        id="client-redirect-uris"
                        required
                        disabled={busy}
                        rows={3}
                        value={uris}
                        onChange={(event) =>
                          setUris(event.target.value)
                        }
                        placeholder={
                          "https://app.example.com/callback\ncom.example.app:/oauth/callback"
                        }
                        className={`${controlClass} resize-y font-mono text-xs leading-6`}
                      />

                      <p className="mt-1.5 text-xs text-content-muted">
                        Redirect URIs should match registered values
                        exactly.
                      </p>
                    </div>
                  )}

                  <Field
                    label="Scopes (comma separated)"
                    required
                    value={scopes}
                    disabled={busy}
                    onChange={(event) => setScopes(event.target.value)}
                  />

                  {record && (
                    <ToggleRow
                      label="Client enabled"
                      description="Disabling this client may prevent new authorization flows. Confirm the server's revocation behavior before relying on this toggle to revoke existing tokens."
                      checked={enabled}
                      disabled={busy}
                      onChange={setEnabled}
                    />
                  )}

                  {record && (
                    <div className="rounded-card border border-border bg-surface-muted/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-content-muted">
                        Security configuration
                      </p>

                      <dl className="mt-3 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-content-secondary">
                            Proof Key for Code Exchange
                          </dt>
                          <dd className="font-mono text-xs text-content">
                            {String(record.requireProofKey)}
                          </dd>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-content-secondary">
                            Consent required
                          </dt>
                          <dd className="font-mono text-xs text-content">
                            {String(record.requireConsent)}
                          </dd>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-content-secondary">
                            Secret expiry
                          </dt>
                          <dd className="text-right text-xs text-content">
                            {text(record, "secretExpiresAt") || "None"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  {record && clientType !== "public" && (
                    <div className="rounded-card border border-border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-content-secondary">
                          <KeyRound className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-content">
                            Client secret
                          </p>

                          <p className="mt-1 text-xs leading-5 text-content-secondary">
                            Rotate the credential if it has been exposed
                            or needs to be replaced. Existing integrations
                            may need to be updated immediately.
                          </p>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void rotate()}
                            className={`${secondaryButtonClass} mt-3`}
                          >
                            {busy && (
                              <LoaderCircle className="size-4 animate-spin" />
                            )}
                            Rotate secret
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {isIdentity && (
                <section className="space-y-4">
                  <SectionHeading>Identity details</SectionHeading>

                  <Field
                    label="Username"
                    required
                    pattern="[A-Za-z0-9._-]{3,50}"
                    maxLength={50}
                    autoComplete="username"
                    disabled={Boolean(record) || busy}
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                  />

                  <Field
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    disabled={busy}
                    onChange={(event) => setEmail(event.target.value)}
                  />

                  {!record && (
                    <>
                      <Field
                        label="Initial password"
                        required
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={72}
                        value={password}
                        disabled={busy}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                      />

                      <p className="-mt-2 text-xs leading-5 text-content-muted">
                        Use your identity service's password policy as
                        the source of truth. The form's length limits
                        must match the backend's accepted password
                        format.
                      </p>
                    </>
                  )}

                  {record && (
                    <ToggleRow
                      label="Identity active"
                      description="Controls whether this identity should remain active, subject to the server's authorization rules."
                      checked={active}
                      disabled={busy}
                      onChange={setActive}
                    />
                  )}
                </section>
              )}

              {isRole && (
                <section className="space-y-4">
                  <SectionHeading>Role configuration</SectionHeading>

                  <Field
                    label="Role name"
                    required
                    pattern="[A-Z][A-Z0-9_]{1,49}"
                    maxLength={50}
                    disabled={Boolean(record?.system) || busy}
                    value={roleName}
                    onChange={(event) =>
                      setRoleName(event.target.value)
                    }
                  />

                  <p className="text-xs leading-5 text-content-muted">
                    Use uppercase letters, numbers, and underscores.
                    Role names must start with a letter.
                  </p>

                  {record?.system === true && (
                    <div className="flex items-start gap-2.5 rounded-control border border-border bg-surface-muted p-3 text-xs leading-5 text-content-secondary">
                      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
                      System roles cannot be renamed here.
                    </div>
                  )}
                </section>
              )}

              {isInvitation && (
                <section className="space-y-4">
                  <SectionHeading>Invitation details</SectionHeading>

                  <Field
                    label="Recipient email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    disabled={busy}
                    onChange={(event) => setEmail(event.target.value)}
                  />

                  <p className="text-xs leading-5 text-content-muted">
                    The recipient's access should be provisioned
                    according to your invitation acceptance flow.
                  </p>
                </section>
              )}

              {hasRoleAssignment && (
                <section className="space-y-3">
                  <SectionHeading>Assigned roles</SectionHeading>

                  <p className="text-xs leading-5 text-content-secondary">
                    Choose the roles this {isIdentity ? "identity" : "invite"}
                    {" "}should receive. Grant only the permissions required.
                  </p>

                  {rolesLoading ? (
                    <div
                      role="status"
                      className="flex items-center gap-2 py-3 text-sm text-content-secondary"
                    >
                      <LoaderCircle className="size-4 animate-spin text-brand" />
                      Loading available roles…
                    </div>
                  ) : availableRoles.length === 0 ? (
                    <div className="rounded-control border border-border bg-surface-muted p-4">
                      <p className="text-sm font-medium text-content">
                        No roles available
                      </p>
                      <p className="mt-1 text-xs leading-5 text-content-secondary">
                        {error
                          ? "Roles could not be loaded. Resolve the error before saving."
                          : "Create a role before assigning it to this resource."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableRoles.map((role) => {
                        const selected = roles.includes(role);

                        return (
                          <label
                            key={role}
                            className={[
                              "flex cursor-pointer items-center gap-3 rounded-control border p-3 transition-colors",
                              selected
                                ? "border-brand/40 bg-brand/5"
                                : "border-border bg-surface-raised hover:bg-surface-muted",
                              busy || rolesLoading
                                ? "cursor-not-allowed opacity-60"
                                : "",
                            ].join(" ")}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              disabled={busy || rolesLoading}
                              onChange={(event) =>
                                toggleRole(role, event.target.checked)
                              }
                              className={checkboxClass}
                            />

                            <span className="min-w-0 break-all text-sm font-medium text-content">
                              {role}
                            </span>

                            {selected && (
                              <Check className="ml-auto size-4 shrink-0 text-brand" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {roles.length === 0 && (
                    <p className="text-xs text-warning">
                      Select at least one role.
                    </p>
                  )}
                </section>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-control border border-error/20 bg-error/5 p-3.5"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-error" />

                  <p className="text-sm leading-5 text-error">{error}</p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <footer className="flex flex-col-reverse gap-2 border-t border-border bg-surface-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          {secret ? (
            <p className="text-xs text-content-muted">
              Keep credentials out of logs and source control.
            </p>
          ) : (
            <p className="text-xs text-content-muted">
              {record ? "Changes apply when saved." : "Fields marked required must be completed."}
            </p>
          )}

          <div className="flex justify-end gap-2">
            {!secret && (
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
            )}

            <button
              type={secret ? "button" : "submit"}
              form={secret ? undefined : "admin-editor-form"}
              disabled={
                secret
                  ? false
                  : busy ||
                    rolesLoading ||
                    (Boolean(record?.system) && isRole) ||
                    (hasRoleAssignment &&
                      (!roles.length || availableRoles.length === 0))
              }
              onClick={
                secret
                  ? onClose
                  : undefined
              }
              className={primaryButtonClass}
            >
              {busy && (
                <LoaderCircle className="size-4 animate-spin" />
              )}

              {secret
                ? "I've saved the secret"
                : busy
                  ? "Saving changes…"
                  : record
                    ? "Save changes"
                    : "Create resource"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}


// "use client";

// import { useEffect, useState } from "react";
// import type { FormEvent } from "react";
// import { Button } from "@heroui/react";
// import { request } from "@/lib/http";
// import { Field } from "@/components/account-form";
// import { base, text } from "./types";
// import type { Row } from "./types";

// const split = (value: string) =>
//   value
//     .split(/[\n,]+/)
//     .map((item) => item.trim())
//     .filter(Boolean);

// export function AdminEditor({
//   resource,
//   record,
//   onClose,
//   onSaved,
// }: {
//   resource: string;
//   record: Row | null;
//   onClose: () => void;
//   onSaved: () => Promise<void>;
// }) {
//   const [username, setUsername] = useState(
//     record ? text(record, "username") : "",
//   );
//   const [email, setEmail] = useState(record ? text(record, "email") : "");
//   const [password, setPassword] = useState("");
//   const [roleName, setRoleName] = useState(record ? text(record, "name") : "");
//   const [availableRoles, setAvailableRoles] = useState<string[]>([]);
//   const [roles, setRoles] = useState<string[]>(
//     record && typeof record.roles === "string" ? split(record.roles) : ["USER"],
//   );
//   const [active, setActive] = useState(record ? Boolean(record.active) : true);
//   const [clientId, setClientId] = useState(
//     record ? text(record, "clientId") : "",
//   );
//   const [clientName, setClientName] = useState(
//     record ? text(record, "clientName") : "",
//   );
//   const [clientType, setClientType] = useState(
//     record?.machine
//       ? "machine"
//       : record?.publicClient || !record
//         ? "public"
//         : "confidential",
//   );
//   const [uris, setUris] = useState(
//     record && Array.isArray(record.redirectUris)
//       ? record.redirectUris.join("\n")
//       : "",
//   );
//   const [scopes, setScopes] = useState(
//     record && Array.isArray(record.scopes)
//       ? record.scopes.join(", ")
//       : "openid, profile, api.read",
//   );
//   const [enabled, setEnabled] = useState(
//     record ? Boolean(record.enabled) : true,
//   );
//   const [secret, setSecret] = useState<string>();
//   const [error, setError] = useState<string>();
//   const [busy, setBusy] = useState(false);
//   useEffect(() => {
//     if (resource === "identities" || resource === "invitations") {
//       request<string[]>(`${base}/roles`)
//         .then(setAvailableRoles)
//         .catch((reason) =>
//           setError(
//             reason instanceof Error ? reason.message : "Unable to load roles",
//           ),
//         );
//     }
//   }, [resource]);
//   async function save(event: FormEvent) {
//     event.preventDefault();
//     setBusy(true);
//     setError(undefined);
//     try {
//       if (resource === "clients") {
//         const spec = {
//           clientId,
//           clientName,
//           publicClient: clientType === "public",
//           machine: clientType === "machine",
//           redirectUris: split(uris),
//           scopes: split(scopes),
//           enabled,
//         };
//         const result = await request<{ clientSecret?: string } | undefined>(
//           `${base}/clients${record ? `/${encodeURIComponent(clientId)}` : ""}`,
//           "POST",
//           spec,
//         );
//         if (result?.clientSecret) {
//           setSecret(result.clientSecret);
//           await onSaved();
//           return;
//         }
//       } else if (resource === "identities") {
//         if (record) {
//           await request(`${base}/identities/${record.id}`, "POST", {
//             username,
//             email,
//             active,
//             roles,
//           });
//         } else
//           await request(`${base}/identities`, "POST", {
//             username,
//             email,
//             password,
//             roles,
//           });
//       } else if (resource === "roles") {
//         await request(`${base}/roles${record ? `/${record.id}` : ""}`, "POST", {
//           name: roleName,
//         });
//       } else if (resource === "invitations")
//         await request(`${base}/invitations`, "POST", { email, roles });
//       await onSaved();
//       onClose();
//     } catch (reason) {
//       setError(
//         reason instanceof Error ? reason.message : "Unable to save changes",
//       );
//     } finally {
//       setBusy(false);
//     }
//   }
//   async function rotate() {
//     if (
//       !window.confirm(
//         "Rotate this confidential client secret? Existing integrations must switch to the new secret.",
//       )
//     )
//       return;
//     setBusy(true);
//     setError(undefined);
//     try {
//       const credential = await request<{ clientSecret: string }>(
//         `${base}/clients/${encodeURIComponent(clientId)}/secret-rotations`,
//         "POST",
//       );
//       setSecret(credential.clientSecret);
//     } catch (reason) {
//       setError(
//         reason instanceof Error ? reason.message : "Unable to rotate secret",
//       );
//     } finally {
//       setBusy(false);
//     }
//   }
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//       <section
//         role="dialog"
//         aria-modal="true"
//         aria-label={`${record ? "Edit" : "Create"} ${resource}`}
//         className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-6"
//       >
//         <h2 className="mb-5 text-xl font-semibold">
//           {record ? "Edit" : "Create"} {resource}
//         </h2>
//         {secret ? (
//           <div>
//             <p className="text-sm text-amber-200">
//               Copy this secret into your secret manager now. It is shown only
//               once.
//             </p>
//             <code className="my-5 block break-all rounded-lg bg-slate-950 p-4">
//               {secret}
//             </code>
//             <Button onPress={onClose}>I saved the secret</Button>
//           </div>
//         ) : (
//           <form onSubmit={save} className="space-y-4">
//             {resource === "clients" && (
//               <>
//                 <Field
//                   label="Client ID"
//                   required
//                   pattern="[A-Za-z0-9._-]{3,100}"
//                   value={clientId}
//                   disabled={Boolean(record)}
//                   onChange={(e) => setClientId(e.target.value)}
//                 />
//                 <Field
//                   label="Display name"
//                   required
//                   maxLength={255}
//                   value={clientName}
//                   onChange={(e) => setClientName(e.target.value)}
//                 />
//                 <label className="block text-sm">
//                   Client type
//                   <select
//                     disabled={Boolean(record)}
//                     value={clientType}
//                     onChange={(e) => {
//                       setClientType(e.target.value);
//                       if (e.target.value === "machine") {
//                         setUris("");
//                         setScopes("api.read");
//                       }
//                     }}
//                     className="mt-2 block w-full rounded-lg bg-slate-950 p-3"
//                   >
//                     <option value="public">Public web/mobile (PKCE)</option>
//                     <option value="confidential">
//                       Confidential web / BFF (PKCE + secret)
//                     </option>
//                     <option value="machine">
//                       Machine-to-machine (client credentials)
//                     </option>
//                   </select>
//                 </label>
//                 {clientType !== "machine" && (
//                   <label className="block text-sm">
//                     Exact redirect URIs (one per line)
//                     <textarea
//                       required
//                       value={uris}
//                       onChange={(e) => setUris(e.target.value)}
//                       className="mt-2 w-full rounded-lg bg-slate-950 p-3"
//                     />
//                   </label>
//                 )}
//                 <Field
//                   label="Scopes (comma separated)"
//                   required
//                   value={scopes}
//                   onChange={(e) => setScopes(e.target.value)}
//                 />
//                 {record && (
//                   <label className="block text-sm">
//                     <input
//                       type="checkbox"
//                       checked={enabled}
//                       onChange={(e) => setEnabled(e.target.checked)}
//                     />{" "}
//                     Enabled (saving revokes existing tokens)
//                   </label>
//                 )}
//                 {record && clientType !== "public" && (
//                   <button
//                     type="button"
//                     disabled={busy}
//                     onClick={() => void rotate()}
//                     className="text-amber-300"
//                   >
//                     Rotate secret
//                   </button>
//                 )}
//                 {record && (
//                   <p className="text-xs text-slate-400">
//                     PKCE: {String(record.requireProofKey)} · Consent:{" "}
//                     {String(record.requireConsent)} · Secret expiry:{" "}
//                     {text(record, "secretExpiresAt") || "None"}
//                   </p>
//                 )}
//               </>
//             )}
//             {resource === "identities" && (
//               <>
//                 <Field
//                   label="Username (immutable)"
//                   required
//                   pattern="[A-Za-z0-9._-]{3,50}"
//                   disabled={Boolean(record)}
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                 />
//                 <Field
//                   label="Email"
//                   required
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//                 {!record && (
//                   <Field
//                     label="Initial password"
//                     required
//                     type="password"
//                     autoComplete="new-password"
//                     minLength={12}
//                     maxLength={72}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                   />
//                 )}
//                 {record && (
//                   <label className="block text-sm">
//                     <input
//                       type="checkbox"
//                       checked={active}
//                       onChange={(e) => setActive(e.target.checked)}
//                     />{" "}
//                     Active
//                   </label>
//                 )}
//               </>
//             )}
//             {resource === "roles" && (
//               <Field
//                 label="Role name"
//                 required
//                 disabled={Boolean(record?.system)}
//                 pattern="[A-Z][A-Z0-9_]{1,49}"
//                 value={roleName}
//                 onChange={(e) => setRoleName(e.target.value)}
//               />
//             )}
//             {resource === "invitations" && (
//               <Field
//                 label="Recipient email"
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             )}
//             {(resource === "identities" || resource === "invitations") && (
//               <fieldset className="space-y-2">
//                 <legend className="mb-2 text-sm">Assigned roles</legend>
//                 {availableRoles.map((role) => (
//                   <label key={role} className="block text-sm">
//                     <input
//                       type="checkbox"
//                       checked={roles.includes(role)}
//                       onChange={(e) =>
//                         setRoles(
//                           e.target.checked
//                             ? [...roles, role]
//                             : roles.filter((item) => item !== role),
//                         )
//                       }
//                     />{" "}
//                     {role}
//                   </label>
//                 ))}
//                 {roles.length === 0 && (
//                   <p className="text-sm text-amber-300">
//                     Select at least one role.
//                   </p>
//                 )}
//               </fieldset>
//             )}
//             {error && (
//               <p
//                 role="alert"
//                 className="rounded-lg bg-red-950 p-3 text-sm text-red-200"
//               >
//                 {error}
//               </p>
//             )}
//             <div className="flex justify-end gap-3">
//               <Button
//                 type="button"
//                 variant="secondary"
//                 isDisabled={busy}
//                 onPress={onClose}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 isDisabled={
//                   busy ||
//                   (Boolean(record?.system) && resource === "roles") ||
//                   (["identities", "invitations"].includes(resource) &&
//                     !roles.length)
//                 }
//               >
//                 {busy ? "Saving…" : "Save"}
//               </Button>
//             </div>
//           </form>
//         )}
//       </section>
//     </div>
//   );
// }
