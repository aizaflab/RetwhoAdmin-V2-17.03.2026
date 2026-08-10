"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, ThemeToggle } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { useForgotPasswordMutation } from "@/featured/auth/authApiSlice";
import type {
  ForgotPasswordFormErrors,
  ForgotPasswordFormValues,
} from "../_types";

const INITIAL_VALUES: ForgotPasswordFormValues = {
  email: "",
};

// Long enough for the "check your inbox" message to be read before the page
// changes under the user.
const REDIRECT_DELAY_MS = 2500;

function MailSendIcon() {
  return (
    <svg
      className="w-6 h-6 dark:text-white text-black"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [values, setValues] =
    useState<ForgotPasswordFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [sent, setSent] = useState(false);

  const [forgotPassword, { isLoading: isSending }] =
    useForgotPasswordMutation();

  // The rest of the flow happens in the emailed link, so there is nothing left
  // to do on this page once the mail is out.
  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => router.replace("/login"), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [sent, router]);

  function validateEmail(): boolean {
    const nextErrors: ForgotPasswordFormErrors = {};

    if (!values.email) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({ ...prev, email: e.target.value }));
    setErrors((prev) => ({ ...prev, email: undefined }));
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      await forgotPassword({ email: values.email }).unwrap();
      toast.success(`Password reset link sent to ${values.email}`);
      setSent(true);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Could not send the reset link. Please try again.";
      setErrors({ email: message });
      toast.error(message);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden isolate">
      <div className="w-full max-w-sm relative z-10">
        <div>
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl center mb-6 mx-auto border bg-black/5 dark:bg-darkPrimary/70  border-border/50 dark:border-darkBorder text-black dark:text-white ">
            <MailSendIcon />
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2 dark:text-white text-black">
              Forgot Password
            </h1>
            <p className="text-sm text-text6 dark:text-text5/70">
              {sent
                ? "Check your inbox and follow the link to set a new password. Taking you back to sign in…"
                : "Enter your email and we'll send you a password reset link."}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleEmailSubmit} noValidate>
            <Input
              label="Email address"
              name="email"
              type="text"
              inputMode="email"
              value={values.email}
              onChange={handleEmailChange}
              error={errors.email}
              placeholder="you@example.com"
              fullWidth
            />

            <Button
              type="submit"
              className="w-full h-11"
              loading={isSending}
              disabled={isSending || sent}
            >
              {isSending
                ? "Sending link..."
                : sent
                  ? "Link sent"
                  : "Send Reset Link"}
            </Button>
          </form>
        </div>
      </div>
      <div className="absolute top-2 right-2">
        <ThemeToggle />
      </div>
    </div>
  );
}
