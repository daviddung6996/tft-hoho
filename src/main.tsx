import React from 'react'
import ReactDOM from 'react-dom/client'
import { ComingSoonPage } from './components/ComingSoonPage/ComingSoonPage.tsx'

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
  // Dynamically load the full application (and its CSS/providers) only when not in maintenance.
  // This allows production maintenance builds to ship a minimal JS payload (Coming Soon only).
  import('./bootstrapApp.tsx')
    .then(({ bootstrapApp }) => {
      bootstrapApp()
    })
    .catch((err) => {
      // Surface bootstrap failure (e.g. network chunk load error) in console for diagnostics.
      console.error('[TFTISEASY] Failed to bootstrap full application:', err)
      // Fallback: at least show something (or we could render a minimal error here)
      document.getElementById('root')!.innerHTML = '<div style="padding:2rem;color:#c8aa6e;font-family:sans-serif">Unable to load application. Please refresh.</div>'
    })
}
