import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AppService } from './app-service'
import type { AppConfig } from './types'

const MOCK_CONFIG: AppConfig = {
  title: 'Test Apps',
  apps: [{ name: 'App A', url: 'https://a.example.com', icon: 'icon.png' }],
}

describe('AppService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('fetches and returns app config from URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_CONFIG,
    } as Response)

    const service = new AppService('https://example.com/apps.json')
    const result = await service.getApps()

    expect(fetch).toHaveBeenCalledWith('https://example.com/apps.json')
    expect(result).toEqual(MOCK_CONFIG)
  })

  it('returns cached result within 5 minutes without re-fetching', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => MOCK_CONFIG,
    } as Response)

    const service = new AppService('https://example.com/apps.json')
    await service.getApps()
    await service.getApps()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('re-fetches after cache expires (5 minutes)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => MOCK_CONFIG,
    } as Response)

    const service = new AppService('https://example.com/apps.json')
    await service.getApps()
    vi.advanceTimersByTime(5 * 60 * 1000 + 1)
    await service.getApps()

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('throws when server returns non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    const service = new AppService('https://example.com/apps.json')
    await expect(service.getApps()).rejects.toThrow('404')
  })

  it('invalidate() clears cache so next call re-fetches', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => MOCK_CONFIG,
    } as Response)

    const service = new AppService('https://example.com/apps.json')
    await service.getApps()
    service.invalidate()
    await service.getApps()

    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
