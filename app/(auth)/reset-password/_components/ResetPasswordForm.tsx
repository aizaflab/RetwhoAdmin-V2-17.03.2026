"use client";

import Link from "next/link";
import { useState } from "react";
import { Input, ThemeToggle } from "@/components/ui";
import type { ResetPasswordFormValues } from "../_types";
import { EyeIcon, EyeOffIcon, KeyIcon } from "@/components/icons/Icons";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";

const INITIAL_VALUES: ResetPasswordFormValues = {
  password: "",
  confirmPassword: "",
};

type StrengthInfo = {
  score: number; // 0–4
  label: string;
  color: string;
  barColor: string;
};

function getStrength(password: string): StrengthInfo {
  if (!password) return { score: 0, label: "", color: "", barColor: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map: StrengthInfo[] = [
    { score: 1, label: "Weak", color: "text-red-500", barColor: "bg-red-500" },
    {
      score: 2,
      label: "Fair",
      color: "text-amber-400",
      barColor: "bg-amber-400",
    },
    {
      score: 3,
      label: "Good",
      color: "text-blue-400",
      barColor: "bg-blue-400",
    },
    {
      score: 4,
      label: "Strong",
      color: "text-emerald-400",
      barColor: "bg-emerald-400",
    },
  ];

  return map[Math.max(0, score - 1)] ?? map[0];
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const [values, setValues] = useState<ResetPasswordFormValues>(INITIAL_VALUES);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getStrength(values.password);
  const passwordsMatch =
    values.confirmPassword === "" || values.password === values.confirmPassword;
  const isValid =
    values.password.length >= 8 && values.password === values.confirmPassword;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;
    setIsLoading(true);
    // TODO: call API to reset password
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1000);
  }

  if (!success) {
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
            Your password has been updated successfully. You can now sign in
            with your new credentials.
          </p>

          <Button onClick={() => router.push("/login")} className="w-full h-11">
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

            {/* Strength meter */}
            {values.password && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`flex-1 h-1 rounded-full transition-colors ${
                        s <= strength.score
                          ? strength.barColor
                          : "bg-gray-200 dark:bg-darkBorder"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strength.color}`}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={values.confirmPassword}
              onChange={handleChange}
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
            {!passwordsMatch && (
              <p className="text-xs text-red-400 mt-1">
                Passwords do not match.
              </p>
            )}
          </div>

          {/* Password rules */}
          <ul className="space-y-1.5">
            {[
              {
                label: "At least 8 characters",
                met: values.password.length >= 8,
              },
              {
                label: "Uppercase & lowercase letters",
                met:
                  /[A-Z]/.test(values.password) &&
                  /[a-z]/.test(values.password),
              },
              { label: "At least one number", met: /\d/.test(values.password) },
              {
                label: "Passwords match",
                met:
                  values.password !== "" &&
                  values.password === values.confirmPassword,
              },
            ].map(({ label, met }) => (
              <li key={label} className="flex items-center gap-2 text-xs">
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                    met
                      ? "bg-emerald-400/20 text-emerald-400"
                      : "bg-gray-200 dark:bg-[#2a2d3a] text-gray-400"
                  }`}
                >
                  {met ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      className="w-2 h-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-current" />
                  )}
                </span>
                <span
                  className={
                    met ? "dark:text-white/40 text-text6" : "text-text5"
                  }
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full h-11"
          >
            {isLoading ? "Resetting password..." : "Reset Password"}
            Sign in
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-white hover:text-gray-300 font-medium"
            >
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
