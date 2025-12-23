/**
 * 元素状态管理器
 * 负责持久化存储、智能定位转换、响应式适配
 */

// ============ 类型定义 ============

export interface ElementPosition {
  x: number | string
  y: number | string
  unit: 'px' | '%'
}

export interface ElementSize {
  width: number | string
  height: number | string
  unit: 'px' | '%'
}

export interface ElementStyles {
  position: 'static' | 'relative' | 'absolute' | 'fixed'
  left?: string
  top?: string
  right?: string
  bottom?: string
  width?: string
  height?: string
  zIndex?: string
  transform?: string
  [key: string]: string | undefined
}

export interface ElementState {
  id: string
  pageId: string
  selector: string // CSS 选择器，用于恢复时定位元素
  originalTagName: string
  position: ElementPosition
  size?: ElementSize
  styles: ElementStyles
  parentSelector?: string // 父元素选择器
  responsive?: {
    mobile?: ElementStyles
    tablet?: ElementStyles
    desktop?: ElementStyles
  }
  createdAt: number
  updatedAt: number
}

export interface HistoryEntry {
  timestamp: number
  elementId: string
  previousState: ElementState | null
  newState: ElementState
  action: 'move' | 'resize' | 'style' | 'delete' | 'create'
}

// ============ 存储键名 ============

const STORAGE_KEY = 'leadsite_element_states'
const HISTORY_KEY = 'leadsite_element_history'
const PAGE_KEY = 'leadsite_current_page'

// ============ 工具函数 ============

/** 生成唯一ID */
export function generateElementId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/** 获取当前视口类型 */
export function getViewportType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth
  if (width < 640) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/** 像素转百分比 */
export function pxToPercent(px: number, containerSize: number): number {
  return (px / containerSize) * 100
}

/** 百分比转像素 */
export function percentToPx(percent: number, containerSize: number): number {
  return (percent / 100) * containerSize
}

// ============ 状态管理类 ============

export class ElementStateManager {
  private states: Map<string, ElementState> = new Map()
  private history: HistoryEntry[] = []
  private historyIndex: number = -1
  private maxHistory: number = 50
  private currentPageId: string = 'default'
  private listeners: Set<(states: Map<string, ElementState>) => void> = new Set()

  constructor() {
    this.loadFromStorage()
    
    // 监听存储变化（多标签页同步）
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.loadFromStorage()
          this.notifyListeners()
        }
      })
    }
  }

  // ============ 持久化 ============

  /** 从 localStorage 加载 */
  private loadFromStorage() {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.states = new Map(Object.entries(data))
        console.log('[StateManager] Loaded', this.states.size, 'element states')
      }

      const historyStored = localStorage.getItem(HISTORY_KEY)
      if (historyStored) {
        const historyData = JSON.parse(historyStored)
        this.history = historyData.history || []
        this.historyIndex = historyData.index ?? -1
      }

      const pageId = localStorage.getItem(PAGE_KEY)
      if (pageId) {
        this.currentPageId = pageId
      }
    } catch (error) {
      console.error('[StateManager] Failed to load from storage:', error)
    }
  }

  /** 保存到 localStorage */
  private saveToStorage() {
    if (typeof window === 'undefined') return
    
    try {
      const data = Object.fromEntries(this.states)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

      localStorage.setItem(HISTORY_KEY, JSON.stringify({
        history: this.history.slice(-this.maxHistory),
        index: this.historyIndex
      }))

      localStorage.setItem(PAGE_KEY, this.currentPageId)
      
      console.log('[StateManager] Saved', this.states.size, 'element states')
    } catch (error) {
      console.error('[StateManager] Failed to save to storage:', error)
    }
  }

  // ============ 状态操作 ============

  /** 设置当前页面 */
  setPage(pageId: string) {
    this.currentPageId = pageId
    this.saveToStorage()
  }

  /** 获取当前页面所有状态 */
  getPageStates(): ElementState[] {
    return Array.from(this.states.values())
      .filter(state => state.pageId === this.currentPageId)
  }

  /** 获取元素状态 */
  getState(elementId: string): ElementState | undefined {
    return this.states.get(elementId)
  }

  /** 通过选择器获取状态 */
  getStateBySelector(selector: string): ElementState | undefined {
    return Array.from(this.states.values())
      .find(state => state.selector === selector && state.pageId === this.currentPageId)
  }

  /** 保存元素状态 */
  saveState(state: ElementState, addToHistory: boolean = true) {
    const previousState = this.states.get(state.id) || null
    
    state.updatedAt = Date.now()
    this.states.set(state.id, state)
    this.saveToStorage()

    if (addToHistory) {
      this.addToHistory({
        timestamp: Date.now(),
        elementId: state.id,
        previousState,
        newState: { ...state },
        action: previousState ? 'move' : 'create'
      })
    }

    this.notifyListeners()
    
    console.log('[StateManager] Saved state for:', state.id, state)
  }

  /** 删除元素状态 */
  deleteState(elementId: string) {
    const state = this.states.get(elementId)
    if (state) {
      this.addToHistory({
        timestamp: Date.now(),
        elementId,
        previousState: state,
        newState: state, // 用于撤销时恢复
        action: 'delete'
      })
    }
    
    this.states.delete(elementId)
    this.saveToStorage()
    this.notifyListeners()
  }


  // ============ 历史记录（撤销/重做）============

  private addToHistory(entry: HistoryEntry) {
    // 删除当前位置之后的历史
    this.history = this.history.slice(0, this.historyIndex + 1)
    this.history.push(entry)
    
    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    } else {
      this.historyIndex++
    }
    
    this.saveToStorage()
  }

  /** 撤销 */
  undo(): ElementState | null {
    if (this.historyIndex < 0) {
      console.log('[StateManager] Nothing to undo')
      return null
    }

    const entry = this.history[this.historyIndex]
    this.historyIndex--

    if (entry.action === 'delete' && entry.previousState) {
      // 恢复被删除的元素
      this.states.set(entry.elementId, entry.previousState)
    } else if (entry.action === 'create') {
      // 删除新创建的元素
      this.states.delete(entry.elementId)
    } else if (entry.previousState) {
      // 恢复之前的状态
      this.states.set(entry.elementId, entry.previousState)
    }

    this.saveToStorage()
    this.notifyListeners()
    
    console.log('[StateManager] Undo:', entry.action, entry.elementId)
    return entry.previousState
  }

  /** 重做 */
  redo(): ElementState | null {
    if (this.historyIndex >= this.history.length - 1) {
      console.log('[StateManager] Nothing to redo')
      return null
    }

    this.historyIndex++
    const entry = this.history[this.historyIndex]

    if (entry.action === 'delete') {
      this.states.delete(entry.elementId)
    } else {
      this.states.set(entry.elementId, entry.newState)
    }

    this.saveToStorage()
    this.notifyListeners()
    
    console.log('[StateManager] Redo:', entry.action, entry.elementId)
    return entry.newState
  }

  /** 是否可以撤销 */
  canUndo(): boolean {
    return this.historyIndex >= 0
  }

  /** 是否可以重做 */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  /** 清除当前页面的所有状态 */
  clearPageStates() {
    this.getPageStates().forEach(s => this.states.delete(s.id))
    this.saveToStorage()
    this.notifyListeners()
  }

  // ============ 监听器 ============

  subscribe(listener: (states: Map<string, ElementState>) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.states))
  }
}

// ============ 智能定位转换 ============

export interface SmartPositionResult {
  position: 'absolute' | 'fixed'
  left: string
  top: string
  width: string
  parentNeedsPositioning: boolean
}

/**
 * 智能转换定位
 * 将 fixed 定位转换为相对父元素的 absolute 定位
 * 
 * 重要：为避免滚动时位置错乱，使用以下策略：
 * 1. 找到最近的定位祖先（非 static）
 * 2. 使用像素定位（而非百分比）确保位置稳定
 * 3. 只对宽度使用百分比（响应式）
 */
export function convertToSmartPosition(
  element: HTMLElement,
  fixedX: number,
  fixedY: number,
  options: {
    usePercent?: boolean
    containerSelector?: string
  } = {}
): SmartPositionResult {
  const { usePercent = false, containerSelector } = options // 默认不使用百分比
  
  // 找到最近的定位祖先
  let parent: HTMLElement | null = null
  
  if (containerSelector) {
    parent = document.querySelector(containerSelector)
  }
  
  // 向上查找最近的非 static 定位祖先
  if (!parent) {
    let current = element.parentElement
    while (current && current !== document.body) {
      const position = window.getComputedStyle(current).position
      if (position !== 'static') {
        parent = current
        break
      }
      current = current.parentElement
    }
  }
  
  // 如果没找到定位祖先，使用父元素
  if (!parent) {
    parent = element.parentElement || document.body
  }
  
  // 确保父元素可以作为定位参考
  const parentPosition = window.getComputedStyle(parent).position
  const parentNeedsPositioning = parentPosition === 'static'
  
  if (parentNeedsPositioning) {
    parent.style.position = 'relative'
  }
  
  // 计算相对父元素的位置（考虑滚动偏移）
  const parentRect = parent.getBoundingClientRect()
  const scrollLeft = parent.scrollLeft || 0
  const scrollTop = parent.scrollTop || 0
  
  // 相对于父元素的位置
  const relativeX = fixedX - parentRect.left + scrollLeft
  const relativeY = fixedY - parentRect.top + scrollTop
  
  // 始终使用像素定位，确保滚动时位置稳定
  const leftValue = `${relativeX}px`
  const topValue = `${relativeY}px`
  
  // 只对宽度使用百分比（可选）
  const elementRect = element.getBoundingClientRect()
  let widthValue: string
  if (usePercent && parentRect.width > 0) {
    const widthPercent = (elementRect.width / parentRect.width) * 100
    widthValue = `${widthPercent.toFixed(2)}%`
  } else {
    widthValue = `${elementRect.width}px`
  }
  
  return {
    position: 'absolute',
    left: leftValue,
    top: topValue,
    width: widthValue,
    parentNeedsPositioning
  }
}

/**
 * 应用智能定位到元素
 */
export function applySmartPosition(element: HTMLElement, result: SmartPositionResult) {
  element.style.position = result.position
  element.style.left = result.left
  element.style.top = result.top
  element.style.width = result.width
  element.style.margin = '0' // 清除可能影响定位的 margin
}

// ============ 响应式适配 ============

export interface ResponsiveStyles {
  mobile: ElementStyles
  tablet: ElementStyles
  desktop: ElementStyles
}

/**
 * 为不同视口生成响应式样式
 */
export function generateResponsiveStyles(
  element: HTMLElement,
  baseStyles: ElementStyles
): ResponsiveStyles {
  // 获取当前视口类型
  const currentViewport = getViewportType()
  
  // 基础样式作为当前视口的样式
  const result: ResponsiveStyles = {
    mobile: { ...baseStyles },
    tablet: { ...baseStyles },
    desktop: { ...baseStyles }
  }
  
  // 当前视口使用实际样式，其他视口需要计算
  result[currentViewport] = baseStyles
  
  return result
}

/**
 * 根据当前视口应用响应式样式
 */
export function applyResponsiveStyles(element: HTMLElement, state: ElementState) {
  const viewport = getViewportType()
  const responsiveStyles = state.responsive?.[viewport]
  
  if (responsiveStyles) {
    Object.entries(responsiveStyles).forEach(([key, value]) => {
      if (value !== undefined) {
        element.style.setProperty(key, value)
      }
    })
  } else {
    // 使用默认样式
    Object.entries(state.styles).forEach(([key, value]) => {
      if (value !== undefined) {
        element.style.setProperty(key, value)
      }
    })
  }
}

// ============ DOM 操作 ============

/**
 * 恢复页面上所有元素的状态
 */
export function restoreAllElements(manager: ElementStateManager) {
  const states = manager.getPageStates()
  let restoredCount = 0
  
  states.forEach(state => {
    try {
      const element = document.querySelector(state.selector) as HTMLElement
      if (element) {
        // 确保父元素有正确的定位
        const parent = element.parentElement
        if (parent) {
          const parentPosition = window.getComputedStyle(parent).position
          if (parentPosition === 'static') {
            parent.style.position = 'relative'
          }
        }
        
        // 应用样式
        applyResponsiveStyles(element, state)
        element.dataset.elementId = state.id
        element.dataset.dragged = 'true'
        
        // 确保 margin 被清除
        element.style.margin = '0'
        
        restoredCount++
      } else {
        console.warn('[StateManager] Element not found:', state.selector)
      }
    } catch (error) {
      console.error('[StateManager] Failed to restore element:', state.id, error)
    }
  })
  
  console.log('[StateManager] Restored', restoredCount, 'of', states.length, 'elements')
  return restoredCount
}

/**
 * 生成元素的 CSS 选择器
 */
export function generateSelector(element: HTMLElement): string {
  // 优先使用 data-id
  if (element.dataset.id) {
    return `[data-id="${element.dataset.id}"]`
  }
  
  // 使用 data-component
  if (element.dataset.component) {
    const index = Array.from(document.querySelectorAll(`[data-component="${element.dataset.component}"]`))
      .indexOf(element)
    return `[data-component="${element.dataset.component}"]:nth-of-type(${index + 1})`
  }
  
  // 使用 id
  if (element.id) {
    return `#${element.id}`
  }
  
  // 使用类名 + 路径
  const path: string[] = []
  let current: HTMLElement | null = element
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()
    
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.split(' ')
        .filter(c => c && !c.startsWith('hover:') && !c.startsWith('focus:'))
        .slice(0, 2)
        .join('.')
      if (classes) {
        selector += `.${classes}`
      }
    }
    
    // 添加 nth-child
    const parent = current.parentElement
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        c => c.tagName === current!.tagName
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        selector += `:nth-of-type(${index})`
      }
    }
    
    path.unshift(selector)
    current = current.parentElement
  }
  
  return path.slice(-3).join(' > ') // 最多3层
}

// ============ 边界限制 ============

export interface BoundaryConstraints {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * 计算拖拽边界
 */
export function calculateBoundary(
  container: HTMLElement | null,
  elementWidth: number,
  elementHeight: number,
  padding: number = 0
): BoundaryConstraints {
  if (!container) {
    // 使用视口作为边界
    return {
      minX: padding,
      maxX: window.innerWidth - elementWidth - padding,
      minY: padding,
      maxY: window.innerHeight - elementHeight - padding
    }
  }
  
  const containerRect = container.getBoundingClientRect()
  return {
    minX: containerRect.left + padding,
    maxX: containerRect.right - elementWidth - padding,
    minY: containerRect.top + padding,
    maxY: containerRect.bottom - elementHeight - padding
  }
}

/**
 * 约束位置在边界内
 */
export function constrainToBoundary(
  x: number,
  y: number,
  boundary: BoundaryConstraints
): { x: number; y: number; constrained: boolean } {
  const constrainedX = Math.max(boundary.minX, Math.min(x, boundary.maxX))
  const constrainedY = Math.max(boundary.minY, Math.min(y, boundary.maxY))
  
  return {
    x: constrainedX,
    y: constrainedY,
    constrained: constrainedX !== x || constrainedY !== y
  }
}

/**
 * 检测元素碰撞
 */
export function detectCollision(
  rect1: DOMRect,
  rect2: DOMRect,
  margin: number = 0
): boolean {
  return !(
    rect1.right + margin < rect2.left ||
    rect1.left - margin > rect2.right ||
    rect1.bottom + margin < rect2.top ||
    rect1.top - margin > rect2.bottom
  )
}

/**
 * 找到最近的可用位置（避免碰撞）
 */
export function findNonCollidingPosition(
  element: HTMLElement,
  newX: number,
  newY: number,
  otherElements: HTMLElement[],
  stepSize: number = 10
): { x: number; y: number } {
  const elementRect = element.getBoundingClientRect()
  const testRect = new DOMRect(newX, newY, elementRect.width, elementRect.height)
  
  // 检查是否与其他元素碰撞
  const collisions = otherElements.filter(el => {
    if (el === element) return false
    return detectCollision(testRect, el.getBoundingClientRect(), 5)
  })
  
  if (collisions.length === 0) {
    return { x: newX, y: newY }
  }
  
  // 尝试找到不碰撞的位置（螺旋搜索）
  for (let distance = stepSize; distance < 200; distance += stepSize) {
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = (angle * Math.PI) / 180
      const testX = newX + Math.cos(rad) * distance
      const testY = newY + Math.sin(rad) * distance
      
      const testRectNew = new DOMRect(testX, testY, elementRect.width, elementRect.height)
      const hasCollision = otherElements.some(el => {
        if (el === element) return false
        return detectCollision(testRectNew, el.getBoundingClientRect(), 5)
      })
      
      if (!hasCollision) {
        return { x: testX, y: testY }
      }
    }
  }
  
  // 找不到合适位置，返回原位置
  return { x: newX, y: newY }
}

// ============ 单例实例 ============

let managerInstance: ElementStateManager | null = null

export function getElementStateManager(): ElementStateManager {
  if (!managerInstance) {
    managerInstance = new ElementStateManager()
  }
  return managerInstance
}

