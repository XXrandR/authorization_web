export type Row = Record<string, unknown>;
export type Page = { items: Row[]; total: number; page: number; size: number };
export const base = "/api/v1/infrastructure";
export const text = (row: Row, key: string) => String(row[key] ?? "");
export const labels: Record<string, string> = {
  clients: "OAuth clients",
  identities: "Identities",
  roles: "Roles",
  invitations: "Invitations",
  authorizations: "OAuth authorizations",
  "browser-sessions": "Browser sessions",
  "audit-events": "Audit trail",
  "access-events": "Access history",
};
export const columns: Record<string, string[]> = {
  clients: [
    "clientId",
    "clientName",
    "enabled",
    "publicClient",
    "scopes",
    "authorizationCount",
  ],
  identities: ["username", "email", "active", "blocked", "roles"],
  roles: ["name", "system", "members"],
  invitations: [
    "email",
    "role_names",
    "expires_at",
    "accepted_at",
    "revoked_at",
  ],
  authorizations: [
    "principal_name",
    "client_id",
    "authorization_grant_type",
    "access_token_expires_at",
    "refresh_token_expires_at",
  ],
  "browser-sessions": ["username", "lastRequest"],
  "audit-events": [
    "actor_username",
    "action",
    "target_type",
    "target_id",
    "created_at",
  ],
  "access-events": ["username", "event_type", "remote_address", "created_at"],
};
