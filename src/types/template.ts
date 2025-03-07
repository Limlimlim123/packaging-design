export type TemplateType = 'box' | 'bag' | 'label' | 'custom'
export type TemplateCategory = 'retail' | 'food' | 'gift' | 'shipping' | 'other'
export type TemplateStatus = 'draft' | 'published' | 'archived'

export interface TemplateSize {
  width: number
  height: number
  depth?: number
  unit: 'mm' | 'cm' | 'in'
}

export interface Template {
  id: string
  name: string
  description?: string
  type: TemplateType
  category: TemplateCategory
  style: string[]
  thumbnail?: string
  preview2D?: string
  preview3D?: string
  dieline?: string
  sizes: {
    [key: string]: TemplateSize
  }
  price: number
  featured: boolean
  status: TemplateStatus
  createdAt?: Date
  updatedAt?: Date
}

export interface TemplateListResponse {
  templates: Template[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface TemplateSaveOptions {
  saveAsDraft?: boolean
  autoSave?: boolean
}

export interface TemplateFilterOptions {
  type?: TemplateType
  category?: TemplateCategory
  status?: TemplateStatus
  featured?: boolean
  search?: string
  minPrice?: number
  maxPrice?: number
}