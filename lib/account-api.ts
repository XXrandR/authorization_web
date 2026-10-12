"use client";

type CsrfResponse = { headerName: string; token: string };

async function csrfHeaders(): Promise<Record<string, string>> {
  const response = await fetch("/api/v1/security/csrf", {
    credentials: "include",
  });
  if (!response.ok)
    throw new Error("Unable to establish a secure browser session.");
  const csrf = (await response.json()) as CsrfResponse;
  return { "Content-Type": "application/json", [csrf.headerName]: csrf.token };
}

export async function postJson(path: string, body: unknown): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: await csrfHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(problem?.detail ?? "Your request could not be completed.");
  }
}

export async function signIn(
  username: string,
  password: string,
): Promise<string> {
  const headers = await csrfHeaders();
  headers["Content-Type"] = "application/x-www-form-urlencoded";
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers,
    body: new URLSearchParams({ username, password }),
  });
  const result = (await response.json().catch(() => null)) as {
    redirectUrl?: string;
    message?: string;
  } | null;
  if (!response.ok)
    throw new Error(result?.message ?? "Invalid username or password.");
  return result?.redirectUrl ?? "/";
}
