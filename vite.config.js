import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/highimnoah.github.io/',
    build: {
        outDir: 'dist',
    }
});