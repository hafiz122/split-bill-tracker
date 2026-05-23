"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#f97316", "#22c55e", "#fbbf24", "#ec4899", "#06b6d4", "#f2efe9", "#f97316", "#22c55e", "#fbbf24", "#ec4899"];
const SHAPES = ["square", "circle", "strip"];

interface Particle {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  scale: number;
}

export function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const particles: Particle[] = [];
    const count = 50;

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const size = 4 + Math.random() * 8;

      el.style.position = "absolute";
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      el.style.width = `${size}px`;
      el.style.height = shape === "strip" ? `${size * 3}px` : `${size}px`;
      el.style.background = color;
      el.style.borderRadius = shape === "circle" ? "50%" : shape === "strip" ? "1px" : "2px";
      el.style.pointerEvents = "none";
      el.style.zIndex = "10";

      container.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 200;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 40;

      particles.push({
        el,
        x: cx,
        y: cy,
        vx,
        vy,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 900,
        opacity: 1,
        scale: 0.6 + Math.random() * 0.8,
      });
    }

    let start: number | null = null;
    const duration = 2000;

    function tick(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = elapsed / duration;

      for (const p of particles) {
        p.x += p.vx * 0.016;
        p.vy += 300 * 0.016;
        p.y += p.vy * 0.016;
        p.rotation += p.rotationSpeed * 0.016;

        if (progress > 0.6) {
          p.opacity = Math.max(0, 1 - (progress - 0.6) / 0.4);
        }

        p.el.style.transform = `translate(${p.x - cx}px, ${p.y - cy}px) rotate(${p.rotation}deg) scale(${p.scale})`;
        p.el.style.opacity = `${p.opacity}`;
      }

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        for (const p of particles) {
          p.el.remove();
        }
      }
    }

    requestAnimationFrame(tick);

    return () => {
      for (const p of particles) {
        p.el.remove();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
}
