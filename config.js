import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/photos': 'http://localhost:8000'
        }
    }
})