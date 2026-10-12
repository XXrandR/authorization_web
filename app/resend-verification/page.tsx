"use client";
import { useState } from "react";
import Link from "next/link";
import { AccountShell } from "@/components/account-shell";
import { AccountForm, Field } from "@/components/account-form";
import { postJson } from "@/lib/account-api";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <AccountShell
      title="Resend verification"
      subtitle="If this account is awaiting verification, we’ll send a new link and invalidate the previous one."
    >
      {sent ? (
        <p role="status">Check your inbox.</p>
      ) : (
        <AccountForm
          submitLabel="Send verification link"
          onSubmit={async () => {
            await postJson("/api/v1/accounts/email-verifications/resend", {
              email,
            });
            setSent(true);
          }}
        >
          <Field
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </AccountForm>
      )}
      <Link className="mt-5 block text-cyan-300" href="/login">
        Back to sign in
      </Link>
    </AccountShell>
  );
}
