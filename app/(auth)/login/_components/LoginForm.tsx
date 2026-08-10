"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { UserIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { Input, ThemeToggle } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button/Button";
import { EyeIcon, EyeOffIcon } from "@/components/icons/Icons";
import { getPasswordError } from "@/lib/validation/password";
import type { LoginFormErrors, LoginFormValues } from "../_types";

const INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set by middleware when an unauthenticated user hits a protected route.
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const nextErrors: LoginFormErrors = {};

    if (!values.email) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    // Assigned only when it fails — an explicit `undefined` would still count
    // as a key below.
    const passwordError = getPasswordError(values.password);
    if (passwordError) nextErrors.password = passwordError;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // redirect:false so a failed login stays on the page and we can show the
    // backend's message instead of bouncing to next-auth's error page.
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (!result || result.error) {
      setIsLoading(false);
      toast.error(result?.error || "Unable to sign in. Please try again.");
      return;
    }

    toast.success("Signed in successfully");
    router.replace(callbackUrl);
    // Pull the freshly set session cookie into server components.
    router.refresh();
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden isolate">
      <div className="w-full max-w-sm relative z-10">
        {/* Avatar icon */}
        <div className="w-12 h-12 rounded-xl center mb-4 mx-auto border bg-primary/5 border-primary/50 text-primary">
          <UserIcon />
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5 z-100" onSubmit={handleSubmit} noValidate>
          <Input
            label="Email address"
            name="email"
            type="text"
            inputMode="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            fullWidth
          />

          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            fullWidth
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="transition-colors cursor-pointer text-foreground hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm transition-colors hover:text-primary text-foreground"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>

      <div className="absolute top-2 right-2">
        <ThemeToggle />
      </div>
    </div>
  );
}
