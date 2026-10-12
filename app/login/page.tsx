"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AccountForm, Field } from "@/components/account-form";
import { AccountShell } from "@/components/account-shell";
import { signIn } from "@/lib/account-api";
import { safeContinue } from "@/lib/http";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const search = useSearchParams();

  return (
    <AccountShell
      title="Welcome back"
      subtitle="Sign in to continue securely to your Protector application."
    >
      <AccountForm
        submitLabel="Sign in"
        onSubmit={async () => {
          const savedRequest = await signIn(username, password);
          const continuation = safeContinue(search.get("continue"));
          if (savedRequest.includes("/oauth2/authorize")) {
            // OAuth navigation is a full user-agent request, not Next routing.
            window.location.href = savedRequest;
          } else {
            router.replace(continuation ?? savedRequest);
            router.refresh();
          }
        }}
      >
        <Field
          label="Username or email"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </AccountForm>
      <div className="mt-6 flex justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-cyan-300 hover:text-cyan-200"
        >
          Forgot password?
        </Link>
        <Link href="/register" className="text-cyan-300 hover:text-cyan-200">
          Create account
        </Link>
      </div>
      <Link
        href="/resend-verification"
        className="mt-4 block text-sm text-cyan-300"
      >
        Resend verification email
      </Link>
    </AccountShell>
  );
}
