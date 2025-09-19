import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react(),
        visualizer({
          filename: './stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'ai-openai': ['openai'],
              'ai-anthropic': ['@anthropic-ai/sdk'],
              'ai-google': ['@google/generative-ai'],
              'ai-mistral': ['@mistralai/mistralai'],
            }
          }
        }
      }
    };
});
