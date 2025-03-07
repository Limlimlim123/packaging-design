'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TwoDPreviewProps {
  imageUrl: string
}

export function TwoDPreview({ imageUrl }: TwoDPreviewProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  return (
    <div className="relative h-full bg-gray-100 rounded-lg overflow-hidden">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          title="放大"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          title="缩小"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleRotate}
          title="旋转"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
        <div
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease'
          }}
        >
          <Image
            src={imageUrl}
            alt="平面效果图"
            width={800}
            height={600}
            className="object-contain"
            onLoadingComplete={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  )
}