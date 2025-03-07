'use client'

import { useState } from 'react'
import { TwoDPreview } from './2DPreview'
import { ThreeDPreview } from './3DPreview'
import { DielinePreview } from './DielinePreview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PreviewPanelProps {
  design: {
    images: {
      flat: string    // 平面效果图
      threeD: string  // 3D效果图
      dieline: string // 刀版图
    }
    dimensions?: {
      width: number
      height: number
      depth: number
    }
  }
}

export function PreviewPanel({ design }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState('2d')

  return (
    <div className="h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="2d">平面效果图</TabsTrigger>
          <TabsTrigger value="3d">3D效果图</TabsTrigger>
          <TabsTrigger value="dieline">刀版图</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 h-[calc(100%-48px)]">
          <TabsContent value="2d" className="h-full">
            <TwoDPreview imageUrl={design.images.flat} />
          </TabsContent>
          
          <TabsContent value="3d" className="h-full">
            <ThreeDPreview 
              designImage={design.images.threeD}
              boxDimensions={design.dimensions || {
                width: 2,
                height: 1.5,
                depth: 1
              }}
            />
          </TabsContent>
          
          <TabsContent value="dieline" className="h-full">
            <DielinePreview imageUrl={design.images.dieline} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}