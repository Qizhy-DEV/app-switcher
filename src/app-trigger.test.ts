import { describe, it, expect, vi } from 'vitest'
import { AppTrigger } from './app-trigger'

async function mount(): Promise<AppTrigger> {
  const el = document.createElement('app-trigger') as AppTrigger
  document.body.appendChild(el)
  await el.updateComplete
  return el
}

function cleanup(el: HTMLElement) {
  el.remove()
}

describe('AppTrigger', () => {
  it('renders 9 dot elements', async () => {
    const el = await mount()
    const dots = el.shadowRoot!.querySelectorAll('.dot')
    expect(dots.length).toBe(9)
    cleanup(el)
  })

  it('dispatches trigger-click event when button is clicked', async () => {
    const el = await mount()
    const handler = vi.fn()
    el.addEventListener('trigger-click', handler)
    el.shadowRoot!.querySelector('button')!.click()
    expect(handler).toHaveBeenCalledTimes(1)
    cleanup(el)
  })

  it('adds active class when active prop is true', async () => {
    const el = await mount()
    el.active = true
    await el.updateComplete
    const button = el.shadowRoot!.querySelector('button')!
    expect(button.classList.contains('active')).toBe(true)
    cleanup(el)
  })

  it('sets aria-expanded true when active', async () => {
    const el = await mount()
    el.active = true
    await el.updateComplete
    const button = el.shadowRoot!.querySelector('button')!
    expect(button.getAttribute('aria-expanded')).toBe('true')
    cleanup(el)
  })
})
