import { defineConfig } from "vitest/config"

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  test: {
    isolate: false,
    setupFiles: ["./test/gql-server/setup.ts"],
  },
})
