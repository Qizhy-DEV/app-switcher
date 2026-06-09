import type { AppConfig } from './types'

export const DEFAULT_CONFIG_URL = 'https://qizhy-dev.github.io/app-switcher/apps.json'

const CACHE_TTL = 5 * 60 * 1000

export class AppService {
  private readonly url: string
  private cache: { data: AppConfig; ts: number } | null = null

  constructor(url = DEFAULT_CONFIG_URL) {
    this.url = url
  }

  async getApps(): Promise<AppConfig> {
    const now = Date.now()
    if (this.cache && now - this.cache.ts < CACHE_TTL) {
      return this.cache.data
    }
    const res = await fetch(this.url)
    if (!res.ok) throw new Error(`Failed to fetch apps: ${res.status}`)
    const data: AppConfig = await res.json()
    this.cache = { data, ts: now }
    return data
  }

  invalidate() {
    this.cache = null
  }
}
