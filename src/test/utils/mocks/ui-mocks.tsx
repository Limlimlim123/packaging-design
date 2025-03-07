import React from 'react'

// 模拟 Dropzone 组件
export function Dropzone({ children, onDrop }: any) {
  return (
    <div 
      data-testid="mock-dropzone"
      onClick={() => onDrop && onDrop([new File([''], 'test.png', { type: 'image/png' })])}
    >
      {children}
    </div>
  )
}