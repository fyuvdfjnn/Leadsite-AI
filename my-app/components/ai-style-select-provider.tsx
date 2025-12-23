"use client"

import React, { useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import {
  useElementStyleStore,
  useIsSelectMode,
  useSelectedId,
  useHoveredId,
  useOverrides,
} from "@/lib/element-style-store"

interface AIStyleSelectProviderProps {
  children: React.ReactNode
  containerRef?: React.RefObject<HTMLElement>
}

/**
 * AI 样式选择 Provider
 * 实现"选取-绑定"机制：点击元素时设置 selectedId 到 Store
 */
export function AIStyleSelectProvider({
  children,
  containerRef,
}: AIStyleSelectProviderProps) {
  const isSelectMode = useIsSelectMode()
  const selectedId = useSelectedId()
  const hoveredId = useHoveredId()
  const overrides = useOverrides()
  
  const {
    setSelectedId,
    setHoveredId,
    setSelectMode,
  } = useElementStyleStore()

  const rafRef = useRef<number | undefined>(undefined)

  // 从元素获取唯一标识符
  const getElementId = useCallback((element: HTMLElement): string | null => {
    // 优先使用 data-element-id 属性
    const dataId = element.getAttribute("data-element-id")
    if (dataId) return dataId

    // 其次使用 id 属性
    if (element.id) {
      const generatedId = `#${element.id}`
      // 设置到元素上，方便后续查找
      element.setAttribute("data-element-id", generatedId)
      return generatedId
    }

    // 使用 data-component 属性
    const dataComponent = element.getAttribute("data-component")
    if (dataComponent) {
      // 生成带索引的唯一 ID
      const siblings = document.querySelectorAll(`[data-component="${dataComponent}"]`)
      const index = Array.from(siblings).indexOf(element)
      const generatedId = `${dataComponent}-${index}`
      // 关键修复：将生成的ID设置到元素上，确保后续能通过data-element-id找到
      element.setAttribute("data-element-id", generatedId)
      return generatedId
    }

    // 使用标签名和类名生成
    const tagName = element.tagName.toLowerCase()
    const className = element.className?.toString().split(" ")[0] || ""
    
    if (className) {
      const generatedId = `${tagName}.${className}`
      element.setAttribute("data-element-id", generatedId)
      return generatedId
    }

    return null
  }, [])

  // 查找最近的可选择元素
  const findSelectableElement = useCallback((target: HTMLElement): HTMLElement | null => {
    let current: HTMLElement | null = target
    let depth = 0
    const maxDepth = 10

    while (current && depth < maxDepth) {
      // 跳过工具栏等 UI 元素
      if (
        current.hasAttribute("data-ai-toolbar") ||
        current.hasAttribute("data-no-select") ||
        current.closest("[data-ai-toolbar]") ||
        current.closest("[data-no-select]")
      ) {
        return null
      }

      // 检查是否有唯一标识符
      const id = getElementId(current)
      if (id) {
        return current
      }

      // 检查常见可编辑元素
      const tagName = current.tagName.toLowerCase()
      if (
        ["button", "a", "h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div", "section", "header", "footer", "nav", "article", "img"].includes(tagName)
      ) {
        return current
      }

      current = current.parentElement
      depth++
    }

    return null
  }, [getElementId])

  // 处理鼠标移动（悬停高亮）
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isSelectMode) return

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      const target = event.target as HTMLElement
      
      // 跳过工具栏区域
      if (target.closest("[data-ai-toolbar]") || target.closest("[data-no-select]")) {
        return
      }

      const selectableElement = findSelectableElement(target)
      
      if (selectableElement) {
        const id = getElementId(selectableElement) || 
          `${selectableElement.tagName.toLowerCase()}-${Date.now()}`
        
        if (id !== hoveredId) {
          setHoveredId(id)
          // 为元素添加临时 data 属性
          if (!selectableElement.hasAttribute("data-element-id")) {
            selectableElement.setAttribute("data-element-id", id)
          }
        }
      } else {
        if (hoveredId) {
          setHoveredId(null)
        }
      }
    })
  }, [isSelectMode, hoveredId, findSelectableElement, getElementId, setHoveredId])

  // 处理点击（选择元素）
  const handleClick = useCallback((event: MouseEvent) => {
    if (!isSelectMode) return

    const target = event.target as HTMLElement
    
    // 跳过工具栏区域
    if (target.closest("[data-ai-toolbar]") || target.closest("[data-no-select]")) {
      return
    }

    const selectableElement = findSelectableElement(target)
    
    if (selectableElement) {
      event.preventDefault()
      event.stopPropagation()

      let id = getElementId(selectableElement)
      
      // 如果没有 ID，生成一个并设置
      if (!id) {
        id = `element-${Date.now()}`
        selectableElement.setAttribute("data-element-id", id)
      }

      setSelectedId(id)
      setSelectMode(false) // 选择后关闭选择模式
    }
  }, [isSelectMode, findSelectableElement, getElementId, setSelectedId, setSelectMode])

  // 处理 ESC 键退出选择模式
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape" && isSelectMode) {
      setSelectMode(false)
      setHoveredId(null)
    }
  }, [isSelectMode, setSelectMode, setHoveredId])

  // 绑定/解绑事件监听器
  useEffect(() => {
    if (isSelectMode) {
      document.addEventListener("mousemove", handleMouseMove, { passive: true })
      document.addEventListener("click", handleClick, true)
      document.addEventListener("keydown", handleKeyDown)
      
      // 添加选择模式光标样式
      document.body.style.cursor = "crosshair"
    } else {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("click", handleClick, true)
      document.removeEventListener("keydown", handleKeyDown)
      
      document.body.style.cursor = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("click", handleClick, true)
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.cursor = ""
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isSelectMode, handleMouseMove, handleClick, handleKeyDown])

  // 安全地转义 CSS 选择器中的特殊字符
  const escapeSelector = useCallback((id: string): string => {
    // 如果 ID 包含无效字符，直接返回 null
    if (!id || id.includes('[') || id.includes(']') || id.includes('"') || id.includes("'")) {
      return ''
    }
    return id
  }, [])

  // 安全地查找元素
  const findElementById = useCallback((elementId: string): HTMLElement | null => {
    if (!elementId) return null
    
    // 尝试使用 CSS.escape 来转义选择器（如果可用）
    try {
      const escapedId = typeof CSS !== 'undefined' && CSS.escape 
        ? CSS.escape(elementId) 
        : escapeSelector(elementId)
      
      if (!escapedId) return null
      
      return document.querySelector(`[data-element-id="${escapedId}"]`) as HTMLElement
    } catch {
      // 如果选择器无效，尝试遍历所有带 data-element-id 属性的元素
      const allElements = document.querySelectorAll('[data-element-id]')
      for (const el of allElements) {
        if (el.getAttribute('data-element-id') === elementId) {
          return el as HTMLElement
        }
      }
      return null
    }
  }, [escapeSelector])

  // 移除冲突的 Tailwind 类名
  const removeConflictingClasses = useCallback((classList: string, newClasses: string): string => {
    const classes = classList.split(/\s+/).filter(Boolean)
    const newClassArray = newClasses.split(/\s+/).filter(Boolean)
    
    // Tailwind 类名前缀映射（用于检测冲突）
    // 当新类名包含某个前缀时，移除所有旧类名中相同前缀的类
    const prefixMap: Record<string, string[]> = {
      'bg-': ['bg-'],  // bg-blue-500 会移除所有 bg-* 包括 bg-background
      'text-': ['text-'],  // text-white 会移除所有 text-* 包括 text-foreground
      'border-': ['border-'],
      'rounded-': ['rounded-'],
      'shadow-': ['shadow-'],
      'p-': ['p-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-'],
      'm-': ['m-', 'mx-', 'my-', 'mt-', 'mb-', 'ml-', 'mr-'],
      'w-': ['w-'],
      'h-': ['h-'],
      'font-': ['font-'],
    }
    
    // 找出新类名涉及的前缀
    const affectedPrefixes = new Set<string>()
    newClassArray.forEach(cls => {
      Object.keys(prefixMap).forEach(prefix => {
        if (cls.startsWith(prefix)) {
          affectedPrefixes.add(prefix)
        }
      })
    })
    
    // 过滤掉冲突的旧类名
    const filteredClasses = classes.filter(cls => {
      for (const prefix of affectedPrefixes) {
        const relatedPrefixes = prefixMap[prefix] || [prefix]
        // 检查旧类名是否以任何相关前缀开头
        if (relatedPrefixes.some(p => cls.startsWith(p))) {
          return false // 移除冲突的类名
        }
      }
      return true
    })
    
    return filteredClasses.join(' ')
  }, [])

  // 清除冲突的内联样式
  const clearConflictingInlineStyles = useCallback((element: HTMLElement, tailwindClasses: string) => {
    // 保存原始内联样式（如果还没保存）
    if (!element.hasAttribute("data-original-style")) {
      element.setAttribute("data-original-style", element.getAttribute("style") || "")
    }
    
    // Tailwind 类名到 CSS 属性的映射
    const classToStyleMap: Record<string, string[]> = {
      'bg-': ['background-color', 'background'],
      'text-': ['color'],
      'border-': ['border-color', 'border'],
      'rounded-': ['border-radius'],
      'shadow-': ['box-shadow'],
      'p-': ['padding'],
      'px-': ['padding-left', 'padding-right'],
      'py-': ['padding-top', 'padding-bottom'],
      'pt-': ['padding-top'],
      'pb-': ['padding-bottom'],
      'pl-': ['padding-left'],
      'pr-': ['padding-right'],
      'm-': ['margin'],
      'mx-': ['margin-left', 'margin-right'],
      'my-': ['margin-top', 'margin-bottom'],
      'mt-': ['margin-top'],
      'mb-': ['margin-bottom'],
      'ml-': ['margin-left'],
      'mr-': ['margin-right'],
      'w-': ['width'],
      'h-': ['height'],
      'font-': ['font-weight', 'font-family'],
    }
    
    // 找出新类名涉及的 CSS 属性
    const classArray = tailwindClasses.split(/\s+/).filter(Boolean)
    const affectedProperties = new Set<string>()
    
    classArray.forEach(cls => {
      Object.entries(classToStyleMap).forEach(([prefix, properties]) => {
        if (cls.startsWith(prefix)) {
          properties.forEach(prop => affectedProperties.add(prop))
        }
      })
    })
    
    // 清除冲突的内联样式
    affectedProperties.forEach(prop => {
      element.style.removeProperty(prop)
    })
    
    console.log('[AI Style] 清除内联样式:', {
      elementId: element.getAttribute('data-element-id'),
      清除的属性: Array.from(affectedProperties),
      剩余内联样式: element.getAttribute('style')
    })
  }, [])

  // 应用覆盖样式到元素
  useEffect(() => {
    // 遍历所有有覆盖样式的元素
    Object.entries(overrides).forEach(([elementId, override]) => {
      if (!override?.tailwindClasses) return

      // 安全地查找元素
      const element = findElementById(elementId)
      
      if (element) {
        // 保存原始类名（如果还没保存）
        if (!element.hasAttribute("data-original-class")) {
          element.setAttribute("data-original-class", element.className)
        }

        // 清除冲突的内联样式（关键修复：确保 Tailwind 类名能生效）
        clearConflictingInlineStyles(element, override.tailwindClasses)

        // 获取原始类名
        const originalClass = element.getAttribute("data-original-class") || ""
        
        // 移除冲突的类名，然后添加新类名
        const cleanedClass = removeConflictingClasses(originalClass, override.tailwindClasses)
        element.className = `${cleanedClass} ${override.tailwindClasses}`.trim()
        
        console.log('[AI Style] 应用样式到元素:', {
          elementId,
          原始类名: originalClass,
          清理后: cleanedClass,
          新增类名: override.tailwindClasses,
          最终类名: element.className
        })
      }
    })
  }, [overrides, findElementById, removeConflictingClasses, clearConflictingInlineStyles])

  return (
    <>
      {children}
      
      {/* 悬停高亮覆盖层 */}
      <HoverHighlight elementId={hoveredId} />
      
      {/* 选中高亮覆盖层 */}
      <SelectionHighlight elementId={selectedId} />
    </>
  )
}

// 安全地查找元素（用于高亮组件）
function safeFindElement(elementId: string | null): Element | null {
  if (!elementId) return null
  
  try {
    // 尝试使用 CSS.escape
    const escapedId = typeof CSS !== 'undefined' && CSS.escape 
      ? CSS.escape(elementId) 
      : elementId
    
    // 如果包含无效字符，使用遍历方式
    if (elementId.includes('[') || elementId.includes(']') || elementId.includes('"') || elementId.includes("'")) {
      const allElements = document.querySelectorAll('[data-element-id]')
      for (const el of allElements) {
        if (el.getAttribute('data-element-id') === elementId) {
          return el
        }
      }
      return null
    }
    
    return document.querySelector(`[data-element-id="${escapedId}"]`)
  } catch {
    // 如果选择器无效，遍历查找
    const allElements = document.querySelectorAll('[data-element-id]')
    for (const el of allElements) {
      if (el.getAttribute('data-element-id') === elementId) {
        return el
      }
    }
    return null
  }
}

// 悬停高亮组件
function HoverHighlight({ elementId }: { elementId: string | null }) {
  const [rect, setRect] = React.useState<DOMRect | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!elementId) {
      setRect(null)
      return
    }

    const element = safeFindElement(elementId)
    if (element) {
      setRect(element.getBoundingClientRect())
    } else {
      setRect(null)
    }
  }, [elementId])

  if (!mounted || !rect) return null

  return createPortal(
    <div
      className="pointer-events-none fixed z-[9998] border-2 border-blue-400 bg-blue-400/10 transition-all duration-75"
      style={{
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      }}
    >
      <div className="absolute -top-6 left-0 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
        {elementId}
      </div>
    </div>,
    document.body
  )
}

// 选中高亮组件
function SelectionHighlight({ elementId }: { elementId: string | null }) {
  const [rect, setRect] = React.useState<DOMRect | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!elementId) {
      setRect(null)
      return
    }

    const updateRect = () => {
      const element = safeFindElement(elementId)
      if (element) {
        setRect(element.getBoundingClientRect())
      } else {
        setRect(null)
      }
    }

    updateRect()

    // 监听滚动和调整大小
    window.addEventListener("scroll", updateRect)
    window.addEventListener("resize", updateRect)

    return () => {
      window.removeEventListener("scroll", updateRect)
      window.removeEventListener("resize", updateRect)
    }
  }, [elementId])

  if (!mounted || !rect) return null

  return createPortal(
    <div
      className="pointer-events-none fixed z-[9999] border-2 border-primary bg-primary/5 transition-all duration-100"
      style={{
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      }}
    >
      {/* 调整手柄 */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full" />
    </div>,
    document.body
  )
}



