"use client"

import type { GenerationStep } from "./dashboard-content"
import { Loader2, FileSearch, Wand2, Check } from "lucide-react"

interface GeneratingModalProps {
  step: GenerationStep
}

export function GeneratingModal({ step }: GeneratingModalProps) {
  const steps = [
    {
      id: "analyzing",
      icon: FileSearch,
      title: "Analyzing your content",
      description: "AI is reading and understanding your business information...",
    },
    {
      id: "generating",
      icon: Wand2,
      title: "Generating your website",
      description: "Creating pages, optimizing content, and building AI chatbot...",
    },
    {
      id: "complete",
      icon: Check,
      title: "Website ready!",
      description: "Redirecting to preview...",
    },
  ]

  const currentStep = steps.find((s) => s.id === step) || steps[0]

  return (
    <div className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
          {step === "complete" ? (
            <Check className="w-8 h-8 text-green-600" />
          ) : (
            <Loader2 className="w-8 h-8 animate-spin" />
          )}
        </div>

        <h2 className="text-xl font-semibold mb-2">{currentStep.title}</h2>
        <p className="text-muted-foreground mb-6">{currentStep.description}</p>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {steps.slice(0, 2).map((s, i) => (
            <div
              key={s.id}
              className={`w-2 h-2 rounded-full transition-colors ${
                steps.findIndex((st) => st.id === step) >= i ? "bg-foreground" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
