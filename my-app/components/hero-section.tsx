"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, LinkIcon, FileText, Sparkles, ArrowRight, ArrowUp, X, Loader2, Globe, Check, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { UrlModal } from "./url-modal"

const templates = [
  {
    id: 1,
    name: "Gen AI Video Mobile App",
    category: "AI Product",
    image: "/img1.png",
  },
  {
    id: 2,
    name: "Technology Startups and Innovators",
    category: "SaaS",
    image: "/img2.png",
  },
  {
    id: 3,
    name: "AI-driven Businesses",
    category: "SaaS",
    image: "/img3.png",
  },
  {
    id: 4,
    name: "Law Firm / Professional Service",
    category: "Professional",
    image: "/img4.png",
  },
  {
    id: 5,
    name: "Gen AI Mobile App",
    category: "AI Product",
    image: "/img5.png",
  },
  {
    id: 6,
    name: "Minimalist Brand Experience",
    category: "App Landing",
    image: "/img6.png",
  },
  {
    id: 7,
    name: "Architecture Website",
    category: "Agency",
    image: "/img7.png",
  },
  {
    id: 8,
    name: "Agency & Portfolio Website",
    category: "Agency",
    image: "/img8.png",
  },
  {
    id: 9,
    name: "Fintech SaaS Startup",
    category: "App Landing",
    image: "/img9.png",
  },
]

interface AttachedItem {
  id: string
  type: "file" | "url"
  name: string
  url?: string
  file?: File
  isProcessing?: boolean
}

export function HeroSection() {
  const router = useRouter()
  const [inputValue, setInputValue] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [attachedItems, setAttachedItems] = useState<AttachedItem[]>([])
  const [showUrlModal, setShowUrlModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [viewingTemplateDetail, setViewingTemplateDetail] = useState<number | null>(null)
  const [isScrolledToTop, setIsScrolledToTop] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const buildPrompt = () => {
    // Build prompt with input and attached items info
    let prompt = inputValue.trim()
    if (attachedItems.length > 0) {
      const itemsInfo = attachedItems.map(item => {
        if (item.type === "file") {
          return `File: ${item.name}`
        } else {
          return `URL: ${item.url}`
        }
      }).join(", ")
      prompt = prompt ? `${prompt}\n\nAttachments: ${itemsInfo}` : itemsInfo
    }
    return prompt
  }

  const handleSend = () => {
    // Allow sending if there's input OR attached items
    if (!inputValue.trim() && attachedItems.length === 0) return
    
    const prompt = buildPrompt()
    
    // If template is selected, go directly to editor
    if (selectedTemplate !== null) {
      const encodedInput = encodeURIComponent(prompt)
      router.push(`/editor?prompt=${encodedInput}&template=${selectedTemplate}`)
    } else {
      // If no template selected, store prompt and go to dashboard to select template
      if (prompt) {
        sessionStorage.setItem("homePagePrompt", prompt)
      }
      router.push("/dashboard")
    }
  }

  const handleSelectTemplateAndEdit = (templateId: number) => {
    const prompt = buildPrompt()
    const encodedInput = encodeURIComponent(prompt)
    router.push(`/editor?prompt=${encodedInput}&template=${templateId}`)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = [".pdf", ".ppt", ".pptx", ".doc", ".docx"]
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    
    if (!validTypes.includes(fileExtension)) {
      alert("Please upload a PDF, PPT, or DOCX file")
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    const newItem: AttachedItem = {
      id: Date.now().toString(),
      type: "file",
      name: file.name,
      file: file,
      isProcessing: true,
    }

    setAttachedItems(prev => [...prev, newItem])

    // If no template selected, store prompt and redirect to dashboard to select template
    if (selectedTemplate === null) {
      const prompt = buildPrompt()
      if (prompt) {
        sessionStorage.setItem("homePagePrompt", prompt)
      }
      router.push("/dashboard")
    }

    // Simulate processing (continue in background)
    setTimeout(() => {
      setAttachedItems(prev =>
        prev.map(item =>
          item.id === newItem.id ? { ...item, isProcessing: false } : item
        )
      )
    }, 1500)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUrlSubmit = (url: string) => {
    try {
      const urlObj = new URL(url)
      const newItem: AttachedItem = {
        id: Date.now().toString(),
        type: "url",
        name: urlObj.hostname,
        url: url,
        isProcessing: true,
      }

      setAttachedItems(prev => [...prev, newItem])

      // Simulate processing
      setTimeout(() => {
        setAttachedItems(prev =>
          prev.map(item =>
            item.id === newItem.id ? { ...item, isProcessing: false } : item
          )
        )
      }, 1500)
    } catch {
      alert("Please enter a valid URL")
    }
  }

  const removeAttachedItem = (id: string) => {
    setAttachedItems(prev => prev.filter(item => item.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    if (extension === "pdf") return "📄"
    if (["ppt", "pptx"].includes(extension || "")) return "📊"
    if (["doc", "docx"].includes(extension || "")) return "📝"
    return "📎"
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

  return (
    <section className="relative min-h-screen bg-foreground text-background pt-16 overflow-hidden">
      {/* Video Background - Similar to Squarespace style */}
      <div className="absolute inset-0 z-0">
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center", filter: "brightness(0.6) contrast(1.1)" }}
          onError={(e) => {
            console.error("Video failed to load:", e)
            // Hide video on error, fallback gradient will show
            e.currentTarget.style.display = "none"
          }}
        >
          {/* Using locally provided video: place file in /public */}
          <source src="/vedio.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay for better text readability - similar to Squarespace's subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-24 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 text-background/80 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Website Builder for B2B</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
            Turn your product docs into a{" "}
            <span className="inline-block mt-2">
              professional website
            </span>
          </h1>

          <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto mb-12 text-pretty">
            Upload your PDF, PPT, or paste a URL. Our AI transforms it into a stunning, SEO-optimized website with
            built-in AI customer service — in minutes.
          </p>

          {/* AI Upload Hub */}
          <div
            className={`relative max-w-3xl mx-auto bg-background rounded-2xl shadow-2xl transition-all ${
              isDragging ? "ring-2 ring-primary scale-[1.02]" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Attached Items - Display above input */}
            {attachedItems.length > 0 && (
              <div className="px-3 pt-2.5 pb-2 border-b border-border/50">
                <div className="flex flex-wrap gap-1.5">
                  {attachedItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex items-center gap-1.5 px-2 py-1.5 bg-muted/40 rounded-md border border-border/30 hover:border-border/60 hover:bg-muted/60 transition-all"
                    >
                      {item.isProcessing ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {item.type === "file" ? "Processing..." : "Analyzing..."}
                          </span>
                        </>
                      ) : (
                        <>
                          {item.type === "file" ? (
                            <>
                              <span className="text-sm shrink-0">{getFileIcon(item.name)}</span>
                              <div className="flex flex-col min-w-0 max-w-[150px]">
                                <span className="text-xs font-medium truncate">{item.name}</span>
                                {item.file && (
                                  <span className="text-[10px] text-muted-foreground leading-tight">{formatFileSize(item.file.size)}</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="text-xs font-medium truncate max-w-[120px]">{item.name}</span>
                            </>
                          )}
                          <button
                            onClick={() => removeAttachedItem(item.id)}
                            className="ml-0.5 p-0.5 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            <X className="w-2.5 h-2.5 text-muted-foreground" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GPT-style Input Row - All elements in one container */}
            <div className="flex items-center gap-2 p-3">
              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    // Auto-detect URL paste
                    const pastedText = e.target.value
                    const urlRegex = /(https?:\/\/[^\s]+)/g
                    const matches = pastedText.match(urlRegex)
                    if (matches && matches.length > 0) {
                      const url = matches[0]
                      // Check if URL is not already attached
                      if (!attachedItems.some(item => item.url === url)) {
                        try {
                          const urlObj = new URL(url)
                          const newItem: AttachedItem = {
                            id: Date.now().toString(),
                            type: "url",
                            name: urlObj.hostname,
                            url: url,
                            isProcessing: true,
                          }
                          setAttachedItems(prev => [...prev, newItem])
                          // Remove URL from input
                          setInputValue(pastedText.replace(url, "").trim())
                          setTimeout(() => {
                            setAttachedItems(prev =>
                              prev.map(item =>
                                item.id === newItem.id ? { ...item, isProcessing: false } : item
                              )
                            )
                          }, 1500)
                        } catch {
                          // Invalid URL, ignore
                        }
                      }
                    }
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder={attachedItems.length > 0 ? "Add your description or instructions..." : "Describe your business or paste content here..."}
                  rows={1}
                  className="w-full px-4 py-3 text-foreground bg-transparent rounded-xl resize-none focus:outline-none placeholder:text-muted-foreground text-base leading-relaxed min-h-[48px] max-h-[200px]"
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = "auto"
                    target.style.height = `${Math.min(target.scrollHeight, 200)}px`
                  }}
                />
              </div>

              {/* Action Buttons - Compact layout */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  title="Upload PDF, PPT, DOCX"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  title="Import from URL"
                  onClick={() => setShowUrlModal(true)}
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  className="h-9 w-9 rounded-lg ml-1" 
                  disabled={!inputValue.trim() && attachedItems.length === 0}
                  onClick={handleSend}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Subtle Hints */}
            <div className="flex items-center justify-center gap-6 px-4 pb-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                <FileText className="w-3.5 h-3.5" />
                PDF / PPT / DOCX
              </span>
              <span className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                <LinkIcon className="w-3.5 h-3.5" />
                Website URL
              </span>
              <span className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                <Sparkles className="w-3.5 h-3.5" />
                AI generates in seconds
              </span>
            </div>
          </div>
        </div>

        <div className="mt-20 max-w-7xl mx-auto">
          {/* Header with Title and View All Button */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-background/50 text-sm uppercase tracking-wider">
              Or start with a template
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-background border-background/30 hover:bg-background/10 hover:text-background rounded-full bg-transparent"
              onClick={() => {
                // Build prompt with input and attached items info
                let prompt = inputValue.trim()
                if (attachedItems.length > 0) {
                  const itemsInfo = attachedItems.map(item => {
                    if (item.type === "file") {
                      return `File: ${item.name}`
                    } else {
                      return `URL: ${item.url}`
                    }
                  }).join(", ")
                  prompt = prompt ? `${prompt}\n\nAttachments: ${itemsInfo}` : itemsInfo
                }
                
                // Store prompt in sessionStorage to pass to editor later
                if (prompt) {
                  sessionStorage.setItem("homePagePrompt", prompt)
                }
                
                router.push("/dashboard")
              }}
            >
              View all 50+ templates
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Template Grid - 3x3 Layout like Webjourney */}
          <div className="grid grid-cols-3 gap-5">
              {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  // Toggle selection: if already selected, deselect; otherwise select
                  setSelectedTemplate(selectedTemplate === template.id ? null : template.id)
                }}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                  selectedTemplate === template.id
                    ? "bg-background/10 border-2 border-background ring-2 ring-background/30"
                    : "bg-background/5 border border-background/10 hover:border-background/30"
                }`}
              >
                {/* View Detail Icon - Top Right */}
                <div 
                  className="absolute top-2 right-2 z-20 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/90 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewingTemplateDetail(template.id)
                  }}
                >
                  <Eye className="w-4 h-4 text-foreground" />
                </div>

                {/* Template Image */}
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={template.image || "/placeholder.svg"}
                    alt={template.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      selectedTemplate === template.id 
                        ? "scale-100" 
                        : "group-hover:scale-105"
                    }`}
                  />
                  
                  {/* Selected Overlay - Gray with Checkmark in Center */}
                  {selectedTemplate === template.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-6 h-6 text-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4 bg-background/5">
                  <h3 className="font-semibold text-background text-sm mb-1 truncate">{template.name}</h3>
                  <span className="text-xs text-background/60">{template.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                    onClick={() => router.push("/dashboard")}
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

      {/* URL Modal */}
      <UrlModal
        open={showUrlModal}
        onClose={() => setShowUrlModal(false)}
        onUrlSubmit={handleUrlSubmit}
      />
    </section>
  )
}
