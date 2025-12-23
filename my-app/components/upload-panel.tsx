"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, LinkIcon, FileText, Check, Loader2, X } from "lucide-react"

interface UploadPanelProps {
  onUpload: (content: string) => void
  isAnalyzing: boolean
  hasContent: boolean
}

export function UploadPanel({ onUpload, isAnalyzing, hasContent }: UploadPanelProps) {
  const [textContent, setTextContent] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<"text" | "file" | "url">("text")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      onUpload(file.name)
    }
  }

  const handleTextSubmit = () => {
    if (textContent.trim()) {
      onUpload(textContent)
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUpload(urlInput)
    }
  }

  const clearContent = () => {
    setTextContent("")
    setUrlInput("")
    setUploadedFile(null)
  }

  return (
    <div className="bg-background rounded-2xl border border-border p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">1. Add Your Content</h2>
        {hasContent && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="w-4 h-4" />
            <span>Content added</span>
          </div>
        )}
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 mb-4">
        {[
          { id: "text", label: "Text", icon: FileText },
          { id: "file", label: "File", icon: Upload },
          { id: "url", label: "URL", icon: LinkIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "text" | "file" | "url")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Text Input */}
      {activeTab === "text" && (
        <div className="space-y-4">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste your company description, product information, or any content you want on your website..."
            className="w-full h-48 p-4 bg-muted/50 rounded-xl border-0 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
          <Button onClick={handleTextSubmit} disabled={!textContent.trim() || isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Content"
            )}
          </Button>
        </div>
      )}

      {/* File Upload */}
      {activeTab === "file" && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploadedFile ? (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setUploadedFile(null)
                  clearContent()
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-foreground/30 transition-colors"
            >
              <Upload className="w-10 h-10 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground">PDF, PPT, DOCX up to 10MB</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* URL Input */}
      {activeTab === "url" && (
        <div className="space-y-4">
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://your-existing-website.com"
              className="w-full pl-10 pr-4 py-3 bg-muted/50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We'll analyze your existing website and extract content to create your new site.
          </p>
          <Button onClick={handleUrlSubmit} disabled={!urlInput.trim() || isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Import from URL"
            )}
          </Button>
        </div>
      )}

      {/* AI Suggestions */}
      {hasContent && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm font-medium mb-3">AI Detected:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Industry: Manufacturing / B2B</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Products: 5 detected</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Company info: Found</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
