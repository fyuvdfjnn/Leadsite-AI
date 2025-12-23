"use client"

import type { ActivePage } from "./preview-content"
import { Home, Package, Users, Mail, Settings, Plus, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditorSidebarProps {
  activePage: ActivePage
  setActivePage: (page: ActivePage) => void
}

const pages = [
  { id: "home", name: "Home", icon: Home },
  { id: "products", name: "Products", icon: Package },
  { id: "about", name: "About Us", icon: Users },
  { id: "contact", name: "Contact", icon: Mail },
] as const

export function EditorSidebar({ activePage, setActivePage }: EditorSidebarProps) {
  return (
    <aside className="w-64 bg-background border-r border-border p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Pages</h3>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Page List */}
      <div className="space-y-1 flex-1">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${
              activePage === page.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-50 cursor-grab" />
            <page.icon className="w-4 h-4" />
            <span>{page.name}</span>
          </button>
        ))}
      </div>

      {/* Page Thumbnails */}
      <div className="pt-4 border-t border-border mt-4">
        <h4 className="text-xs font-medium text-muted-foreground mb-3">Preview</h4>
        <div className="space-y-2">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`w-full aspect-video rounded-lg border-2 overflow-hidden transition-all ${
                activePage === page.id ? "border-foreground" : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <page.icon className="w-6 h-6 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="pt-4 border-t border-border mt-4">
        <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
          <Settings className="w-4 h-4" />
          Site Settings
        </Button>
      </div>
    </aside>
  )
}
