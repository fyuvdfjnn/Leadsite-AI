"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, ExternalLink, Globe, ArrowRight, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface DeploymentSuccessViewProps {
  subdomain: string
  projectId: string
  onClose: () => void
}

export function DeploymentSuccessView({ subdomain, projectId, onClose }: DeploymentSuccessViewProps) {
  const router = useRouter()
  const fullUrl = `https://${subdomain}`

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl)
    // You could add a toast notification here
  }

  const handleBindDomain = () => {
    router.push("/domains")
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors z-10"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Success Header */}
        <div className="p-8 pt-12 text-center border-b border-border">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">🎉 您的网站已上线！</h2>
          <p className="text-muted-foreground">
            网站已成功部署并可以通过以下链接访问
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-6">
          {/* Live Link */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              实时链接
            </label>
            <div className="flex items-center gap-2">
              <a
                href={fullUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                {fullUrl}
                <ExternalLink className="w-4 h-4" />
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleBindDomain}
              className="w-full h-12 text-base gap-2"
              size="lg"
            >
              <Globe className="w-5 h-5" />
              绑定自定义域名
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              返回编辑器
            </Button>
          </div>

          {/* Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              您可以在域名设置页面添加自定义域名，并将DNS记录指向您的网站
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}














