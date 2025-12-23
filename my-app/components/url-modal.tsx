"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { LinkIcon, X, Loader2, Sparkles, Globe, Check } from "lucide-react"

interface UrlModalProps {
  open: boolean
  onClose: () => void
  onUrlSubmit: (url: string) => void
}

export function UrlModal({ open, onClose, onUrlSubmit }: UrlModalProps) {
  const [urlInput, setUrlInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<"input" | "fetching" | "analyzing" | "complete">("input")

  if (!open) return null

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async () => {
    const trimmedUrl = urlInput.trim()
    
    if (!trimmedUrl) {
      alert("Please enter a URL")
      return
    }

    if (!isValidUrl(trimmedUrl)) {
      // Try to add https:// if no protocol
      const urlWithProtocol = trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`
      if (!isValidUrl(urlWithProtocol)) {
        alert("Please enter a valid URL")
        return
      }
      setUrlInput(urlWithProtocol)
    }

    setIsProcessing(true)
    setStep("fetching")

    // Simulate fetching content
    setTimeout(() => {
      setStep("analyzing")
      
      // Simulate analysis
      setTimeout(() => {
        setStep("complete")
        
        // Complete and close
        setTimeout(() => {
          const finalUrl = urlInput.trim().startsWith("http") ? urlInput.trim() : `https://${urlInput.trim()}`
          onUrlSubmit(finalUrl)
          // Reset and close after a brief moment
          setTimeout(() => {
            setUrlInput("")
            setStep("input")
            setIsProcessing(false)
            onClose()
          }, 500)
        }, 800)
      }, 2000)
    }, 1500)
  }

  const handleClose = () => {
    if (!isProcessing) {
      setUrlInput("")
      setStep("input")
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isProcessing && urlInput.trim()) {
      handleSubmit()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-lg w-full border border-border overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-semibold mb-2">Import from URL</h2>
          <p className="text-sm text-muted-foreground">
            Enter a website URL to extract and analyze its content
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {step === "input" ? (
            <div className="space-y-4">
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://example.com"
                  className="w-full pl-12 pr-4 py-3 bg-muted/50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  autoFocus
                />
              </div>

              <p className="text-xs text-muted-foreground">
                We'll analyze your existing website and extract content to create your new site.
              </p>

              <Button
                onClick={handleSubmit}
                disabled={!urlInput.trim()}
                className="w-full gap-2"
                size="lg"
              >
                <Globe className="w-4 h-4" />
                Import & Analyze
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* URL Display */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {urlInput.trim().startsWith("http") ? urlInput.trim() : `https://${urlInput.trim()}`}
                  </p>
                </div>
              </div>

              {/* Processing States */}
              {step === "fetching" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <p className="font-medium mb-2">Fetching content from URL...</p>
                  <p className="text-sm text-muted-foreground">
                    Extracting text, images, and structure from the website
                  </p>
                </div>
              )}

              {step === "analyzing" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <p className="font-medium mb-2">Analyzing content...</p>
                  <p className="text-sm text-muted-foreground">
                    Identifying key information, products, and company details
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>This may take a few seconds</span>
                  </div>
                </div>
              )}

              {step === "complete" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-medium mb-2 text-green-600">URL added successfully!</p>
                  <p className="text-sm text-muted-foreground">
                    The URL has been added to your attachments
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

