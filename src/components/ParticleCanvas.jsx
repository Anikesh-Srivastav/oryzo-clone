"use client";

import { useEffect, useRef } from "react";

// ── Simplex-like smooth noise (value noise with cubic interpolation) ──────────
// Avoids any external dependency. Good enough for organic fluid motion.
function smoothNoise(x, y, seed = 0) {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const hash = (n) => {
    let h = (n ^ seed) * 2246822519;
    h ^= h >>> 13;
    return (h * 2654435761) >>> 0;
  };

  const n00 = (hash(xi + hash(yi)) & 0xff) / 255;
  const n10 = (hash(xi + 1 + hash(yi)) & 0xff) / 255;
  const n01 = (hash(xi + hash(yi + 1)) & 0xff) / 255;
  const n11 = (hash(xi + 1 + hash(yi + 1)) & 0xff) / 255;

  return (
    n00 * (1 - u) * (1 - v) +
    n10 * u * (1 - v) +
    n01 * (1 - u) * v +
    n11 * u * v
  );
}

// ── Particle factory ──────────────────────────────────────────────────────────
function createParticle(canvasW, canvasH, index, total) {
  const col = Math.floor(index / (total / 8));
  const lane = (col / 7) * canvasW;
  return {
    x: lane + (Math.random() - 0.5) * (canvasW / 8),
    y: Math.random() * canvasH,
    vx: (Math.random() - 0.5) * 0.4,          // slight horizontal drift
    vy: 0.3 + Math.random() * 0.4,            // top-to-bottom base speed
    radius: 1.2 + Math.random() * 1.8,        // 1.2–3px dots
    baseOpacity: 0.06 + Math.random() * 0.10, // subtle default
    opacity: 0,
    noiseOffset: Math.random() * 1000,        // unique noise phase
    noiseSpeed: 0.0004 + Math.random() * 0.0003,
    repX: 0, // accumulated repulsion this frame
    repY: 0,
  };
}

// ── Config ────────────────────────────────────────────────────────────────────
const PARTICLE_COUNT  = 120;
const LIGHT_RADIUS    = 130;  // px — soft light glow radius
const REPEL_RADIUS    = 80;   // px — particle push-away radius
const REPEL_STRENGTH  = 2.8;  // max repulsion force
const NOISE_SCALE     = 0.0035; // spatial frequency of noise field

export function ParticleCanvas({ style }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    particles: [],
    mouse: { x: -9999, y: -9999 },
    animId: null,
    t: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = stateRef.current;

    // ── Resize handler ───────────────────────────────────────────────────────
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Re-spawn particles proportionally
      state.particles = Array.from({ length: PARTICLE_COUNT }, (_, i) =>
        createParticle(canvas.width, canvas.height, i, PARTICLE_COUNT)
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Mouse tracking ────────────────────────────────────────────────────────
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      state.mouse.x = e.clientX - rect.left;
      state.mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      state.mouse.x = -9999;
      state.mouse.y = -9999;
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    // ── Main loop ─────────────────────────────────────────────────────────────
    const loop = () => {
      state.animId = requestAnimationFrame(loop);
      state.t += 1;

      const { width: W, height: H } = canvas;
      const { mouse, particles, t } = state;

      ctx.clearRect(0, 0, W, H);

      // ── Soft light radial gradient (cursor glow) ──────────────────────────
      const hasMouse = mouse.x > 0;
      if (hasMouse) {
        const grad = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, LIGHT_RADIUS
        );
        grad.addColorStop(0,   "rgba(255,200,140,0.06)");
        grad.addColorStop(0.4, "rgba(255,180,100,0.03)");
        grad.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Update & draw each particle ───────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Noise-driven lateral wander
        const nx = smoothNoise(p.x * NOISE_SCALE, t * p.noiseSpeed, i);
        const ny = smoothNoise(p.y * NOISE_SCALE + 500, t * p.noiseSpeed, i + 999);

        // Apply noise as gentle nudge to velocity
        p.vx += (nx - 0.5) * 0.04;
        p.vy += (ny - 0.5) * 0.015;

        // Damping keeps velocity bounded
        p.vx *= 0.96;
        p.vy  = p.vy  * 0.98 + 0.3 * 0.02; // bleed back toward base downward speed

        // Cursor repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let litRatio = 0;

        if (hasMouse && dist < Math.max(REPEL_RADIUS, LIGHT_RADIUS)) {
          // Soft falloff for brightness
          if (dist < LIGHT_RADIUS) {
            litRatio = Math.max(0, 1 - dist / LIGHT_RADIUS);
            litRatio = litRatio * litRatio; // quadratic falloff
          }

          // Repulsion for inner radius
          if (dist < REPEL_RADIUS && dist > 0) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
            p.vx += (dx / dist) * force * 0.05;
            p.vy += (dy / dist) * force * 0.05;
          }
        }

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap: particles that exit bottom or sides re-enter at top
        if (p.y > H + 10)  { p.y = -10; p.x = Math.random() * W; }
        if (p.x < -20)     { p.x = W + 20; }
        if (p.x > W + 20)  { p.x = -20; }

        // Interpolate opacity toward target
        const targetOpacity = p.baseOpacity + litRatio * 0.75;
        p.opacity += (targetOpacity - p.opacity) * 0.12;

        // Draw particle
        const r = p.radius * (1 + litRatio * 0.6); // slight size boost when lit
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);

        // Color shifts warm when lit
        const warmth = Math.round(litRatio * 60);
        ctx.fillStyle = `rgba(${200 + warmth},${190 + warmth},${180},${p.opacity})`;
        ctx.fill();

        // Tiny glow halo on well-lit particles
        if (litRatio > 0.25) {
          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
          halo.addColorStop(0, `rgba(255,210,150,${litRatio * 0.12})`);
          halo.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
        }
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(state.animId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        ...style,
      }}
    />
  );
}
