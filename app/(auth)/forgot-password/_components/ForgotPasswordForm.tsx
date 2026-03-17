"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Input, ThemeToggle } from "@/components/ui";
import type { ForgotPasswordFormValues, ForgotPasswordStep } from "../_types";
import { Button } from "@/components/ui/button/Button";

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
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({ ...prev, email: e.target.value }));
  }

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    // TODO: call API to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1000);
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
            <form className="space-y-5" onSubmit={handleEmailSubmit}>
              <Input
                label="Email address"
                name="email"
                type="text"
                inputMode="email"
                value={values.email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                fullWidth
              />

              <Button
                onClick={() => setStep("email")}
                className="w-full h-11"
                loading={isLoading}
                disabled={isLoading || !values.email}
              >
                {isLoading ? "Sending code..." : "Send Verification Code"}
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
                type="button"
                onClick={() => setStep("email")}
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
                  onClick={() => setStep("email")}
                  className="font-medium transition-colors cursor-pointer text-primary dark:text-darkLight hover:text-black dark:hover:text-white"
                >
                  Resend code
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
