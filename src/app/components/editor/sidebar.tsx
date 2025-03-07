'use client'

import { TextPanel } from './panels/TextPanel'
import { LogoUploadPanel } from './panels/LogoUploadPanel'

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-white">
      <div className="p-4">
        <TextPanel />
        <LogoUploadPanel />
      </div>
    </div>
  )
}