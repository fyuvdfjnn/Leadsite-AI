"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { detectElement, type DetectedElement } from "@/lib/element-detector"
import { generateCssSelector, getElementDescription } from "@/lib/css-selector-generator"
import {
  getElementStateManager,
  convertToSmartPosition,
  applySmartPosition,
  generateSelector,
  restoreAllElements,
  type ElementState,
  generateElementId,
  getViewportType,
} from "@/lib/element-state-manager"
import {
  calculateSnapLines,
  snapToGridWithOffset,
  generateGridCSS,
  type SnapLine,
  type GridConfig,
  defaultGridConfig,
} from "@/lib/free-drag-system"
import {
  Move,
  Trash2,
  Copy,
  X,
  Undo,
  Redo,
  RotateCcw,
  Grid3X3,
  Magnet,
} from "lucide-react"

interface VisualSelectOverlayProps {
  enabled: boolean
  containerRef?: React.RefObject<HTMLElement>
  onElementSelect?: (element: DetectedElement | null, selector: string | null) => void
  onElementUpdate?: (element: HTMLElement, changes: ElementChanges) => void
  onElementDelete?: (element: HTMLElement) => void
  onElementDuplicate?: (element: HTMLElement) => void
  onUndo?: () => void
  onRedo?: () => void
}

export interface ElementChanges {
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  content?: string
  styles?: Record<string, string>
}

type DragHandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move'

export function VisualSelectOverlay({
  enabled,
  containerRef,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onUndo,
  onRedo,
}: VisualSelectOverlayProps) {
  const [mounted, setMounted] = useState(false)
  const [hoveredElement, setHoveredElement] = useState<DetectedElement | null>(null)
  const [selectedElement, setSelectedElement] = useState<DetectedElement | null>(null)
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null)
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  
  // 辅助线状态
  const [snapLines, setSnapLines] = useState<SnapLine[]>([])
  
  // 网格配置
  const [gridEnabled, setGridEnabled] = useState(false)
  const [gridConfig] = useState<GridConfig>(defaultGridConfig)
  
  // 吸附配置
  const [snapEnabled, setSnapEnabled] = useState(true)
  
  // 拖拽状态 - 使用 ref 确保事件处理器能获取最新值
  const isDraggingRef = useRef(false)
  const isResizingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  
  const rafRef = useRef<number>()
  const selectedElementRef = useRef<DetectedElement | null>(null)
  const dragStateRef = useRef<{
    type: 'move' | 'resize'
    handle?: DragHandlePosition
    startX: number
    startY: number
    startRect: DOMRect
    initialRect: DOMRect
    originalStyles: Record<string, string>
  } | null>(null)

  // 状态管理器
  const stateManager = useRef(getElementStateManager())

  // 同步 selectedElement 到 ref
  useEffect(() => {
    selectedElementRef.current = selectedElement
  }, [selectedElement])

  useEffect(() => {
    setMounted(true)
    setCanUndo(stateManager.current.canUndo())
    setCanRedo(stateManager.current.canRedo())
    
    return () => {
      setMounted(false)
    }
  }, [])

  // 监听状态变化
  useEffect(() => {
    const unsubscribe = stateManager.current.subscribe(() => {
      setCanUndo(stateManager.current.canUndo())
      setCanRedo(stateManager.current.canRedo())
    })
    return unsubscribe
  }, [])

  // 清除选中
  const clearSelection = useCallback(() => {
    setSelectedElement(null)
    setSelectedRect(null)
    setSnapLines([])
    selectedElementRef.current = null
    onElementSelect?.(null, null)
  }, [onElementSelect])

  // 获取吸附目标元素
  const getSnapTargets = useCallback((excludeElement: HTMLElement): HTMLElement[] => {
    const container = containerRef?.current || document.body
    const targets = Array.from(container.querySelectorAll(
      '[data-component], [data-snap-target], section, header, footer, nav, article, aside, main, div[class*="container"], div[class*="section"]'
    )) as HTMLElement[]
    
    return targets.filter(el => 
      el !== excludeElement && 
      el.offsetParent !== null &&
      el.getBoundingClientRect().width > 10 &&
      el.getBoundingClientRect().height > 10
    )
  }, [containerRef])

  // 处理鼠标悬停
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled || isDraggingRef.current || isResizingRef.current) return

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      const target = event.target as HTMLElement

      if (target.closest('[data-visual-overlay]')) return

      if (containerRef?.current && !containerRef.current.contains(target)) {
        setHoveredElement(null)
        setHoveredRect(null)
        return
      }

      const detected = detectElement(target)
      if (detected && detected.type !== 'unknown') {
        setHoveredElement(detected)
        setHoveredRect(detected.element.getBoundingClientRect())
      } else {
        setHoveredElement(null)
        setHoveredRect(null)
      }
    })
  }, [enabled, containerRef])

  // 处理点击选中
  const handleClick = useCallback((event: MouseEvent) => {
    if (!enabled || isDraggingRef.current || isResizingRef.current) return

    const target = event.target as HTMLElement

    if (target.closest('[data-visual-overlay]') || target.closest('[data-drag-handle]')) {
      return
    }

    if (containerRef?.current && !containerRef.current.contains(target)) {
      if (selectedElementRef.current) {
        clearSelection()
      }
      return
    }

    const detected = detectElement(target)
    if (detected && detected.type !== 'unknown') {
      setSelectedElement(detected)
      setSelectedRect(detected.element.getBoundingClientRect())
      const selector = generateCssSelector(detected.element)
      onElementSelect?.(detected, selector)
    } else {
      clearSelection()
    }
  }, [enabled, containerRef, onElementSelect, clearSelection])

  // 开始拖拽 - 高性能版本
  const handleDragStart = useCallback((handle: DragHandlePosition, event: React.MouseEvent) => {
    const currentElement = selectedElementRef.current
    if (!currentElement) {
      console.log('[Drag] No selected element')
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const element = currentElement.element
    const rect = element.getBoundingClientRect()
    
    console.log('[Drag] Starting drag:', { handle, rect })

    // 保存原始样式
    const originalStyles: Record<string, string> = {
      position: element.style.position || '',
      left: element.style.left || '',
      top: element.style.top || '',
      width: element.style.width || '',
      height: element.style.height || '',
      zIndex: element.style.zIndex || '',
      opacity: element.style.opacity || '',
      boxShadow: element.style.boxShadow || '',
      cursor: element.style.cursor || '',
      userSelect: element.style.userSelect || '',
      margin: element.style.margin || '',
      transform: element.style.transform || '',
      willChange: element.style.willChange || '',
      transition: element.style.transition || '',
    }

    dragStateRef.current = {
      type: handle === 'move' ? 'move' : 'resize',
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startRect: rect,
      initialRect: rect,
      originalStyles,
    }

    if (handle === 'move') {
      isDraggingRef.current = true
      setIsDragging(true)
      
      // 高性能拖拽样式
      element.style.position = 'fixed'
      element.style.left = `${rect.left}px`
      element.style.top = `${rect.top}px`
      element.style.width = `${rect.width}px`
      element.style.zIndex = '10000'
      element.style.willChange = 'transform'
      element.style.cursor = 'grabbing'
      element.style.userSelect = 'none'
      element.style.margin = '0'
      
      // 拖拽时的视觉效果（平滑过渡）
      element.style.transition = 'box-shadow 0.2s ease-out, opacity 0.2s ease-out'
      element.style.boxShadow = '0 20px 60px rgba(0,0,0,0.25), 0 0 0 2px rgba(59, 130, 246, 0.5)'
      element.style.opacity = '0.9'
      element.style.transform = 'scale(1.02)'
    } else {
      isResizingRef.current = true
      setIsResizing(true)
      
      if (!element.style.position || element.style.position === 'static') {
        element.style.position = 'relative'
      }
    }

    // 添加全局事件监听
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current || !selectedElementRef.current) return
      
      const { type, handle: h, startX, startY, initialRect } = dragStateRef.current
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      const el = selectedElementRef.current.element

      if (type === 'move') {
        let newLeft = initialRect.left + deltaX
        let newTop = initialRect.top + deltaY
        
        // 辅助线吸附
        let currentSnapLines: SnapLine[] = []
        if (snapEnabled) {
          const snapTargets = getSnapTargets(el)
          
          // 使用 transform 临时定位以计算吸附（不破坏文档流）
          const currentDeltaX = newLeft - initialRect.left
          const currentDeltaY = newTop - initialRect.top
          el.style.transform = `translate(${currentDeltaX}px, ${currentDeltaY}px)`
          
          const snapResult = calculateSnapLines(el, snapTargets, 8)
          currentSnapLines = snapResult.snapLines
          
          if (snapResult.snapX !== null) {
            newLeft = snapResult.snapX
          }
          if (snapResult.snapY !== null) {
            newTop = snapResult.snapY
          }
        }
        
        // 网格吸附（辅助线优先）
        if (gridEnabled && gridConfig.size > 0) {
          const hasVerticalSnap = currentSnapLines.some(l => l.type === 'vertical')
          const hasHorizontalSnap = currentSnapLines.some(l => l.type === 'horizontal')
          
          const gridSnap = snapToGridWithOffset(newLeft, newTop, gridConfig.size, gridConfig.size / 3)
          if (!hasVerticalSnap && gridSnap.snappedX) {
            newLeft = gridSnap.x
          }
          if (!hasHorizontalSnap && gridSnap.snappedY) {
            newTop = gridSnap.y
          }
        }
        
        // 使用 transform 进行最终定位
        const finalDeltaX = newLeft - initialRect.left
        const finalDeltaY = newTop - initialRect.top
        
        el.style.transform = `translate(${finalDeltaX}px, ${finalDeltaY}px) scale(1.02)`
        
        // 更新辅助线和选中框
        setSnapLines(currentSnapLines)
        setSelectedRect(new DOMRect(newLeft, newTop, initialRect.width, initialRect.height))
        
      } else if (type === 'resize' && h) {
        let newWidth = initialRect.width
        let newHeight = initialRect.height
        let newLeft = parseFloat(el.style.left) || initialRect.left
        let newTop = parseFloat(el.style.top) || initialRect.top

        if (h.includes('e')) newWidth = Math.max(50, initialRect.width + deltaX)
        if (h.includes('w')) {
          newWidth = Math.max(50, initialRect.width - deltaX)
          newLeft = initialRect.left + deltaX
        }
        if (h.includes('s')) newHeight = Math.max(30, initialRect.height + deltaY)
        if (h.includes('n')) {
          newHeight = Math.max(30, initialRect.height - deltaY)
          newTop = initialRect.top + deltaY
        }

        el.style.width = `${newWidth}px`
        el.style.height = `${newHeight}px`
        if (h.includes('w')) el.style.left = `${newLeft}px`
        if (h.includes('n')) el.style.top = `${newTop}px`
        
        setSelectedRect(new DOMRect(newLeft, newTop, newWidth, newHeight))
      }
    }

    const handleGlobalMouseUp = () => {
      console.log('[Drag] Ending drag')
      
      // 清除辅助线
      setSnapLines([])
      
      if (selectedElementRef.current && dragStateRef.current) {
        const el = selectedElementRef.current.element
        const { type, initialRect, startX, startY } = dragStateRef.current
        const deltaX = dragStateRef.current.startX !== startX ? 
          (selectedRect?.left || 0) - initialRect.left : 0
        const deltaY = dragStateRef.current.startY !== startY ?
          (selectedRect?.top || 0) - initialRect.top : 0

        if (type === 'move') {
          // 从 transform 中获取实际偏移
          const transformMatch = el.style.transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/)
          let translateX = 0
          let translateY = 0
          
          if (transformMatch) {
            translateX = parseFloat(transformMatch[1])
            translateY = parseFloat(transformMatch[2])
          }
          
          // 恢复原始样式（移除 fixed 定位）
          const { originalStyles } = dragStateRef.current
          el.style.position = originalStyles?.position || ''
          el.style.left = originalStyles?.left || ''
          el.style.top = originalStyles?.top || ''
          el.style.width = originalStyles?.width || ''
          el.style.zIndex = originalStyles?.zIndex || ''
          el.style.margin = originalStyles?.margin || ''
          
          // 平滑过渡
          el.style.transition = 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease-out, opacity 0.2s ease-out'
          el.style.boxShadow = ''
          el.style.opacity = '1'
          
          // 使用 transform 保持位置
          const finalTransform = translateX !== 0 || translateY !== 0 
            ? `translate(${translateX}px, ${translateY}px)` 
            : ''
          
          el.style.transform = finalTransform
          
          // 清理临时样式
          setTimeout(() => {
            el.style.transition = ''
            el.style.willChange = ''
            el.style.cursor = ''
            el.style.userSelect = ''
            
            // 更新选中框
            setSelectedRect(el.getBoundingClientRect())
            
            // 通知更新（只记录 transform，不改变布局）
            if (translateX !== 0 || translateY !== 0) {
              el.dataset.dragged = 'true'
              onElementUpdate?.(el, { 
                position: { x: translateX, y: translateY },
                styles: { transform: finalTransform }
              })
            }
          }, 150)
          
        } else if (type === 'resize') {
          el.style.opacity = '1'
          el.style.boxShadow = ''
          
          const rect = el.getBoundingClientRect()
          const elementId = el.dataset.elementId || generateElementId()
          const existingState = stateManager.current.getState(elementId)
          
          if (existingState) {
            existingState.styles.width = `${rect.width}px`
            existingState.styles.height = `${rect.height}px`
            existingState.size = {
              width: rect.width,
              height: rect.height,
              unit: 'px'
            }
            stateManager.current.saveState(existingState)
          }
          
          onElementUpdate?.(el, { 
            size: { width: rect.width, height: rect.height },
            styles: {
              width: `${rect.width}px`,
              height: `${rect.height}px`
            }
          })
          
          setSelectedRect(rect)
        }
      }

      isDraggingRef.current = false
      isResizingRef.current = false
      setIsDragging(false)
      setIsResizing(false)
      dragStateRef.current = null

      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
  }, [onElementUpdate, snapEnabled, gridEnabled, gridConfig, getSnapTargets, selectedRect])

  // 撤销
  const handleUndo = useCallback(() => {
    const previousState = stateManager.current.undo()
    if (previousState) {
      restoreAllElements(stateManager.current)
      onUndo?.()
    }
  }, [onUndo])

  // 重做
  const handleRedo = useCallback(() => {
    const newState = stateManager.current.redo()
    if (newState) {
      restoreAllElements(stateManager.current)
      onRedo?.()
    }
  }, [onRedo])

  // 重置元素（只清除 transform，恢复原始位置）
  const handleReset = useCallback(() => {
    if (!selectedElementRef.current) return
    
    const el = selectedElementRef.current.element
    
    // 只清除 transform，保持元素在文档流中
    el.style.transform = ''
    delete el.dataset.dragged
    
    setSelectedRect(el.getBoundingClientRect())
  }, [])

  // 全局事件监听
  useEffect(() => {
    if (!enabled) return

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick, true)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [enabled, handleMouseMove, handleClick])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelection()
      }
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        handleUndo()
      }
      if ((event.ctrlKey && event.shiftKey && event.key === 'z') || 
          (event.ctrlKey && event.key === 'y')) {
        event.preventDefault()
        handleRedo()
      }
      // G 键切换网格
      if (event.key === 'g' && !event.ctrlKey && !event.metaKey) {
        setGridEnabled(prev => !prev)
      }
      // S 键切换吸附
      if (event.key === 's' && !event.ctrlKey && !event.metaKey && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault()
        setSnapEnabled(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [clearSelection, handleUndo, handleRedo])

  // 滚动时更新位置
  useEffect(() => {
    if (!selectedElement) return

    const updateRect = () => {
      if (selectedElementRef.current) {
        setSelectedRect(selectedElementRef.current.element.getBoundingClientRect())
      }
    }

    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [selectedElement])

  if (!mounted || !enabled) return null

  return createPortal(
    <div data-visual-overlay className="pointer-events-none fixed inset-0 z-[9990]">
      {/* 网格背景 */}
      {gridEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${gridConfig.size}px ${gridConfig.size}px`,
          }}
        />
      )}
      
      {/* 工具栏 */}
      <div className="pointer-events-auto fixed top-20 right-4 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-2 py-1 z-[9999]">
        {/* 网格开关 */}
        <button
          className={`p-1.5 rounded transition-colors ${gridEnabled ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          title={`网格 (G) ${gridEnabled ? '开启' : '关闭'}`}
          onClick={() => setGridEnabled(prev => !prev)}
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        
        {/* 吸附开关 */}
        <button
          className={`p-1.5 rounded transition-colors ${snapEnabled ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          title={`吸附 (S) ${snapEnabled ? '开启' : '关闭'}`}
          onClick={() => setSnapEnabled(prev => !prev)}
        >
          <Magnet className="w-4 h-4" />
        </button>
        
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        
        {/* 撤销/重做 */}
        <button
          className={`p-1.5 rounded transition-colors ${canUndo ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'}`}
          title="撤销 (Ctrl+Z)"
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <Undo className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          className={`p-1.5 rounded transition-colors ${canRedo ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'}`}
          title="重做 (Ctrl+Shift+Z)"
          onClick={handleRedo}
          disabled={!canRedo}
        >
          <Redo className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* 辅助线渲染 */}
      {snapLines.map((line, index) => (
        <div
          key={`${line.type}-${line.position}-${index}`}
          className="absolute pointer-events-none"
          style={line.type === 'vertical' ? {
            left: line.position,
            top: line.startY || 0,
            width: '1px',
            height: line.length || '100%',
            background: 'linear-gradient(to bottom, transparent, #3b82f6, #3b82f6, transparent)',
            boxShadow: '0 0 4px #3b82f6',
          } : {
            top: line.position,
            left: line.startX || 0,
            height: '1px',
            width: line.length || '100%',
            background: 'linear-gradient(to right, transparent, #3b82f6, #3b82f6, transparent)',
            boxShadow: '0 0 4px #3b82f6',
          }}
        />
      ))}

      {/* 悬停高亮 */}
      {hoveredRect && !selectedRect && !isDragging && (
        <HoverHighlight rect={hoveredRect} label={hoveredElement ? getElementDescription(hoveredElement.element) : undefined} />
      )}

      {/* 选中高亮 + 拖拽手柄 */}
      {selectedRect && (
        <SelectionHighlight
          rect={selectedRect}
          label={selectedElement ? getElementDescription(selectedElement.element) : undefined}
          isDragging={isDragging}
          isResizing={isResizing}
          isDragged={selectedElement?.element.dataset.dragged === 'true'}
          onStartDrag={handleDragStart}
          onDelete={() => {
            if (selectedElement) {
              onElementDelete?.(selectedElement.element)
              clearSelection()
            }
          }}
          onDuplicate={() => {
            if (selectedElement) {
              onElementDuplicate?.(selectedElement.element)
            }
          }}
          onReset={handleReset}
          onClose={clearSelection}
        />
      )}
    </div>,
    document.body
  )
}

// 悬停高亮组件
function HoverHighlight({ rect, label }: { rect: DOMRect; label?: string }) {
  return (
    <div
      className="absolute transition-all duration-75 pointer-events-none"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
    >
      <div className="absolute inset-0 border-2 border-blue-500/70 rounded-sm bg-blue-500/5" />
      {label && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  )
}

// 选中高亮组件
function SelectionHighlight({
  rect,
  label,
  isDragging,
  isResizing,
  isDragged,
  onStartDrag,
  onDelete,
  onDuplicate,
  onReset,
  onClose,
}: {
  rect: DOMRect
  label?: string
  isDragging: boolean
  isResizing: boolean
  isDragged?: boolean
  onStartDrag: (handle: DragHandlePosition, event: React.MouseEvent) => void
  onDelete: () => void
  onDuplicate: () => void
  onReset: () => void
  onClose: () => void
}) {
  const handles: { position: DragHandlePosition; className: string; cursor: string }[] = [
    { position: 'nw', className: '-top-1.5 -left-1.5', cursor: 'nwse-resize' },
    { position: 'n', className: '-top-1.5 left-1/2 -translate-x-1/2', cursor: 'ns-resize' },
    { position: 'ne', className: '-top-1.5 -right-1.5', cursor: 'nesw-resize' },
    { position: 'e', className: 'top-1/2 -right-1.5 -translate-y-1/2', cursor: 'ew-resize' },
    { position: 'se', className: '-bottom-1.5 -right-1.5', cursor: 'nwse-resize' },
    { position: 's', className: '-bottom-1.5 left-1/2 -translate-x-1/2', cursor: 'ns-resize' },
    { position: 'sw', className: '-bottom-1.5 -left-1.5', cursor: 'nesw-resize' },
    { position: 'w', className: 'top-1/2 -left-1.5 -translate-y-1/2', cursor: 'ew-resize' },
  ]

  return (
    <div
      className="absolute"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
    >
      {/* 选中边框 */}
      <div
        className={`pointer-events-none absolute inset-0 border-2 rounded-sm transition-all ${
          isDragging || isResizing ? 'border-blue-600 border-dashed' : isDragged ? 'border-green-500' : 'border-blue-600'
        }`}
        style={{
          boxShadow: isDragging || isResizing
            ? '0 0 0 2px rgba(37, 99, 235, 0.2)'
            : '0 0 0 1px rgba(37, 99, 235, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* 标签 */}
      {label && !isDragging && !isResizing && (
        <div className={`pointer-events-none absolute -top-7 left-0 px-2 py-1 text-xs font-semibold text-white rounded whitespace-nowrap shadow-lg ${isDragged ? 'bg-green-500' : 'bg-blue-600'}`}>
          {label} {isDragged && '(已移动)'}
        </div>
      )}

      {/* 拖拽手柄 */}
      {!isDragging && !isResizing && handles.map(({ position, className, cursor }) => (
        <div
          key={position}
          data-drag-handle
          className={`pointer-events-auto absolute w-3 h-3 bg-blue-600 border-2 border-white rounded-full shadow-md hover:scale-125 active:scale-110 transition-transform z-20 ${className}`}
          style={{ cursor }}
          onMouseDown={(e) => onStartDrag(position, e)}
        />
      ))}

      {/* 中心拖拽区域 */}
      {!isDragging && !isResizing && (
        <div
          data-drag-handle
          className="pointer-events-auto absolute inset-2 cursor-move z-10 group"
          onMouseDown={(e) => onStartDrag('move', e)}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-blue-600/90 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center gap-1">
              <Move className="w-3 h-3" />
              拖动移动
            </div>
          </div>
        </div>
      )}

      {/* 工具栏 */}
      {!isDragging && !isResizing && (
        <div className="pointer-events-auto absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 px-1.5 py-1 z-30">
          <button
            data-drag-handle
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-move"
            title="拖动移动"
            onMouseDown={(e) => onStartDrag('move', e)}
          >
            <Move className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="复制"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
          >
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          {isDragged && (
            <button
              className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded transition-colors"
              title="重置到原位"
              onClick={(e) => {
                e.stopPropagation()
                onReset()
              }}
            >
              <RotateCcw className="w-4 h-4 text-orange-500" />
            </button>
          )}
          <button
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
            title="删除"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
          <button
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="关闭"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}
    </div>
  )
}
