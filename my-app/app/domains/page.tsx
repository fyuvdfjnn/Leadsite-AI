"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Globe, Plus, Check, Loader2, Copy, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DomainsPage() {
  const [domain, setDomain] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [addedDomains, setAddedDomains] = useState<string[]>([])
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null)

  const projectId = "leadsite"
  const subdomain = `${projectId}.leadsite.ai`

  const handleAddDomain = async () => {
    if (!domain.trim()) return
    
    setIsAdding(true)
    // Simulate adding domain
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setAddedDomains(prev => [...prev, domain])
    setDomain("")
    setIsAdding(false)
    setVerifyingDomain(domain)
    
    // Start verification polling
    startVerificationPolling(domain)
  }

  const startVerificationPolling = (domainToVerify: string) => {
    // Simulate DNS verification
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      
      try {
        const res = await fetch(`/api/domains/verify?domain=${encodeURIComponent(domainToVerify)}`)
        const data = await res.json()
        
        if (data.verified) {
          clearInterval(interval)
          setVerifyingDomain(null)
          // Show success message
          alert("✅ 域名连接成功！SSL证书已激活。")
        } else if (attempts >= 20) {
          // Stop after 20 attempts (100 seconds)
          clearInterval(interval)
          setVerifyingDomain(null)
        }
      } catch (error) {
        console.error("Verification error:", error)
      }
    }, 5000) // Poll every 5 seconds
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/editor">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回编辑器
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-semibold">自定义域名设置</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Current Deployment Info */}
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">当前部署</h2>
              <div className="flex items-center gap-3">
                <a
                  href={`https://${subdomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  {subdomain}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(`https://${subdomain}`)}
                  className="h-7"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
              <Check className="w-4 h-4 inline mr-1" />
              已发布
            </div>
          </div>
        </div>

        {/* Add Domain Card */}
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">添加自定义域名</h2>
          
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="www.example.com"
              className="flex-1 px-4 py-2.5 bg-muted/50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddDomain()
                }
              }}
            />
            <Button
              onClick={handleAddDomain}
              disabled={!domain.trim() || isAdding}
              className="gap-2"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  添加中...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  添加域名
                </>
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            添加后，请按照下方DNS配置指南进行设置
          </p>
        </div>

        {/* DNS Configuration Guide */}
        {addedDomains.length > 0 && (
          <div className="bg-background rounded-xl border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">DNS配置指南</h2>
            
            {addedDomains.map((addedDomain) => (
              <div key={addedDomain} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{addedDomain}</h3>
                  {verifyingDomain === addedDomain ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在等待DNS验证...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <Check className="w-4 h-4" />
                      已验证
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">记录类型</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">主机名</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">指向</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 text-sm">
                          <code className="px-2 py-1 bg-muted rounded text-foreground">CNAME</code>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <code className="px-2 py-1 bg-muted rounded text-foreground">www</code>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted rounded text-foreground">{subdomain}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(subdomain)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm">
                          <code className="px-2 py-1 bg-muted rounded text-foreground">A</code>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <code className="px-2 py-1 bg-muted rounded text-foreground">@</code>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted rounded text-foreground">[你的服务器IP]</code>
                            <span className="text-xs text-muted-foreground">请联系技术支持获取IP</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>说明：</strong>请在您的域名提供商（如 GoDaddy、阿里云、腾讯云）的DNS设置中添加以上记录。
                    DNS配置通常需要几分钟到几小时生效。
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Text */}
        {addedDomains.length === 0 && (
          <div className="bg-background rounded-xl border border-border p-6 text-center">
            <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">尚未添加自定义域名</h3>
            <p className="text-sm text-muted-foreground">
              添加自定义域名后，您可以配置DNS记录，将域名指向您的网站
            </p>
          </div>
        )}
      </main>
    </div>
  )
}














