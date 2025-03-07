import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // 清理现有数据
    console.log('清理现有数据...')
    await prisma.designVersion.deleteMany({})
    await prisma.order.deleteMany({})
    await prisma.design.deleteMany({})
    await prisma.template.deleteMany({})
    await prisma.user.deleteMany({})
    
    console.log('开始创建测试数据...')
    
    // 创建测试用户
    const hashedPassword = await bcrypt.hash('123456', 10)
    const testUser = await prisma.user.create({
      data: {
        phone: '18888888888',
        password: hashedPassword,
        name: '测试用户'
      }
    })
    console.log('✅ 测试用户创建成功')

    // 创建多个测试模板
    await prisma.template.createMany({
      data: [
        {
          name: '方形包装盒',
          description: '适用于各类产品的标准包装盒，简约现代风格',
          type: 'standard',
          category: 'box',
          style: ['minimal', 'modern'],
          thumbnail: '/templates/box-square-thumb.jpg',
          preview2D: '/templates/box-square-2d.jpg',
          preview3D: '/templates/box-square-3d.jpg',
          dieline: '/templates/box-square-dieline.pdf',
          sizes: {
            width: 100,
            height: 100,
            depth: 100
          },
          price: 99.99,
          featured: true,
          status: 'active'
        },
        {
          name: '手提纸袋',
          description: '时尚环保的手提纸袋，适合服装、礼品等产品',
          type: 'standard',
          category: 'bag',
          style: ['elegant', 'eco-friendly'],
          thumbnail: '/templates/bag-shopping-thumb.jpg',
          preview2D: '/templates/bag-shopping-2d.jpg',
          preview3D: '/templates/bag-shopping-3d.jpg',
          dieline: '/templates/bag-shopping-dieline.pdf',
          sizes: {
            width: 250,
            height: 350,
            depth: 100
          },
          price: 79.99,
          featured: true,
          status: 'active'
        },
        {
          name: '产品标签',
          description: '精美的产品标签设计，适用于各类商品',
          type: 'standard',
          category: 'label',
          style: ['clean', 'versatile'],
          thumbnail: '/templates/label-product-thumb.jpg',
          preview2D: '/templates/label-product-2d.jpg',
          preview3D: null,
          dieline: '/templates/label-product-dieline.pdf',
          sizes: {
            width: 60,
            height: 40,
            depth: 0
          },
          price: 29.99,
          featured: false,
          status: 'active'
        }
      ]
    })
    console.log('✅ 测试模板创建成功')

    // 获取第一个模板用于创建设计
    const firstTemplate = await prisma.template.findFirst({
      where: { status: 'active' }
    })
    if (!firstTemplate) throw new Error('未找到模板')

    // 创建测试设计
    const design = await prisma.design.create({
      data: {
        name: '我的包装设计',
        description: '这是一个测试设计项目',
        templateId: firstTemplate.id,
        content: {
          background: '#FFFFFF',
          elements: [
            {
              type: 'text',
              content: '产品名称',
              position: { x: 100, y: 100 },
              style: { fontSize: 24, color: '#000000' }
            }
          ]
        },
        thumbnail: '/designs/design-thumb.jpg',
        status: 'draft',
        userId: testUser.id
      }
    })
    console.log('✅ 测试设计创建成功')

    // 创建设计版本
    await prisma.designVersion.create({
      data: {
        name: 'v1.0',
        content: {
          background: '#FFFFFF',
          elements: [
            {
              type: 'text',
              content: '产品名称',
              position: { x: 100, y: 100 },
              style: { fontSize: 24, color: '#000000' }
            }
          ]
        },
        thumbnail: '/designs/version-thumb.jpg',
        designId: design.id,
        createdBy: testUser.id
      }
    })
    console.log('✅ 测试设计版本创建成功')

    console.log('🎉 所有测试数据创建完成')

  } catch (error) {
    console.error('❌ 创建测试数据失败:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })