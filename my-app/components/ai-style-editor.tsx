"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Wand2,
  Send,
  Loader2,
  X,
  Trash2,
  MousePointer,
  Palette,
  Type,
  Square,
  Move,
  Eye,
  History,
  Undo2,
} from "lucide-react"
import {
  useElementStyleStore,
  useSelectedId,
  useIsSelectMode,
  useElementOverride,
} from "@/lib/element-style-store"

interface AIStyleEditorProps {
  className?: string
}

// 快捷指令预设
const quickCommands = [
  { label: "红色文字", instruction: "改为红色", icon: Palette },
  { label: "蓝色背景", instruction: "背景变蓝色", icon: Square },
  { label: "字体变大", instruction: "字体变大", icon: Type },
  { label: "加粗", instruction: "加粗", icon: Type },
  { label: "居中对齐", instruction: "居中", icon: Move },
  { label: "添加圆角", instruction: "添加圆角", icon: Square },
  { label: "添加阴影", instruction: "添加阴影", icon: Square },
  { label: "美化", instruction: "让它更漂亮", icon: Wand2 },
]

export function AIStyleEditor({ className = "" }: AIStyleEditorProps) {
  const [instruction, setInstruction] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<{
    tailwindClasses: string
    description: string
  } | null>(null)

  // Store 状态
  const selectedId = useSelectedId()
  const isSelectMode = useIsSelectMode()
  const selectedOverride = useElementOverride(selectedId || "")
  
  const {
    setSelectMode,
    setSelectedId,
    updateTailwindClasses,
    removeOverride,
    clearAllOverrides,
    overrides,
  } = useElementStyleStore()

  // 发送 AI 请求
  const handleSubmit = useCallback(async (cmd?: string) => {
    const finalInstruction = cmd || instruction
    if (!finalInstruction.trim() || !selectedId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: finalInstruction,
          elementId: selectedId,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "修改失败")
        return
      }

      // 更新 Store
      updateTailwindClasses(selectedId, data.tailwindClasses, finalInstruction)
      setLastResult({
        tailwindClasses: data.tailwindClasses,
        description: data.description,
      })
      setInstruction("")
    } catch (err) {
      setError("请求失败，请重试")
      console.error("AI style request error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [instruction, selectedId, updateTailwindClasses])

  // 快捷指令
  const handleQuickCommand = (cmd: string) => {
    if (!selectedId) {
      setError("请先选择一个元素")
      return
    }
    handleSubmit(cmd)
  }

  // 撤销当前元素的修改
  const handleUndo = () => {
    if (selectedId) {
      removeOverride(selectedId)
      setLastResult(null)
    }
  }

  // 获取已修改元素数量
  const modifiedCount = Object.keys(overrides).length

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">AI 样式编辑</h2>
        </div>
        {modifiedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={clearAllOverrides}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            清除全部 ({modifiedCount})
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 选择模式切换 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">选择元素</Label>
            <Button
              variant={isSelectMode ? "default" : "outline"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectMode(!isSelectMode)}
            >
              <MousePointer className={`w-4 h-4 ${isSelectMode ? "animate-pulse" : ""}`} />
              {isSelectMode ? "点击页面选择元素..." : "开启选择模式"}
            </Button>
          </div>

          {/* 当前选中元素 */}
          {selectedId && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">当前选中</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setSelectedId(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                {selectedId}
              </code>
              
              {/* 当前覆盖样式 */}
              {selectedOverride && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">已应用样式</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 text-xs"
                      onClick={handleUndo}
                    >
                      <Undo2 className="w-3 h-3 mr-1" />
                      撤销
                    </Button>
                  </div>
                  <code className="text-xs text-green-600 dark:text-green-400">
                    {selectedOverride.tailwindClasses}
                  </code>
                  {selectedOverride.instruction && (
                    <p className="text-xs text-muted-foreground mt-1">
                      指令: "{selectedOverride.instruction}"
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 指令输入 */}
          <div className="space-y-2">
            <Label htmlFor="instruction" className="text-sm font-medium">
              输入指令
            </Label>
            <div className="flex gap-2">
              <Input
                id="instruction"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={selectedId ? "例如: 改为红色、字体变大..." : "请先选择元素"}
                disabled={!selectedId || isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
              <Button
                onClick={() => handleSubmit()}
                disabled={!selectedId || !instruction.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm whitespace-pre-wrap">
              {error}
            </div>
          )}

          {/* 成功结果 */}
          {lastResult && !error && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                {lastResult.description}
              </p>
              <code className="text-xs text-green-600 dark:text-green-400 mt-1 block">
                {lastResult.tailwindClasses}
              </code>
            </div>
          )}

          {/* 快捷指令 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">快捷指令</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickCommands.map((cmd) => (
                <Button
                  key={cmd.instruction}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 text-xs"
                  disabled={!selectedId || isLoading}
                  onClick={() => handleQuickCommand(cmd.instruction)}
                >
                  <cmd.icon className="w-3 h-3" />
                  {cmd.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 修改历史 */}
          {modifiedCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">已修改元素</Label>
              </div>
              <div className="space-y-1 max-h-40 overflow-auto">
                {Object.entries(overrides).map(([id, override]) => (
                  <div
                    key={id}
                    className={`
                      flex items-center justify-between p-2 rounded text-xs
                      ${selectedId === id ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}
                      cursor-pointer hover:bg-muted/50 transition-colors
                    `}
                    onClick={() => setSelectedId(id)}
                  >
                    <div className="flex-1 min-w-0">
                      <code className="text-primary truncate block">{id}</code>
                      <span className="text-muted-foreground truncate block">
                        {override.tailwindClasses}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeOverride(id)
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 使用提示 */}
      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          <Eye className="w-3 h-3 inline mr-1" />
          选择元素后输入指令，AI 会自动生成样式
        </p>
      </div>
    </div>
  )
}








