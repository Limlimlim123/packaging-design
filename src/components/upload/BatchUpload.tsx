'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { X, CheckCircle, XCircle } from 'lucide-react'

interface UploadFile {
    id: string
    file: File
    progress: number
    status: 'pending' | 'uploading' | 'success' | 'error'
    error?: string
}

export function BatchUpload() {
    const [files, setFiles] = useState<UploadFile[]>([])

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        onDrop: (acceptedFiles) => {
            const newFiles = acceptedFiles.map(file => ({
                id: Math.random().toString(36),
                file,
                progress: 0,
                status: 'pending' as const
            }))
            setFiles(prev => [...prev, ...newFiles])
        }
    })

    // 上传单个文件
    const uploadFile = async (fileInfo: UploadFile) => {
        try {
            const formData = new FormData()
            formData.append('file', fileInfo.file)

            const xhr = new XMLHttpRequest()
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100
                    setFiles(prev => prev.map(f => 
                        f.id === fileInfo.id 
                            ? { ...f, progress, status: 'uploading' }
                            : f
                    ))
                }
            }

            xhr.onload = () => {
                if (xhr.status === 200) {
                    setFiles(prev => prev.map(f =>
                        f.id === fileInfo.id
                            ? { ...f, progress: 100, status: 'success' }
                            : f
                    ))
                } else {
                    throw new Error('Upload failed')
                }
            }

            xhr.onerror = () => {
                throw new Error('Upload failed')
            }

            xhr.open('POST', '/api/upload')
            xhr.send(formData)
        } catch (error) {
            setFiles(prev => prev.map(f =>
                f.id === fileInfo.id
                    ? { ...f, status: 'error', error: '上传失败' }
                    : f
            ))
        }
    }

    // 开始批量上传
    const startUpload = () => {
        const pendingFiles = files.filter(f => f.status === 'pending')
        pendingFiles.forEach(uploadFile)
    }

    // 移除文件
    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    return (
        <div className="space-y-4">
            {/* 拖拽区域 */}
            <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-lg p-8 text-center"
            >
                <input {...getInputProps()} />
                <p className="text-sm text-gray-500">
                    拖拽多个文件到此处，或点击选择文件
                </p>
            </div>

            {/* 文件列表 */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map(file => (
                        <div
                            key={file.id}
                            className="flex items-center space-x-4 p-2 border rounded"
                        >
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="text-sm">{file.file.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFile(file.id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Progress value={file.progress} className="mt-2" />
                            </div>
                            {file.status === 'success' && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {file.status === 'error' && (
                                <XCircle className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                    ))}

                    {/* 上传按钮 */}
                    <Button
                        onClick={startUpload}
                        disabled={!files.some(f => f.status === 'pending')}
                    >
                        开始上传
                    </Button>
                </div>
            )}
        </div>
    )
}