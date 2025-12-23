"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Send, Wand2, RefreshCw, FileText, Sparkles } from "lucide-react"

interface AIAssistantPanelProps {
  onClose: () => void
}

export function AIAssistantPanel({ onClose }: AIAssistantPanelProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI assistant. I can help you refine your website content, regenerate sections, or answer questions about your site. What would you like to do?",
    },
  ])

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((prev) => [...prev, { role: "user", content: input }])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I understand you want to make that change. I'll update the content for you. Is there anything else you'd like me to adjust?",
        },
      ])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { icon: RefreshCw, label: "Regenerate page", action: "Regenerate this page with fresh content" },
    { icon: FileText, label: "Add section", action: "Add a testimonials section" },
    { icon: Sparkles, label: "Improve SEO", action: "Optimize this page for SEO" },
  ]

  return (
    <aside className="w-80 bg-background border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <p className="text-xs text-muted-foreground mb-2">Quick actions</p>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setInput(action.action)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors text-left"
            >
              <action.icon className="w-4 h-4 text-muted-foreground" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                message.role === "user" ? "bg-foreground text-background" : "bg-muted text-foreground"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to make changes..."
            rows={2}
            className="w-full px-4 py-3 pr-12 bg-muted/50 rounded-xl border-0 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 bottom-2 w-8 h-8"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
