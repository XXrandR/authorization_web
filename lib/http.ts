"use client";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET") {
    const csrfResponse = await fetch("/api/v1/security/csrf", {
      credentials: "include",
      cache: "no-store",
    });
    if (!csrfResponse.ok)
      throw new ApiError(
        csrfResponse.status,
        "Unable to establish a secure session.",
      );
    const csrf = (await csrfResponse.json()) as {
      headerName: string;
      token: string;
    };
    headers[csrf.headerName] = csrf.token;
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(path, {
    method,
    credentials: "include",
    cache: "no-store",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      detail?: string;
      message?: string;
    } | null;
    throw new ApiError(
      response.status,
      problem?.detail ??
        problem?.message ??
        (response.status === 401
          ? "Your session has expired. Please sign in."
          : response.status === 403
            ? "You do not have permission for this operation."
            : "Unable to complete the request."),
    );
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

/** Only internal paths may be supplied by the untrusted continue query parameter. */
export function safeContinue(value: string | null): string | undefined {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : undefined;
}
