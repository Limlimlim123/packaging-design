import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 基础工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 类型定义
export interface Dimensions {
  width: number
  height: number
  depth: number
}

export interface DimensionLimits {
  min: number
  max: number
}

export interface PriceOptions {
  size?: Dimensions
  quantity?: number
  material?: string
  features?: string[]
}

// 编辑器相关函数
export function generateId(prefix: string = ''): string {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 颜色处理函数
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// 包装尺寸相关函数
export function calculateVolume(dimensions: Dimensions): number {
  return dimensions.width * dimensions.height * dimensions.depth
}

export function validateDimensions(
  dimensions: Dimensions, 
  limits: DimensionLimits
): boolean {
  return Object.values(dimensions).every(value => 
    value >= limits.min && value <= limits.max
  )
}

export function formatDimensions(
  dimensions: Dimensions, 
  unit: string = 'mm'
): string {
  return `${dimensions.width}${unit} × ${dimensions.height}${unit} × ${dimensions.depth}${unit}`
}

export function calculateSurfaceArea(dimensions: Dimensions): number {
  const { width, height, depth } = dimensions
  return 2 * (width * height + width * depth + height * depth)
}

// 图片处理相关函数
export async function validateImageDimensions(
  file: File,
  minWidth: number = 800,
  minHeight: number = 800
): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.src = url
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img.width >= minWidth && img.height >= minHeight)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(false)
    }
  })
}

export function generateThumbnailDimensions(
  originalWidth: number,
  originalHeight: number,
  maxSize: number = 300
): { width: number; height: number } {
  const ratio = originalWidth / originalHeight
  return originalWidth > originalHeight
    ? { width: maxSize, height: Math.round(maxSize / ratio) }
    : { width: Math.round(maxSize * ratio), height: maxSize }
}

// 文件处理相关函数
export const SUPPORTED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'svg', 'ai', 'pdf'] as const
export type SupportedFileType = typeof SUPPORTED_FILE_TYPES[number]

export function isSupportedFileType(
  filename: string, 
  allowedTypes: SupportedFileType[] = SUPPORTED_FILE_TYPES
): boolean {
  const extension = filename.split('.').pop()?.toLowerCase() || ''
  return allowedTypes.includes(extension as SupportedFileType)
}

export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}

// 价格计算相关函数
export const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'standard': 1,
  'premium': 1.5,
  'eco': 1.2,
  'luxury': 2
}

export const FEATURE_COSTS: Record<string, number> = {
  'spot-uv': 0.5,
  'foil-stamping': 1,
  'embossing': 0.8,
  'die-cutting': 1.2,
  'window-patching': 1.5
}

export function calculatePrice(
  basePrice: number,
  options: PriceOptions
): number {
  let finalPrice = basePrice

  if (options.size) {
    const volume = calculateVolume(options.size)
    finalPrice += volume * 0.0001
  }

  if (options.quantity) {
    finalPrice *= options.quantity
    if (options.quantity >= 1000) finalPrice *= 0.7
    else if (options.quantity >= 500) finalPrice *= 0.8
    else if (options.quantity >= 100) finalPrice *= 0.9
  }

  if (options.material) {
    finalPrice *= MATERIAL_MULTIPLIERS[options.material] || 1
  }

  if (options.features?.length) {
    options.features.forEach(feature => {
      finalPrice += FEATURE_COSTS[feature] || 0
    })
  }

  return Number(finalPrice.toFixed(2))
}

// 格式化相关函数
export function formatPrice(
  price: number, 
  currency: string = '¥',
  unit: string = '个'
): string {
  return `${currency}${price.toLocaleString('zh-CN')}/${unit}`
}

export function formatDate(
  date: Date | string,
  format: string = 'YYYY-MM-DD'
): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// 编辑器状态管理相关函数
export function createUndoStack<T>(initialState: T) {
  const stack: T[] = [initialState]
  let currentIndex = 0

  return {
    get current() {
      return stack[currentIndex]
    },
    undo() {
      if (this.canUndo()) {
        currentIndex--
        return stack[currentIndex]
      }
    },
    redo() {
      if (this.canRedo()) {
        currentIndex++
        return stack[currentIndex]
      }
    },
    push(state: T) {
      stack.splice(currentIndex + 1)
      stack.push(state)
      currentIndex = stack.length - 1
    },
    canUndo: () => currentIndex > 0,
    canRedo: () => currentIndex < stack.length - 1
  }
}