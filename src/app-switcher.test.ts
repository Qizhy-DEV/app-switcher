import { describe, it, expect, vi } from 'vitest'
import type { AppConfig } from './types'
import { AppSwitcher } from './app-switcher'

const MOCK_CONFIG: AppConfig = {
  title: 'My Apps',
  apps: [{ name: 'Dashboard', url: 'https://dashboard.example.com', icon: 'icon.png' }],
}

async function mount(attrs: Record<string, string> = {}): Promise<AppSwitcher> {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => MOCK_CONFIG,
  }))
  const el = document.createElement('app-switcher') as AppSwitcher
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  document.body.appendChild(el)
  await el.updateComplete
  // wait for async load to settle
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
  return el
}

function cleanup(el: HTMLElement) {
  el.remove()
  vi.unstubAllGlobals()
}

describe('AppSwitcher', () => {
  it('renders app-trigger on mount', async () => {
    const el = await mount()
    expect(el.shadowRoot!.querySelector('app-trigger')).not.toBeNull()
    cleanup(el)
  })

  it('popover is hidden by default', async () => {
    const el = await mount()
    expect(el.shadowRoot!.querySelector('app-popover')).toBeNull()
    cleanup(el)
  })

  it('opens popover when trigger-click fires', async () => {
    const el = await mount()
    el.shadowRoot!.querySelector('app-trigger')!.dispatchEvent(
      new CustomEvent('trigger-click', { bubbles: true, composed: true })
    )
    await el.updateComplete
    expect(el.shadowRoot!.querySelector('app-popover')).not.toBeNull()
    cleanup(el)
  })

  it('closes popover on second trigger-click', async () => {
    const el = await mount()
    const trigger = el.shadowRoot!.querySelector('app-trigger')!
    trigger.dispatchEvent(new CustomEvent('trigger-click', { bubbles: true, composed: true }))
    await el.updateComplete
    trigger.dispatchEvent(new CustomEvent('trigger-click', { bubbles: true, composed: true }))
    await el.updateComplete
    expect(el.shadowRoot!.querySelector('app-popover')).toBeNull()
    cleanup(el)
  })

  it('closes popover when Escape key is pressed', async () => {
    const el = await mount()
    el.shadowRoot!.querySelector('app-trigger')!.dispatchEvent(
      new CustomEvent('trigger-click', { bubbles: true, composed: true })
    )
    await el.updateComplete
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await el.updateComplete
    expect(el.shadowRoot!.querySelector('app-popover')).toBeNull()
    cleanup(el)
  })

  it('closes popover on pointerdown outside component', async () => {
    const el = await mount()
    el.shadowRoot!.querySelector('app-trigger')!.dispatchEvent(
      new CustomEvent('trigger-click', { bubbles: true, composed: true })
    )
    await el.updateComplete
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await el.updateComplete
    expect(el.shadowRoot!.querySelector('app-popover')).toBeNull()
    cleanup(el)
  })
})
