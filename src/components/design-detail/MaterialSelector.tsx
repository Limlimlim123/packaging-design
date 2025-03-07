import { cn } from '@/lib/utils'  

interface MaterialOption {
  id: string
  name: string
  description?: string
  price?: number
  thumbnail?: string
}

interface MaterialSelectorProps {
  materials: MaterialOption[]
  selected?: string
  onChange: (material: MaterialOption) => void
}

export function MaterialSelector({ materials, selected, onChange }: MaterialSelectorProps) {
    // 添加防御性检查
    if (!materials || materials.length === 0) {
      return (
        <div data-testid="material-selector-container">
          <div className="space-y-4">
            <h3 className="font-medium">选择材质</h3>
            <div className="text-sm text-gray-500">暂无可选材质</div>
          </div>
        </div>
      )
    }
    
    return (
      <div data-testid="material-selector-container">
        <div className="space-y-4">
          <h3 className="font-medium">选择材质</h3>
          <div className="grid grid-cols-2 gap-4">
            {materials.map((material) => (
              <button
                key={material.id}
                className={cn(
                  "p-4 border rounded-lg hover:border-primary transition-colors",
                  selected === material.id && "border-primary bg-primary/5"
                )}
                onClick={() => onChange(material)}
                type="button"
                data-testid={`material-option-${material.id}`}
                aria-label={`选择${material.name}材质`}
              >
                <div className="text-sm font-medium">{material.name}</div>
                {material.description && (
                  <div className="text-sm text-gray-500">{material.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }