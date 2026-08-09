"use client";

import { toast } from "sonner";
import { useRef, useState } from "react";
import { Input, ThemeToggle } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { useForgotPasswordMutation } from "@/featured/auth/authApiSlice";
import type {
  ForgotPasswordFormErrors,
  ForgotPasswordFormValues,
  ForgotPasswordStep,
} from "../_types";

const OTP_LENGTH = 6;

const INITIAL_VALUES: ForgotPasswordFormValues = {
  email: "",
  otp: Array(OTP_LENGTH).fill(""),
};

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

function ShieldIcon() {
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
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

export default function ForgotPasswordForm() {
  const [values, setValues] =
    useState<ForgotPasswordFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [forgotPassword, { isLoading: isSendingCode }] =
    useForgotPasswordMutation();

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

  /** Shared by the initial submit and the "Resend code" button. */
  async function sendCode(): Promise<boolean> {
    try {
      await forgotPassword({ email: values.email }).unwrap();
      toast.success(`Verification code sent to ${values.email}`);
      return true;
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Could not send the verification code. Please try again.";
      setErrors({ email: message });
      toast.error(message);
      return false;
    }
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateEmail()) return;

    if (await sendCode()) {
      setValues((prev) => ({ ...prev, otp: Array(OTP_LENGTH).fill("") }));
      setStep("otp");
    }
  }

  async function handleResend() {
    await sendCode();
  }

  function handleOtpChange(index: number, value: string) {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const next = [...values.otp];
    next[index] = sanitized;
    setValues((prev) => ({ ...prev, otp: next }));

    if (sanitized && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !values.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...values.otp];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setValues((prev) => ({ ...prev, otp: next }));
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  function handleOtpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    // TODO: verify OTP and send reset link
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden isolate">
      <div className="w-full max-w-sm relative z-10">
        {/* ── STEP 1 : EMAIL ─────────────────────────────────── */}
        {step === "email" && (
          <>
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
                Enter your email and we&apos;ll send you a verification code.
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
                loading={isSendingCode}
                disabled={isSendingCode || !values.email}
              >
                {isSendingCode ? "Sending code..." : "Send Verification Code"}
              </Button>
            </form>
          </>
        )}

        {/* ── STEP 2 : OTP ───────────────────────────────────── */}
        {step === "otp" && (
          <>
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl center mb-6 mx-auto border bg-black/5 dark:bg-darkPrimary/70  border-border/50 dark:border-darkBorder text-black dark:text-white ">
              <ShieldIcon />
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold mb-2  dark:text-white text-black">
                Verify Your Email
              </h1>
              <p className="text-gray-400 text-sm">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-primary dark:text-darkLight">
                  {values.email}
                </span>
                .
                <br />
                Enter it below to continue.
              </p>
            </div>

            {/* OTP Form */}
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              {/* OTP inputs */}
              <div className="flex items-center justify-center gap-2">
                {values.otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className="w-11 h-13 text-center text-lg font-semibold rounded-lg border focus:outline-none focus:ring-1 transition-colors bg-border/10  dark:bg-darkPrimary dark:border-darkBorder border-border dark:text-white text-black  focus:border-primary  focus:ring-primary caret-primary "
                  />
                ))}
              </div>

              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading || values.otp.some((d) => !d)}
                className="w-full h-11"
              >
                {isLoading ? "Verifying..." : "Send Reset Password Link"}
              </Button>

              {/* Resend */}
              <p className="text-center text-sm text-text5">
                Didn&apos;t receive a code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSendingCode}
                  className="font-medium transition-colors cursor-pointer text-primary dark:text-darkLight hover:text-black dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingCode ? "Sending..." : "Resend code"}
                </button>
              </p>
            </form>
          </>
        )}
      </div>
      <div className="absolute top-2 right-2">
        <ThemeToggle />
      </div>
    </div>
  );
}
