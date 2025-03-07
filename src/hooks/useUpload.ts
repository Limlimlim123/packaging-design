import { useState } from 'react'

interface UploadOptions {
    onSuccess?: (url: string) => void
    onError?: (error: string) => void
}

export function useUpload(options: UploadOptions = {}) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const upload = async (file: File) => {
        try {
            setIsUploading(true)
            setError(null)

            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || '上传失败')
            }

            options.onSuccess?.(data.url)
            return data.url
        } catch (err) {
            const message = err instanceof Error ? err.message : '上传失败'
            setError(message)
            options.onError?.(message)
            throw err
        } finally {
            setIsUploading(false)
        }
    }

    return {
        upload,
        isUploading,
        error,
    }
}