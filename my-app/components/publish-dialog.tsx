"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Globe, ArrowUp, X } from "lucide-react"

interface PublishDialogProps {
  open: boolean
  onClose: () => void
  onPublishStandard: () => void
  onPublishCustom: () => void
  projectName?: string
}

export function PublishDialog({
  open,
  onClose,
  onPublishStandard,
  onPublishCustom,
  projectName = "project",
}: PublishDialogProps) {
  if (!open) return null

  const subdomain = `${projectName}.leadsite.ai`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          <h2 className="text-2xl font-semibold mb-2">发布网站</h2>
          <p className="text-sm text-muted-foreground mb-6">
            选择发布方式
          </p>

          {/* Standard Publish Button */}
          <Button
            onClick={onPublishStandard}
            variant="outline"
            className="w-full h-auto py-4 mb-3 justify-start gap-3 hover:bg-muted/50 border-border"
          >
            <Globe className="w-5 h-5 text-foreground" />
            <span className="font-medium text-foreground">发布</span>
          </Button>

          {/* Custom Domain Publish Button */}
          <Button
            onClick={onPublishCustom}
            className="w-full h-auto py-4 bg-foreground text-background hover:bg-foreground/90 justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5" />
              <span className="font-medium">发布到自定义域名</span>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium bg-background/20 text-background rounded-full border border-background/30">
              升级
            </span>
          </Button>

          {/* Info Text */}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            发布后，您的网站将立即可访问
          </p>
        </div>
      </div>
    </div>
  )
}

