"use client";

import { useEffect, useRef } from "react";

// ─── Config ────────────────────────────────────────────────────────────────────
const COOKIE_COUNT    = 90;          // total particles
const LIGHT_RADIUS    = 160;         // px — soft reveal radius
const REPEL_RADIUS    = 70;          // px — cursor push radius
const REPEL_STRENGTH  = 2.6;         // max repulsion force
const BASE_OPACITY    = 0.07;        // default hidden opacity
const LIT_OPACITY     = 0.92;        // max revealed opacity
const BASE_SCALE      = 1.0;         // size multiplier at rest
const LIT_SCALE       = 1.22;        // size multiplier when lit
const LERP_SPEED      = 0.10;        // interpolation rate (0–1)

// ─── Cookie sprite drawing ─────────────────────────────────────────────────────
// Draws a procedural cookie: disc + chips + sugary surface cracks
function drawCookie(ctx, cx, cy, r, angle, warmth) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // ── Body ──
  // Main disc with a warm baked gradient
  const bodyGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.2, r * 0.05, 0, 0, r);
  bodyGrad.addColorStop(0,   `rgba(${200 + warmth}, ${155 + warmth * 0.5}, ${90}, 1)`);
  bodyGrad.addColorStop(0.6, `rgba(${175 + warmth}, ${125 + warmth * 0.4}, ${68}, 1)`);
  bodyGrad.addColorStop(1,   `rgba(${140 + warmth}, ${95  + warmth * 0.3}, ${45}, 1)`);

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Edge darkening ring
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.lineWidth = r * 0.12;
  ctx.strokeStyle = `rgba(90, 50, 20, 0.4)`;
  ctx.stroke();

  // ── Surface cracks / texture lines ──
  ctx.strokeStyle = `rgba(100, 55, 20, 0.35)`;
  ctx.lineWidth = r * 0.045;
  ctx.lineCap = "round";
  // A few short organic cracks
  const cracks = [
    [[-0.3, -0.1], [ 0.0,  0.2]],
    [[ 0.1, -0.3], [ 0.35, 0.0]],
    [[-0.15, 0.3], [ 0.1,  0.45]],
    [[ 0.3,  0.2], [ 0.5,  0.05]],
  ];
  for (const [[x1, y1], [x2, y2]] of cracks) {
    ctx.beginPath();
    ctx.moveTo(x1 * r, y1 * r);
    ctx.lineTo(x2 * r, y2 * r);
    ctx.stroke();
  }

  // ── Chocolate chips ──
  const chips = [
    [-0.28, -0.28],
    [ 0.30, -0.20],
    [-0.05,  0.32],
    [ 0.22,  0.25],
    [-0.38,  0.10],
    [ 0.10, -0.05],
  ];
  const chipR = r * 0.155;
  for (const [cx2, cy2] of chips) {
    const chipGrad = ctx.createRadialGradient(
      cx2 * r - chipR * 0.3, cy2 * r - chipR * 0.3, chipR * 0.1,
      cx2 * r, cy2 * r, chipR
    );
    chipGrad.addColorStop(0, `rgba(${70 + warmth * 0.4}, 40, 20, 1)`);
    chipGrad.addColorStop(1, `rgba(40, 20, 8, 1)`);
    ctx.beginPath();
    ctx.arc(cx2 * r, cy2 * r, chipR, 0, Math.PI * 2);
    ctx.fillStyle = chipGrad;
    ctx.fill();
  }

  // ── Specular highlight (only meaningful when lit) ──
  if (warmth > 0) {
    const hlGrad = ctx.createRadialGradient(-r * 0.28, -r * 0.28, 0, -r * 0.15, -r * 0.15, r * 0.55);
    hlGrad.addColorStop(0,   `rgba(255, 240, 200, ${warmth / 80 * 0.25})`);
    hlGrad.addColorStop(1,   "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = hlGrad;
    ctx.fill();
  }

  ctx.restore();
}

// ─── Particle factory ──────────────────────────────────────────────────────────
function makeCookie(W, H, i, total) {
  const col = i % 10;
  const baseX = (col / 9) * W;
  return {
    // position
    x: baseX + (Math.random() - 0.5) * W * 0.12,
    y: Math.random() * H,
    // velocity — slow diagonal drift
    vx: (Math.random() - 0.3) * 0.35,
    vy: 0.38 + Math.random() * 0.32,
    // spin
    angle: Math.random() * Math.PI * 2,
    spinV: (0.003 + Math.random() * 0.005) * (Math.random() < 0.5 ? 1 : -1),
    // size
    radius: 11 + Math.random() * 14,
    // base lane for wrapping
    baseX,
    // smoothed values
    opacity: 0,
    scale: BASE_SCALE,
    // repulsion impulse (decays)
    rx: 0,
    ry: 0,
    // weave oscillation
    waveA: 8 + Math.random() * 14,       // amplitude px
    waveF: 0.0004 + Math.random() * 0.0003, // frequency
    waveP: Math.random() * Math.PI * 2,  // phase
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function CookieFlow({ style }) {
  const canvasRef  = useRef(null);
  const wrapperRef = useRef(null);
  const stateRef   = useRef({
    cookies: [],
    mouse: { x: -9999, y: -9999 },
    animId: null,
    t: 0,
  });

  useEffect(() => {
    const canvas  = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx   = canvas.getContext("2d");
    const state = stateRef.current;

    // ── Resize ───────────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width  = canvas.offsetWidth  || wrapper.offsetWidth;
      canvas.height = canvas.offsetHeight || wrapper.offsetHeight;
      const { width: W, height: H } = canvas;
      state.cookies = Array.from({ length: COOKIE_COUNT }, (_, i) =>
        makeCookie(W, H, i, COOKIE_COUNT)
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    // ── Mouse — track via wrapper (pointer-events enabled) ──────────────────
    const onMove = (e) => {
      const rect = wrapper.getBoundingClientRect();
      // Only register when cursor is within the wrapper
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      if (lx >= 0 && lx <= rect.width && ly >= 0 && ly <= rect.height) {
        state.mouse.x = lx;
        state.mouse.y = ly;
      } else {
        state.mouse.x = -9999;
        state.mouse.y = -9999;
      }
    };
    // window listener captures movement over all overlaid content.
    // The bounds check inside onMove resets coords when leaving wrapper.
    window.addEventListener("mousemove", onMove);

    // ── Main loop ─────────────────────────────────────────────────────────────
    const loop = () => {
      state.animId = requestAnimationFrame(loop);
      state.t += 1;

      const { width: W, height: H } = canvas;
      const { mouse, cookies, t } = state;
      const hasMouse = mouse.x > 0 && mouse.y > 0;

      ctx.clearRect(0, 0, W, H);

      // ── Cursor glow overlay (very subtle ambient) ─────────────────────────
      if (hasMouse) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, LIGHT_RADIUS * 1.6);
        glow.addColorStop(0,   "rgba(255,210,140,0.045)");
        glow.addColorStop(0.5, "rgba(255,180,100,0.018)");
        glow.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Sort back-to-front by y (cheap depth illusion) ───────────────────
      // Using a stable sort on the pre-sorted array isn't necessary every frame;
      // just draw in current order — adequate for a particle field.

      for (let i = 0; i < cookies.length; i++) {
        const c = cookies[i];

        // ── Weave (horizontal sine oscillation) ──────────────────────────────
        const waveX = c.waveA * Math.sin(c.waveF * t + c.waveP);

        // ── Repulsion decay ───────────────────────────────────────────────────
        c.rx *= 0.88;
        c.ry *= 0.88;

        // ── Distance to cursor ────────────────────────────────────────────────
        const ex = c.x + waveX;
        const ey = c.y;
        const dx = ex - mouse.x;
        const dy = ey - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // ── Soft radial falloff → litRatio ────────────────────────────────────
        let targetLit = 0;
        if (hasMouse && dist < LIGHT_RADIUS) {
          const t01 = 1 - dist / LIGHT_RADIUS;
          targetLit = t01 * t01; // quadratic → smooth edge
        }

        // ── Repulsion impulse ─────────────────────────────────────────────────
        if (hasMouse && dist < REPEL_RADIUS && dist > 0.5) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          c.rx += (dx / dist) * force * 0.045;
          c.ry += (dy / dist) * force * 0.045;
        }

        // ── Move ──────────────────────────────────────────────────────────────
        c.x     += c.vx + c.rx;
        c.y     += c.vy + c.ry;
        c.angle += c.spinV;

        // ── Wrap ──────────────────────────────────────────────────────────────
        if (c.y > H + c.radius + 10) {
          c.y = -(c.radius + 10);
          c.x = c.baseX + (Math.random() - 0.5) * W * 0.12;
        }
        if (c.x < -c.radius - 30) c.x = W + c.radius + 30;
        if (c.x > W + c.radius + 30) c.x = -c.radius - 30;

        // ── Lerp visual state ─────────────────────────────────────────────────
        const targetOpacity = BASE_OPACITY + targetLit * (LIT_OPACITY - BASE_OPACITY);
        c.opacity += (targetOpacity - c.opacity) * LERP_SPEED;

        const targetScale = BASE_SCALE + targetLit * (LIT_SCALE - BASE_SCALE);
        c.scale   += (targetScale - c.scale) * LERP_SPEED;

        // ── Draw ──────────────────────────────────────────────────────────────
        const r = c.radius * c.scale;
        const warmth = Math.round(targetLit * 55);

        ctx.globalAlpha = c.opacity;
        drawCookie(ctx, c.x + waveX, c.y, r, c.angle, warmth);
        ctx.globalAlpha = 1;
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(state.animId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    // Wrapper: fills parent, intercepts mouse for leave detection
    // but does NOT block pointer events for underlying content
    <div
      ref={wrapperRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",  // transparent to clicks → content still interactive
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
