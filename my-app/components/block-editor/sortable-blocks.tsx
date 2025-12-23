"use client"

import React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { EditableBlock } from "./editable-block"

export interface Block {
  id: string
  type: string
  content: React.ReactNode
}

interface SortableBlocksProps {
  blocks: Block[]
  isEditing: boolean
  selectedBlockId: string | null
  onBlockSelect: (id: string | null) => void
  onBlockReorder: (blocks: Block[]) => void
  onBlockContextMenu?: (blockId: string, e: React.MouseEvent) => void
  className?: string
}

function SortableBlockItem({
  block,
  isEditing,
  isSelected,
  onSelect,
  onContextMenu,
}: {
  block: Block
  isEditing: boolean
  isSelected: boolean
  onSelect: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <EditableBlock
        id={block.id}
        type={block.type}
        isEditing={isEditing}
        isSelected={isSelected}
        isDragging={isDragging}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
      >
        {block.content}
      </EditableBlock>
    </div>
  )
}

export function SortableBlocks({
  blocks,
  isEditing,
  selectedBlockId,
  onBlockSelect,
  onBlockReorder,
  onBlockContextMenu,
  className = "",
}: SortableBlocksProps) {
  const [localBlocks, setLocalBlocks] = React.useState(blocks)
  const [draggedBlockId, setDraggedBlockId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setLocalBlocks(blocks)
  }, [blocks])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedBlockId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedBlockId(null)
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localBlocks.findIndex((b) => b.id === active.id)
      const newIndex = localBlocks.findIndex((b) => b.id === over.id)

      const newBlocks = arrayMove(localBlocks, oldIndex, newIndex)
      setLocalBlocks(newBlocks)
      onBlockReorder(newBlocks)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={localBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {localBlocks.map((block) => (
            <SortableBlockItem
              key={block.id}
              block={block}
              isEditing={isEditing}
              isSelected={selectedBlockId === block.id}
              onSelect={() => onBlockSelect(block.id)}
              onContextMenu={onBlockContextMenu ? (e) => onBlockContextMenu(block.id, e) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}













