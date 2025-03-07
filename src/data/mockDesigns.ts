import { DesignItem } from '@/types/design';

export const MOCK_DESIGNS: DesignItem[] = [
  {
    id: '1',
    name: '简约食品包装盒',
    type: 'box',
    category: 'food',
    style: 'minimal',
    thumbnailUrl: '/images/designs/1-thumb.jpg',
    images: {
      flat: '/images/designs/1-flat.jpg',
      threeDee: '/images/designs/1-3d.jpg',
      template: '/images/designs/1-template.jpg',
    },
    sizes: [
      {
        id: '1-1',
        name: '小号',
        length: 100,
        width: 100,
        height: 50,
        unit: 'mm',
      },
      {
        id: '1-2',
        name: '中号',
        length: 150,
        width: 150,
        height: 75,
        unit: 'mm',
      },
    ],
    price: {
      base: 199,
      unit: 'CNY',
    },
    description: '简约风格的食品包装盒，适合各类零食、干果等产品',
    tags: ['简约', '食品', '环保'],
  },
  {
    id: '2',
    name: '奢华化妆品包装盒',
    type: 'box',
    category: 'cosmetics',
    style: 'luxury',
    thumbnailUrl: '/images/designs/2-thumb.jpg',
    images: {
      flat: '/images/designs/2-flat.jpg',
      threeDee: '/images/designs/2-3d.jpg',
      template: '/images/designs/2-template.jpg',
    },
    sizes: [
      {
        id: '2-1',
        name: '标准',
        length: 120,
        width: 120,
        height: 60,
        unit: 'mm',
      },
    ],
    price: {
      base: 299,
      unit: 'CNY',
    },
    description: '高端化妆品包装盒，采用烫金工艺，突显产品档次',
    tags: ['奢华', '化妆品', '烫金'],
  },
  {
    id: '3',
    name: '可爱糖果包装袋',
    type: 'bag',
    category: 'food',
    style: 'cute',
    thumbnailUrl: '/images/designs/3-thumb.jpg',
    images: {
      flat: '/images/designs/3-flat.jpg',
      threeDee: '/images/designs/3-3d.jpg',
      template: '/images/designs/3-template.jpg',
    },
    sizes: [
      {
        id: '3-1',
        name: '迷你',
        length: 80,
        width: 50,
        height: 150,
        unit: 'mm',
      },
      {
        id: '3-2',
        name: '标准',
        length: 100,
        width: 70,
        height: 200,
        unit: 'mm',
      },
    ],
    price: {
      base: 99,
      unit: 'CNY',
    },
    description: '可爱风格的糖果包装袋，适合各类糖果、小零食',
    tags: ['可爱', '糖果', '食品'],
  },
  // ... 添加更多设计
];