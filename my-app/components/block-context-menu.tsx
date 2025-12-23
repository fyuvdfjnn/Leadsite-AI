"use client"

import React from "react"
import { Copy, Trash2, ArrowUp, ArrowDown, Wand2, Plus, Type, Image, Square, Edit, Layout, Heart } from "lucide-react"

interface BlockContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onEdit?: () => void
  onViewLayout?: () => void
  onDuplicate?: () => void
  onFavorite?: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onAIRewrite?: () => void
  onInsertAbove?: (type: string) => void
  onInsertBelow?: (type: string) => void
}

export function BlockContextMenu({
  x,
  y,
  onClose,
  onEdit,
  onViewLayout,
  onDuplicate,
  onFavorite,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAIRewrite,
  onInsertAbove,
  onInsertBelow,
}: BlockContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  const blockTypes = [
    { id: "text", label: "Text", icon: Type },
    { id: "heading", label: "Heading", icon: Type },
    { id: "image", label: "Image", icon: Image },
    { id: "button", label: "Button", icon: Square },
  ]

  return (
    <div
      ref={menuRef}
      className="fixed bg-background border border-border rounded-lg shadow-lg py-1 z-50 min-w-[200px]"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {/* Edit Section */}
      {onEdit && (
        <button
          onClick={() => {
            onEdit()
            onClose()
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
        >
          <Edit className="w-4 h-4 text-muted-foreground" />
          编辑部分
        </button>
      )}

      {/* View Layout */}
      {onViewLayout && (
        <button
          onClick={() => {
            onViewLayout()
            onClose()
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
        >
          <Layout className="w-4 h-4 text-muted-foreground" />
          视图布局
        </button>
      )}

      {/* Action Icons Row */}
      {(onDuplicate || onFavorite || onMoveUp || onMoveDown) && (
        <>
          <div className="h-px bg-border my-1" />
          <div className="flex items-center justify-around px-2 py-1">
            {onDuplicate && (
              <button
                onClick={() => {
                  onDuplicate()
                  onClose()
                }}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Duplicate"
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            {onFavorite && (
              <button
                onClick={() => {
                  onFavorite()
                  onClose()
                }}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Favorite"
              >
                <Heart className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            {onMoveUp && (
              <button
                onClick={() => {
                  onMoveUp()
                  onClose()
                }}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Move Up"
              >
                <ArrowUp className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={() => {
                  onMoveDown()
                  onClose()
                }}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Move Down"
              >
                <ArrowDown className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </>
      )}

      {/* Insert Above */}
      {onInsertAbove && (
        <>
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase">Insert Above</div>
          {blockTypes.map((block) => (
            <button
              key={block.id}
              onClick={() => {
                onInsertAbove(block.id)
                onClose()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <block.icon className="w-4 h-4 text-muted-foreground" />
              {block.label}
            </button>
          ))}
          <div className="h-px bg-border my-1" />
        </>
      )}

      {/* Actions */}
      {onAIRewrite && (
        <button
          onClick={() => {
            onAIRewrite()
            onClose()
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
        >
          <Wand2 className="w-4 h-4 text-muted-foreground" />
          AI Rewrite
        </button>
      )}

      {onDuplicate && (
        <button
          onClick={() => {
            onDuplicate()
            onClose()
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
        >
          <Copy className="w-4 h-4 text-muted-foreground" />
          Duplicate
        </button>
      )}

      {/* Move Actions */}
      {(onMoveUp || onMoveDown) && (
        <>
          <div className="h-px bg-border my-1" />
          {onMoveUp && (
            <button
              onClick={() => {
                onMoveUp()
                onClose()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <ArrowUp className="w-4 h-4 text-muted-foreground" />
              Move Up
            </button>
          )}
          {onMoveDown && (
            <button
              onClick={() => {
                onMoveDown()
                onClose()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <ArrowDown className="w-4 h-4 text-muted-foreground" />
              Move Down
            </button>
          )}
        </>
      )}

      {/* Insert Below */}
      {onInsertBelow && (
        <>
          <div className="h-px bg-border my-1" />
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase">Insert Below</div>
          {blockTypes.map((block) => (
            <button
              key={block.id}
              onClick={() => {
                onInsertBelow(block.id)
                onClose()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <block.icon className="w-4 h-4 text-muted-foreground" />
              {block.label}
            </button>
          ))}
        </>
      )}

      {/* Delete */}
      {onDelete && (
        <>
          <div className="h-px bg-border my-1" />
          <button
            onClick={() => {
              onDelete()
              onClose()
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </>
      )}
    </div>
  )
}

