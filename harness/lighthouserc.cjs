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
      // DELIBERATE, NARROW EXEMPTION (owner decision). The homepage portrait is a real animated
      // WebP (merged.webp, 10 frames). Its byte size trips `image-delivery-insight`, and an animated
      // portrait cannot satisfy that audit without becoming a static image — which destroys the
      // intent of the asset. We keep the real portrait and turn OFF only this one audit; every other
      // recommended Lighthouse assertion (perf, a11y, best-practices, SEO, all other insights) stays
      // at full strength. This is the single intentional relaxation of the gate.
      assertions: {
        "image-delivery-insight": "off",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./frontend/.lighthouseci",
    },
  },
};
