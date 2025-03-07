'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useEditorStore } from '@/store/editor/editorStore'
import { ExportService } from '@/lib/exportService'

interface ExportSettings {
  format: 'png' | 'jpg' | 'pdf' | 'svg' | 'ai' | 'cdr'
  dpi: number
  bleed: number
  marks: boolean
  colorSpace: 'RGB' | 'CMYK'
  quality: number
}

export function ExportPanel() {
  const { canvas } = useEditorStore()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'pdf',
    dpi: 300,
    bleed: 3,
    marks: true,
    colorSpace: 'CMYK',
    quality: 100
  })

  const handleExport = async () => {
    if (!canvas) return

    try {
      setLoading(true)

      const exportService = new ExportService(canvas)
      const result = await exportService.export(settings)

      // 创建下载链接
      const blob = new Blob([result], {
        type: `${getMimeType(settings.format)}`
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `design.${settings.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMimeType = (format: string) => {
    const mimeTypes = {
      png: 'image/png',
      jpg: 'image/jpeg',
      pdf: 'application/pdf',
      svg: 'image/svg+xml',
      ai: 'application/postscript',
      cdr: 'application/x-cdr'
    }
    return mimeTypes[format as keyof typeof mimeTypes]
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">导出格式</label>
        <Select
          value={settings.format}
          onValueChange={(value: ExportSettings['format']) =>
            setSettings(prev => ({ ...prev, format: value }))
          }
        >
          <SelectItem value="png">PNG</SelectItem>
          <SelectItem value="jpg">JPG</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="svg">SVG</SelectItem>
          <SelectItem value="ai">AI</SelectItem>
          <SelectItem value="cdr">CDR</SelectItem>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">分辨率 (DPI)</label>
        <Input
          type="number"
          min="72"
          max="600"
          value={settings.dpi}
          onChange={(e) =>
            setSettings(prev => ({
              ...prev,
              dpi: parseInt(e.target.value) || 300
            }))
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">出血 (mm)</label>
        <Input
          type="number"
          min="0"
          max="10"
          value={settings.bleed}
          onChange={(e) =>
            setSettings(prev => ({
              ...prev,
              bleed: parseInt(e.target.value) || 0
            }))
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">裁切标记</label>
        <Switch
          checked={settings.marks}
          onCheckedChange={(checked) =>
            setSettings(prev => ({ ...prev, marks: checked }))
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">颜色空间</label>
        <Select
          value={settings.colorSpace}
          onValueChange={(value: ExportSettings['colorSpace']) =>
            setSettings(prev => ({ ...prev, colorSpace: value }))
          }
        >
          <SelectItem value="RGB">RGB</SelectItem>
          <SelectItem value="CMYK">CMYK</SelectItem>
        </Select>
      </div>

      {(settings.format === 'jpg' || settings.format === 'png') && (
        <div className="space-y-2">
          <label className="text-sm font-medium">质量 (%)</label>
          <Input
            type="number"
            min="1"
            max="100"
            value={settings.quality}
            onChange={(e) =>
              setSettings(prev => ({
                ...prev,
                quality: parseInt(e.target.value) || 100
              }))
            }
          />
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleExport}
        disabled={loading}
      >
        {loading ? '导出中...' : '导出'}
      </Button>
    </div>
  )
}