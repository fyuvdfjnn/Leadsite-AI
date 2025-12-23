"use client"

import React, { useState } from "react"
import { Home, Package, Users, Mail, Plus, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Page {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
}

interface PageManagerProps {
  pages: Page[]
  activePage: string
  onPageChange: (pageId: string) => void
  onPageReorder?: (pages: Page[]) => void
  onAddPage?: () => void
}

function SortablePageItem({
  page,
  isActive,
  onClick,
}: {
  page: Page
  isActive: boolean
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = page.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive ? "bg-muted font-medium" : "hover:bg-muted/50"
      }`}
      onClick={onClick}
    >
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm flex-1 truncate">{page.name}</span>
      {isActive && <div className="w-1.5 h-1.5 bg-foreground rounded-full shrink-0" />}
    </div>
  )
}

export function PageManager({ pages, activePage, onPageChange, onPageReorder, onAddPage }: PageManagerProps) {
  const [localPages, setLocalPages] = useState(pages)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localPages.findIndex((p) => p.id === active.id)
      const newIndex = localPages.findIndex((p) => p.id === over.id)

      const newPages = arrayMove(localPages, oldIndex, newIndex)
      setLocalPages(newPages)
      if (onPageReorder) {
        onPageReorder(newPages)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pages</h3>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localPages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {localPages.map((page) => (
              <SortablePageItem
                key={page.id}
                page={page}
                isActive={activePage === page.id}
                onClick={() => onPageChange(page.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {onAddPage && (
        <div className="p-2 border-t border-border">
          <button
            onClick={onAddPage}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Page
          </button>
        </div>
      )}
    </div>
  )
}













