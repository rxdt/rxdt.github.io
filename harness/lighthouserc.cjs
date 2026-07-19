module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm --prefix frontend run preview -- --port 4183",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 20000,
      url: ["http://127.0.0.1:4183/"],
      numberOfRuns: 3,
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        // Every category must score a perfect 100 on the production preview
        // build. No per-audit overrides: the portrait is a 174px animated WebP
        // sized to its display, so both image audits pass on their own.
        "categories:performance": ["error", { minScore: 1 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],

        // Hard metric budgets so a page can regress without dropping the
        // rounded category score. Thresholds sit above observed values with
        // headroom for CI's slower runners and simulated-throttling variance:
        //   observed (3-run local max) → budget
        //   LCP  ~1.4s  → 2500ms  (Google "good" threshold)
        //   CLS  0      → 0.1     (any real layout shift trips it)
        //   bytes ~130KB → 250000 (catches image/script bloat)
        // Volatile audits (TBT, speed-index, TTI, mainthread work) are
        // intentionally omitted — their run-to-run spread is too wide to gate
        // on without flaking.
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-byte-weight": ["error", { maxNumericValue: 250000 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./frontend/.lighthouseci",
    },
  },
};
