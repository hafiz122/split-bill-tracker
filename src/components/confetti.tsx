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
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const particles: Particle[] = [];
    const count = 60;

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const size = 5 + Math.random() * 10;

      el.style.position = "fixed";
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      el.style.width = `${size}px`;
      el.style.height = shape === "strip" ? `${size * 3}px` : `${size}px`;
      el.style.background = color;
      el.style.borderRadius = shape === "circle" ? "50%" : shape === "strip" ? "1px" : "2px";
      el.style.pointerEvents = "none";
      el.style.zIndex = "9999";
      el.style.willChange = "transform, opacity";

      document.body.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const speed = 160 + Math.random() * 280;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 80;

      particles.push({
        el,
        x: cx,
        y: cy,
        vx,
        vy,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1200,
        opacity: 1,
        scale: 0.5 + Math.random() * 1.0,
      });
    }

    let start: number | null = null;
    const duration = 2200;

    function tick(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = elapsed / duration;

      for (const p of particles) {
        p.x += p.vx * 0.016;
        p.vy += 400 * 0.016;
        p.y += p.vy * 0.016;
        p.rotation += p.rotationSpeed * 0.016;

        if (progress > 0.55) {
          p.opacity = Math.max(0, 1 - (progress - 0.55) / 0.45);
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
    <div ref={anchorRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
  );
}
