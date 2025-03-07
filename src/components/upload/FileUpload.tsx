'use client'

import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onUpload: (file: File) => void
  accept?: string
  maxSize?: number // MB
}

export function FileUpload({
  onUpload,
  accept = '*',
  maxSize = 5,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      [accept]: []
    },
    maxSize: maxSize * 1024 * 1024,
    multiple: false,
    onDropAccepted: ([file]) => {
      setError(null)
      onUpload(file)
    },
    onDropRejected: () => {
      setError(`请上传${maxSize}MB以内的${accept}文件`)
    },
    onError: (error: Error) => setError(error.message)
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>拖放文件到这里 ...</p>
        ) : (
          <p>点击或拖放文件到这里上传</p>
        )}
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
