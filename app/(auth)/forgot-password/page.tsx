import { ForgotPasswordSidebar, ForgotPasswordForm } from "./_components";

export default function ForgotPasswordPage() {
  return (
    <main className="h-screen flex relative overflow-hidden">
      <ForgotPasswordSidebar />
      <ForgotPasswordForm />
    </main>
  );
}
