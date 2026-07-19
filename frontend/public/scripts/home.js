// Homepage behavior, shipped from public/ as a same-origin classic script so the
// Content-Security-Policy (script-src 'self') admits it with no inline <script>.
// It is referenced with `defer` (not type="module"), which keeps it a low-priority,
// non-render-blocking request: it never becomes a critical-chain node, so the
// Lighthouse network-dependency-tree stays empty. A module entry would make Vite
// emit a high-priority `index-*.js` bundle (+ modulepreload polyfill) that Lighthouse
// counts as a critical dependency.

(() => {
  const comfydayVideo = document.querySelector(".project-video");

  if (comfydayVideo instanceof HTMLVideoElement) {
    comfydayVideo.autoplay = true;
    void comfydayVideo.play().catch(() => {
      comfydayVideo.controls = true;
    });
  }
})();
