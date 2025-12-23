/**
 * 全局元素样式状态管理 Store
 * 使用 Zustand 实现可视化 AI 编辑的核心状态管理
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// 元素样式覆盖类型
export interface ElementOverride {
  tailwindClasses: string
  originalClasses?: string
  lastModified?: number
  instruction?: string
}

// Store 状态接口
export interface ElementStyleState {
  // 以元素ID为键，存储其被覆盖的Tailwind样式
  overrides: Record<string, ElementOverride>
  
  // 当前选中的元素ID
  selectedId: string | null
  
  // 是否处于选择模式
  isSelectMode: boolean
  
  // 悬停的元素ID
  hoveredId: string | null
  
  // Actions
  setSelectedId: (id: string | null) => void
  setHoveredId: (id: string | null) => void
  setSelectMode: (enabled: boolean) => void
  
  // 更新元素的覆盖样式
  setOverride: (elementId: string, override: ElementOverride) => void
  
  // 更新元素的 Tailwind 类名
  updateTailwindClasses: (elementId: string, classes: string, instruction?: string) => void
  
  // 移除元素的覆盖样式
  removeOverride: (elementId: string) => void
  
  // 清除所有覆盖样式
  clearAllOverrides: () => void
  
  // 获取元素的最终样式类名
  getElementClasses: (elementId: string, defaultClasses?: string) => string
  
  // 重置选择状态
  resetSelection: () => void
}

// 创建 Store
export const useElementStyleStore = create<ElementStyleState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        overrides: {},
        selectedId: null,
        isSelectMode: false,
        hoveredId: null,

        // 设置选中的元素ID
        setSelectedId: (id) => {
          set({ selectedId: id }, false, 'setSelectedId')
        },

        // 设置悬停的元素ID
        setHoveredId: (id) => {
          set({ hoveredId: id }, false, 'setHoveredId')
        },

        // 设置选择模式
        setSelectMode: (enabled) => {
          set({ 
            isSelectMode: enabled,
            // 关闭选择模式时清除悬停状态
            hoveredId: enabled ? get().hoveredId : null
          }, false, 'setSelectMode')
        },

        // 设置元素的覆盖样式
        setOverride: (elementId, override) => {
          set((state) => ({
            overrides: {
              ...state.overrides,
              [elementId]: {
                ...override,
                lastModified: Date.now()
              }
            }
          }), false, 'setOverride')
        },

        // 更新元素的 Tailwind 类名
        updateTailwindClasses: (elementId, classes, instruction) => {
          set((state) => ({
            overrides: {
              ...state.overrides,
              [elementId]: {
                ...state.overrides[elementId],
                tailwindClasses: classes,
                instruction,
                lastModified: Date.now()
              }
            }
          }), false, 'updateTailwindClasses')
        },

        // 移除元素的覆盖样式
        removeOverride: (elementId) => {
          set((state) => {
            const { [elementId]: removed, ...rest } = state.overrides
            return { overrides: rest }
          }, false, 'removeOverride')
        },

        // 清除所有覆盖样式
        clearAllOverrides: () => {
          set({ overrides: {} }, false, 'clearAllOverrides')
        },

        // 获取元素的最终样式类名（合并默认样式和覆盖样式）
        getElementClasses: (elementId, defaultClasses = '') => {
          const override = get().overrides[elementId]
          if (!override?.tailwindClasses) {
            return defaultClasses
          }
          // 合并默认类名和覆盖类名
          // 覆盖类名放在后面，优先级更高
          return `${defaultClasses} ${override.tailwindClasses}`.trim()
        },

        // 重置选择状态
        resetSelection: () => {
          set({
            selectedId: null,
            hoveredId: null,
            isSelectMode: false
          }, false, 'resetSelection')
        }
      }),
      {
        name: 'element-style-storage',
        // 只持久化 overrides，不持久化选择状态
        partialize: (state) => ({ overrides: state.overrides })
      }
    ),
    { name: 'ElementStyleStore' }
  )
)

// 选择器 hooks
export const useSelectedId = () => useElementStyleStore((state) => state.selectedId)
export const useHoveredId = () => useElementStyleStore((state) => state.hoveredId)
export const useIsSelectMode = () => useElementStyleStore((state) => state.isSelectMode)
export const useOverrides = () => useElementStyleStore((state) => state.overrides)

// 获取特定元素的覆盖样式
export const useElementOverride = (elementId: string) => 
  useElementStyleStore((state) => state.overrides[elementId])

// 获取合并后的类名
export const useElementClasses = (elementId: string, defaultClasses?: string) =>
  useElementStyleStore((state) => state.getElementClasses(elementId, defaultClasses))








