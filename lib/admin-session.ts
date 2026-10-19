import "server-only";

import { cookies } from "next/headers";

export type AdminSession = {
  authenticated: boolean;
  username: string;
  roles: string[];
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();

  // Forward the browser's cookies to the authorization API.
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const authorizationApi =
    process.env.AUTHORIZATION_API_URL ?? "http://localhost:8080";

  const response = await fetch(
    new URL("/api/v1/session", authorizationApi),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      cache: "no-store",
      redirect: "manual",
    },
  );

  // The API can report an unauthenticated session using an HTTP
  // status or by redirecting to its login page.
  if (
    response.status === 401 ||
    response.status === 403 ||
    (response.status >= 300 && response.status < 400)
  ) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Session verification failed with HTTP ${response.status}`,
    );
  }

  const session = (await response.json()) as AdminSession;

  if (
    !session ||
    typeof session.authenticated !== "boolean" ||
    !Array.isArray(session.roles)
  ) {
    throw new Error("The session endpoint returned an invalid response.");
  }

  if (!session.authenticated) {
    return null;
  }

  return session;
}