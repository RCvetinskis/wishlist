import AuthCard from "./_components/auth-card";
import { LanguageSwitcher } from "@/src/components/i18n";

const AuthPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <AuthCard />
    </div>
  );
};

export default AuthPage;
