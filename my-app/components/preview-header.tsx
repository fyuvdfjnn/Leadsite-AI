"use client"

import type { EditorMode } from "./preview-content"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Eye, Edit3, Wand2, Globe, ArrowLeft, Monitor, Tablet, Smartphone } from "lucide-react"

interface PreviewHeaderProps {
  mode: EditorMode
  setMode: (mode: EditorMode) => void
  showAIPanel: boolean
  setShowAIPanel: (show: boolean) => void
}

export function PreviewHeader({ mode, setMode, showAIPanel, setShowAIPanel }: PreviewHeaderProps) {
  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>

          <div className="h-6 w-px bg-border" />

          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="text-lg font-semibold">LeadSite AI</span>
          </Link>
        </div>

        {/* Center - Mode Toggle & Viewport */}
        <div className="flex items-center gap-4">
          {/* Mode Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${mode === "preview" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${mode === "edit" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>

          {/* Viewport Selector */}
          <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
            <button className="p-1.5 rounded-md bg-background shadow-sm">
              <Monitor className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
              <Tablet className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Button
            variant={showAIPanel ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="gap-2"
          >
            <Wand2 className="w-4 h-4" />
            AI Assistant
          </Button>

          <Button size="sm" className="gap-2">
            <Globe className="w-4 h-4" />
            Publish
          </Button>
        </div>
      </div>
    </header>
  )
}
