'use client'

import { useEditorStore } from '@/store/editor/editorStore'
import { fabric } from 'fabric'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Type, TypeH1, TypeH2, TypeH3 } from 'lucide-react'

const TEXT_PRESETS = [
  {
    name: '标题',
    icon: TypeH1,
    fontSize: 48,
    fontWeight: 'bold',
    text: '标题文本'
  },
  {
    name: '副标题',
    icon: TypeH2,
    fontSize: 36,
    fontWeight: 'normal',
    text: '副标题文本'
  },
  {
    name: '正文',
    icon: Type,
    fontSize: 24,
    fontWeight: 'normal',
    text: '正文文本'
  },
  {
    name: '小标题',
    icon: TypeH3,
    fontSize: 18,
    fontWeight: 'normal',
    text: '小标题文本'
  }
]

const FONTS = [
  { label: '默认字体', value: 'Arial' },
  { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' },
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '楷体', value: 'KaiTi' }
]

export function TextPanel() {
  const { canvas, addToHistory } = useEditorStore()
  const { toast } = useToast()

  const addText = (preset: typeof TEXT_PRESETS[0]) => {
    if (!canvas) return

    try {
      const text = new fabric.IText(preset.text, {
        left: 100,
        top: 100,
        fontSize: preset.fontSize,
        fontFamily: 'Arial',
        fontWeight: preset.fontWeight,
        fill: '#000000',
        editable: true
      })

      canvas.add(text)
      canvas.setActiveObject(text)
      addToHistory()
      canvas.renderAll()

      toast({
        description: `已添加${preset.name}`
      })
    } catch (error) {
      console.error('添加文本失败:', error)
      toast({
        title: "添加失败",
        description: "无法添加文本，请重试",
        variant: "destructive"
      })
    }
  }

  const addCustomText = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canvas) return

    try {
      const formData = new FormData(e.currentTarget)
      const text = formData.get('text') as string
      const font = formData.get('font') as string

      if (!text.trim()) {
        toast({
          description: "请输入文本内容",
          variant: "destructive"
        })
        return
      }

      const textObj = new fabric.IText(text, {
        left: 100,
        top: 100,
        fontSize: 24,
        fontFamily: font,
        fill: '#000000',
        editable: true
      })

      canvas.add(textObj)
      canvas.setActiveObject(textObj)
      addToHistory()
      canvas.renderAll()
      
      e.currentTarget.reset()
      toast({
        description: "已添加自定义文本"
      })
    } catch (error) {
      console.error('添加自定义文本失败:', error)
      toast({
        title: "添加失败",
        description: "无法添加文本，请重试",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4 p-4">
      {/* 文本预设 */}
      <div className="grid grid-cols-2 gap-2">
        {TEXT_PRESETS.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center"
            onClick={() => addText(preset)}
          >
            <preset.icon className="w-8 h-8 mb-1" />
            <span className="text-xs">{preset.name}</span>
          </Button>
        ))}
      </div>

      {/* 自定义文本 */}
      <form onSubmit={addCustomText} className="space-y-4">
        <div>
          <Label>自定义文本</Label>
          <Input
            name="text"
            placeholder="输入文本内容..."
            className="mt-1"
          />
        </div>

        <div>
          <Label>选择字体</Label>
          <select
            name="font"
            className="w-full mt-1 border rounded-md p-2"
            defaultValue={FONTS[0].value}
          >
            {FONTS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" className="w-full">
          添加文本
        </Button>
      </form>
    </div>
  )
}