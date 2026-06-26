import { useState } from "react";
import { RegisterForm } from "@/features/auth";
import { AuthBrandPanel } from "@/features/auth/ui/AuthBrandPanel";
import { AuthMobileBrandGuide } from "@/features/auth/ui/AuthMobileBrandGuide";
import { AuthPageShell } from "@/features/auth/ui/AuthPageShell";
import type { RegisterStepId } from "@/features/auth/ui/RegisterStepIndicator";
import { getRegisterBrandPanelContent } from "@/features/auth/ui/registerBrandPanelContent";

export default function RegisterPage() {
  const [registerStep, setRegisterStep] =
    useState<RegisterStepId>("document");
  const brandContent = getRegisterBrandPanelContent(registerStep);

  return (
    <AuthPageShell
      mobileGuide={
        <AuthMobileBrandGuide
          title={brandContent.mobileTitle}
          summary={brandContent.mobileSummary}
          steps={brandContent.compactSteps}
        />
      }
      brandPanel={
        <AuthBrandPanel
          title={brandContent.title}
          description={brandContent.description}
          steps={brandContent.steps}
          compactSteps={brandContent.compactSteps}
        />
      }
    >
      <RegisterForm onStepChange={setRegisterStep} />
    </AuthPageShell>
  );
}
