interface PriceOptions {
    basePrice: number
    quantity: number
    size?: { id: string; price?: number }
    material?: { id: string; price?: number; priceFactor?: number }
  }
  
  export function calculatePrice(
    basePrice: number,
    size?: { id: string; price?: number; width?: number; height?: number },
    material?: { id: string; priceFactor?: number; price?: number },
    quantity: number = 1
  ): number {
    const options: PriceOptions = {
      basePrice,
      quantity,
      size,
      material
    }
  
    let total = options.basePrice
  
    // 添加尺寸差价
    if (options.size?.price) {
      total += options.size.price
    }
  
    // 添加材质差价
    if (options.material?.price) {
      total += options.material.price
    } else if (options.material?.priceFactor) {
      total *= options.material.priceFactor
    }
  
    // 批量价格计算
    if (options.quantity >= 1000) {
      total *= 0.8 // 20%折扣
    } else if (options.quantity >= 500) {
      total *= 0.9 // 10%折扣
    }
  
    return total * options.quantity
  }