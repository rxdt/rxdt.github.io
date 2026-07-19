// Gold cursor trail, shared by every page. Shipped from public/ as a same-origin
// classic script so the Content-Security-Policy (script-src 'self') admits it
// with no inline <script>, and referenced with `defer` so it never becomes a
// render-blocking or critical-chain request.
//
// Rendered on a <canvas> (not per-node inline styles) so it stays CSP-safe and
// passes the no-inline-styles gate: all sizing/gradients are drawn on the 2D
// context, and the canvas is positioned by the .cursor-canvas CSS class in
// tokens.css, never by a style attribute. Skipped on touch, narrow, or
// reduced-motion inputs so it never costs pointer-less or motion-sensitive
// users.
(() => {
  const shouldSkip =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth < 768 ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (shouldSkip) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "cursor-canvas";
  document.body.appendChild(canvas);

  const context = canvas.getContext("2d");

  if (context === null) {
    return;
  }

  const trailLength = 30;
  const positions = Array.from({ length: trailLength }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }));
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let rafId = 0;

  // Size the bitmap to the physical pixel grid so the trail stays crisp and
  // maps 1:1 to pointer coordinates on HiDPI/Retina displays. The context is
  // scaled by the same ratio so all drawing math stays in CSS pixels.
  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const advance = () => {
    positions[0].x = mouseX;
    positions[0].y = mouseY;
    for (let index = 1; index < trailLength; index += 1) {
      const previous = positions[index - 1];
      const current = positions[index];
      const ease = 0.4 + index * 0.01;

      current.x += (previous.x - current.x) * ease;
      current.y += (previous.y - current.y) * ease;
    }
  };

  const drawDot = (index) => {
    // Paint radius is several times the core dot so the soft gradient falloff
    // reads as a glow (canvas has no box-shadow bloom like the old DOM dots).
    const glow = 12 - index * 0.28;
    const opacity = Math.max(0, 0.85 - index * 0.022);
    const { x, y } = positions[index];
    const gradient = context.createRadialGradient(x, y, 0, x, y, glow);

    gradient.addColorStop(0, `rgba(255,224,160,${opacity})`);
    gradient.addColorStop(0.25, `rgba(255,200,120,${opacity * 0.55})`);
    gradient.addColorStop(0.6, `rgba(200,150,80,${opacity * 0.22})`);
    gradient.addColorStop(1, "rgba(150,100,50,0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, glow, 0, Math.PI * 2);
    context.fill();
  };

  const tick = () => {
    advance();
    // clearRect IS subject to the active transform, so clear in the same CSS-pixel
    // space the dots are drawn in. Passing device-pixel dims (canvas.width/height)
    // here misaligns the cleared region from the drawn region at any devicePixelRatio
    // other than 1 (e.g. fractional or sub-1 DPR from a scaled display), leaving
    // un-cleared bands where the trail accumulates into a permanent smear.
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.globalCompositeOperation = "screen";
    for (let index = 0; index < trailLength; index += 1) {
      drawDot(index);
    }
    rafId = window.requestAnimationFrame(tick);
  };

  const onPointerMove = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  };

  // Listen to both events: pointermove covers trackpads, pens, and browsers that
  // suppress mousemove, while mousemove is the reliable fallback. Either one
  // keeps positions[0] pinned to the live pointer so the trail cannot freeze.
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("resize", resize, { passive: true });

  // A backgrounded tab throttles requestAnimationFrame; restart the loop on
  // return so the trail never stays stalled where it stopped.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(tick);
    }
  });
  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(rafId);
  });

  resize();
  tick();
})();
