"use client"

import React, { useEffect, useRef, useState } from "react"
import { useFloating, autoUpdate, offset, flip, shift, arrow } from "@floating-ui/react-dom"
import { Button } from "@/components/ui/button"
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Type, 
  Palette, 
  X,
  Link as LinkIcon,
  Image as ImageIcon,
  Square
} from "lucide-react"
import type { DetectedElement, ElementType } from "@/lib/element-detector"

export interface ElementFloatingToolbarProps {
  element: DetectedElement | null
  onClose: () => void
  onUpdate?: (element: DetectedElement, updates: ElementUpdates) => void
}

export interface ElementUpdates {
  text?: string
  fontSize?: string
  fontWeight?: string
  textAlign?: "left" | "center" | "right"
  color?: string
  backgroundColor?: string
  href?: string
  src?: string
  className?: string
}

function getElementTypeLabel(type: ElementType): string {
  const labels: Record<ElementType, string> = {
    header: "Header",
    nav: "Navigation",
    button: "Button",
    section: "Section",
    text: "Text",
    image: "Image",
    link: "Link",
    unknown: "Element",
  }
  return labels[type] || "Element"
}

export function ElementFloatingToolbar({
  element,
  onClose,
  onUpdate,
}: ElementFloatingToolbarProps) {
  const [updates, setUpdates] = useState<ElementUpdates>({})
  const arrowRef = useRef<HTMLDivElement>(null)

  const { refs, floatingStyles } = useFloating({
    open: !!element,
    onOpenChange: (open) => {
      if (!open) onClose()
    },
    middleware: [
      offset(12),
      flip({
        fallbackAxisSideDirection: "start",
      }),
      shift({
        padding: 8,
      }),
      arrow({
        element: arrowRef,
      }),
    ],
    whileElementsMounted: autoUpdate,
    placement: "top",
  })

  useEffect(() => {
    if (element) {
      refs.setReference(element.element)
      
      // 初始化当前值
      const currentText = element.element.textContent || ""
      const currentColor = window.getComputedStyle(element.element).color
      const currentBgColor = window.getComputedStyle(element.element).backgroundColor
      const currentFontSize = window.getComputedStyle(element.element).fontSize
      const currentFontWeight = window.getComputedStyle(element.element).fontWeight
      const currentTextAlign = window.getComputedStyle(element.element).textAlign as "left" | "center" | "right"
      
      setUpdates({
        text: currentText,
        color: currentColor,
        backgroundColor: currentBgColor,
        fontSize: currentFontSize,
        fontWeight: currentFontWeight,
        textAlign: currentTextAlign,
      })
    }
  }, [element, refs])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        element &&
        refs.floating.current &&
        !refs.floating.current.contains(event.target as Node) &&
        !element.element.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (element) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [element, refs, onClose])

  if (!element) return null

  const handleUpdate = (key: keyof ElementUpdates, value: string) => {
    const newUpdates = { ...updates, [key]: value }
    setUpdates(newUpdates)
    
    // 立即应用更新
    applyUpdateToElement(key, value)
  }

  const applyUpdateToElement = (key: keyof ElementUpdates, value: string) => {
    if (!element) return

    const { element: el } = element

    switch (key) {
      case "text":
        el.textContent = value
        break
      case "fontSize":
        el.style.fontSize = value
        break
      case "fontWeight":
        el.style.fontWeight = value
        break
      case "textAlign":
        el.style.textAlign = value
        break
      case "color":
        el.style.color = value
        break
      case "backgroundColor":
        el.style.backgroundColor = value
        break
      case "href":
        if (el.tagName.toLowerCase() === "a") {
          el.setAttribute("href", value)
        }
        break
      case "src":
        if (el.tagName.toLowerCase() === "img") {
          el.setAttribute("src", value)
        }
        break
    }

    onUpdate?.(element, { [key]: value })
  }

  const elementType = getElementTypeLabel(element.type)

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="z-50 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl p-2 flex items-center gap-1 min-w-[200px]"
    >
      <div 
        ref={arrowRef} 
        className="absolute w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-300 dark:border-gray-600 rotate-45 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: '50%',
          top: '100%',
        }}
      />
      
      {/* 元素类型标签 */}
      <div className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
        {elementType}
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 文本编辑（适用于 text, button, link, header） */}
      {['text', 'button', 'link', 'header', 'nav'].includes(element.type) && (
        <>
          <input
            type="text"
            placeholder="编辑文本..."
            value={updates.text || ""}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
            onChange={(e) => handleUpdate("text", e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        </>
      )}

      {/* 文本格式（适用于 text, button, link, header） */}
      {['text', 'button', 'link', 'header', 'nav'].includes(element.type) && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-900 dark:text-gray-100"
            onClick={() => handleUpdate("fontWeight", updates.fontWeight === "bold" ? "normal" : "bold")}
            title="加粗"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-900 dark:text-gray-100"
            onClick={() => handleUpdate("fontWeight", updates.fontWeight === "italic" ? "normal" : "italic")}
            title="斜体"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        </>
      )}

      {/* 对齐方式（适用于 text, button, header） */}
      {['text', 'button', 'header', 'nav'].includes(element.type) && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-900 dark:text-gray-100"
            onClick={() => handleUpdate("textAlign", "left")}
            title="左对齐"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-900 dark:text-gray-100"
            onClick={() => handleUpdate("textAlign", "center")}
            title="居中"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-900 dark:text-gray-100"
            onClick={() => handleUpdate("textAlign", "right")}
            title="右对齐"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        </>
      )}

      {/* 字体大小（适用于 text, button, header） */}
      {['text', 'button', 'header', 'nav'].includes(element.type) && (
        <select
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => handleUpdate("fontSize", e.target.value)}
          value={updates.fontSize || ""}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">字体大小</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="32px">32px</option>
        </select>
      )}

      {/* 链接编辑（适用于 link） */}
      {element.type === 'link' && (
        <>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <input
            type="url"
            placeholder="链接地址..."
            value={element.attributes.href || ""}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
            onChange={(e) => handleUpdate("href", e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </>
      )}

      {/* 关闭按钮 */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-900 dark:text-gray-100"
        onClick={onClose}
        title="关闭"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}











