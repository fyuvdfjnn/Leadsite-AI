"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, Settings, HelpCircle, ArrowLeft } from "lucide-react"

export function DashboardHeader() {
  const router = useRouter()

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Left: Back to Home Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Button>

        {/* Center: Logo */}
        <Link href="/" className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <span className="text-xl font-semibold tracking-tight">LeadSite AI</span>
        </Link>

        {/* Right: Other Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">JD</div>
        </div>
      </div>
    </header>
  )
}
