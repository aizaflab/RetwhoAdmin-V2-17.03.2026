import { Suspense } from "react";
import {
  ResetPasswordBackground,
  ResetPasswordSidebar,
  ResetPasswordForm,
} from "./_components";

export default function ResetPasswordPage() {
  return (
    <main className="h-screen flex relative overflow-hidden bg-lightBg dark:bg-darkBg">
      <ResetPasswordBackground />
      <ResetPasswordSidebar />
      {/* ResetPasswordForm reads ?token via useSearchParams. */}
      <Suspense fallback={<div className="flex-1" />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
