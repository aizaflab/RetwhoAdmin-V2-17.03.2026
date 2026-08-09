import { Suspense } from "react";
import { LoginSidebar, LoginForm } from "./_components";

export default function LoginPage() {
  return (
    <main className="fixed inset-0 h-dvh flex overflow-hidden">
      <LoginSidebar />
      {/* LoginForm reads ?callbackUrl via useSearchParams. */}
      <Suspense fallback={<div className="flex-1" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
