'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import imageCompression from 'browser-image-compression'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageUploaderProps {
  onImageUpload: (file: File, croppedUrl?: string) => void
  maxSize?: number // 最大文件大小（MB）
  acceptedTypes?: string[] // 接受的文件类型
  aspectRatio?: number // 裁剪比例
  maxWidth?: number // 最大宽度
  maxHeight?: number // 最大高度
}

export function ImageUploader({ 
  onImageUpload, 
  maxSize = 5, 
  acceptedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'],
  aspectRatio,
  maxWidth = 1920,
  maxHeight = 1080
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [crop, setCrop] = useState<Crop>()
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const compressImage = async (file: File) => {
    setIsCompressing(true)
    try {
      const options = {
        maxSizeMB: maxSize,
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        useWebWorker: true,
        onProgress: setProgress
      }
      const compressedFile = await imageCompression(file, options)
      setIsCompressing(false)
      return compressedFile
    } catch (err) {
      setError('图片压缩失败')
      setIsCompressing(false)
      return file
    }
  }

  const validateFile = (file: File): boolean => {
    if (!acceptedTypes.includes(file.type)) {
      setError('不支持的文件类型')
      return false
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`)
      return false
    }

    return true
  }

  const createPreview = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      if (aspectRatio) {
        setIsCropperOpen(true)
      } else {
        handleUpload(file)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFile = async (file: File) => {
    if (validateFile(file)) {
      setOriginalFile(file)
      createPreview(file)
      setError(null)
    }
  }

  const handleUpload = async (file: File) => {
    const compressedFile = await compressImage(file)
    onImageUpload(compressedFile, preview || undefined)
  }

  const getCroppedImg = useCallback(async () => {
    if (!imageRef.current || !crop || !originalFile) return

    const canvas = document.createElement('canvas')
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], originalFile.name, {
            type: originalFile.type,
          })
          resolve(croppedFile)
        }
      }, originalFile.type)
    })
  }, [crop, originalFile])

  const handleCropComplete = async () => {
    if (!originalFile) return
    
    const croppedFile = await getCroppedImg()
    if (croppedFile) {
      setIsCropperOpen(false)
      handleUpload(croppedFile)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setOriginalFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative aspect-square rounded-lg overflow-hidden border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
          {isCompressing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
              <p className="mb-2">压缩中...</p>
              <Progress value={progress} className="w-1/2" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative aspect-square rounded-lg border-2 border-dashed
            flex flex-col items-center justify-center space-y-2 p-4
            cursor-pointer transition-colors
            ${dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <div className="p-3 bg-gray-100 rounded-full">
            <Upload className="h-6 w-6 text-gray-600" />
          </div>
          <div className="text-sm text-center">
            <p className="font-medium text-gray-800">点击或拖拽上传</p>
            <p className="text-gray-500">
              支持 {acceptedTypes.map(type => type.split('/')[1]).join('、')}
            </p>
            <p className="text-gray-500">
              最大 {maxSize}MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {/* 裁剪对话框 */}
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="max-w-screen-lg">
          <DialogHeader>
            <DialogTitle>裁剪图片</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="mt-4">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={aspectRatio}
              >
                <img
                  ref={imageRef}
                  src={preview}
                  alt="Crop"
                  style={{ maxHeight: '70vh' }}
                />
              </ReactCrop>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCropperOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleCropComplete}>
                  确定
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}