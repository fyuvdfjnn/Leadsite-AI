"use client"

import React, { useRef, useState, useCallback } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "./button"

interface FileUploadProps {
  accept?: string
  maxSize?: number // bytes
  onUpload: (url: string) => void
  value?: string
  placeholder?: string
  className?: string
}

export function FileUpload({
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  onUpload,
  value,
  placeholder = "点击或拖拽上传图片",
  className = "",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    // 检查文件大小
    if (file.size > maxSize) {
      setError(`文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    // 检查文件类型
    if (accept !== "*" && !file.type.match(accept.replace("*", ".*"))) {
      setError("不支持的文件类型")
      return
    }

    setIsUploading(true)

    try {
      // 将文件转换为 base64 URL（本地预览）
      // 实际项目中应该上传到服务器/云存储
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        onUpload(url)
        setIsUploading(false)
      }
      reader.onerror = () => {
        setError("文件读取失败")
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError("上传失败，请重试")
      setIsUploading(false)
    }
  }, [accept, maxSize, onUpload])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUpload("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {value ? (
        // 已上传状态
        <div className="relative group">
          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border bg-muted">
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                替换
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // 未上传状态
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative w-full h-32 rounded-lg border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-2 transition-colors
            ${isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
            }
          `}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{placeholder}</p>
              <p className="text-xs text-muted-foreground">
                最大 {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}











