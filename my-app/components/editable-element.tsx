"use client"

import React, { forwardRef, useEffect, useRef } from "react"
import { useElementClasses, useElementOverride, useSelectedId } from "@/lib/element-style-store"
import { cn } from "@/lib/utils"

interface EditableElementProps extends React.HTMLAttributes<HTMLElement> {
  /** 元素唯一标识符 */
  elementId: string
  /** 渲染的 HTML 标签 */
  as?: keyof React.JSX.IntrinsicElements
  /** 默认类名 */
  defaultClassName?: string
  /** 子元素 */
  children?: React.ReactNode
}

/**
 * 可编辑元素组件
 * 从全局 Store 读取覆盖样式并应用
 * 
 * 使用方式:
 * <EditableElement elementId="hero-title" as="h1" defaultClassName="text-4xl font-bold">
 *   Hello World
 * </EditableElement>
 */
export const EditableElement = forwardRef<HTMLElement, EditableElementProps>(
  ({ elementId, as: Component = "div", defaultClassName = "", className, children, ...props }, ref) => {
    const internalRef = useRef<HTMLElement>(null)
    const elementRef = (ref as React.RefObject<HTMLElement>) || internalRef
    
    // 从 Store 获取覆盖样式
    const override = useElementOverride(elementId)
    const selectedId = useSelectedId()
    
    // 合并类名
    const finalClassName = cn(
      defaultClassName,
      className,
      override?.tailwindClasses
    )

    // 是否被选中
    const isSelected = selectedId === elementId

    // 设置 data-element-id 属性
    useEffect(() => {
      if (elementRef.current) {
        elementRef.current.setAttribute("data-element-id", elementId)
        
        // 保存原始类名
        if (!elementRef.current.hasAttribute("data-original-class")) {
          elementRef.current.setAttribute("data-original-class", defaultClassName || "")
        }
      }
    }, [elementId, defaultClassName, elementRef])

    // 动态创建元素
    const ElementComponent = Component as React.ElementType

    return (
      <ElementComponent
        ref={elementRef}
        className={cn(
          finalClassName,
          isSelected && "ring-2 ring-primary ring-offset-2"
        )}
        data-element-id={elementId}
        data-original-class={defaultClassName}
        {...props}
      >
        {children}
      </ElementComponent>
    )
  }
)

EditableElement.displayName = "EditableElement"

/**
 * 创建预设的可编辑元素组件
 */
export function createEditableElement<T extends keyof React.JSX.IntrinsicElements>(
  tag: T,
  displayName: string
) {
  const Component = forwardRef<
    HTMLElement,
    Omit<EditableElementProps, "as"> & React.JSX.IntrinsicElements[T]
  >(({ elementId, defaultClassName, children, ...props }, ref) => (
    <EditableElement
      ref={ref}
      as={tag}
      elementId={elementId}
      defaultClassName={defaultClassName}
      {...props}
    >
      {children}
    </EditableElement>
  ))
  
  Component.displayName = displayName
  return Component
}

// 预设组件
export const EditableH1 = createEditableElement("h1", "EditableH1")
export const EditableH2 = createEditableElement("h2", "EditableH2")
export const EditableH3 = createEditableElement("h3", "EditableH3")
export const EditableP = createEditableElement("p", "EditableP")
export const EditableSpan = createEditableElement("span", "EditableSpan")
export const EditableDiv = createEditableElement("div", "EditableDiv")
export const EditableSection = createEditableElement("section", "EditableSection")
export const EditableButton = createEditableElement("button", "EditableButton")
export const EditableA = createEditableElement("a", "EditableA")

/**
 * 使用 Hook 获取元素样式
 * 
 * 用于在不使用 EditableElement 组件的情况下应用样式
 * 
 * 使用方式:
 * const { className, isSelected } = useEditableStyle("hero-title", "text-4xl font-bold")
 * <h1 className={className} data-element-id="hero-title">Hello</h1>
 */
export function useEditableStyle(elementId: string, defaultClassName?: string) {
  const override = useElementOverride(elementId)
  const selectedId = useSelectedId()
  
  const isSelected = selectedId === elementId
  
  const className = cn(
    defaultClassName,
    override?.tailwindClasses,
    isSelected && "ring-2 ring-primary ring-offset-2"
  )

  return {
    className,
    isSelected,
    override,
    "data-element-id": elementId,
  }
}








