/**
 * 通用元素识别工具
 * 类似 Cursor 的 select element 功能
 */

export type ElementType = 'header' | 'nav' | 'button' | 'section' | 'text' | 'image' | 'link' | 'input' | 'container' | 'list' | 'listItem' | 'footer' | 'unknown'

export interface DetectedElement {
  element: HTMLElement
  type: ElementType
  tagName: string
  boundingRect: DOMRect
  attributes: Record<string, string>
}

/**
 * 识别元素类型
 */
export function detectElementType(element: HTMLElement): ElementType {
  const tagName = element.tagName.toLowerCase()
  const dataComponent = element.getAttribute('data-component')
  const className = element.className?.toString().toLowerCase() || ''

  // 优先级1: 通过 data-component 属性识别（最高优先级）
  if (dataComponent) {
    if (dataComponent === 'header' || dataComponent === 'navigation' || dataComponent === 'nav') return 'header'
    if (dataComponent === 'button') return 'button'
    if (dataComponent === 'section' || dataComponent === 'hero' || dataComponent === 'features' || dataComponent === 'cta') return 'section'
    if (dataComponent === 'link') return 'link'
    if (dataComponent === 'image' || dataComponent === 'img') return 'image'
    if (dataComponent === 'text') return 'text'
    if (dataComponent === 'footer') return 'footer'
    if (dataComponent === 'input') return 'input'
    if (dataComponent === 'container') return 'container'
    // 任何其他 data-component 都视为 section
    return 'section'
  }

  // 优先级2: 通过标签名识别
  // 按钮
  if (tagName === 'button') return 'button'
  
  // 链接
  if (tagName === 'a') return 'link'
  
  // 图片
  if (tagName === 'img' || tagName === 'picture' || tagName === 'svg') return 'image'
  
  // 输入元素
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return 'input'
  
  // 标题和段落 - 文本
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'label', 'span'].includes(tagName)) return 'text'
  
  // 列表
  if (tagName === 'ul' || tagName === 'ol') return 'list'
  if (tagName === 'li') return 'listItem'
  
  // 大型容器
  if (tagName === 'header' || tagName === 'nav') return 'header'
  if (tagName === 'footer') return 'footer'
  if (tagName === 'section' || tagName === 'article' || tagName === 'main' || tagName === 'aside') return 'section'
  
  // 优先级3: 通过类名模式识别
  if (className.includes('button') || className.includes('btn')) return 'button'
  if (className.includes('link')) return 'link'
  if (className.includes('header') || className.includes('nav')) return 'header'
  if (className.includes('footer')) return 'footer'
  
  // div 识别为容器
  if (tagName === 'div') {
    // 如果有类名或 id，识别为容器
    if (element.className || element.id) {
      return 'container'
    }
    // 如果只包含文本，识别为文本
    if (element.children.length === 0 && element.textContent?.trim()) {
      return 'text'
    }
    return 'container'
  }

  // 其他元素识别为容器
  return 'container'
}

/**
 * 识别点击的元素
 */
export function detectElementFromEvent(event: MouseEvent | React.MouseEvent): DetectedElement | null {
  let target: HTMLElement | null = null
  
  if (event.target instanceof HTMLElement) {
    target = event.target
  } else if (event.currentTarget instanceof HTMLElement) {
    target = event.currentTarget
  } else if (event.target && 'parentElement' in event.target && event.target.parentElement instanceof HTMLElement) {
    // 处理文本节点的情况
    target = event.target.parentElement
  }
  
  if (!target) return null

  return detectElement(target)
}

/**
 * 识别元素（包括向上查找）
 */
export function detectElement(element: HTMLElement | null, maxDepth: number = 5): DetectedElement | null {
  if (!element) return null

  let current: HTMLElement | null = element
  let depth = 0
  let bestMatch: DetectedElement | null = null
  let bestPriority = -1

  // 优先级：button/link > input > header/nav > section > image > text > container > unknown
  const typePriority: Record<ElementType, number> = {
    button: 12,
    link: 11,
    input: 10,
    header: 9,
    nav: 9,
    footer: 8,
    section: 7,
    image: 6,
    text: 5,
    listItem: 4,
    list: 3,
    container: 2,
    unknown: 0,
  }

  while (current && depth < maxDepth) {
    const type = detectElementType(current)
    const priority = typePriority[type] || 0
    
    // 如果找到高优先级类型，立即返回（不再向上查找）
    if (type === 'button' || type === 'link' || type === 'input' || type === 'image') {
      const attributes: Record<string, string> = {}
      Array.from(current.attributes).forEach(attr => {
        attributes[attr.name] = attr.value
      })

      return {
        element: current,
        type,
        tagName: current.tagName.toLowerCase(),
        boundingRect: current.getBoundingClientRect(),
        attributes,
      }
    }
    
    // 记录最佳匹配
    if (priority > bestPriority) {
      const attributes: Record<string, string> = {}
      Array.from(current.attributes).forEach(attr => {
        attributes[attr.name] = attr.value
      })

      bestMatch = {
        element: current,
        type,
        tagName: current.tagName.toLowerCase(),
        boundingRect: current.getBoundingClientRect(),
        attributes,
      }
      bestPriority = priority
    }

    // 向上查找
    current = current.parentElement
    depth++
  }

  // 返回最佳匹配，如果没有则返回原始元素
  if (bestMatch && bestMatch.type !== 'unknown') {
    return bestMatch
  }

  // 如果都没找到，返回原始元素
  if (element) {
    const attributes: Record<string, string> = {}
    Array.from(element.attributes).forEach(attr => {
      attributes[attr.name] = attr.value
    })

    return {
      element,
      type: 'unknown',
      tagName: element.tagName.toLowerCase(),
      boundingRect: element.getBoundingClientRect(),
      attributes,
    }
  }

  return null
}

/**
 * 从选择区域识别元素
 */
export function detectElementFromSelection(): DetectedElement | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)
  const container = range.commonAncestorContainer

  if (container instanceof HTMLElement) {
    return detectElement(container)
  }

  if (container.parentElement instanceof HTMLElement) {
    return detectElement(container.parentElement)
  }

  return null
}

/**
 * 检查元素是否可编辑
 */
export function isElementEditable(element: HTMLElement): boolean {
  const type = detectElementType(element)
  return ['header', 'nav', 'button', 'text', 'link'].includes(type)
}

