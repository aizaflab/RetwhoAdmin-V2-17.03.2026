import { LoginBackground, LoginSidebar, LoginForm } from "./_components";

export default function LoginPage() {
  return (
    <main className="fixed inset-0 h-dvh flex overflow-hidden bg-lightBg dark:bg-darkBg">
      <LoginBackground />
      <LoginSidebar />
      <LoginForm />
    </main>
  );
}
