'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ZoomIn } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from '@/components/ui/dialog'

interface DesignPreviewProps {
  imageUrl: string
  title: string
}

export default function DesignPreview({ imageUrl, title }: DesignPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative group">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="icon">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="secondary" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 为了向后兼容，保留命名导出
export { DesignPreview }