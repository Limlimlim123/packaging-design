'use client'

import { useEffect, useRef, useState } from 'react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
    color: string
    onChange: (color: string) => void
    className?: string
    disabled?: boolean
    showInput?: boolean
    showPresets?: boolean
}

const presetColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#00ffff', '#ff00ff', '#808080', '#800000',
    '#808000', '#008000', '#800080', '#008080', '#000080'
]

export function ColorPicker({
    color,
    onChange,
    className,
    disabled = false,
    showInput = true,
    showPresets = true
}: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentColor, setCurrentColor] = useState(color)
    const [recentColors, setRecentColors] = useState<string[]>([])
    const popoverRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setCurrentColor(color)
    }, [color])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current && 
                !popoverRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleColorChange = (newColor: string) => {
        setCurrentColor(newColor)
        onChange(newColor)

        // 更新最近使用的颜色
        setRecentColors(prev => {
            const colors = prev.filter(c => c !== newColor)
            return [newColor, ...colors].slice(0, 5)
        })
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-[64px] h-[32px] p-1",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                    disabled={disabled}
                >
                    <div
                        className="w-full h-full rounded"
                        style={{ backgroundColor: currentColor }}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                ref={popoverRef}
                className="w-auto p-4"
                align="start"
            >
                <div className="space-y-4">
                    <HexColorPicker
                        color={currentColor}
                        onChange={handleColorChange}
                    />

                    {showInput && (
                        <div className="space-y-2">
                            <Label>十六进制颜色值</Label>
                            <HexColorInput
                                color={currentColor}
                                onChange={handleColorChange}
                                prefixed
                                className={cn(
                                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                )}
                            />
                        </div>
                    )}

                    {showPresets && (
                        <>
                            {recentColors.length > 0 && (
                                <div className="space-y-2">
                                    <Label>最近使用</Label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {recentColors.map((color, index) => (
                                            <Button
                                                key={`${color}-${index}`}
                                                variant="outline"
                                                className="w-8 h-8 p-1"
                                                onClick={() => handleColorChange(color)}
                                            >
                                                <div
                                                    className="w-full h-full rounded"
                                                    style={{ backgroundColor: color }}
                                                />
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>预设颜色</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {presetColors.map((color) => (
                                        <Button
                                            key={color}
                                            variant="outline"
                                            className="w-8 h-8 p-1"
                                            onClick={() => handleColorChange(color)}
                                        >
                                            <div
                                                className="w-full h-full rounded"
                                                style={{ backgroundColor: color }}
                                            />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}