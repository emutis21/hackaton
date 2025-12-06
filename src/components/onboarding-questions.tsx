"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LOOKING_FOR_OPTIONS = [
  { value: "cofounder", label: "Cofounder", emoji: "🚀" },
  { value: "mentor", label: "Mentor", emoji: "🧠" },
  { value: "networking", label: "Networking", emoji: "🤝" },
  { value: "investment", label: "Inversión", emoji: "💰" },
];

const OFFERING_OPTIONS = [
  { value: "tech", label: "Tech Skills", emoji: "💻" },
  { value: "business", label: "Business", emoji: "📊" },
  { value: "capital", label: "Capital", emoji: "🏦" },
  { value: "connections", label: "Conexiones", emoji: "🌐" },
];

const INDUSTRY_OPTIONS = [
  { value: "ai", label: "AI / ML" },
  { value: "fintech", label: "Fintech" },
  { value: "healthtech", label: "Healthtech" },
  { value: "edtech", label: "Edtech" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS" },
  { value: "climate", label: "Climate Tech" },
  { value: "other", label: "Otro" },
];

interface OnboardingQuestionsProps {
  onComplete: (answers: {
    lookingFor: string;
    offering: string;
    preferredIndustries: string[];
  }) => void;
}

export function OnboardingQuestions({ onComplete }: OnboardingQuestionsProps) {
  const [step, setStep] = useState(0);
  const [lookingFor, setLookingFor] = useState<string>("");
  const [offering, setOffering] = useState<string>("");
  const [industries, setIndustries] = useState<string[]>([]);

  const toggleIndustry = (value: string) => {
    setIndustries((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const handleComplete = () => {
    onComplete({
      lookingFor,
      offering,
      preferredIndustries: industries,
    });
  };

  const canProceed = () => {
    if (step === 0) return lookingFor !== "";
    if (step === 1) return offering !== "";
    if (step === 2) return industries.length > 0;
    return false;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">¿Qué buscas?</h2>
            <div className="grid grid-cols-2 gap-3">
              {LOOKING_FOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLookingFor(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    lookingFor === option.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">¿Qué ofreces?</h2>
            <div className="grid grid-cols-2 gap-3">
              {OFFERING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setOffering(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    offering === option.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              ¿Qué industrias te interesan?
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Selecciona una o más
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {INDUSTRY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleIndustry(option.value)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    industries.includes(option.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Atrás
            </Button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!canProceed()}>
              Completar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
