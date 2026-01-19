import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
    server: {
        host: '127.0.0.1',
        hmr: {
            host: '127.0.0.1'
        }
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ThoughtVisualizer',
            fileName: (format) => `thought-visualizer.${format}.js`,
            formats: ['es', 'umd']
        },
        rollupOptions: {
            external: [], 
            output: {
                globals: {}
            }
        }
    },
    plugins: [dts()]
});