import { sql } from '@vercel/postgres'
import { z } from 'zod'

// 模板验证 schema
export const templateSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, '请输入模板名称'),
    description: z.string(),
    thumbnail: z.string().url('请上传有效的缩略图'),
    category: z.string(),
    tags: z.array(z.string()),
    dimensions: z.object({
        width: z.number().min(1),
        height: z.number().min(1),
        depth: z.number().min(1)
    }),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
})

export type Template = z.infer<typeof templateSchema>

// 数据库初始化 SQL
export const initializeDb = async () => {
    await sql`
        CREATE TABLE IF NOT EXISTS templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            thumbnail TEXT NOT NULL,
            category VARCHAR(50) NOT NULL,
            tags TEXT[] NOT NULL,
            dimensions JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `
}