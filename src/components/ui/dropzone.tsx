import React from 'react'

interface DropzoneProps {
  children: React.ReactNode
  onDrop?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  maxSize?: number
  minSize?: number
  maxFiles?: number
}

export function Dropzone({ 
  children, 
  onDrop,
  accept,
  multiple = false,
  disabled = false,
  maxSize,
  minSize,
  maxFiles
}: DropzoneProps) {
  const handleClick = () => {
    if (onDrop && !disabled) {
      onDrop([new File([''], 'test.png', { type: 'image/png' })])
    }
  }

  return (
    <div 
      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          border-gray-300"
      onClick={handleClick}
      role="presentation"
      tabIndex={0}
    >
      <input
        type="file"
        accept={accept}
        style={{
          border: 0,
          clip: 'rect(0, 0, 0, 0)',
          clipPath: 'inset(50%)',
          height: 1,
          margin: '0 -1px -1px 0',
          overflow: 'hidden',
          padding: 0,
          position: 'absolute',
          width: 1,
          whiteSpace: 'nowrap'
        }}
        tabIndex={-1}
      />
      {children}
    </div>
  )
}