"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { Scene } from "./Scene";
import { LoaderOverlay } from "./LoaderOverlay";

export function Hero() {
  const wrapperRef  = useRef(null);
  const progressRef = useRef(0);

  // DOM refs for direct opacity control — more reliable than CSS calc(var())
  const deskBgRef    = useRef(null);
  const darkOverRef  = useRef(null);
  const phase1Ref    = useRef(null);
  const p2NavRef     = useRef(null);
  const p2LeftRef    = useRef(null);
  const p2RightRef   = useRef(null);
  const scrollHintRef = useRef(null);

  useEffect(() => {
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
    const map   = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const scrolled = -el.getBoundingClientRect().top;
      const total    = el.offsetHeight - window.innerHeight;
      const p        = clamp(scrolled / total, 0, 1);
      progressRef.current = p;

      // ── Desk BG: visible at p=0, invisible by p=0.28 ──
      if (deskBgRef.current)
        deskBgRef.current.style.opacity = clamp(map(p, 0, 0.28, 1, 0), 0, 1);

      // ── Dark overlay: invisible at p=0, fully black by p=0.32 ──
      if (darkOverRef.current)
        darkOverRef.current.style.opacity = clamp(map(p, 0.08, 0.32, 0, 1), 0, 1);

      // ── Phase 1 text: visible 0→0.22 ──
      if (phase1Ref.current)
        phase1Ref.current.style.opacity = clamp(map(p, 0, 0.22, 1, 0), 0, 1);

      // ── Scroll hint: visible 0→0.10 ──
      if (scrollHintRef.current)
        scrollHintRef.current.style.opacity = clamp(map(p, 0, 0.10, 0.55, 0), 0, 0.55);

      // ── Phase 2 nav: invisible before 0.33, fully visible at 0.45 ──
      if (p2NavRef.current)
        p2NavRef.current.style.opacity = clamp(map(p, 0.33, 0.45, 0, 1), 0, 1);

      // ── Phase 2 feature texts: fade IN 0.38→0.52, fade OUT 0.82→0.95 ──
      const fadeIn  = clamp(map(p, 0.38, 0.52, 0, 1), 0, 1);
      const fadeOut = clamp(map(p, 0.82, 0.95, 1, 0), 0, 1);
      const p2Op    = Math.min(fadeIn, fadeOut);
      if (p2LeftRef.current)  p2LeftRef.current.style.opacity  = p2Op;
      if (p2RightRef.current) p2RightRef.current.style.opacity = p2Op;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // init on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <LoaderOverlay />
      {/* ══ 500vh scroll wrapper ══ */}
      <div className="hero-wrapper" ref={wrapperRef}>
        <div className="hero-sticky">

          {/* Desk background */}
          <div className="desk-bg" ref={deskBgRef}>
            <div className="desk-wood" />
            <div className="desk-mat" />
          </div>

          {/* Dark overlay comes in over the desk */}
          <div className="desk-dark-overlay" ref={darkOverRef} />

          {/* Transparent 3D Canvas */}
          <Canvas
            shadows
            camera={{ position: [0, 0, 10], fov: 45 }}
            gl={{ alpha: true, antialias: true }}
            style={{ position: "absolute", inset: 0, zIndex: 10 }}
          >
            <Suspense fallback={null}>
              <Scene progressRef={progressRef} />
            </Suspense>
          </Canvas>

          {/* ════ PHASE 1 TEXTS ════ */}
          <div className="phase1-texts" ref={phase1Ref}>
            <nav className="p1-nav">
              <span className="p1-brand">ORYZO</span>
              <div className="p1-nav-links">
                <a href="#intro">Intro</a>
                <a href="#features">Features</a>
                <a href="#product">Product</a>
                <a href="#contact">Contact</a>
              </div>
            </nav>
            <p className="p1-tagline">Made for mugs. Built for tables.</p>
            <div className="p1-descriptor">
              <p className="p1-descriptor-headline">
                Designed<br />by Lusion,<br />the award-winning<br />design studio.
              </p>
              <p className="p1-descriptor-sub">
                The world&apos;s most unnecessarily<br />sophisticated cork coaster.
              </p>
            </div>
            <p className="p1-body-right">
              Designed to lift, insulate, and grip in all the right ways.
              Oryzo makes the simplest moment feel considered.
            </p>
          </div>

          {/* Scroll hint (separate so it fades faster) */}
          <div className="p1-scroll-hint" ref={scrollHintRef}>
            <span>Scroll to continue</span>
            <span className="scroll-arrow" />
          </div>

          {/* ════ PHASE 2 NAV ════ */}
          <nav className="p2-nav" ref={p2NavRef} style={{ opacity: 0 }}>
            <span className="p2-brand">ORYZO</span>
            <div className="p2-nav-links">
              <a href="#intro" className="active">Intro</a>
              <a href="#features">Features</a>
              <a href="#product">Product</a>
              <a href="#contact">Contact</a>
            </div>
          </nav>

          {/* ════ PHASE 2 FEATURE TEXTS ════ */}
          <div className="p2-left-text" ref={p2LeftRef} style={{ opacity: 0 }}>
            <h2 className="p2-headline">
              ISN&apos;T JUST<br />A COASTER.
            </h2>
          </div>

          <p className="p2-body-right" ref={p2RightRef} style={{ opacity: 0 }}>
            Oryzo isn&apos;t just a coaster. It&apos;s the result of unprecedented AI*
            breakthroughs.
          </p>

        </div>
      </div>

      {/* After-hero */}
      <section className="after-hero">
        <p className="after-hero-punchline">isn&apos;t just a coaster.</p>
      </section>
    </>
  );
}
