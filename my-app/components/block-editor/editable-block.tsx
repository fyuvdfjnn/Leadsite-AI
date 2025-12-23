"use client"

import React, { useState, useRef, useEffect } from "react"
import { GripVertical, MoreVertical } from "lucide-react"
import { BlockToolbar } from "../block-toolbar"

export interface EditableBlockProps {
  id: string
  type: string
  children: React.ReactNode
  isEditing: boolean
  isSelected?: boolean
  isDragging?: boolean
  onSelect?: () => void
  onDragStart?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  className?: string
}

export function EditableBlock({
  id,
  type,
  children,
  isEditing,
  isSelected = false,
  isDragging = false,
  onSelect,
  onDragStart,
  onContextMenu,
  className = "",
}: EditableBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing && onSelect) {
      e.stopPropagation()
      onSelect()
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isEditing && onContextMenu) {
      e.preventDefault()
      onContextMenu(e)
    }
  }

  return (
    <div
      ref={blockRef}
      data-block-id={id}
      className={`group relative ${className} ${
        isEditing
          ? isSelected
            ? "ring-2 ring-blue-500 ring-inset"
            : "hover:ring-2 hover:ring-blue-500/50 hover:ring-inset cursor-pointer"
          : ""
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Drag Handle */}
      {isEditing && (
        <div
          className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
          onMouseDown={(e) => {
            e.stopPropagation()
            if (onDragStart) onDragStart()
          }}
        >
          <div className="p-1.5 hover:bg-muted rounded">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Block Toolbar */}
      {isEditing && isSelected && (
        <div className="absolute -left-12 top-2 z-10">
          <BlockToolbar blockType={type} />
        </div>
      )}

      {/* Content */}
      <div className="relative">{children}</div>

      {/* Selection Indicator */}
      {isEditing && isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
          <span className="capitalize">{type}</span>
        </div>
      )}

      {/* Insert Indicator (between blocks) */}
      {isEditing && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-transparent group-hover:bg-blue-500/30 transition-colors opacity-0 group-hover:opacity-100" />
      )}
    </div>
  )
}








