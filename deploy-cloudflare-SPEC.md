# deploy-cloudflare-SPEC.md

**Status:** `PLANNING`
**Created:** 2026-03-05
**Goal:** Deploy TFTISEASY Training tool lên Cloudflare Pages + Supabase tại `tftiseasy.com/training`, $0/tháng, auto CI/CD, bundle tối ưu

---

## 🧠 Deploy Mental Model (Brainstorming)

### Cơ chế thực tế của static SPA deploy

```
git push main → CI build version B → CDN atomic switch A→B
```

- User đang dùng version A → **vẫn chạy A bình thường**
- User mới / refresh → **nhận version B**
- CDN **không bao giờ** serve build đang dang dở → không có `A → half-built → B`
- **Không downtime, không error, không maintenance window**

> Cloudflare Pages đã giải quyết zero-downtime deploy tự động. Không cần blue-green, canary, hay Kubernetes.

### Thứ duy nhất có thể gây lỗi: Cache Mismatch

| Scenario | Hậu quả |
|----------|----------|
| HTML mới + JS cũ trong cache | SPA chết |

**Giải pháp (Vite đã lo 90%):**
- Vite output: `app.82hd82.js` → mỗi deploy hash đổi → browser không dùng cache cũ
- Chỉ cần setup `_headers` đúng (Task 5 bên dưới)

### ⚠️ Reality Check: Bundle Size > Deploy Strategy

Vấn đề thực sự không phải deploy, mà là **bundle size**:

| Heavy dep | Risk |
|-----------|------|
| `three.js` | ~600kb |
| `remotion` | ~400kb |
| `recharts` | ~200kb |
| `html-to-image` | ~50kb |

Nếu bundle **2MB+** → mobile VN load **6-10s** → user rage quit trước khi thấy deploy hoàn hảo.

> **Ưu tiên #1 là `manualChunks` + lazy loading, không phải deploy pipeline.**

---

## 📋 Context

### Stack hiện tại
- **Frontend:** React + Vite + TypeScript → build ra `dist/`
- **Build command:** `tsc && vite build`
- **Heavy deps:** `three`, `remotion`, `@remotion/player`, `@remotion/three`, `recharts`, `html-to-image`
- **Backend:** Supabase (DB + Edge Functions `generate-caption`)
- **13 migration files** đã có sẵn

### Vấn đề hiện tại
- `vite.config.ts` không có `manualChunks` → bundle không được tách → mobile VN slow
- Không có `base: '/training/'` → deploy lên subdirectory sẽ lỗi asset paths
- Không có `_redirects` → SPA routing sẽ 404 trên Cloudflare Pages
- Không có `.github/workflows/` → chưa có CI/CD
- Không có env vars nào được setup cho production

### Domain Setup
- **Domain:** `tftiseasy.com` — đã có, đã public, DNS qua Cloudflare
- **Root site:** Landing page đơn giản, đang chạy trên **1 Cloudflare Pages project riêng**
  - Có nav links: `/tools`, `/blog`, `/coaching`, Discord
- **Deploy path:** `tftiseasy.com/training` — training tool nằm ở subdirectory
- **Kiến trúc:** 2 projects riêng biệt trên cùng 1 domain, dùng Cloudflare routing

### Target
- **User:** 70% mobile VN → latency ưu tiên
- **Budget:** $0/tháng (Cloudflare Pages free + Supabase free tier)
- **Kỳ vọng:** FCP < 1.5s trên mobile VN, initial bundle < 300kb

---

## 📦 Research Findings

| File | Status | Action cần làm |
|------|--------|---------------|
| `vite.config.ts` | ❌ Thiếu `manualChunks`, `path alias` | Thêm `resolve.alias`, `build.rollupOptions` |
| `public/_redirects` | ❌ Không tồn tại | Tạo mới cho SPA fallback |
| `.github/workflows/supabase-deploy.yml` | ❌ Không tồn tại | Tạo mới |
| `package.json` | ✅ Build script đúng | Không cần đổi |

---

## 🔨 Tasks

### Task 1 — Fix `vite.config.ts` (Bundle Optimization + Base Path)
**File:** `vite.config.ts`
**Thay đổi:** Thêm `base: '/training/'`, `manualChunks` để tách bundle, `path alias @/`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/training/',  // ⚠️ CRITICAL: deploy tại tftiseasy.com/training
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-is'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei', '@remotion/three'],
          'vendor-remotion': ['remotion', '@remotion/core', '@remotion/player'],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
```

> ⚠️ **`base: '/training/'`** làm gì?
> - Tất cả asset paths sẽ có prefix `/training/` → `<script src="/training/assets/app.82hd82.js">`
> - React Router cần `basename="/training"` (xem Task 1b)
> - Dev server: `npm run dev` vẫn chạy bình thường ở `localhost:5173`

**Verify:** `npm run build` pass, `dist/assets/` có nhiều `.js` chunk, check `dist/index.html` có `/training/` prefix trong script tags.

---

### Task 1b — Update React Router `basename`
**File:** Router config (nơi khai báo `<BrowserRouter>` hoặc `createBrowserRouter`)
**Thay đổi:** Thêm `basename="/training"`

```tsx
// Nếu dùng BrowserRouter:
<BrowserRouter basename="/training">

// Nếu dùng createBrowserRouter:
const router = createBrowserRouter(routes, {
  basename: '/training',
})
```

> ⚠️ **Không có bước này → tất cả route sẽ 404 khi deploy!**
> Route `/trainer/puzzle/1` sẽ thành `/training/trainer/puzzle/1` trên production.

**Verify:** App navigate đúng khi `base` = `/training/`.

---

### Task 2 — Tạo `public/_redirects` (SPA Routing Fix cho subdirectory)
**File:** `public/_redirects` (NEW)
**Nội dung:**
```
/training/* /training/index.html 200
```
**Why:** Cloudflare Pages cần biết rằng tất cả route dưới `/training/` đều là SPA route. Nếu user vào `/training/trainer/puzzle/1` thẳng → 404 nếu không có rule này.

> ⚠️ Rule `/* /index.html 200` **KHÔNG DÙNG ĐƯỢC** vì sẽ conflict với root domain `tftiseasy.com` (nếu có nội dung khác ở root).

**Verify:** File tồn tại ở `public/_redirects`. Sau deploy, URL `/training/trainer/puzzle/1` không 404.

---

### Task 3 — Tạo GitHub Actions Workflow cho Supabase
**File:** `.github/workflows/supabase-deploy.yml` (NEW)

```yaml
name: Deploy Supabase (Migrations + Functions)

on:
  push:
    branches: [main]
    paths:
      - 'supabase/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - run: supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

**Verify:** Workflow file tồn tại, YAML hợp lệ. Trigger khi push `supabase/**`.

---

### Task 4 — Thêm `@` alias to `tsconfig.json` (TypeScript path resolution)
**File:** `tsconfig.json`
**Thêm:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
**Why:** `vite.config.ts` có alias `@/` nhưng TypeScript cũng cần biết để type check đúng.

**Verify:** `npm run build` không có lỗi path alias.

---

### Task 5 — Tạo `public/_headers` (Cache Strategy cho subdirectory)
**File:** `public/_headers` (NEW)
**Nội dung:**
```
/training/index.html
  Cache-Control: no-cache

/training/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

**Why:**
- **HTML** (`no-cache`): luôn check bản mới từ CDN → user refresh = nhận version mới ngay
- **JS/CSS** (`immutable, 1 năm`): Vite hash trong filename → an toàn cache dài hạn, browser không request lại
- Ngăn chặn cache mismatch (HTML mới + JS cũ = SPA chết)
- Paths dùng `/training/` prefix vì app deploy ở subdirectory

**Verify:** File tồn tại ở `public/_headers`. Sau deploy, check response headers bằng DevTools.

---

### Task 6 (Optional) — PWA Hot Update Toast
**Mục đích:** User đang mở web → bạn deploy → user thấy toast "Phiên bản mới" → click refresh.

> GitHub, Notion, Discord đều làm kiểu này.

**Install:**
```bash
npm install vite-plugin-pwa
```

**Config (`vite.config.ts`):**
```ts
import { VitePWA } from 'vite-plugin-pwa'

plugins: [
  react(),
  VitePWA({ registerType: 'autoUpdate' })
]
```

**UI:** Toast component hiển thị "Phiên bản mới available" + nút [Refresh]

**Priority:** LOW — chỉ cần khi muốn UX cực kỳ mượt. Không bắt buộc cho MVP deploy.

---

## 🚀 Manual Deploy Steps (Sau khi code sẵn sàng)

> Đây là step dùng tay, không có trong CI/CD
> Domain `tftiseasy.com` đã có và đã public.

### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "chore: cloudflare deploy config for /training"
git push origin main
```

### Bước 2: Connect Cloudflare Pages
1. Vào [pages.cloudflare.com](https://pages.cloudflare.com)
2. **Create a project → Connect to Git**
3. Chọn repo `daviddung6996/tft-hoho`
4. Build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. **Environment Variables (Production):**
   - `VITE_SUPABASE_URL` = (từ Supabase Dashboard)
   - `VITE_SUPABASE_ANON_KEY` = (từ Supabase Dashboard)
6. Click **Save and Deploy**

### Bước 3: Setup Route `/training` trên Cloudflare

> ⚠️ **Đây là bước quan trọng nhất** — nếu không làm đúng, app sẽ không chạy ở `/training`

**Thực tế:** `tftiseasy.com` root đã có 1 CF Pages project riêng (landing page). Vậy training tool sẽ là **Pages project thứ 2**, route qua `/training/*`.

**Cách làm:**

1. **Tạo CF Pages project mới** cho training tool (repo `daviddung6996/tft-hoho`)
   - Project name: `tftiseasy-training` (hoặc tùy chọn)
   - Sẽ nhận subdomain mặc định: `tftiseasy-training.pages.dev`

2. **Dùng Cloudflare `_routes.json` trong landing page project** HOẶC **Cloudflare Worker** để proxy `/training/*` → training Pages project:

   **Cách đơn giản nhất — Cloudflare Redirect Rule:**
   - Cloudflare Dashboard → Domain `tftiseasy.com` → Rules → Redirect Rules
   - Nếu URL path bắt đầu `/training` → proxy/redirect tới `tftiseasy-training.pages.dev`

   **Cách mạnh nhất — Cloudflare Worker route:**
   ```js
   // worker.js — route /training/* → training Pages project
   export default {
     async fetch(request) {
       const url = new URL(request.url)
       if (url.pathname.startsWith('/training')) {
         // Rewrite to training Pages project
         const trainingUrl = new URL(request.url)
         trainingUrl.hostname = 'tftiseasy-training.pages.dev'
         return fetch(trainingUrl)
       }
       // Fallback to landing page
       return fetch(request)
     }
   }
   ```
   - Assign Worker route: `tftiseasy.com/training/*`

3. **Verify:** `tftiseasy.com/training` → training tool, `tftiseasy.com` → landing page vẫn bình thường

### Bước 4: Deploy Supabase Edge Functions (manual, 1 lần)
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-caption
```

### Bước 5: Add GitHub Secrets
Trong GitHub repo → Settings → Secrets and variables → Actions:
- `SUPABASE_PROJECT_REF` = project ref từ Supabase URL
- `SUPABASE_ACCESS_TOKEN` = từ `~/.supabase/access-token` sau `supabase login`

### Bước 6: Verify Domain Routing
- Mở `tftiseasy.com/training` → phải thấy training tool
- Mở `tftiseasy.com/training/trainer/puzzle/1` → SPA route hoạt động, không 404
- Mở `tftiseasy.com` → root domain không bị ảnh hưởng

---

## ✅ Done When

- [ ] `vite.config.ts` có `base: '/training/'`
- [ ] React Router có `basename="/training"`
- [ ] `npm run build` chạy thành công, không có lỗi
- [ ] `dist/index.html` có `/training/` prefix trong script/link tags
- [ ] `dist/assets/` có nhiều chunk files (vendor-three, vendor-remotion...)
- [ ] `public/_redirects` tồn tại với nội dung `/training/* /training/index.html 200`
- [ ] `public/_headers` tồn tại với cache rules cho `/training/` paths
- [ ] `.github/workflows/supabase-deploy.yml` tồn tại, YAML valid
- [ ] `tsconfig.json` có `paths` config cho `@/*`
- [ ] (Manual) App live tại `tftiseasy.com/training`
- [ ] (Manual) Route `tftiseasy.com/training/trainer/puzzle/1` không bị 404
- [ ] (Manual) `tftiseasy.com` root domain không bị ảnh hưởng
- [ ] (Manual) Response headers đúng: HTML = `no-cache`, JS = `immutable`
- [ ] (Optional) PWA toast hoạt động khi deploy version mới

---

## 💰 Cost Breakdown

| Service | Cost |
|---------|------|
| Cloudflare Pages | **$0** (unlimited bandwidth, 500 build phút/tháng) |
| Supabase | **$0** (free tier: 500MB DB, 50k MAU, 2 Edge Functions) |
| Custom Domain | **~$10/năm** (domain cost, không phải Cloudflare) |
| **Total** | **$0/tháng** |

---

## 🎯 Deploy Checklist (Push → Quên nó đi)

| # | Item | Status |
|---|------|--------|
| 1 | Hosting: Cloudflare Pages | ⬜ |
| 2 | Build: `npm run build` | ⬜ |
| 3 | Cache: `_headers` | ⬜ |
| 4 | SPA fallback: `_redirects` | ⬜ |
| 5 | Optional: `vite-plugin-pwa` | ⬜ |

> DevOps tốt nhất cho solo dev: **push → deploy → quên nó đi**

---

## 📝 Log

- **2026-03-05:** Brainstorming complete — confirmed CDN atomic switch, cache strategy, PWA optional
- **2026-03-05:** Updated SPEC — domain `tftiseasy.com` đã có, deploy tại `/training` subdirectory. Thêm `base` path config, React Router basename, build script cho subdirectory structure.

