"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@heroui/react";
import { request } from "@/lib/http";
import { Field } from "@/components/account-form";
import { base, text } from "./types";
import type { Row } from "./types";

const split = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

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
  const [email, setEmail] = useState(record ? text(record, "email") : "");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState(record ? text(record, "name") : "");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>(
    record && typeof record.roles === "string" ? split(record.roles) : ["USER"],
  );
  const [active, setActive] = useState(record ? Boolean(record.active) : true);
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
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (resource === "identities" || resource === "invitations") {
      request<string[]>(`${base}/roles`)
        .then(setAvailableRoles)
        .catch((reason) =>
          setError(
            reason instanceof Error ? reason.message : "Unable to load roles",
          ),
        );
    }
  }, [resource]);
  async function save(event: FormEvent) {
    event.preventDefault();
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
        const result = await request<{ clientSecret?: string } | undefined>(
          `${base}/clients${record ? `/${encodeURIComponent(clientId)}` : ""}`,
          "POST",
          spec,
        );
        if (result?.clientSecret) {
          setSecret(result.clientSecret);
          await onSaved();
          return;
        }
      } else if (resource === "identities") {
        if (record) {
          await request(`${base}/identities/${record.id}`, "POST", {
            username,
            email,
            active,
            roles,
          });
        } else
          await request(`${base}/identities`, "POST", {
            username,
            email,
            password,
            roles,
          });
      } else if (resource === "roles") {
        await request(`${base}/roles${record ? `/${record.id}` : ""}`, "POST", {
          name: roleName,
        });
      } else if (resource === "invitations")
        await request(`${base}/invitations`, "POST", { email, roles });
      await onSaved();
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save changes",
      );
    } finally {
      setBusy(false);
    }
  }
  async function rotate() {
    if (
      !window.confirm(
        "Rotate this confidential client secret? Existing integrations must switch to the new secret.",
      )
    )
      return;
    setBusy(true);
    setError(undefined);
    try {
      const credential = await request<{ clientSecret: string }>(
        `${base}/clients/${encodeURIComponent(clientId)}/secret-rotations`,
        "POST",
      );
      setSecret(credential.clientSecret);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to rotate secret",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${record ? "Edit" : "Create"} ${resource}`}
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-6"
      >
        <h2 className="mb-5 text-xl font-semibold">
          {record ? "Edit" : "Create"} {resource}
        </h2>
        {secret ? (
          <div>
            <p className="text-sm text-amber-200">
              Copy this secret into your secret manager now. It is shown only
              once.
            </p>
            <code className="my-5 block break-all rounded-lg bg-slate-950 p-4">
              {secret}
            </code>
            <Button onPress={onClose}>I saved the secret</Button>
          </div>
        ) : (
          <form onSubmit={save} className="space-y-4">
            {resource === "clients" && (
              <>
                <Field
                  label="Client ID"
                  required
                  pattern="[A-Za-z0-9._-]{3,100}"
                  value={clientId}
                  disabled={Boolean(record)}
                  onChange={(e) => setClientId(e.target.value)}
                />
                <Field
                  label="Display name"
                  required
                  maxLength={255}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
                <label className="block text-sm">
                  Client type
                  <select
                    disabled={Boolean(record)}
                    value={clientType}
                    onChange={(e) => {
                      setClientType(e.target.value);
                      if (e.target.value === "machine") {
                        setUris("");
                        setScopes("api.read");
                      }
                    }}
                    className="mt-2 block w-full rounded-lg bg-slate-950 p-3"
                  >
                    <option value="public">Public web/mobile (PKCE)</option>
                    <option value="confidential">
                      Confidential web / BFF (PKCE + secret)
                    </option>
                    <option value="machine">
                      Machine-to-machine (client credentials)
                    </option>
                  </select>
                </label>
                {clientType !== "machine" && (
                  <label className="block text-sm">
                    Exact redirect URIs (one per line)
                    <textarea
                      required
                      value={uris}
                      onChange={(e) => setUris(e.target.value)}
                      className="mt-2 w-full rounded-lg bg-slate-950 p-3"
                    />
                  </label>
                )}
                <Field
                  label="Scopes (comma separated)"
                  required
                  value={scopes}
                  onChange={(e) => setScopes(e.target.value)}
                />
                {record && (
                  <label className="block text-sm">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                    />{" "}
                    Enabled (saving revokes existing tokens)
                  </label>
                )}
                {record && clientType !== "public" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void rotate()}
                    className="text-amber-300"
                  >
                    Rotate secret
                  </button>
                )}
                {record && (
                  <p className="text-xs text-slate-400">
                    PKCE: {String(record.requireProofKey)} · Consent:{" "}
                    {String(record.requireConsent)} · Secret expiry:{" "}
                    {text(record, "secretExpiresAt") || "None"}
                  </p>
                )}
              </>
            )}
            {resource === "identities" && (
              <>
                <Field
                  label="Username (immutable)"
                  required
                  pattern="[A-Za-z0-9._-]{3,50}"
                  disabled={Boolean(record)}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Field
                  label="Email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {!record && (
                  <Field
                    label="Initial password"
                    required
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={72}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                )}
                {record && (
                  <label className="block text-sm">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                    />{" "}
                    Active
                  </label>
                )}
              </>
            )}
            {resource === "roles" && (
              <Field
                label="Role name"
                required
                disabled={Boolean(record?.system)}
                pattern="[A-Z][A-Z0-9_]{1,49}"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            )}
            {resource === "invitations" && (
              <Field
                label="Recipient email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
            {(resource === "identities" || resource === "invitations") && (
              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm">Assigned roles</legend>
                {availableRoles.map((role) => (
                  <label key={role} className="block text-sm">
                    <input
                      type="checkbox"
                      checked={roles.includes(role)}
                      onChange={(e) =>
                        setRoles(
                          e.target.checked
                            ? [...roles, role]
                            : roles.filter((item) => item !== role),
                        )
                      }
                    />{" "}
                    {role}
                  </label>
                ))}
                {roles.length === 0 && (
                  <p className="text-sm text-amber-300">
                    Select at least one role.
                  </p>
                )}
              </fieldset>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-950 p-3 text-sm text-red-200"
              >
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                isDisabled={busy}
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isDisabled={
                  busy ||
                  (Boolean(record?.system) && resource === "roles") ||
                  (["identities", "invitations"].includes(resource) &&
                    !roles.length)
                }
              >
                {busy ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
