"use client"

import React, { useMemo, useState } from "react"
import { Editor } from "@tiptap/react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Palette,
  Quote,
  Redo,
  Type,
  Underline,
  Undo,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RichTextToolbarProps {
  editor: Editor
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  const colors = useMemo(
    () => [
      "#000000",
      "#333333",
      "#666666",
      "#999999",
      "#CCCCCC",
      "#FF0000",
      "#FF6600",
      "#FFCC00",
      "#00CC00",
      "#0066FF",
      "#6600CC",
    ],
    [],
  )

  const setHeading = (level?: number) => {
    if (!level) {
      editor.chain().focus().setParagraph().run()
      return
    }
    editor.chain().focus().toggleHeading({ level }).run()
  }

  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes("link").href
    setLinkUrl(previousUrl || "https://")
    setShowLinkDialog(true)
  }

  const handleLinkSubmit = () => {
    if (linkUrl === "") {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    }
    setShowLinkDialog(false)
    setLinkUrl("")
  }

  const handleLinkCancel = () => {
    setShowLinkDialog(false)
    setLinkUrl("")
  }

  return (
    <div className="flex items-center gap-1 bg-white border-2 border-gray-400 rounded-lg shadow-2xl py-2 px-2 max-w-[90vw] backdrop-blur-sm" style={{ backgroundColor: '#ffffff', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)' }}>
      <div className="relative">
        <select
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : editor.isActive("heading", { level: 4 })
                    ? "h4"
                    : "p"
          }
          onChange={(e) => {
            const val = e.target.value
            if (val === "p") setHeading(undefined)
            else setHeading(Number(val.replace("h", "")))
          }}
          className="px-2 py-1 text-sm border-2 border-gray-400 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: '#ffffff', color: '#1f2937', borderColor: '#9ca3af' }}
        >
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>
      </div>

      <Divider />

      <ToolbarButton
        icon={<Bold className="w-4 h-4" />}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      />
      <ToolbarButton
        icon={<Italic className="w-4 h-4" />}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      />
      <ToolbarButton
        icon={<Underline className="w-4 h-4" />}
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      />

      <Divider />

      <div className="relative">
        <ToolbarButton
          icon={<Palette className="w-4 h-4" />}
          active={showColorPicker}
          onClick={() => setShowColorPicker((v) => !v)}
          title="Text Color"
        />
        {showColorPicker && (
          <ColorGrid
            colors={colors}
            onPick={(color) => {
              editor.chain().focus().setColor(color).run()
              setShowColorPicker(false)
            }}
          />
        )}
      </div>

      <div className="relative">
        <ToolbarButton
          icon={<Highlighter className="w-4 h-4" />}
          active={showHighlightPicker}
          onClick={() => setShowHighlightPicker((v) => !v)}
          title="Highlight"
        />
        {showHighlightPicker && (
          <ColorGrid
            colors={colors}
            onPick={(color) => {
              editor.chain().focus().toggleHighlight({ color }).run()
              setShowHighlightPicker(false)
            }}
          />
        )}
      </div>

      <Divider />

      <ToolbarButton
        icon={<LinkIcon className="w-4 h-4" />}
        active={editor.isActive("link")}
        onClick={handleLinkClick}
        title="Insert Link"
      />

      <Divider />

      <ToolbarButton
        icon={<AlignLeft className="w-4 h-4" />}
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="Align Left"
      />
      <ToolbarButton
        icon={<AlignCenter className="w-4 h-4" />}
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="Align Center"
      />
      <ToolbarButton
        icon={<AlignRight className="w-4 h-4" />}
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="Align Right"
      />

      <Divider />

      <ToolbarButton
        icon={<List className="w-4 h-4" />}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      />
      <ToolbarButton
        icon={<ListOrdered className="w-4 h-4" />}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      />
      <ToolbarButton
        icon={<Quote className="w-4 h-4" />}
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Quote"
      />

      <Divider />

      <ToolbarButton
        icon={<Undo className="w-4 h-4" />}
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
      />
      <ToolbarButton
        icon={<Redo className="w-4 h-4" />}
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
      />

      <Divider />

      <ToolbarButton
        icon={<Type className="w-4 h-4" />}
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear Formatting"
      />

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>插入链接</DialogTitle>
            <DialogDescription>
              请输入链接地址。留空将移除现有链接。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">链接地址</Label>
              <Input
                id="link-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLinkSubmit()
                  } else if (e.key === "Escape") {
                    handleLinkCancel()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleLinkCancel}>
              取消
            </Button>
            <Button onClick={handleLinkSubmit}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-border mx-1" />
}

function ToolbarButton({
  icon,
  active,
  onClick,
  title,
}: {
  icon: React.ReactNode
  active?: boolean
  onClick: () => void
  title?: string
}) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className="h-8 w-8 p-0 text-gray-900 hover:text-gray-900 hover:bg-gray-100"
      onClick={onClick}
      title={title}
      style={{ color: '#1f2937' }}
    >
      {icon}
    </Button>
  )
}

function ColorGrid({ colors, onPick }: { colors: string[]; onPick: (color: string) => void }) {
  return (
    <div className="absolute top-full left-0 mt-1 bg-white border-2 border-gray-400 rounded-lg shadow-2xl p-2 z-50" style={{ backgroundColor: '#ffffff', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)' }}>
      <div className="grid grid-cols-6 gap-1">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onPick(color)}
            className="w-6 h-6 rounded border-2 border-gray-400 hover:scale-110 transition-transform"
            style={{ backgroundColor: color, borderColor: '#9ca3af' }}
          />
        ))}
      </div>
    </div>
  )
}

