"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "./dashboard-header"
import { UploadPanel } from "./upload-panel"
import { TemplateGrid } from "./template-grid"
import { GeneratingModal } from "./generating-modal"

export type GenerationStep = "idle" | "analyzing" | "generating" | "complete"

// Template data (should match template-grid.tsx)
const templates = [
  { id: "industrial-pro", name: "Industrial Pro", category: "B2B Industrial", image: "/img1.png" },
  { id: "tech-forward", name: "Tech Forward", category: "SaaS", image: "/img2.png" },
  { id: "brand-studio", name: "Brand Studio", category: "AI Product", image: "/img3.png" },
  { id: "corporate-edge", name: "Corporate Edge", category: "Professional", image: "/img4.png" },
  { id: "factory-direct", name: "Factory Direct", category: "B2B Industrial", image: "/img5.png" },
  { id: "innovation-lab", name: "Innovation Lab", category: "AI Product", image: "/img6.png" },
  { id: "agency-starter", name: "Agency Starter", category: "Agency", image: "/img7.png" },
  { id: "fintech-pro", name: "Fintech Pro", category: "SaaS", image: "/img8.png" },
  { id: "app-landing", name: "App Landing", category: "App Landing", image: "/img9.png" },
]

export function DashboardContent() {
  const router = useRouter()
  const [step, setStep] = useState<GenerationStep>("idle")
  const [uploadedContent, setUploadedContent] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [viewingTemplateDetail, setViewingTemplateDetail] = useState<string | null>(null)
  const [isScrolledToTop, setIsScrolledToTop] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleSkip = () => {
    // 获取 sessionStorage 中的 prompt
    const prompt = sessionStorage.getItem("homePagePrompt") || ""
    if (prompt) {
      const encodedInput = encodeURIComponent(prompt)
      router.push(`/editor?prompt=${encodedInput}`)
    } else {
      // 如果没有 prompt，直接跳转到编辑页
      router.push("/editor")
    }
  }

  const handleUpload = (content: string) => {
    setUploadedContent(content)
    setStep("analyzing")

    // Simulate AI analysis
    setTimeout(() => {
      setStep("idle")
    }, 2000)
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleViewTemplateDetail = (templateId: string) => {
    setViewingTemplateDetail(templateId)
  }

  const handleSelectTemplateAndEdit = (templateId: string) => {
    const prompt = sessionStorage.getItem("homePagePrompt") || ""
    if (prompt) {
      const encodedInput = encodeURIComponent(prompt)
      router.push(`/editor?prompt=${encodedInput}&template=${templateId}`)
    } else {
      router.push(`/editor?template=${templateId}`)
    }
  }

  // Scroll detection for template browse page
  useEffect(() => {
    if (!viewingTemplateDetail) {
      setIsScrolledToTop(true)
      return
    }
    
    const container = scrollContainerRef.current
    if (!container) return
    
    const handleScroll = () => {
      setIsScrolledToTop(container.scrollTop <= 10)
    }
    
    container.addEventListener('scroll', handleScroll)
    // Reset scroll position when template changes
    container.scrollTop = 0
    setIsScrolledToTop(true)
    
    return () => container.removeEventListener('scroll', handleScroll)
  }, [viewingTemplateDetail])

  const handleGenerate = () => {
    if (!uploadedContent || !selectedTemplate) return

    setStep("generating")

    // Simulate generation - in real app this calls AI API
    setTimeout(() => {
      setStep("complete")
      // Redirect to preview
      window.location.href = "/preview"
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Choose a Template</h1>
              <p className="text-muted-foreground">Select a template to start building your website</p>
            </div>
            {/* Skip Label - Tag-like guidance */}
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 text-base font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-dotted cursor-pointer mt-1"
            >
              跳过
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Template Selection - Full Width */}
          <TemplateGrid
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            hasContent={!!uploadedContent}
            onGenerate={handleGenerate}
            onViewTemplateDetail={handleViewTemplateDetail}
          />
        </div>
      </main>

      {/* Fullscreen Template Browse Page */}
      {viewingTemplateDetail !== null && (() => {
        const template = templates.find(t => t.id === viewingTemplateDetail)
        if (!template) return null
        
        const currentIndex = templates.findIndex(t => t.id === viewingTemplateDetail)
        const handleSwitchTemplate = (direction: 'prev' | 'next') => {
          let newIndex = currentIndex
          if (direction === 'prev') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : templates.length - 1
          } else {
            newIndex = currentIndex < templates.length - 1 ? currentIndex + 1 : 0
          }
          setViewingTemplateDetail(templates[newIndex].id)
        }
        
        return (
          <div className="fixed inset-0 z-50 bg-foreground text-background overflow-hidden">
            {/* Top Navigation Bar - Show when scrolled to top */}
            <div 
              className={`absolute top-0 left-0 right-0 z-10 transition-all duration-300 ${
                isScrolledToTop 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-full pointer-events-none'
              }`}
            >
              <div className="bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                  {/* 返回按钮 - 只显示图标 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-background hover:bg-background/20 rounded-lg"
                    onClick={() => setViewingTemplateDetail(null)}
                    title="返回"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </Button>
                  
                  {/* 使用模板按钮 - 最右侧 */}
                  <Button
                    size="sm"
                    className="bg-background/90 text-foreground hover:bg-background rounded-lg backdrop-blur-sm"
                    onClick={() => handleSelectTemplateAndEdit(template.id)}
                  >
                    使用模板
                  </Button>
                </div>
              </div>
            </div>

            {/* Fullscreen Template Image with Scroll */}
            <div 
              ref={scrollContainerRef}
              className="absolute inset-0 overflow-auto"
            >
              <img
                src={template.image || "/placeholder.svg"}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Fixed Navigation Buttons at Bottom Center */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-background hover:bg-background/20 rounded-lg bg-transparent backdrop-blur-sm"
                onClick={() => handleSwitchTemplate('prev')}
                title="上一个模板"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-background hover:bg-background/20 rounded-lg bg-transparent backdrop-blur-sm"
                onClick={() => handleSwitchTemplate('next')}
                title="下一个模板"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      })()}

      {/* Generating Modal */}
      {(step === "analyzing" || step === "generating") && <GeneratingModal step={step} />}
    </div>
  )
}
