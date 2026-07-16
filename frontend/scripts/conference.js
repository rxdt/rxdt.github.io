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
  --faint: #676d79;
  --rule: #d8d2c6;
  --stamp: #b83227;
  --stamp-soft: #f0e2df;
  --accent-ink: #2a3140;
  --shadow: 26 28 34;
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
    --faint: #8b909b;
    --rule: #34363e;
    --stamp: #e15a45;
    --stamp-soft: #241a18;
    --accent-ink: #c7d0e0;
    --shadow: 0 0 0;
  }
}
:root[data-theme="dark"] {
  --paper: #17181c;
  --paper-2: #1e2026;
  --ink: #ece7db;
  --slate: #a3a8b3;
  --faint: #8b909b;
  --rule: #34363e;
  --stamp: #e15a45;
  --stamp-soft: #241a18;
  --accent-ink: #c7d0e0;
  --shadow: 0 0 0;
}
:root[data-theme="light"] {
  --paper: #f7f5ef;
  --paper-2: #efece3;
  --ink: #1a1c22;
  --slate: #5b6270;
  --faint: #676d79;
  --rule: #d8d2c6;
  --stamp: #b83227;
  --stamp-soft: #f0e2df;
  --accent-ink: #2a3140;
  --shadow: 26 28 34;
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
  max-width: 78rem;
  margin: 0 auto;
  padding: clamp(1.4rem, 4vw, 4rem) clamp(1.1rem, 4vw, 3.5rem) 5rem;
}

/* ---- Masthead ---- */
.masthead {
  border-top: 3px double var(--ink);
  border-bottom: 3px double var(--ink);
  padding: 1.5rem 0 1.7rem;
  margin-bottom: 2.6rem;
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
  font-size: clamp(1.9rem, 1.3rem + 2.8vw, 3.4rem);
  line-height: 1.05;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-wrap: balance;
  margin: 0 auto;
  max-width: 22ch;
}
.masthead .sub {
  font-style: italic;
  color: var(--slate);
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.3rem);
  max-width: 40ch;
  margin: 1rem auto 0;
  text-wrap: balance;
}
.byline {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--faint);
  margin-top: 1.5rem;
  display: flex;
  gap: 1.4rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* ---- Column + marginalia grid ---- */
.col {
  display: grid;
  grid-template-columns: minmax(0, var(--measure)) minmax(0, 20rem);
  gap: clamp(1.5rem, 4vw, 3.5rem);
  align-items: start;
  justify-content: center;
}
.flow {
  min-width: 0;
}
.flow > * + * {
  margin-top: 1.15rem;
}

p {
  margin: 0;
}
.flow p {
  max-width: var(--measure);
}
.lead {
  font-size: 1.12em;
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
a:focus-visible,
summary:focus-visible {
  outline: 2px solid var(--stamp);
  outline-offset: 3px;
  border-radius: 2px;
}

strong {
  font-weight: 600;
}
em {
}
code,
.mono {
  font-family: var(--mono);
  font-size: 0.86em;
}
.flow code {
  background: var(--paper-2);
  padding: 0.08em 0.34em;
  border-radius: 3px;
  border: 1px solid var(--rule);
  word-break: break-word;
}

/* ---- Section headings ---- */
h2 {
  font-size: clamp(1.35rem, 1.05rem + 1.1vw, 1.9rem);
  line-height: 1.15;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0;
  text-wrap: balance;
}
.section {
  scroll-margin-top: 1rem;
}
.section + .section {
  margin-top: 3.2rem;
  padding-top: 2.6rem;
  border-top: 1px solid var(--rule);
}
.section-offset {
  margin-top: 3.2rem;
  padding-top: 2.6rem;
  border-top: 1px solid var(--rule);
}
.flow-section-offset {
  margin-top: 2.8rem;
}
.flow-offset {
  margin-top: 1.4rem;
}
.flow-offset-tight {
  margin-top: 1.2rem;
}
.paragraph-offset {
  margin-top: 1.4rem;
}
.h2-offset {
  margin-top: 2rem;
}
.h2-small {
  font-size: 1.2rem;
}
.paper-head {
  margin-bottom: 0.4rem;
}
.paper-meta {
  font-family: var(--mono);
  font-size: 0.74rem;
  letter-spacing: 0.05em;
  color: var(--slate);
  margin: 0.55rem 0 1.2rem;
  display: flex;
  gap: 0.6rem 1.2rem;
  flex-wrap: wrap;
}
.paper-meta span {
  white-space: nowrap;
}
.paper-kicker {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--stamp);
  display: block;
  margin-bottom: 0.5rem;
}
h2 em {
  color: var(--slate);
  font-weight: 600;
}

/* ---- Verdict stamps ---- */
.stamp {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--stamp);
  border: 2px solid var(--stamp);
  background: var(--stamp-soft);
  padding: 0.28rem 0.6rem;
  border-radius: 4px;
  transform: rotate(-2.5deg);
  white-space: nowrap;
}
.stamp .big {
  font-size: 1.05rem;
  letter-spacing: 0.02em;
}

/* ---- Marginalia (sidebars) ---- */
.margin {
  grid-column: 2;
  font-family: var(--mono);
  background: var(--paper-2);
  border: 1px solid var(--rule);
  border-top: 3px solid var(--slate);
  padding: 1.05rem 1.15rem 1.2rem;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--ink);
  position: sticky;
  top: 1rem;
}
.margin > * + * {
  margin-top: 0.7rem;
}
.margin .label {
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--slate);
  font-weight: 700;
  display: block;
  margin-bottom: 0.3rem;
}
.margin .margin-quote {
  font-family: var(--serif);
  font-size: 1.02rem;
  line-height: 1.25;
  font-weight: 600;
  margin: 0;
}
.margin p {
  max-width: none;
}
.margin code {
  color: var(--accent-ink);
  word-break: break-word;
}
.margin-empty {
  background: none;
  border: none;
  padding: 0;
}

/* On narrow screens marginalia falls inline under its anchor */
@media (max-width: 62rem) {
  .col {
    grid-template-columns: minmax(0, 1fr);
  }
  .margin {
    grid-column: 1;
    position: static;
    max-width: var(--measure);
    margin: 0.4rem 0 0.2rem;
  }
}

/* ---- Errata / verdict callouts ---- */
.errata {
  border-left: 3px solid var(--stamp);
  background: var(--stamp-soft);
  padding: 0.9rem 1.1rem;
  font-size: 0.95em;
}
.errata .label {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--stamp);
  font-weight: 700;
  display: block;
  margin-bottom: 0.35rem;
}

blockquote {
  margin: 0;
  padding: 0.2rem 0 0.2rem 1.3rem;
  border-left: 2px solid var(--rule);
  color: var(--ink);
  font-style: italic;
  max-width: var(--measure);
}
blockquote.pull {
  font-style: normal;
  border-left: none;
  padding: 0;
  text-align: center;
  margin: 0.4rem auto;
}
blockquote.pull p {
  font-size: clamp(1.3rem, 1rem + 1.6vw, 2rem);
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: -0.01em;
  max-width: 24ch;
  margin: 0 auto;
  text-wrap: balance;
}
.plain-quote {
  font-style: normal;
}
.dialogue {
}
.dialogue > * + * {
  margin-top: 0.9rem;
}
.dialogue .who {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--stamp);
  display: block;
  margin-bottom: 0.2rem;
}

/* ---- Results table ---- */
.table-wrap {
  overflow-x: auto;
  margin: 0.3rem 0;
}
table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.92rem;
  min-width: 30rem;
}
caption {
  text-align: left;
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--slate);
  padding-bottom: 0.5rem;
}
th,
td {
  text-align: left;
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid var(--rule);
  vertical-align: top;
}
thead th {
  font-family: var(--mono);
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--slate);
  border-bottom: 2px solid var(--ink);
  font-weight: 700;
}
td .m {
  font-family: var(--mono);
  font-size: 0.82em;
  color: var(--stamp);
  word-break: break-word;
}

hr.rule {
  border: none;
  border-top: 1px solid var(--rule);
  margin: 3.2rem 0 0;
}

.colophon {
  font-family: var(--mono);
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--slate);
  border-top: 3px double var(--ink);
  margin-top: 3.5rem;
  padding-top: 1.5rem;
  max-width: var(--measure);
  margin-inline: auto;
}
.colophon strong {
  color: var(--ink);
  font-weight: 700;
}

.footnote {
  font-size: 0.9em;
  color: var(--slate);
  border-top: 1px solid var(--rule);
  margin-top: 1.4rem;
  padding-top: 1rem;
  max-width: var(--measure);
}
.footnote .fn-label {
  font-family: var(--mono);
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--faint);
  display: block;
  margin-bottom: 0.35rem;
}

/* verdict line under each paper */
.verdict-line {
  font-family: var(--mono);
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--ink);
  border-top: 1px solid var(--rule);
  padding-top: 0.9rem;
  margin-top: 0.4rem;
}
.verdict-line strong {
  color: var(--stamp);
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
.canonical-link {
  text-decoration-color: var(--stamp);
}

@media (prefers-reduced-motion: no-preference) {
  .stamp {
    transition: transform 0.2s ease;
  }
  .stamp:hover {
    transform: rotate(0deg) scale(1.03);
  }
}
`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
