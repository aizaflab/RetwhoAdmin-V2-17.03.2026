import {
  KeyIcon,
  MailIcon,
  LockIcon,
  ArrowLeftIcon,
} from "@/components/icons/Icons";

import Link from "next/link";
import Image from "next/image";
import logoImg from "@/public/img/logo/logo.svg";
import type { ForgotPasswordStepItem } from "../_types";
import ForgotPasswordSidebarStep from "./ForgotPasswordSidebarStep";

const STEPS: ForgotPasswordStepItem[] = [
  {
    step: 1,
    icon: MailIcon,
    title: "Enter Your Email",
    description:
      "Provide the email address linked to your account. We'll send a one-time verification code to confirm it's you.",
  },
  {
    step: 2,
    icon: KeyIcon,
    title: "Verify with OTP",
    description:
      "Check your inbox for a 6-digit OTP code. Enter it here to verify your identity before setting a new password.",
  },
  {
    step: 3,
    icon: LockIcon,
    title: "Reset Your Password",
    description:
      "Once verified, you'll be redirected to set a new secure password for your account.",
  },
];

export default function ForgotPasswordSidebar() {
  return (
    <div className="p-2 hidden h-full lg:block lg:w-95 relative z-10">
      <div className="lg:flex h-full w-full flex-col rounded border bg-white dark:bg-darkPrimary  border-border/50 dark:border-darkBorder">
        <div className="mb-5 px-5 py-2 border-b border-border/50 dark:border-darkBorder">
          <Link href="/">
            <Image src={logoImg} alt="Retwho" className="h-14 w-fit" />
          </Link>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 pt-0 flex flex-col justify-between">
          <div className="space-y-10">
            {/* Headline */}
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white text-black">
                Forgot Your Password?
              </h3>
              <p className="text-sm leading-relaxed text-text6 dark:text-text4/80">
                No worries — it happens to the best of us. Follow the three
                simple steps below to verify your identity and regain access to
                your account securely.
              </p>
            </div>

            {/* Steps list */}
            <div className="relative space-y-6">
              {/* Connector line */}
              <div className="absolute left-4.25 top-9 bottom-9 w-px bg-primary/20" />

              {STEPS.map((item) => (
                <ForgotPasswordSidebarStep key={item.step} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5">
          <Link
            href="/login"
            className="w-fit text-xs flex items-center gap-1.5 transition-colors text-primary dark:text-darkLight hover:text-black dark:hover:text-white"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
