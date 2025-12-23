"use client"

import { Badge } from "@/components/ui/badge"
import { Sparkles, Check } from "lucide-react"

interface TemplateGridProps {
  selectedTemplate: string | null
  onSelectTemplate: (id: string) => void
  hasContent: boolean
  onGenerate: () => void
  onViewTemplateDetail?: (id: string) => void
}

const templates = [
  {
    id: "industrial-pro",
    name: "Industrial Pro",
    category: "B2B Industrial",
    style: "Minimal Professional",
    image: "/img1.png",
    recommended: true,
  },
  {
    id: "tech-forward",
    name: "Tech Forward",
    category: "SaaS",
    style: "Modern & Bold",
    image: "/img2.png",
    recommended: false,
  },
  {
    id: "brand-studio",
    name: "Brand Studio",
    category: "AI Product",
    style: "Visual Impact",
    image: "/img3.png",
    recommended: false,
  },
  {
    id: "corporate-edge",
    name: "Corporate Edge",
    category: "Professional",
    style: "Clean & Trust",
    image: "/img4.png",
    recommended: true,
  },
  {
    id: "factory-direct",
    name: "Factory Direct",
    category: "B2B Industrial",
    style: "Product Focused",
    image: "/img5.png",
    recommended: false,
  },
  {
    id: "innovation-lab",
    name: "Innovation Lab",
    category: "AI Product",
    style: "Futuristic",
    image: "/img6.png",
    recommended: false,
  },
  {
    id: "agency-starter",
    name: "Agency Starter",
    category: "Agency",
    style: "Creative Bold",
    image: "/img7.png",
    recommended: false,
  },
  {
    id: "fintech-pro",
    name: "Fintech Pro",
    category: "SaaS",
    style: "Trust & Security",
    image: "/img8.png",
    recommended: true,
  },
  {
    id: "app-landing",
    name: "App Landing",
    category: "App Landing",
    style: "Mobile First",
    image: "/img9.png",
    recommended: false,
  },
]

export function TemplateGrid({ selectedTemplate, onSelectTemplate, hasContent, onGenerate, onViewTemplateDetail }: TemplateGridProps) {
  const handleTemplateClick = (templateId: string) => {
    // If onViewTemplateDetail is provided, open detail view instead of going to editor
    if (onViewTemplateDetail) {
      onViewTemplateDetail(templateId)
      return
    }
    
    // Fallback: original behavior (direct to editor)
    onSelectTemplate(templateId)
    
    // Get prompt from sessionStorage (set from home page)
    const prompt = sessionStorage.getItem("homePagePrompt") || ""
    
    // Redirect to editor page with prompt
    if (prompt) {
      const encodedInput = encodeURIComponent(prompt)
      window.location.href = `/editor?prompt=${encodedInput}&template=${templateId}`
    } else {
      window.location.href = `/editor?template=${templateId}`
    }
    
    // Clear sessionStorage after use
    sessionStorage.removeItem("homePagePrompt")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Choose a Template</h2>
        {hasContent && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Sparkles className="w-4 h-4" />
            <span>AI recommended templates highlighted</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateClick(template.id)}
            className={`relative group text-left bg-background rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              selectedTemplate === template.id
                ? "border-foreground ring-2 ring-foreground/20 shadow-lg"
                : "border-border hover:border-foreground/30 hover:shadow-xl"
            }`}
          >
            {/* Recommended Badge */}
            {template.recommended && hasContent && (
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-foreground text-background gap-1 text-xs">
                  <Sparkles className="w-3 h-3" />
                  AI Pick
                </Badge>
              </div>
            )}

            {/* Selected Checkmark */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-foreground rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-background" />
              </div>
            )}

            {/* Image Container */}
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={template.image || "/placeholder.svg"}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-2.5">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-medium text-xs truncate">{template.name}</h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {template.category}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{template.style}</p>
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}
