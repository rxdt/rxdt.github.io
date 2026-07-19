import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "../frontend/tests",
  webServer: {
    command: "npm --prefix ../frontend run dev -- --port 5183",
    url: "http://127.0.0.1:5183",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://127.0.0.1:5183",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "desktop-safari", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 13"] } },
    { name: "iphone", use: { ...devices["iPhone 13"] } },
    { name: "pixel", use: { ...devices["Pixel 5"] } },
    {
      name: "small-320",
      use: {
        viewport: { width: 320, height: 700 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "tablet",
      use: {
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
