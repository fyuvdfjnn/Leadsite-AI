/**
 * 元素状态 API
 * 用于云端持久化存储
 */

import { NextRequest, NextResponse } from 'next/server'

// 内存存储（生产环境应替换为数据库）
const elementStates = new Map<string, Record<string, unknown>>()

// GET - 获取所有元素状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId') || 'default'
  
  const states = Array.from(elementStates.entries())
    .filter(([, state]) => state.pageId === pageId)
    .map(([id, state]) => ({ id, ...state }))
  
  return NextResponse.json({
    success: true,
    data: states,
    count: states.length
  })
}

// POST - 保存元素状态
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...state } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing element id' },
        { status: 400 }
      )
    }
    
    // 保存状态
    elementStates.set(id, {
      ...state,
      updatedAt: Date.now()
    })
    
    return NextResponse.json({
      success: true,
      data: { id, ...state }
    })
  } catch (error) {
    console.error('[API] Failed to save element state:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save element state' },
      { status: 500 }
    )
  }
}

// DELETE - 删除元素状态
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing element id' },
      { status: 400 }
    )
  }
  
  const deleted = elementStates.delete(id)
  
  return NextResponse.json({
    success: true,
    deleted
  })
}

// PUT - 批量更新元素状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { states } = body
    
    if (!Array.isArray(states)) {
      return NextResponse.json(
        { success: false, error: 'States must be an array' },
        { status: 400 }
      )
    }
    
    const results: { id: string; success: boolean }[] = []
    
    states.forEach((state: Record<string, unknown>) => {
      const id = state.id as string
      if (id) {
        elementStates.set(id, {
          ...state,
          updatedAt: Date.now()
        })
        results.push({ id, success: true })
      } else {
        results.push({ id: 'unknown', success: false })
      }
    })
    
    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('[API] Failed to batch update:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to batch update' },
      { status: 500 }
    )
  }
}









