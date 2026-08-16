import { Suspense } from "react";
import { ResetPasswordSidebar, ResetPasswordForm } from "./_components";

export default function ResetPasswordPage() {
  return (
    <main className="h-screen flex relative overflow-hidden">
      <ResetPasswordSidebar />
      <Suspense fallback={<div className="flex-1" />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
