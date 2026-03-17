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
      <ResetPasswordForm />
    </main>
  );
}
