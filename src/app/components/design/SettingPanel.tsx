'use client'

import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ColorPicker } from '@/components/ui/color-picker'
import { Slider } from '@/components/ui/slider'
import { 
  Grid3X3,
  Ruler,
  Maximize2,
  MinusSquare,
  PlusSquare,
  Save
} from 'lucide-react'

export function SettingsPanel() {
  const { 
    canvas,
    showGrid,
    setShowGrid,
    showGuides,
    setShowGuides,
    gridSize,
    setGridSize,
    snapThreshold,
    setSnapThreshold,
    backgroundColor,
    setBackgroundColor,
    width,
    setWidth,
    height,
    setHeight,
    saveSettings
  } = useEditorStore()

  const handleSave = async () => {
    try {
      await saveSettings()
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleResize = () => {
    if (!canvas) return
    canvas.setDimensions({ width, height })
    canvas.renderAll()
  }

  return (
    <div className="p-4 space-y-6">
      {/* 画布尺寸 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">画布尺寸</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>宽度 (px)</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={1}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWidth(width - 10)}
              >
                <MinusSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWidth(width + 10)}
              >
                <PlusSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>高度 (px)</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min={1}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setHeight(height - 10)}
              >
                <MinusSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setHeight(height + 10)}
              >
                <PlusSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleResize}
          className="w-full"
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          应用尺寸
        </Button>
      </div>

      {/* 背景颜色 */}
      <div className="space-y-2">
        <Label>背景颜色</Label>
        <ColorPicker
          color={backgroundColor}
          onChange={(color) => {
            setBackgroundColor(color)
            canvas?.setBackgroundColor(color, () => canvas.renderAll())
          }}
        />
      </div>

      {/* 网格设置 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center space-x-2">
            <Grid3X3 className="h-4 w-4" />
            <span>显示网格</span>
          </Label>
          <Switch
            checked={showGrid}
            onCheckedChange={setShowGrid}
          />
        </div>

        {showGrid && (
          <div className="space-y-2">
            <Label>网格大小 ({gridSize}px)</Label>
            <Slider
              value={[gridSize]}
              onValueChange={(values) => {
                const value = values[0]
                if (typeof value === 'number') {
                  setGridSize(value)
                }
              }}
              min={5}
              max={100}
              step={5}
            />
          </div>
        )}
      </div>

      {/* 辅助线设置 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center space-x-2">
            <Ruler className="h-4 w-4" />
            <span>显示辅助线</span>
          </Label>
          <Switch
            checked={showGuides}
            onCheckedChange={setShowGuides}
          />
        </div>

        {showGuides && (
          <div className="space-y-2">
            <Label>吸附阈值 ({snapThreshold}px)</Label>
            <Slider
              value={[snapThreshold]}
              onValueChange={(values) => {
                const value = values[0]
                if (typeof value === 'number') {
                  setSnapThreshold(value)
                }
              }}
              min={1}
              max={20}
              step={1}
            />
          </div>
        )}
      </div>

      {/* 保存设置 */}
      <Button
        className="w-full"
        onClick={handleSave}
      >
        <Save className="h-4 w-4 mr-2" />
        保存设置
      </Button>
    </div>
  )
}