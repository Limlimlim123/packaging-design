"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useEditorStore } from "@/store/editor/editorStore"

interface ExportDialogProps {
  designId: string
}

export function ExportDialog({ designId }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const { canvas } = useEditorStore()

  const handleExport = async (format: string) => {
    if (!canvas) return

    let dataUrl
    switch (format) {
      case 'png':
        dataUrl = canvas.toDataURL({
          format: 'png',
          quality: 1
        })
        break
      case 'jpg':
        dataUrl = canvas.toDataURL({
          format: 'jpeg',
          quality: 0.8
        })
        break
      case 'svg':
        dataUrl = canvas.toSVG()
        break
      default:
        return
    }

    // 创建下载链接
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `design-${designId}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>导出设计</DialogTitle>
          <DialogDescription>
            选择导出格式
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={() => handleExport('png')}>PNG</Button>
          <Button onClick={() => handleExport('jpg')}>JPG</Button>
          <Button onClick={() => handleExport('svg')}>SVG</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}