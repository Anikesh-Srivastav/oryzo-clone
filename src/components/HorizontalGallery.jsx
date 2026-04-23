"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const THUMB_W = 130;   // px
const THUMB_H = 178;   // px
const THUMB_GAP = 16;    // px
const THUMB_STEP = THUMB_W + THUMB_GAP;   // 146 px per scroll step

const DEFAULT_SLIDES = [
  { 
    id: 1, 
    gradient: "url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat", 
    label: "SO PORTABLE,", 
    sub: "it's wearable" 
  },
  { 
    id: 2, 
    gradient: "url('https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat", 
    label: "SO INTELLIGENT,", 
    sub: "it learns you" 
  },
  { 
    id: 3, 
    gradient: "url('https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat", 
    label: "SO CONNECTED,", 
    sub: "always with you" 
  },
  { 
    id: 4, 
    gradient: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat", 
    label: "SO MINIMAL,", 
    sub: "it disappears" 
  },
  { 
    id: 5, 
    gradient: "url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat", 
    label: "SO INTUITIVE,", 
    sub: "feels natural" 
  },
];

export function HorizontalGallery({ slides = DEFAULT_SLIDES }) {
  const N = slides.length;

  const containerRef = useRef(null);
  const frameContainerRef = useRef(null);
  const thumbTrackRightRef = useRef(null);
  const thumbTrackLeftRef = useRef(null);
  const labelRefs = useRef([]);
  const galleryFrameContainerRef = useRef(null);
  const mainOuterFrameRef = useRef(null);
  const innerClipRef = useRef(null);
  const nextSectionRef = useRef(null);

  // Split UI refs
  const leftGlassRef = useRef(null);
  const topNavRef = useRef(null);
  const bottomTextRef = useRef(null);

  const EXPAND_DUR = 2; // Extra scroll lengths for the morphing takeover
  const READ_DUR = 2; // Scroll length to hold the final design
  const TOTAL_DUR = N - 1 + EXPAND_DUR + READ_DUR;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const thumbRight = thumbTrackRightRef.current;
      const thumbLeft = thumbTrackLeftRef.current;
      const mainFrame = frameContainerRef.current;
      const mainOuter = mainOuterFrameRef.current;

      // ── initial states ─────────────────────────────────────────────────────
      gsap.set(mainFrame, { xPercent: 0 });
      gsap.set(thumbRight, { x: -THUMB_STEP });
      gsap.set(thumbLeft, { x: THUMB_GAP });
      if (leftGlassRef.current) gsap.set(leftGlassRef.current, { xPercent: -100 });

      // ── master scrub timeline ───────────────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${TOTAL_DUR * window.innerHeight}`,
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh() {
            gsap.set(mainFrame, { xPercent: 0 });
            gsap.set(thumbRight, { x: -THUMB_STEP });
            gsap.set(thumbLeft, { x: THUMB_GAP });
          },
        },
      });

      // Synchronized track shifting over the first N-1 units
      tl.to([thumbRight, thumbLeft], { x: `-=${(N - 1) * THUMB_STEP}`, ease: "none", duration: N - 1 }, 0);
      tl.to(mainFrame, { xPercent: -(N - 1) * (100 / N), ease: "none", duration: N - 1 }, 0);

      for (let i = 0; i < N - 1; i++) {
        tl.to(labelRefs.current[i],
          { opacity: 0, y: -14, ease: "power2.in", duration: 0.28 }, i + 0.22);
        tl.fromTo(labelRefs.current[i + 1],
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.28 }, i + 0.72);
      }

      // ════ EXPANSION PHASE: Next component takeover ════
      const tExpand = N - 1; // Time where carousel stops

      // 1. Focus Isolation: Fade out tracks, scroll hint, and final label quickly
      tl.to([".thumb-strip", ".scroll-hint-wrapper", labelRefs.current[N - 1]], {
        opacity: 0,
        y: -30,
        ease: "power2.inOut",
        duration: 0.4
      }, tExpand);

      // Fade out the dashed outer frame border & corner dot cleanly
      tl.to(".gallery-frame-decor", {
        opacity: 0,
        ease: "power2.inOut",
        duration: 0.4
      }, tExpand);

      // 2. Expansion: Massive zoom natively to the exact window bounds (over-expanded to kill any subpixel edge gaps)
      tl.to(galleryFrameContainerRef.current, {
        width: "103vw",
        height: "103vh",
        ease: "power2.inOut",
        duration: EXPAND_DUR
      }, tExpand);

      tl.to(mainOuterFrameRef.current, {
        padding: 0,
        ease: "power2.inOut",
        duration: EXPAND_DUR
      }, tExpand);

      tl.to(innerClipRef.current, {
        borderRadius: 0,
        ease: "power2.inOut",
        duration: EXPAND_DUR
      }, tExpand);

      // 3. Section Reveal: Split screen UI over the expanded background
      tl.to(nextSectionRef.current, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.1
      }, tExpand);

      tl.to(leftGlassRef.current, {
        xPercent: 0,
        ease: "power2.out",
        duration: EXPAND_DUR * 0.8
      }, tExpand + 0.2);

      tl.to([topNavRef.current, bottomTextRef.current], {
        opacity: 1,
        ease: "power2.out",
        duration: EXPAND_DUR * 0.6
      }, tExpand + 0.4);

    });

    return () => ctx.revert();
  }, []);

  // ── frame / thumb geometry ──────────────────────────────────────────────────
  // All positioning is via inline styles so Tailwind class quirks can't bite us.
  
  // Enforce a strict 609x784 aspect ratio (≈ 0.7767)
  const ratio = 609 / 784;
  
  // Frame width maxes at 609px, but scales down if the screen is narrow (45vw) 
  // or if the screen is short (70vh * ratio prevents it from overflowing height).
  const frameW = `min(609px, 45vw, 70vh * ${ratio})`;
  
  // Half the frame width (used for the thumb container left offset)
  const halfFW = `min(304.5px, 22.5vw, 35vh * ${ratio})`;

  return (
    // Outer container establishes the scroll distance.
    <div
      ref={containerRef}
      style={{ position: "relative", height: `${TOTAL_DUR * 100}vh` }}
    >
      {/* ── Sticky wrapper ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#0d0905",
        }}
      >
        {/* ── Fixed overlay for text labels ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {slides.map((s, i) => (
            <div
              key={s.id}
              ref={(el) => (labelRefs.current[i] = el)}
              style={{
                position: "absolute",
                // Position relative to the bottom bounds so GSAP's y-animation doesn't un-translate it
                bottom: `calc(50% + ${THUMB_H / 2 + 50}px)`,
                left: "10%",
                opacity: i === 0 ? 1 : 0,
                pointerEvents: "none",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              <p style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.55rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                fontWeight: 300,
                marginBottom: 6,
              }}>
                {s.label}
              </p>
              <p style={{
                color: "#ffffff",
                fontSize: "clamp(1.35rem, 2.6vw, 2.1rem)",
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 1.15,
              }}>
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Main frame — the outer boundary with dashed border ── */}
        <div
          ref={galleryFrameContainerRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: frameW,
            height: `calc(${frameW} * (784 / 609))`, // Explicit height instead of aspectRatio for GSAP tweening
            zIndex: 10,
          }}
        >
          {/* Static decoration boundary (dashed border + dot) */}
          <div className="gallery-frame-decor" style={{
            position: "absolute",
            inset: 0,
            outline: "1px dashed rgba(255,255,255,0.18)"
          }}>
            {/* Corner dot */}
            <div style={{
              position: "absolute",
              top: 5,
              right: 5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.55)",
            }} />
          </div>

          {/* Sibling: The inner image flex wrapper with padding */}
          {/* This wrapper scales up massively, leaving the decoration behind */}
          <div ref={mainOuterFrameRef} style={{
            position: "absolute",
            inset: 0,
            padding: "20px", // Internal padding requested
            boxSizing: "border-box", // Ensure padding eats inward
            originX: 0.5,
            originY: 0.5,
          }}>

          {/* Inner container to restrict the sliding frame Layers */}
          <div ref={innerClipRef} style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: "4px", // Subtle softening of the inner frame corners
          }}>
            {/* Flex container holding all slides seamlessly side-by-side */}
          <div
            ref={frameContainerRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              display: "flex",
              height: "100%",
              width: `${N * 100}%`,
              willChange: "transform",
            }}
          >
            {slides.map((s) => (
              <div
                key={s.id}
                style={{
                  position: "relative",
                  width: `${100 / N}%`,
                  height: "100%",
                  flexShrink: 0,
                  background: s.gradient,
                }}
              >
                {/* Bottom vignette + slide number watermark */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 24,
                  background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
                }}>
                  <span style={{
                    color: "rgba(255,255,255,0.06)",
                    fontSize: "7rem",
                    fontWeight: 900,
                    lineHeight: 1,
                    userSelect: "none",
                  }}>
                    0{s.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
          </div>
          </div>
        </div>

        {/* ── Left Thumbnail Strip ── */}
        <div
          className="thumb-strip"
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: `calc(50% + ${halfFW} + 20px)`,
            height: THUMB_H,
            transform: "translateY(-50%)",
            overflow: "hidden",
            zIndex: 5,
          }}
        >
          <div
            ref={thumbTrackLeftRef}
            style={{
              position: "absolute",
              top: 0,
              left: "100%", // Start relative to right edge of container
              display: "flex",
              gap: THUMB_GAP,
              alignItems: "stretch",
              willChange: "transform",
            }}
          >
            {slides.map((s) => (
              <div
                key={s.id}
                style={{
                  flexShrink: 0,
                  width: THUMB_W,
                  height: THUMB_H,
                  background: s.gradient,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Right Thumbnail Strip ── */}
        <div
          className="thumb-strip"
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            left: `calc(50% + ${halfFW} + 20px)`,
            height: THUMB_H,
            transform: "translateY(-50%)",
            overflow: "hidden",
            zIndex: 5,
          }}
        >
          <div
            ref={thumbTrackRightRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              display: "flex",
              gap: THUMB_GAP,
              alignItems: "stretch",
              willChange: "transform",
            }}
          >
            {slides.map((s) => (
              <div
                key={s.id}
                style={{
                  flexShrink: 0,
                  width: THUMB_W,
                  height: THUMB_H,
                  background: s.gradient,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Scroll hint ── */}
        <div className="scroll-hint-wrapper" style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
          userSelect: "none",
        }}>
          <div style={{ width: 1, height: 48, backgroundColor: "rgba(255,255,255,0.2)" }} />
          <span style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: 8,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
          }}>
            scroll
          </span>
        </div>

        {/* ── EXPANSION PHASE NEXT COMPONENT (Frosted UI Overlay) ── */}
        <div
          ref={nextSectionRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30, // rendered above the zoomed image
            display: "block",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          {/* Left Glass Panel */}
          <div
            ref={leftGlassRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "35%",
              minWidth: "420px",
              background: "linear-gradient(to right, rgba(200,200,200,0.15), rgba(0,0,0,0.0))",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "48px 56px",
              display: "flex",
              flexDirection: "column",
              color: "#fff",
              // GSAP xPercent replaces transform
            }}
          >
             {/* ORYZO */}
             <div style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "0.15em", marginBottom: "auto", color: "#fff" }}>ORYZO</div>
             
             <div style={{ marginTop: "auto" }}>
               {/* Icon */}
               <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "28px", border: "1px solid rgba(255,255,255,0.25)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <line x1="12" y1="19" x2="12" y2="5"></line>
                     <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
               </div>

               <h3 style={{ fontSize: "15px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", fontWeight: 600, color: "#fff" }}>
                 RISE ABOVE MEDIOCRITY
               </h3>
               <p style={{ fontSize: "15px", lineHeight: "1.6", color: "rgba(255,255,255,0.75)", marginBottom: "40px" }}>
                 With a precision-engineered lift (exactly one coaster thick), Oryzo doesn't just hold your mug - it elevates it. Literally. Above every boring surface you've ever known.
               </p>

               {/* Dotted line */}
               <div style={{ borderBottom: "1px dashed rgba(255,255,255,0.3)", width: "100%", marginBottom: "32px" }} />

               <h2 style={{ fontSize: "28px", fontWeight: "700", textTransform: "uppercase", lineHeight: "1.1", marginBottom: "20px", color: "#fff", letterSpacing: "0.02em" }}>
                 ELEVATE YOUR<br/>COFFEE EXPERIENCE
               </h2>
             </div>
          </div>

          {/* Top Right Nav */}
          <div
            ref={topNavRef}
            style={{
              position: "absolute",
              top: "48px",
              right: "56px",
              display: "flex",
              gap: "32px",
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              color: "#fff",
              opacity: 0,
            }}
          >
             <span style={{ opacity: 0.6 }}>INTRO</span>
             <span style={{ borderBottom: "1px dashed #fff", paddingBottom: "4px" }}>FEATURES</span>
             <span style={{ opacity: 0.6 }}>PRODUCT</span>
             <span style={{ opacity: 0.6 }}>CONTACT</span>
          </div>

          {/* Bottom Right Text */}
          <div
            ref={bottomTextRef}
            style={{
              position: "absolute",
              bottom: "48px",
              right: "56px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              color: "#fff",
              opacity: 0,
            }}
          >
             <span style={{ fontSize: "12px", fontWeight: "500", opacity: 0.8, letterSpacing: "0.05em" }}>Constant lift via geometry</span>
             <span style={{ fontSize: "40px", fontFamily: "serif", fontStyle: "italic", lineHeight: 1 }}>Δh ≈ t</span>
          </div>
        </div>

      </div>
    </div>
  );
}
