# App Switcher — Design Spec

**Date:** 2026-06-09  
**Stack:** Lit 3 + Vite 8 + TypeScript  
**Deploy:** GitLab Pages

---

## Problem

Các app của công ty hoạt động độc lập. User muốn chuyển app phải tự nhớ URL. Cần một widget điều hướng thống nhất xuất hiện trên tất cả app — tương tự Google Workspace app switcher.

---

## Solution

Một **Web Component** (`<app-switcher>`) được build thành 1 file JS duy nhất, nhúng vào bất kỳ app nào bằng 2 dòng HTML. Danh sách app được fetch từ một file JSON trung tâm — update 1 chỗ, tất cả app thấy ngay.

---

## Architecture

### Components

| File | Trách nhiệm |
|---|---|
| `src/app-switcher.ts` | Root custom element `<app-switcher>`, quản lý state open/closed, fetch lifecycle |
| `src/app-trigger.ts` | Icon 9 chấm (trigger button), 3 trạng thái: default / hover / active |
| `src/app-popover.ts` | Popover grid 4 cột, render danh sách app |
| `src/app-service.ts` | Fetch `apps.json`, cache 5 phút trong memory |
| `src/index.ts` | Entry point, đăng ký custom element |

### Data Flow

```
App load → mount <app-switcher>
         → AppService fetch apps.json (cache 5 phút)
         → render AppTrigger (icon 9 chấm)
         → user click → open AppPopover
         → user click app → navigate to URL
```

### CSS Isolation

Sử dụng Shadow DOM — CSS của app host không ảnh hưởng component và ngược lại. Hai ngoại lệ by design:
- **CSS custom properties** xuyên qua Shadow DOM → dùng để theming
- **Inherited properties** (font-size, line-height) inherit vào `:host` → reset trong `static styles`

---

## HTML API

```html
<!-- Minimal — 2 dòng -->
<script src="https://yourname.gitlab.io/app-switcher/app-switcher.js"></script>
<app-switcher></app-switcher>

<!-- Override config URL (staging, per-tenant, v.v.) -->
<app-switcher config-url="https://staging/apps.json"></app-switcher>

<!-- Mở link trong tab hiện tại thay vì new tab -->
<app-switcher target="_self"></app-switcher>
```

### Attributes

| Attribute | Default | Mô tả |
|---|---|---|
| `config-url` | Hardcode trong `app-service.ts` lúc build | URL của `apps.json` |
| `target` | `_blank` | `_blank` hoặc `_self` — cách mở link |
| `theme` | `dark` | `dark` hoặc `light` |

### CSS Custom Properties (theming)

```css
app-switcher {
  --as-accent: #6366f1;      /* màu hover, active */
  --as-bg: #1e293b;          /* nền popover */
  --as-border: #334155;      /* viền popover */
  --as-text: #94a3b8;        /* màu tên app */
}
```

---

## apps.json Schema

```json
{
  "title": "Ứng dụng của bạn",
  "apps": [
    {
      "name": "Dashboard",
      "url": "https://dashboard.company.com",
      "icon": "https://dashboard.company.com/icon.png"
    }
  ]
}
```

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `title` | string | Có | Tiêu đề hiển thị trên popover |
| `apps` | array | Có | Danh sách app |
| `apps[].name` | string | Có | Tên hiển thị |
| `apps[].url` | string | Có | URL điều hướng khi click |
| `apps[].icon` | string | Có | URL ảnh icon (nên dùng 64×64px) |

---

## UI States

### Trigger Button
- **Default:** icon 9 chấm màu `#94a3b8`, nền trong suốt
- **Hover:** icon sáng hơn, nền `rgba(accent, 0.15)`
- **Active (popover open):** nền `rgba(accent, 0.25)`, outline ring

### Popover
- **Loading:** skeleton shimmer cho grid icon + title
- **Loaded:** grid 4 cột, icon 28×28px rounded, tên app bên dưới
- **Error:** icon cảnh báo + message + nút "Thử lại"

---

## Behavior

- Click trigger → toggle popover
- Click ngoài popover → đóng (`pointerdown` trên `document`)
- Nhấn `Escape` → đóng, focus lại trigger
- Click app → navigate theo `target` attribute
- App hiện tại được highlight dựa trên `window.location.origin`

---

## File Structure

```
app-switcher/
├── src/
│   ├── app-switcher.ts
│   ├── app-trigger.ts
│   ├── app-popover.ts
│   ├── app-service.ts
│   └── index.ts
├── public/
│   └── apps.json
├── .gitlab-ci.yml
├── vite.config.ts
└── package.json
```

### Vite Config (lib mode)

```ts
// vite.config.ts
export default {
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'app-switcher',
    },
    rollupOptions: {
      external: [],   // bundle Lit vào — zero dependency khi nhúng
    },
  },
}
```

---

## Deployment

### GitLab CI/CD

```yaml
# .gitlab-ci.yml
pages:
  script:
    - npm install
    - npm run build
    - mv dist public
  artifacts:
    paths:
      - public
  only:
    - main
```

### URLs sau deploy

```
https://yourname.gitlab.io/app-switcher/app-switcher.js   ← nhúng vào app
https://yourname.gitlab.io/app-switcher/apps.json          ← edit để thêm/bớt app
```

### Quy trình thêm app mới

1. Sửa `public/apps.json` — thêm entry mới
2. `git push` lên branch `main`
3. GitLab CI build & deploy tự động (~1–2 phút)
4. Tất cả app thấy app mới (sau khi cache 5 phút hết hạn)

---

## Out of Scope

- Authentication / per-user app list (có thể làm sau qua `config-url` dynamic)
- Search trong popover
- Drag-to-reorder apps
- Mobile-specific layout
