'use client'

import { useCallback } from 'react'
import type { Canvas } from 'fabric'
import { 
    Type, 
    Image as ImageIcon, 
    Square,
    Circle,
    Undo2,
    Redo2,
    Save,
    Download,
    Copy,
    Trash2,
    AlignHorizontalJustifyCenter,
    AlignVerticalJustifyCenter,
    MoveHorizontal,
    MoveVertical,
    Group,
    Ungroup,
    ZoomIn,
    ZoomOut,
    RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolbarProps {
    canvas: Canvas | null
    canUndo: boolean
    canRedo: boolean
    onUndo: () => void
    onRedo: () => void
    onSave: () => void
    zoom: number
    onZoomChange: (zoom: number) => void
}

export default function Toolbar({
    canvas,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onSave,
    zoom,
    onZoomChange
}: ToolbarProps) {
    // 添加文本
    const addText = useCallback(() => {
        if (!canvas) return
        const text = new fabric.IText('双击编辑文本', {
            left: 100,
            top: 100,
            fontSize: 20,
            fontFamily: 'Arial'
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        canvas.renderAll()
    }, [canvas])

    // 添加图片
    const addImage = useCallback(async () => {
        if (!canvas) return
        try {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (!file) return

                const reader = new FileReader()
                reader.onload = (event) => {
                    const img = new Image()
                    img.onload = () => {
                        const fabricImage = new fabric.Image(img)
                        // 调整图片大小以适应画布
                        const scale = Math.min(
                            300 / fabricImage.width!,
                            300 / fabricImage.height!
                        )
                        fabricImage.scale(scale)
                        fabricImage.set({
                            left: 100,
                            top: 100
                        })
                        canvas.add(fabricImage)
                        canvas.setActiveObject(fabricImage)
                        canvas.renderAll()
                    }
                    img.src = event.target?.result as string
                }
                reader.readAsDataURL(file)
            }
            input.click()
        } catch (error) {
            console.error('添加图片失败:', error)
        }
    }, [canvas])

    // 添加矩形
    const addRect = useCallback(() => {
        if (!canvas) return
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: '#e5e7eb'
        })
        canvas.add(rect)
        canvas.setActiveObject(rect)
        canvas.renderAll()
    }, [canvas])

    // 添加圆形
    const addCircle = useCallback(() => {
        if (!canvas) return
        const circle = new fabric.Circle({
            left: 100,
            top: 100,
            radius: 50,
            fill: '#e5e7eb'
        })
        canvas.add(circle)
        canvas.setActiveObject(circle)
        canvas.renderAll()
    }, [canvas])

    // 复制选中对象
    const duplicateSelected = useCallback(() => {
        if (!canvas) return
        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        activeObject.clone((cloned: fabric.Object) => {
            cloned.set({
                left: activeObject.left! + 20,
                top: activeObject.top! + 20
            })
            canvas.add(cloned)
            canvas.setActiveObject(cloned)
            canvas.renderAll()
        })
    }, [canvas])

    // 删除选中对象
    const deleteSelected = useCallback(() => {
        if (!canvas) return
        const activeObjects = canvas.getActiveObjects()
        canvas.remove(...activeObjects)
        canvas.discardActiveObject()
        canvas.renderAll()
    }, [canvas])

    // 水平居中
    const centerHorizontally = useCallback(() => {
        if (!canvas) return
        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        const canvasCenter = canvas.getCenter()
        activeObject.set({
            left: canvasCenter.left
        })
        activeObject.setCoords()
        canvas.renderAll()
    }, [canvas])

    // 垂直居中
    const centerVertically = useCallback(() => {
        if (!canvas) return
        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        const canvasCenter = canvas.getCenter()
        activeObject.set({
            top: canvasCenter.top
        })
        activeObject.setCoords()
        canvas.renderAll()
    }, [canvas])

    // 组合对象
    const groupObjects = useCallback(() => {
        if (!canvas) return
        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length < 2) return

        const group = new fabric.Group(activeObjects)
        canvas.discardActiveObject()
        activeObjects.forEach(obj => canvas.remove(obj))
        canvas.add(group)
        canvas.setActiveObject(group)
        canvas.renderAll()
    }, [canvas])

    // 解组
    const ungroupObjects = useCallback(() => {
        if (!canvas) return
        const activeObject = canvas.getActiveObject()
        if (!activeObject || !(activeObject instanceof fabric.Group)) return

        const items = activeObject.getObjects()
        activeObject.destroy()
        canvas.remove(activeObject)
        canvas.add(...items)
        canvas.renderAll()
    }, [canvas])

    // 导出为图片
    const exportImage = useCallback(() => {
        if (!canvas) return
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1
        })
        const link = document.createElement('a')
        link.download = 'design.png'
        link.href = dataURL
        link.click()
    }, [canvas])

    return (
        <div className="h-16 border-b bg-white px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                {/* 基础工具 */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <ToolbarButton
                        onClick={addText}
                        icon={Type}
                        title="添加文本"
                    />
                    <ToolbarButton
                        onClick={addImage}
                        icon={ImageIcon}
                        title="添加图片"
                    />
                    <ToolbarButton
                        onClick={addRect}
                        icon={Square}
                        title="添加矩形"
                    />
                    <ToolbarButton
                        onClick={addCircle}
                        icon={Circle}
                        title="添加圆形"
                    />
                </div>

                {/* 编辑工具 */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <ToolbarButton
                        onClick={duplicateSelected}
                        icon={Copy}
                        title="复制"
                    />
                    <ToolbarButton
                        onClick={deleteSelected}
                        icon={Trash2}
                        title="删除"
                        className="text-red-500 hover:text-red-600"
                    />
                </div>

                {/* 对齐工具 */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <ToolbarButton
                        onClick={centerHorizontally}
                        icon={AlignHorizontalJustifyCenter}
                        title="水平居中"
                    />
                    <ToolbarButton
                        onClick={centerVertically}
                        icon={AlignVerticalJustifyCenter}
                        title="垂直居中"
                    />
                </div>

                {/* 组合工具 */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <ToolbarButton
                        onClick={groupObjects}
                        icon={Group}
                        title="组合"
                    />
                    <ToolbarButton
                        onClick={ungroupObjects}
                        icon={Ungroup}
                        title="解组"
                    />
                </div>

                {/* 缩放工具 */}
                <div className="flex items-center space-x-1">
                    <ToolbarButton
                        onClick={() => onZoomChange(zoom - 0.1)}
                        icon={ZoomOut}
                        title="缩小"
                        disabled={zoom <= 0.1}
                    />
                    <span className="text-sm text-gray-500 w-16 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <ToolbarButton
                        onClick={() => onZoomChange(zoom + 0.1)}
                        icon={ZoomIn}
                        title="放大"
                        disabled={zoom >= 5}
                    />
                </div>
            </div>

            {/* 历史记录和保存 */}
            <div className="flex items-center space-x-2">
                <ToolbarButton
                    onClick={onUndo}
                    icon={Undo2}
                    title="撤销"
                    disabled={!canUndo}
                />
                <ToolbarButton
                    onClick={onRedo}
                    icon={Redo2}
                    title="重做"
                    disabled={!canRedo}
                />
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <ToolbarButton
                    onClick={onSave}
                    icon={Save}
                    title="保存"
                />
                <ToolbarButton
                    onClick={exportImage}
                    icon={Download}
                    title="导出"
                />
            </div>
        </div>
    )
}

// 工具栏按钮组件
interface ToolbarButtonProps {
    onClick: () => void
    icon: React.ElementType
    title: string
    disabled?: boolean
    className?: string
}

function ToolbarButton({
    onClick,
    icon: Icon,
    title,
    disabled = false,
    className
}: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className
            )}
            title={title}
        >
            <Icon className="h-5 w-5" />
        </button>
    )
}