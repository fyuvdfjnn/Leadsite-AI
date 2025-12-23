"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wand2, X, Loader2, Sparkles, ArrowUp } from "lucide-react"

interface AIRegeneratePanelProps {
  open: boolean
  blockId?: string
  blockContent?: string
  onClose: () => void
  onRegenerate: (instruction: string) => Promise<void>
}

export function AIRegeneratePanel({
  open,
  blockId,
  blockContent = "",
  onClose,
  onRegenerate,
}: AIRegeneratePanelProps) {
  const [instruction, setInstruction] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  if (!open) return null

  const quickActions = [
    "Make it more concise",
    "Make it more professional",
    "Make it more engaging",
    "Translate to English",
    "Fix grammar and spelling",
    "Expand with more details",
  ]

  const handleSubmit = async () => {
    if (!instruction.trim() || isProcessing) return

    setIsProcessing(true)
    try {
      await onRegenerate(instruction.trim())
      setInstruction("")
      onClose()
    } catch (error) {
      console.error("Regeneration error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    setIsProcessing(true)
    try {
      await onRegenerate(action)
      onClose()
    } catch (error) {
      console.error("Regeneration error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-lg w-full border border-border overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Rewrite</h2>
              <p className="text-sm text-muted-foreground">Improve or modify this content block</p>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        {blockContent && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Current Content:</p>
              <p className="text-sm line-clamp-3">{blockContent}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Quick Actions */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Or provide custom instructions:</p>
            <div className="relative">
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="e.g., 'Make it more conversational' or 'Add statistics and data'"
                rows={3}
                className="w-full px-4 py-3 bg-muted/50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">AI is rewriting your content...</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!instruction.trim() || isProcessing} className="flex-1 gap-2">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Rewrite
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}













