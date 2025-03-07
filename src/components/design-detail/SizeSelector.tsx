import { cn } from '@/lib/utils'

interface SizeOption {
  id: string
  name: string
  width: number
  height: number
  depth?: number
  price?: number
  description?: string
}

interface SizeSelectorProps {
  sizes: SizeOption[]
  selected?: string
  onChange: (size: SizeOption) => void
}

export function SizeSelector({ sizes, selected, onChange }: SizeSelectorProps) {
    // 添加防御性检查
    if (!sizes || sizes.length === 0) {
      return (
        <div data-testid="size-selector-container">
          <div className="space-y-4">
            <h3 className="font-medium">选择尺寸</h3>
            <div className="text-sm text-gray-500">暂无可选尺寸</div>
          </div>
        </div>
      )
    }
    
    return (
      <div data-testid="size-selector-container">
        <div className="space-y-4">
          <h3 className="font-medium">选择尺寸</h3>
          <div className="grid grid-cols-2 gap-4">
            {sizes.map((size) => (
              <button
                key={size.id}
                className={cn(
                  "p-4 border rounded-lg hover:border-primary transition-colors",
                  selected === size.id && "border-primary bg-primary/5"
                )}
                onClick={() => onChange(size)}
                type="button"
                data-testid={`size-option-${size.id}`}
                aria-label={`选择${size.name}尺寸`}
              >
                <div className="text-sm font-medium">{size.name}</div>
                {size.description && (
                  <div className="text-sm text-gray-500" data-testid={`size-description-${size.id}`}>
                    {size.description}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  {size.width} × {size.height} {size.depth && `× ${size.depth}`} mm
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }