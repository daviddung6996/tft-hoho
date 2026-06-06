/**
 * Bootstrap for the full TFTISEASY application.
 * This module is dynamically imported ONLY when maintenance mode is OFF.
 * 
 * This enables:
 * - True separation: maintenance builds do not bundle or load App/providers/supabase/etc in the entry chunk.
 * - Lightweight standalone Coming Soon page in production (when VITE_MAINTENANCE_MODE=true via .env.production).
 * - Normal full app for local dev (development mode does not load .env.production).
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { GameDataProvider } from './contexts/GameDataContext.tsx'
import './index.css'
import './styles/Common.css'

export function bootstrapApp(): void {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <GameDataProvider>
          <App />
        </GameDataProvider>
      </AuthProvider>
    </React.StrictMode>,
  )
}
