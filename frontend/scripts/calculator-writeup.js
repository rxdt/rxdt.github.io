// Page styles delivered as an external same-origin module so the
// Content-Security-Policy (script-src 'self', style-src 'self') admits
// them with no inline <script>/<style>. A constructable stylesheet keeps
// the built HTML free of <style> elements and style= attributes.
const sheet = new CSSStyleSheet();
sheet.replaceSync(String.raw`
:root {
  --paper: #f7f5ef;
  --paper-2: #efece3;
  --ink: #1a1c22;
  --slate: #5b6270;
  --faint: #8a8f9a;
  --rule: #d8d2c6;
  --stamp: #b83227;
  --stamp-soft: #f0e2df;
  --accent-ink: #2a3140;
  --measure: 66ch;
  --serif:
    "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua",
    Charter, Georgia, "Times New Roman", serif;
  --mono:
    ui-monospace, "SF Mono", "SFMono-Regular", "Cascadia Code",
    "Roboto Mono", Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #17181c;
    --paper-2: #1e2026;
    --ink: #ece7db;
    --slate: #a3a8b3;
    --faint: #767b86;
    --rule: #34363e;
    --stamp: #e15a45;
    --stamp-soft: #2b1f1d;
    --accent-ink: #c7d0e0;
  }
}
:root[data-theme="dark"] {
  --paper: #17181c;
  --paper-2: #1e2026;
  --ink: #ece7db;
  --slate: #a3a8b3;
  --faint: #767b86;
  --rule: #34363e;
  --stamp: #e15a45;
  --stamp-soft: #2b1f1d;
  --accent-ink: #c7d0e0;
}
:root[data-theme="light"] {
  --paper: #f7f5ef;
  --paper-2: #efece3;
  --ink: #1a1c22;
  --slate: #5b6270;
  --faint: #8a8f9a;
  --rule: #d8d2c6;
  --stamp: #b83227;
  --stamp-soft: #f0e2df;
  --accent-ink: #2a3140;
}

* {
  box-sizing: border-box;
}
html {
  -webkit-text-size-adjust: 100%;
}
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--serif);
  font-size: clamp(1.02rem, 0.96rem + 0.3vw, 1.16rem);
  line-height: 1.62;
  font-feature-settings: "kern", "liga";
  text-rendering: optimizeLegibility;
}

.page {
  max-width: 44rem;
  margin: 0 auto;
  padding: clamp(1.4rem, 4vw, 4rem) clamp(1.1rem, 4vw, 2rem) 5rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.site-link {
  display: inline-flex;
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--slate);
}

.masthead {
  border-top: 3px double var(--ink);
  border-bottom: 3px double var(--ink);
  padding: 1.5rem 0 1.7rem;
  margin-bottom: 2.4rem;
  text-align: center;
}
.eyebrow {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--slate);
  margin: 0 0 1.1rem;
}
.masthead h1 {
  font-size: clamp(1.8rem, 1.3rem + 2.4vw, 2.9rem);
  line-height: 1.08;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-wrap: balance;
  margin: 0 auto;
  max-width: 22ch;
}
.masthead .sub {
  font-style: italic;
  color: var(--slate);
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  max-width: 42ch;
  margin: 1rem auto 0;
  text-wrap: balance;
}
.byline {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--faint);
  margin-top: 1.4rem;
  display: flex;
  gap: 1.4rem;
  justify-content: center;
  flex-wrap: wrap;
}

.flow > * + * {
  margin-top: 1.15rem;
}
p {
  margin: 0;
  max-width: var(--measure);
}
.lead {
  font-size: 1.1em;
}
.lead::first-letter {
  initial-letter: 3;
  -webkit-initial-letter: 3;
  font-weight: 600;
  margin-right: 0.7rem;
  color: var(--accent-ink);
}

a {
  color: inherit;
  text-decoration-color: var(--stamp);
  text-underline-offset: 2px;
}
a:focus-visible {
  outline: 2px solid var(--stamp);
  outline-offset: 3px;
  border-radius: 2px;
}

strong {
  font-weight: 600;
}
code {
  font-family: var(--mono);
  font-size: 0.86em;
  background: var(--paper-2);
  padding: 0.08em 0.34em;
  border-radius: 3px;
  border: 1px solid var(--rule);
  word-break: break-word;
}

h2 {
  font-size: clamp(1.3rem, 1.05rem + 1vw, 1.7rem);
  line-height: 1.18;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 2.6rem 0 0;
  text-wrap: balance;
}
h2:first-of-type {
  margin-top: 0;
}
.kicker {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--stamp);
  display: block;
  margin-bottom: 0.45rem;
}

ul.notes {
  margin: 0;
  padding: 0;
  list-style: none;
  max-width: var(--measure);
}
ul.notes li {
  position: relative;
  padding: 0.55rem 0 0.55rem 1.4rem;
  border-bottom: 1px solid var(--rule);
}
ul.notes li::before {
  content: "\2014";
  position: absolute;
  left: 0;
  color: var(--stamp);
  font-family: var(--mono);
}
ul.notes li strong {
  color: var(--accent-ink);
}

blockquote.pull {
  border: none;
  padding: 0;
  margin: 0.4rem auto;
  text-align: center;
}
blockquote.pull p {
  font-size: clamp(1.25rem, 1rem + 1.4vw, 1.8rem);
  line-height: 1.28;
  font-weight: 600;
  letter-spacing: -0.01em;
  max-width: 26ch;
  margin: 0 auto;
  text-wrap: balance;
}

.colophon {
  font-family: var(--mono);
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--slate);
  border-top: 3px double var(--ink);
  margin-top: 3rem;
  padding-top: 1.5rem;
  max-width: var(--measure);
}
.colophon strong {
  color: var(--ink);
  font-weight: 700;
}
`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
