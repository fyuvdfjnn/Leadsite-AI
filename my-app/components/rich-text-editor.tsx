"use client"

import React, { useEffect, useRef } from "react"
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { RichTextToolbar } from "./rich-text-toolbar"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  isEditing: boolean
  className?: string
  placeholder?: string
  style?: React.CSSProperties
}

export function RichTextEditor({
  value,
  onChange,
  isEditing,
  className = "",
  placeholder = "Click to edit...",
  style,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    editable: isEditing,
    extensions: [
      Color.configure({ types: ["textStyle"] }),
      TextStyle,
      Highlight,
      Underline,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false)
    }
  }, [editor, value])

  // 右键在光标位置弹出相同的气泡工具栏（若未选择文本，会将选区落在右键位置）
  useEffect(() => {
    const el = containerRef.current
    if (!el || !editor || !isEditing) return

    const handler = (event: MouseEvent) => {
      event.preventDefault()
      const coords = { left: event.clientX, top: event.clientY }
      const pos = editor.view.posAtCoords(coords)
      if (pos) {
        const docSize = editor.state.doc.content.size
        const from = Math.max(0, pos.pos - 1)
        const to = Math.min(docSize, pos.pos + 1)
        editor.chain().focus().setTextSelection({ from, to }).run()
      } else {
        editor.commands.focus()
      }
    }

    el.addEventListener("contextmenu", handler)
    return () => el.removeEventListener("contextmenu", handler)
  }, [editor, isEditing])

  if (!isEditing) {
    return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: value }} />
  }

  return (
    <div ref={containerRef} className="relative">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 120, maxWidth: "calc(100vw - 40px)" }}
          shouldShow={({ editor }) => {
            const selection = editor.state.selection
            return !selection.empty && editor.isEditable
          }}
        >
          <RichTextToolbar editor={editor} />
        </BubbleMenu>
      )}

      <EditorContent
        editor={editor}
        className={`${className} min-h-[2em] px-2 py-1 rounded cursor-text border border-transparent focus:border-primary/30 focus:bg-primary/5 focus:outline-none hover:bg-primary/5 transition-colors [&_.ProseMirror]:outline-none`}
        style={style}
      />
    </div>
  )
}

