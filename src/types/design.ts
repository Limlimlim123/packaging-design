export type PackageType = 'box' | 'bag'
export type ProductCategory = 'food' | 'clothing' | 'electronics' | 'cosmetics' | 'other'
export type DesignStyle = 'minimal' | 'luxury' | 'cute' | 'modern' | 'traditional'
export type SortBy = 'newest' | 'popular' | 'priceAsc' | 'priceDesc'
export type OrderStatus = 'draft' | 'pending' | 'processing' | 'completed' | 'cancelled'

export interface FilterOptions {
    type?: PackageType
    category?: ProductCategory
    style?: DesignStyle
    searchQuery?: string
    sortBy?: SortBy
    page?: number
    pageSize?: number
}

export interface DesignPrice {
    base: number
    unit: string
    moq?: number // 最小起订量
    bulk?: {
        quantity: number
        discount: number
    }[]
}

export interface DesignSize {
    id: string
    name: string
    width: number
    height: number
    depth?: number
    price?: number
}

export interface DesignMaterial {
    id: string
    name: string
    description?: string
    price?: number
    thumbnail?: string
}

export interface DesignItem {
    id: string
    name: string
    type: PackageType
    category: ProductCategory
    style: DesignStyle
    thumbnailUrl: string
    images: {
        flat: string
        threeD: string
        dieline: string
    }
    price: DesignPrice
    sizes: DesignSize[]
    materials: DesignMaterial[]
    tags?: string[]
    description?: string
    createdAt: string
    updatedAt: string
    isFavorited?: boolean
}

export interface DesignsResponse {
    designs: DesignItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface ApiError {
    code: string
    message: string
    details?: Record<string, any>
}

export interface CustomDesign {
    id: string
    userId: string
    templateId: string
    designData: any
    size: DesignSize
    material: DesignMaterial
    quantity: number
    status: OrderStatus
    createdAt: string
    updatedAt: string
}

export interface DesignOrder {
    id: string
    customDesignId: string
    userId: string
    status: OrderStatus
    totalPrice: number
    paymentStatus: 'pending' | 'paid' | 'refunded'
    shippingAddress?: {
        name: string
        phone: string
        address: string
        city: string
        province: string
        postalCode: string
    }
    createdAt: string
    updatedAt: string
}

// API 响应类型
export interface ApiResponse<T> {
    data?: T
    error?: ApiError
    meta?: {
        page?: number
        pageSize?: number
        total?: number
        totalPages?: number
    }
}