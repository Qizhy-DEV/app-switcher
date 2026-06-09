# App Switcher

Widget điều hướng giữa các app — nhúng vào bất kỳ app nào bằng 2 dòng HTML. Tự động follow dark/light mode của app host.

---

## Cài đặt

```html
<script src="https://qizhy-dev.github.io/app-switcher/app-switcher.js"></script>
<app-switcher></app-switcher>
```

---

## Attributes

| Attribute | Mặc định | Mô tả |
|---|---|---|
| `config-url` | URL GitLab Pages | URL của file `apps.json` |
| `target` | `_blank` | Cách mở link: `_blank` hoặc `_self` |
| `theme` | tự động | `light` hoặc `dark` — tự detect từ class `dark` trên `<html>` |

```html
<!-- Mở link trong tab hiện tại -->
<app-switcher target="_self"></app-switcher>

<!-- Dùng apps.json riêng -->
<app-switcher config-url="https://yoursite.com/apps.json"></app-switcher>

<!-- Ép dark theme (không cần nếu app đã dùng class dark) -->
<app-switcher theme="dark"></app-switcher>
```

---

## CSS Custom Properties

Override bằng cách set biến trên element `app-switcher`:

| Biến | Mặc định (light) | Mặc định (dark) | Mô tả |
|---|---|---|---|
| `--as-bg` | `#ffffff` | `#1e293b` | Màu nền popover |
| `--as-border` | `#e2e8f0` | `#334155` | Màu viền popover |
| `--as-text` | `#475569` | `#94a3b8` | Màu chữ tên app |
| `--as-accent` | `#6366f1` | `#6366f1` | Màu hover, active, dot |
| `--as-accent-rgb` | `99 102 241` | `99 102 241` | RGB của accent (dùng cho opacity) |

### Ví dụ custom màu

```css
/* Override cả hai theme */
app-switcher {
  --as-accent: #f97316;
}

/* Override riêng light theme */
app-switcher[theme="light"] {
  --as-bg: #f8fafc;
  --as-border: #cbd5e1;
  --as-accent: #0ea5e9;
}

/* Override riêng dark theme */
app-switcher[theme="dark"] {
  --as-bg: #0f172a;
  --as-border: #1e293b;
  --as-accent: #818cf8;
}
```

---

## Dark / Light Mode

Component tự động theo app host. Không cần cấu hình thêm nếu app dùng class `dark` trên `<html>` (Tailwind convention):

```js
// App toggle dark mode như này → switcher tự follow
document.documentElement.classList.toggle('dark')
```

---

## Nhúng theo framework

### React / Next.js

```tsx
// Trong file tsx của navbar
useEffect(() => {
  import('https://qizhy-dev.github.io/app-switcher/app-switcher.js')
}, [])

// Trong JSX
{/* @ts-ignore */}
<app-switcher />
```

Hoặc thêm vào `index.html` / `_document.tsx`:

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

File cấu hình danh sách app. Sửa file này và push → tất cả app thấy thay đổi sau 5 phút (cache TTL).

```json
{
  "title": "Ứng dụng",
  "apps": [
    {
      "name": "Dashboard",
      "url": "https://dashboard.company.com",
      "icon": "https://dashboard.company.com/icon.png"
    }
  ]
}
```

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `title` | Có | Tiêu đề hiển thị trên popover |
| `apps[].name` | Có | Tên app |
| `apps[].url` | Có | URL điều hướng khi click |
| `apps[].icon` | Có | URL icon, khuyến nghị 64×64px |

**Tip:** Dùng Google Favicon API để lấy icon tự động:

```json
"icon": "https://www.google.com/s2/favicons?domain=youtube.com&sz=64"
```

### Thêm app mới

1. Sửa `public/apps.json`
2. `git push`
3. GitHub Actions tự build & deploy (~1–2 phút)
4. Tất cả app thấy app mới sau khi cache hết hạn (5 phút)

---

## Behavior

| Hành động | Kết quả |
|---|---|
| Click trigger (9 dots) | Toggle popover |
| Click ngoài popover | Đóng popover |
| Nhấn `Escape` | Đóng popover, focus lại trigger |
| Click app | Mở theo `target` attribute |
| App hiện tại | Được highlight bằng dot accent bên dưới icon |

---

## CSS Isolation

Component dùng **Shadow DOM** — CSS của app host không ảnh hưởng vào bên trong, và CSS bên trong không leak ra ngoài. Chỉ có CSS custom properties (`--as-*`) là xuyên qua được — đây là cơ chế theming.
