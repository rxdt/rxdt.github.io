module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm --prefix frontend run preview -- --port 4183",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 10000,
      url: ["http://127.0.0.1:4183/"],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--headless --no-sandbox",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      },
    },
    assert: {
      preset: "lighthouse:recommended",
    },
    upload: {
      target: "filesystem",
      outputDir: "./frontend/.lighthouseci",
    },
  },
};
