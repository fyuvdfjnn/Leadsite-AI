"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { 
  Link, 
  ExternalLink, 
  ArrowDown, 
  MousePointer2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Download
} from "lucide-react"
import type { ButtonConfig, LinkType, ButtonVariant, ButtonSize } from "@/types/element-configs"

interface ButtonEditorProps {
  element: HTMLElement
  onUpdate: (config: ButtonConfig) => void
  initialConfig?: ButtonConfig
}

const iconOptions = [
  { value: 'none', label: '无图标' },
  { value: 'ArrowRight', label: '箭头右 →' },
  { value: 'ArrowLeft', label: '箭头左 ←' },
  { value: 'ChevronRight', label: '尖角右 >' },
  { value: 'ExternalLink', label: '外部链接 ↗' },
  { value: 'Download', label: '下载 ↓' },
]

const pageOptions = [
  { value: 'home', label: '首页' },
  { value: 'products', label: '产品页' },
  { value: 'about', label: '关于我们' },
  { value: 'contact', label: '联系我们' },
]

export function ButtonEditor({ element, onUpdate, initialConfig }: ButtonEditorProps) {
  const [config, setConfig] = useState<ButtonConfig>(() => {
    // 从元素读取初始配置
    const text = element.textContent?.trim() || 'Button'
    const href = element.getAttribute('href') || element.closest('a')?.getAttribute('href') || ''
    
    return initialConfig || {
      text,
      linkType: href ? 'external' : 'none',
      linkUrl: href,
      openNewTab: false,
      style: {
        variant: 'primary',
        size: 'md',
      }
    }
  })

  // 更新配置并应用到元素
  const updateConfig = (updates: Partial<ButtonConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onUpdate(newConfig)
    
    // 实时应用到元素
    applyConfigToElement(newConfig)
  }

  const updateStyle = (styleUpdates: Partial<ButtonConfig['style']>) => {
    const newConfig = {
      ...config,
      style: { ...config.style, ...styleUpdates }
    }
    setConfig(newConfig)
    onUpdate(newConfig)
    applyConfigToElement(newConfig)
  }

  // 应用配置到 DOM 元素
  const applyConfigToElement = (cfg: ButtonConfig) => {
    // 更新文字
    if (cfg.text) {
      element.textContent = cfg.text
    }

    // 处理链接
    const parentLink = element.closest('a')
    if (cfg.linkType !== 'none' && cfg.linkUrl) {
      if (parentLink) {
        parentLink.setAttribute('href', cfg.linkUrl)
        if (cfg.openNewTab) {
          parentLink.setAttribute('target', '_blank')
          parentLink.setAttribute('rel', 'noopener noreferrer')
        } else {
          parentLink.removeAttribute('target')
          parentLink.removeAttribute('rel')
        }
      } else {
        // 存储链接信息到 data 属性
        element.setAttribute('data-href', cfg.linkUrl)
        element.setAttribute('data-link-type', cfg.linkType)
        if (cfg.openNewTab) {
          element.setAttribute('data-new-tab', 'true')
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="content">
        {/* 内容设置 */}
        <AccordionItem value="content">
          <AccordionTrigger className="text-sm font-medium">
            内容设置
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="button-text">按钮文字</Label>
              <Input
                id="button-text"
                value={config.text}
                onChange={(e) => updateConfig({ text: e.target.value })}
                placeholder="输入按钮文字"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 链接设置 */}
        <AccordionItem value="link">
          <AccordionTrigger className="text-sm font-medium">
            链接设置
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <Label>跳转类型</Label>
              <RadioGroup
                value={config.linkType}
                onValueChange={(value: LinkType) => updateConfig({ linkType: value })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="link-none" />
                  <Label htmlFor="link-none" className="flex items-center gap-2 font-normal cursor-pointer">
                    <MousePointer2 className="w-4 h-4 text-muted-foreground" />
                    无跳转
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="external" id="link-external" />
                  <Label htmlFor="link-external" className="flex items-center gap-2 font-normal cursor-pointer">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    外部链接
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internal" id="link-internal" />
                  <Label htmlFor="link-internal" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Link className="w-4 h-4 text-muted-foreground" />
                    内部页面
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scroll" id="link-scroll" />
                  <Label htmlFor="link-scroll" className="flex items-center gap-2 font-normal cursor-pointer">
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                    滚动到区域
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 外部链接输入 */}
            {config.linkType === 'external' && (
              <div className="space-y-2">
                <Label htmlFor="link-url">链接地址</Label>
                <Input
                  id="link-url"
                  type="url"
                  value={config.linkUrl || ''}
                  onChange={(e) => updateConfig({ linkUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* 内部页面选择 */}
            {config.linkType === 'internal' && (
              <div className="space-y-2">
                <Label>选择页面</Label>
                <Select
                  value={config.linkPage || ''}
                  onValueChange={(value) => updateConfig({ linkPage: value, linkUrl: `/${value}` })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择页面" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageOptions.map((page) => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 滚动目标 */}
            {config.linkType === 'scroll' && (
              <div className="space-y-2">
                <Label htmlFor="scroll-target">滚动目标 ID</Label>
                <Input
                  id="scroll-target"
                  value={config.scrollTarget || ''}
                  onChange={(e) => updateConfig({ scrollTarget: e.target.value, linkUrl: `#${e.target.value}` })}
                  placeholder="section-id"
                />
                <p className="text-xs text-muted-foreground">
                  输入目标区域的 ID，点击按钮将滚动到该区域
                </p>
              </div>
            )}

            {/* 新标签页打开 */}
            {config.linkType !== 'none' && config.linkType !== 'scroll' && (
              <div className="flex items-center justify-between">
                <Label htmlFor="new-tab" className="font-normal">
                  在新标签页打开
                </Label>
                <Switch
                  id="new-tab"
                  checked={config.openNewTab}
                  onCheckedChange={(checked) => updateConfig({ openNewTab: checked })}
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 样式设置 */}
        <AccordionItem value="style">
          <AccordionTrigger className="text-sm font-medium">
            样式设置
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>按钮样式</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['primary', 'secondary', 'outline', 'ghost'] as ButtonVariant[]).map((variant) => (
                  <button
                    key={variant}
                    onClick={() => updateStyle({ variant })}
                    className={`
                      px-3 py-2 text-sm rounded-md border-2 transition-all capitalize
                      ${config.style.variant === variant 
                        ? 'border-primary bg-primary/10' 
                        : 'border-transparent bg-muted hover:bg-muted/80'
                      }
                    `}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>按钮大小</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['sm', 'md', 'lg'] as ButtonSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateStyle({ size })}
                    className={`
                      px-3 py-2 text-sm rounded-md border-2 transition-all uppercase
                      ${config.style.size === size 
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

            <div className="space-y-2">
              <Label>图标</Label>
              <Select
                value={config.style.icon || 'none'}
                onValueChange={(value) => updateStyle({ icon: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择图标" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.style.icon && config.style.icon !== 'none' && (
              <div className="space-y-2">
                <Label>图标位置</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStyle({ iconPosition: 'left' })}
                    className={`
                      px-3 py-2 text-sm rounded-md border-2 transition-all
                      ${config.style.iconPosition === 'left' || !config.style.iconPosition
                        ? 'border-primary bg-primary/10' 
                        : 'border-transparent bg-muted hover:bg-muted/80'
                      }
                    `}
                  >
                    左侧
                  </button>
                  <button
                    onClick={() => updateStyle({ iconPosition: 'right' })}
                    className={`
                      px-3 py-2 text-sm rounded-md border-2 transition-all
                      ${config.style.iconPosition === 'right'
                        ? 'border-primary bg-primary/10' 
                        : 'border-transparent bg-muted hover:bg-muted/80'
                      }
                    `}
                  >
                    右侧
                  </button>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}











