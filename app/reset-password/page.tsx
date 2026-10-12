"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AccountForm, Field } from "@/components/account-form";
import { AccountShell } from "@/components/account-shell";
import { postJson } from "@/lib/account-api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [complete, setComplete] = useState(false);
  if (!token)
    return (
      <AccountShell
        title="Invalid reset link"
        subtitle="Request a new password-reset link."
      >
        <Link className="text-cyan-300" href="/forgot-password">
          Reset password
        </Link>
      </AccountShell>
    );
  if (complete)
    return (
      <AccountShell
        title="Password updated"
        subtitle="Your password has been changed. Sign in with your new password."
      >
        <Link className="text-cyan-300" href="/login">
          Sign in
        </Link>
      </AccountShell>
    );
  return (
    <AccountShell
      title="Choose a new password"
      subtitle="Use at least 12 characters and do not reuse a password from another service."
    >
      <AccountForm
        submitLabel="Update password"
        onSubmit={async () => {
          await postJson("/api/v1/accounts/password-resets/confirm", {
            token,
            password,
          });
          setComplete(true);
        }}
      >
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </AccountForm>
    </AccountShell>
  );
}
