import { Redis } from 'ioredis'

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  }
}

export const redis = new Redis(redisOptions)

redis.on('error', (error) => {
  console.error('Redis连接错误:', error)
})

redis.on('connect', () => {
  console.log('Redis连接成功')
})

export default redis