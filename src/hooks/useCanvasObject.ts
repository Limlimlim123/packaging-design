import { useCallback } from 'react'
import type { Canvas, Object as FabricObject } from 'fabric'

interface UseCanvasObjectOptions {
  onObjectModified?: () => void
}

export function useCanvasObject(canvas: Canvas | null, options: UseCanvasObjectOptions = {}) {
  // 添加文本
  const addText = useCallback((text: string, options = {}) => {
    if (!canvas) return

    const textObject = new fabric.IText(text, {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#000000',
      originX: 'center',
      originY: 'center',
      ...options
    })

    canvas.add(textObject)
    canvas.setActiveObject(textObject)
    canvas.renderAll()
    options.onObjectModified?.()
  }, [canvas])

  // 添加图片
  const addImage = useCallback(async (url: string, options = {}) => {
    if (!canvas) return

    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(url, 
        (img) => {
          // 计算合适的缩放比例
          const scale = Math.min(
            (canvas.width! * 0.5) / img.width!,
            (canvas.height! * 0.5) / img.height!
          )

          img.set({
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            ...options
          })

          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
          options.onObjectModified?.()
          resolve(img)
        },
        (err) => {
          reject(err)
        }
      )
    })
  }, [canvas])

  // 删除对象
  const deleteObject = useCallback(() => {
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    canvas.discardActiveObject()
    canvas.remove(...activeObjects)
    canvas.renderAll()
    options.onObjectModified?.()
  }, [canvas])

  // 复制对象
  const duplicateObject = useCallback(() => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject) return

    activeObject.clone((cloned: FabricObject) => {
      cloned.set({
        left: activeObject.left! + 20,
        top: activeObject.top! + 20
      })
      canvas.add(cloned)
      canvas.setActiveObject(cloned)
      canvas.renderAll()
      options.onObjectModified?.()
    })
  }, [canvas])

  // 对象对齐
  const alignObject = useCallback((direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!canvas) return
    
    const activeObject = canvas.getActiveObject()
    if (!activeObject) return

    let value = 0
    switch (direction) {
      case 'left':
        value = activeObject.width! * activeObject.scaleX! / 2
        activeObject.set({ left: value })
        break
      case 'center':
        value = canvas.width! / 2
        activeObject.set({ left: value })
        break
      case 'right':
        value = canvas.width! - (activeObject.width! * activeObject.scaleX! / 2)
        activeObject.set({ left: value })
        break
      case 'top':
        value = activeObject.height! * activeObject.scaleY! / 2
        activeObject.set({ top: value })
        break
      case 'middle':
        value = canvas.height! / 2
        activeObject.set({ top: value })
        break
      case 'bottom':
        value = canvas.height! - (activeObject.height! * activeObject.scaleY! / 2)
        activeObject.set({ top: value })
        break
    }

    canvas.renderAll()
    options.onObjectModified?.()
  }, [canvas])

  return {
    addText,
    addImage,
    deleteObject,
    duplicateObject,
    alignObject
  }
}