"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Input, ThemeToggle } from "@/components/ui";
import type {
  ResetPasswordFormErrors,
  ResetPasswordFormValues,
} from "../_types";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
} from "@/components/icons/Icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { getPasswordError, PASSWORD_RULES } from "@/lib/validation/password";
import { useResetPasswordMutation } from "@/featured/auth/authApiSlice";

const INITIAL_VALUES: ResetPasswordFormValues = {
  password: "",
  confirmPassword: "",
};

// How long the success screen stays up before we send the user to sign in.
const REDIRECT_DELAY_MS = 4000;

/** Shape the backend uses for zod failures: 400 + a details array. */
type ApiError = {
  data?: {
    message?: string;
    error?: { details?: { path?: string; message?: string }[] };
  };
};

/**
 * Turn a rejected request into per-field errors. The backend reports zod
 * failures as `body.newPassword` / `body.confirmPassword`, so those land under
 * the right input instead of showing a bare "Validation error".
 */
function toFormErrors(err: unknown): ResetPasswordFormErrors {
  const data = (err as ApiError)?.data;
  const details = data?.error?.details ?? [];
  const nextErrors: ResetPasswordFormErrors = {};

  for (const detail of details) {
    if (!detail?.message) continue;
    if (detail.path?.endsWith("newPassword")) {
      nextErrors.password ??= detail.message;
    } else if (detail.path?.endsWith("confirmPassword")) {
      nextErrors.confirmPassword ??= detail.message;
    }
  }

  // Nothing field-specific — fall back to the top-level message. An expired
  // reset token is the most likely cause.
  if (!nextErrors.password && !nextErrors.confirmPassword) {
    nextErrors.form =
      data?.message ||
      "Could not reset your password. The link may have expired.";
  }

  return nextErrors;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Signed, short-lived token from the emailed reset link.
  const token = searchParams.get("token") ?? "";

  const [values, setValues] = useState<ResetPasswordFormValues>(INITIAL_VALUES);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [success, setSuccess] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  // Send the user to sign in once they have had a moment to read the
  // confirmation.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => router.replace("/login"), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [success, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  }

  /** Fills in the per-field errors shown under each input. */
  function validate(): boolean {
    const nextErrors: ResetPasswordFormErrors = {};

    const passwordError = getPasswordError(values.password);
    if (passwordError) nextErrors.password = passwordError;

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!token) {
      nextErrors.form =
        "Reset link is invalid or has expired. Request a new one.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await resetPassword({
        token,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      }).unwrap();

      toast.success("Password reset successfully");
      setSuccess(true);
    } catch (err) {
      console.log("Reset password error:", err);

      const nextErrors = toFormErrors(err);
      setErrors(nextErrors);
      toast.error(
        nextErrors.form ??
          nextErrors.password ??
          nextErrors.confirmPassword ??
          "Could not reset your password.",
      );
    }
  }

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden isolate">
        <div className="w-full max-w-sm relative z-10 text-center">
          <div className="w-16 h-16 rounded-full center mb-6 mx-auto bg-primary/10 border border-primary/30">
            <svg
              className="w-8 h-8 text-primary dark:text-darkLight"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2 dark:text-white text-black">
            Password Reset!
          </h1>
          <p className=" text-sm mb-8 text-black/40 dark:text-white/40">
            Your password has been updated successfully. Taking you to the sign
            in page — or continue below.
          </p>

          <Button
            onClick={() => router.replace("/login")}
            className="w-full h-11"
          >
            Back to Sign In
          </Button>
        </div>
        <div className="absolute top-2 right-2">
          <ThemeToggle />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden isolate">
      <div className="w-full max-w-sm relative z-10">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl center mb-6 mx-auto border bg-black/5 dark:bg-darkPrimary/70  border-border/50 dark:border-darkBorder text-black dark:text-white ">
          <KeyIcon />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2 dark:text-white text-black">
            Reset Password
          </h1>
          {!token && (
            <p className="text-sm text-red-500 dark:text-red-400">
              This reset link is missing its token.{" "}
              <Link href="/forgot-password" className="underline">
                Request a new link
              </Link>
              .
            </p>
          )}
          <p className="text-sm text-black/40 dark:text-white/40">
            Choose a strong new password for your account.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* New password */}
          <div className="space-y-2">
            <Input
              label="New Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter new password"
              fullWidth
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="transition-colors cursor-pointer text-black/50 dark:text-white/50 hover:text-primary dark:hover:text-darkLight "
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />

            {/* Live requirements — compact chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PASSWORD_RULES.map((rule) => {
                const met = rule.test(values.password);
                return (
                  <span
                    key={rule.label}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                      met
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {met && <CheckIcon className="size-2.5" strokeWidth={3} />}
                    {rule.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Re-enter new password"
              fullWidth
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="transition-colors cursor-pointer text-black/50 dark:text-white/50 hover:text-primary dark:hover:text-darkLight "
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
          </div>

          {errors.form && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {errors.form}
            </p>
          )}

          {/* Deliberately not disabled on invalid input: clicking submit is
              what surfaces the inline errors. */}
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="w-full h-11"
          >
            {isLoading ? "Resetting password..." : "Reset Password"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="text-foreground font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <div className="absolute top-2 right-2">
        <ThemeToggle />
      </div>
    </div>
  );
}
