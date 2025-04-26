import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "pnpm dev:test",  // existing script that boots server
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: true
  }
}); 