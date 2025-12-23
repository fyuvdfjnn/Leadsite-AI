"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bot, Save, X } from "lucide-react"

interface ChatbotConfigPanelProps {
  onClose: () => void
}

export function ChatbotConfigPanel({ onClose }: ChatbotConfigPanelProps) {
  const [botName, setBotName] = useState("AI Assistant")
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hello! How can I help you today? I can answer questions about our products, services, and company.",
  )
  const [faqs, setFaqs] = useState([
    { question: "What products do you offer?", answer: "We offer a wide range of industrial machinery..." },
    { question: "How can I request a quote?", answer: "You can request a quote by filling out our contact form..." },
    { question: "What is your shipping policy?", answer: "We ship worldwide with various shipping options..." },
  ])

  const handleSave = () => {
    // Save configuration
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Chatbot Configuration</h2>
              <p className="text-sm text-muted-foreground">Customize your website's AI assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Bot Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Bot Name</label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted/50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Welcome Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Welcome Message</label>
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-muted/50 rounded-lg border-0 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* FAQ Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium">Frequently Asked Questions</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
                className="bg-transparent"
              >
                Add FAQ
              </Button>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...faqs]
                        newFaqs[index].question = e.target.value
                        setFaqs(newFaqs)
                      }}
                      placeholder="Question"
                      className="flex-1 px-3 py-2 bg-background rounded-lg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => {
                      const newFaqs = [...faqs]
                      newFaqs[index].answer = e.target.value
                      setFaqs(newFaqs)
                    }}
                    placeholder="Answer"
                    rows={2}
                    className="w-full px-3 py-2 bg-background rounded-lg border-0 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Base Info */}
          <div className="p-4 bg-muted/30 rounded-xl">
            <h3 className="font-medium mb-2">Knowledge Base</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your AI chatbot is automatically trained on all content from your website, including:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Product descriptions and specifications
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Company information and history
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Uploaded documents (PDF, PPT, DOCX)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Custom FAQs (configured above)
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  )
}
