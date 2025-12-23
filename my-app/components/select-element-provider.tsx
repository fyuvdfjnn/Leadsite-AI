"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { ElementHighlightOverlay, type HighlightRect } from "./element-highlight-overlay"
import { ModuleEditToolbar } from "./module-edit-toolbar"
import { detectElement, type DetectedElement, type ElementType } from "@/lib/element-detector"
import { generateCssSelector, getElementDescription } from "@/lib/css-selector-generator"

// 预设模块类型
const PRESET_COMPONENTS = ['header', 'section', 'footer', 'nav', 'hero', 'features', 'cta'] as const
type PresetComponent = typeof PRESET_COMPONENTS[number]

interface SelectElementContextValue {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  selectedElement: DetectedElement | null
  hoveredElement: DetectedElement | null
  selectElement: (element: HTMLElement | null) => void
  clearSelection: () => void
  getElementSelector: (element: HTMLElement) => string
}

const SelectElementContext = createContext<SelectElementContextValue | null>(null)

export function useSelectElement() {
  const context = useContext(SelectElementContext)
  if (!context) {
    throw new Error("useSelectElement must be used within SelectElementProvider")
  }
  return context
}

interface SelectElementProviderProps {
  children: React.ReactNode
  enabled?: boolean
  containerRef?: React.RefObject<HTMLElement>
  onElementSelect?: (element: DetectedElement | null, selector: string | null) => void
  onElementHover?: (element: DetectedElement | null) => void
  onModuleDelete?: (element: DetectedElement) => void
  onModuleDuplicate?: (element: DetectedElement) => void
  onModuleMove?: (element: DetectedElement, direction: 'up' | 'down') => void
  onModuleAdd?: (element: DetectedElement, position: 'before' | 'after') => void
  onStyleChange?: (element: DetectedElement, property: string, value: string) => void
}

export function SelectElementProvider({
  children,
  enabled: initialEnabled = true,
  containerRef,
  onElementSelect,
  onElementHover,
  onModuleDelete,
  onModuleDuplicate,
  onModuleMove,
  onModuleAdd,
  onStyleChange,
}: SelectElementProviderProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [selectedElement, setSelectedElement] = useState<DetectedElement | null>(null)
  const [hoveredElement, setHoveredElement] = useState<DetectedElement | null>(null)
  const [hoveredRect, setHoveredRect] = useState<HighlightRect | null>(null)
  const [selectedRect, setSelectedRect] = useState<HighlightRect | null>(null)
  
  const rafRef = useRef<number | undefined>(undefined)

  // 同步外部 enabled prop 和内部状态
  useEffect(() => {
    setEnabled(initialEnabled)
    // 禁用时清除选择和悬停状态
    if (!initialEnabled) {
      setSelectedElement(null)
      setHoveredElement(null)
      setSelectedRect(null)
      setHoveredRect(null)
    }
  }, [initialEnabled])
  const lastMousePos = useRef({ x: 0, y: 0 })

  // 获取元素边界矩形
  const getElementRect = useCallback((element: HTMLElement): HighlightRect => {
    const rect = element.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    }
  }, [])

  // 识别元素类型并返回最佳匹配的元素
  const findBestElement = useCallback((element: HTMLElement): HTMLElement => {
    const tagName = element.tagName.toLowerCase()
    
    // 这些元素直接返回，不需要向上查找
    const directElements = ['button', 'a', 'input', 'textarea', 'select', 'img', 'video', 'audio', 'iframe']
    if (directElements.includes(tagName)) {
      return element
    }
    
    // 检查 data-component 属性
    if (element.getAttribute('data-component')) {
      return element
    }
    
    // 标题和段落直接返回
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label'].includes(tagName)) {
      return element
    }
    
    // div 检查是否有有意义的内容或属性
    if (tagName === 'div') {
      // 如果有 class 或 id，可能是有意义的容器
      if (element.className || element.id || element.getAttribute('data-component')) {
        return element
      }
      // 如果是叶子节点（只包含文本），返回
      if (element.children.length === 0 && element.textContent?.trim()) {
        return element
      }
    }
    
    // 列表元素
    if (['li', 'ul', 'ol'].includes(tagName)) {
      return element
    }
    
    // 表格元素
    if (['table', 'tr', 'td', 'th'].includes(tagName)) {
      return element
    }
    
    // 大型容器元素
    if (['header', 'nav', 'section', 'footer', 'article', 'main', 'aside'].includes(tagName)) {
      return element
    }
    
    return element
  }, [])

  // 处理鼠标移动 - 使用 document.elementFromPoint
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return

    // 使用 requestAnimationFrame 优化性能
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      const { clientX, clientY } = event

      // 检查是否在工具栏上
      const target = event.target as HTMLElement
      if (target.closest('[data-module-toolbar]')) {
        return
      }

      // 使用 elementFromPoint 获取当前位置的元素
      const elementAtPoint = document.elementFromPoint(clientX, clientY) as HTMLElement | null
      if (!elementAtPoint) {
        setHoveredElement(null)
        setHoveredRect(null)
        return
      }

      // 检查是否在容器内（如果指定了容器）
      if (containerRef?.current && !containerRef.current.contains(elementAtPoint)) {
        setHoveredElement(null)
        setHoveredRect(null)
        return
      }

      // 找到最佳匹配的元素
      const bestElement = findBestElement(elementAtPoint)
      
      // 检测元素
      const detected = detectElement(bestElement)
      
      if (detected) {
        // 只有当元素变化时才更新
        if (detected.element !== hoveredElement?.element) {
          setHoveredElement(detected)
          setHoveredRect(getElementRect(detected.element))
          onElementHover?.(detected)
        }
      } else {
        setHoveredElement(null)
        setHoveredRect(null)
        onElementHover?.(null)
      }
    })
  }, [enabled, containerRef, findBestElement, getElementRect, hoveredElement, onElementHover])

  // 处理点击选中
  const handleClick = useCallback((event: MouseEvent) => {
    if (!enabled) return

    const target = event.target as HTMLElement

    // 检查是否点击在工具栏上
    if (target.closest('[data-module-toolbar]')) {
      return
    }

    // 检查是否在容器内
    if (containerRef?.current && !containerRef.current.contains(target)) {
      return
    }

    // 找到最佳匹配的元素
    const bestElement = findBestElement(target)

    const detected = detectElement(bestElement)
    
    if (detected && detected.type !== 'unknown') {
      setSelectedElement(detected)
      setSelectedRect(getElementRect(detected.element))
      
      const selector = generateCssSelector(detected.element)
      onElementSelect?.(detected, selector)
      
      // 阻止事件冒泡
      event.stopPropagation()
      event.preventDefault()
    }
  }, [enabled, containerRef, findBestElement, getElementRect, onElementSelect])

  // 清除选择
  const clearSelection = useCallback(() => {
    setSelectedElement(null)
    setSelectedRect(null)
    onElementSelect?.(null, null)
  }, [onElementSelect])

  // 选择指定元素
  const selectElement = useCallback((element: HTMLElement | null) => {
    if (!element) {
      clearSelection()
      return
    }

    const detected = detectElement(element)
    if (detected) {
      setSelectedElement(detected)
      setSelectedRect(getElementRect(element))
      const selector = generateCssSelector(element)
      onElementSelect?.(detected, selector)
    }
  }, [getElementRect, clearSelection, onElementSelect])

  // 获取元素选择器
  const getElementSelector = useCallback((element: HTMLElement): string => {
    return generateCssSelector(element)
  }, [])

  // 更新选中元素的位置（滚动时）
  useEffect(() => {
    if (!selectedElement) return

    const updateRect = () => {
      setSelectedRect(getElementRect(selectedElement.element))
    }

    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [selectedElement, getElementRect])

  // 绑定事件监听
  useEffect(() => {
    console.log('[SelectElement] enabled:', enabled)
    
    if (!enabled) {
      setHoveredElement(null)
      setHoveredRect(null)
      return
    }

    console.log('[SelectElement] Adding event listeners')
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('click', handleClick, true)

    return () => {
      console.log('[SelectElement] Removing event listeners')
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick, true)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [enabled, handleMouseMove, handleClick])

  // 工具栏回调
  const handleDelete = useCallback(() => {
    if (selectedElement) {
      onModuleDelete?.(selectedElement)
      clearSelection()
    }
  }, [selectedElement, onModuleDelete, clearSelection])

  const handleDuplicate = useCallback(() => {
    if (selectedElement) {
      onModuleDuplicate?.(selectedElement)
    }
  }, [selectedElement, onModuleDuplicate])

  const handleMoveUp = useCallback(() => {
    if (selectedElement) {
      onModuleMove?.(selectedElement, 'up')
    }
  }, [selectedElement, onModuleMove])

  const handleMoveDown = useCallback(() => {
    if (selectedElement) {
      onModuleMove?.(selectedElement, 'down')
    }
  }, [selectedElement, onModuleMove])

  const handleAddBefore = useCallback(() => {
    if (selectedElement) {
      onModuleAdd?.(selectedElement, 'before')
    }
  }, [selectedElement, onModuleAdd])

  const handleAddAfter = useCallback(() => {
    if (selectedElement) {
      onModuleAdd?.(selectedElement, 'after')
    }
  }, [selectedElement, onModuleAdd])

  const handleStyleChange = useCallback((property: string, value: string) => {
    if (selectedElement) {
      selectedElement.element.style.setProperty(property, value)
      onStyleChange?.(selectedElement, property, value)
    }
  }, [selectedElement, onStyleChange])

  const handleEdit = useCallback(() => {
    if (selectedElement) {
      // 触发内联编辑
      selectedElement.element.setAttribute('contenteditable', 'true')
      selectedElement.element.focus()
    }
  }, [selectedElement])

  return (
    <SelectElementContext.Provider
      value={{
        enabled,
        setEnabled,
        selectedElement,
        hoveredElement,
        selectElement,
        clearSelection,
        getElementSelector,
      }}
    >
      {children}
      
      {enabled && (
        <>
          <ElementHighlightOverlay
            hoveredRect={hoveredRect}
            selectedRect={selectedRect}
            hoveredLabel={hoveredElement ? getElementDescription(hoveredElement.element) : undefined}
            selectedLabel={selectedElement ? getElementDescription(selectedElement.element) : undefined}
          />
          
          <ModuleEditToolbar
            element={selectedElement}
            onClose={clearSelection}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onAddBefore={handleAddBefore}
            onAddAfter={handleAddAfter}
            onEdit={handleEdit}
            onStyleChange={handleStyleChange}
          />
        </>
      )}
    </SelectElementContext.Provider>
  )
}

