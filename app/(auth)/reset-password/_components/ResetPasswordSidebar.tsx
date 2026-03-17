import {
  LockIcon,
  KeyIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from "@/components/icons/Icons";

import Link from "next/link";
import Image from "next/image";
import logoImg from "@/public/img/logo/logo.svg";
import type { ResetPasswordTipItem } from "../_types";
import ResetPasswordSidebarTip from "./ResetPasswordSidebarTip";

const TIPS: ResetPasswordTipItem[] = [
  {
    icon: LockIcon,
    title: "Length Matters",
    description:
      "Use at least 8 characters. The longer your password, the harder it is for anyone to crack it.",
  },
  {
    icon: KeyIcon,
    title: "Mix It Up",
    description:
      "Combine uppercase and lowercase letters, numbers, and special characters (e.g. @, #, !) for maximum strength.",
  },
  {
    icon: CheckCircleIcon,
    title: "Stay Unique",
    description:
      "Never reuse passwords from other accounts. Avoid real words, names, or predictable patterns.",
  },
];

export default function ResetPasswordSidebar() {
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
                Create a Strong Password
              </h3>
              <p className="text-sm leading-relaxed text-text6 dark:text-text4/80">
                Your password is the first line of defense. Follow the tips
                below to choose a password that keeps your account safe and
                secure.
              </p>
            </div>

            {/* Tip list */}
            <div className="space-y-5">
              {TIPS.map((tip) => (
                <ResetPasswordSidebarTip key={tip.title} tip={tip} />
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
