"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { ElementUpdates } from "./element-floating-toolbar"
import { detectElementFromEvent, detectElementFromSelection, type DetectedElement } from "@/lib/element-detector"
import { ElementFloatingToolbar } from "./element-floating-toolbar"

interface ElementSelectorContextValue {
  selectedElement: DetectedElement | null
  selectElement: (element: DetectedElement | null) => void
  handleClick: (event: MouseEvent | React.MouseEvent) => void
  handleSelection: () => void
}

const ElementSelectorContext = createContext<ElementSelectorContextValue | null>(null)

export function useElementSelector() {
  const context = useContext(ElementSelectorContext)
  if (!context) {
    throw new Error("useElementSelector must be used within ElementSelectorProvider")
  }
  return context
}

interface ElementSelectorProviderProps {
  children: React.ReactNode
  enabled?: boolean
  onUpdate?: (element: DetectedElement, updates: ElementUpdates) => void
  excludeSelectors?: string[] // 排除的选择器，如 ['.no-select', '[data-no-edit]']
}

export function ElementSelectorProvider({
  children,
  enabled = true,
  onUpdate,
  excludeSelectors = [],
}: ElementSelectorProviderProps) {
  const [selectedElement, setSelectedElement] = useState<DetectedElement | null>(null)

  const selectElement = useCallback((element: DetectedElement | null) => {
    setSelectedElement(element)
  }, [])

  const isExcluded = useCallback((element: HTMLElement): boolean => {
    if (excludeSelectors.length === 0) return false
    
    return excludeSelectors.some(selector => {
      try {
        return element.matches(selector) || element.closest(selector) !== null
      } catch {
        return false
      }
    })
  }, [excludeSelectors])

  const handleClick = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      if (!enabled) return

      // 检查是否点击在工具栏上
      const target = event.target as HTMLElement
      if (target.closest('[data-floating-toolbar]')) {
        return
      }

      // 检查是否被排除
      if (isExcluded(target)) {
        if (selectedElement && !selectedElement.element.contains(target)) {
          setSelectedElement(null)
        }
        return
      }

      const detected = detectElementFromEvent(event)
      
      // 调试日志（开发环境）
      if (process.env.NODE_ENV === 'development' && detected) {
        console.log('Detected element:', {
          type: detected.type,
          tagName: detected.tagName,
          dataComponent: detected.attributes['data-component'],
          className: detected.element.className,
        })
      }
      
      if (detected && detected.type !== 'unknown') {
        setSelectedElement(detected)
        event.stopPropagation() // 阻止事件冒泡
      } else {
        // 如果点击的不是可编辑元素，检查是否需要关闭
        if (selectedElement && !selectedElement.element.contains(target)) {
          setSelectedElement(null)
        }
      }
    },
    [enabled, selectedElement, isExcluded]
  )

  const handleSelection = useCallback(() => {
    if (!enabled) return

    const detected = detectElementFromSelection()
    if (detected && detected.type !== 'unknown') {
      setSelectedElement(detected)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const handleDocumentClick = (event: MouseEvent) => {
      // 使用 capture 阶段确保能捕获到正确的元素
      handleClick(event)
    }

    const handleDocumentSelection = () => {
      // 延迟执行，确保选择完成
      setTimeout(() => {
        handleSelection()
      }, 10)
    }

    // 使用 capture 阶段（第三个参数为 true）确保在事件冒泡前捕获
    document.addEventListener("click", handleDocumentClick, true)
    document.addEventListener("mouseup", handleDocumentSelection)

    return () => {
      document.removeEventListener("click", handleDocumentClick, true)
      document.removeEventListener("mouseup", handleDocumentSelection)
    }
  }, [enabled, handleClick, handleSelection])

  const handleUpdate = useCallback(
    (element: DetectedElement, updates: ElementUpdates) => {
      onUpdate?.(element, updates)
    },
    [onUpdate]
  )

  return (
    <ElementSelectorContext.Provider
      value={{
        selectedElement,
        selectElement,
        handleClick,
        handleSelection,
      }}
    >
      {children}
      {enabled && (
        <div data-floating-toolbar>
          <ElementFloatingToolbar
            element={selectedElement}
            onClose={() => setSelectedElement(null)}
            onUpdate={handleUpdate}
          />
        </div>
      )}
    </ElementSelectorContext.Provider>
  )
}

