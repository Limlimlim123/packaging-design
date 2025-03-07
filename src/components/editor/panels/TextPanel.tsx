'use client'

import { useCallback, useState } from 'react'
import { fabric } from 'fabric'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ColorPicker } from '@/components/ui/color-picker'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Type,
    TextCursorInput
} from 'lucide-react'

const fontFamilies = [
    { label: '思源黑体', value: 'Source Han Sans CN' },
    { label: '思源宋体', value: 'Source Han Serif CN' },
    { label: '阿里巴巴普惠体', value: 'Alibaba PuHuiTi' },
    { label: '站酷高端黑', value: 'ZCOOL KuHei' },
    { label: '站酷文艺体', value: 'ZCOOL Wenyi' },
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' }
]

const textPresets = [
    { label: '标题', fontSize: 36, text: '输入标题' },
    { label: '副标题', fontSize: 24, text: '输入副标题' },
    { label: '正文', fontSize: 16, text: '输入正文内容' },
    { label: '注释', fontSize: 12, text: '输入注释文字' }
]

export function TextPanel() {
    const { 
        canvas, 
        addHistoryEntry,
        currentColor,
        setCurrentColor
    } = useEditorStore()
    
    const [text, setText] = useState('')
    const [fontSize, setFontSize] = useState(16)
    const [fontFamily, setFontFamily] = useState('Source Han Sans CN')
    const [bold, setBold] = useState(false)
    const [italic, setItalic] = useState(false)
    const [underline, setUnderline] = useState(false)
    const [textAlign, setTextAlign] = useState<string>('left')

    const addText = useCallback((preset?: typeof textPresets[0]) => {
        if (!canvas) return

        const textbox = new fabric.Textbox(preset?.text || text || '双击编辑文本', {
            left: 100,
            top: 100,
            fontSize: preset?.fontSize || fontSize,
            fontFamily,
            fill: currentColor,
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            underline,
            textAlign: textAlign as any,
            width: 200
        })

        canvas.add(textbox)
        canvas.setActiveObject(textbox)
        canvas.renderAll()
        addHistoryEntry()
    }, [canvas, text, fontSize, fontFamily, currentColor, bold, italic, underline, textAlign])

    const updateSelectedText = useCallback(() => {
        if (!canvas) return

        const activeObject = canvas.getActiveObject()
        if (!activeObject || !activeObject.isType('textbox')) return

        activeObject.set({
            fontSize,
            fontFamily,
            fill: currentColor,
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            underline,
            textAlign
        })

        canvas.renderAll()
        addHistoryEntry()
    }, [canvas, fontSize, fontFamily, currentColor, bold, italic, underline, textAlign])

    return (
        <div className="p-4 space-y-4">
            <Tabs defaultValue="add">
                <TabsList className="w-full">
                    <TabsTrigger value="add" className="flex-1">添加文本</TabsTrigger>
                    <TabsTrigger value="edit" className="flex-1">编辑文本</TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="space-y-4">
                    <div className="space-y-2">
                        <Label>预设文本</Label>
                        <ScrollArea className="h-[200px]">
                            <div className="grid grid-cols-2 gap-2">
                                {textPresets.map((preset, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="h-20 p-2"
                                        onClick={() => addText(preset)}
                                    >
                                        <div className="text-center">
                                            <div className="font-medium">{preset.label}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {preset.fontSize}px
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="space-y-2">
                        <Label>自定义文本</Label>
                        <div className="flex space-x-2">
                            <Input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="输入文本内容"
                            />
                            <Button onClick={() => addText()}>
                                <Type className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="edit" className="space-y-4">
                    <div className="space-y-2">
                        <Label>字体</Label>
                        <select
                            value={fontFamily}
                            onChange={(e) => {
                                setFontFamily(e.target.value)
                                updateSelectedText()
                            }}
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3"
                        >
                            {fontFamilies.map((font) => (
                                <option key={font.value} value={font.value}>
                                    {font.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>字号</Label>
                        <Slider
                            value={[fontSize]}
                            onValueChange={([value]) => {
                                setFontSize(value)
                                updateSelectedText()
                            }}
                            min={8}
                            max={144}
                            step={1}
                        />
                        <div className="text-xs text-right text-muted-foreground">
                            {fontSize}px
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>颜色</Label>
                        <ColorPicker
                            color={currentColor}
                            onChange={(color) => {
                                setCurrentColor(color)
                                updateSelectedText()
                            }}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant={bold ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => {
                                setBold(!bold)
                                updateSelectedText()
                            }}
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={italic ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => {
                                setItalic(!italic)
                                updateSelectedText()
                            }}
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={underline ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => {
                                setUnderline(!underline)
                                updateSelectedText()
                            }}
                        >
                            <Underline className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant={textAlign === 'left' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => {
                                setTextAlign('left')
                                updateSelectedText()
                            }}
                        >
                            <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={textAlign === 'center' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => {
                                setTextAlign('center')
                                updateSelectedText()
                            }}
                        >
                            <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={textAlign === 'right' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => {
                                setTextAlign('right')
                                updateSelectedText()
                            }}
                        >
                            <AlignRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={textAlign === 'justify' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => {
                                setTextAlign('justify')
                                updateSelectedText()
                            }}
                        >
                            <AlignJustify className="h-4 w-4" />
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}