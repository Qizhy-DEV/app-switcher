# App Switcher

A universal app navigation widget — embed into any app with 2 lines of HTML. Automatically follows the host app's dark/light mode.

---

## Installation

```html
<script src="https://qizhy-dev.github.io/app-switcher/app-switcher.js"></script>
<app-switcher></app-switcher>
```

---

## Attributes

| Attribute | Default | Description |
|---|---|---|
| `config-url` | GitHub Pages URL | URL of the `apps.json` config file |
| `target` | `_blank` | How to open links: `_blank` or `_self` |
| `theme` | auto-detected | `light` or `dark` — auto-syncs with `dark` class on `<html>` |

```html
<!-- Open links in the same tab -->
<app-switcher target="_self"></app-switcher>

<!-- Use a custom apps.json -->
<app-switcher config-url="https://yoursite.com/apps.json"></app-switcher>

<!-- Force dark theme (not needed if your app already toggles the dark class) -->
<app-switcher theme="dark"></app-switcher>
```

---

## CSS Custom Properties

Override any variable directly on the `app-switcher` element:

| Variable | Light default | Dark default | Description |
|---|---|---|---|
| `--as-bg` | `#ffffff` | `#1e293b` | Popover background |
| `--as-border` | `#e2e8f0` | `#334155` | Popover border |
| `--as-text` | `#475569` | `#94a3b8` | App name text color |
| `--as-accent` | `#6366f1` | `#6366f1` | Hover, active, and dot color |
| `--as-accent-rgb` | `99 102 241` | `99 102 241` | RGB of accent (used for opacity variants) |

### Examples

```css
/* Override for both themes */
app-switcher {
  --as-accent: #f97316;
}

/* Override light theme only */
app-switcher[theme="light"] {
  --as-bg: #f8fafc;
  --as-border: #cbd5e1;
  --as-accent: #0ea5e9;
}

/* Override dark theme only */
app-switcher[theme="dark"] {
  --as-bg: #0f172a;
  --as-border: #1e293b;
  --as-accent: #818cf8;
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

```tsx
// In your navbar component
useEffect(() => {
  import('https://qizhy-dev.github.io/app-switcher/app-switcher.js')
}, [])

// In JSX
{/* @ts-ignore */}
<app-switcher />
```

Or add the script to `index.html` / `_document.tsx`:

```html
<script src="https://qizhy-dev.github.io/app-switcher/app-switcher.js"></script>
```

### Vue

```vue
<template>
  <app-switcher />
</template>

<script setup>
import('https://qizhy-dev.github.io/app-switcher/app-switcher.js')
</script>
```

### Plain HTML

```html
<body>
  <nav>
    <app-switcher></app-switcher>
  </nav>
  <script src="https://qizhy-dev.github.io/app-switcher/app-switcher.js"></script>
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

The component uses **Shadow DOM** — the host app's CSS does not affect the component internals, and the component's CSS does not leak out. Only CSS custom properties (`--as-*`) penetrate the Shadow DOM boundary, which is the intended theming mechanism.
