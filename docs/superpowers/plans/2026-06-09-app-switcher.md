# App Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `<app-switcher>` Web Component (Lit 3) — icon 9 chấm trigger + popover grid 4 cột, fetch danh sách app từ JSON trung tâm, deploy lên GitLab Pages.

**Architecture:** Lit Web Component với Shadow DOM isolation. Root element `<app-switcher>` orchestrate 3 sub-component (AppTrigger, AppPopover) và AppService (fetch + 5-min cache). Build bằng Vite lib mode thành 1 file JS duy nhất, nhúng vào app bằng 2 dòng HTML.

**Tech Stack:** Lit 3, Vite 8, TypeScript, Vitest + happy-dom

---

## File Map

| File | Action | Vai trò |
|---|---|---|
| `vite.config.ts` | Modify | Thêm lib mode + vitest config |
| `src/types.ts` | Create | Interface `AppItem`, `AppConfig` |
| `src/app-service.ts` | Create | Fetch apps.json, 5-min memory cache |
| `src/app-trigger.ts` | Create | Icon 9 chấm, phát sự kiện `trigger-click` |
| `src/app-popover.ts` | Create | Grid 4 cột, 3 states: loading/loaded/error |
| `src/app-switcher.ts` | Create | Root element, orchestrate mọi thứ |
| `src/index.ts` | Modify | Re-export tất cả components |
| `src/my-element.ts` | Delete | Boilerplate cũ, không cần nữa |
| `src/app-service.test.ts` | Create | Tests cho AppService |
| `src/app-trigger.test.ts` | Create | Tests cho AppTrigger |
| `src/app-popover.test.ts` | Create | Tests cho AppPopover |
| `src/app-switcher.test.ts` | Create | Tests cho AppSwitcher |
| `public/apps.json` | Create | Sample config với 8 apps mẫu |
| `.gitlab-ci.yml` | Create | CI/CD pipeline cho GitLab Pages |
| `index.html` | Modify | Demo page để test local |

---

## Task 1: Setup — Vitest + Vite lib mode + dọn boilerplate

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`
- Delete: `src/my-element.ts`
- Create: `src/types.ts`
- Create: `public/apps.json`

- [ ] **Step 1: Cài Vitest và happy-dom**

```bash
npm install -D vitest happy-dom
```

Expected: `package.json` có `"vitest"` và `"happy-dom"` trong `devDependencies`.

- [ ] **Step 2: Cấu hình vite.config.ts cho lib mode + vitest**

Đọc file `vite.config.ts` hiện tại trước, sau đó thay toàn bộ nội dung bằng:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'app-switcher',
    },
    rollupOptions: {
      external: [],
    },
  },
  test: {
    environment: 'happy-dom',
  },
})
```

- [ ] **Step 3: Thêm script test vào package.json**

Mở `package.json`, thêm vào `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Xóa boilerplate cũ**

Xóa file `src/my-element.ts` — không dùng nữa.

- [ ] **Step 5: Tạo src/types.ts**

```typescript
export interface AppItem {
  name: string
  url: string
  icon: string
}

export interface AppConfig {
  title: string
  apps: AppItem[]
}
```

- [ ] **Step 6: Tạo public/apps.json**

```json
{
  "title": "Ứng dụng của bạn",
  "apps": [
    { "name": "Dashboard", "url": "https://dashboard.example.com", "icon": "https://placehold.co/64x64/3b82f6/fff?text=D" },
    { "name": "CRM",       "url": "https://crm.example.com",       "icon": "https://placehold.co/64x64/10b981/fff?text=C" },
    { "name": "Analytics", "url": "https://analytics.example.com", "icon": "https://placehold.co/64x64/f59e0b/fff?text=A" },
    { "name": "HR",        "url": "https://hr.example.com",        "icon": "https://placehold.co/64x64/8b5cf6/fff?text=H" },
    { "name": "Support",   "url": "https://support.example.com",   "icon": "https://placehold.co/64x64/ef4444/fff?text=S" },
    { "name": "Docs",      "url": "https://docs.example.com",      "icon": "https://placehold.co/64x64/06b6d4/fff?text=D" },
    { "name": "Finance",   "url": "https://finance.example.com",   "icon": "https://placehold.co/64x64/f97316/fff?text=F" },
    { "name": "Tasks",     "url": "https://tasks.example.com",     "icon": "https://placehold.co/64x64/ec4899/fff?text=T" }
  ]
}
```

- [ ] **Step 7: Commit**

```bash
git add vite.config.ts package.json src/types.ts public/apps.json
git rm src/my-element.ts
git commit -m "chore: setup vitest, vite lib mode, types, sample apps.json"
```

---

## Task 2: AppService — fetch + cache

**Files:**
- Create: `src/app-service.ts`
- Create: `src/app-service.test.ts`

- [ ] **Step 1: Viết failing test**

Tạo `src/app-service.test.ts`:

```typescript
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
```

- [ ] **Step 2: Chạy test — phải FAIL**

```bash
npm test
```

Expected: FAIL — `Cannot find module './app-service'`

- [ ] **Step 3: Implement AppService**

Tạo `src/app-service.ts`:

```typescript
import type { AppConfig } from './types'

export const DEFAULT_CONFIG_URL = 'https://yourname.gitlab.io/app-switcher/apps.json'

const CACHE_TTL = 5 * 60 * 1000

export class AppService {
  private url: string
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
```

> **Lưu ý:** Thay `yourname` trong `DEFAULT_CONFIG_URL` bằng GitLab username thực của bạn sau khi tạo repo.

- [ ] **Step 4: Chạy test — phải PASS**

```bash
npm test
```

Expected: 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/app-service.ts src/app-service.test.ts
git commit -m "feat: add AppService with fetch and 5-min cache"
```

---

## Task 3: AppTrigger — icon 9 chấm

**Files:**
- Create: `src/app-trigger.ts`
- Create: `src/app-trigger.test.ts`

- [ ] **Step 1: Viết failing test**

Tạo `src/app-trigger.test.ts`:

```typescript
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
```

- [ ] **Step 2: Chạy test — phải FAIL**

```bash
npm test
```

Expected: FAIL — `Cannot find module './app-trigger'`

- [ ] **Step 3: Implement AppTrigger**

Tạo `src/app-trigger.ts`:

```typescript
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-trigger')
export class AppTrigger extends LitElement {
  @property({ type: Boolean }) active = false

  static styles = css`
    :host { display: inline-block; }
    button {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      display: grid;
      grid-template-columns: repeat(3, 5px);
      gap: 3px;
      align-items: center;
      justify-items: center;
      padding: 8px;
      box-sizing: border-box;
      transition: background 0.15s;
    }
    button:hover {
      background: rgba(99, 102, 241, 0.15);
      background: rgba(var(--as-accent-rgb, 99 102 241) / 0.15);
    }
    button.active {
      background: rgba(99, 102, 241, 0.25);
      background: rgba(var(--as-accent-rgb, 99 102 241) / 0.25);
      outline: 2px solid rgba(99, 102, 241, 0.4);
      outline-offset: 1px;
    }
    .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #94a3b8;
      transition: background 0.15s;
    }
    button:hover .dot,
    button.active .dot {
      background: var(--as-accent, #6366f1);
    }
  `

  render() {
    return html`
      <button
        class=${this.active ? 'active' : ''}
        aria-label="App switcher"
        aria-expanded=${String(this.active)}
        @click=${this._handleClick}
      >
        ${Array.from({ length: 9 }, () => html`<span class="dot"></span>`)}
      </button>
    `
  }

  private _handleClick() {
    this.dispatchEvent(new CustomEvent('trigger-click', { bubbles: true, composed: true }))
  }
}
```

- [ ] **Step 4: Chạy test — phải PASS**

```bash
npm test
```

Expected: 4 tests passed (app-trigger), 5 tests passed (app-service) = 9 total.

- [ ] **Step 5: Commit**

```bash
git add src/app-trigger.ts src/app-trigger.test.ts
git commit -m "feat: add AppTrigger with 9-dot icon and trigger-click event"
```

---

## Task 4: AppPopover — grid 4 cột

**Files:**
- Create: `src/app-popover.ts`
- Create: `src/app-popover.test.ts`

- [ ] **Step 1: Viết failing test**

Tạo `src/app-popover.test.ts`:

```typescript
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
```

- [ ] **Step 2: Chạy test — phải FAIL**

```bash
npm test
```

Expected: FAIL — `Cannot find module './app-popover'`

- [ ] **Step 3: Implement AppPopover**

Tạo `src/app-popover.ts`:

```typescript
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { AppItem } from './types'

@customElement('app-popover')
export class AppPopover extends LitElement {
  @property({ type: Array }) apps: AppItem[] = []
  @property({ type: String }) title = ''
  @property({ type: Boolean }) loading = false
  @property({ type: Boolean }) error = false
  @property({ type: String }) target = '_blank'
  @property({ type: String }) currentOrigin = ''

  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 9999;
    }
    .popover {
      background: var(--as-bg, #1e293b);
      border: 1px solid var(--as-border, #334155);
      border-radius: 12px;
      padding: 14px;
      min-width: 220px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .title {
      font-size: 10px;
      color: var(--as-text, #94a3b8);
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0 0 10px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
    }
    .app-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 6px 2px;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s;
    }
    .app-item:hover { background: rgba(255,255,255,0.07); }
    .app-item.current { background: rgba(99,102,241,0.15); }
    .app-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      object-fit: cover;
    }
    .app-name {
      font-size: 9px;
      color: var(--as-text, #94a3b8);
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 52px;
    }
    .skeleton-title {
      height: 10px;
      background: var(--as-border, #334155);
      border-radius: 4px;
      width: 60%;
      margin-bottom: 12px;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 6px 2px;
    }
    .skeleton-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--as-border, #334155);
      animation: shimmer 1.5s infinite;
    }
    .skeleton-label {
      height: 6px;
      background: var(--as-border, #334155);
      border-radius: 3px;
      width: 80%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 0;
    }
    .error-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(239,68,68,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .error-message {
      font-size: 10px;
      color: var(--as-text, #94a3b8);
      text-align: center;
      margin: 0;
    }
    .retry-btn {
      font-size: 10px;
      color: var(--as-accent, #6366f1);
      background: none;
      border: 1px solid var(--as-accent, #6366f1);
      border-radius: 6px;
      padding: 4px 12px;
      cursor: pointer;
    }
  `

  render() {
    return html`
      <div class="popover">
        ${this.loading ? this._renderSkeleton()
          : this.error ? this._renderError()
          : this._renderApps()}
      </div>
    `
  }

  private _renderSkeleton() {
    return html`
      <div class="skeleton-title"></div>
      <div class="grid">
        ${Array.from({ length: 8 }, () => html`
          <div class="skeleton-cell">
            <div class="skeleton-icon"></div>
            <div class="skeleton-label"></div>
          </div>
        `)}
      </div>
    `
  }

  private _renderError() {
    return html`
      <div class="error-state">
        <div class="error-icon">⚠</div>
        <p class="error-message">Không thể tải danh sách app</p>
        <button class="retry-btn" @click=${this._handleRetry}>Thử lại</button>
      </div>
    `
  }

  private _renderApps() {
    return html`
      <p class="title">${this.title}</p>
      <div class="grid">
        ${this.apps.map(app => {
          let isCurrent = false
          try {
            isCurrent = !!this.currentOrigin && new URL(app.url).origin === this.currentOrigin
          } catch { /* ignore malformed URLs */ }
          return html`
            <a
              class="app-item ${isCurrent ? 'current' : ''}"
              href=${app.url}
              target=${this.target}
              rel="noopener noreferrer"
              title=${app.name}
            >
              <img class="app-icon" src=${app.icon} alt=${app.name} />
              <span class="app-name">${app.name}</span>
            </a>
          `
        })}
      </div>
    `
  }

  private _handleRetry() {
    this.dispatchEvent(new CustomEvent('retry', { bubbles: true, composed: true }))
  }
}
```

- [ ] **Step 4: Chạy test — phải PASS**

```bash
npm test
```

Expected: 7 tests passed (app-popover) + 4 (app-trigger) + 5 (app-service) = 16 total.

- [ ] **Step 5: Commit**

```bash
git add src/app-popover.ts src/app-popover.test.ts
git commit -m "feat: add AppPopover with grid 4-col, loading/error states"
```

---

## Task 5: AppSwitcher — root element

**Files:**
- Create: `src/app-switcher.ts`
- Create: `src/app-switcher.test.ts`

- [ ] **Step 1: Viết failing test**

Tạo `src/app-switcher.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
```

- [ ] **Step 2: Chạy test — phải FAIL**

```bash
npm test
```

Expected: FAIL — `Cannot find module './app-switcher'`

- [ ] **Step 3: Implement AppSwitcher**

Tạo `src/app-switcher.ts`:

```typescript
import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { AppService } from './app-service'
import type { AppConfig } from './types'
import './app-trigger'
import './app-popover'

@customElement('app-switcher')
export class AppSwitcher extends LitElement {
  @property({ type: String, attribute: 'config-url' }) configUrl = ''
  @property({ type: String }) target = '_blank'
  @property({ type: String }) theme = 'dark'

  @state() private _open = false
  @state() private _loading = false
  @state() private _error = false
  @state() private _config: AppConfig | null = null

  private _service!: AppService
  private _boundClose!: (e: PointerEvent) => void
  private _boundKeydown!: (e: KeyboardEvent) => void

  connectedCallback() {
    super.connectedCallback()
    this._service = new AppService(this.configUrl || undefined)
    this._load()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._removeGlobalListeners()
  }

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
      font-size: 14px;
      line-height: 1.5;
    }
  `

  render() {
    return html`
      <app-trigger
        .active=${this._open}
        @trigger-click=${this._handleTrigger}
      ></app-trigger>
      ${this._open ? html`
        <app-popover
          .apps=${this._config?.apps ?? []}
          .title=${this._config?.title ?? ''}
          .loading=${this._loading}
          .error=${this._error}
          .target=${this.target}
          .currentOrigin=${window.location.origin}
          @retry=${this._handleRetry}
        ></app-popover>
      ` : ''}
    `
  }

  private async _load() {
    this._loading = true
    this._error = false
    try {
      this._config = await this._service.getApps()
    } catch {
      this._error = true
    } finally {
      this._loading = false
    }
  }

  private _handleTrigger() {
    this._open = !this._open
    if (this._open) {
      this._addGlobalListeners()
    } else {
      this._removeGlobalListeners()
    }
  }

  private _handleRetry() {
    this._service.invalidate()
    this._load()
  }

  private _addGlobalListeners() {
    this._boundClose = (e: PointerEvent) => {
      if (!this.contains(e.target as Node)) {
        this._open = false
        this._removeGlobalListeners()
      }
    }
    this._boundKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this._open = false
        this._removeGlobalListeners()
        const btn = this.shadowRoot
          ?.querySelector('app-trigger')
          ?.shadowRoot?.querySelector('button')
        btn?.focus()
      }
    }
    document.addEventListener('pointerdown', this._boundClose)
    document.addEventListener('keydown', this._boundKeydown)
  }

  private _removeGlobalListeners() {
    if (this._boundClose) document.removeEventListener('pointerdown', this._boundClose)
    if (this._boundKeydown) document.removeEventListener('keydown', this._boundKeydown)
  }
}
```

- [ ] **Step 4: Chạy test — phải PASS**

```bash
npm test
```

Expected: 5 (app-switcher) + 7 (app-popover) + 4 (app-trigger) + 5 (app-service) = 21 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/app-switcher.ts src/app-switcher.test.ts
git commit -m "feat: add AppSwitcher root element with toggle, Escape, click-outside"
```

---

## Task 6: Integration — index.ts, demo page, GitLab CI

**Files:**
- Modify: `src/index.ts`
- Modify: `index.html`
- Create: `.gitlab-ci.yml`

- [ ] **Step 1: Cập nhật src/index.ts**

Thay toàn bộ nội dung `src/index.ts` bằng:

```typescript
import './app-switcher'
import './app-trigger'
import './app-popover'

export { AppSwitcher } from './app-switcher'
export { AppTrigger } from './app-trigger'
export { AppPopover } from './app-popover'
export { AppService, DEFAULT_CONFIG_URL } from './app-service'
export type { AppItem, AppConfig } from './types'
```

- [ ] **Step 2: Cập nhật index.html để demo local**

Thay toàn bộ nội dung `index.html`:

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App Switcher — Demo</title>
    <style>
      body {
        margin: 0;
        font-family: system-ui, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
      }
      nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        height: 52px;
        background: #1e293b;
        border-bottom: 1px solid #334155;
      }
      .logo { font-weight: 600; font-size: 15px; }
      main {
        padding: 48px 24px;
        max-width: 600px;
        margin: 0 auto;
      }
      code {
        background: #1e293b;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 13px;
        color: #a5b4fc;
      }
    </style>
    <script type="module" src="/src/index.ts"></script>
  </head>
  <body>
    <nav>
      <span class="logo">My App</span>
      <app-switcher config-url="/apps.json"></app-switcher>
    </nav>
    <main>
      <h1>App Switcher Demo</h1>
      <p>Click vào icon 9 chấm ở góc trên phải để mở app switcher.</p>
      <p>Component nhúng vào app bằng:</p>
      <pre><code>&lt;app-switcher&gt;&lt;/app-switcher&gt;</code></pre>
    </main>
  </body>
</html>
```

- [ ] **Step 3: Tạo .gitlab-ci.yml**

```yaml
image: node:20

pages:
  script:
    - npm ci
    - npm run build
    - mv dist public
  artifacts:
    paths:
      - public
  only:
    - main
```

- [ ] **Step 4: Chạy dev server — kiểm tra visual**

```bash
npm run dev
```

Mở `http://localhost:5173` → thấy navbar với icon 9 chấm → click → popover grid 4 cột với 8 apps mẫu.

Kiểm tra:
- [ ] Icon 9 chấm hiện ở navbar
- [ ] Click → popover mở, thấy 8 apps
- [ ] Click ngoài popover → đóng
- [ ] Nhấn Escape → đóng
- [ ] Click app → mở tab mới

- [ ] **Step 5: Commit**

```bash
git add src/index.ts index.html .gitlab-ci.yml
git commit -m "feat: wire up index, demo page, GitLab CI pipeline"
```

---

## Task 7: Build verification

**Files:** không thay đổi

- [ ] **Step 1: Chạy full test suite**

```bash
npm test
```

Expected: 21 tests passed, 0 failed.

- [ ] **Step 2: Chạy build**

```bash
npm run build
```

Expected: không có lỗi, output trong `dist/`:
- `dist/app-switcher.js` — file JS bundle
- `dist/apps.json` — copy từ `public/`

- [ ] **Step 3: Kiểm tra bundle size**

```bash
ls -lh dist/app-switcher.js
```

Expected: dưới 60KB (gzip ~15KB).

- [ ] **Step 4: Update DEFAULT_CONFIG_URL với GitLab username thực**

Mở `src/app-service.ts`, thay:

```typescript
export const DEFAULT_CONFIG_URL = 'https://yourname.gitlab.io/app-switcher/apps.json'
```

thành URL thực với GitLab username của bạn.

- [ ] **Step 5: Final commit**

```bash
git add src/app-service.ts
git commit -m "chore: set production config URL"
git push origin main
```

Sau khi push → GitLab CI chạy (~2 phút) → Pages deploy xong → component sẵn sàng nhúng vào các app.

---

## Nhúng vào app sau khi deploy

Thêm 2 dòng này vào layout/navbar của mỗi app:

```html
<!-- Trong <head> -->
<script type="module" src="https://yourname.gitlab.io/app-switcher/app-switcher.js"></script>

<!-- Trong navbar, vị trí góc phải -->
<app-switcher></app-switcher>
```

**Trong React/Next.js** (`layout.tsx`):

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <script type="module" src="https://yourname.gitlab.io/app-switcher/app-switcher.js" />
      </head>
      <body>
        <nav>
          {/* ... logo, menu ... */}
          {/* @ts-expect-error Web Component */}
          <app-switcher />
        </nav>
        {children}
      </body>
    </html>
  )
}
```
