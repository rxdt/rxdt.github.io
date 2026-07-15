// Page styles delivered as an external same-origin module so the
// Content-Security-Policy (script-src 'self', style-src 'self') admits
// them with no inline <script>/<style>. A constructable stylesheet keeps
// the built HTML free of <style> elements and style= attributes.
const sheet = new CSSStyleSheet();
sheet.replaceSync(String.raw`
:root {
  color-scheme: dark;
  --ink: #f4f4f5;
  --muted: #a1a1aa;
  --paper: #0d0f12;
  --panel: rgba(12, 13, 18, 0.72);
  --panel-strong: rgba(6, 7, 11, 0.88);
  --line: rgba(167, 139, 250, 0.22);
  --line-soft: rgba(255, 255, 255, 0.1);
  --violet: #a78bfa;
  --violet-strong: #8b5cf6;
  --amber: #fcd34d;
  --shadow: 0 24px 70px rgba(0, 0, 0, 0.46);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgba(76, 29, 149, 0.34),
      rgba(13, 15, 18, 0.92) 42%,
      #050507 100%
    ),
    var(--paper);
  color: var(--ink);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  line-height: 1.5;
  overflow-x: hidden;
}

.background-grid {
  position: fixed;
  inset: -62vmax;
  z-index: 0;
  pointer-events: none;
  opacity: 1;
  overflow: hidden;
}

.background-grid::before,
.background-grid::after {
  content: "";
  position: absolute;
  inset: 0;
}

.background-grid::before {
  background-image:
    linear-gradient(rgba(34, 211, 238, 0.26) 1px, transparent 1px),
    linear-gradient(90deg, rgba(167, 139, 250, 0.22) 1px, transparent 1px);
  background-position: center;
  background-size: 48px 48px;
  mask-image: radial-gradient(
    circle at 50% 28%,
    rgba(0, 0, 0, 1),
    rgba(0, 0, 0, 0.78) 48%,
    transparent 74%
  );
  transform-origin: center;
  animation: grid-spin 18s linear infinite;
  will-change: transform;
}

.background-grid::after {
  background:
    radial-gradient(
      circle at 50% 18%,
      rgba(34, 211, 238, 0.18),
      transparent 24%
    ),
    radial-gradient(
      circle at 68% 42%,
      rgba(252, 211, 77, 0.1),
      transparent 20%
    );
  mix-blend-mode: screen;
}

header,
main,
footer {
  position: relative;
  z-index: 1;
}

@keyframes grid-spin {
  from {
    transform: rotate(0deg) scale(1);
  }

  to {
    transform: rotate(360deg) scale(1);
  }
}

.cursor-gold-dot {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  border-radius: 50%;
  mix-blend-mode: screen;
  z-index: 9999;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .background-grid::before {
    animation: none;
  }
}

a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  color: var(--violet);
}

.shell {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
}

header {
  border-bottom: 1px solid var(--line-soft);
  background: rgba(5, 5, 7, 0.78);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(14px);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  gap: 24px;
}

.brand {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--ink);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 18px;
  color: var(--muted);
  font-size: 15px;
  font-weight: 650;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.04fr) minmax(300px, 0.72fr);
  gap: 48px;
  align-items: center;
  min-height: calc(100vh - 72px);
  padding: 58px 0 64px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--violet);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.eyebrow::before {
  content: "";
  width: 34px;
  height: 3px;
  border-radius: 999px;
  background: var(--violet);
}

h1 {
  margin: 18px 0 20px;
  max-width: 760px;
  font-size: clamp(44px, 6vw, 84px);
  line-height: 0.95;
  letter-spacing: 0;
}

.lede {
  max-width: 720px;
  color: var(--muted);
  font-size: 21px;
}

.portrait {
  position: relative;
  overflow: hidden;
  width: min(100%, 360px);
  justify-self: end;
  border: 1px solid rgba(167, 139, 250, 0.35);
  border-radius: 12px;
  background: rgba(8, 8, 12, 0.55);
  box-shadow:
    0 0 46px rgba(139, 92, 246, 0.24),
    inset 0 0 18px rgba(167, 139, 250, 0.12),
    var(--shadow);
}

.portrait::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(167, 139, 250, 0.16), transparent 34%),
    radial-gradient(
      circle at 50% 20%,
      transparent,
      rgba(0, 0, 0, 0.22) 70%
    );
  mix-blend-mode: screen;
}

.portrait img {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: block;
  object-fit: cover;
  object-position: 50% 28%;
  filter: grayscale(1) contrast(1.08);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid rgba(167, 139, 250, 0.54);
  border-radius: 8px;
  font-weight: 800;
  background: rgba(167, 139, 250, 0.16);
  color: var(--ink);
  box-shadow: inset 0 0 10px rgba(167, 139, 250, 0.18);
}

.button.secondary {
  background: transparent;
  color: var(--ink);
  border-color: var(--line-soft);
  box-shadow: none;
}

.button:hover {
  text-decoration: none;
  border-color: var(--violet);
  background: rgba(167, 139, 250, 0.24);
}

section {
  padding: 56px 0;
  border-top: 1px solid var(--line-soft);
}

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

h2 {
  margin: 0;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1;
  letter-spacing: 0;
}

.section-note {
  max-width: 520px;
  margin: 0;
  color: var(--muted);
  font-size: 17px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.project {
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  overflow: hidden;
  background: var(--panel);
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
}

.project-image {
  width: 100%;
  height: 300px;
  display: block;
  object-fit: cover;
  background: #111117;
}

.project-image--calc {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 20px;
  background:
    radial-gradient(
      circle at top left,
      rgba(167, 139, 250, 0.5),
      transparent 42%
    ),
    linear-gradient(135deg, #111117, #2e1065);
  color: var(--ink);
  font-size: clamp(26px, 4vw, 34px);
  font-weight: 850;
  line-height: 1.05;
}

.project-image--calc:hover {
  text-decoration: none;
}

.project-image--conference {
  object-position: center;
}

.project-media {
  display: block;
  background: #111117;
}

.project-media:hover {
  text-decoration: none;
}

.project-media:hover .project-image {
  opacity: 0.9;
}

.project-video {
  object-fit: contain;
  background: #050507;
}

.project-body {
  padding: 22px;
}

.project-kicker {
  color: var(--violet);
  font-size: 13px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h3 {
  margin: 8px 0 10px;
  font-size: 28px;
  line-height: 1.08;
  letter-spacing: 0;
}

.project p {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 18px;
  font-weight: 800;
}

.links a {
  color: var(--violet);
}

.repo-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.repo-link svg {
  width: 22px;
  height: 22px;
  display: block;
}

.focus-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.focus {
  border: 1px solid var(--line-soft);
  border-left: 4px solid var(--violet);
  border-radius: 8px;
  background: rgba(12, 13, 18, 0.58);
  padding: 18px 18px 18px 20px;
  backdrop-filter: blur(10px);
}

.focus strong {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
}

.focus span {
  color: var(--muted);
}

.contact {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(280px, 1fr);
  gap: 28px;
  align-items: start;
}

.contact-list {
  display: grid;
  gap: 10px;
}

.contact-list a {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  padding: 14px 16px;
  background: var(--panel);
  font-weight: 800;
  backdrop-filter: blur(10px);
}

.contact-list svg {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

footer {
  padding: 36px 0 46px;
  color: var(--muted);
  font-size: 14px;
}

@media (max-width: 820px) {
  .nav {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    padding: 16px 0;
  }

  .nav-links {
    flex-wrap: wrap;
  }

  .contact {
    grid-template-columns: 1fr;
  }

  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 48px;
  }

  .portrait {
    width: min(100%, 320px);
    justify-self: start;
  }

  .portrait img {
    aspect-ratio: 1 / 1;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .project-grid,
  .focus-grid {
    grid-template-columns: 1fr;
  }

  .project-image {
    height: auto;
    aspect-ratio: 16 / 10;
  }
}
`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
