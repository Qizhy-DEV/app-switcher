import { describe, it, expect, vi } from 'vitest'
import type { AppItem } from './types'
import { AppPopover } from './app-popover'

const SAMPLE_APPS: AppItem[] = [
  { name: 'Dashboard', url: 'https://dashboard.example.com', icon: 'icon1.png' },
  { name: 'CRM',       url: 'https://crm.example.com',       icon: 'icon2.png' },
]

async function mount(props: Partial<AppPopover> = {}): Promise<AppPopover> {
  const el = document.createElement('app-popover') as AppPopover
  Object.assign(el, props)
  document.body.appendChild(el)
  await el.updateComplete
  return el
}

function cleanup(el: HTMLElement) { el.remove() }

describe('AppPopover', () => {
  it('shows skeleton when loading=true', async () => {
    const el = await mount({ loading: true })
    expect(el.shadowRoot!.querySelector('.skeleton-title')).not.toBeNull()
    expect(el.shadowRoot!.querySelector('.grid')).toBeNull()
    cleanup(el)
  })

  it('shows error state when error=true', async () => {
    const el = await mount({ error: true })
    expect(el.shadowRoot!.querySelector('.error-state')).not.toBeNull()
    cleanup(el)
  })

  it('dispatches retry event when retry button clicked', async () => {
    const el = await mount({ error: true })
    const handler = vi.fn()
    el.addEventListener('retry', handler)
    el.shadowRoot!.querySelector<HTMLButtonElement>('.retry-btn')!.click()
    expect(handler).toHaveBeenCalledTimes(1)
    cleanup(el)
  })

  it('renders app links when loaded', async () => {
    const el = await mount({ apps: SAMPLE_APPS, title: 'My Apps' })
    await el.updateComplete
    const links = el.shadowRoot!.querySelectorAll('.app-item')
    expect(links.length).toBe(2)
    cleanup(el)
  })

  it('renders app name and icon', async () => {
    const el = await mount({ apps: SAMPLE_APPS, title: 'My Apps' })
    await el.updateComplete
    const firstName = el.shadowRoot!.querySelector('.app-name')!.textContent
    expect(firstName).toBe('Dashboard')
    const firstImg = el.shadowRoot!.querySelector<HTMLImageElement>('.app-icon')!
    expect(firstImg.src).toContain('icon1.png')
    cleanup(el)
  })

  it('adds current class to app matching currentOrigin', async () => {
    const el = await mount({
      apps: SAMPLE_APPS,
      title: 'My Apps',
      currentOrigin: 'https://dashboard.example.com',
    })
    await el.updateComplete
    const links = el.shadowRoot!.querySelectorAll<HTMLAnchorElement>('.app-item')
    expect(links[0].classList.contains('current')).toBe(true)
    expect(links[1].classList.contains('current')).toBe(false)
    cleanup(el)
  })

  it('uses target attribute on links', async () => {
    const el = await mount({ apps: SAMPLE_APPS, title: 'My Apps', target: '_self' })
    await el.updateComplete
    const link = el.shadowRoot!.querySelector<HTMLAnchorElement>('.app-item')!
    expect(link.getAttribute('target')).toBe('_self')
    cleanup(el)
  })
})
