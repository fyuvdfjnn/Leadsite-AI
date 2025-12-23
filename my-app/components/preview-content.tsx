"use client"

import { useState } from "react"
import { PreviewHeader } from "./preview-header"
import { EditorSidebar } from "./editor-sidebar"
import { PagePreview } from "./page-preview"
import { AIAssistantPanel } from "./ai-assistant-panel"

export type EditorMode = "preview" | "edit"
export type ActivePage = "home" | "products" | "about" | "contact"

export function PreviewContent() {
  const [mode, setMode] = useState<EditorMode>("edit")
  const [activePage, setActivePage] = useState<ActivePage>("home")
  const [showAIPanel, setShowAIPanel] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <PreviewHeader mode={mode} setMode={setMode} showAIPanel={showAIPanel} setShowAIPanel={setShowAIPanel} />

      <div className="flex-1 flex">
        {/* Editor Sidebar - Only visible in edit mode */}
        {mode === "edit" && <EditorSidebar activePage={activePage} setActivePage={setActivePage} />}

        {/* Main Preview Area */}
        <main className="flex-1 p-4">
          <div
            className={`h-full bg-background rounded-xl shadow-lg overflow-hidden border border-border ${mode === "edit" ? "ring-2 ring-primary/20" : ""}`}
          >
            <PagePreview page={activePage} isEditing={mode === "edit"} />
          </div>
        </main>

        {/* AI Assistant Panel */}
        {showAIPanel && <AIAssistantPanel onClose={() => setShowAIPanel(false)} />}
      </div>
    </div>
  )
}
