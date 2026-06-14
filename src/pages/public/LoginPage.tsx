import { LoginForm } from "@/features/auth";
import {
  AuthBrandPanel,
  AuthDefaultHeadline,
} from "@/features/auth/ui/AuthBrandPanel";
import { AuthPageShell } from "@/features/auth/ui/AuthPageShell";

export default function LoginPage() {
  return (
    <AuthPageShell
      brandPanel={
        <AuthBrandPanel
          title={<AuthDefaultHeadline />}
          description={
            <>
              Gestiona adelantos de forma simple, rápida y segura para toda tu
              organización.
            </>
          }
        />
      }
    >
      <LoginForm />
    </AuthPageShell>
  );
}
