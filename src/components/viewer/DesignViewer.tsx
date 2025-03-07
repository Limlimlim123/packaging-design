'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Design2DViewer } from './Design2DViewer'
import { ThreeDPreview } from './ThreeDPreview'
import { DielineViewer } from './DielineViewer'

interface DesignViewerProps {
  design: {
    width: number
    height: number
    preview2D: string
    preview3D?: string
    dieline?: string
  }
}

export function DesignViewer({ design }: DesignViewerProps) {
  const [activeView, setActiveView] = useState('2d')

  return (
    <Tabs value={activeView} onValueChange={setActiveView}>
      <TabsList>
        <TabsTrigger value="2d">2D 预览</TabsTrigger>
        <TabsTrigger value="3d">3D 预览</TabsTrigger>
        <TabsTrigger value="dieline">刀版图</TabsTrigger>
      </TabsList>

      <TabsContent value="2d">
        <Design2DViewer
          width={design.width}
          height={design.height}
          preview={design.preview2D}
          dieline={design.dieline}
        />
      </TabsContent>

      <TabsContent value="3d">
        <ThreeDPreview
          designImage={design.preview3D || design.preview2D}
          boxDimensions={{
            width: design.width,
            height: design.height,
            depth: design.width * 0.3 // 默认深度
          }}
        />
      </TabsContent>

      <TabsContent value="dieline">
        <DielineViewer
          width={design.width}
          height={design.height}
          dieline={design.dieline || ''}
          showMeasurements
        />
      </TabsContent>
    </Tabs>
  )
}