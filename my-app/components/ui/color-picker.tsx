"use client"

import React, { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

const presetColors = [
  "#000000", "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0",
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#64748b", "#374151", "#1f2937",
]

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-full h-10 rounded-md border border-input flex items-center gap-2 px-3 hover:bg-accent transition-colors"
          >
            <div
              className="w-6 h-6 rounded border border-border"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm text-muted-foreground uppercase">
              {value}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* 预设颜色 */}
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onChange(color)
                    setIsOpen(false)
                  }}
                  className={`
                    w-8 h-8 rounded-md border-2 transition-all
                    ${value === color ? "border-primary scale-110" : "border-transparent hover:scale-105"}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* 自定义颜色 */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 h-10 px-3 text-sm border rounded-md bg-background"
                placeholder="#000000"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}











