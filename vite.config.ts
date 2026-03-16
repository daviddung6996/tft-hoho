import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function assertProductionVisianChatUrl(mode: string, env: Record<string, string>) {
    if (mode !== 'production') {
        return
    }

    const rawUrl = env.VITE_VISIAN_CHAT_URL?.trim()
    if (!rawUrl) {
        return
    }

    const normalized = rawUrl.toLowerCase()
    const isLocalHost = normalized.includes('://127.0.0.1')
        || normalized.includes('://localhost')
        || normalized.includes('://0.0.0.0')

    if (isLocalHost) {
        throw new Error(
            'Production build blocked: VITE_VISIAN_CHAT_URL points to localhost. Move this setting to .env.local or unset it before building.',
        )
    }
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    assertProductionVisianChatUrl(mode, env)

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
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
                        'vendor-remotion': ['remotion', '@remotion/core', '@remotion/player'],
                        'vendor-recharts': ['recharts'],
                        'vendor-supabase': ['@supabase/supabase-js'],
                        'vendor-fonts': [
                            '@fontsource/inter',
                            '@fontsource/spectral',
                            '@fontsource/share-tech-mono'
                        ],
                    },
                },
            },
            chunkSizeWarningLimit: 500,
        },
    }
})
