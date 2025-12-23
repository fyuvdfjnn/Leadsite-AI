"use client"

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DetectedElement, ElementType } from "@/lib/element-detector"
import { getElementDescription } from "@/lib/css-selector-generator"
import { ButtonEditor } from "./element-editors/button-editor"
import { HeaderEditor } from "./element-editors/header-editor"
import { SectionEditor } from "./element-editors/section-editor"
import type { ButtonConfig, HeaderConfig, SectionConfig } from "@/types/element-configs"

interface ElementEditorPanelProps {
  element: DetectedElement | null
  isOpen: boolean
  onClose: () => void
  onConfigUpdate?: (elementType: ElementType, config: any) => void
}

export function ElementEditorPanel({
  element,
  isOpen,
  onClose,
  onConfigUpdate,
}: ElementEditorPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!mounted || !isOpen || !element) return null

  const elementLabel = getElementDescription(element.element)

  // 根据元素类型渲染对应编辑器
  const renderEditor = () => {
    switch (element.type) {
      case 'button':
        return (
          <ButtonEditor
            element={element.element}
            onUpdate={(config: ButtonConfig) => {
              onConfigUpdate?.(element.type, config)
            }}
          />
        )
      case 'header':
      case 'nav':
        return (
          <HeaderEditor
            element={element.element}
            onUpdate={(config: HeaderConfig) => {
              onConfigUpdate?.(element.type, config)
            }}
          />
        )
      case 'section':
      case 'footer':
        return (
          <SectionEditor
            element={element.element}
            onUpdate={(config: SectionConfig) => {
              onConfigUpdate?.(element.type, config)
            }}
          />
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Settings className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              暂不支持编辑此类型元素
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              类型: {element.type}
            </p>
          </div>
        )
    }
  }

  const getEditorTitle = () => {
    switch (element.type) {
      case 'button':
        return '按钮设置'
      case 'header':
      case 'nav':
        return '导航栏设置'
      case 'section':
        return '区块设置'
      case 'footer':
        return '页脚设置'
      case 'image':
        return '图片设置'
      case 'link':
        return '链接设置'
      default:
        return '元素设置'
    }
  }

  const panelContent = (
    <div 
      className={`
        fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-2xl z-[10001]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{getEditorTitle()}</h2>
            <p className="text-xs text-muted-foreground">{elementLabel}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 编辑器内容 */}
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="p-4">
          {renderEditor()}
        </div>
      </ScrollArea>
    </div>
  )

  // 背景遮罩
  const overlay = (
    <div
      className={`
        fixed inset-0 bg-black/20 z-[10000] transition-opacity duration-300
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
    />
  )

  return createPortal(
    <>
      {overlay}
      {panelContent}
    </>,
    document.body
  )
}











