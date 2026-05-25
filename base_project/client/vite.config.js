import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  server: {
    host: "0.0.0.0",
    port: 4300
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"]
        }
      }
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/lib/test/setupTests.js"
  }
});
