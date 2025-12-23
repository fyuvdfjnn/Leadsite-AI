/**
 * 自由拖拽系统 - 类似 Cursor 的可视化编辑器
 * 支持：
 * 1. 自由拖拽任意元素到任意位置
 * 2. 智能辅助线/对齐
 * 3. 网格吸附
 * 4. 高性能动画（transform + GPU加速）
 */

// ============ 类型定义 ============

export interface DragState {
  isDragging: boolean
  element: HTMLElement | null
  startX: number
  startY: number
  currentX: number
  currentY: number
  offsetX: number
  offsetY: number
  initialRect: DOMRect | null
  originalStyles: {
    position: string
    left: string
    top: string
    transform: string
    zIndex: string
    width: string
    willChange: string
  } | null
}

export interface SnapLine {
  type: 'vertical' | 'horizontal'
  position: number
  length?: number
  startY?: number
  startX?: number
  label?: string
}

export interface DragOptions {
  /** 吸附阈值（像素） */
  snapThreshold?: number
  /** 是否显示辅助线 */
  showGuides?: boolean
  /** 是否启用网格吸附 */
  enableGrid?: boolean
  /** 网格大小 */
  gridSize?: number
  /** 容器边界 */
  containerBounds?: DOMRect
  /** 其他可吸附的元素 */
  snapTargets?: HTMLElement[]
  /** 拖拽开始回调 */
  onDragStart?: (element: HTMLElement, state: DragState) => void
  /** 拖拽中回调 */
  onDrag?: (element: HTMLElement, state: DragState, snapLines: SnapLine[]) => void
  /** 拖拽结束回调 */
  onDragEnd?: (element: HTMLElement, state: DragState) => void
}

// ============ 网格系统 ============

export interface GridConfig {
  enabled: boolean
  size: number
  color: string
  opacity: number
  showDots: boolean
}

export const defaultGridConfig: GridConfig = {
  enabled: true,
  size: 20,
  color: '#3b82f6',
  opacity: 0.15,
  showDots: false,
}

/**
 * 生成网格背景 CSS
 */
export function generateGridCSS(config: GridConfig = defaultGridConfig): string {
  const { size, color, opacity, showDots } = config
  
  if (showDots) {
    // 点状网格
    return `
      background-image: radial-gradient(circle, ${color} 1px, transparent 1px);
      background-size: ${size}px ${size}px;
      background-position: 0 0;
    `
  } else {
    // 线状网格
    const lineColor = `rgba(${hexToRgb(color)}, ${opacity})`
    return `
      background-image: 
        linear-gradient(to right, ${lineColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${lineColor} 1px, transparent 1px);
      background-size: ${size}px ${size}px;
      background-position: 0 0;
    `
  }
}

/**
 * 十六进制颜色转 RGB
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  }
  return '59, 130, 246' // 默认蓝色
}

/**
 * 网格吸附
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}

/**
 * 网格吸附（带偏移）
 */
export function snapToGridWithOffset(
  x: number, 
  y: number, 
  gridSize: number,
  threshold: number = gridSize / 2
): { x: number; y: number; snappedX: boolean; snappedY: boolean } {
  const snappedX = snapToGrid(x, gridSize)
  const snappedY = snapToGrid(y, gridSize)
  
  const diffX = Math.abs(x - snappedX)
  const diffY = Math.abs(y - snappedY)
  
  return {
    x: diffX <= threshold ? snappedX : x,
    y: diffY <= threshold ? snappedY : y,
    snappedX: diffX <= threshold,
    snappedY: diffY <= threshold,
  }
}

// ============ 辅助线对齐 ============

/**
 * 计算辅助线和吸附位置
 */
export function calculateSnapLines(
  element: HTMLElement,
  targets: HTMLElement[],
  threshold: number = 8
): { snapLines: SnapLine[]; snapX: number | null; snapY: number | null } {
  const rect = element.getBoundingClientRect()
  const snapLines: SnapLine[] = []
  let snapX: number | null = null
  let snapY: number | null = null
  let minDiffX = Infinity
  let minDiffY = Infinity

  // 元素的关键点
  const elementPoints = {
    left: rect.left,
    centerX: rect.left + rect.width / 2,
    right: rect.right,
    top: rect.top,
    centerY: rect.top + rect.height / 2,
    bottom: rect.bottom,
  }

  targets.forEach(target => {
    if (target === element) return
    if (!target.offsetParent) return // 跳过隐藏元素
    
    const targetRect = target.getBoundingClientRect()
    
    // 跳过太小的元素
    if (targetRect.width < 10 || targetRect.height < 10) return
    
    const targetPoints = {
      left: targetRect.left,
      centerX: targetRect.left + targetRect.width / 2,
      right: targetRect.right,
      top: targetRect.top,
      centerY: targetRect.top + targetRect.height / 2,
      bottom: targetRect.bottom,
    }

    // 垂直对齐检测（左、中、右）
    const verticalChecks = [
      { source: 'left', target: 'left', priority: 1 },
      { source: 'left', target: 'right', priority: 2 },
      { source: 'centerX', target: 'centerX', priority: 0 },
      { source: 'right', target: 'left', priority: 2 },
      { source: 'right', target: 'right', priority: 1 },
    ]

    verticalChecks.forEach(({ source, target: targetKey }) => {
      const sourceVal = elementPoints[source as keyof typeof elementPoints]
      const targetVal = targetPoints[targetKey as keyof typeof targetPoints]
      const diff = Math.abs(sourceVal - targetVal)
      
      if (diff <= threshold) {
        // 计算辅助线的起点和长度
        const minY = Math.min(rect.top, targetRect.top)
        const maxY = Math.max(rect.bottom, targetRect.bottom)
        
        snapLines.push({
          type: 'vertical',
          position: targetVal,
          startY: minY,
          length: maxY - minY,
          label: `${source} → ${targetKey}`,
        })
        
        // 选择最近的吸附点
        if (diff < minDiffX) {
          minDiffX = diff
          snapX = targetVal - (sourceVal - elementPoints.left)
        }
      }
    })

    // 水平对齐检测（上、中、下）
    const horizontalChecks = [
      { source: 'top', target: 'top', priority: 1 },
      { source: 'top', target: 'bottom', priority: 2 },
      { source: 'centerY', target: 'centerY', priority: 0 },
      { source: 'bottom', target: 'top', priority: 2 },
      { source: 'bottom', target: 'bottom', priority: 1 },
    ]

    horizontalChecks.forEach(({ source, target: targetKey }) => {
      const sourceVal = elementPoints[source as keyof typeof elementPoints]
      const targetVal = targetPoints[targetKey as keyof typeof targetPoints]
      const diff = Math.abs(sourceVal - targetVal)
      
      if (diff <= threshold) {
        // 计算辅助线的起点和长度
        const minX = Math.min(rect.left, targetRect.left)
        const maxX = Math.max(rect.right, targetRect.right)
        
        snapLines.push({
          type: 'horizontal',
          position: targetVal,
          startX: minX,
          length: maxX - minX,
          label: `${source} → ${targetKey}`,
        })
        
        // 选择最近的吸附点
        if (diff < minDiffY) {
          minDiffY = diff
          snapY = targetVal - (sourceVal - elementPoints.top)
        }
      }
    })
  })

  // 去重辅助线（相同位置的合并）
  const uniqueSnapLines = snapLines.reduce((acc, line) => {
    const existing = acc.find(l => l.type === line.type && Math.abs(l.position - line.position) < 2)
    if (!existing) {
      acc.push(line)
    }
    return acc
  }, [] as SnapLine[])

  return { snapLines: uniqueSnapLines, snapX, snapY }
}

// ============ 容器边界检测 ============

/**
 * 计算边界约束
 */
export function constrainToBounds(
  x: number,
  y: number,
  elementWidth: number,
  elementHeight: number,
  bounds: DOMRect | null,
  padding: number = 0
): { x: number; y: number; constrained: boolean } {
  if (!bounds) {
    return { x, y, constrained: false }
  }

  let constrainedX = x
  let constrainedY = y
  let constrained = false

  // 左边界
  if (x < bounds.left + padding) {
    constrainedX = bounds.left + padding
    constrained = true
  }
  // 右边界
  if (x + elementWidth > bounds.right - padding) {
    constrainedX = bounds.right - elementWidth - padding
    constrained = true
  }
  // 上边界
  if (y < bounds.top + padding) {
    constrainedY = bounds.top + padding
    constrained = true
  }
  // 下边界
  if (y + elementHeight > bounds.bottom - padding) {
    constrainedY = bounds.bottom - elementHeight - padding
    constrained = true
  }

  return { x: constrainedX, y: constrainedY, constrained }
}

// ============ 高性能动画 ============

/**
 * 使用 transform 进行高性能拖拽
 * 相比直接设置 left/top，使用 transform 可以利用 GPU 加速
 */
export function applyTransformPosition(
  element: HTMLElement,
  translateX: number,
  translateY: number,
  scale: number = 1
): void {
  element.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
}

/**
 * 清除 transform，应用最终位置
 */
export function finalizePosition(
  element: HTMLElement,
  left: number,
  top: number
): void {
  element.style.transform = ''
  element.style.left = `${left}px`
  element.style.top = `${top}px`
}

/**
 * 平滑过渡动画
 */
export function animateToPosition(
  element: HTMLElement,
  targetX: number,
  targetY: number,
  duration: number = 200
): Promise<void> {
  return new Promise(resolve => {
    element.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
    element.style.transform = `translate(${targetX}px, ${targetY}px)`
    
    setTimeout(() => {
      element.style.transition = ''
      element.style.transform = ''
      resolve()
    }, duration)
  })
}

// ============ 拖拽控制器（优化版）============

/**
 * 创建高性能拖拽控制器
 */
export function createDragController(options: DragOptions = {}) {
  const {
    snapThreshold = 8,
    showGuides = true,
    enableGrid = false,
    gridSize = 20,
    onDragStart,
    onDrag,
    onDragEnd,
  } = options

  let state: DragState = {
    isDragging: false,
    element: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    offsetX: 0,
    offsetY: 0,
    initialRect: null,
    originalStyles: null,
  }

  let snapTargets: HTMLElement[] = []
  let rafId: number | null = null

  const startDrag = (element: HTMLElement, event: MouseEvent) => {
    const rect = element.getBoundingClientRect()
    
    // 保存原始样式
    state = {
      isDragging: true,
      element,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      initialRect: rect,
      originalStyles: {
        position: element.style.position,
        left: element.style.left,
        top: element.style.top,
        transform: element.style.transform,
        zIndex: element.style.zIndex,
        width: element.style.width,
        willChange: element.style.willChange,
      },
    }

    // 设置拖拽样式（使用 will-change 提示浏览器优化）
    element.style.position = 'fixed'
    element.style.left = `${rect.left}px`
    element.style.top = `${rect.top}px`
    element.style.width = `${rect.width}px`
    element.style.zIndex = '10000'
    element.style.willChange = 'transform'
    element.style.cursor = 'grabbing'
    element.style.userSelect = 'none'
    
    // 拖拽时的视觉效果
    element.style.boxShadow = '0 20px 60px rgba(0,0,0,0.25), 0 0 0 2px rgba(59, 130, 246, 0.5)'
    element.style.opacity = '0.9'
    element.style.transform = 'scale(1.02)'
    element.style.transition = 'box-shadow 0.2s ease-out, opacity 0.2s ease-out'

    // 收集可吸附的目标元素
    snapTargets = Array.from(document.querySelectorAll(
      '[data-component], [data-snap-target], section, header, footer, nav, article, aside, main'
    )) as HTMLElement[]
    snapTargets = snapTargets.filter(el => el !== element && el.offsetParent !== null)

    onDragStart?.(element, state)
  }

  const updateDrag = (event: MouseEvent) => {
    if (!state.isDragging || !state.element || !state.initialRect) return

    // 使用 RAF 优化性能
    if (rafId) {
      cancelAnimationFrame(rafId)
    }

    rafId = requestAnimationFrame(() => {
      if (!state.element || !state.initialRect) return

      state.currentX = event.clientX
      state.currentY = event.clientY

      // 计算位移
      let deltaX = event.clientX - state.startX
      let deltaY = event.clientY - state.startY
      let newLeft = state.initialRect.left + deltaX
      let newTop = state.initialRect.top + deltaY

      // 计算辅助线吸附
      let snapLines: SnapLine[] = []
      if (showGuides && snapTargets.length > 0) {
        // 临时更新位置以计算吸附
        state.element.style.left = `${newLeft}px`
        state.element.style.top = `${newTop}px`
        state.element.style.transform = 'scale(1.02)'

        const snapResult = calculateSnapLines(state.element, snapTargets, snapThreshold)
        snapLines = snapResult.snapLines

        // 应用辅助线吸附
        if (snapResult.snapX !== null) {
          newLeft = snapResult.snapX
          deltaX = newLeft - state.initialRect.left
        }
        if (snapResult.snapY !== null) {
          newTop = snapResult.snapY
          deltaY = newTop - state.initialRect.top
        }
      }

      // 网格吸附（在辅助线吸附之后）
      if (enableGrid && gridSize > 0) {
        const gridSnap = snapToGridWithOffset(newLeft, newTop, gridSize, gridSize / 3)
        if (gridSnap.snappedX && snapLines.filter(l => l.type === 'vertical').length === 0) {
          newLeft = gridSnap.x
          deltaX = newLeft - state.initialRect.left
        }
        if (gridSnap.snappedY && snapLines.filter(l => l.type === 'horizontal').length === 0) {
          newTop = gridSnap.y
          deltaY = newTop - state.initialRect.top
        }
      }

      // 使用 transform 进行高性能移动
      state.element.style.left = `${state.initialRect.left}px`
      state.element.style.top = `${state.initialRect.top}px`
      state.element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`

      onDrag?.(state.element, state, snapLines)
    })
  }

  const endDrag = () => {
    if (!state.isDragging || !state.element || !state.initialRect) return

    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    const element = state.element
    
    // 计算最终位置
    const deltaX = state.currentX - state.startX
    const deltaY = state.currentY - state.startY
    let finalLeft = state.initialRect.left + deltaX
    let finalTop = state.initialRect.top + deltaY

    // 应用最后的吸附
    if (showGuides && snapTargets.length > 0) {
      element.style.left = `${finalLeft}px`
      element.style.top = `${finalTop}px`
      element.style.transform = ''
      
      const snapResult = calculateSnapLines(element, snapTargets, snapThreshold)
      if (snapResult.snapX !== null) finalLeft = snapResult.snapX
      if (snapResult.snapY !== null) finalTop = snapResult.snapY
    }

    if (enableGrid && gridSize > 0) {
      const gridSnap = snapToGridWithOffset(finalLeft, finalTop, gridSize, gridSize / 2)
      finalLeft = gridSnap.x
      finalTop = gridSnap.y
    }

    // 平滑过渡到最终位置
    element.style.transition = 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease-out, opacity 0.2s ease-out'
    element.style.transform = 'scale(1)'
    element.style.boxShadow = ''
    element.style.opacity = '1'
    
    // 过渡完成后清理
    setTimeout(() => {
      element.style.transition = ''
      element.style.transform = ''
      element.style.left = `${finalLeft}px`
      element.style.top = `${finalTop}px`
      element.style.willChange = ''
      element.style.cursor = ''
      element.style.userSelect = ''
    }, 150)

    onDragEnd?.(element, { ...state })

    // 重置状态
    state = {
      isDragging: false,
      element: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      offsetX: 0,
      offsetY: 0,
      initialRect: null,
      originalStyles: null,
    }
    snapTargets = []
  }

  const getState = () => state

  return {
    startDrag,
    updateDrag,
    endDrag,
    getState,
  }
}

/**
 * 生成元素变换的 CSS 代码
 */
export function generateTransformCSS(element: HTMLElement): string {
  const rect = element.getBoundingClientRect()
  const parentRect = element.parentElement?.getBoundingClientRect()
  
  if (!parentRect) {
    return `
position: absolute;
left: ${rect.left}px;
top: ${rect.top}px;
`
  }

  const relativeLeft = rect.left - parentRect.left
  const relativeTop = rect.top - parentRect.top

  return `
position: absolute;
left: ${relativeLeft}px;
top: ${relativeTop}px;
`
}
