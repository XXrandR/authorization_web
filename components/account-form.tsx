"use client";

import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";

export function AccountForm({
  submitLabel,
  onSubmit,
  children,
}: {
  submitLabel: string;
  onSubmit: () => Promise<void>;
  children?: ReactNode;
}) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);
    try {
      await onSubmit();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unexpected error.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {children}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}
      <button
        className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={pending}
        type="submit"
      >
        {pending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}

export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-200">
      <span>{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
      />
    </label>
  );
}
