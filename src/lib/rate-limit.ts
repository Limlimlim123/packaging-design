import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

export const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 m'), // 每分钟最多3次
  analytics: true
})