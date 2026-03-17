import { defineConfig, devices } from "@playwright/test";
import * as path from "path";

const GFRONT_ADMIN = path.resolve(__dirname, "..", "gfront", "admin");

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  globalSetup: "./global-setup.ts",
  globalTeardown: "./global-teardown.ts",
  use: {
    baseURL: "http://localhost:4173",
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `cd ${GFRONT_ADMIN} && npx vite preview`,
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
