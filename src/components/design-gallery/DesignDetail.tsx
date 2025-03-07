import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronRight, Package, Ruler, DollarSign } from 'lucide-react';
import { DesignItem, PackageSize } from '@/types/design';
import { formatPrice, formatSize } from '@/lib/utils';

interface DesignDetailProps {
  design: DesignItem;
  onClose: () => void;
}

export default function DesignDetail({ design, onClose }: DesignDetailProps) {
  const [selectedImage, setSelectedImage] = useState<'flat' | 'threeDee' | 'template'>('flat');
  const [selectedSize, setSelectedSize] = useState<PackageSize | null>(design.sizes[0] || null);

  const images = {
    flat: { src: design.images.flat, label: '平面效果图' },
    threeDee: { src: design.images.threeDee, label: '3D效果图' },
    template: { src: design.images.template, label: '刀版图' },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* 内容区域 */}
      <div className="relative min-h-screen md:flex md:items-center md:justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full mx-auto">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* 左侧预览区域 */}
            <div className="space-y-4">
              {/* 主图预览 */}
              <div className="relative aspect-square rounded-lg overflow-hidden border">
                <Image
                  src={images[selectedImage].src}
                  alt={images[selectedImage].label}
                  fill
                  className="object-cover"
                />
              </div>

              {/* 缩略图选择 */}
              <div className="flex space-x-4">
                {Object.entries(images).map(([key, { src, label }]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedImage(key as keyof typeof images)}
                    className={`relative aspect-square w-20 rounded-lg overflow-hidden border-2
                      ${selectedImage === key ? 'border-primary' : 'border-transparent'}`}
                  >
                    <Image
                      src={src}
                      alt={label}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 右侧信息区域 */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{design.name}</h2>
                <p className="mt-2 text-gray-500">{design.description}</p>
              </div>

              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Package className="h-5 w-5" />
                  <span>{design.type === 'box' ? '盒型' : '袋型'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign className="h-5 w-5" />
                  <span>{formatPrice(design.price.base, design.price.unit)}</span>
                </div>
              </div>

              {/* 尺寸选择 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">选择尺寸</h3>
                <div className="grid grid-cols-2 gap-3">
                  {design.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 border rounded-lg text-sm
                        ${selectedSize?.id === size.id 
                          ? 'border-primary text-primary bg-primary/5' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-medium">{size.name}</div>
                      <div className="text-xs mt-1">
                        {formatSize(size.length, size.unit)} × 
                        {formatSize(size.width, size.unit)} × 
                        {formatSize(size.height, size.unit)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 开始定制按钮 */}
              <button
                className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 
                  transition-colors flex items-center justify-center space-x-2"
              >
                <span>开始定制</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}