'use client'

import { useEditorStore } from '@/store/editor'
import { ChromePicker } from 'react-color'
import { useState } from 'react'
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    ChevronDown,
    ChevronUp
} from 'lucide-react'

export function PropertyPanel() {
    const design = useEditorStore(state => state.design)
    const selectedElementIds = useEditorStore(state => state.selectedElementIds)
    const updateElement = useEditorStore(state => state.updateElement)

    if (!design || selectedElementIds.length !== 1) {
        return (
            <div className="p-4 text-center text-gray-500">
                {selectedElementIds.length === 0 
                    ? '请选择一个元素'
                    : '一次只能编辑一个元素'
                }
            </div>
        )
    }

    const element = design.elements.find(el => el.id === selectedElementIds[0])
    if (!element) return null

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-6">
                <CommonProperties element={element} />
                
                {element.type === 'text' && (
                    <TextProperties element={element} />
                )}
                
                {element.type === 'image' && (
                    <ImageProperties element={element} />
                )}
                
                {element.type === 'shape' && (
                    <ShapeProperties element={element} />
                )}
            </div>
        </div>
    )
}

// 通用属性编辑器
function CommonProperties({ element }: { element: Element }) {
    const updateElement = useEditorStore(state => state.updateElement)
    
    return (
        <div className="space-y-4">
            <h3 className="font-medium">位置和大小</h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-500">X 坐标</label>
                    <input
                        type="number"
                        value={element.x}
                        onChange={(e) => updateElement(element.id, {
                            x: Number(e.target.value)
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-500">Y 坐标</label>
                    <input
                        type="number"
                        value={element.y}
                        onChange={(e) => updateElement(element.id, {
                            y: Number(e.target.value)
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-500">宽度</label>
                    <input
                        type="number"
                        value={element.width}
                        onChange={(e) => updateElement(element.id, {
                            width: Number(e.target.value)
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-500">高度</label>
                    <input
                        type="number"
                        value={element.height}
                        onChange={(e) => updateElement(element.id, {
                            height: Number(e.target.value)
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-500">旋转角度</label>
                <input
                    type="number"
                    value={element.rotation}
                    onChange={(e) => updateElement(element.id, {
                        rotation: Number(e.target.value)
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>
        </div>
    )
}

// 文本属性编辑器
function TextProperties({ element }: { element: Element }) {
    const updateElement = useEditorStore(state => state.updateElement)
    const [showColorPicker, setShowColorPicker] = useState(false)
    
    if (element.type !== 'text') return null

    return (
        <div className="space-y-4">
            <h3 className="font-medium">文本属性</h3>
            
            <div>
                <label className="block text-sm text-gray-500">文本内容</label>
                <textarea
                    value={element.properties.text}
                    onChange={(e) => updateElement(element.id, {
                        properties: {
                            ...element.properties,
                            text: e.target.value
                        }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm text-gray-500">字体大小</label>
                <input
                    type="number"
                    value={element.properties.fontSize}
                    onChange={(e) => updateElement(element.id, {
                        properties: {
                            ...element.properties,
                            fontSize: Number(e.target.value)
                        }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-500">字体</label>
                <select
                    value={element.properties.fontFamily}
                    onChange={(e) => updateElement(element.id, {
                        properties: {
                            ...element.properties,
                            fontFamily: e.target.value
                        }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                </select>
            </div>

            <div>
                <label className="block text-sm text-gray-500">颜色</label>
                <div className="mt-1 relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md flex items-center justify-between"
                    >
                        <div className="flex items-center">
                            <div
                                className="w-4 h-4 rounded-sm mr-2"
                                style={{ backgroundColor: element.properties.color }}
                            />
                            {element.properties.color}
                        </div>
                        {showColorPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showColorPicker && (
                        <div className="absolute z-10 mt-2">
                            <ChromePicker
                                color={element.properties.color}
                                onChange={(color) => updateElement(element.id, {
                                    properties: {
                                        ...element.properties,
                                        color: color.hex
                                    }
                                })}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-500">对齐方式</label>
                <div className="mt-1 flex space-x-2">
                    {['left', 'center', 'right', 'justify'].map((align) => (
                        <button
                            key={align}
                            onClick={() => updateElement(element.id, {
                                properties: {
                                    ...element.properties,
                                    textAlign: align
                                }
                            })}
                            className={`p-2 rounded-md ${
                                element.properties.textAlign === align
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            {align === 'left' && <AlignLeft size={16} />}
                            {align === 'center' && <AlignCenter size={16} />}
                            {align === 'right' && <AlignRight size={16} />}
                            {align === 'justify' && <AlignJustify size={16} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// 图片属性编辑器
function ImageProperties({ element }: { element: Element }) {
    const updateElement = useEditorStore(state => state.updateElement)
    
    if (element.type !== 'image') return null

    return (
        <div className="space-y-4">
            <h3 className="font-medium">图片属性</h3>
            
            <div>
                <label className="block text-sm text-gray-500">图片地址</label>
                <input
                    type="text"
                    value={element.properties.src}
                    onChange={(e) => updateElement(element.id, {
                        properties: {
                            ...element.properties,
                            src: e.target.value
                        }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-500">填充方式</label>
                <select
                    value={element.properties.objectFit}
                    onChange={(e) => updateElement(element.id, {
                        properties: {
                            ...element.properties,
                            objectFit: e.target.value
                        }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="contain">包含</option>
                    <option value="cover">覆盖</option>
                    <option value="fill">填充</option>
                </select>
            </div>
        </div>
    )
}

// 形状属性编辑器
function ShapeProperties({ element }: { element: Element }) {
    const updateElement = useEditorStore(state => state.updateElement)
    const [showColorPicker, setShowColorPicker] = useState(false)
    
    if (element.type !== 'shape') return null

    return (
        <div className="space-y-4">
            <h3 className="font-medium">形状属性</h3>
            
            <div>
                <label className="block text-sm text-gray-500">背景颜色</label>
                <div className="mt-1 relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md flex items-center justify-between"
                    >
                        <div className="flex items-center">
                            <div
                                className="w-4 h-4 rounded-sm mr-2"
                                style={{ backgroundColor: element.properties.backgroundColor }}
                            />
                            {element.properties.backgroundColor}
                        </div>
                        {showColorPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showColorPicker && (
                        <div className="absolute z-10 mt-2">
                            <ChromePicker
                                color={element.properties.backgroundColor}
                                onChange={(color) => updateElement(element.id, {
                                    properties: {
                                        ...element.properties,
                                        backgroundColor: color.hex
                                    }
                                })}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-500">圆角</label>
                <input
                    type="number"
                    value={element.properties.borderRadius}
                    onChange={(e) => updateElement(element.id, {
                        properties: {
                            ...element.properties,
                            borderRadius: Number(e.target.value)
                        }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>
        </div>
    )
}