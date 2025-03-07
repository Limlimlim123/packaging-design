'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PreviewPageProps {
    params: {
        id: string
    }
}

export default function PreviewPage({ params }: PreviewPageProps) {
    const [loading, setLoading] = useState(true)
    const [design, setDesign] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const loadDesign = async () => {
            try {
                const response = await fetch(`/api/designs/${params.id}/preview`)
                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data.error)
                }

                setDesign(data)
            } catch (error) {
                setError('加载预览失败')
            } finally {
                setLoading(false)
            }
        }

        loadDesign()
    }, [params.id])

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error || !design) {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => router.push('/designs')}>
                    返回设计列表
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                {/* 预览头部 */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h1 className="text-2xl font-bold mb-2">{design.name}</h1>
                    <p className="text-gray-500">{design.description}</p>
                    <div className="mt-4 flex space-x-4">
                        <Button onClick={() => router.push(`/editor/${design.id}`)}>
                            编辑设计
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/designs')}>
                            返回列表
                        </Button>
                    </div>
                </div>

                {/* 预览画布 */}
                <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
                    <div
                        className="border shadow-lg"
                        style={{
                            width: design.width,
                            height: design.height,
                            backgroundImage: `url(${design.previewUrl})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}