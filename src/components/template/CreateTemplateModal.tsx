'use client'

import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import type { Template } from '@/app/templates/page'
import { FileUpload } from '../upload/FileUpload'

interface CreateTemplateModalProps {
    onClose: () => void
    onCreated: (template: Template) => void
}

export function CreateTemplateModal({ onClose, onCreated }: CreateTemplateModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'box',
        tags: [] as string[],
        dimensions: {
            width: 200,
            height: 150,
            depth: 100
        },
        thumbnail: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            setIsSubmitting(true)
            // TODO: 实现创建模板的API调用
            const newTemplate: Template = {
                id: Math.random().toString(36).substr(2, 9),
                ...formData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            
            onCreated(newTemplate)
        } catch (error) {
            console.error('创建模板失败:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">创建新模板</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {/* 基本信息 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                模板名称
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                描述
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                包装类型
                            </label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {CATEGORIES.slice(1).map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                设计风格
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {TAGS.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                tags: prev.tags.includes(tag.id)
                                                    ? prev.tags.filter(id => id !== tag.id)
                                                    : [...prev.tags, tag.id]
                                            }))
                                        }}
                                        className={`
                                            px-3 py-1 rounded-full text-sm
                                            ${formData.tags.includes(tag.id)
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }
                                        `}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 尺寸设置 */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                宽度 (mm)
                            </label>
                            <input
                                type="number"
                                value={formData.dimensions.width}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    dimensions: {
                                        ...prev.dimensions,
                                        width: Number(e.target.value)
                                    }
                                }))}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                高度 (mm)
                            </label>
                            <input
                                type="number"
                                value={formData.dimensions.height}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    dimensions: {
                                        ...prev.dimensions,
                                        height: Number(e.target.value)
                                    }
                                }))}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                深度 (mm)
                            </label>
                            <input
                                type="number"
                                value={formData.dimensions.depth}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    dimensions: {
                                        ...prev.dimensions,
                                        depth: Number(e.target.value)
                                    }
                                }))}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* 缩略图上传 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            缩略图
                        </label>
                        <FileUpload
                            onUpload={async (file) => {
                                // TODO: 实现图片上传
                                const imageUrl = URL.createObjectURL(file)
                                setFormData(prev => ({ ...prev, thumbnail: imageUrl }))
                            }}
                            accept="image/*"
                            maxSize={2}
                        />
                    </div>

                    {/* 提交按钮 */}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? '创建中...' : '创建模板'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}