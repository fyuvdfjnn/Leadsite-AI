"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { HeaderElement } from "@/lib/header-detector"
import type { HeaderUpdates } from "./header-floating-toolbar"
import { detectHeaderElement, getElementFromEvent, getElementFromSelection } from "@/lib/header-detector"
import { HeaderFloatingToolbar } from "./header-floating-toolbar"

interface HeaderEditorContextValue {
  selectedHeader: HeaderElement | null
  selectHeader: (element: HeaderElement | null) => void
  handleClick: (event: MouseEvent | React.MouseEvent) => void
  handleSelection: () => void
}

const HeaderEditorContext = createContext<HeaderEditorContextValue | null>(null)

export function useHeaderEditor() {
  const context = useContext(HeaderEditorContext)
  if (!context) {
    throw new Error("useHeaderEditor must be used within HeaderEditorProvider")
  }
  return context
}

interface HeaderEditorProviderProps {
  children: React.ReactNode
  enabled?: boolean
  onUpdate?: (headerElement: HeaderElement, updates: HeaderUpdates) => void
}

export function HeaderEditorProvider({
  children,
  enabled = true,
  onUpdate,
}: HeaderEditorProviderProps) {
  const [selectedHeader, setSelectedHeader] = useState<HeaderElement | null>(null)

  const selectHeader = useCallback((element: HeaderElement | null) => {
    setSelectedHeader(element)
  }, [])

  const handleClick = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      if (!enabled) return

      const targetElement = getElementFromEvent(event)
      if (!targetElement) return

      const headerElement = detectHeaderElement(targetElement)
      if (headerElement) {
        setSelectedHeader(headerElement)
      } else {
        // 如果点击的不是 header，检查是否需要关闭
        if (selectedHeader && !selectedHeader.element.contains(targetElement)) {
          setSelectedHeader(null)
        }
      }
    },
    [enabled, selectedHeader]
  )

  const handleSelection = useCallback(() => {
    if (!enabled) return

    const targetElement = getElementFromSelection()
    if (!targetElement) return

    const headerElement = detectHeaderElement(targetElement)
    if (headerElement) {
      setSelectedHeader(headerElement)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const handleDocumentClick = (event: MouseEvent) => {
      handleClick(event)
    }

    const handleDocumentSelection = () => {
      handleSelection()
    }

    document.addEventListener("click", handleDocumentClick)
    document.addEventListener("mouseup", handleDocumentSelection)

    return () => {
      document.removeEventListener("click", handleDocumentClick)
      document.removeEventListener("mouseup", handleDocumentSelection)
    }
  }, [enabled, handleClick, handleSelection])

  const handleUpdate = useCallback(
    (updates: HeaderUpdates) => {
      if (selectedHeader) {
        onUpdate?.(selectedHeader, updates)
      }
    },
    [selectedHeader, onUpdate]
  )

  return (
    <HeaderEditorContext.Provider
      value={{
        selectedHeader,
        selectHeader,
        handleClick,
        handleSelection,
      }}
    >
      {children}
      {enabled && (
        <HeaderFloatingToolbar
          headerElement={selectedHeader}
          onClose={() => setSelectedHeader(null)}
          onUpdate={handleUpdate}
        />
      )}
    </HeaderEditorContext.Provider>
  )
}











