'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { useEditorStore } from '@/store/editor/editorStore'
import { fabric } from 'fabric'
import { generateUploadUrl, getPublicUrl } from '@/lib/uploadService'

export function LogoUploadPanel() {
  const [uploading, setUploading] = useState(false)
  const { canvas } = useEditorStore()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files?.[0]) return

    try {
      setUploading(true)
      const file = e.target.files[0]

      // 生成上传URL
      const key = `logos/${Date.now()}-${file.name}`
      const uploadUrl = await generateUploadUrl(key, file.type)

      // 上传文件
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      // 获取公共URL
      const publicUrl = getPublicUrl(key)

      // 添加到画布
      fabric.Image.fromURL(publicUrl, (img) => {
        // 调整大小
        const maxSize = 200
        if (img.width && img.height) {
          if (img.width > img.height) {
            img.scaleToWidth(maxSize)
          } else {
            img.scaleToHeight(maxSize)
          }
        }

        // 设置位置
        img.set({
          left: (canvas.width ?? 0) / 2 - ((img.width ?? 0) * (img.scaleX ?? 1)) / 2,
          top: (canvas.height ?? 0) / 2 - ((img.height ?? 0) * (img.scaleY ?? 1)) / 2,
          name: 'Logo',
          id: `logo-${Date.now()}`,
          data: {
            type: 'logo',
            originalUrl: publicUrl
          }
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
      })
    } catch (error) {
      console.error('Logo upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="text-sm font-medium">上传Logo</div>
      <div className="grid gap-4">
        <Button
          variant="outline"
          className="w-full"
          disabled={uploading}
        >
          <label className="flex items-center justify-center w-full cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? '上传中...' : '选择文件'}
            <Input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </Button>
      </div>
    </div>
  )
}