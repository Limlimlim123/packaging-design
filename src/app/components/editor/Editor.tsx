'use client'

import { Sidebar } from './sidebar'
import { DesignCanvas } from '../design/DesignCanvas'

export function Editor() {
  return (
    <div className="flex-1 flex">
      <Sidebar />
      <div className="flex-1 relative">
        <DesignCanvas 
          width={800}  // 添加默认宽度
          height={600} // 添加默认高度
        />
      </div>
    </div>
  )
}