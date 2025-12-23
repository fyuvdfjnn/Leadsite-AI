"use client"

import React, { useEffect, useRef, useState } from "react"
import { useFloating, autoUpdate, offset, flip, shift, arrow } from "@floating-ui/react-dom"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette, X } from "lucide-react"
import type { HeaderElement } from "@/lib/header-detector"

export interface HeaderFloatingToolbarProps {
  headerElement: HeaderElement | null
  onClose: () => void
  onUpdate?: (updates: HeaderUpdates) => void
}

export interface HeaderUpdates {
  title?: string
  fontSize?: string
  fontWeight?: string
  textAlign?: "left" | "center" | "right"
  color?: string
  backgroundColor?: string
}

export function HeaderFloatingToolbar({
  headerElement,
  onClose,
  onUpdate,
}: HeaderFloatingToolbarProps) {
  const [updates, setUpdates] = useState<HeaderUpdates>({})
  const arrowRef = useRef<HTMLDivElement>(null)

  const { refs, floatingStyles, placement } = useFloating({
    open: !!headerElement,
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
    if (headerElement) {
      refs.setReference(headerElement.element)
    }
  }, [headerElement, refs])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerElement &&
        refs.floating.current &&
        !refs.floating.current.contains(event.target as Node) &&
        !headerElement.element.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (headerElement) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [headerElement, refs, onClose])

  if (!headerElement) return null

  const handleUpdate = (key: keyof HeaderUpdates, value: string) => {
    const newUpdates = { ...updates, [key]: value }
    setUpdates(newUpdates)
    onUpdate?.(newUpdates)
  }

  const applyUpdates = () => {
    if (Object.keys(updates).length === 0) return

    const { element } = headerElement

    if (updates.title) {
      const titleElement = element.querySelector("h1, h2, h3, .title, [data-title]")
      if (titleElement) {
        titleElement.textContent = updates.title
      }
    }

    if (updates.fontSize) {
      element.style.fontSize = updates.fontSize
    }

    if (updates.fontWeight) {
      element.style.fontWeight = updates.fontWeight
    }

    if (updates.textAlign) {
      element.style.textAlign = updates.textAlign
    }

    if (updates.color) {
      element.style.color = updates.color
    }

    if (updates.backgroundColor) {
      element.style.backgroundColor = updates.backgroundColor
    }

    onUpdate?.(updates)
    setUpdates({})
  }

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="z-50 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl p-2 flex items-center gap-1"
    >
      <div ref={arrowRef} className="absolute w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-300 dark:border-gray-600 rotate-45" />
      
      {/* 标题输入 */}
      <input
        type="text"
        placeholder="编辑标题..."
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => handleUpdate("title", e.target.value)}
      />

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 文本格式 */}
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
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-900 dark:text-gray-100"
        onClick={() => handleUpdate("fontWeight", updates.fontWeight === "underline" ? "normal" : "underline")}
        title="下划线"
      >
        <Underline className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 对齐方式 */}
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

      {/* 字体大小 */}
      <select
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => handleUpdate("fontSize", e.target.value)}
        defaultValue=""
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

      {/* 颜色选择 */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-900 dark:text-gray-100"
          title="文字颜色"
        >
          <Palette className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 关闭按钮 */}
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











