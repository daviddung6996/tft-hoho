import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    base: '/training/',
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        // Use esbuild minification (fast, default in Vite)
        minify: 'esbuild',
        // Target modern browsers — VN mobile users have relatively modern Chrome/Safari
        target: 'es2020',
        // CSS code splitting — load only what's needed
        cssCodeSplit: true,
        // Inline assets smaller than 4KB to reduce HTTP requests
        assetsInlineLimit: 4096,
        // Chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core framework — cached long-term
                    'vendor-react': ['react', 'react-dom'],
                    // Heavy libs — lazy-loaded via React.lazy(), cached separately
                    'vendor-remotion': ['remotion', '@remotion/core', '@remotion/player'],
                    'vendor-recharts': ['recharts'],
                    // Backend SDK
                    'vendor-supabase': ['@supabase/supabase-js'],
                    // Fonts (CSS only, rarely changes)
                    'vendor-fonts': [
                        '@fontsource/inter',
                        '@fontsource/spectral',
                        '@fontsource/share-tech-mono'
                    ],
                },
            },
        },
        // Warn at 500KB chunks (default is 500, keep it)
        chunkSizeWarningLimit: 500,
    },
})
