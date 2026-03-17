import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function getProductionSafeVisianChatUrl(mode: string, env: Record<string, string>) {
    if (mode !== 'production') {
        return undefined
    }

    const rawUrl = env.VITE_VISIAN_CHAT_URL?.trim()
    if (!rawUrl) {
        return undefined
    }

    const normalized = rawUrl.toLowerCase()
    const isLocalHost = normalized.includes('://127.0.0.1')
        || normalized.includes('://localhost')
        || normalized.includes('://0.0.0.0')

    if (isLocalHost) {
        return ''
    }

    return rawUrl
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const productionSafeVisianChatUrl = getProductionSafeVisianChatUrl(mode, env)

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        define: productionSafeVisianChatUrl !== undefined
            ? {
                'import.meta.env.VITE_VISIAN_CHAT_URL': JSON.stringify(productionSafeVisianChatUrl),
            }
            : undefined,
        esbuild: {
            drop: ['console', 'debugger'],
        },
        build: {
            minify: 'esbuild',
            target: 'es2020',
            cssCodeSplit: true,
            assetsInlineLimit: 4096,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'vendor-react': ['react', 'react-dom'],
                        'vendor-supabase': ['@supabase/supabase-js'],
                    },
                },
            },
            chunkSizeWarningLimit: 500,
        },
    }
})
