"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/http";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  async function logout() {
    setError(undefined);

    try {
      await request("/api/auth/logout", "POST");

      router.replace("/login");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Logout failed.",
      );
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={logout}
        className="text-cyan-300 hover:text-cyan-200"
      >
        Sign out
      </button>

      {error && (
        <p role="alert" className="mt-2 text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}