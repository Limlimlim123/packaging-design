'use client'

import { useEffect, useState, Suspense } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { DesignPreview } from '@/components/designs/DesignPreview'
import { DesignInfo } from '@/components/designs/DesignInfo'
import { SizeSelector } from '@/components/design-detail/SizeSelector'
import { MaterialSelector } from '@/components/design-detail/MaterialSelector'
import { PriceCalculator } from '@/components/design-detail/PriceCalculator'
import { DesignEditor } from '@/components/design-editor/DesignEditor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useDesignState } from '@/hooks/useDesignState'
import { useToast } from '@/components/ui/Toast'
import { ToastContainer } from '@/components/ui/Toast'

interface DesignPageProps {
    params: {
        id: string
    }
}

function DesignPageSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                    <Skeleton className="aspect-square rounded-lg" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-[200px] w-full" />
                        <Skeleton className="h-[150px] w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DesignPage({ params }: DesignPageProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const {
        selectedSize,
        selectedMaterial,
        quantity,
        totalPrice,
        setSize,
        setMaterial,
        setQuantity,
        updatePrice
    } = useDesignState()

    const [template, setTemplate] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTemplate() {
            try {
                const response = await fetch(`/api/templates/${params.id}`)
                if (!response.ok) {
                    throw new Error('模板不存在')
                }
                const data = await response.json()
                setTemplate(data)
            } catch (error) {
                addToast({
                    message: '加载模板失败',
                    type: 'error'
                })
                router.push('/designs')
            } finally {
                setLoading(false)
            }
        }
        fetchTemplate()
    }, [params.id, addToast, router])

    if (loading) return <DesignPageSkeleton />
    if (!template) return notFound()

    const handleSaveDesign = async (canvas: fabric.Canvas) => {
        try {
            if (!selectedSize || !selectedMaterial || !quantity) {
                throw new Error('请选择尺寸、材质和数量')
            }

            const designData = canvas.toJSON()
            const response = await fetch(`/api/designs/${params.id}/customize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    design: designData,
                    templateId: params.id,
                    size: selectedSize,
                    material: selectedMaterial,
                    quantity: quantity
                })
            })

            if (!response.ok) {
                throw new Error('保存失败')
            }

            const result = await response.json()
            addToast({
                message: '设计保存成功',
                type: 'success'
            })

            router.push(`/orders/${result.id}/confirm`)
        } catch (error) {
            addToast({
                message: error instanceof Error ? error.message : '保存失败，请稍后重试',
                type: 'error'
            })
        }
    }

    const handleFavorite = async () => {
        try {
            const response = await fetch(`/api/designs/${params.id}/favorite`, {
                method: 'POST'
            })
            
            if (!response.ok) {
                throw new Error('收藏失败')
            }
            
            addToast({
                message: '收藏成功',
                type: 'success'
            })
        } catch (error) {
            addToast({
                message: '收藏失败，请稍后重试',
                type: 'error'
            })
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                    {/* 预览区 */}
                    <div className="space-y-4">
                        <Tabs defaultValue="preview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="preview">效果图</TabsTrigger>
                                <TabsTrigger value="3d">3D预览</TabsTrigger>
                                <TabsTrigger value="dieline">刀版图</TabsTrigger>
                                <TabsTrigger value="customize">开始定制</TabsTrigger>
                            </TabsList>

                            <TabsContent value="preview">
                                <DesignPreview template={template} />
                            </TabsContent>

                            <TabsContent value="3d">
                                <div className="aspect-square rounded-lg bg-white">
                                    <Suspense fallback={<Skeleton className="w-full h-full" />}>
                                        <DesignViewer modelUrl={template.images.threeD} />
                                    </Suspense>
                                </div>
                            </TabsContent>

                            <TabsContent value="dieline">
                                <img 
                                    src={template.images.dieline} 
                                    alt="刀版图"
                                    className="w-full rounded-lg"
                                />
                            </TabsContent>

                            <TabsContent value="customize" className="h-[600px]">
                                <DesignEditor
                                    templateUrl={template.images.flat}
                                    onSave={handleSaveDesign}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* 信息区 */}
                    <div className="space-y-6">
                        <DesignInfo template={template} />
                        
                        <SizeSelector
                            sizes={template.sizes}
                            value={selectedSize}
                            onChange={(size) => {
                                setSize(size)
                                updatePrice(template.price.base)
                            }}
                        />
                        
                        <MaterialSelector
                            materials={template.materials}
                            value={selectedMaterial}
                            onChange={(material) => {
                                setMaterial(material)
                                updatePrice(template.price.base)
                            }}
                        />
                        
                        <PriceCalculator
                            basePrice={template.price.base}
                            quantity={quantity}
                            totalPrice={totalPrice}
                            onQuantityChange={(newQuantity) => {
                                setQuantity(newQuantity)
                                updatePrice(template.price.base)
                            }}
                        />

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleFavorite}
                            >
                                收藏设计
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    const customizeTab = document.querySelector('[value="customize"]') as HTMLElement
                                    customizeTab?.click()
                                }}
                            >
                                开始定制
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}