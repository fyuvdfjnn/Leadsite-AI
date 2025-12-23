"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FileUpload } from "@/components/ui/file-upload"
import { ColorPicker } from "@/components/ui/color-picker"
import { 
  Image, 
  Type, 
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignJustify
} from "lucide-react"
import type { HeaderConfig, LogoType, HeaderLayout } from "@/types/element-configs"

interface HeaderEditorProps {
  element: HTMLElement
  onUpdate: (config: HeaderConfig) => void
  initialConfig?: HeaderConfig
}

export function HeaderEditor({ element, onUpdate, initialConfig }: HeaderEditorProps) {
  const [config, setConfig] = useState<HeaderConfig>(() => {
    // 从元素读取初始配置
    const logoElement = element.querySelector('img, svg, [data-logo]')
    const siteNameElement = element.querySelector('[data-site-name], .font-semibold, .font-bold')
    
    return initialConfig || {
      logo: {
        type: 'text' as LogoType,
        text: siteNameElement?.textContent || 'Logo',
        imageUrl: logoElement?.getAttribute('src') || '',
        size: 'md',
      },
      siteName: siteNameElement?.textContent || 'My Website',
      navigation: [],
      layout: 'left',
      sticky: false,
      transparent: false,
    }
  })

  const updateConfig = (updates: Partial<HeaderConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onUpdate(newConfig)
    applyConfigToElement(newConfig)
  }

  const updateLogo = (logoUpdates: Partial<HeaderConfig['logo']>) => {
    const newConfig = {
      ...config,
      logo: { ...config.logo, ...logoUpdates }
    }
    setConfig(newConfig)
    onUpdate(newConfig)
    applyConfigToElement(newConfig)
  }

  // 应用配置到 DOM 元素
  const applyConfigToElement = (cfg: HeaderConfig) => {
    // 更新 Logo
    const logoContainer = element.querySelector('[data-logo], .logo, img') as HTMLElement
    
    if (cfg.logo.type === 'image' && cfg.logo.imageUrl) {
      // 如果有图片 logo，尝试更新或创建 img 元素
      let imgElement = element.querySelector('img') as HTMLImageElement
      if (!imgElement) {
        // 查找 logo 容器
        const container = element.querySelector('.flex.items-center.gap-2') as HTMLElement
        if (container) {
          imgElement = document.createElement('img')
          imgElement.className = 'h-8 w-8 object-contain'
          container.prepend(imgElement)
        }
      }
      if (imgElement) {
        imgElement.src = cfg.logo.imageUrl
        imgElement.alt = cfg.siteName
      }
    }

    // 更新网站名称
    const siteNameElement = element.querySelector('.font-semibold, .font-bold, [data-site-name]')
    if (siteNameElement && cfg.siteName) {
      siteNameElement.textContent = cfg.siteName
    }

    // 更新布局
    if (cfg.layout === 'center') {
      element.style.justifyContent = 'center'
    } else if (cfg.layout === 'split') {
      element.style.justifyContent = 'space-between'
    } else {
      element.style.justifyContent = 'flex-start'
    }

    // 更新固定和透明
    if (cfg.sticky) {
      element.style.position = 'sticky'
      element.style.top = '0'
      element.style.zIndex = '50'
    } else {
      element.style.position = ''
      element.style.top = ''
    }

    if (cfg.transparent) {
      element.style.backgroundColor = 'transparent'
    } else if (cfg.backgroundColor) {
      element.style.backgroundColor = cfg.backgroundColor
    }
  }

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="logo">
        {/* Logo 设置 */}
        <AccordionItem value="logo">
          <AccordionTrigger className="text-sm font-medium">
            Logo 设置
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <Label>Logo 类型</Label>
              <RadioGroup
                value={config.logo.type}
                onValueChange={(value: LogoType) => updateLogo({ type: value })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="logo-image" />
                  <Label htmlFor="logo-image" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Image className="w-4 h-4 text-muted-foreground" />
                    图片 Logo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="logo-text" />
                  <Label htmlFor="logo-text" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Type className="w-4 h-4 text-muted-foreground" />
                    文字 Logo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="icon" id="logo-icon" />
                  <Label htmlFor="logo-icon" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    图标 Logo
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 图片上传 */}
            {config.logo.type === 'image' && (
              <div className="space-y-2">
                <Label>上传 Logo</Label>
                <FileUpload
                  accept="image/*"
                  value={config.logo.imageUrl}
                  onUpload={(url) => updateLogo({ imageUrl: url })}
                  placeholder="上传 Logo 图片"
                />
                <p className="text-xs text-muted-foreground">
                  建议尺寸: 200x50px，支持 PNG、SVG 格式
                </p>
              </div>
            )}

            {/* 文字 Logo */}
            {config.logo.type === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="logo-text-input">Logo 文字</Label>
                <Input
                  id="logo-text-input"
                  value={config.logo.text || ''}
                  onChange={(e) => updateLogo({ text: e.target.value })}
                  placeholder="输入 Logo 文字"
                />
              </div>
            )}

            {/* Logo 大小 */}
            <div className="space-y-2">
              <Label>Logo 大小</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateLogo({ size })}
                    className={`
                      px-3 py-2 text-sm rounded-md border-2 transition-all uppercase
                      ${config.logo.size === size 
                        ? 'border-primary bg-primary/10' 
                        : 'border-transparent bg-muted hover:bg-muted/80'
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 基本信息 */}
        <AccordionItem value="basic">
          <AccordionTrigger className="text-sm font-medium">
            基本信息
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">网站名称</Label>
              <Input
                id="site-name"
                value={config.siteName}
                onChange={(e) => updateConfig({ siteName: e.target.value })}
                placeholder="输入网站名称"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 布局设置 */}
        <AccordionItem value="layout">
          <AccordionTrigger className="text-sm font-medium">
            布局设置
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>导航布局</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateConfig({ layout: 'left' })}
                  className={`
                    flex flex-col items-center gap-1 px-3 py-3 text-xs rounded-md border-2 transition-all
                    ${config.layout === 'left' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-transparent bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  <AlignLeft className="w-4 h-4" />
                  左对齐
                </button>
                <button
                  onClick={() => updateConfig({ layout: 'center' })}
                  className={`
                    flex flex-col items-center gap-1 px-3 py-3 text-xs rounded-md border-2 transition-all
                    ${config.layout === 'center' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-transparent bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  <AlignCenter className="w-4 h-4" />
                  居中
                </button>
                <button
                  onClick={() => updateConfig({ layout: 'split' })}
                  className={`
                    flex flex-col items-center gap-1 px-3 py-3 text-xs rounded-md border-2 transition-all
                    ${config.layout === 'split' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-transparent bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  <AlignJustify className="w-4 h-4" />
                  分散
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sticky" className="font-normal">固定顶部</Label>
                  <p className="text-xs text-muted-foreground">滚动时保持在页面顶部</p>
                </div>
                <Switch
                  id="sticky"
                  checked={config.sticky}
                  onCheckedChange={(checked) => updateConfig({ sticky: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="transparent" className="font-normal">透明背景</Label>
                  <p className="text-xs text-muted-foreground">导航栏背景透明</p>
                </div>
                <Switch
                  id="transparent"
                  checked={config.transparent}
                  onCheckedChange={(checked) => updateConfig({ transparent: checked })}
                />
              </div>
            </div>

            {!config.transparent && (
              <ColorPicker
                label="背景颜色"
                value={config.backgroundColor || '#ffffff'}
                onChange={(color) => updateConfig({ backgroundColor: color })}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}











