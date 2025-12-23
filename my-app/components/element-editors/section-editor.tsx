"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
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
  Paintbrush, 
  Image, 
  Video,
  Palette,
  ArrowRight,
  ArrowDown,
  ArrowUpRight
} from "lucide-react"
import type { SectionConfig, BackgroundType, GradientDirection, MaxWidth } from "@/types/element-configs"

interface SectionEditorProps {
  element: HTMLElement
  onUpdate: (config: SectionConfig) => void
  initialConfig?: SectionConfig
}

const spacingOptions = [
  { value: '16px', label: '小 (16px)' },
  { value: '32px', label: '中 (32px)' },
  { value: '48px', label: '大 (48px)' },
  { value: '64px', label: '特大 (64px)' },
  { value: '96px', label: '超大 (96px)' },
]

const maxWidthOptions = [
  { value: 'full', label: '全宽' },
  { value: 'xl', label: 'xl (1280px)' },
  { value: '2xl', label: '2xl (1536px)' },
  { value: '4xl', label: '4xl (896px)' },
  { value: '5xl', label: '5xl (1024px)' },
  { value: '6xl', label: '6xl (1152px)' },
]

const gradientDirections: { value: GradientDirection; label: string; icon: React.ReactNode }[] = [
  { value: 'to-r', label: '向右', icon: <ArrowRight className="w-3 h-3" /> },
  { value: 'to-l', label: '向左', icon: <ArrowRight className="w-3 h-3 rotate-180" /> },
  { value: 'to-b', label: '向下', icon: <ArrowDown className="w-3 h-3" /> },
  { value: 'to-t', label: '向上', icon: <ArrowDown className="w-3 h-3 rotate-180" /> },
  { value: 'to-br', label: '右下', icon: <ArrowUpRight className="w-3 h-3 rotate-90" /> },
  { value: 'to-bl', label: '左下', icon: <ArrowUpRight className="w-3 h-3 rotate-180" /> },
]

export function SectionEditor({ element, onUpdate, initialConfig }: SectionEditorProps) {
  const [config, setConfig] = useState<SectionConfig>(() => {
    // 从元素读取初始配置
    const computedStyle = window.getComputedStyle(element)
    const bgColor = computedStyle.backgroundColor
    const bgImage = computedStyle.backgroundImage
    
    return initialConfig || {
      background: {
        type: 'color',
        color: bgColor || '#ffffff',
        gradient: {
          from: '#3b82f6',
          to: '#8b5cf6',
          direction: 'to-r',
        },
        overlay: {
          enabled: false,
          color: '#000000',
          opacity: 50,
        },
        position: 'center',
        size: 'cover',
      },
      spacing: {
        paddingTop: '64px',
        paddingBottom: '64px',
      },
      maxWidth: '6xl',
    }
  })

  const updateConfig = (updates: Partial<SectionConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onUpdate(newConfig)
    applyConfigToElement(newConfig)
  }

  const updateBackground = (bgUpdates: Partial<SectionConfig['background']>) => {
    const newConfig = {
      ...config,
      background: { ...config.background, ...bgUpdates }
    }
    setConfig(newConfig)
    onUpdate(newConfig)
    applyConfigToElement(newConfig)
  }

  const updateGradient = (gradientUpdates: Partial<NonNullable<SectionConfig['background']['gradient']>>) => {
    const newConfig = {
      ...config,
      background: {
        ...config.background,
        gradient: { ...config.background.gradient!, ...gradientUpdates }
      }
    }
    setConfig(newConfig)
    onUpdate(newConfig)
    applyConfigToElement(newConfig)
  }

  const updateOverlay = (overlayUpdates: Partial<NonNullable<SectionConfig['background']['overlay']>>) => {
    const newConfig = {
      ...config,
      background: {
        ...config.background,
        overlay: { ...config.background.overlay!, ...overlayUpdates }
      }
    }
    setConfig(newConfig)
    onUpdate(newConfig)
    applyConfigToElement(newConfig)
  }

  const updateSpacing = (spacingUpdates: Partial<SectionConfig['spacing']>) => {
    const newConfig = {
      ...config,
      spacing: { ...config.spacing, ...spacingUpdates }
    }
    setConfig(newConfig)
    onUpdate(newConfig)
    applyConfigToElement(newConfig)
  }

  // 应用配置到 DOM 元素
  const applyConfigToElement = (cfg: SectionConfig) => {
    const bg = cfg.background

    // 应用背景
    switch (bg.type) {
      case 'color':
        element.style.backgroundImage = 'none'
        element.style.backgroundColor = bg.color || '#ffffff'
        break
      case 'gradient':
        if (bg.gradient) {
          const direction = bg.gradient.direction.replace('-', ' ')
          element.style.backgroundImage = `linear-gradient(${direction}, ${bg.gradient.from}, ${bg.gradient.to})`
          element.style.backgroundColor = ''
        }
        break
      case 'image':
        if (bg.imageUrl) {
          element.style.backgroundImage = `url(${bg.imageUrl})`
          element.style.backgroundSize = bg.size || 'cover'
          element.style.backgroundPosition = bg.position || 'center'
          element.style.backgroundRepeat = 'no-repeat'
        }
        break
      case 'video':
        // 视频背景需要添加 video 元素，这里简化处理
        break
    }

    // 应用遮罩层
    if (bg.type === 'image' && bg.overlay?.enabled) {
      // 使用伪元素或额外的 div 实现遮罩
      const overlayColor = bg.overlay.color || '#000000'
      const opacity = (bg.overlay.opacity || 50) / 100
      element.style.position = 'relative'
      
      // 创建或更新遮罩层
      let overlayEl = element.querySelector('.section-overlay') as HTMLElement
      if (!overlayEl) {
        overlayEl = document.createElement('div')
        overlayEl.className = 'section-overlay'
        overlayEl.style.cssText = `
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        `
        element.style.position = 'relative'
        element.prepend(overlayEl)
      }
      overlayEl.style.backgroundColor = overlayColor
      overlayEl.style.opacity = opacity.toString()
    } else {
      // 移除遮罩层
      const overlayEl = element.querySelector('.section-overlay')
      if (overlayEl) {
        overlayEl.remove()
      }
    }

    // 应用间距
    element.style.paddingTop = cfg.spacing.paddingTop
    element.style.paddingBottom = cfg.spacing.paddingBottom

    // 应用最大宽度到内部容器
    const container = element.querySelector('.max-w-4xl, .max-w-5xl, .max-w-6xl, .max-w-7xl, .container') as HTMLElement
    if (container) {
      // 移除所有 max-w 类
      container.className = container.className.replace(/max-w-\w+/g, '')
      if (cfg.maxWidth !== 'full') {
        container.classList.add(`max-w-${cfg.maxWidth}`)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="background">
        {/* 背景设置 */}
        <AccordionItem value="background">
          <AccordionTrigger className="text-sm font-medium">
            背景设置
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <Label>背景类型</Label>
              <RadioGroup
                value={config.background.type}
                onValueChange={(value: BackgroundType) => updateBackground({ type: value })}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="color" id="bg-color" />
                  <Label htmlFor="bg-color" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Paintbrush className="w-4 h-4 text-muted-foreground" />
                    纯色
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gradient" id="bg-gradient" />
                  <Label htmlFor="bg-gradient" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    渐变
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="bg-image" />
                  <Label htmlFor="bg-image" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Image className="w-4 h-4 text-muted-foreground" />
                    图片
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="bg-video" />
                  <Label htmlFor="bg-video" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    视频
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 纯色背景 */}
            {config.background.type === 'color' && (
              <ColorPicker
                label="背景颜色"
                value={config.background.color || '#ffffff'}
                onChange={(color) => updateBackground({ color })}
              />
            )}

            {/* 渐变背景 */}
            {config.background.type === 'gradient' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label="起始颜色"
                    value={config.background.gradient?.from || '#3b82f6'}
                    onChange={(color) => updateGradient({ from: color })}
                  />
                  <ColorPicker
                    label="结束颜色"
                    value={config.background.gradient?.to || '#8b5cf6'}
                    onChange={(color) => updateGradient({ to: color })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>渐变方向</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {gradientDirections.map((dir) => (
                      <button
                        key={dir.value}
                        onClick={() => updateGradient({ direction: dir.value })}
                        className={`
                          flex items-center justify-center gap-1 px-2 py-2 text-xs rounded-md border-2 transition-all
                          ${config.background.gradient?.direction === dir.value 
                            ? 'border-primary bg-primary/10' 
                            : 'border-transparent bg-muted hover:bg-muted/80'
                          }
                        `}
                      >
                        {dir.icon}
                        {dir.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 渐变预览 */}
                <div 
                  className="h-16 rounded-lg border"
                  style={{
                    background: `linear-gradient(${config.background.gradient?.direction.replace('-', ' ')}, ${config.background.gradient?.from}, ${config.background.gradient?.to})`
                  }}
                />
              </div>
            )}

            {/* 图片背景 */}
            {config.background.type === 'image' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>上传背景图</Label>
                  <FileUpload
                    accept="image/*"
                    maxSize={10 * 1024 * 1024} // 10MB
                    value={config.background.imageUrl}
                    onUpload={(url) => updateBackground({ imageUrl: url })}
                    placeholder="上传背景图片"
                  />
                </div>

                {config.background.imageUrl && (
                  <>
                    <div className="space-y-2">
                      <Label>图片位置</Label>
                      <Select
                        value={config.background.position || 'center'}
                        onValueChange={(value: any) => updateBackground({ position: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center">居中</SelectItem>
                          <SelectItem value="top">顶部</SelectItem>
                          <SelectItem value="bottom">底部</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>图片尺寸</Label>
                      <Select
                        value={config.background.size || 'cover'}
                        onValueChange={(value: any) => updateBackground({ size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">覆盖</SelectItem>
                          <SelectItem value="contain">包含</SelectItem>
                          <SelectItem value="auto">自动</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 遮罩层 */}
                    <div className="space-y-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="overlay" className="font-normal">遮罩层</Label>
                        <Switch
                          id="overlay"
                          checked={config.background.overlay?.enabled || false}
                          onCheckedChange={(checked) => updateOverlay({ enabled: checked })}
                        />
                      </div>

                      {config.background.overlay?.enabled && (
                        <>
                          <ColorPicker
                            label="遮罩颜色"
                            value={config.background.overlay?.color || '#000000'}
                            onChange={(color) => updateOverlay({ color })}
                          />

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="font-normal">透明度</Label>
                              <span className="text-sm text-muted-foreground">
                                {config.background.overlay?.opacity || 50}%
                              </span>
                            </div>
                            <Slider
                              value={[config.background.overlay?.opacity || 50]}
                              onValueChange={([value]) => updateOverlay({ opacity: value })}
                              min={0}
                              max={100}
                              step={5}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 视频背景 */}
            {config.background.type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="video-url">视频链接</Label>
                <Input
                  id="video-url"
                  type="url"
                  value={config.background.videoUrl || ''}
                  onChange={(e) => updateBackground({ videoUrl: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
                <p className="text-xs text-muted-foreground">
                  支持 MP4、WebM 格式视频
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 间距设置 */}
        <AccordionItem value="spacing">
          <AccordionTrigger className="text-sm font-medium">
            间距设置
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>上边距</Label>
              <Select
                value={config.spacing.paddingTop}
                onValueChange={(value) => updateSpacing({ paddingTop: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {spacingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>下边距</Label>
              <Select
                value={config.spacing.paddingBottom}
                onValueChange={(value) => updateSpacing({ paddingBottom: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {spacingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>最大宽度</Label>
              <Select
                value={config.maxWidth}
                onValueChange={(value: MaxWidth) => updateConfig({ maxWidth: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maxWidthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}











