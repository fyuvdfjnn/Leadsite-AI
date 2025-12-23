"use client"

import React, { useEffect, useRef, useState } from "react"
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/react-dom"
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
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Plus,
  Settings,
  Edit3,
  Layers,
  Link,
  Image,
} from "lucide-react"
import type { DetectedElement } from "@/lib/element-detector"
import { getElementDescription } from "@/lib/css-selector-generator"
import { ElementEditorPanel } from "./element-editor-panel"

export interface ModuleEditToolbarProps {
  element: DetectedElement | null
  onClose: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onAddBefore?: () => void
  onAddAfter?: () => void
  onEdit?: () => void
  onStyleChange?: (property: string, value: string) => void
  onConfigUpdate?: (elementType: string, config: any) => void
}

export function ModuleEditToolbar({
  element,
  onClose,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onAddBefore,
  onAddAfter,
  onEdit,
  onStyleChange,
  onConfigUpdate,
}: ModuleEditToolbarProps) {
  const [showStylePanel, setShowStylePanel] = useState(false)
  const [showEditorPanel, setShowEditorPanel] = useState(false)
  
  const { refs, floatingStyles } = useFloating({
    open: !!element,
    middleware: [
      offset(12),
      flip({
        fallbackAxisSideDirection: "start",
        padding: 16,
      }),
      shift({
        padding: 16,
      }),
    ],
    whileElementsMounted: autoUpdate,
    placement: "top",
  })

  useEffect(() => {
    if (element) {
      refs.setReference(element.element)
    }
  }, [element, refs])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        element &&
        refs.floating.current &&
        !refs.floating.current.contains(target) &&
        !element.element.contains(target) &&
        !target.closest('[data-module-toolbar]') &&
        !target.closest('[data-editor-panel]')
      ) {
        if (!showEditorPanel) {
          onClose()
        }
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showEditorPanel) {
          setShowEditorPanel(false)
        } else {
          onClose()
        }
      }
      // Delete 键删除
      if (event.key === 'Delete' && onDelete && !showEditorPanel) {
        onDelete()
      }
      // Ctrl+D 复制
      if (event.key === 'd' && event.ctrlKey && onDuplicate) {
        event.preventDefault()
        onDuplicate()
      }
    }

    if (element) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [element, refs, onClose, onDelete, onDuplicate, showEditorPanel])

  // 关闭时重置状态
  useEffect(() => {
    if (!element) {
      setShowStylePanel(false)
      setShowEditorPanel(false)
    }
  }, [element])

  if (!element) return null

  const elementLabel = getElementDescription(element.element)

  // 判断元素是否支持高级编辑
  const supportsAdvancedEdit = ['button', 'header', 'nav', 'section', 'footer'].includes(element.type)

  // 获取元素类型对应的图标
  const getElementIcon = () => {
    switch (element.type) {
      case 'button':
        return <div className="w-3.5 h-3.5 rounded border-2 border-current" />
      case 'header':
      case 'nav':
        return <Layers className="w-3.5 h-3.5" />
      case 'section':
        return <Layers className="w-3.5 h-3.5" />
      case 'link':
        return <Link className="w-3.5 h-3.5" />
      case 'image':
        return <Image className="w-3.5 h-3.5" />
      default:
        return <Type className="w-3.5 h-3.5" />
    }
  }

  return (
    <>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        data-module-toolbar
        className="z-[10000] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden"
      >
        {/* 主工具栏 */}
        <div className="flex items-center gap-0.5 p-1.5">
          {/* 元素类型标签 */}
          <div className="flex items-center gap-1.5 px-2 py-1 mr-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
            {getElementIcon()}
            <span className="text-xs font-medium">{elementLabel}</span>
          </div>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* 高级设置按钮 - 仅对支持的元素显示 */}
          {supportsAdvancedEdit && (
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 gap-1 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${showEditorPanel ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : ''}`}
              onClick={() => setShowEditorPanel(!showEditorPanel)}
              title="打开设置面板"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="text-xs">设置</span>
            </Button>
          )}

          {/* 编辑按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onEdit}
            title="编辑内容"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Button>

          {/* 样式按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 ${showStylePanel ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            onClick={() => setShowStylePanel(!showStylePanel)}
            title="快捷样式"
          >
            <Palette className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* 添加按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onAddBefore}
            title="在上方添加模块"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>

          {/* 移动按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onMoveUp}
            title="上移"
          >
            <MoveUp className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onMoveDown}
            title="下移"
          >
            <MoveDown className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* 复制按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onDuplicate}
            title="复制模块 (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>

          {/* 删除按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={onDelete}
            title="删除模块 (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* 关闭按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClose}
            title="关闭 (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* 快捷样式面板 */}
        {showStylePanel && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <div className="flex items-center gap-1">
              {/* 文本格式 */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300"
                onClick={() => onStyleChange?.('fontWeight', 'bold')}
                title="加粗"
              >
                <Bold className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300"
                onClick={() => onStyleChange?.('fontStyle', 'italic')}
                title="斜体"
              >
                <Italic className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300"
                onClick={() => onStyleChange?.('textDecoration', 'underline')}
                title="下划线"
              >
                <Underline className="w-3.5 h-3.5" />
              </Button>

              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

              {/* 对齐 */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300"
                onClick={() => onStyleChange?.('textAlign', 'left')}
                title="左对齐"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300"
                onClick={() => onStyleChange?.('textAlign', 'center')}
                title="居中"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-700 dark:text-gray-300"
                onClick={() => onStyleChange?.('textAlign', 'right')}
                title="右对齐"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </Button>

              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

              {/* 字体大小 */}
              <select
                className="h-7 px-2 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                onChange={(e) => onStyleChange?.('fontSize', e.target.value)}
              >
                <option value="">字号</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="24px">24px</option>
                <option value="32px">32px</option>
                <option value="48px">48px</option>
              </select>

              {/* 颜色选择器 */}
              <input
                type="color"
                className="h-7 w-7 p-0.5 border border-gray-200 dark:border-gray-700 rounded cursor-pointer"
                onChange={(e) => onStyleChange?.('color', e.target.value)}
                title="文字颜色"
              />
              <input
                type="color"
                className="h-7 w-7 p-0.5 border border-gray-200 dark:border-gray-700 rounded cursor-pointer"
                onChange={(e) => onStyleChange?.('backgroundColor', e.target.value)}
                title="背景颜色"
              />
            </div>
          </div>
        )}
      </div>

      {/* 元素编辑器面板 */}
      <ElementEditorPanel
        element={element}
        isOpen={showEditorPanel}
        onClose={() => setShowEditorPanel(false)}
        onConfigUpdate={onConfigUpdate}
      />
    </>
  )
}
