import { NextResponse } from "next/server"

/**
 * AI 样式修改 API
 * 接收自然语言指令和元素ID，返回 Tailwind CSS 类名
 * 
 * 请求格式: { instruction: string, elementId: string }
 * 响应格式: { tailwindClasses: string, description?: string }
 */

// CSS 属性到 Tailwind 类名的映射
const cssToTailwind: Record<string, Record<string, string>> = {
  // 颜色
  color: {
    "rgb(239, 68, 68)": "text-red-500",
    "rgb(59, 130, 246)": "text-blue-500",
    "rgb(34, 197, 94)": "text-green-500",
    "rgb(234, 179, 8)": "text-yellow-500",
    "rgb(168, 85, 247)": "text-purple-500",
    "rgb(249, 115, 22)": "text-orange-500",
    "rgb(236, 72, 153)": "text-pink-500",
    "rgb(255, 255, 255)": "text-white",
    "rgb(0, 0, 0)": "text-black",
    "rgb(156, 163, 175)": "text-gray-400",
  },
  backgroundColor: {
    "rgb(239, 68, 68)": "bg-red-500",
    "rgb(59, 130, 246)": "bg-blue-500",
    "rgb(34, 197, 94)": "bg-green-500",
    "rgb(234, 179, 8)": "bg-yellow-500",
    "rgb(168, 85, 247)": "bg-purple-500",
    "rgb(249, 115, 22)": "bg-orange-500",
    "rgb(236, 72, 153)": "bg-pink-500",
    "rgb(255, 255, 255)": "bg-white",
    "rgb(0, 0, 0)": "bg-black",
    "rgb(156, 163, 175)": "bg-gray-400",
  },
  // 字体大小
  fontSize: {
    "0.75em": "text-xs",
    "0.875em": "text-sm",
    "1em": "text-base",
    "1.125em": "text-lg",
    "1.25em": "text-xl",
    "1.5em": "text-2xl",
    "1.875em": "text-3xl",
    "2.25em": "text-4xl",
    "3em": "text-5xl",
  },
  // 字体粗细
  fontWeight: {
    "100": "font-thin",
    "200": "font-extralight",
    "300": "font-light",
    "400": "font-normal",
    "500": "font-medium",
    "600": "font-semibold",
    "700": "font-bold",
    "800": "font-extrabold",
    "900": "font-black",
    "bold": "font-bold",
    "normal": "font-normal",
  },
  // 文本对齐
  textAlign: {
    "left": "text-left",
    "center": "text-center",
    "right": "text-right",
    "justify": "text-justify",
  },
  // 显示
  display: {
    "none": "hidden",
    "block": "block",
    "inline": "inline",
    "inline-block": "inline-block",
    "flex": "flex",
    "grid": "grid",
  },
  // 圆角
  borderRadius: {
    "0": "rounded-none",
    "0.125rem": "rounded-sm",
    "0.25rem": "rounded",
    "0.375rem": "rounded-md",
    "0.5rem": "rounded-lg",
    "0.75rem": "rounded-xl",
    "1rem": "rounded-2xl",
    "1.5rem": "rounded-3xl",
    "9999px": "rounded-full",
  },
  // 内边距
  padding: {
    "0": "p-0",
    "0.25rem": "p-1",
    "0.5rem": "p-2",
    "0.75rem": "p-3",
    "1rem": "p-4",
    "1.25rem": "p-5",
    "1.5rem": "p-6",
    "2rem": "p-8",
    "2.5rem": "p-10",
    "3rem": "p-12",
  },
  // 外边距
  margin: {
    "0": "m-0",
    "0.25rem": "m-1",
    "0.5rem": "m-2",
    "0.75rem": "m-3",
    "1rem": "m-4",
    "1.25rem": "m-5",
    "1.5rem": "m-6",
    "2rem": "m-8",
  },
  // 宽度
  width: {
    "100%": "w-full",
    "50%": "w-1/2",
    "auto": "w-auto",
    "fit-content": "w-fit",
  },
  // 高度
  height: {
    "100%": "h-full",
    "50%": "h-1/2",
    "auto": "h-auto",
    "fit-content": "h-fit",
  },
  // 透明度
  opacity: {
    "0": "opacity-0",
    "0.25": "opacity-25",
    "0.5": "opacity-50",
    "0.75": "opacity-75",
    "1": "opacity-100",
  },
}

// 阴影映射
const shadowMap: Record<string, string> = {
  "none": "shadow-none",
  "sm": "shadow-sm",
  "default": "shadow",
  "md": "shadow-md",
  "lg": "shadow-lg",
  "xl": "shadow-xl",
  "2xl": "shadow-2xl",
}

// 颜色映射
const colorMap: Record<string, { tailwind: string; bgTailwind: string; name: string }> = {
  "红": { tailwind: "text-red-500", bgTailwind: "bg-red-500", name: "红色" },
  "red": { tailwind: "text-red-500", bgTailwind: "bg-red-500", name: "红色" },
  "蓝": { tailwind: "text-blue-500", bgTailwind: "bg-blue-500", name: "蓝色" },
  "blue": { tailwind: "text-blue-500", bgTailwind: "bg-blue-500", name: "蓝色" },
  "绿": { tailwind: "text-green-500", bgTailwind: "bg-green-500", name: "绿色" },
  "green": { tailwind: "text-green-500", bgTailwind: "bg-green-500", name: "绿色" },
  "黄": { tailwind: "text-yellow-500", bgTailwind: "bg-yellow-500", name: "黄色" },
  "yellow": { tailwind: "text-yellow-500", bgTailwind: "bg-yellow-500", name: "黄色" },
  "紫": { tailwind: "text-purple-500", bgTailwind: "bg-purple-500", name: "紫色" },
  "purple": { tailwind: "text-purple-500", bgTailwind: "bg-purple-500", name: "紫色" },
  "橙": { tailwind: "text-orange-500", bgTailwind: "bg-orange-500", name: "橙色" },
  "orange": { tailwind: "text-orange-500", bgTailwind: "bg-orange-500", name: "橙色" },
  "粉": { tailwind: "text-pink-500", bgTailwind: "bg-pink-500", name: "粉色" },
  "pink": { tailwind: "text-pink-500", bgTailwind: "bg-pink-500", name: "粉色" },
  "白": { tailwind: "text-white", bgTailwind: "bg-white", name: "白色" },
  "white": { tailwind: "text-white", bgTailwind: "bg-white", name: "白色" },
  "黑": { tailwind: "text-black", bgTailwind: "bg-black", name: "黑色" },
  "black": { tailwind: "text-black", bgTailwind: "bg-black", name: "黑色" },
  "灰": { tailwind: "text-gray-500", bgTailwind: "bg-gray-500", name: "灰色" },
  "gray": { tailwind: "text-gray-500", bgTailwind: "bg-gray-500", name: "灰色" },
  "grey": { tailwind: "text-gray-500", bgTailwind: "bg-gray-500", name: "灰色" },
}

// 解析自然语言指令，返回 Tailwind 类名
function parseInstruction(instruction: string): { classes: string[]; description: string } {
  const classes: string[] = []
  const descriptions: string[] = []
  const lowerInstruction = instruction.toLowerCase()
  
  const hasBackground = lowerInstruction.includes("背景") || 
    lowerInstruction.includes("background") || 
    lowerInstruction.includes("bg")

  // 检测颜色
  let detectedColor: { tailwind: string; bgTailwind: string; name: string } | null = null
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerInstruction.includes(key)) {
      detectedColor = value
      break
    }
  }

  // 应用颜色
  if (detectedColor) {
    if (hasBackground) {
      classes.push(detectedColor.bgTailwind)
      // 自动调整文字颜色
      if (["白色", "黄色"].includes(detectedColor.name)) {
        classes.push("text-black")
      } else {
        classes.push("text-white")
      }
      descriptions.push(`背景改为${detectedColor.name}`)
    } else {
      classes.push(detectedColor.tailwind)
      descriptions.push(`文字改为${detectedColor.name}`)
    }
  }

  // 字体大小
  if (lowerInstruction.includes("大") && 
      (lowerInstruction.includes("变") || lowerInstruction.includes("更") || 
       lowerInstruction.includes("字") || lowerInstruction.includes("bigger") || 
       lowerInstruction.includes("larger"))) {
    classes.push("text-2xl")
    descriptions.push("字体变大")
  } else if (lowerInstruction.includes("小") && 
             (lowerInstruction.includes("变") || lowerInstruction.includes("更") || 
              lowerInstruction.includes("字") || lowerInstruction.includes("smaller"))) {
    classes.push("text-sm")
    descriptions.push("字体变小")
  }

  // 字体粗细
  if (lowerInstruction.includes("加粗") || lowerInstruction.includes("粗") || 
      lowerInstruction.includes("bold") || lowerInstruction.includes("bolder")) {
    classes.push("font-bold")
    descriptions.push("加粗")
  } else if (lowerInstruction.includes("细") || lowerInstruction.includes("lighter") || 
             lowerInstruction.includes("thin")) {
    classes.push("font-light")
    descriptions.push("字体变细")
  }

  // 对齐方式
  if (lowerInstruction.includes("居中") || lowerInstruction.includes("center")) {
    classes.push("text-center")
    descriptions.push("居中对齐")
  } else if ((lowerInstruction.includes("左") || lowerInstruction.includes("left")) && 
             lowerInstruction.includes("对齐")) {
    classes.push("text-left")
    descriptions.push("左对齐")
  } else if ((lowerInstruction.includes("右") || lowerInstruction.includes("right")) && 
             lowerInstruction.includes("对齐")) {
    classes.push("text-right")
    descriptions.push("右对齐")
  }

  // 隐藏/显示
  if (lowerInstruction.includes("隐藏") || lowerInstruction.includes("hide")) {
    classes.push("hidden")
    descriptions.push("已隐藏")
  } else if (lowerInstruction.includes("显示") || lowerInstruction.includes("show")) {
    classes.push("block")
    descriptions.push("已显示")
  }

  // 圆角
  if (lowerInstruction.includes("圆角") || lowerInstruction.includes("rounded") || 
      lowerInstruction.includes("圆润")) {
    if (lowerInstruction.includes("大") || lowerInstruction.includes("更")) {
      classes.push("rounded-xl")
    } else if (lowerInstruction.includes("完全") || lowerInstruction.includes("full")) {
      classes.push("rounded-full")
    } else {
      classes.push("rounded-lg")
    }
    descriptions.push("添加圆角")
  }

  // 阴影
  if (lowerInstruction.includes("阴影") || lowerInstruction.includes("shadow")) {
    if (lowerInstruction.includes("大") || lowerInstruction.includes("强")) {
      classes.push("shadow-xl")
    } else if (lowerInstruction.includes("小") || lowerInstruction.includes("轻")) {
      classes.push("shadow-sm")
    } else {
      classes.push("shadow-lg")
    }
    descriptions.push("添加阴影")
  }

  // 边框
  if (lowerInstruction.includes("边框") || lowerInstruction.includes("border") || 
      lowerInstruction.includes("框")) {
    classes.push("border-2")
    if (detectedColor) {
      // 边框颜色
      const borderColor = detectedColor.tailwind.replace("text-", "border-")
      classes.push(borderColor)
      descriptions.push(`添加${detectedColor.name}边框`)
    } else {
      classes.push("border-gray-300")
      descriptions.push("添加边框")
    }
  }

  // 内边距
  if (lowerInstruction.includes("内边距") || lowerInstruction.includes("padding")) {
    if (lowerInstruction.includes("增加") || lowerInstruction.includes("more") || 
        lowerInstruction.includes("大")) {
      classes.push("p-6")
      descriptions.push("增加内边距")
    } else if (lowerInstruction.includes("减少") || lowerInstruction.includes("less") || 
               lowerInstruction.includes("小")) {
      classes.push("p-1")
      descriptions.push("减少内边距")
    } else {
      classes.push("p-4")
      descriptions.push("添加内边距")
    }
  }

  // 外边距
  if (lowerInstruction.includes("外边距") || lowerInstruction.includes("margin") ||
      lowerInstruction.includes("间距")) {
    if (lowerInstruction.includes("增加") || lowerInstruction.includes("more") || 
        lowerInstruction.includes("大")) {
      classes.push("m-6")
      descriptions.push("增加外边距")
    } else if (lowerInstruction.includes("减少") || lowerInstruction.includes("less") || 
               lowerInstruction.includes("小")) {
      classes.push("m-1")
      descriptions.push("减少外边距")
    } else {
      classes.push("m-4")
      descriptions.push("添加外边距")
    }
  }

  // 宽度
  if (lowerInstruction.includes("宽") || lowerInstruction.includes("width")) {
    if (lowerInstruction.includes("满") || lowerInstruction.includes("full") || 
        lowerInstruction.includes("100")) {
      classes.push("w-full")
      descriptions.push("宽度100%")
    } else if (lowerInstruction.includes("一半") || lowerInstruction.includes("50")) {
      classes.push("w-1/2")
      descriptions.push("宽度50%")
    }
  }

  // 高度
  if (lowerInstruction.includes("高") || lowerInstruction.includes("height")) {
    if (lowerInstruction.includes("满") || lowerInstruction.includes("full") || 
        lowerInstruction.includes("100")) {
      classes.push("h-full")
      descriptions.push("高度100%")
    }
  }

  // 透明度
  if (lowerInstruction.includes("透明") || lowerInstruction.includes("opacity")) {
    if (lowerInstruction.includes("半") || lowerInstruction.includes("50")) {
      classes.push("opacity-50")
      descriptions.push("半透明")
    } else if (lowerInstruction.includes("不透明") || lowerInstruction.includes("100")) {
      classes.push("opacity-100")
      descriptions.push("不透明")
    }
  }

  // Flex 布局
  if (lowerInstruction.includes("flex") || lowerInstruction.includes("弹性")) {
    classes.push("flex")
    if (lowerInstruction.includes("居中")) {
      classes.push("items-center", "justify-center")
    }
    descriptions.push("Flex布局")
  }

  // 通用美化
  if (classes.length === 0) {
    if (lowerInstruction.includes("漂亮") || lowerInstruction.includes("好看") || 
        lowerInstruction.includes("美化")) {
      classes.push("rounded-lg", "shadow-lg", "p-4")
      descriptions.push("美化样式：添加圆角、阴影和内边距")
    } else if (lowerInstruction.includes("突出") || lowerInstruction.includes("醒目") || 
               lowerInstruction.includes("显眼")) {
      classes.push("font-bold", "text-xl", "text-blue-500")
      descriptions.push("突出显示：加粗、放大、蓝色")
    }
  }

  return {
    classes,
    description: descriptions.join("，")
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { instruction, elementId } = body

    if (!instruction) {
      return NextResponse.json(
        { 
          success: false, 
          error: "缺少指令参数" 
        },
        { status: 400 }
      )
    }

    if (!elementId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "缺少元素ID参数" 
        },
        { status: 400 }
      )
    }

    // 解析指令
    const result = parseInstruction(instruction)

    if (result.classes.length === 0) {
      return NextResponse.json({
        success: false,
        error: `无法理解指令 "${instruction}"。\n\n试试这些：\n• 颜色: "改为红色"、"背景变蓝色"\n• 字体: "字体变大"、"加粗"\n• 样式: "添加圆角"、"添加阴影"\n• 对齐: "居中"、"左对齐"\n• 通用: "让它更漂亮"、"突出显示"`,
      })
    }

    // 合并类名
    const tailwindClasses = result.classes.join(" ")

    return NextResponse.json({
      success: true,
      tailwindClasses,
      description: result.description,
      elementId,
      instruction,
    })
  } catch (error) {
    console.error("AI style modification error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "修改样式时发生错误" 
      },
      { status: 500 }
    )
  }
}








