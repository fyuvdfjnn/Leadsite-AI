"use client"

import { Suspense } from "react"
import { VisualEditor } from "@/components/visual-editor"
import { useSearchParams } from "next/navigation"

function EditorContent() {
  const searchParams = useSearchParams()
  const prompt = searchParams.get("prompt") || ""
  
  return <VisualEditor initialPrompt={prompt} />
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EditorContent />
    </Suspense>
  )
}

