# rxdt.dev Design System

Extracted from the homepage (`frontend/public/scripts/home-styles.js`), the
single source of the site's look. Every page — including article pages — must
use these tokens.

## Overview

A dark, violet-accented tech aesthetic: near-black backgrounds under a violet
radial glow and a slowly rotating cyan/violet grid, high-contrast zinc text set
in Inter, glassy panels with soft hairline borders, and sparing amber
highlights. The voice is confident, engineered, and a little playful — never
corporate, never paper-and-serif. Dark only: `color-scheme: dark`, no light
theme.

## Colors

High-contrast neutrals over near-black, one dominant accent, one sparing
highlight.

- **Ink (#f4f4f5):** Primary text.
- **Muted (#a1a1aa):** Secondary text, ledes, metadata.
- **Paper (#0d0f12):** Page background, under a violet radial gradient
  (`radial-gradient(ellipse at 50% 0%, rgba(76, 29, 149, 0.34), rgba(13, 15, 18, 0.92) 42%, #050507 100%)`).
- **Violet (#a78bfa):** The accent — eyebrows, links, key highlights; strong
  variant #8b5cf6 for hovers and emphasis.
- **Amber (#fcd34d):** Secondary highlight, used sparingly.
- **Panels:** translucent near-black (`rgba(12, 13, 18, 0.72)`; elevated
  `rgba(6, 7, 11, 0.88)`) with `backdrop-filter: blur(12px–14px)`.
- **Lines:** violet-tinted `rgba(167, 139, 250, 0.22)` for accent borders;
  `rgba(255, 255, 255, 0.1)` for subtle rules.

```yaml
colors:
  primary: "#a78bfa"
  ink: "#f4f4f5"
  muted: "#a1a1aa"
  paper: "#0d0f12"
  panel: "rgba(12, 13, 18, 0.72)"
  panel-strong: "rgba(6, 7, 11, 0.88)"
  line: "rgba(167, 139, 250, 0.22)"
  line-soft: "rgba(255, 255, 255, 0.1)"
  violet: "#a78bfa"
  violet-strong: "#8b5cf6"
  amber: "#fcd34d"
```

## Typography

Everything is Inter (system-ui fallbacks); code and technical labels are the
system mono stack. Headlines are tight (line-height ≤ 1.1, zero letter
spacing); labels are small caps with wide tracking.

- **Headlines:** Inter, huge and tight — h1 `clamp(44px, 6vw, 84px)` at 0.95;
  h2 `clamp(30px, 4vw, 48px)`.
- **Body:** Inter 17px at 1.5; ledes 21px in muted.
- **Labels:** 13–14px, weight 800, `0.08em` tracking, uppercase; eyebrows are
  violet with a 34px pill bar before.
- **Code:** system mono stack.

```yaml
typography:
  h1:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: 0em
  h2:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: 0em
  lede:
    fontFamily: Inter
    fontSize: 21px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0.08em
  label-caps:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0.08em
  code:
    fontFamily: ui-monospace
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.5
```

## Layout

Single centered shell, max-width around 1200px with generous side padding;
sections separated by large vertical rhythm (56–64px). Sticky 72px header.
Articles use a comfortable reading measure (~70ch) inside the shell, with an
optional narrow margin column for callouts on wide viewports.

```yaml
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  gutter: 24px
  header: 72px
```

## Elevation & Depth

Depth comes from translucency and glow, not opaque cards: glassy panels
(`panel` + backdrop blur) over the violet gradient, hairline `line-soft`
borders, and one heavy shadow (`0 24px 70px rgba(0, 0, 0, 0.46)`) for truly
elevated elements. The fixed background grid (48px cyan/violet lines, radial
mask, 18s rotation) sits behind everything at z-index 0; content stacks above
it.

## Shapes

Soft-but-engineered: cards at 12px radius, chips and small panels at 8px,
pills and bars fully rounded (999px). No sharp corners, no large radii.

```yaml
rounded:
  sm: 8px
  md: 12px
  full: 999px
```

## Do's and Don'ts

- Do use violet as the only interaction/accent color; amber only as a rare
  highlight.
- Do keep headlines tight (line-height ≤ 1.1) with zero letter spacing.
- Don't introduce serif or "paper journal" styling — the site is dark
  tech-modern everywhere.
- Don't use opaque light backgrounds; surfaces are translucent near-black
  panels.
- Do respect `prefers-reduced-motion: reduce` (no grid rotation, no smooth
  scroll).
- Do ship styles via same-origin constructable-stylesheet scripts (CSP forbids
  inline styles) with `<body hidden>` until the sheet is adopted.
- Do maintain WCAG AA contrast (4.5:1 for body text) against `paper`.
