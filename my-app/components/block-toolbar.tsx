"use client"

import { GripVertical, Plus, Trash2, Copy, Wand2 } from "lucide-react"

interface BlockToolbarProps {
  blockType: string
}

export function BlockToolbar({ blockType }: BlockToolbarProps) {
  return (
    <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex flex-col gap-1 bg-background border border-border rounded-lg p-1 shadow-lg">
        <button className="p-1.5 hover:bg-muted rounded cursor-grab" title="Drag to reorder">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-1.5 hover:bg-muted rounded" title="Add block below">
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-1.5 hover:bg-muted rounded" title="AI regenerate">
          <Wand2 className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-1.5 hover:bg-muted rounded" title="Duplicate">
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-1.5 hover:bg-muted rounded text-destructive" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
