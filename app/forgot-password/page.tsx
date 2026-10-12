"use client";

import Link from "next/link";
import { useState } from "react";
import { AccountForm, Field } from "@/components/account-form";
import { AccountShell } from "@/components/account-shell";
import { postJson } from "@/lib/account-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [complete, setComplete] = useState(false);
  if (complete)
    return (
      <AccountShell
        title="Check your inbox"
        subtitle="If that account exists, we sent a password-reset link. It expires in one hour."
      >
        <Link className="text-cyan-300" href="/login">
          Back to sign in
        </Link>
      </AccountShell>
    );
  return (
    <AccountShell
      title="Reset password"
      subtitle="Enter your email address. We will only send a link if an account exists."
    >
      <AccountForm
        submitLabel="Send reset link"
        onSubmit={async () => {
          await postJson("/api/v1/accounts/password-resets", { email });
          setComplete(true);
        }}
      >
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </AccountForm>
    </AccountShell>
  );
}
