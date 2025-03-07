'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, Edit } from 'lucide-react'

interface TemplateCardProps {
  template: Template
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter()

  return (
    <div className="group relative rounded-lg overflow-hidden border hover:border-primary transition-colors">
      {/* 预览图 */}
      <div 
        className="aspect-[3/4] relative cursor-pointer"
        onClick={() => router.push(`/templates/${template.id}`)}
      >
        <Image
          src={template.preview}
          alt={template.name}
          fill
          className="object-cover"
        />
      </div>

      {/* 悬浮操作 */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
        <Button 
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/templates/${template.id}`)}
        >
          <Eye className="w-4 h-4 mr-2" />
          预览
        </Button>
        <Button 
          size="sm"
          onClick={() => router.push(`/editor/new?template=${template.id}`)}
        >
          <Edit className="w-4 h-4 mr-2" />
          使用
        </Button>
      </div>

      {/* 模板信息 */}
      <div className="p-3 bg-white">
        <h3 className="font-medium">{template.name}</h3>
        <p className="text-sm text-gray-500">
          {template.size.width} x {template.size.height} cm
        </p>
      </div>
    </div>
  )
}