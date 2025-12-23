import { NextResponse } from "next/server"

// AI 元素修改 API
// 将用户的自然语言指令转换为 CSS 样式修改

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { instruction, element } = body

    if (!instruction || !element) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      )
    }

    // 在生产环境中，这里会调用 AI API（OpenAI/Claude）
    // 示例 Prompt:
    // "用户想要修改一个 ${element.tagName} 元素（${element.label}）。
    //  当前类名: ${element.className}
    //  用户指令: ${instruction}
    //  请返回需要修改的 CSS 属性，格式为 JSON: { property: value }"

    // 模拟 AI 响应 - 解析常见指令
    const styles: Record<string, string> = {}
    let description = ""

    const lowerInstruction = instruction.toLowerCase()
    const hasBackground = lowerInstruction.includes("背景") || lowerInstruction.includes("background") || lowerInstruction.includes("bg")

    // 颜色映射
    const colorMap: Record<string, { rgb: string; name: string }> = {
      "红": { rgb: "rgb(239, 68, 68)", name: "红色" },
      "red": { rgb: "rgb(239, 68, 68)", name: "红色" },
      "蓝": { rgb: "rgb(59, 130, 246)", name: "蓝色" },
      "blue": { rgb: "rgb(59, 130, 246)", name: "蓝色" },
      "绿": { rgb: "rgb(34, 197, 94)", name: "绿色" },
      "green": { rgb: "rgb(34, 197, 94)", name: "绿色" },
      "黄": { rgb: "rgb(234, 179, 8)", name: "黄色" },
      "yellow": { rgb: "rgb(234, 179, 8)", name: "黄色" },
      "紫": { rgb: "rgb(168, 85, 247)", name: "紫色" },
      "purple": { rgb: "rgb(168, 85, 247)", name: "紫色" },
      "橙": { rgb: "rgb(249, 115, 22)", name: "橙色" },
      "orange": { rgb: "rgb(249, 115, 22)", name: "橙色" },
      "粉": { rgb: "rgb(236, 72, 153)", name: "粉色" },
      "pink": { rgb: "rgb(236, 72, 153)", name: "粉色" },
      "白": { rgb: "rgb(255, 255, 255)", name: "白色" },
      "white": { rgb: "rgb(255, 255, 255)", name: "白色" },
      "黑": { rgb: "rgb(0, 0, 0)", name: "黑色" },
      "black": { rgb: "rgb(0, 0, 0)", name: "黑色" },
      "灰": { rgb: "rgb(156, 163, 175)", name: "灰色" },
      "gray": { rgb: "rgb(156, 163, 175)", name: "灰色" },
      "grey": { rgb: "rgb(156, 163, 175)", name: "灰色" },
    }

    // 检测颜色
    let detectedColor: { rgb: string; name: string } | null = null
    for (const [key, value] of Object.entries(colorMap)) {
      if (lowerInstruction.includes(key)) {
        detectedColor = value
        break
      }
    }

    // 应用颜色修改
    if (detectedColor) {
      if (hasBackground) {
        styles.backgroundColor = detectedColor.rgb
        // 自动调整文字颜色以保证可读性
        if (["白色", "黄色"].includes(detectedColor.name)) {
          styles.color = "rgb(0, 0, 0)"
        } else {
          styles.color = "rgb(255, 255, 255)"
        }
        description = `背景改为${detectedColor.name}`
      } else {
        styles.color = detectedColor.rgb
        description = `文字改为${detectedColor.name}`
      }
    }

    // 字体大小修改
    if (lowerInstruction.includes("大") && (lowerInstruction.includes("变") || lowerInstruction.includes("更") || lowerInstruction.includes("字") || lowerInstruction.includes("bigger") || lowerInstruction.includes("larger"))) {
      styles.fontSize = "1.5em"
      description = description ? `${description}，字体变大` : "字体变大"
    } else if (lowerInstruction.includes("小") && (lowerInstruction.includes("变") || lowerInstruction.includes("更") || lowerInstruction.includes("字") || lowerInstruction.includes("smaller"))) {
      styles.fontSize = "0.875em"
      description = description ? `${description}，字体变小` : "字体变小"
    }

    // 字体粗细
    if (lowerInstruction.includes("加粗") || lowerInstruction.includes("粗") || lowerInstruction.includes("bold") || lowerInstruction.includes("bolder")) {
      styles.fontWeight = "bold"
      description = description ? `${description}，加粗` : "加粗"
    } else if (lowerInstruction.includes("细") || lowerInstruction.includes("lighter") || lowerInstruction.includes("thin")) {
      styles.fontWeight = "300"
      description = description ? `${description}，字体变细` : "字体变细"
    }

    // 对齐方式
    if (lowerInstruction.includes("居中") || lowerInstruction.includes("center")) {
      styles.textAlign = "center"
      description = description ? `${description}，居中对齐` : "居中对齐"
    } else if ((lowerInstruction.includes("左") || lowerInstruction.includes("left")) && lowerInstruction.includes("对齐")) {
      styles.textAlign = "left"
      description = description ? `${description}，左对齐` : "左对齐"
    } else if ((lowerInstruction.includes("右") || lowerInstruction.includes("right")) && lowerInstruction.includes("对齐")) {
      styles.textAlign = "right"
      description = description ? `${description}，右对齐` : "右对齐"
    }

    // 隐藏/显示
    if (lowerInstruction.includes("隐藏") || lowerInstruction.includes("hide")) {
      styles.display = "none"
      description = "已隐藏"
    } else if (lowerInstruction.includes("显示") || lowerInstruction.includes("show")) {
      styles.display = "block"
      description = "已显示"
    }

    // 圆角
    if (lowerInstruction.includes("圆角") || lowerInstruction.includes("rounded") || lowerInstruction.includes("圆润")) {
      styles.borderRadius = "0.5rem"
      description = description ? `${description}，添加圆角` : "添加圆角"
    }

    // 阴影
    if (lowerInstruction.includes("阴影") || lowerInstruction.includes("shadow")) {
      styles.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      description = description ? `${description}，添加阴影` : "添加阴影"
    }

    // 边框
    if (lowerInstruction.includes("边框") || lowerInstruction.includes("border") || lowerInstruction.includes("框")) {
      if (detectedColor) {
        styles.border = `2px solid ${detectedColor.rgb}`
        description = description ? `${description}，添加${detectedColor.name}边框` : `添加${detectedColor.name}边框`
      } else {
        styles.border = "2px solid currentColor"
        description = description ? `${description}，添加边框` : "添加边框"
      }
    }

    // 内边距
    if (lowerInstruction.includes("内边距") || lowerInstruction.includes("padding")) {
      if (lowerInstruction.includes("增加") || lowerInstruction.includes("more") || lowerInstruction.includes("大")) {
        styles.padding = "1.5rem"
        description = description ? `${description}，增加内边距` : "增加内边距"
      } else if (lowerInstruction.includes("减少") || lowerInstruction.includes("less") || lowerInstruction.includes("小")) {
        styles.padding = "0.25rem"
        description = description ? `${description}，减少内边距` : "减少内边距"
      }
    }

    // 宽度/高度
    if (lowerInstruction.includes("宽") || lowerInstruction.includes("width")) {
      if (lowerInstruction.includes("满") || lowerInstruction.includes("full") || lowerInstruction.includes("100")) {
        styles.width = "100%"
        description = description ? `${description}，宽度100%` : "宽度100%"
      } else if (lowerInstruction.includes("一半") || lowerInstruction.includes("50")) {
        styles.width = "50%"
        description = description ? `${description}，宽度50%` : "宽度50%"
      }
    }

    if (lowerInstruction.includes("高") || lowerInstruction.includes("height")) {
      if (lowerInstruction.includes("满") || lowerInstruction.includes("full") || lowerInstruction.includes("100")) {
        styles.height = "100%"
        description = description ? `${description}，高度100%` : "高度100%"
      }
    }

    // 透明度
    if (lowerInstruction.includes("透明") || lowerInstruction.includes("opacity")) {
      if (lowerInstruction.includes("半") || lowerInstruction.includes("50")) {
        styles.opacity = "0.5"
        description = description ? `${description}，半透明` : "半透明"
      } else if (lowerInstruction.includes("不透明") || lowerInstruction.includes("100")) {
        styles.opacity = "1"
        description = description ? `${description}，不透明` : "不透明"
      }
    }

    // 如果没有匹配到任何规则，尝试智能推断
    if (Object.keys(styles).length === 0) {
      // 尝试通用修改
      if (lowerInstruction.includes("漂亮") || lowerInstruction.includes("好看") || lowerInstruction.includes("美化")) {
        styles.borderRadius = "0.5rem"
        styles.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        styles.padding = "1rem"
        description = "美化样式：添加圆角、阴影和内边距"
      } else if (lowerInstruction.includes("突出") || lowerInstruction.includes("醒目") || lowerInstruction.includes("显眼")) {
        styles.fontWeight = "bold"
        styles.fontSize = "1.2em"
        styles.color = "rgb(59, 130, 246)"
        description = "突出显示：加粗、放大、蓝色"
      } else {
        return NextResponse.json({
          success: false,
          error: `无法理解指令 "${instruction}"。\n\n试试这些：\n• 颜色: "改为红色"、"背景变蓝色"\n• 字体: "字体变大"、"加粗"\n• 样式: "添加圆角"、"添加阴影"\n• 对齐: "居中"、"左对齐"\n• 通用: "让它更漂亮"、"突出显示"`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      styles,
      description,
      instruction,
      element: {
        selector: element.selector,
        label: element.label,
      },
    })
  } catch (error) {
    console.error("Element modification error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "修改元素时发生错误" 
      },
      { status: 500 }
    )
  }
}

/* 
 * 生产环境集成 OpenAI 示例：
 * 
 * import OpenAI from 'openai'
 * 
 * const openai = new OpenAI({
 *   apiKey: process.env.OPENAI_API_KEY,
 * })
 * 
 * const completion = await openai.chat.completions.create({
 *   model: "gpt-4",
 *   messages: [
 *     {
 *       role: "system",
 *       content: `你是一个 CSS 样式助手。用户会描述他们想要对一个 HTML 元素进行的修改。
 *                 你需要返回一个 JSON 对象，包含需要修改的 CSS 属性。
 *                 格式：{ "property": "value", ... }
 *                 只返回 JSON，不要其他解释。`
 *     },
 *     {
 *       role: "user",
 *       content: `元素信息：
 *                 标签: ${element.tagName}
 *                 描述: ${element.label}
 *                 当前类名: ${element.className}
 *                 
 *                 用户指令: ${instruction}`
 *     }
 *   ],
 *   temperature: 0.3,
 * })
 * 
 * const aiResponse = completion.choices[0].message.content
 * const styles = JSON.parse(aiResponse)
 */

