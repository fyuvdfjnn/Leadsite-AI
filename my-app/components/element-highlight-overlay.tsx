"use client"

import React, { useEffect, useState, useCallback } from "react"
import { createPortal } from "react-dom"

export interface HighlightRect {
  top: number
  left: number
  width: number
  height: number
}

export interface ElementHighlightOverlayProps {
  hoveredRect: HighlightRect | null
  selectedRect: HighlightRect | null
  hoveredLabel?: string
  selectedLabel?: string
}

/**
 * 元素高亮覆盖层
 * 显示悬停和选中状态的高亮效果
 */
export function ElementHighlightOverlay({
  hoveredRect,
  selectedRect,
  hoveredLabel,
  selectedLabel,
}: ElementHighlightOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  const overlayContent = (
    <>
      {/* 悬停高亮 */}
      {hoveredRect && !selectedRect && (
        <div
          className="pointer-events-none fixed z-[9998] transition-all duration-75"
          style={{
            top: hoveredRect.top,
            left: hoveredRect.left,
            width: hoveredRect.width,
            height: hoveredRect.height,
          }}
        >
          {/* 高亮边框 */}
          <div
            className="absolute inset-0 border-2 border-blue-500 rounded-sm"
            style={{ boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3)' }}
          />
          {/* 半透明背景 */}
          <div className="absolute inset-0 bg-blue-500/10 rounded-sm" />
          {/* 标签 */}
          {hoveredLabel && (
            <div
              className="absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded-t-sm whitespace-nowrap"
              style={{ transform: 'translateY(0)' }}
            >
              {hoveredLabel}
            </div>
          )}
        </div>
      )}

      {/* 选中高亮 */}
      {selectedRect && (
        <div
          className="pointer-events-none fixed z-[9999] transition-all duration-100"
          style={{
            top: selectedRect.top,
            left: selectedRect.left,
            width: selectedRect.width,
            height: selectedRect.height,
          }}
        >
          {/* 选中边框 - 更粗的蓝色边框 */}
          <div
            className="absolute inset-0 border-2 border-blue-600 rounded-sm"
            style={{ 
              boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)' 
            }}
          />
          {/* 选中背景 */}
          <div className="absolute inset-0 bg-blue-600/5 rounded-sm" />
          {/* 四角拖拽点 */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-600 border border-white rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 border border-white rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-600 border border-white rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 border border-white rounded-full" />
          {/* 标签 */}
          {selectedLabel && (
            <div
              className="absolute -top-7 left-0 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-sm whitespace-nowrap shadow-lg"
            >
              {selectedLabel}
            </div>
          )}
        </div>
      )}
    </>
  )

  return createPortal(overlayContent, document.body)
}











