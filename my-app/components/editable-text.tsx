"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  isEditing: boolean
  className?: string
}

export function EditableText({ value, onChange, isEditing, className = "" }: EditableTextProps) {
  const [isActive, setIsActive] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isActive])

  const handleClick = () => {
    if (isEditing) {
      setIsActive(true)
    }
  }

  const handleBlur = () => {
    setIsActive(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") {
      setIsActive(false)
    }
  }

  if (isEditing && isActive) {
    return (
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} bg-primary/10 border-2 border-primary rounded px-2 py-1 w-full resize-none focus:outline-none`}
        rows={Math.ceil(value.length / 50) || 1}
      />
    )
  }

  return (
    <div
      onClick={handleClick}
      className={`${className} ${isEditing ? "cursor-text hover:bg-primary/5 hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/30 rounded transition-all" : ""}`}
    >
      {value}
    </div>
  )
}
