'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'

interface UploadZoneProps {
    onUploadSuccess: (asset: any) => void
    type?: 'image' | 'logo'
    className?: string
}

export function UploadZone({ onUploadSuccess, type = 'image', className }: UploadZoneProps) {
    const { toast } = useToast()
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        onDrop: async (acceptedFiles, rejectedFiles) => {
            // 处理被拒绝的文件
            if (rejectedFiles.length > 0) {
                rejectedFiles.forEach(file => {
                    if (file.size > 5 * 1024 * 1024) {
                        toast({
                            title: '文件过大',
                            description: '请上传5MB以内的图片',
                            variant: 'destructive'
                        })
                    } else {
                        toast({
                            title: '不支持的文件类型',
                            description: '请上传PNG、JPG或GIF格式的图片',
                            variant: 'destructive'
                        })
                    }
                })
                return
            }

            // 上传文件
            for (const file of acceptedFiles) {
                try {
                    setUploading(true)
                    setProgress(0)

                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('type', type)

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    })

                    if (!response.ok) {
                        throw new Error('Upload failed')
                    }

                    const asset = await response.json()
                    onUploadSuccess(asset)
                    
                    toast({
                        title: '上传成功',
                        description: '文件已成功上传'
                    })
                } catch (error) {
                    toast({
                        title: '上传失败',
                        description: '请稍后重试',
                        variant: 'destructive'
                    })
                } finally {
                    setUploading(false)
                    setProgress(0)
                }
            }
        }
    })

    return (
        <div
            {...getRootProps()}
            className={`
                relative border-2 border-dashed rounded-lg p-8 text-center
                transition-colors cursor-pointer
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}
                ${className}
            `}
        >
            <input {...getInputProps()} />
            
            {uploading ? (
                <div className="space-y-4">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-gray-500">上传中...</p>
                </div>
            ) : (
                <>
                    <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-500">
                        {isDragActive ? '松开鼠标上传文件' : '拖拽文件到此处，或点击上传'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        支持 PNG、JPG、GIF 格式，最大 5MB
                    </p>
                </>
            )}
        </div>
    )
}