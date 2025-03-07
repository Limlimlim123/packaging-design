export const mockTemplateData = {
    id: 'template-1',
    name: '测试模板',
    type: '包装盒',
    category: '食品',
    status: 'active',
    userId: 'test-user',
    sizes: [
      { 
        id: 'size-1', 
        name: '小号', 
        width: 100, 
        height: 100, 
        price: 10,
        description: '适合小型产品'
      },
      { 
        id: 'size-2', 
        name: '中号', 
        width: 200, 
        height: 200, 
        price: 20,
        description: '适合中型产品'
      }
    ],
    materials: [
      { 
        id: 'material-1', 
        name: '普通卡纸', 
        price: 1,
        description: '经济实惠的选择'
      },
      { 
        id: 'material-2', 
        name: '铜版纸', 
        price: 1.5,
        description: '印刷效果更好'
      }
    ],
    elements: [],
    content: {},
    thumbnail: 'test-thumbnail'
  }
  
  export const mockDesign = {
    id: 'design-1',
    name: '测试设计',
    type: '包装盒',
    category: '食品',
    style: '简约',
    status: 'active',
    userId: 'test-user',
    thumbnailUrl: '/images/design-1.jpg',
    content: {},
    createdAt: new Date(),
    updatedAt: new Date()
  }