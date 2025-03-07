'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThreeDPreview } from '@/components/design/ThreeDPreview'

interface ImagePreviewProps {
  images: {
    flat: string    // 平面效果图
    threeD: string  // 3D效果图
    dieline: string // 刀版图
  }
  dimensions: {
    width: number
    height: number
    depth: number
  }
}

export function ImagePreview({ images, dimensions }: ImagePreviewProps) {
  const [activeTab, setActiveTab] = useState('flat')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="flat">平面效果图</TabsTrigger>
        <TabsTrigger value="3d">3D效果图</TabsTrigger>
        <TabsTrigger value="dieline">刀版图</TabsTrigger>
      </TabsList>

      <TabsContent value="flat">
        <div className="aspect-square rounded-lg overflow-hidden">
          <img 
            src={images.flat} 
            alt="平面效果图"
            className="w-full h-full object-contain" 
          />
        </div>
      </TabsContent>

      <TabsContent value="3d">
        <ThreeDPreview
          designImage={images.threeD}
          boxDimensions={dimensions}
        />
      </TabsContent>

      <TabsContent value="dieline">
        <div className="aspect-square rounded-lg overflow-hidden">
          <img 
            src={images.dieline} 
            alt="刀版图"
            className="w-full h-full object-contain" 
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}