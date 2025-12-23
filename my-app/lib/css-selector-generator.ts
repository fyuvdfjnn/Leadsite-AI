/**
 * CSS 选择器生成器
 * 为选中的元素生成稳定的 CSS 选择器
 */

export interface SelectorOptions {
  preferDataAttributes?: boolean
  maxDepth?: number
  excludeClasses?: string[]
}

/**
 * 生成元素的唯一 CSS 选择器
 */
export function generateCssSelector(
  element: HTMLElement,
  options: SelectorOptions = {}
): string {
  const {
    preferDataAttributes = true,
    maxDepth = 5,
    excludeClasses = ['hover', 'active', 'focus', 'selected'],
  } = options

  // 优先使用 data-component 属性
  if (preferDataAttributes) {
    const dataComponent = element.getAttribute('data-component')
    if (dataComponent) {
      return `[data-component="${dataComponent}"]`
    }

    const dataId = element.getAttribute('data-id')
    if (dataId) {
      return `[data-id="${dataId}"]`
    }
  }

  // 使用 id
  if (element.id) {
    return `#${element.id}`
  }

  // 构建路径选择器
  const path: string[] = []
  let current: HTMLElement | null = element
  let depth = 0

  while (current && depth < maxDepth) {
    if (current.tagName.toLowerCase() === 'body') break

    let selector = current.tagName.toLowerCase()

    // 添加 data-component
    const dataComponent = current.getAttribute('data-component')
    if (dataComponent) {
      selector += `[data-component="${dataComponent}"]`
      path.unshift(selector)
      break // data-component 足够唯一
    }

    // 添加 id
    if (current.id) {
      path.unshift(`#${current.id}`)
      break // id 是唯一的
    }

    // 添加类名（排除动态类）
    const classes = Array.from(current.classList)
      .filter(cls => !excludeClasses.some(exclude => cls.includes(exclude)))
      .slice(0, 2) // 最多使用 2 个类
    
    if (classes.length > 0) {
      selector += `.${classes.join('.')}`
    }

    // 添加 nth-child 确保唯一性
    const parent = current.parentElement
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === current!.tagName
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        selector += `:nth-of-type(${index})`
      }
    }

    path.unshift(selector)
    current = current.parentElement
    depth++
  }

  return path.join(' > ')
}

/**
 * 验证选择器是否唯一匹配目标元素
 */
export function validateSelector(selector: string, element: HTMLElement): boolean {
  try {
    const matches = document.querySelectorAll(selector)
    return matches.length === 1 && matches[0] === element
  } catch {
    return false
  }
}

/**
 * 获取元素的简短描述
 */
export function getElementDescription(element: HTMLElement): string {
  const dataComponent = element.getAttribute('data-component')
  if (dataComponent) {
    return dataComponent.charAt(0).toUpperCase() + dataComponent.slice(1)
  }

  const tagName = element.tagName.toLowerCase()
  const tagLabels: Record<string, string> = {
    // 容器元素
    header: 'Header',
    main: 'Main',
    aside: 'Aside',
    article: 'Article',
    nav: 'Navigation',
    section: 'Section',
    footer: 'Footer',
    // 交互元素
    button: 'Button',
    a: 'Link',
    input: 'Input',
    textarea: 'Textarea',
    select: 'Select',
    // 文本元素
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    p: 'Paragraph',
    span: 'Text',
    label: 'Label',
    // 列表元素
    ul: 'List',
    ol: 'Ordered List',
    li: 'List Item',
    // 媒体元素
    img: 'Image',
    video: 'Video',
    audio: 'Audio',
    svg: 'SVG',
    // 容器
    div: 'Div',
    form: 'Form',
    table: 'Table',
    tr: 'Row',
    td: 'Cell',
    th: 'Header Cell',
  }

  return tagLabels[tagName] || tagName.toUpperCase()
}

