"use client";

import { Button } from "@heroui/react";
import type {
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
} from "react";
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

    if (pending) return;

    setError(undefined);
    setPending(true);

    try {
      await onSubmit();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "An unexpected error occurred.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      {children}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-control border border-error/20 bg-error/5 p-3.5 text-sm text-error"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="mt-0.5 size-4 shrink-0"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M12 8V12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16" r="0.75" fill="currentColor" />
          </svg>

          <p>{error}</p>
        </div>
      )}

      <Button
        className="
          group relative inline-flex min-h-12 w-full items-center
          justify-center gap-2 overflow-hidden rounded-control
          bg-brand px-4 py-3 text-sm font-semibold
          text-brand-foreground shadow-brand
          transition-all duration-200
          hover:bg-brand-hover
          active:scale-[0.99]
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-brand
          focus-visible:ring-offset-2
          focus-visible:ring-offset-background
          disabled:pointer-events-none disabled:opacity-60
        "
        isDisabled={pending}
        type="submit"
      >
        {pending ? (
          <>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 animate-spin"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>{submitLabel}</span>

            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                d="M5 12H19M12 5L19 12L12 19"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </Button>
    </form>
  );
}

export function Field({
  label,
  id,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-content"
      >
        {label}
      </label>

      <input
        {...props}
        id={inputId}
        className={[
          "block w-full rounded-control border border-border",
          "bg-surface px-3.5 py-3 text-sm text-content",
          "placeholder:text-content-muted",
          "outline-none transition-colors duration-200",
          "hover:border-border-strong",
          "focus:border-brand focus:ring-4 focus:ring-brand/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-error",
          "aria-[invalid=true]:focus:ring-error/10",
          className ?? "",
        ].join(" ")}
      />
    </div>
  );
}

// "use client";

// import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
// import { useState } from "react";

// export function AccountForm({
//   submitLabel,
//   onSubmit,
//   children,
// }: {
//   submitLabel: string;
//   onSubmit: () => Promise<void>;
//   children?: ReactNode;
// }) {
//   const [error, setError] = useState<string>();
//   const [pending, setPending] = useState(false);

//   async function submit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     setError(undefined);
//     setPending(true);
//     try {
//       await onSubmit();
//     } catch (reason) {
//       setError(reason instanceof Error ? reason.message : "Unexpected error.");
//     } finally {
//       setPending(false);
//     }
//   }

//   return (
//     <form className="space-y-4" onSubmit={submit}>
//       {children}
//       {error && (
//         <p
//           role="alert"
//           className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200"
//         >
//           {error}
//         </p>
//       )}
//       <button
//         className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
//         disabled={pending}
//         type="submit"
//       >
//         {pending ? "Please wait…" : submitLabel}
//       </button>
//     </form>
//   );
// }

// export function Field({
//   label,
//   ...props
// }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
//   return (
//     <label className="block space-y-1.5 text-sm font-medium text-slate-200">
//       <span>{label}</span>
//       <input
//         {...props}
//         className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
//       />
//     </label>
//   );
// }
