'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TextEditorProps {
  onAdd: (text: string) => void
}

export function TextEditor({ onAdd }: TextEditorProps) {
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState('24')
  const [fontFamily, setFontFamily] = useState('Arial')

  return (
    <div className="space-y-4">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入文字内容"
      />
      
      <div className="flex gap-4">
        <Select value={fontSize} onValueChange={setFontSize}>
          <SelectTrigger>
            <SelectValue placeholder="字号" />
          </SelectTrigger>
          <SelectContent>
            {[12, 14, 16, 20, 24, 32, 48].map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger>
            <SelectValue placeholder="字体" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Microsoft YaHei">微软雅黑</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={() => onAdd(text)}
        disabled={!text.trim()}
      >
        添加文字
      </Button>
    </div>
  )
}