(() => {
  const comfydayVideo = document.querySelector(".project-video");

  if (comfydayVideo instanceof HTMLVideoElement) {
    comfydayVideo.autoplay = true;
    void comfydayVideo.play().catch(() => {
      comfydayVideo.controls = true;
    });
  }
})();

(() => {
  const shouldSkip =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth < 768 ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (shouldSkip) {
    return;
  }

  const trailLength = 30;
  const dots = [];
  const positions = [];
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let rafId = 0;

  for (let index = 0; index < trailLength; index += 1) {
    const dot = document.createElement("div");
    const size = 8 - index * 0.15;
    const opacity = Math.max(0, 0.5 - index * 0.015);

    dot.className = "cursor-gold-dot";
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.background = `radial-gradient(circle at 30% 30%, rgba(255,220,150,${opacity * 0.8}), rgba(255,200,120,${opacity * 0.6}), rgba(200,150,80,${opacity * 0.4}), rgba(150,100,50,${opacity * 0.2}), transparent)`;
    dot.style.boxShadow = `0 0 ${size * 0.8}px rgba(255,200,120,${opacity * 0.3}), inset -1px -1px 2px rgba(150,100,50,${opacity * 0.2}), inset 1px 1px 2px rgba(255,220,150,${opacity * 0.3})`;

    document.body.appendChild(dot);
    dots.push({ element: dot, size });
    positions.push({ x: mouseX, y: mouseY });
  }

  const move = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  };

  const tick = () => {
    for (let index = 0; index < trailLength; index += 1) {
      if (index === 0) {
        positions[index].x = mouseX;
        positions[index].y = mouseY;
      } else {
        const previous = positions[index - 1];
        const current = positions[index];
        const ease = 0.4 + index * 0.01;

        current.x += (previous.x - current.x) * ease;
        current.y += (previous.y - current.y) * ease;
      }

      const dot = dots[index];
      dot.element.style.transform = `translate3d(${positions[index].x - dot.size / 2}px, ${positions[index].y - dot.size / 2}px, 0)`;
    }

    rafId = window.requestAnimationFrame(tick);
  };

  window.addEventListener("mousemove", move, { passive: true });
  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(rafId);
  });
  tick();
})();
