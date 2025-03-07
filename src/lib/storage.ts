import OSS from 'ali-oss'

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET
})

export async function uploadToOSS(file: string | Buffer, path: string) {
  try {
    const result = await client.put(path, file)
    return result.url
  } catch (error) {
    console.error('上传到OSS失败:', error)
    throw error
  }
}