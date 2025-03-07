'use client'

import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Edit2, Share2, Heart } from 'lucide-react'

interface DesignInfoProps {
  title: string
  description: string
  author: {
    name: string
    avatar: string
  }
  createdAt: string
  likes: number
  onEdit?: () => void
  onShare?: () => void
  onLike?: () => void
}

export default function DesignInfo({
  title,
  description,
  author,
  createdAt,
  likes,
  onEdit,
  onShare,
  onLike
}: DesignInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onLike}>
            <Heart className="h-4 w-4" />
            <span className="ml-2">{likes}</span>
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground">{description}</p>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-medium">{author.name}</span>
        </div>
        <span className="text-muted-foreground">
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  )
}

// 为了向后兼容，保留命名导出
export { DesignInfo }