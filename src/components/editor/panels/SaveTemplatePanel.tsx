'use client'

import { useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

export function SaveTemplatePanel() {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [style, setStyle] = useState('')
  const [saving, setSaving] = useState(false)
  
  const { canvas } = useEditorStore()
  const { toast } = useToast()

  const saveAsTemplate = async () => {
    if (!canvas) return

    try {
      setSaving(true)

      const thumbnail = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.5,
        multiplier: 0.1
      })

      const content = JSON.stringify(canvas.toJSON(['id', 'name', 'locked', 'data']))

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          category,
          style,
          content,
          thumbnail,
          preview: thumbnail, // 这里应该生成更高质量的预览图
          preview3d: thumbnail, // 这里应该生成3D预览
          dieline: thumbnail // 这里应该生成刀版图
        })
      })

      if (!response.ok) throw new Error('Failed to save template')

      toast({
        title: '保存成功',
        description: '模板已保存'
      })

      // 清空表单
      setName('')
      setType('')
      setCategory('')
      setStyle('')
    } catch (error) {
      console.error('Failed to save template:', error)
      toast({
        title: '保存失败',
        description: '无法保存模板',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Input
        placeholder="模板名称"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Select
        value={type}
        onValueChange={setType}
        placeholder="包装类型"
        options={[
          { value: '盒型', label: '盒型' },
          { value: '袋型', label: '袋型' }
        ]}
      />
      <Select
        value={category}
        onValueChange={setCategory}
        placeholder="产品类别"
        options={[
          { value: '食品', label: '食品' },
          { value: '服装', label: '服装' },
          { value: '电子', label: '电子' }
        ]}
      />
      <Select
        value={style}
        onValueChange={setStyle}
        placeholder="设计风格"
        options={[
          { value: '简约', label: '简约' },
          { value: '奢华', label: '奢华' },
          { value: '可爱', label: '可爱' }
        ]}
      />
      <Button
        className="w-full"
        onClick={saveAsTemplate}
        disabled={saving || !name || !type || !category || !style}
      >
        {saving ? '保存中...' : '保存为模板'}
      </Button>
    </div>
  )
}