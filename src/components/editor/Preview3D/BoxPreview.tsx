'use client'

import { ThreeDPreview } from './ThreeDPreview'

interface BoxPreviewProps {
  width: number
  height: number
  depth: number
  texture: string
}

export function BoxPreview({ width, height, depth, texture }: BoxPreviewProps) {
  return (
    <ThreeDPreview
      designImage={texture}
      boxDimensions={{
        width,
        height,
        depth
      }}
      renderMode="vanilla" // 使用原生 Three.js 实现，保持与原来相同的渲染方式
    />
  )
}