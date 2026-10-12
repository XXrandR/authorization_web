"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AccountForm, Field } from "@/components/account-form";
import { AccountShell } from "@/components/account-shell";
import { postJson } from "@/lib/account-api";

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="p-10">Loading registration…</p>}>
      <RegistrationForm />
    </Suspense>
  );
}

function RegistrationForm() {
  const invitationToken = useSearchParams().get("invitation");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [complete, setComplete] = useState(false);
  if (complete)
    return (
      <AccountShell
        title="Check your inbox"
        subtitle="We sent a verification link to activate your account. The link expires in 24 hours."
      >
        <Link className="text-sm text-cyan-300" href="/login">
          Back to sign in
        </Link>
      </AccountShell>
    );
  return (
    <AccountShell
      title="Create your account"
      subtitle="Use at least 12 characters for your password. You will verify your email before signing in."
    >
      <AccountForm
        submitLabel="Create account"
        onSubmit={async () => {
          await postJson("/api/v1/accounts/registrations", {
            username,
            email,
            password,
            invitationToken,
          });
          setComplete(true);
        }}
      >
        <Field
          label="Username"
          autoComplete="username"
          minLength={3}
          maxLength={50}
          pattern="[A-Za-z0-9._-]+"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </AccountForm>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link className="text-cyan-300" href="/login">
          Sign in
        </Link>
      </p>
    </AccountShell>
  );
}
