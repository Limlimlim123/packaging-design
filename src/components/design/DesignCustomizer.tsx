'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, fabric } from 'fabric'
import { useCanvasObject } from '@/hooks/useCanvasObject'
import { useCanvasHistory } from '@/hooks/useCanvasHistory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dropzone } from '@/components/ui/dropzone'
import { SizeSelector } from '@/components/design-detail/SizeSelector'
import { MaterialSelector } from '@/components/design-detail/MaterialSelector'
import { PriceCalculator } from '@/components/design-detail/PriceCalculator'
import { useDesignState } from '@/hooks/useDesignState'
import { Type, Image as ImageIcon, Undo2, Redo2, Save } from 'lucide-react'

interface DesignCustomizerProps {
  templateUrl?: string
  onSave?: (designData: any) => void
}

export function DesignCustomizer({ templateUrl, onSave }: DesignCustomizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [textInput, setTextInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const { addText, addImage } = useCanvasObject(canvas)
  const { undo, redo, canUndo, canRedo } = useCanvasHistory(canvas)
  const { 
    selectedSize, 
    selectedMaterial, 
    quantity,
    sizes,
    materials,
    setSelectedSize,
    setSelectedMaterial,
    setQuantity
  } = useDesignState()

  // 初始化画布
  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 500,
        height: 500,
        backgroundColor: '#ffffff'
      })
      
      setCanvas(fabricCanvas)
      
      return () => {
        fabricCanvas.dispose()
      }
    }
  }, [])

  // 加载模板图片
  useEffect(() => {
    if (templateUrl && canvas) {
      fabric.Image.fromURL(
        templateUrl,
        (img) => {
          try {
            if (img && typeof img.scaleToWidth === 'function') {
              img.scaleToWidth(canvas.width)
              canvas.add(img)
              canvas.renderAll()
            } else {
              console.error('Error loading design image: Image object is invalid')
            }
          } catch (error) {
            console.error('Error loading design image:', error)
          }
        },
        { crossOrigin: 'anonymous' }
      )
    }
  }, [templateUrl, canvas])

  // 添加文字
  const handleAddText = () => {
    if (textInput.trim() && canvas) {
      addText(textInput)
      setTextInput('')
    }
  }

  // 处理图片上传
  const handleImageUpload = (files: File[]) => {
    if (files.length > 0 && canvas) {
      const file = files[0]
      const reader = new FileReader()
      
      reader.onload = (e) => {
        if (e.target?.result) {
          addImage(e.target.result as string)
        }
      }
      
      reader.readAsDataURL(file)
    }
  }

  // 保存设计
  const handleSave = () => {
    if (!selectedSize || !selectedMaterial || quantity < 1) {
      setErrorMessage('请选择尺寸、材质和数量')
      return
    }
    
    setErrorMessage('')
    
    if (canvas && onSave) {
      const designData = {
        canvasJson: canvas.toJSON(),
        size: selectedSize,
        material: selectedMaterial,
        quantity
      }
      
      onSave(designData)
    }
  }

  return (
    <div className="flex h-full gap-4">
      <div className="w-64 flex flex-col gap-4 p-4 border-r">
        {/* 文字工具 */}
        <div className="space-y-2">
          <h3 className="font-medium">添加文字</h3>
          <div className="flex gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="输入文字"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleAddText}
              data-testid="add-text-button"
              aria-label="添加文字"
            >
              <span className="flex items-center gap-2">
                <Type className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
        
        {/* 图片上传 */}
        <div className="space-y-2">
          <h3 className="font-medium">上传Logo</h3>
          <Dropzone onDrop={handleImageUpload}>
            <p>点击或拖放文件到这里上传</p>
          </Dropzone>
        </div>
        
        {/* 尺寸选择器 */}
        <SizeSelector 
          sizes={sizes || []} 
          selected={selectedSize?.id} 
          onChange={setSelectedSize} 
        />
        
        {/* 材质选择器 */}
        <MaterialSelector 
          materials={materials || []} 
          selected={selectedMaterial?.id} 
          onChange={setSelectedMaterial} 
        />
        
        {/* 价格计算器 */}
        <PriceCalculator 
          basePrice={100} 
          quantity={quantity} 
          setQuantity={setQuantity} 
          sizePrice={selectedSize?.price || 0}
          materialPrice={selectedMaterial?.price || 0}
        />
        
        {/* 错误消息 */}
        {errorMessage && (
          <div className="text-red-500 mt-2" data-testid="error-message">
            {errorMessage}
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="flex gap-2 mt-auto">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={undo}
            disabled={!canUndo}
            aria-label="撤销"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={redo}
            disabled={!canRedo}
            aria-label="重做"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button 
            className="flex-1"
            onClick={handleSave}
            data-testid="save-design-button"
          >
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              保存设计
            </span>
          </Button>
        </div>
      </div>
      
      {/* 设计画布 */}
      <div className="flex-1 p-4">
        <div className="border rounded-lg overflow-hidden">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  )
}