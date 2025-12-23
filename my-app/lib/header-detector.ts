/**
 * Header 模块识别工具
 * 通过 DOM 结构、自定义属性等方式识别 Header 模块
 */

export interface HeaderElement {
  element: HTMLElement
  type: 'header' | 'nav' | 'navigation'
  title?: string
  boundingRect: DOMRect
}

/**
 * 识别元素是否为 Header 模块
 */
export function detectHeaderElement(element: HTMLElement | null): HeaderElement | null {
  if (!element) return null

  // 方法1: 通过 data-component 属性识别
  const dataComponent = element.getAttribute('data-component')
  if (dataComponent === 'header' || dataComponent === 'navigation') {
    return {
      element,
      type: dataComponent === 'header' ? 'header' : 'navigation',
      boundingRect: element.getBoundingClientRect(),
    }
  }

  // 方法2: 通过标签名识别
  const tagName = element.tagName.toLowerCase()
  if (tagName === 'header' || tagName === 'nav') {
    return {
      element,
      type: tagName === 'header' ? 'header' : 'navigation',
      boundingRect: element.getBoundingClientRect(),
    }
  }

  // 方法3: 通过类名识别（常见模式）
  const className = element.className
  if (typeof className === 'string') {
    const classNames = className.toLowerCase()
    if (
      classNames.includes('header') ||
      classNames.includes('navigation') ||
      classNames.includes('navbar') ||
      classNames.includes('nav-bar')
    ) {
      return {
        element,
        type: 'header',
        boundingRect: element.getBoundingClientRect(),
      }
    }
  }

  // 方法4: 向上查找父元素
  let parent = element.parentElement
  let depth = 0
  while (parent && depth < 5) {
    const parentDataComponent = parent.getAttribute('data-component')
    const parentTagName = parent.tagName.toLowerCase()
    
    if (parentDataComponent === 'header' || parentDataComponent === 'navigation') {
      return {
        element: parent,
        type: parentDataComponent === 'header' ? 'header' : 'navigation',
        boundingRect: parent.getBoundingClientRect(),
      }
    }
    
    if (parentTagName === 'header' || parentTagName === 'nav') {
      return {
        element: parent,
        type: parentTagName === 'header' ? 'header' : 'navigation',
        boundingRect: parent.getBoundingClientRect(),
      }
    }
    
    parent = parent.parentElement
    depth++
  }

  return null
}

/**
 * 从点击事件中获取目标元素
 */
export function getElementFromEvent(event: MouseEvent | React.MouseEvent): HTMLElement | null {
  if (event.target instanceof HTMLElement) {
    return event.target
  }
  return null
}

/**
 * 从选择区域中获取目标元素
 */
export function getElementFromSelection(): HTMLElement | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)
  const container = range.commonAncestorContainer

  if (container instanceof HTMLElement) {
    return container
  }

  if (container.parentElement instanceof HTMLElement) {
    return container.parentElement
  }

  return null
}











