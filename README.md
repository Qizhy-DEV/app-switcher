# App Switcher

A universal app navigation widget — embed into any app with 2 lines of HTML. Automatically follows the host app's dark/light mode.

---

## Usage

```html
<script type="module" src="https://qizhy-dev.github.io/hd-switcher/hd-switcher.js"></script>
<hd-switcher></hd-switcher>
```

That's it — no build step, no npm install.

---

## Attributes

| Attribute | Default | Description |
|---|---|---|
| `config-url` | GitHub Pages URL | URL of the `apps.json` config file |
| `target` | `_blank` | How to open links: `_blank` or `_self` |
| `theme` | auto-detected | `light` or `dark` — auto-syncs with `dark` class on `<html>` |

```html
<!-- Open links in the same tab -->
<hd-switcher target="_self"></hd-switcher>

<!-- Use a custom apps.json -->
<hd-switcher config-url="https://yoursite.com/apps.json"></hd-switcher>

<!-- Force dark theme (not needed if your app already toggles the dark class) -->
<hd-switcher theme="dark"></hd-switcher>
```

---

## CSS Custom Properties

Override any variable directly on the `hd-switcher` element:

| Variable | Light default | Dark default | Description |
|---|---|---|---|
| `--hds-bg` | `#ffffff` | `#1e293b` | Popover background |
| `--hds-border` | `#e2e8f0` | `#334155` | Popover border |
| `--hds-text` | `#475569` | `#94a3b8` | App name text color |
| `--hds-accent` | `#6366f1` | `#6366f1` | Hover, active, and dot color |
| `--hds-accent-rgb` | `99 102 241` | `99 102 241` | RGB of accent (used for opacity variants) |

### Examples

```css
/* Override for both themes */
hd-switcher {
  --hds-accent: #f97316;
}

/* Override light theme only */
hd-switcher[theme="light"] {
  --hds-bg: #f8fafc;
  --hds-border: #cbd5e1;
  --hds-accent: #0ea5e9;
}

/* Override dark theme only */
hd-switcher[theme="dark"] {
  --hds-bg: #0f172a;
  --hds-border: #1e293b;
  --hds-accent: #818cf8;
}
```

---

## Dark / Light Mode

The component automatically syncs with the host app. No extra configuration needed if your app uses the `dark` class on `<html>` (Tailwind convention):

```js
// Your app toggles dark mode like this → switcher follows automatically
document.documentElement.classList.toggle('dark')
```

---

## Framework Integration

### React / Next.js

Add the script to `index.html`:

```html
<script type="module" src="https://qizhy-dev.github.io/hd-switcher/hd-switcher.js"></script>
```

Then use it in your navbar component:

```tsx
{/* @ts-ignore */}
<hd-switcher />
```

#### With a React theme context

If your app manages dark mode via a React context (e.g. `useTheme()`), pass the `theme` attribute explicitly so the switcher stays in sync with React state instead of relying on DOM observation:

```tsx
import { useTheme } from '@/context/ThemeProvider'

export default function Header() {
  const { theme } = useTheme()

  return (
    <header>
      {/* @ts-ignore */}
      <hd-switcher theme={theme === 'dark' ? 'dark' : 'light'} />
    </header>
  )
}
```

> **Why explicit?** The component auto-detects the `dark` class on `<html>` via `MutationObserver`, but React theme contexts sometimes update state before the DOM class is written. Passing `theme` directly avoids any timing gap.

### Vue

```vue
<template>
  <hd-switcher />
</template>

<script setup>
import('https://qizhy-dev.github.io/hd-switcher/hd-switcher.js')
</script>
```

### Plain HTML

```html
<body>
  <nav>
    <hd-switcher></hd-switcher>
  </nav>
  <script type="module" src="https://qizhy-dev.github.io/hd-switcher/hd-switcher.js"></script>
</body>
```

---

## apps.json

The central config file for your app list. Edit and push — all apps see the changes within 5 minutes (cache TTL).

```json
{
  "title": "Apps",
  "apps": [
    {
      "name": "Dashboard",
      "url": "https://dashboard.company.com",
      "icon": "https://dashboard.company.com/icon.png"
    }
  ]
}
```

| Field | Required | Description |
|---|---|---|
| `title` | Yes | Heading displayed at the top of the popover |
| `apps[].name` | Yes | App display name |
| `apps[].url` | Yes | URL to navigate to on click |
| `apps[].icon` | Yes | Icon image URL, recommended 64×64px |

**Tip:** Use the Google Favicon API to get icons automatically:

```json
"icon": "https://www.google.com/s2/favicons?domain=youtube.com&sz=64"
```

### Adding a new app

1. Edit `public/apps.json`
2. `git push`
3. GitHub Actions builds and deploys automatically (~1–2 min)
4. All apps see the new entry after the cache expires (5 min)

---

## Behavior

| Action | Result |
|---|---|
| Click trigger (9-dot grid) | Toggle popover |
| Click outside popover | Close popover |
| Press `Escape` | Close popover and refocus trigger |
| Click an app | Navigate using the `target` attribute |
| Current app | Highlighted with an accent dot below its icon |

---

## CSS Isolation

The component uses **Shadow DOM** — the host app's CSS does not affect the component internals, and the component's CSS does not leak out. Only CSS custom properties (`--hds-*`) penetrate the Shadow DOM boundary, which is the intended theming mechanism.
