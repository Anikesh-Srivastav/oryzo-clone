"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const THUMB_W = 130;   // px
const THUMB_H = 178;   // px
const THUMB_GAP = 16;    // px
const THUMB_STEP = THUMB_W + THUMB_GAP;   // 146 px per scroll step

const SLIDES = [
  { id: 1, gradient: "linear-gradient(160deg,#7a4e2d 0%,#3d2510 55%,#130c04 100%)", label: "SO PORTABLE,", sub: "it's wearable" },
  { id: 2, gradient: "linear-gradient(160deg,#2a5c3e 0%,#122d1e 55%,#040f09 100%)", label: "SO INTELLIGENT,", sub: "it learns you" },
  { id: 3, gradient: "linear-gradient(160deg,#8c3030 0%,#461818 55%,#160707 100%)", label: "SO CONNECTED,", sub: "always with you" },
  { id: 4, gradient: "linear-gradient(160deg,#2a3d7a 0%,#121e3d 55%,#040714 100%)", label: "SO MINIMAL,", sub: "it disappears" },
  { id: 5, gradient: "linear-gradient(160deg,#7a6030 0%,#3d3018 55%,#130f05 100%)", label: "SO INTUITIVE,", sub: "feels natural" },
];

const N = SLIDES.length;

export function HorizontalGallery() {
  const containerRef = useRef(null);
  const frameContainerRef = useRef(null);
  const thumbTrackRightRef = useRef(null);
  const thumbTrackLeftRef = useRef(null);
  const labelRefs = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const thumbRight = thumbTrackRightRef.current;
      const thumbLeft = thumbTrackLeftRef.current;
      const mainFrame = frameContainerRef.current;

      // ── initial states ─────────────────────────────────────────────────────
      gsap.set(mainFrame, { xPercent: 0 });
      
      // Right Thumb Track: Thumb[0] hidden (left of container), thumb[1..n-1] ready.
      gsap.set(thumbRight, { x: -THUMB_STEP });
      // Left Thumb Track: offset so Thumb[0] hides off the right side of the left container at prog=0.
      gsap.set(thumbLeft, { x: THUMB_GAP });

      // ── master scrub timeline ───────────────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${(N - 1) * window.innerHeight}`,
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh() {
            // Re-snap after viewport resize
            gsap.set(mainFrame, { xPercent: 0 });
            gsap.set(thumbRight, { x: -THUMB_STEP });
            gsap.set(thumbLeft, { x: THUMB_GAP });
          },
        },
      });

      // Synchronized track shifting: both thumb tracks move identical distances.
      tl.to([thumbRight, thumbLeft], { x: `-=${N * THUMB_STEP}`, ease: "none", duration: N - 1 }, 0);
      
      // Main frame shifts naturally as a single flex strip (no overlapping possible)
      tl.to(mainFrame, { xPercent: -(N - 1) * (100 / N), ease: "none", duration: N - 1 }, 0);

      for (let i = 0; i < N - 1; i++) {
        // ── label cross-fade ─────────────────────────────────────────────────
        tl.to(labelRefs.current[i],
          { opacity: 0, y: -14, ease: "power2.in", duration: 0.28 }, i + 0.22);
        tl.fromTo(labelRefs.current[i + 1],
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.28 }, i + 0.72);
      }
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
      style={{ position: "relative", height: `${N * 100}vh` }}
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
          {SLIDES.map((s, i) => (
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

        {/* ── Main frame — the overflow:hidden dual-reveal container ── */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: frameW,
            aspectRatio: "609 / 784",
            overflow: "hidden",
            zIndex: 10,
            outline: "1px dashed rgba(255,255,255,0.18)",
          }}
        >
          {/* Corner dot */}
          <div style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.55)",
            zIndex: 20,
          }} />

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
            {SLIDES.map((s) => (
              <div
                key={s.id}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
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

        {/* ── Left Thumbnail Strip ── */}
        <div
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
            {SLIDES.map((s) => (
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
            {SLIDES.map((s) => (
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
        <div style={{
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
      </div>
    </div>
  );
}
