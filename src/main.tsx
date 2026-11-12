import React from 'react'
import ReactDOM from 'react-dom/client'
import { ComingSoonPage } from './components/ComingSoonPage/ComingSoonPage.tsx'
import {
  clearChunkReloadGuard,
  isChunkLoadError,
  registerPreloadErrorRecovery,
  reloadOnceForChunkError,
} from './utils/chunkRecovery'

// Check if maintenance mode is active.
// In production builds (.env.production) this is 'true' → lightweight Coming Soon page.
// In local dev (development mode) this is typically undefined/false → full app via dynamic bootstrap.
const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

if (MAINTENANCE_MODE) {
  // Standalone coming-soon render. No app code, no providers, no external services loaded.
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ComingSoonPage />
    </React.StrictMode>,
  )
} else {
  registerPreloadErrorRecovery()
  // Dynamically load the full application (and its CSS/providers) only when not in maintenance.
  // This allows production maintenance builds to ship a minimal JS payload (Coming Soon only).
  import('./bootstrapApp.tsx')
    .then(({ bootstrapApp }) => {
      clearChunkReloadGuard()
      bootstrapApp()
    })
    .catch((err) => {
      if (isChunkLoadError(err) && reloadOnceForChunkError()) {
        return
      }
      // Surface bootstrap failure (e.g. network chunk load error) in console for diagnostics.
      console.error('[TFTISEASY] Failed to bootstrap full application:', err)
      const rootEl = document.getElementById('root')
      if (!rootEl) return
      rootEl.replaceChildren()
      const wrap = document.createElement('div')
      wrap.style.cssText = 'min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#000000;color:#E7DED1;font-family:Inter,sans-serif;text-align:center'
      const card = document.createElement('div')
      card.style.cssText = 'max-width:420px;padding:24px;border:1px solid rgba(231,222,209,0.35)'
      const msg = document.createElement('p')
      msg.style.cssText = 'margin:0 0 16px;line-height:1.5'
      msg.textContent = 'Không thể tải ứng dụng do phiên bản mới vừa cập nhật hoặc lỗi mạng.'
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.style.cssText = 'padding:10px 18px;background:#E7DED1;color:#000000;border:none;font-weight:600;cursor:pointer'
      btn.textContent = 'Tải lại trang'
      btn.addEventListener('click', () => {
        clearChunkReloadGuard()
        window.location.reload()
      })
      card.append(msg, btn)
      wrap.append(card)
      rootEl.append(wrap)
    })
}
