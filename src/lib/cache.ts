import LRU from 'lru-cache'

const cache = new LRU({
  max: 500, // 最多缓存500个项目
  ttl: 1000 * 60 * 5 // 5分钟缓存
})

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key)
  if (cached) return cached as T

  const data = await fetchFn()
  cache.set(key, data)
  return data
}