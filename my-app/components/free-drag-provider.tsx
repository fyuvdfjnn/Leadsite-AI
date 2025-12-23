"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { createDragController, type DragState, type SnapLine, type DragOptions } from "@/lib/free-drag-system"
import type { DetectedElement } from "@/lib/element-detector"
import { detectElement } from "@/lib/element-detector"

// 拖拽手柄类型
type DragHandlePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right' | 'center'

interface FreeDragContextValue {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  isDragging: boolean
  draggedElement: HTMLElement | null
  snapLines: SnapLine[]
  startFreeDrag: (element: HTMLElement, event: MouseEvent | React.MouseEvent) => void
  startResizeDrag: (element: HTMLElement, handle: DragHandlePosition, event: MouseEvent | React.MouseEvent) => void
}

const FreeDragContext = createContext<FreeDragContextValue | null>(null)

export function useFreeDrag() {
  const context = useContext(FreeDragContext)
  if (!context) {
    throw new Error("useFreeDrag must be used within FreeDragProvider")
  }
  return context
}

interface FreeDragProviderProps {
  children: React.ReactNode
  enabled?: boolean
  onDragStart?: (element: HTMLElement) => void
  onDragEnd?: (element: HTMLElement, newPosition: { x: number; y: number }) => void
  onResizeEnd?: (element: HTMLElement, newSize: { width: number; height: number }) => void
}

export function FreeDragProvider({
  children,
  enabled: initialEnabled = true,
  onDragStart,
  onDragEnd,
  onResizeEnd,
}: FreeDragProviderProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(null)
  const [snapLines, setSnapLines] = useState<SnapLine[]>([])
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null)
  
  const dragControllerRef = useRef<ReturnType<typeof createDragController> | null>(null)
  const resizeStateRef = useRef<{
    element: HTMLElement
    handle: DragHandlePosition
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    startLeft: number
    startTop: number
  } | null>(null)

  useEffect(() => {
    setEnabled(initialEnabled)
  }, [initialEnabled])

  // 创建拖拽控制器
  useEffect(() => {
    dragControllerRef.current = createDragController({
      snapThreshold: 8,
      showGuides: true,
      onDragStart: (element) => {
        setIsDragging(true)
        setDraggedElement(element)
        onDragStart?.(element)
      },
      onDrag: (element, state, lines) => {
        setSnapLines(lines)
        setPreviewRect(element.getBoundingClientRect())
      },
      onDragEnd: (element, state) => {
        setIsDragging(false)
        setDraggedElement(null)
        setSnapLines([])
        setPreviewRect(null)
        
        const rect = element.getBoundingClientRect()
        onDragEnd?.(element, { x: rect.left, y: rect.top })
      },
    })
  }, [onDragStart, onDragEnd])

  // 开始自由拖拽
  const startFreeDrag = useCallback((element: HTMLElement, event: MouseEvent | React.MouseEvent) => {
    if (!enabled || !dragControllerRef.current) return
    
    dragControllerRef.current.startDrag(element, event as MouseEvent)
  }, [enabled])

  // 开始缩放拖拽
  const startResizeDrag = useCallback((
    element: HTMLElement,
    handle: DragHandlePosition,
    event: MouseEvent | React.MouseEvent
  ) => {
    if (!enabled) return
    
    const rect = element.getBoundingClientRect()
    const e = event as MouseEvent
    
    resizeStateRef.current = {
      element,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      startLeft: rect.left,
      startTop: rect.top,
    }
    
    setIsResizing(true)
    setDraggedElement(element)
    
    e.preventDefault()
    e.stopPropagation()
  }, [enabled])

  // 全局鼠标移动/释放事件
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging && dragControllerRef.current) {
        dragControllerRef.current.updateDrag(event)
      }
      
      if (isResizing && resizeStateRef.current) {
        const { element, handle, startX, startY, startWidth, startHeight, startLeft, startTop } = resizeStateRef.current
        const deltaX = event.clientX - startX
        const deltaY = event.clientY - startY
        
        let newWidth = startWidth
        let newHeight = startHeight
        let newLeft = startLeft
        let newTop = startTop
        
        // 根据手柄位置计算新尺寸
        switch (handle) {
          case 'top-left':
            newWidth = startWidth - deltaX
            newHeight = startHeight - deltaY
            newLeft = startLeft + deltaX
            newTop = startTop + deltaY
            break
          case 'top-right':
            newWidth = startWidth + deltaX
            newHeight = startHeight - deltaY
            newTop = startTop + deltaY
            break
          case 'bottom-left':
            newWidth = startWidth - deltaX
            newHeight = startHeight + deltaY
            newLeft = startLeft + deltaX
            break
          case 'bottom-right':
            newWidth = startWidth + deltaX
            newHeight = startHeight + deltaY
            break
          case 'top':
            newHeight = startHeight - deltaY
            newTop = startTop + deltaY
            break
          case 'bottom':
            newHeight = startHeight + deltaY
            break
          case 'left':
            newWidth = startWidth - deltaX
            newLeft = startLeft + deltaX
            break
          case 'right':
            newWidth = startWidth + deltaX
            break
        }
        
        // 应用最小尺寸限制
        newWidth = Math.max(50, newWidth)
        newHeight = Math.max(30, newHeight)
        
        // 应用新尺寸
        element.style.width = `${newWidth}px`
        element.style.height = `${newHeight}px`
        
        if (handle.includes('left') || handle === 'left') {
          element.style.left = `${newLeft}px`
        }
        if (handle.includes('top') || handle === 'top') {
          element.style.top = `${newTop}px`
        }
        
        setPreviewRect(element.getBoundingClientRect())
      }
    }

    const handleMouseUp = () => {
      if (isDragging && dragControllerRef.current) {
        dragControllerRef.current.endDrag()
      }
      
      if (isResizing && resizeStateRef.current) {
        const { element } = resizeStateRef.current
        const rect = element.getBoundingClientRect()
        
        onResizeEnd?.(element, { width: rect.width, height: rect.height })
        
        setIsResizing(false)
        setDraggedElement(null)
        setPreviewRect(null)
        resizeStateRef.current = null
      }
    }

    if (enabled && (isDragging || isResizing)) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [enabled, isDragging, isResizing, onResizeEnd])

  return (
    <FreeDragContext.Provider
      value={{
        enabled,
        setEnabled,
        isDragging,
        draggedElement,
        snapLines,
        startFreeDrag,
        startResizeDrag,
      }}
    >
      {children}
      
      {/* 辅助线渲染 */}
      {enabled && snapLines.length > 0 && <SnapLinesOverlay lines={snapLines} />}
      
      {/* 拖拽预览框 */}
      {enabled && previewRect && (isDragging || isResizing) && (
        <DragPreviewOverlay rect={previewRect} />
      )}
    </FreeDragContext.Provider>
  )
}

// 辅助线覆盖层
function SnapLinesOverlay({ lines }: { lines: SnapLine[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[10000]">
      {lines.map((line, index) => (
        <div
          key={`${line.type}-${line.position}-${index}`}
          className={`absolute ${line.type === 'vertical' ? 'w-px h-full' : 'h-px w-full'}`}
          style={{
            ...(line.type === 'vertical'
              ? { left: line.position, top: 0 }
              : { top: line.position, left: 0 }),
            background: 'linear-gradient(to right, transparent, #3b82f6, transparent)',
            boxShadow: '0 0 4px #3b82f6',
          }}
        />
      ))}
    </div>,
    document.body
  )
}

// 拖拽预览覆盖层
function DragPreviewOverlay({ rect }: { rect: DOMRect }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      className="pointer-events-none fixed z-[9998] border-2 border-dashed border-blue-500 bg-blue-500/10 rounded"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
    />,
    document.body
  )
}

// 拖拽手柄组件
export interface DragHandlesProps {
  element: HTMLElement | null
  onStartDrag: (handle: DragHandlePosition, event: React.MouseEvent) => void
}

export function DragHandles({ element, onStartDrag }: DragHandlesProps) {
  const [mounted, setMounted] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!element) {
      setRect(null)
      return
    }

    const updateRect = () => {
      setRect(element.getBoundingClientRect())
    }

    updateRect()
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [element])

  if (!mounted || !rect) return null

  const handles: { position: DragHandlePosition; style: React.CSSProperties; cursor: string }[] = [
    { position: 'top-left', style: { top: -4, left: -4 }, cursor: 'nwse-resize' },
    { position: 'top-right', style: { top: -4, right: -4 }, cursor: 'nesw-resize' },
    { position: 'bottom-left', style: { bottom: -4, left: -4 }, cursor: 'nesw-resize' },
    { position: 'bottom-right', style: { bottom: -4, right: -4 }, cursor: 'nwse-resize' },
    { position: 'top', style: { top: -4, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
    { position: 'bottom', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
    { position: 'left', style: { left: -4, top: '50%', transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
    { position: 'right', style: { right: -4, top: '50%', transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
  ]

  return createPortal(
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
    >
      {handles.map(({ position, style, cursor }) => (
        <div
          key={position}
          className="pointer-events-auto absolute w-2 h-2 bg-blue-600 border border-white rounded-full shadow-md hover:scale-125 transition-transform"
          style={{ ...style, cursor }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onStartDrag(position, e)
          }}
        />
      ))}
      
      {/* 中心拖拽区域 */}
      <div
        className="pointer-events-auto absolute inset-4 cursor-move opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onStartDrag('center', e)
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-blue-600/80 text-white text-xs px-2 py-1 rounded shadow">
            拖动移动
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}









