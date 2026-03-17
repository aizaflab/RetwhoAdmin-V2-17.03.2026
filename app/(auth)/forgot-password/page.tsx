import {
  ForgotPasswordBackground,
  ForgotPasswordSidebar,
  ForgotPasswordForm,
} from "./_components";

export default function ForgotPasswordPage() {
  return (
    <main className="h-screen flex relative overflow-hidden bg-lightBg dark:bg-darkBg">
      <ForgotPasswordBackground />
      <ForgotPasswordSidebar />
      <ForgotPasswordForm />
    </main>
  );
}
