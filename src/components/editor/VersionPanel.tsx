'use client'

import { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Version {
  id: string
  name: string
  thumbnail: string
  createdAt: string
}

export function VersionPanel() {
  const [versions, setVersions] = useState<Version[]>([])
  const [versionName, setVersionName] = useState('')
  const [loading, setLoading] = useState(false)
  const { canvas, designId } = useEditorStore()

  // 加载版本列表
  useEffect(() => {
    if (!designId) return
    fetchVersions()
  }, [designId])

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/designs/${designId}/versions`)
      const data = await response.json()
      setVersions(data)
    } catch (error) {
      console.error('Failed to fetch versions:', error)
    }
  }

  // 创建新版本
  const createVersion = async () => {
    if (!canvas || !designId) return

    try {
      setLoading(true)

      const thumbnail = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.5,
        multiplier: 0.1
      })

      const content = JSON.stringify(canvas.toJSON(['id', 'name', 'locked', 'data']))

      await fetch(`/api/designs/${designId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: versionName || `版本 ${versions.length + 1}`,
          content,
          thumbnail
        })
      })

      setVersionName('')
      fetchVersions()
    } catch (error) {
      console.error('Failed to create version:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载版本
  const loadVersion = async (version: Version) => {
    try {
      const response = await fetch(`/api/designs/${designId}/versions/${version.id}`)
      const data = await response.json()
      
      canvas?.loadFromJSON(JSON.parse(data.content), () => {
        canvas.renderAll()
      })
    } catch (error) {
      console.error('Failed to load version:', error)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="版本名称"
          value={versionName}
          onChange={(e) => setVersionName(e.target.value)}
        />
        <Button
          onClick={createVersion}
          disabled={loading}
        >
          保存版本
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => loadVersion(version)}
            >
              <div className="flex items-center space-x-2">
                <img
                  src={version.thumbnail}
                  alt={version.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <div className="font-medium">{version.name}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(version.createdAt), 'PPp', { locale: zhCN })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}