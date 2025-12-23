/**
 * 元素配置类型定义
 */

// Button 配置
export type LinkType = 'internal' | 'external' | 'scroll' | 'popup' | 'none'
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonConfig {
  text: string
  linkType: LinkType
  linkUrl?: string
  linkPage?: string
  scrollTarget?: string
  openNewTab?: boolean
  style: {
    variant: ButtonVariant
    size: ButtonSize
    icon?: string
    iconPosition?: 'left' | 'right'
  }
}

// Header 配置
export type LogoType = 'image' | 'text' | 'icon'
export type HeaderLayout = 'left' | 'center' | 'split'

export interface NavigationItem {
  id: string
  label: string
  href: string
  isExternal?: boolean
}

export interface HeaderConfig {
  logo: {
    type: LogoType
    imageUrl?: string
    text?: string
    iconName?: string
    size: 'sm' | 'md' | 'lg'
  }
  siteName: string
  navigation: NavigationItem[]
  layout: HeaderLayout
  sticky: boolean
  transparent: boolean
  backgroundColor?: string
}

// Section 配置
export type BackgroundType = 'color' | 'gradient' | 'image' | 'video'
export type GradientDirection = 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl'
export type MaxWidth = 'full' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl'

export interface SectionConfig {
  background: {
    type: BackgroundType
    color?: string
    gradient?: {
      from: string
      to: string
      direction: GradientDirection
    }
    imageUrl?: string
    videoUrl?: string
    overlay?: {
      enabled: boolean
      color: string
      opacity: number // 0-100
    }
    position?: 'center' | 'top' | 'bottom'
    size?: 'cover' | 'contain' | 'auto'
  }
  spacing: {
    paddingTop: string
    paddingBottom: string
  }
  maxWidth: MaxWidth
  textColor?: 'light' | 'dark' | 'auto'
}

// Image 配置
export interface ImageConfig {
  src: string
  alt: string
  width?: number
  height?: number
  objectFit: 'cover' | 'contain' | 'fill' | 'none'
  borderRadius?: string
  link?: {
    enabled: boolean
    url?: string
    openNewTab?: boolean
  }
}

// Link 配置
export interface LinkConfig {
  text: string
  href: string
  isExternal: boolean
  openNewTab: boolean
  style: {
    color?: string
    underline: boolean
    icon?: string
  }
}

// 统一配置存储
export interface ElementConfigMap {
  [elementId: string]: {
    type: string
    button?: ButtonConfig
    header?: HeaderConfig
    section?: SectionConfig
    image?: ImageConfig
    link?: LinkConfig
  }
}

// 默认配置
export const defaultButtonConfig: ButtonConfig = {
  text: 'Button',
  linkType: 'none',
  openNewTab: false,
  style: {
    variant: 'primary',
    size: 'md',
  }
}

export const defaultHeaderConfig: HeaderConfig = {
  logo: {
    type: 'text',
    text: 'Logo',
    size: 'md',
  },
  siteName: 'My Website',
  navigation: [],
  layout: 'left',
  sticky: false,
  transparent: false,
}

export const defaultSectionConfig: SectionConfig = {
  background: {
    type: 'color',
    color: '#ffffff',
  },
  spacing: {
    paddingTop: '64px',
    paddingBottom: '64px',
  },
  maxWidth: '6xl',
}











