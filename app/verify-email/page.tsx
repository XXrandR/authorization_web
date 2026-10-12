"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AccountForm } from "@/components/account-form";
import { AccountShell } from "@/components/account-shell";
import { postJson } from "@/lib/account-api";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const token = useSearchParams().get("token");
  const [complete, setComplete] = useState(false);
  if (!token)
    return (
      <AccountShell
        title="Invalid verification link"
        subtitle="Request a new verification email from support if this link was truncated or expired."
      >
        <Link className="text-cyan-300" href="/register">
          Create account
        </Link>
      </AccountShell>
    );
  if (complete)
    return (
      <AccountShell
        title="Email verified"
        subtitle="Your account is active. You can now sign in."
      >
        <Link className="text-cyan-300" href="/login">
          Sign in
        </Link>
      </AccountShell>
    );
  return (
    <AccountShell
      title="Verify your email"
      subtitle="Confirm that you want to activate this Protector account."
    >
      <AccountForm
        submitLabel="Verify email"
        onSubmit={async () => {
          await postJson("/api/v1/accounts/email-verifications", { token });
          setComplete(true);
        }}
      />
    </AccountShell>
  );
}
