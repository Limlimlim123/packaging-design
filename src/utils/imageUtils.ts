export function checkImageQuality(file: File): Promise<{
    width: number
    height: number
    dpi: number
  }> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        
        const width = img.naturalWidth
        const height = img.naturalHeight
        
        // 假设图片物理尺寸为8.5x11英寸
        const dpi = Math.min(
          width / 8.5,
          height / 11
        )
        
        resolve({
          width,
          height,
          dpi
        })
      }
      
      img.src = url
    })
  }