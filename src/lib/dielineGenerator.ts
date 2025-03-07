import { fabric } from 'fabric'

interface DielineOptions {
    width: number
    height: number
    depth: number
    unit: string
    paperWidth: number
    paperHeight: number
}

export class DielineGenerator {
    private width: number
    private height: number
    private depth: number
    private unit: string
    private paperWidth: number
    private paperHeight: number
    private canvas: fabric.Canvas | null = null

    constructor(options: DielineOptions) {
        this.width = options.width
        this.height = options.height
        this.depth = options.depth
        this.unit = options.unit
        this.paperWidth = options.paperWidth
        this.paperHeight = options.paperHeight
    }

    setCanvas(canvas: fabric.Canvas): void {
        this.canvas = canvas
    }

    generateBoxDieline(): void {
        if (!this.canvas) return

        // 清空画布
        this.canvas.clear()

        // 计算展开图尺寸
        const totalWidth = this.width * 2 + this.depth * 2
        const totalHeight = this.height * 2 + this.depth * 2

        // 计算缩放比例以适应画布
        const scale = Math.min(
            this.paperWidth / totalWidth,
            this.paperHeight / totalHeight
        )

        // 计算居中位置
        const centerX = this.paperWidth / 2
        const centerY = this.paperHeight / 2

        // 创建展开图路径
        const path = new fabric.Path('M 0 0', {
            fill: 'transparent',
            stroke: '#ff0000',
            strokeWidth: 1,
            left: centerX - (totalWidth * scale) / 2,
            top: centerY - (totalHeight * scale) / 2,
            scaleX: scale,
            scaleY: scale
        })

        // 绘制展开图
        const commands: string[] = []
        commands.push('M 0,0') // 起点

        // 主体部分
        commands.push(`h ${this.width}`) // 顶部横线
        commands.push(`v ${this.height}`) // 右侧竖线
        commands.push(`h -${this.width}`) // 底部横线
        commands.push('z') // 闭合路径

        // 侧面折叠部分
        commands.push(`M ${this.width},0`)
        commands.push(`h ${this.depth}`)
        commands.push(`v ${this.height}`)
        commands.push(`h -${this.depth}`)

        // 顶部折叠部分
        commands.push(`M 0,0`)
        commands.push(`v -${this.depth}`)
        commands.push(`h ${this.width}`)
        commands.push(`v ${this.depth}`)

        path.set({ path: commands.join(' ') })
        this.canvas.add(path)
        this.canvas.renderAll()
    }

    generateCylinderDieline(): void {
        if (!this.canvas) return

        // 清空画布
        this.canvas.clear()

        // 计算展开图尺寸
        const circumference = Math.PI * this.width
        const totalWidth = circumference
        const totalHeight = this.height

        // 计算缩放比例以适应画布
        const scale = Math.min(
            this.paperWidth / totalWidth,
            this.paperHeight / totalHeight
        )

        // 计算居中位置
        const centerX = this.paperWidth / 2
        const centerY = this.paperHeight / 2

        // 创建矩形路径
        const path = new fabric.Rect({
            width: circumference,
            height: this.height,
            fill: 'transparent',
            stroke: '#ff0000',
            strokeWidth: 1,
            left: centerX - (circumference * scale) / 2,
            top: centerY - (this.height * scale) / 2,
            scaleX: scale,
            scaleY: scale
        })

        this.canvas.add(path)
        this.canvas.renderAll()
    }

    generateBagDieline(): void {
        if (!this.canvas) return

        // 清空画布
        this.canvas.clear()

        // 计算展开图尺寸
        const totalWidth = this.width + this.depth * 2
        const totalHeight = this.height + this.depth * 2

        // 计算缩放比例以适应画布
        const scale = Math.min(
            this.paperWidth / totalWidth,
            this.paperHeight / totalHeight
        )

        // 计算居中位置
        const centerX = this.paperWidth / 2
        const centerY = this.paperHeight / 2

        // 创建展开图路径
        const path = new fabric.Path('M 0 0', {
            fill: 'transparent',
            stroke: '#ff0000',
            strokeWidth: 1,
            left: centerX - (totalWidth * scale) / 2,
            top: centerY - (totalHeight * scale) / 2,
            scaleX: scale,
            scaleY: scale
        })

        // 绘制展开图
        const commands: string[] = []
        commands.push('M 0,0') // 起点

        // 主体部分
        commands.push(`h ${this.width}`) // 顶部横线
        commands.push(`v ${this.height}`) // 右侧竖线
        commands.push(`h -${this.width}`) // 底部横线
        commands.push('z') // 闭合路径

        // 底部折叠部分
        commands.push(`M 0,${this.height}`)
        commands.push(`v ${this.depth}`)
        commands.push(`h ${this.width}`)
        commands.push(`v -${this.depth}`)

        path.set({ path: commands.join(' ') })
        this.canvas.add(path)
        this.canvas.renderAll()
    }
}