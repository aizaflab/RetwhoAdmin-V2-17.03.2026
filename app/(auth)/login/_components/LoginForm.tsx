"use client";

import Link from "next/link";
import { useState } from "react";
import { UserIcon } from "lucide-react";
import type { LoginFormValues } from "../_types";
import { Input, ThemeToggle } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { EyeIcon, EyeOffIcon } from "@/components/icons/Icons";

const INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: wire up auth action
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden isolate">
      <div className="w-full max-w-sm relative z-10">
        {/* Avatar icon */}
        <div className="w-12 h-12 rounded-xl center mb-6 mx-auto border bg-black/5 dark:bg-darkPrimary/70  border-border/50 dark:border-darkBorder text-black dark:text-white ">
          <UserIcon />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2 dark:text-white text-black">
            Welcome back
          </h1>
          <p className="text-sm text-black/40 dark:text-white/40">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5 z-100" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            name="email"
            type="text"
            inputMode="email"
            value={values.email}
            onChange={handleChange}
            placeholder="you@example.com"
            fullWidth
          />

          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={handleChange}
            placeholder="Enter your password"
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

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm transition-colors text-primary dark:text-darkLight hover:text-black dark:hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full h-11">
            Sign in
          </Button>
        </form>
      </div>

      <div className="absolute top-2 right-2">
        <ThemeToggle />
      </div>
    </div>
  );
}
