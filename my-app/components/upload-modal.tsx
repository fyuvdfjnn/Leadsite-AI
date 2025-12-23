"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, Loader2, Check, Sparkles } from "lucide-react"

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onUpload: (fileName: string) => void
}

export function UploadModal({ open, onClose, onUpload }: UploadModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  if (!open) return null

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = [".pdf", ".ppt", ".pptx", ".doc", ".docx"]
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    
    if (!validTypes.includes(fileExtension)) {
      alert("Please upload a PDF, PPT, or DOCX file")
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    setUploadedFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(progressInterval)
      setUploadProgress(100)
      setIsUploading(false)
      setIsAnalyzing(true)

      // Simulate analysis
      setTimeout(() => {
        setIsAnalyzing(false)
        onUpload(uploadedFile.name)
        onClose()
      }, 2500)
    }, 2000)
  }

  const handleClose = () => {
    if (!isUploading && !isAnalyzing) {
      setUploadedFile(null)
      setUploadProgress(0)
      setIsDragging(false)
      onClose()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    if (extension === "pdf") return "📄"
    if (["ppt", "pptx"].includes(extension || "")) return "📊"
    if (["doc", "docx"].includes(extension || "")) return "📝"
    return "📎"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-lg w-full border border-border overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isUploading || isAnalyzing}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-semibold mb-2">Upload Document</h2>
          <p className="text-sm text-muted-foreground">
            Upload your PDF, PPT, or DOCX file to get started
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {!uploadedFile ? (
            /* Upload Area */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              <p className="font-medium mb-2">
                {isDragging ? "Drop your file here" : "Drag & drop your file here"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supports PDF, PPT, DOCX up to 10MB
              </p>
            </div>
          ) : isUploading || isAnalyzing ? (
            /* Upload/Analysis Progress */
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <span className="text-2xl">{getFileIcon(uploadedFile.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                </div>
                {!isAnalyzing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Analyzing State */}
              {isAnalyzing && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <p className="font-medium mb-2">Analyzing document...</p>
                  <p className="text-sm text-muted-foreground">
                    Extracting content and identifying key information
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>This may take a few seconds</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* File Selected */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <span className="text-2xl">{getFileIcon(uploadedFile.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                </div>
                <Check className="w-5 h-5 text-green-600" />
              </div>

              <Button onClick={handleUpload} className="w-full gap-2" size="lg">
                <Upload className="w-4 h-4" />
                Upload & Analyze
              </Button>

              <Button
                onClick={() => {
                  setUploadedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                variant="ghost"
                className="w-full"
              >
                Choose Different File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}














