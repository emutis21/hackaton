"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PdfUpload } from "@/components/pdf-upload";
import { OnboardingQuestions } from "@/components/onboarding-questions";
import type { Profile } from "@/db/schema";

type Step = "upload" | "questions";

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [profile, setProfile] = useState<Profile | null>(null);

  const handleUploadSuccess = (uploadedProfile: Profile) => {
    setProfile(uploadedProfile);
    setStep("questions");
  };

  const handleQuestionsComplete = async (answers: {
    lookingFor: string;
    offering: string;
    preferredIndustries: string[];
  }) => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/profile/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answers,
          onboardingCompleted: true,
        }),
      });

      if (response.ok) {
        router.push(`/discover?userId=${profile.id}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (step === "upload") {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Bienvenido a Hackaton</h1>
          <p className="text-muted-foreground">
            Conecta con gente innovadora. Solo necesitas tu CV.
          </p>
        </div>
        <PdfUpload onSuccess={handleUploadSuccess} />
      </div>
    );
  }

  if (step === "questions" && profile) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Hola, {profile.name}</h1>
          <p className="text-muted-foreground">
            Cuéntanos un poco más sobre lo que buscas
          </p>
        </div>
        <OnboardingQuestions onComplete={handleQuestionsComplete} />
      </div>
    );
  }

  return null;
}
