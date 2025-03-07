import { sql } from '@vercel/postgres'
import type { Template } from './schema'

export async function getTemplates() {
    const { rows } = await sql`
        SELECT * FROM templates 
        ORDER BY created_at DESC
    `
    return rows.map(formatTemplate)
}

export async function getTemplateById(id: string) {
    const { rows } = await sql`
        SELECT * FROM templates 
        WHERE id = ${id}
    `
    return rows[0] ? formatTemplate(rows[0]) : null
}

export async function createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) {
    const { rows } = await sql`
        INSERT INTO templates (
            name, 
            description, 
            thumbnail, 
            category, 
            tags, 
            dimensions
        ) VALUES (
            ${template.name},
            ${template.description},
            ${template.thumbnail},
            ${template.category},
            ${template.tags}::text[],
            ${JSON.stringify(template.dimensions)}::jsonb
        )
        RETURNING *
    `
    return formatTemplate(rows[0])
}

export async function updateTemplate(
    id: string, 
    template: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>
) {
    const updates = []
    const values: any[] = []

    Object.entries(template).forEach(([key, value]) => {
        if (value !== undefined) {
            updates.push(`${key} = $${updates.length + 1}`)
            values.push(
                key === 'dimensions' ? JSON.stringify(value) :
                key === 'tags' ? value :
                value
            )
        }
    })

    if (updates.length === 0) return null

    const { rows } = await sql`
        UPDATE templates 
        SET ${sql(updates.join(', '))}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
    `
    return formatTemplate(rows[0])
}

export async function deleteTemplate(id: string) {
    const { rows } = await sql`
        DELETE FROM templates 
        WHERE id = ${id}
        RETURNING *
    `
    return rows[0] ? formatTemplate(rows[0]) : null
}

// 格式化数据库返回的模板数据
function formatTemplate(template: any): Template {
    return {
        id: template.id,
        name: template.name,
        description: template.description,
        thumbnail: template.thumbnail,
        category: template.category,
        tags: template.tags,
        dimensions: template.dimensions,
        createdAt: template.created_at.toISOString(),
        updatedAt: template.updated_at.toISOString()
    }
}